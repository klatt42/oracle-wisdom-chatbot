#!/usr/bin/env node
/**
 * Oracle Vector Database Integration
 * Created by: David Infrastructure
 * Purpose: Embedding generation and vector storage for Hormozi wisdom content
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Types for Oracle vector database
export interface OracleKnowledgeChunk {
  id?: string;
  title: string;
  content: string;
  content_preview: string;
  category_id: string;
  source_file?: string;
  source_url?: string;
  word_count: number;
  embedding?: number[];
  metadata?: Record<string, any>;
  tags?: string[];
  youtube_video_id?: string;
  youtube_timestamp?: number;
  youtube_url?: string;
  framework_tags?: string[];
  business_phase?: 'startup' | 'scaling' | 'optimization' | 'all';
  complexity_level?: 'beginner' | 'intermediate' | 'advanced';
  processed_by?: string;
}

export interface OracleCategory {
  id: string;
  name: string;
  description?: string;
}

export interface SearchResult extends OracleKnowledgeChunk {
  category_name: string;
  similarity_score: number;
  formatted_timestamp?: string;
}

export interface ProcessingSession {
  session_id: string;
  processor_name: string;
  operation_type: string;
  chunks_created: number;
  total_words: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// Main Oracle Vector Database class
export class OracleVectorDB {
  private supabase: SupabaseClient;
  private openai: OpenAI;
  private categories: Map<string, string> = new Map();

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Initialize OpenAI client
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      throw new Error('Missing OpenAI API key. Please set OPENAI_API_KEY environment variable');
    }
    
    this.openai = new OpenAI({ apiKey: openaiKey });
  }

  // Initialize database and load categories
  async initialize(): Promise<void> {
    console.log('🔮 Initializing Oracle Vector Database...');
    
    try {
      // Load categories from database
      const { data: categories, error } = await this.supabase
        .from('oracle_categories')
        .select('id, name, description');
        
      if (error) {
        throw new Error(`Failed to load categories: ${error.message}`);
      }
      
      // Build category name -> ID mapping
      if (categories) {
        for (const category of categories) {
          this.categories.set(category.name, category.id);
        }
        console.log(`✅ Loaded ${categories.length} Oracle categories`);
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize Oracle Vector Database:', error);
      throw error;
    }
  }

  // Generate embedding for text content
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text.substring(0, 8000), // OpenAI token limit safety
      });
      
      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ Failed to generate embedding:', error);
      throw error;
    }
  }

  // Calculate embedding cost for text-embedding-3-small
  // Pricing: $0.02 per 1M tokens (vs $0.10 per 1M for ada-002)
  calculateEmbeddingCost(textLength: number): number {
    // Rough estimation: 1 token ≈ 4 characters
    const estimatedTokens = Math.ceil(textLength / 4);
    const costPerToken = 0.02 / 1000000; // $0.02 per 1M tokens
    return estimatedTokens * costPerToken;
  }

  // Process and chunk content for optimal embedding
  chunkContent(content: string, title: string, maxChunkSize: number = 1000): string[] {
    const chunks: string[] = [];
    
    // Split content by paragraphs/sections
    const sections = content.split(/\n\n+/);
    let currentChunk = `# ${title}\n\n`;
    
    for (const section of sections) {
      const trimmedSection = section.trim();
      if (!trimmedSection) continue;
      
      // If adding this section would exceed max size, finalize current chunk
      if (currentChunk.length + trimmedSection.length > maxChunkSize && currentChunk.length > title.length + 10) {
        chunks.push(currentChunk.trim());
        currentChunk = `# ${title}\n\n${trimmedSection}\n\n`;
      } else {
        currentChunk += `${trimmedSection}\n\n`;
      }
    }
    
    // Add final chunk
    if (currentChunk.length > title.length + 10) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.length > 0 ? chunks : [content.substring(0, maxChunkSize)];
  }

  // Extract preview from content
  extractContentPreview(content: string, maxLength: number = 200): string {
    const cleanContent = content
      .replace(/^#[^\n]*\n/gm, '') // Remove headers
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Convert markdown links to text
      .replace(/\*\*([^*]*)\*\*/g, '$1') // Remove bold formatting
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    return cleanContent.length > maxLength 
      ? cleanContent.substring(0, maxLength) + '...'
      : cleanContent;
  }

  // Store knowledge chunk with embedding
  async storeKnowledgeChunk(chunk: OracleKnowledgeChunk): Promise<string> {
    try {
      // Generate embedding for the content
      const embeddingText = `${chunk.title}\n\n${chunk.content}`;
      const embedding = await this.generateEmbedding(embeddingText);
      
      // Get category ID
      const categoryId = this.categories.get(chunk.category_id) || chunk.category_id;
      
      // Prepare data for insertion
      const insertData = {
        title: chunk.title,
        category_id: categoryId,
        content: chunk.content,
        content_preview: chunk.content_preview,
        source_file: chunk.source_file,
        source_url: chunk.source_url,
        word_count: chunk.word_count,
        embedding: `[${embedding.join(',')}]`, // PostgreSQL vector format
        metadata: chunk.metadata || {},
        tags: chunk.tags || [],
        youtube_video_id: chunk.youtube_video_id,
        youtube_timestamp: chunk.youtube_timestamp,
        youtube_url: chunk.youtube_url,
        framework_tags: chunk.framework_tags || [],
        business_phase: chunk.business_phase || 'all',
        complexity_level: chunk.complexity_level || 'intermediate',
        processed_by: chunk.processed_by || 'David Infrastructure'
      };
      
      const { data, error } = await this.supabase
        .from('oracle_knowledge')
        .insert([insertData])
        .select('id')
        .single();
        
      if (error) {
        throw new Error(`Failed to store knowledge chunk: ${error.message}`);
      }
      
      return data.id;
    } catch (error) {
      console.error('❌ Failed to store knowledge chunk:', error);
      throw error;
    }
  }

  // Process Oracle content file and store chunks
  async processContentFile(filePath: string, categoryName: string): Promise<ProcessingSession> {
    const sessionId = randomUUID();
    const startTime = Date.now();
    
    try {
      console.log(`🔄 Processing: ${filePath}`);
      
      // Start processing session
      await this.logProcessingStart(sessionId, 'David Infrastructure', 'embed_content', filePath, categoryName);
      
      if (!existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      
      const content = readFileSync(filePath, 'utf-8');
      const fileName = filePath.split('/').pop() || 'unknown';
      
      // Extract metadata from frontmatter
      const { title, metadata, cleanContent, wordCount } = this.parseContentFile(content);
      
      // Check if this is YouTube-only content
      if (wordCount < 50 && content.includes('youtube.com/watch')) {
        console.log(`⏩ Skipping YouTube-only file: ${fileName}`);
        await this.logProcessingComplete(sessionId, 'completed', 0, 0);
        return {
          session_id: sessionId,
          processor_name: 'David Infrastructure',
          operation_type: 'embed_content',
          chunks_created: 0,
          total_words: 0,
          status: 'completed'
        };
      }
      
      // Chunk the content
      const chunks = this.chunkContent(cleanContent, title);
      const storedChunks: string[] = [];
      
      // Process each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];
        const chunkTitle = chunks.length > 1 ? `${title} (Part ${i + 1})` : title;
        
        const chunk: OracleKnowledgeChunk = {
          title: chunkTitle,
          content: chunkContent,
          content_preview: this.extractContentPreview(chunkContent),
          category_id: categoryName,
          source_file: fileName,
          word_count: this.countWords(chunkContent),
          metadata: {
            ...metadata,
            original_file: fileName,
            chunk_index: i,
            total_chunks: chunks.length
          },
          tags: metadata.tags || [],
          framework_tags: this.detectFrameworks(chunkContent),
          business_phase: this.detectBusinessPhase(chunkContent),
          complexity_level: this.assessComplexity(this.countWords(chunkContent))
        };
        
        const chunkId = await this.storeKnowledgeChunk(chunk);
        storedChunks.push(chunkId);
        
        console.log(`  ✅ Stored chunk ${i + 1}/${chunks.length}: ${chunkTitle} (${chunk.word_count} words)`);
      }
      
      // Complete processing session
      const processingTime = Date.now() - startTime;
      // Calculate cost estimate
      const totalTextLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const costEstimate = this.calculateEmbeddingCost(totalTextLength);
      
      await this.logProcessingComplete(sessionId, 'completed', chunks.length, wordCount, processingTime, undefined, costEstimate);
      
      console.log(`✅ Processed ${fileName}: ${chunks.length} chunks, ${wordCount} words`);
      
      return {
        session_id: sessionId,
        processor_name: 'David Infrastructure',
        operation_type: 'embed_content',
        chunks_created: chunks.length,
        total_words: wordCount,
        status: 'completed'
      };
      
    } catch (error) {
      await this.logProcessingComplete(sessionId, 'failed', 0, 0, Date.now() - startTime, String(error));
      console.error(`❌ Failed to process ${filePath}:`, error);
      throw error;
    }
  }

  // Parse Oracle content file
  private parseContentFile(content: string): { title: string; metadata: any; cleanContent: string; wordCount: number } {
    let title = 'Untitled';
    let metadata: any = {};
    let cleanContent = content;
    
    // Extract frontmatter
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      cleanContent = content.replace(frontmatterMatch[0], '');
      
      // Parse YAML-like frontmatter
      const lines = frontmatter.split('\n');
      for (const line of lines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          
          if (key === 'title' && value) {
            title = value.replace(/^["']|["']$/g, ''); // Remove quotes
          } else if (key === 'tags' && value) {
            metadata.tags = [value.replace(/^["']|["']$/g, '')];
          } else if (value) {
            metadata[key] = value.replace(/^["']|["']$/g, '');
          }
        }
      }
    }
    
    // Remove Oracle processing sections
    cleanContent = cleanContent.replace(/## Oracle Content Classification[\s\S]*?---\s*\n/g, '');
    cleanContent = cleanContent.replace(/## Oracle Integration Notes[\s\S]*$/g, '');
    
    return {
      title,
      metadata,
      cleanContent: cleanContent.trim(),
      wordCount: this.countWords(cleanContent)
    };
  }

  // Helper methods
  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private detectFrameworks(content: string): string[] {
    const frameworks: string[] = [];
    const lower = content.toLowerCase();
    
    if (lower.includes('grand slam')) frameworks.push('Grand Slam Offers');
    if (lower.includes('core four')) frameworks.push('Core Four');
    if (lower.includes('ltv') || lower.includes('lifetime value')) frameworks.push('LTV Optimization');
    if (lower.includes('cac') || lower.includes('customer acquisition')) frameworks.push('Customer Acquisition');
    if (lower.includes('resilience') || lower.includes('mindset')) frameworks.push('Resilience Building');
    if (lower.includes('copywriting')) frameworks.push('Copywriting Systems');
    if (lower.includes('scaling') || lower.includes('scale')) frameworks.push('Business Scaling');
    
    return frameworks;
  }

  private detectBusinessPhase(content: string): 'startup' | 'scaling' | 'optimization' | 'all' {
    const lower = content.toLowerCase();
    
    if (lower.includes('startup') || lower.includes('beginning') || lower.includes('start')) return 'startup';
    if (lower.includes('scale') || lower.includes('scaling') || lower.includes('million')) return 'scaling';
    if (lower.includes('optimize') || lower.includes('advanced') || lower.includes('master')) return 'optimization';
    
    return 'all';
  }

  private assessComplexity(wordCount: number): 'beginner' | 'intermediate' | 'advanced' {
    if (wordCount < 300) return 'beginner';
    if (wordCount < 800) return 'intermediate';
    return 'advanced';
  }

  // Processing history logging
  private async logProcessingStart(
    sessionId: string, 
    processorName: string, 
    operationType: string, 
    sourceFile: string,
    sourceCategory: string
  ): Promise<void> {
    await this.supabase
      .from('oracle_processing_history')
      .insert([{
        session_id: sessionId,
        processor_name: processorName,
        operation_type: operationType,
        source_file: sourceFile,
        source_category: sourceCategory,
        status: 'processing'
      }]);
  }

  private async logProcessingComplete(
    sessionId: string, 
    status: string, 
    chunksCreated: number,
    totalWords: number,
    processingTime?: number,
    errorMessage?: string,
    costEstimate?: number
  ): Promise<void> {
    await this.supabase
      .from('oracle_processing_history')
      .update({
        status,
        chunks_created: chunksCreated,
        total_words: totalWords,
        processing_time_ms: processingTime,
        error_message: errorMessage,
        embedding_cost_estimate: costEstimate,
        updated_at: new Date().toISOString()
      })
      .eq('session_id', sessionId);
  }

  // Vector search methods
  async semanticSearch(
    query: string, 
    options: {
      categoryFilter?: string;
      businessPhaseFilter?: string;
      maxResults?: number;
      similarityThreshold?: number;
    } = {}
  ): Promise<SearchResult[]> {
    const startTime = Date.now();
    
    try {
      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Call Supabase function
      const { data, error } = await this.supabase.rpc('oracle_semantic_search', {
        query_embedding: `[${queryEmbedding.join(',')}]`,
        similarity_threshold: options.similarityThreshold || 0.8,
        max_results: options.maxResults || 5,
        category_filter: options.categoryFilter || null,
        business_phase_filter: options.businessPhaseFilter || null
      });
      
      if (error) {
        throw new Error(`Semantic search failed: ${error.message}`);
      }
      
      // Log search for analytics
      const searchTime = Date.now() - startTime;
      await this.logSearch(query, queryEmbedding, data?.length || 0, searchTime, options.categoryFilter);
      
      return data || [];
    } catch (error) {
      console.error('❌ Semantic search failed:', error);
      throw error;
    }
  }

  async hybridSearch(query: string, options: { categoryFilter?: string; maxResults?: number } = {}): Promise<SearchResult[]> {
    try {
      const queryEmbedding = await this.generateEmbedding(query);
      
      const { data, error } = await this.supabase.rpc('oracle_hybrid_search', {
        query_text: query,
        query_embedding: `[${queryEmbedding.join(',')}]`,
        similarity_threshold: 0.7,
        max_results: options.maxResults || 10,
        category_filter: options.categoryFilter || null
      });
      
      if (error) {
        throw new Error(`Hybrid search failed: ${error.message}`);
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Hybrid search failed:', error);
      throw error;
    }
  }

  private async logSearch(
    queryText: string, 
    queryEmbedding: number[], 
    resultsFound: number, 
    searchTimeMs: number,
    categoryFilter?: string
  ): Promise<void> {
    try {
      await this.supabase.rpc('oracle_log_search', {
        query_text: queryText,
        query_embedding: `[${queryEmbedding.join(',')}]`,
        results_found: resultsFound,
        search_time_ms: searchTimeMs,
        category_filter: categoryFilter || null
      });
    } catch (error) {
      console.error('Failed to log search analytics:', error);
    }
  }

  // Get processing statistics
  async getProcessingStats(): Promise<any> {
    const { data, error } = await this.supabase
      .from('oracle_processing_history')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw new Error(`Failed to get processing stats: ${error.message}`);
    }
    
    return data;
  }
}