import OpenAI from 'openai';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from './supabase';

// Initialize OpenAI for embeddings and content analysis
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Enhanced content categories based on Hormozi methodologies
export enum ContentCategory {
  FRAMEWORKS = 'frameworks',
  METRICS = 'metrics', 
  STRATEGIES = 'strategies',
  MINDSET = 'mindset',
  OPERATIONS = 'operations',
  SALES = 'sales',
  MARKETING = 'marketing',
  SCALING = 'scaling'
}

export enum BusinessPhase {
  STARTUP = 'startup',
  SCALING = 'scaling', 
  OPTIMIZATION = 'optimization',
  ALL = 'all'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}

export interface ContentMetadata {
  id: string;
  source: string;
  filename: string;
  file_type: string;
  category: ContentCategory;
  business_phase: BusinessPhase;
  difficulty_level: DifficultyLevel;
  frameworks?: string[];
  key_concepts?: string[];
  implementation_time?: string;
  success_metrics?: string[];
  prerequisites?: string[];
  related_content?: string[];
  word_count: number;
  processed_at: Date;
  processed_by: string;
}

export interface ProcessedChunk {
  content: string;
  embedding: number[];
  metadata: ContentMetadata;
  chunk_index: number;
  chunk_total: number;
}

export class HormoziContentProcessor {
  private readonly chunkSize: number = 1000;
  private readonly chunkOverlap: number = 200;
  
  constructor() {
    console.log('🔮 Initializing Elena Execution - Advanced Hormozi Content Processor');
  }

  // Main processing entry point
  async processDirectory(directoryPath: string): Promise<void> {
    console.log(`📁 Processing directory: ${directoryPath}`);
    
    const files = this.scanDirectory(directoryPath);
    console.log(`📊 Found ${files.length} files to process`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const filePath of files) {
      try {
        console.log(`\n🔄 Processing: ${basename(filePath)}`);
        await this.processFile(filePath);
        successCount++;
        console.log(`✅ Successfully processed: ${basename(filePath)}`);
        
        // Rate limiting to avoid API throttling
        await this.delay(1000);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to process ${basename(filePath)}:`, error);
      }
    }
    
    console.log(`\n📈 Processing Complete - Success: ${successCount}, Errors: ${errorCount}`);
  }

  // Process individual file based on type
  async processFile(filePath: string): Promise<void> {
    const extension = extname(filePath).toLowerCase();
    let content: string;
    
    switch (extension) {
      case '.pdf':
        content = await this.extractPdfContent(filePath);
        break;
      case '.docx':
        content = await this.extractDocxContent(filePath);
        break;
      case '.txt':
      case '.md':
        content = readFileSync(filePath, 'utf-8');
        break;
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
    
    if (content.length < 100) {
      throw new Error(`Content too short: ${content.length} characters`);
    }
    
    // Generate metadata through AI analysis
    const metadata = await this.analyzeContent(content, filePath);
    
    // Chunk content for optimal processing
    const chunks = this.intelligentChunking(content);
    
    // Process each chunk
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await this.generateEmbedding(chunk);
      
      const processedChunk: ProcessedChunk = {
        content: chunk,
        embedding,
        metadata: {
          ...metadata,
          id: randomUUID()
        },
        chunk_index: i,
        chunk_total: chunks.length
      };
      
      await this.storeChunk(processedChunk);
    }
    
    console.log(`📦 Stored ${chunks.length} chunks for ${basename(filePath)}`);
  }

  // Extract content from PDF files
  private async extractPdfContent(filePath: string): Promise<string> {
    try {
      const dataBuffer = readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract PDF content: ${error}`);
    }
  }

  // Extract content from DOCX files
  private async extractDocxContent(filePath: string): Promise<string> {
    try {
      const dataBuffer = readFileSync(filePath);
      const result = await mammoth.extractRawText({ buffer: dataBuffer });
      return result.value;
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error(`Failed to extract DOCX content: ${error}`);
    }
  }

