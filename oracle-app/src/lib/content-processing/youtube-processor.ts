/**
 * YouTube Content Processing Service
 * Elena Execution - Oracle Content Processing Infrastructure
 */

import { supabaseAdmin } from '../supabase';
import { ContentProcessor } from './content-processor';
import { BusinessFrameworkDetector } from './framework-detector';
import { google } from 'googleapis';
import { 
  YouTubeProcessingResult,
  YouTubeMetadata,
  YouTubeChapter,
  ProcessedContent,
  ProcessingJob 
} from '@/types/oracle';

// YouTube video data interface
interface YouTubeVideoData {
  title: string;
  description: string;
  channel: string;
  channelName: string;
  publishedAt: string;
  duration: string;
  durationFormatted: string;
  viewCount: number;
  videoId: string;
}

// Extended YouTube processing options
export interface YouTubeProcessingOptions {
  includeTranscript?: boolean;
  includeComments?: boolean;
  maxComments?: number;
  chapterDetection?: boolean;
  speakerIdentification?: boolean;
  timestampReferences?: boolean;
  quality?: 'low' | 'medium' | 'high';
}

// Legacy support for TranscriptSegment
export interface TranscriptSegment {
  start: number;
  duration: number;
  text: string;
  confidence?: number;
}

// Use centralized YouTubeChapter type
// Legacy support for VideoChapter
export interface VideoChapter extends YouTubeChapter {
  description?: string;
}

export interface YouTubeProcessingJob {
  id: string;
  videoId: string;
  url: string;
  status: 'pending' | 'fetching' | 'transcribing' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  contentId?: string;
  metadata?: {
    title?: string;
    channel?: string;
    duration?: string;
    quality?: number;
    frameworks?: string[];
    transcriptWordCount?: number;
    chapterCount?: number;
  };
}

// Use imported YouTubeProcessingResult interface from types/oracle.ts

export class YouTubeProcessor {
  private youtube: any;
  private contentProcessor: ContentProcessor;
  private frameworkDetector: BusinessFrameworkDetector;
  private activeJobs: Map<string, YouTubeProcessingJob> = new Map();

  constructor() {
    // Initialize YouTube API client
    this.youtube = google.youtube({
      version: 'v3',
      auth: process.env.YOUTUBE_API_KEY
    });

    this.contentProcessor = new ContentProcessor();
    this.frameworkDetector = new BusinessFrameworkDetector();
  }

