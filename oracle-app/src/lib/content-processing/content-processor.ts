/**
 * Universal Content Processor for RAG System Integration
 * Elena Execution - Oracle Content Processing Infrastructure
 */

import { supabaseAdmin } from '../supabase';
import OpenAI from 'openai';

export interface ContentChunk {
  index: number;
  text: string;
  wordCount: number;
  characterCount: number;
  startPosition: number;
  endPosition: number;
  chunkType: 'text' | 'table' | 'list' | 'code' | 'heading';
  importanceScore: number;
  businessConcepts: string[];
  keyEntities: string[];
}

export interface ProcessingResult {
  success: boolean;
  chunks: ContentChunk[];
  totalChunks: number;
  totalWords: number;
  processingTime: number;
  error?: string;
}

export class ContentProcessor {
  private openai: OpenAI;
  private readonly maxChunkSize = 1000; // words per chunk
  private readonly chunkOverlap = 100; // words overlap between chunks
  private readonly embeddingModel = 'text-embedding-ada-002';

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });
  }

  /**
   * Process content through chunking and embedding pipeline
   */
  async processContent(
    content: string,
    contentId: string,
    contentType: 'file' | 'url' | 'youtube' | 'text'
  ): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      console.log(`Processing content for RAG: ${contentId} (${content.length} chars)`);

      // Stage 1: Clean and prepare content
      const cleanedContent = this.cleanContent(content);
      
      // Stage 2: Create content chunks
      const chunks = await this.createChunks(cleanedContent);
      
      // Stage 3: Enhance chunks with business analysis
      const enhancedChunks = await this.enhanceChunks(chunks);
      
      // Stage 4: Generate embeddings and store chunks
      await this.storeChunks(enhancedChunks, contentId);

      const processingTime = Date.now() - startTime;
      
      console.log(`Content processing completed: ${enhancedChunks.length} chunks (${processingTime}ms)`);

      return {
        success: true,
        chunks: enhancedChunks,
        totalChunks: enhancedChunks.length,
        totalWords: enhancedChunks.reduce((sum, chunk) => sum + chunk.wordCount, 0),
        processingTime
      };

    } catch (error) {
      console.error('Content processing failed:', error);
      return {
        success: false,
        chunks: [],
        totalChunks: 0,
        totalWords: 0,
        processingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  private cleanContent(content: string): string {
    return content
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove special characters that might interfere with processing
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
      // Normalize quotes
      .replace(/["']/g, '"')
      .replace(/[']/g, "'")
      // Clean up line breaks
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  private async createChunks(content: string): Promise<ContentChunk[]> {
    const words = content.split(/\s+/);
    const chunks: ContentChunk[] = [];
    let chunkIndex = 0;

    // Calculate character positions for each word
    let charPosition = 0;
    const wordPositions = words.map(word => {
      const start = charPosition;
      charPosition += word.length + 1; // +1 for space
      return { word, start, end: start + word.length };
    });

    for (let i = 0; i < words.length; i += this.maxChunkSize - this.chunkOverlap) {
      const endIndex = Math.min(i + this.maxChunkSize, words.length);
      const chunkWords = words.slice(i, endIndex);
      const chunkText = chunkWords.join(' ');

      const chunk: ContentChunk = {
        index: chunkIndex++,
        text: chunkText,
        wordCount: chunkWords.length,
        characterCount: chunkText.length,
        startPosition: wordPositions[i]?.start || 0,
        endPosition: wordPositions[endIndex - 1]?.end || chunkText.length,
        chunkType: this.detectChunkType(chunkText),
        importanceScore: this.calculateImportanceScore(chunkText),
        businessConcepts: [],
        keyEntities: []
      };

      chunks.push(chunk);

      // If we've reached the end, break
      if (endIndex >= words.length) break;
    }

    return chunks;
  }

  private detectChunkType(text: string): ContentChunk['chunkType'] {
    // Simple heuristics for chunk type detection
    if (text.includes('|') && text.split('\n').some(line => line.includes('|'))) {
      return 'table';
    }
    
    if (text.match(/^\s*[-*•]\s+/m) || text.match(/^\s*\d+\.\s+/m)) {
      return 'list';
    }
    
    if (text.includes('function ') || text.includes('class ') || 
        text.includes('import ') || text.includes('const ')) {
      return 'code';
    }
    
    if (text.match(/^#+\s+.+$/m)) {
      return 'heading';
    }
    
    return 'text';
  }

  private calculateImportanceScore(text: string): number {
    let score = 0.5; // Base score
    
    // Higher importance for business-related content
    const businessKeywords = [
      'strategy', 'framework', 'process', 'method', 'approach',
      'revenue', 'profit', 'growth', 'scale', 'optimize',
      'customer', 'market', 'value', 'offer', 'solution'
    ];
    
    const lowerText = text.toLowerCase();
    for (const keyword of businessKeywords) {
      if (lowerText.includes(keyword)) {
        score += 0.1;
      }
    }
    
    // Higher importance for structured content
    if (text.includes(':') && text.includes('\n')) score += 0.1;
    if (text.match(/\d+\./)) score += 0.1;
    if (text.length > 500) score += 0.1;
    
    // Lower importance for very short or repetitive content
    if (text.length < 100) score -= 0.2;
    if (text.split(' ').length < 20) score -= 0.2;
    
    return Math.max(0.0, Math.min(1.0, score));
  }

  private async enhanceChunks(chunks: ContentChunk[]): Promise<ContentChunk[]> {
    const enhanced = [...chunks];
    
    for (const chunk of enhanced) {
      // Extract business concepts
      chunk.businessConcepts = this.extractBusinessConcepts(chunk.text);
      
      // Extract key entities (simple implementation)
      chunk.keyEntities = this.extractKeyEntities(chunk.text);
    }
    
    return enhanced;
  }

  private extractBusinessConcepts(text: string): string[] {
    const concepts: string[] = [];
    const lowerText = text.toLowerCase();
    
    const conceptPatterns = [
      { pattern: /value prop(osition)?/g, concept: 'value_proposition' },
      { pattern: /business model/g, concept: 'business_model' },
      { pattern: /customer acquisition/g, concept: 'customer_acquisition' },
      { pattern: /lead generation/g, concept: 'lead_generation' },
      { pattern: /sales funnel/g, concept: 'sales_funnel' },
      { pattern: /conversion rate/g, concept: 'conversion_optimization' },
      { pattern: /revenue stream/g, concept: 'revenue_model' },
      { pattern: /market segment/g, concept: 'market_segmentation' },
      { pattern: /competitive advantage/g, concept: 'competitive_strategy' },
      { pattern: /scaling/g, concept: 'business_scaling' }
    ];
    
    for (const { pattern, concept } of conceptPatterns) {
      if (pattern.test(lowerText)) {
        concepts.push(concept);
      }
    }
    
    return concepts;
  }

  private extractKeyEntities(text: string): string[] {
    const entities: string[] = [];
    
    // Simple entity extraction patterns
    const entityPatterns = [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Person names
      /\b[A-Z][a-zA-Z]+ Inc\.?\b/g, // Company names with Inc
      /\b[A-Z][a-zA-Z]+ LLC\.?\b/g, // Company names with LLC
      /\$[\d,]+(?:\.\d{2})?\b/g, // Dollar amounts
      /\b\d{1,3}(?:,\d{3})*%?\b/g // Numbers/percentages
    ];
    
    for (const pattern of entityPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        entities.push(...matches.slice(0, 5)); // Limit to 5 per pattern
      }
    }
    
    return [...new Set(entities)].slice(0, 10); // Dedupe and limit
  }

  private async storeChunks(chunks: ContentChunk[], contentId: string): Promise<void> {
    try {
      // Process chunks in batches to handle large content
      const batchSize = 10;
      
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize);
        await this.processBatch(batch, contentId);
      }
      
    } catch (error) {
      console.error('Failed to store chunks:', error);
      throw new Error(`Chunk storage failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async processBatch(chunks: ContentChunk[], contentId: string): Promise<void> {
    const embeddings = await this.generateEmbeddings(chunks.map(c => c.text));
    
    const chunkRecords = chunks.map((chunk, index) => ({
      content_id: contentId,
      chunk_index: chunk.index,
      text_content: chunk.text,
      word_count: chunk.wordCount,
      character_count: chunk.characterCount,
      start_position: chunk.startPosition,
      end_position: chunk.endPosition,
      chunk_type: chunk.chunkType,
      importance_score: chunk.importanceScore,
      business_concepts: chunk.businessConcepts,
      key_entities: chunk.keyEntities,
      embedding: embeddings[index],
      embedding_model: this.embeddingModel
    }));

    const { error } = await supabaseAdmin
      .from('content_chunks')
      .insert(chunkRecords);

    if (error) {
      throw new Error(`Failed to insert chunks: ${error.message}`);
    }
  }

  private async generateEmbeddings(texts: string[]): Promise<number[][]> {
    try {
      const response = await this.openai.embeddings.create({
        model: this.embeddingModel,
        input: texts.map(text => text.slice(0, 8000)) // Truncate to stay within limits
      });

      return response.data.map(item => item.embedding);
    } catch (error) {
      console.error('Embedding generation failed:', error);
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

export default ContentProcessor;