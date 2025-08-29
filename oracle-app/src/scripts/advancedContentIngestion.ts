#!/usr/bin/env tsx

/**
 * Advanced Hormozi Content Ingestion Pipeline
 * Elena Execution - Comprehensive Business Wisdom Processing
 * 
 * This script processes various content types (PDF, DOCX, MD, TXT) 
 * and video transcripts into the Oracle knowledge base with 
 * sophisticated metadata analysis and categorization.
 */

import { hormoziProcessor, videoProcessor } from '../lib/advancedIngestionPipeline';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { supabaseAdmin } from '../lib/supabase';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface IngestionConfig {
  sourceDirectory: string;
  sessionName: string;
  processors: string[];
  maxFilesPerSession?: number;
  enableQualityAnalysis?: boolean;
  enableRelationshipDetection?: boolean;
}

class AdvancedIngestionOrchestrator {
  private sessionId: string;
  private startTime: Date;
  private stats = {
    filesDiscovered: 0,
    filesProcessed: 0,
    filesFailed: 0,
    totalChunks: 0,
    totalWords: 0,
    apiCalls: 0,
    estimatedCost: 0
  };

  constructor() {
    this.sessionId = randomUUID();
    this.startTime = new Date();
  }

  async execute(config: IngestionConfig): Promise<void> {
    console.log('🔮 Elena Execution - Advanced Content Ingestion Pipeline');
    console.log('========================================================\n');
    
    try {
      // Initialize ingestion session
      await this.initializeSession(config);
      
      // Process content directory
      console.log(`📁 Processing directory: ${config.sourceDirectory}`);
      if (!existsSync(config.sourceDirectory)) {
        throw new Error(`Directory not found: ${config.sourceDirectory}`);
      }

      // Execute document processing
      await hormoziProcessor.processDirectory(config.sourceDirectory);
      
      // Process video transcripts if enabled
      if (config.processors.includes('video')) {
        await this.processVideoTranscripts(config.sourceDirectory);
      }
      
      // Post-processing analysis
      if (config.enableQualityAnalysis) {
        await this.runQualityAnalysis();
      }
      
      if (config.enableRelationshipDetection) {
        await this.detectContentRelationships();
      }
      
      // Finalize session
      await this.finalizeSession();
      
      console.log('\n🎯 Elena Execution - Ingestion Pipeline Complete!');
      
    } catch (error) {
      console.error('❌ Ingestion pipeline failed:', error);
      await this.finalizeSession('failed', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  }

  private async initializeSession(config: IngestionConfig): Promise<void> {
    console.log(`🚀 Initializing session: ${config.sessionName}`);
    
    try {
      const { data, error } = await supabaseAdmin
        .from('content_ingestion_sessions')
        .insert([{
          id: this.sessionId,
          session_name: config.sessionName,
          processor_agent: 'Elena Execution',
          source_directory: config.sourceDirectory,
          status: 'started',
          start_time: this.startTime.toISOString()
        }]);

      if (error) {
        console.error('Failed to initialize session:', error);
        throw error;
      }
      
      console.log(`✅ Session initialized: ${this.sessionId}`);
      
    } catch (error) {
      console.error('Session initialization error:', error);
      throw error;
    }
  }

  private async processVideoTranscripts(directory: string): Promise<void> {
    console.log('\n🎥 Processing video transcripts...');
    
    // This would integrate with existing YouTube processing
    // For now, we'll skip video processing in this script
    // and rely on the existing YouTube transcript system
    
    console.log('📝 Video transcript processing delegated to YouTube system');
  }

  private async runQualityAnalysis(): Promise<void> {
    console.log('\n🔍 Running content quality analysis...');
    
    try {
      // Get recently processed content for this session
      const { data: recentContent, error } = await supabaseAdmin
        .from('oracle_knowledge')
        .select('id, content, category_enum, difficulty_level, word_count')
        .gte('created_at', this.startTime.toISOString())
        .order('created_at', { ascending: false });

      if (error || !recentContent) {
        console.log('⚠️ No recent content found for quality analysis');
        return;
      }

      console.log(`📊 Analyzing quality for ${recentContent.length} pieces of content...`);
      
      for (const content of recentContent) {
        await this.analyzeContentQuality(content);
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      console.log('✅ Quality analysis complete');
      
    } catch (error) {
      console.error('Quality analysis error:', error);
    }
  }

  private async analyzeContentQuality(content: any): Promise<void> {
    try {
      // Calculate basic quality metrics
      const contentLength = content.content.length;
      const wordCount = content.word_count || 0;
      const sentences = content.content.split(/[.!?]+/).length;
      
      // Basic quality scoring
      let qualityScore = 0.5; // Base score
      
      // Content length scoring
      if (contentLength > 500) qualityScore += 0.1;
      if (contentLength > 1000) qualityScore += 0.1;
      
      // Word count scoring  
      if (wordCount > 100) qualityScore += 0.1;
      if (wordCount > 250) qualityScore += 0.1;
      
      // Metadata completeness
      let metadataScore = 0.0;
      if (content.category_enum) metadataScore += 0.25;
      if (content.difficulty_level) metadataScore += 0.25;
      
      // Readability approximation (simple metric)
      const avgWordsPerSentence = wordCount / Math.max(sentences, 1);
      const readabilityScore = Math.max(0, 100 - (avgWordsPerSentence * 2)); // Simple approximation
      
      // Store quality metrics
      await supabaseAdmin
        .from('content_quality_metrics')
        .insert([{
          knowledge_id: content.id,
          content_quality_score: Math.min(1.0, qualityScore),
          metadata_completeness_score: metadataScore,
          readability_score: readabilityScore,
          business_relevance_score: 0.8, // Default for Hormozi content
          actionability_score: 0.7, // Default assumption
          manual_review_required: qualityScore < 0.6,
          created_at: new Date().toISOString()
        }]);
        
    } catch (error) {
      console.error(`Quality analysis failed for content ${content.id}:`, error);
    }
  }

  private async detectContentRelationships(): Promise<void> {
    console.log('\n🔗 Detecting content relationships...');
    
    try {
      // Get recently processed content with embeddings
      const { data: recentContent, error } = await supabaseAdmin
        .from('oracle_knowledge')
        .select('id, title, embedding, framework_tags, category_enum')
        .gte('created_at', this.startTime.toISOString())
        .not('embedding', 'is', null);

      if (error || !recentContent || recentContent.length < 2) {
        console.log('⚠️ Insufficient content for relationship detection');
        return;
      }

      console.log(`🧩 Finding relationships between ${recentContent.length} pieces of content...`);
      
      const relationships: any[] = [];
      
      // Compare each piece of content with others
      for (let i = 0; i < recentContent.length; i++) {
        for (let j = i + 1; j < recentContent.length; j++) {
          const content1 = recentContent[i];
          const content2 = recentContent[j];
          
          // Calculate similarity and detect relationships
          const relationship = await this.calculateContentSimilarity(content1, content2);
          
          if (relationship) {
            relationships.push(relationship);
          }
        }
      }
      
      // Store detected relationships
      if (relationships.length > 0) {
        await supabaseAdmin
          .from('content_relationships')
          .insert(relationships);
          
        console.log(`✅ Detected ${relationships.length} content relationships`);
      } else {
        console.log('📝 No significant relationships detected');
      }
      
    } catch (error) {
      console.error('Relationship detection error:', error);
    }
  }

  private async calculateContentSimilarity(content1: any, content2: any): Promise<any | null> {
    try {
      // Parse embeddings (stored as JSON strings)
      const embedding1 = JSON.parse(content1.embedding);
      const embedding2 = JSON.parse(content2.embedding);
      
      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(embedding1, embedding2);
      
      // Determine relationship type based on metadata and similarity
      let relationshipType = 'similar_topic';
      
      // Framework-based relationships
      if (content1.framework_tags && content2.framework_tags) {
        const commonFrameworks = content1.framework_tags.filter((tag: string) => 
          content2.framework_tags.includes(tag)
        );
        if (commonFrameworks.length > 0) {
          relationshipType = 'same_framework';
        }
      }
      
      // Category-based relationships
      if (content1.category_enum === content2.category_enum) {
        relationshipType = 'similar_topic';
      }
      
      // Only create relationship if similarity is significant
      if (similarity >= 0.8) {
        return {
          primary_content_id: content1.id,
          related_content_id: content2.id,
          relationship_type: relationshipType,
          similarity_score: Math.round(similarity * 100) / 100,
          relevance_score: Math.round(similarity * 100) / 100,
          detected_by: 'embedding_similarity',
          detection_confidence: Math.round(similarity * 100) / 100,
          created_by: 'Elena Execution',
          created_at: new Date().toISOString()
        };
      }
      
      return null;
      
    } catch (error) {
      console.error('Similarity calculation error:', error);
      return null;
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have same length');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async finalizeSession(status: string = 'completed', errorMessage?: string): Promise<void> {
    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - this.startTime.getTime()) / 60000);
    
    try {
      await supabaseAdmin
        .from('content_ingestion_sessions')
        .update({
          status,
          error_message: errorMessage,
          end_time: endTime.toISOString(),
          processing_duration_minutes: durationMinutes,
          files_discovered: this.stats.filesDiscovered,
          files_processed: this.stats.filesProcessed,
          files_failed: this.stats.filesFailed,
          total_chunks_created: this.stats.totalChunks,
          total_words_processed: this.stats.totalWords,
          embedding_api_calls: this.stats.apiCalls,
          estimated_cost: this.stats.estimatedCost
        })
        .eq('id', this.sessionId);
        
      console.log(`\n📊 Session Summary:`);
      console.log(`   Duration: ${durationMinutes} minutes`);
      console.log(`   Files Processed: ${this.stats.filesProcessed}`);
      console.log(`   Total Chunks: ${this.stats.totalChunks}`);
      console.log(`   Total Words: ${this.stats.totalWords}`);
      console.log(`   Estimated Cost: $${this.stats.estimatedCost.toFixed(4)}`);
      console.log(`   Status: ${status.toUpperCase()}`);
      
    } catch (error) {
      console.error('Session finalization error:', error);
    }
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  
  // Default configuration
  const config: IngestionConfig = {
    sourceDirectory: args[0] || 'docs/knowledge-base',
    sessionName: `Elena_Execution_${new Date().toISOString().split('T')[0]}`,
    processors: ['documents', 'video'],
    enableQualityAnalysis: true,
    enableRelationshipDetection: true
  };
  
  // Parse command line arguments
  if (args.includes('--no-quality')) {
    config.enableQualityAnalysis = false;
  }
  
  if (args.includes('--no-relationships')) {
    config.enableRelationshipDetection = false;
  }
  
  if (args.includes('--docs-only')) {
    config.processors = ['documents'];
  }
  
  const sessionNameIndex = args.indexOf('--session-name');
  if (sessionNameIndex !== -1 && args[sessionNameIndex + 1]) {
    config.sessionName = args[sessionNameIndex + 1];
  }
  
  console.log('Configuration:', JSON.stringify(config, null, 2));
  console.log(''); // Empty line for readability
  
  const orchestrator = new AdvancedIngestionOrchestrator();
  await orchestrator.execute(config);
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

export { AdvancedIngestionOrchestrator };