  /**
   * Process a YouTube video through the complete pipeline
   */
  async processVideo(
    url: string,
    options: YouTubeProcessingOptions = {},
    jobId?: string
  ): Promise<YouTubeProcessingResult> {
    const processingJobId = jobId || this.generateJobId();
    const startTime = Date.now();

    try {
      // Extract video ID from URL
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL or video ID not found');
      }

      // Create processing job
      const job = this.createProcessingJob(processingJobId, videoId, url);
      this.activeJobs.set(processingJobId, job);

      console.log(`Starting YouTube video processing: ${videoId}`);

      // Stage 1: Fetch video metadata
      await this.updateJobProgress(processingJobId, 'fetching', 15);
      const videoData = await this.fetchVideoMetadata(videoId);

      // Stage 2: Fetch transcript
      await this.updateJobProgress(processingJobId, 'transcribing', 35);
      const transcript = await this.fetchTranscript(videoId, options);

      // Stage 3: Detect chapters (if enabled)
      await this.updateJobProgress(processingJobId, 'transcribing', 45);
      const chapters = options.chapterDetection 
        ? await this.detectChapters(transcript.text, videoData.description)
        : [];

      // Stage 4: Store initial content item
      await this.updateJobProgress(processingJobId, 'processing', 55);
      const contentId = await this.storeContentItem(videoData, transcript, chapters, options);

      // Stage 5: Detect business frameworks
      await this.updateJobProgress(processingJobId, 'processing', 70);
      const frameworks = await this.frameworkDetector.detectFrameworks(
        transcript.text,
        videoData.title
      );

      // Stage 6: Process content for RAG (chunking and embeddings)
      await this.updateJobProgress(processingJobId, 'processing', 85);
      const chunks = await this.contentProcessor.processContent(
        transcript.text,
        contentId,
        'youtube'
      );

      // Stage 7: Update content with final metadata
      await this.updateJobProgress(processingJobId, 'processing', 95);
      await this.updateContentMetadata(contentId, frameworks, chunks.totalChunks);

      // Complete processing
      await this.updateJobProgress(processingJobId, 'completed', 100);

      const processingTime = Date.now() - startTime;
      console.log(`YouTube video processing completed: ${videoId} (${processingTime}ms)`);

      const result: YouTubeProcessingResult = {
        success: true,
        video_id: videoId,
        title: videoData.title,
        description: videoData.description,
        metadata: {
          channel_title: videoData.channel,
          published_at: videoData.publishedAt,
          duration: videoData.durationFormatted,
          view_count: videoData.viewCount
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
      console.error(`YouTube video processing failed: ${url}`, error);
      await this.updateJobProgress(processingJobId, 'failed', 0, error instanceof Error ? error.message : String(error));

      return {
        success: false,
        video_id: url.split('/').pop() || 'unknown',
        error: error instanceof Error ? error.message : String(error)
      };
    } finally {
      // Keep completed/failed jobs for status checking
      setTimeout(() => {
        this.activeJobs.delete(processingJobId);
      }, 300000); // 5 minutes
    }
  }

  /**
   * Process multiple YouTube videos with controlled concurrency
   */
  async processVideos(
    urls: string[],
    options: YouTubeProcessingOptions = {},
    maxConcurrent: number = 2
  ): Promise<YouTubeProcessingResult[]> {
    console.log(`Processing ${urls.length} YouTube videos with max concurrency: ${maxConcurrent}`);

    const results: YouTubeProcessingResult[] = [];
    const processing: Promise<YouTubeProcessingResult>[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const jobId = this.generateJobId();

      const promise = this.processVideo(url, options, jobId);
      processing.push(promise);

      if (processing.length >= maxConcurrent || i === urls.length - 1) {
        const batchResults = await Promise.allSettled(processing);
        
        for (const result of batchResults) {
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            results.push({
              success: false,
              video_id: 'unknown', // Can't determine video_id from failed result
              error: result.reason?.message || 'Unknown error'
            });
          }
        }

        processing.length = 0;
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`YouTube batch processing completed: ${successCount}/${urls.length} successful`);

    return results;
  }

  /**
   * Extract video ID from various YouTube URL formats
   */
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Get processing job status
   */
  getJobStatus(jobId: string): YouTubeProcessingJob | undefined {
    return this.activeJobs.get(jobId);
  }

  /**
   * Get all active jobs
   */
  getActiveJobs(): YouTubeProcessingJob[] {
    return Array.from(this.activeJobs.values());
  }

  private async fetchVideoMetadata(videoId: string): Promise<YouTubeVideoData> {
    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: [videoId]
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Video not found or is private/unavailable');
      }

      const video = response.data.items[0];
      const snippet = video.snippet;
      const details = video.contentDetails;
      const stats = video.statistics;

      // Parse duration (ISO 8601 format: PT#M#S)
      const duration = this.parseDuration(details.duration);

      return {
        videoId,
        title: snippet.title,
        description: snippet.description || '',
        channel: snippet.channelId,
        channelName: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
        duration: duration.toString(),
        durationFormatted: this.formatDuration(duration),
        viewCount: parseInt(stats.viewCount) || 0
      };

    } catch (error) {
      console.error(`Failed to fetch video metadata: ${videoId}`, error);
      throw new Error(`YouTube API error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async fetchTranscript(
    videoId: string, 
    options: YouTubeProcessingOptions
  ): Promise<{ text: string; wordCount: number; segments: TranscriptSegment[] }> {
    try {
      // Note: This is a placeholder implementation
      // In a real implementation, you would use youtube-transcript-api or similar
      // For now, we'll simulate transcript fetching
      
      console.log(`Fetching transcript for video: ${videoId}`);
      
      // Simulate transcript fetching delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demonstration, return a placeholder transcript
      // In production, integrate with youtube-transcript-api or similar service
      const placeholderTranscript = `
        Welcome to this video about business scaling and growth strategies. 
        In this session, we'll cover the fundamental principles of building 
        a successful business, including value creation, customer acquisition, 
        and systematic scaling approaches. We'll dive deep into proven frameworks 
        for creating irresistible offers that customers can't refuse, 
        and explore the four core methods for generating leads and acquiring customers.
        
        Throughout this presentation, we'll examine real-world case studies 
        and actionable strategies you can implement immediately in your business.
      `;

      const segments: TranscriptSegment[] = [
        {
          start: 0,
          duration: 30,
          text: placeholderTranscript.trim(),
          confidence: 0.95
        }
      ];

      return {
        text: placeholderTranscript.trim(),
        wordCount: placeholderTranscript.trim().split(/\s+/).length,
        segments
      };

    } catch (error) {
      console.error(`Failed to fetch transcript: ${videoId}`, error);
      
      // Return empty transcript if fetching fails
      return {
        text: '',
        wordCount: 0,
        segments: []
      };
    }
  }

  private async detectChapters(
    transcript: string,
    description: string
  ): Promise<VideoChapter[]> {
    const chapters: VideoChapter[] = [];

    // Look for chapter markers in description
    const chapterPattern = /(\d{1,2}):(\d{2})\s+(.+?)(?=\n|\d{1,2}:|\$)/g;
    let match;

    while ((match = chapterPattern.exec(description)) !== null) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const title = match[3].trim();
      
      chapters.push({
        title,
        start_time: minutes * 60 + seconds,
        end_time: 0 // Will be calculated based on next chapter
      });
    }

    // Calculate end times
    for (let i = 0; i < chapters.length; i++) {
      if (i < chapters.length - 1) {
        chapters[i].end_time = chapters[i + 1].start_time;
      }
    }

    return chapters;
  }

  private createProcessingJob(jobId: string, videoId: string, url: string): YouTubeProcessingJob {
    return {
      id: jobId,
      videoId,
      url,
      status: 'pending',
      progress: 0,
      startTime: new Date()
    };
  }

  private async updateJobProgress(
    jobId: string,
    status: YouTubeProcessingJob['status'],
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

  private async storeContentItem(
    videoData: YouTubeVideoData,
    transcript: { text: string; wordCount: number; segments: TranscriptSegment[] },
    chapters: VideoChapter[],
    options: YouTubeProcessingOptions
  ): Promise<string> {
    try {
      // Store main content item
      const { data: contentItem, error: contentError } = await supabaseAdmin
        .from('content_items')
        .insert({
          title: videoData.title,
          type: 'youtube',
          source: `https://www.youtube.com/watch?v=${videoData.videoId}`,
          extracted_text: transcript.text,
          summary: videoData.description.length > 500 
            ? videoData.description.substring(0, 497) + '...'
            : videoData.description,
          author: videoData.channelName,
          publication_date: new Date(videoData.publishedAt),
          word_count: transcript.wordCount,
          character_count: transcript.text.length,
          quality_score: this.calculateVideoQuality(videoData, transcript),
          quality_tier: this.mapQualityTier(this.calculateVideoQuality(videoData, transcript)),
          business_relevance_score: this.calculateBusinessRelevance(transcript.text, videoData.title),
          status: 'processing'
        })
        .select('id')
        .single();

