/**
 * Universal Content Processing Pipeline
 * Elena Execution - Oracle Content Processing Infrastructure
 * 
 * Orchestrates the complete content processing workflow for all content types
 */

import { supabaseAdmin } from '../supabase';
import { urlProcessor } from './url-processor';
import { youtubeProcessor } from './youtube-processor';
import { ContentProcessor } from './content-processor';
import { BusinessFrameworkDetector } from './framework-detector';

export interface ProcessingStage {
  name: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
}

export interface UniversalProcessingJob {
  id: string;
  type: 'file' | 'url' | 'youtube' | 'text';
  source: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  stages: ProcessingStage[];
  contentId?: string;
  metadata?: {
    title?: string;
    wordCount?: number;
    quality?: number;
    frameworks?: string[];
    processingTime?: number;
  };
  error?: string;
}

export interface ProcessingOptions {
  // URL processing options
  extractImages?: boolean;
  followRedirects?: boolean;
  respectRobots?: boolean;
  
  // YouTube processing options
  includeTranscript?: boolean;
  includeComments?: boolean;
  chapterDetection?: boolean;
  
  // Content processing options
  maxChunkSize?: number;
  chunkOverlap?: number;
  generateEmbeddings?: boolean;
  detectFrameworks?: boolean;
  
  // Quality control
  minQualityScore?: number;
  businessRelevanceThreshold?: number;
}

export class ProcessingPipeline {
  private activeJobs: Map<string, UniversalProcessingJob> = new Map();
  private contentProcessor: ContentProcessor;
  private frameworkDetector: BusinessFrameworkDetector;

  constructor() {
    this.contentProcessor = new ContentProcessor();
    this.frameworkDetector = new BusinessFrameworkDetector();
  }

  /**
   * Process content through universal pipeline based on type
   */
  async processContent(
    type: 'file' | 'url' | 'youtube' | 'text',
    source: string,
    content?: string,
    options: ProcessingOptions = {}
  ): Promise<UniversalProcessingJob> {
    const jobId = this.generateJobId(type);
    
    try {
      // Create processing job with stages
      const job = this.createProcessingJob(jobId, type, source, options);
      this.activeJobs.set(jobId, job);

      console.log(`Starting universal content processing: ${type} - ${source}`);

      // Execute processing based on content type
      switch (type) {
        case 'url':
          await this.processUrlContent(jobId, source, options);
          break;
        case 'youtube':
          await this.processYouTubeContent(jobId, source, options);
          break;
        case 'file':
          await this.processFileContent(jobId, source, content || '', options);
          break;
        case 'text':
          await this.processTextContent(jobId, content || '', options);
          break;
        default:
          throw new Error(`Unsupported content type: ${type}`);
      }

      // Mark job as completed
      await this.updateJobStatus(jobId, 'completed', 100);

      const job_final = this.activeJobs.get(jobId)!;
      console.log(`Content processing completed: ${jobId} (${job_final.endTime?.getTime()! - job_final.startTime.getTime()}ms)`);

      return job_final;

    } catch (error) {
      console.error(`Content processing failed: ${jobId}`, error);
      await this.updateJobStatus(jobId, 'failed', 0, error.message);
      throw error;
    }
  }