  // AI-powered content analysis for metadata generation
  private async analyzeContent(content: string, filePath: string): Promise<ContentMetadata> {
    const analysisPrompt = `Analyze this Alex Hormozi business content and provide structured metadata:

CONTENT PREVIEW (first 2000 chars):
${content.substring(0, 2000)}

Respond with JSON containing:
{
  "category": "frameworks|metrics|strategies|mindset|operations|sales|marketing|scaling",
  "business_phase": "startup|scaling|optimization|all", 
  "difficulty_level": "beginner|intermediate|advanced|expert",
  "frameworks": ["array of specific frameworks mentioned"],
  "key_concepts": ["core concepts covered"],
  "implementation_time": "time estimate for implementation",
  "success_metrics": ["measurable outcomes"],
  "prerequisites": ["required knowledge/setup"],
  "related_content": ["related topics/concepts"]
}

Focus on Hormozi methodologies like Grand Slam Offers, Core Four, Value Equation, etc.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert business analyst specializing in Alex Hormozi methodologies. Respond only with valid JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.1,
        max_tokens: 1000
      });

      const analysisResult = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        id: randomUUID(),
        source: filePath,
        filename: basename(filePath),
        file_type: extname(filePath).substring(1),
        category: analysisResult.category || ContentCategory.STRATEGIES,
        business_phase: analysisResult.business_phase || BusinessPhase.ALL,
        difficulty_level: analysisResult.difficulty_level || DifficultyLevel.INTERMEDIATE,
        frameworks: analysisResult.frameworks || [],
        key_concepts: analysisResult.key_concepts || [],
        implementation_time: analysisResult.implementation_time || 'varies',
        success_metrics: analysisResult.success_metrics || [],
        prerequisites: analysisResult.prerequisites || [],
        related_content: analysisResult.related_content || [],
        word_count: content.split(/\s+/).length,
        processed_at: new Date(),
        processed_by: 'Elena Execution'
      };
      
    } catch (error) {
      console.error('Content analysis error:', error);
      
      // Fallback to rule-based analysis
      return this.fallbackAnalysis(content, filePath);
    }
  }

  // Fallback content analysis using rule-based approach
  private fallbackAnalysis(content: string, filePath: string): ContentMetadata {
    const lowerContent = content.toLowerCase();
    
    // Determine category
    let category = ContentCategory.STRATEGIES;
    if (lowerContent.includes('grand slam') || lowerContent.includes('offer')) {
      category = ContentCategory.FRAMEWORKS;
    } else if (lowerContent.includes('metric') || lowerContent.includes('kpi')) {
      category = ContentCategory.METRICS;
    } else if (lowerContent.includes('mindset') || lowerContent.includes('psychology')) {
      category = ContentCategory.MINDSET;
    } else if (lowerContent.includes('scale') || lowerContent.includes('system')) {
      category = ContentCategory.SCALING;
    }
    
    // Determine business phase
    let businessPhase = BusinessPhase.ALL;
    if (lowerContent.includes('startup') || lowerContent.includes('beginning')) {
      businessPhase = BusinessPhase.STARTUP;
    } else if (lowerContent.includes('scale') || lowerContent.includes('growth')) {
      businessPhase = BusinessPhase.SCALING;
    } else if (lowerContent.includes('optimize') || lowerContent.includes('advanced')) {
      businessPhase = BusinessPhase.OPTIMIZATION;
    }
    
    // Extract frameworks mentioned
    const frameworks: string[] = [];
    if (lowerContent.includes('grand slam')) frameworks.push('Grand Slam Offers');
    if (lowerContent.includes('core four')) frameworks.push('Core Four');
    if (lowerContent.includes('value equation')) frameworks.push('Value Equation');
    if (lowerContent.includes('lead magnet')) frameworks.push('Lead Magnets');
    
    return {
      id: randomUUID(),
      source: filePath,
      filename: basename(filePath),
      file_type: extname(filePath).substring(1),
      category,
      business_phase: businessPhase,
      difficulty_level: DifficultyLevel.INTERMEDIATE,
      frameworks,
      key_concepts: this.extractKeywords(content),
      implementation_time: 'varies',
      success_metrics: [],
      prerequisites: [],
      related_content: [],
      word_count: content.split(/\s+/).length,
      processed_at: new Date(),
      processed_by: 'Elena Execution (Fallback)'
    };
  }

  // Intelligent content chunking preserving context
  private intelligentChunking(content: string): string[] {
    // Split on natural boundaries (paragraphs, sections)
    const sections = content.split(/\n\s*\n/);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const section of sections) {
      const sectionWords = section.trim().split(/\s+/).length;
      const currentWords = currentChunk.split(/\s+/).length;
      
      // If adding this section would exceed chunk size
      if (currentWords + sectionWords > this.chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        
        // Add overlap from previous chunk
        const sentences = currentChunk.split(/[.!?]+/);
        const overlapSentences = sentences.slice(-2); // Keep last 2 sentences for context
        currentChunk = overlapSentences.join('. ') + '. ' + section;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + section;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.filter(chunk => chunk.length > 100);
  }

  // Generate embeddings with error handling
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.replace(/\n/g, ' ').substring(0, 8191), // Trim to model limits
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Embedding generation error:', error);
      throw error;
    }
  }

  // Store processed chunk in Supabase
  private async storeChunk(chunk: ProcessedChunk): Promise<void> {
    try {
      const { data, error } = await supabaseAdmin
        .from('hormozi_wisdom')
        .insert([
          {
            id: chunk.metadata.id,
            content: chunk.content,
            source: chunk.metadata.source,
            filename: chunk.metadata.filename,
            file_type: chunk.metadata.file_type,
            category: chunk.metadata.category,
            business_phase: chunk.metadata.business_phase,
            difficulty_level: chunk.metadata.difficulty_level,
            frameworks: chunk.metadata.frameworks,
            key_concepts: chunk.metadata.key_concepts,
            implementation_time: chunk.metadata.implementation_time,
            success_metrics: chunk.metadata.success_metrics,
            prerequisites: chunk.metadata.prerequisites,
            related_content: chunk.metadata.related_content,
            word_count: chunk.metadata.word_count,
            chunk_index: chunk.chunk_index,
            chunk_total: chunk.chunk_total,
            embedding: JSON.stringify(chunk.embedding),
            processed_at: chunk.metadata.processed_at.toISOString(),
            processed_by: chunk.metadata.processed_by,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) {
        console.error('Database storage error:', error);
        throw error;
      }

    } catch (error) {
      console.error('Failed to store chunk:', error);
      throw error;
    }
  }

  // Scan directory for supported files
  private scanDirectory(directoryPath: string): string[] {
    const supportedExtensions = ['.pdf', '.docx', '.txt', '.md'];
    const files: string[] = [];
    
    const scanRecursively = (currentPath: string) => {
      try {
        const items = readdirSync(currentPath);
        
        for (const item of items) {
          const fullPath = join(currentPath, item);
          const stats = statSync(fullPath);
          
          if (stats.isDirectory() && !item.startsWith('.')) {
            scanRecursively(fullPath);
          } else if (stats.isFile()) {
            const ext = extname(item).toLowerCase();
            if (supportedExtensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        console.error(`Error scanning ${currentPath}:`, error);
      }
    };
    
    scanRecursively(directoryPath);
    return files;
  }

  // Extract key concepts using basic NLP
  private extractKeywords(content: string): string[] {
    const businessTerms = [
      'revenue', 'profit', 'scaling', 'customer acquisition', 'conversion',
      'value proposition', 'market fit', 'pricing', 'retention', 'growth',
      'optimization', 'systems', 'processes', 'metrics', 'kpis',
      'leads', 'sales', 'marketing', 'operations', 'strategy'
    ];
    
    const lowerContent = content.toLowerCase();
    const foundTerms = businessTerms.filter(term => 
      lowerContent.includes(term.toLowerCase())
    );
    
    return foundTerms.slice(0, 10); // Limit to top 10 concepts
  }

  // Utility delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Video transcript processing for YouTube content
export class VideoTranscriptProcessor extends HormoziContentProcessor {
  
  // Process video transcript with timestamp preservation
  async processVideoTranscript(
    transcript: string, 
    videoId: string, 
    videoTitle: string,
    videoUrl: string
  ): Promise<void> {
    console.log(`🎥 Processing video transcript: ${videoTitle}`);
    
    // Clean and structure transcript
    const cleanedTranscript = this.cleanTranscript(transcript);
    
    if (cleanedTranscript.length < 100) {
      throw new Error(`Transcript too short: ${cleanedTranscript.length} characters`);
    }
    
    // Enhanced metadata for video content
    const metadata = await this.analyzeContent(cleanedTranscript, `video:${videoId}`);
    metadata.source = videoUrl;
    metadata.filename = videoTitle;
    metadata.file_type = 'transcript';
    
    // Add video-specific metadata
    const videoMetadata = {
      ...metadata,
      video_id: videoId,
      video_title: videoTitle,
      video_url: videoUrl,
      content_type: 'video_transcript'
    };
    
    // Chunk with timestamp preservation
    const chunks = this.intelligentTranscriptChunking(cleanedTranscript);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await this.generateEmbedding(chunk);
      
      const processedChunk: ProcessedChunk = {
        content: chunk,
        embedding,
        metadata: { ...videoMetadata, id: randomUUID() },
        chunk_index: i,
        chunk_total: chunks.length
      };
      
      await this.storeChunk(processedChunk);
    }
    
    console.log(`🎬 Stored ${chunks.length} transcript chunks for: ${videoTitle}`);
  }
  
  private cleanTranscript(transcript: string): string {
    return transcript
      .replace(/\[.*?\]/g, '') // Remove timestamp brackets
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }
  
  private intelligentTranscriptChunking(transcript: string): string[] {
    // Split on natural speech boundaries (sentences, pauses)
    const sentences = transcript.split(/[.!?]+/);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;
      
      if ((currentChunk + trimmedSentence).length > this.chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        
        // Keep context from previous chunk
        const words = currentChunk.split(' ');
        const overlap = words.slice(-20).join(' '); // Keep last 20 words
        currentChunk = overlap + ' ' + trimmedSentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.filter(chunk => chunk.length > 100);
  }
}

// Export processor instances
export const hormoziProcessor = new HormoziContentProcessor();
export const videoProcessor = new VideoTranscriptProcessor();