      if (contentError) {
        throw new Error(`Failed to store content item: ${contentError.message}`);
      }

      const contentId = contentItem.id;

      // Store YouTube-specific metadata
      const { error: metadataError } = await supabaseAdmin
        .from('youtube_content_metadata')
        .insert({
          content_id: contentId,
          video_id: videoData.videoId,
          youtube_url: `https://www.youtube.com/watch?v=${videoData.videoId}`,
          channel_id: videoData.channel,
          channel_name: videoData.channelName,
          video_title: videoData.title,
          video_description: videoData.description,
          video_duration: parseInt(videoData.duration),
          video_duration_formatted: videoData.durationFormatted,
          view_count: videoData.viewCount,
          like_count: 0,
          comment_count: 0,
          published_at: new Date(videoData.publishedAt),
          thumbnail_url: '',
          thumbnail_width: 0,
          thumbnail_height: 0,
          transcript_available: transcript.text.length > 0,
          transcript_word_count: transcript.wordCount,
          auto_generated_transcript: true, // Assume auto-generated for now
          chapters_detected: chapters.length > 0,
          chapter_count: chapters.length,
          chapters: chapters.length > 0 ? JSON.parse(JSON.stringify(chapters)) : null,
          include_transcript: options.includeTranscript !== false,
          include_comments: options.includeComments || false,
          max_comments: options.maxComments || 0,
          chapter_detection: options.chapterDetection || false,
          speaker_identification: options.speakerIdentification || false,
          timestamp_references: options.timestampReferences !== false,
          quality_setting: options.quality || 'high',
          youtube_api_calls: 1, // One call for video metadata
          quota_cost: 1 // Basic quota cost
        });

      if (metadataError) {
        console.error('Failed to store YouTube metadata:', metadataError);
        // Don't fail the entire process for metadata storage issues
      }

      return contentId;

    } catch (error) {
      console.error('Error storing YouTube content:', error);
      throw new Error(`Database storage failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async updateContentMetadata(
    contentId: string,
    frameworks: Array<{ name: string; confidence: number }>,
    chunkCount: number
  ): Promise<void> {
    try {
      // Update main content item
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

    } catch (error) {
      console.error('Error updating content metadata:', error);
    }
  }

  private calculateVideoQuality(
    videoData: YouTubeVideoData,
    transcript: { text: string; wordCount: number }
  ): number {
    let score = 50; // Base score

    // Duration quality (prefer 10-60 minute videos)
    const durationSeconds = parseInt(videoData.duration);
    if (durationSeconds >= 600 && durationSeconds <= 3600) {
      score += 20;
    } else if (durationSeconds >= 300) {
      score += 10;
    }

    // Engagement quality
    if (videoData.viewCount > 1000) score += 10;
    if (videoData.viewCount > 10000) score += 10;
    // Skip like count check since we don't have this data in simplified interface

    // Transcript quality
    if (transcript.wordCount > 500) score += 10;
    if (transcript.wordCount > 1500) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  private calculateBusinessRelevance(content: string, title: string): number {
    const combinedText = `${title} ${content}`.toLowerCase();
    
    const businessKeywords = [
      'business', 'strategy', 'marketing', 'sales', 'growth', 'scaling',
      'entrepreneur', 'revenue', 'profit', 'customer', 'value', 'offer'
    ];

    let relevanceScore = 0;
    for (const keyword of businessKeywords) {
      if (combinedText.includes(keyword)) {
        relevanceScore += 10;
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

  private parseDuration(isoDuration: string): number {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;

    return hours * 3600 + minutes * 60 + seconds;
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  private generateJobId(): string {
    return `youtube_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const youtubeProcessor = new YouTubeProcessor();