  /**
   * Process multiple content items with controlled concurrency
   */
  async processBatch(
    items: Array<{ type: 'file' | 'url' | 'youtube' | 'text'; source: string; content?: string }>,
    options: ProcessingOptions = {},
    maxConcurrent: number = 3
  ): Promise<UniversalProcessingJob[]> {
    console.log(`Processing batch of ${items.length} items with max concurrency: ${maxConcurrent}`);

    const results: UniversalProcessingJob[] = [];
    const processing: Promise<UniversalProcessingJob>[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      const promise = this.processContent(item.type, item.source, item.content, options);
      processing.push(promise);

      if (processing.length >= maxConcurrent || i === items.length - 1) {
        const batchResults = await Promise.allSettled(processing);
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            // Create a failed job for rejected promises
            const failedJob = this.createProcessingJob(
              this.generateJobId('unknown'),
              'text',
              'failed',
              options
            );
            failedJob.status = 'failed';
            failedJob.error = result.reason?.message || 'Unknown error';
            results.push(failedJob);
          }
        }

        processing.length = 0;
      }
    }

    const successCount = results.filter(r => r.status === 'completed').length;
    console.log(`Batch processing completed: ${successCount}/${items.length} successful`);

    return results;
  }

  /**
   * Get job status by ID
   */
  getJob(jobId: string): UniversalProcessingJob | undefined {
    return this.activeJobs.get(jobId);
  }

  /**
   * Get all active jobs
   */
  getActiveJobs(): UniversalProcessingJob[] {
    return Array.from(this.activeJobs.values());
  }

  /**
   * Get jobs by status
   */
  getJobsByStatus(status: UniversalProcessingJob['status']): UniversalProcessingJob[] {
    return Array.from(this.activeJobs.values()).filter(job => job.status === status);
  }

  private async processUrlContent(jobId: string, url: string, options: ProcessingOptions): Promise<void> {
    const urlOptions = {
      extractImages: options.extractImages,
      followRedirects: options.followRedirects,
      respectRobots: options.respectRobots
    };

    await this.updateStageStatus(jobId, 'validation', 'processing');
    
    // Delegate to URL processor
    const result = await urlProcessor.processUrl(url, urlOptions);
    
    if (!result.success) {
      throw new Error(result.error || 'URL processing failed');
    }

    // Update job with results
    const job = this.activeJobs.get(jobId)!;
    job.contentId = result.contentId;
    job.metadata = {
      title: result.metadata?.title,
      wordCount: result.metadata?.wordCount,
      quality: result.metadata?.quality,
      frameworks: result.metadata?.frameworks,
      processingTime: result.metadata?.processingTime
    };

    await this.completeAllStages(jobId);
  }

  private async processYouTubeContent(jobId: string, url: string, options: ProcessingOptions): Promise<void> {
    const youtubeOptions = {
      includeTranscript: options.includeTranscript,
      includeComments: options.includeComments,
      chapterDetection: options.chapterDetection
    };

    await this.updateStageStatus(jobId, 'validation', 'processing');
    
    // Delegate to YouTube processor
    const result = await youtubeProcessor.processVideo(url, youtubeOptions);
    
    if (!result.success) {
      throw new Error(result.error || 'YouTube processing failed');
    }

    // Update job with results
    const job = this.activeJobs.get(jobId)!;
    job.contentId = result.contentId;
    job.metadata = {
      title: result.metadata?.title,
      wordCount: result.metadata?.transcriptWordCount,
      quality: result.metadata?.quality,
      frameworks: result.metadata?.frameworks,
      processingTime: result.metadata?.processingTime
    };

    await this.completeAllStages(jobId);
  }

  private async processFileContent(
    jobId: string, 
    filename: string, 
    content: string, 
    options: ProcessingOptions
  ): Promise<void> {
    // Stage 1: Validation
    await this.updateStageStatus(jobId, 'validation', 'processing');
    
    if (!content || content.length < 50) {
      throw new Error('Content is too short or empty');
    }

    await this.updateStageStatus(jobId, 'validation', 'completed');

    // Stage 2: Content extraction (already done for files)
    await this.updateStageStatus(jobId, 'extraction', 'processing');
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate processing
    await this.updateStageStatus(jobId, 'extraction', 'completed');

    // Stage 3: Business analysis
    await this.updateStageStatus(jobId, 'analysis', 'processing');
    const frameworks = options.detectFrameworks !== false 
      ? await this.frameworkDetector.detectFrameworks(content, filename)
      : [];
    await this.updateStageStatus(jobId, 'analysis', 'completed');

    // Stage 4: Store content
    await this.updateStageStatus(jobId, 'processing', 'processing');
    const contentId = await this.storeFileContent(filename, content, frameworks);
    await this.updateStageStatus(jobId, 'processing', 'completed');

    // Stage 5: RAG processing
    await this.updateStageStatus(jobId, 'storage', 'processing');
    if (options.generateEmbeddings !== false) {
      await this.contentProcessor.processContent(content, contentId, 'file');
    }
    await this.updateStageStatus(jobId, 'storage', 'completed');

    // Update job with results
    const job = this.activeJobs.get(jobId)!;
    job.contentId = contentId;
    job.metadata = {
      title: filename,
      wordCount: content.split(/\s+/).length,
      quality: this.calculateContentQuality(content),
      frameworks: frameworks.map(f => f.name),
      processingTime: Date.now() - job.startTime.getTime()
    };
  }

  private async processTextContent(
    jobId: string, 
    content: string, 
    options: ProcessingOptions
  ): Promise<void> {
    const title = content.substring(0, 50).trim() + (content.length > 50 ? '...' : '');

    // Similar processing to file content
    await this.processFileContent(jobId, title, content, options);
  }

  private createProcessingJob(
    jobId: string,
    type: UniversalProcessingJob['type'],
    source: string,
    options: ProcessingOptions
  ): UniversalProcessingJob {
    const stages: ProcessingStage[] = [
      {
        name: 'validation',
        description: 'Validating content and permissions',
        status: 'pending',
        progress: 0
      },
      {
        name: 'extraction',
        description: 'Extracting text and metadata',
        status: 'pending',
        progress: 0
      },
      {
        name: 'analysis',
        description: 'Analyzing business frameworks and relevance',
        status: 'pending',
        progress: 0
      },
      {
        name: 'processing',
        description: 'Creating content chunks and embeddings',
        status: 'pending',
        progress: 0
      },
      {
        name: 'storage',
        description: 'Saving to knowledge base',
        status: 'pending',
        progress: 0
      }
    ];

    return {
      id: jobId,
      type,
      source,
      status: 'queued',
      progress: 0,
      startTime: new Date(),
      stages
    };
  }

  private async updateJobStatus(
    jobId: string,
    status: UniversalProcessingJob['status'],
    progress: number,
    error?: string
  ): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (job) {
      job.status = status;
      job.progress = progress;
      if (error) {
        job.error = error;
      }
      if (status === 'completed' || status === 'failed') {
        job.endTime = new Date();
      }
    }
  }

  private async updateStageStatus(
    jobId: string,
    stageName: string,
    status: ProcessingStage['status'],
    error?: string
  ): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (job) {
      const stage = job.stages.find(s => s.name === stageName);
      if (stage) {
        stage.status = status;
        stage.progress = status === 'completed' ? 100 : status === 'processing' ? 50 : 0;
        
        if (status === 'processing' && !stage.startTime) {
          stage.startTime = new Date();
        }
        
        if ((status === 'completed' || status === 'failed') && stage.startTime) {
          stage.endTime = new Date();
          stage.duration = stage.endTime.getTime() - stage.startTime.getTime();
        }
        
        if (error) {
          stage.error = error;
        }

        // Update overall job progress
        const completedStages = job.stages.filter(s => s.status === 'completed').length;
        job.progress = Math.round((completedStages / job.stages.length) * 100);

        if (job.progress > 0) {
          job.status = 'processing';
        }
      }
    }
  }

  private async completeAllStages(jobId: string): Promise<void> {
    const job = this.activeJobs.get(jobId);
    if (job) {
      // Mark all stages as completed for delegated processing
      for (const stage of job.stages) {
        if (stage.status === 'pending') {
          stage.status = 'completed';
          stage.progress = 100;
          stage.startTime = new Date();
          stage.endTime = new Date();
          stage.duration = 100; // Minimal duration for delegated stages
        }
      }
      job.progress = 100;
    }
  }

  private async storeFileContent(
    filename: string,
    content: string,
    frameworks: Array<{ name: string; confidence: number }>
  ): Promise<string> {
    try {
      const { data: contentItem, error } = await supabaseAdmin
        .from('content_items')
        .insert({
          title: filename,
          type: 'file',
          source: filename,
          extracted_text: content,
          word_count: content.split(/\s+/).length,
          character_count: content.length,
          quality_score: this.calculateContentQuality(content),
          quality_tier: this.mapQualityTier(this.calculateContentQuality(content)),
          business_relevance_score: this.calculateBusinessRelevance(content),
          detected_frameworks: frameworks.map(f => f.name),
          status: 'completed',
          processing_completed_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to store content: ${error.message}`);
      }

      return contentItem.id;
    } catch (error) {
      console.error('Error storing file content:', error);
      throw error;
    }
  }

  private calculateContentQuality(content: string): number {
    const wordCount = content.split(/\s+/).length;
    let score = 50; // Base score

    if (wordCount > 100) score += 10;
    if (wordCount > 500) score += 15;
    if (wordCount > 1000) score += 15;

    // Check for structured content
    if (content.includes('\n') && content.includes(':')) score += 10;
    
    return Math.min(100, score);
  }

  private calculateBusinessRelevance(content: string): number {
    const businessKeywords = [
      'business', 'strategy', 'marketing', 'sales', 'growth', 'revenue',
      'customer', 'value', 'offer', 'framework', 'process', 'system'
    ];

    const lowerContent = content.toLowerCase();
    let relevanceScore = 0;

    for (const keyword of businessKeywords) {
      if (lowerContent.includes(keyword)) {
        relevanceScore += 8;
      }
    }

    return Math.min(100, relevanceScore);
  }

  private mapQualityTier(score: number): 'low' | 'medium' | 'high' | 'premium' {
    if (score >= 90) return 'premium';
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  private generateJobId(type: string): string {
    return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const processingPipeline = new ProcessingPipeline();