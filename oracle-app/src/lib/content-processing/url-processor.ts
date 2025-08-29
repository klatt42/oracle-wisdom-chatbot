/**
 * URL Content Processing Service
 * Elena Execution - Oracle Content Processing Infrastructure
 * 
 * Integrates URL scraping with database storage and RAG processing
 */

import { supabaseAdmin } from '../supabase';
import { urlScraper, type ScrapedContent, type UrlScrapingOptions } from './url-scraper';
import { ContentProcessor } from './content-processor';
import { BusinessFrameworkDetector } from './framework-detector';
import { 
  ProcessingJob,
  UrlProcessingResult,
  ProcessedContent,
  ContentMetadata,
  ProcessingStatus 
} from '@/types/oracle';

// Legacy support - extend ProcessingJob for URL-specific fields
export interface UrlProcessingJob extends ProcessingJob {
  type: 'url';
  input: string; // URL
  metadata?: {
    title?: string;
    domain?: string;
    wordCount?: number;
    quality?: number;
    frameworks?: string[];
  };
}

// Use the centralized UrlProcessingResult from types

export class UrlProcessor {
  private contentProcessor: ContentProcessor;
  private frameworkDetector: BusinessFrameworkDetector;
  private activeJobs: Map<string, UrlProcessingJob> = new Map();

  constructor() {
    this.contentProcessor = new ContentProcessor();
    this.frameworkDetector = new BusinessFrameworkDetector();
  }

  /**
   * Process a single URL through the complete pipeline
   */
  async processUrl(
    url: string, 
    options: UrlScrapingOptions = {},
    jobId?: string
  ): Promise<UrlProcessingResult> {
    const processingJobId = jobId || this.generateJobId();
    const startTime = Date.now();

    try {
      // Create processing job
      const job = this.createProcessingJob(processingJobId, url);
      this.activeJobs.set(processingJobId, job);

      console.log(`Starting URL processing: ${url}`);

      // Stage 1: URL Validation and Scraping
      await this.updateJobProgress(processingJobId, 'scraping', 10);
      const scrapedContent = await urlScraper.scrapeUrl(url);

      // Stage 2: Store initial content item
      await this.updateJobProgress(processingJobId, 'processing', 25);
      const contentId = await this.storeContentItem(scrapedContent);

      // Stage 3: Detect business frameworks
      await this.updateJobProgress(processingJobId, 'processing', 50);
      const frameworks = await this.frameworkDetector.detectFrameworks(
        scrapedContent.content,
        scrapedContent.title
      );

      // Stage 4: Process content for RAG (chunking and embeddings)
      await this.updateJobProgress(processingJobId, 'processing', 75);
      const chunks = await this.contentProcessor.processContent(
        scrapedContent.content,
        contentId,
        'url'
      );

      // Stage 5: Update content with final metadata
      await this.updateJobProgress(processingJobId, 'processing', 90);
      await this.updateContentMetadata(contentId, frameworks, chunks.length);

      // Complete processing
      await this.updateJobProgress(processingJobId, 'completed', 100);
      
      const processingTime = Date.now() - startTime;
      console.log(`URL processing completed: ${url} (${processingTime}ms)`);

      const result: UrlProcessingResult = {
        success: true,
        contentId,
        metadata: {
          title: scrapedContent.title,
          wordCount: scrapedContent.wordCount,
          quality: scrapedContent.quality.score,
          frameworks: frameworks.map(f => f.name),
          processingTime
        }
      };

      // Update job with final result
      const finalJob = this.activeJobs.get(processingJobId);
      if (finalJob) {
        finalJob.endTime = new Date();
        finalJob.contentId = contentId;
        finalJob.metadata = result.metadata;
      }

      return result;

    } catch (error) {
      console.error(`URL processing failed: ${url}`, error);

      await this.updateJobProgress(processingJobId, 'failed', 0, error.message);

      return {
        success: false,
        error: error.message
      };
    } finally {
      // Keep completed/failed jobs for a short time for status checking
      setTimeout(() => {
        this.activeJobs.delete(processingJobId);
      }, 300000); // 5 minutes
    }
  }

  /**
   * Process multiple URLs concurrently with controlled concurrency
   */
  async processUrls(
    urls: string[], 
    options: UrlScrapingOptions = {},
    maxConcurrent: number = 3
  ): Promise<UrlProcessingResult[]> {
    console.log(`Processing ${urls.length} URLs with max concurrency: ${maxConcurrent}`);

    const results: UrlProcessingResult[] = [];
    const processing: Promise<UrlProcessingResult>[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const jobId = this.generateJobId();

      // Start processing
      const promise = this.processUrl(url, options, jobId);
      processing.push(promise);

      // Control concurrency
      if (processing.length >= maxConcurrent || i === urls.length - 1) {
        const batchResults = await Promise.allSettled(processing);
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            results.push({
              success: false,
              error: result.reason?.message || 'Unknown error'
            });
          }
        }

        processing.length = 0; // Clear the processing array
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`URL batch processing completed: ${successCount}/${urls.length} successful`);

    return results;
  }

  /**
   * Get processing job status
   */
  getJobStatus(jobId: string): UrlProcessingJob | undefined {
    return this.activeJobs.get(jobId);
  }

  /**
   * Get all active jobs
   */
  getActiveJobs(): UrlProcessingJob[] {
    return Array.from(this.activeJobs.values());
  }

  private createProcessingJob(jobId: string, url: string): UrlProcessingJob {
    return {
      id: jobId,
      url,
      status: 'pending',
      progress: 0,
      startTime: new Date()
    };
  }

  private async updateJobProgress(
    jobId: string, 
    status: UrlProcessingJob['status'], 
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

  private async storeContentItem(scrapedContent: ScrapedContent): Promise<string> {
    try {
      // Store main content item
      const { data: contentItem, error: contentError } = await supabaseAdmin
        .from('content_items')
        .insert({
          title: scrapedContent.title,
          type: 'url',
          source: scrapedContent.url,
          extracted_text: scrapedContent.content,
          summary: scrapedContent.description,
          author: scrapedContent.author,
          publication_date: scrapedContent.publishedDate,
          word_count: scrapedContent.wordCount,
          character_count: scrapedContent.content.length,
          quality_score: scrapedContent.quality.score,
          quality_tier: this.mapQualityTier(scrapedContent.quality.score),
          business_relevance_score: this.calculateBusinessRelevance(scrapedContent.content),
          status: 'processing'
        })
        .select('id')
        .single();

      if (contentError) {
        throw new Error(`Failed to store content item: ${contentError.message}`);
      }

      const contentId = contentItem.id;

      // Store URL-specific metadata
      const { error: metadataError } = await supabaseAdmin
        .from('url_content_metadata')
        .insert({
          content_id: contentId,
          url: scrapedContent.url,
          domain: scrapedContent.metadata.domain,
          final_url: scrapedContent.finalUrl,
          http_status: scrapedContent.metadata.httpStatus,
          page_title: scrapedContent.title,
          meta_description: scrapedContent.description,
          meta_keywords: scrapedContent.metadata.keywords,
          readability_score: scrapedContent.quality.readabilityScore,
          html_structure_quality: scrapedContent.quality.contentStructure,
          image_count: scrapedContent.metadata.images.length,
          link_count: scrapedContent.metadata.links.length,
          extract_images: false,
          follow_redirects: true,
          respect_robots: true
        });

      if (metadataError) {
        console.error('Failed to store URL metadata:', metadataError);
        // Don't fail the entire process for metadata storage issues
      }

      return contentId;

    } catch (error) {
      console.error('Error storing content item:', error);
      throw new Error(`Database storage failed: ${error.message}`);
    }
  }

  private async updateContentMetadata(
    contentId: string, 
    frameworks: Array<{ name: string; confidence: number }>,
    chunkCount: number
  ): Promise<void> {
    try {
      // Update main content item with framework detection results
      const { error: updateError } = await supabaseAdmin
        .from('content_items')
        .update({
          detected_frameworks: frameworks.map(f => f.name),
          status: 'completed',
          processing_completed_at: new Date().toISOString()
        })
        .eq('id', contentId);

      if (updateError) {
        console.error('Failed to update content metadata:', updateError);
      }

      // Store framework detection details
      if (frameworks.length > 0) {
        const frameworkDetections = frameworks.map(framework => ({
          content_id: contentId,
          framework_name: framework.name,
          confidence_score: framework.confidence,
          detection_method: 'keyword_pattern',
          model_version: '1.0'
        }));

        const { error: frameworkError } = await supabaseAdmin
          .from('framework_detections')
          .insert(frameworkDetections);

        if (frameworkError) {
          console.error('Failed to store framework detections:', frameworkError);
        }
      }

      console.log(`Content metadata updated: ${contentId} (${frameworks.length} frameworks, ${chunkCount} chunks)`);

    } catch (error) {
      console.error('Error updating content metadata:', error);
    }
  }

  private mapQualityTier(score: number): 'low' | 'medium' | 'high' | 'premium' {
    if (score >= 90) return 'premium';
    if (score >= 75) return 'high';
    if (score >= 50) return 'medium';
    return 'low';
  }

  private calculateBusinessRelevance(content: string): number {
    const businessKeywords = [
      'business', 'strategy', 'marketing', 'sales', 'revenue', 'profit', 'growth',
      'customer', 'market', 'product', 'service', 'brand', 'competition',
      'leadership', 'management', 'team', 'operations', 'finance', 'investment',
      'scaling', 'startup', 'entrepreneur', 'innovation', 'digital transformation',
      'value proposition', 'business model', 'roi', 'kpi', 'metrics'
    ];

    const lowerContent = content.toLowerCase();
    let relevanceScore = 0;
    let matchCount = 0;

    for (const keyword of businessKeywords) {
      const matches = (lowerContent.match(new RegExp(keyword, 'g')) || []).length;
      if (matches > 0) {
        matchCount++;
        relevanceScore += Math.min(matches * 5, 20); // Max 20 points per keyword
      }
    }

    // Bonus for framework-specific terms (Alex Hormozi related)
    const hormoziKeywords = [
      'offer', 'lead magnet', 'value equation', 'grand slam', 'core four',
      'ltv', 'acquisition', 'monetization', 'retention', 'referral'
    ];

    for (const keyword of hormoziKeywords) {
      if (lowerContent.includes(keyword)) {
        relevanceScore += 15;
        matchCount++;
      }
    }

    // Normalize score (0-100) based on keyword density and variety
    const keywordDensity = (matchCount / businessKeywords.length) * 100;
    const contentQuality = Math.min(relevanceScore, 100);
    
    return Math.round((keywordDensity * 0.3 + contentQuality * 0.7));
  }

  private generateJobId(): string {
    return `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const urlProcessor = new UrlProcessor();