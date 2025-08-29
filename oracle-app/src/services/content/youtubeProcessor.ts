/**
 * Oracle YouTube Processor
 * Elena Execution - YouTube transcript extraction and business content analysis
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import { URL } from 'url';

// Types
import { 
  ContentItem, 
  ContentMetadata, 
  YouTubeMetadata,
  YouTubeTranscript,
  YouTubeComment,
  BusinessRelevanceScore,
  FrameworkReference,
  HormoziFramework,
  BusinessConcept,
  BusinessCategory
} from '../../types/content';

export interface YouTubeProcessingOptions {
  includeTranscript?: boolean;
  includeComments?: boolean;
  includeMetadata?: boolean;
  transcriptLanguage?: string;
  maxComments?: number;
  chapterDetection?: boolean;
  speakerIdentification?: boolean;
  timestampReferences?: boolean;
}

export interface VideoChapter {
  title: string;
  startTime: number;
  endTime: number;
  duration: number;
  transcript: string;
  concepts: string[];
  frameworks: FrameworkReference[];
}

export interface SpeakerSegment {
  speaker: string;
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
}

export interface TimestampReference {
  text: string;
  timestamp: string;
  startTime: number;
  context: string;
  relevance: number;
  frameworks: string[];
}

export class OracleYouTubeProcessor {
  private readonly YOUTUBE_API_KEY: string;
  private readonly YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
  private readonly DEFAULT_MAX_COMMENTS = 100;
  
  // Business framework keywords for video content detection
  private readonly FRAMEWORK_KEYWORDS: Record<HormoziFramework, string[]> = {
    'Grand Slam Offer': [
      'grand slam offer', 'irresistible offer', 'value proposition', 'offer stack',
      'guarantee', 'scarcity', 'urgency', 'bonuses', 'risk reversal', 'pricing strategy'
    ],
    'Core Four': [
      'core four', 'lead magnet', 'landing page', 'nurture sequence', 'sales process',
      'lead generation', 'conversion funnel', 'email marketing', 'follow up sequence'
    ],
    'Value Ladder': [
      'value ladder', 'product suite', 'upsell', 'cross-sell', 'customer journey',
      'ascension model', 'backend products', 'premium offers', 'price points'
    ],
    'LTV/CAC': [
      'lifetime value', 'customer acquisition cost', 'ltv cac ratio', 'unit economics',
      'retention rate', 'churn rate', 'payback period', 'customer metrics'
    ],
    'Scaling Systems': [
      'scaling systems', 'automation', 'delegation', 'systems thinking', 'processes',
      'operational excellence', 'team building', 'workflow optimization', 'scale'
    ],
    'Lead Generation': [
      'lead generation', 'traffic generation', 'lead magnets', 'content marketing',
      'paid advertising', 'organic reach', 'lead scoring', 'lead nurturing'
    ],
    'Customer Acquisition': [
      'customer acquisition', 'acquisition channels', 'conversion optimization',
      'funnel optimization', 'sales process', 'closing techniques', 'sales funnel'
    ],
    'Business Operations': [
      'business operations', 'operational efficiency', 'process improvement',
      'team management', 'project management', 'resource allocation', 'systems'
    ],
    'Revenue Optimization': [
      'revenue optimization', 'pricing strategy', 'profit margins', 'revenue streams',
      'monetization', 'financial modeling', 'growth hacking', 'profit maximization'
    ],
    'Team Building': [
      'team building', 'hiring', 'company culture', 'leadership development',
      'employee retention', 'performance management', 'organizational design'
    ]
  };

  private readonly BUSINESS_CATEGORIES: Record<BusinessCategory, string[]> = {
    'marketing': ['marketing', 'advertising', 'branding', 'promotion', 'campaign', 'brand'],
    'sales': ['sales', 'selling', 'closing', 'negotiation', 'prospecting', 'convert'],
    'operations': ['operations', 'processes', 'efficiency', 'automation', 'workflow', 'system'],
    'leadership': ['leadership', 'management', 'team', 'culture', 'vision', 'lead'],
    'finance': ['finance', 'revenue', 'profit', 'cost', 'budget', 'roi', 'money'],
    'strategy': ['strategy', 'planning', 'growth', 'competitive', 'positioning', 'plan'],
    'customer_experience': ['customer', 'experience', 'service', 'satisfaction', 'retention'],
    'product_development': ['product', 'development', 'innovation', 'features', 'roadmap'],
    'scaling': ['scaling', 'growth', 'expansion', 'scalability', 'systems', 'scale'],
    'optimization': ['optimization', 'improvement', 'performance', 'analytics', 'testing']
  };

  constructor(apiKey?: string) {
    this.YOUTUBE_API_KEY = apiKey || process.env.YOUTUBE_API_KEY || '';
    if (!this.YOUTUBE_API_KEY) {
      console.warn('YouTube API key not provided. Some features may be limited.');
    }
  }

  /**
   * Process a YouTube URL and extract content for Oracle ingestion
   */
  async processYouTubeUrl(
    url: string, 
    options: YouTubeProcessingOptions = {}
  ): Promise<ContentItem> {
    try {
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL format');
      }

      const videoData = await this.extractVideoData(videoId, options);
      const contentItem = await this.createContentItem(videoData, url);
      
      return contentItem;
    } catch (error) {
      throw new Error(`Failed to process YouTube URL ${url}: ${error}`);
    }
  }

  /**
   * Extract video ID from YouTube URL
   */
  private extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/.*[?&]v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Extract comprehensive video data including metadata and transcript
   */
  private async extractVideoData(
    videoId: string, 
    options: YouTubeProcessingOptions
  ): Promise<YouTubeMetadata & { 
    fullTranscript?: string;
    chapters?: VideoChapter[];
    speakers?: SpeakerSegment[];
    timestampReferences?: TimestampReference[];
  }> {
    const {
      includeTranscript = true,
      includeComments = false,
      includeMetadata = true,
      transcriptLanguage = 'en',
      maxComments = this.DEFAULT_MAX_COMMENTS,
      chapterDetection = true,
      speakerIdentification = false,
      timestampReferences = true
    } = options;

    // Get video metadata via API (if available) or scraping
    let metadata: YouTubeMetadata;
    if (this.YOUTUBE_API_KEY) {
      metadata = await this.getVideoMetadataAPI(videoId);
    } else {
      metadata = await this.scrapeVideoMetadata(videoId);
    }

    // Get transcript
    let fullTranscript = '';
    let chapters: VideoChapter[] = [];
    let speakers: SpeakerSegment[] = [];
    let timestampReferences: TimestampReference[] = [];

    if (includeTranscript) {
      const transcript = await this.extractTranscript(videoId, transcriptLanguage);
      fullTranscript = transcript.map(t => t.text).join(' ');

      if (chapterDetection) {
        chapters = await this.detectChapters(transcript, metadata);
      }

      if (speakerIdentification) {
        speakers = await this.identifySpeakers(transcript);
      }

      if (timestampReferences) {
        timestampReferences = this.generateTimestampReferences(transcript);
      }
    }

    // Get comments if requested
    let comments: YouTubeComment[] = [];
    if (includeComments) {
      comments = await this.extractComments(videoId, maxComments);
    }

    return {
      ...metadata,
      transcript: includeTranscript ? await this.extractTranscript(videoId, transcriptLanguage) : undefined,
      comments: includeComments ? comments : undefined,
      fullTranscript,
      chapters,
      speakers,
      timestampReferences
    };
  }

  /**
   * Get video metadata via YouTube API
   */
  private async getVideoMetadataAPI(videoId: string): Promise<YouTubeMetadata> {
    const url = `${this.YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${this.YOUTUBE_API_KEY}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json() as any;
    if (!data.items || data.items.length === 0) {
      throw new Error('Video not found or not accessible');
    }

    const video = data.items[0];
    const snippet = video.snippet;
    const statistics = video.statistics;
    const contentDetails = video.contentDetails;

    // Parse duration from ISO 8601 format (PT4M13S -> 253 seconds)
    const duration = this.parseDuration(contentDetails.duration);

    return {
      videoId,
      title: snippet.title,
      description: snippet.description,
      duration,
      publishedAt: new Date(snippet.publishedAt),
      channelName: snippet.channelTitle,
      channelId: snippet.channelId,
      viewCount: parseInt(statistics.viewCount || '0'),
      likeCount: parseInt(statistics.likeCount || '0'),
      thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.default?.url,
      tags: snippet.tags || []
    };
  }

  /**
   * Scrape video metadata from YouTube page
   */
  private async scrapeVideoMetadata(videoId: string): Promise<YouTubeMetadata> {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch video page: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract data from script tags
    const scripts = $('script').toArray();
    let videoData: any = {};

    for (const script of scripts) {
      const content = $(script).html();
      if (content && content.includes('var ytInitialData')) {
        try {
          const match = content.match(/var ytInitialData = ({.+?});/);
          if (match) {
            videoData = JSON.parse(match[1]);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    // Extract metadata from structured data
    const videoDetails = this.extractVideoDetailsFromPage(videoData);

    return {
      videoId,
      title: videoDetails.title || $('title').text().replace(' - YouTube', ''),
      description: videoDetails.description || '',
      duration: videoDetails.duration || 0,
      publishedAt: videoDetails.publishedAt || new Date(),
      channelName: videoDetails.channelName || '',
      channelId: videoDetails.channelId || '',
      viewCount: videoDetails.viewCount || 0,
      likeCount: videoDetails.likeCount || 0,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      tags: videoDetails.tags || []
    };
  }

  /**
   * Extract video details from YouTube page data
   */
  private extractVideoDetailsFromPage(data: any): Partial<YouTubeMetadata> {
    try {
      const contents = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents;
      if (!contents) return {};

      const videoDetails = contents[0]?.videoPrimaryInfoRenderer;
      const videoSecondary = contents[1]?.videoSecondaryInfoRenderer;

      return {
        title: videoDetails?.title?.runs?.[0]?.text,
        viewCount: parseInt(videoDetails?.viewCount?.videoViewCountRenderer?.viewCount?.simpleText?.replace(/[^\d]/g, '') || '0'),
        channelName: videoSecondary?.owner?.videoOwnerRenderer?.title?.runs?.[0]?.text,
        channelId: videoSecondary?.owner?.videoOwnerRenderer?.navigationEndpoint?.commandMetadata?.webCommandMetadata?.url?.split('/')[2]
      };
    } catch (e) {
      return {};
    }
  }

  /**
   * Extract transcript from YouTube video
   */
  private async extractTranscript(videoId: string, language = 'en'): Promise<YouTubeTranscript[]> {
    try {
      // Try to get transcript via YouTube's internal API
      const transcriptUrl = `https://www.youtube.com/api/timedtext?lang=${language}&v=${videoId}`;
      
      const response = await fetch(transcriptUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.ok) {
        const xmlText = await response.text();
        return this.parseTranscriptXML(xmlText);
      }

      // Fallback: scrape from video page
      return await this.scrapeTranscriptFromPage(videoId, language);
    } catch (error) {
      console.warn(`Failed to extract transcript for ${videoId}:`, error);
      return [];
    }
  }

  /**
   * Parse transcript XML from YouTube API
   */
  private parseTranscriptXML(xml: string): YouTubeTranscript[] {
    const transcript: YouTubeTranscript[] = [];
    
    try {
      const $ = cheerio.load(xml, { xmlMode: true });
      
      $('text').each((_, element) => {
        const $element = $(element);
        const start = parseFloat($element.attr('start') || '0');
        const duration = parseFloat($element.attr('dur') || '0');
        const text = $element.text().trim();

        if (text) {
          transcript.push({
            text: this.cleanTranscriptText(text),
            start,
            duration
          });
        }
      });
    } catch (e) {
      console.warn('Failed to parse transcript XML:', e);
    }

    return transcript;
  }

  /**
   * Scrape transcript from video page (fallback method)
   */
  private async scrapeTranscriptFromPage(videoId: string, language: string): Promise<YouTubeTranscript[]> {
    // This is a complex fallback that would require reverse engineering
    // YouTube's transcript loading mechanism. For now, return empty array.
    console.warn(`Transcript scraping from page not implemented for ${videoId}`);
    return [];
  }

  /**
   * Clean transcript text
   */
  private cleanTranscriptText(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\[.*?\]/g, '') // Remove [Music], [Applause], etc.
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract comments from video
   */
  private async extractComments(videoId: string, maxComments: number): Promise<YouTubeComment[]> {
    if (!this.YOUTUBE_API_KEY) {
      console.warn('YouTube API key required for comment extraction');
      return [];
    }

    try {
      const url = `${this.YOUTUBE_API_BASE}/commentThreads?part=snippet&videoId=${videoId}&maxResults=${Math.min(maxComments, 100)}&order=relevance&key=${this.YOUTUBE_API_KEY}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Comments API error: ${response.status}`);
      }

      const data = await response.json() as any;
      const comments: YouTubeComment[] = [];

      for (const item of data.items || []) {
        const snippet = item.snippet.topLevelComment.snippet;
        
        comments.push({
          id: item.id,
          text: snippet.textDisplay,
          author: snippet.authorDisplayName,
          likeCount: snippet.likeCount || 0,
          publishedAt: new Date(snippet.publishedAt)
        });
      }

      return comments;
    } catch (error) {
      console.warn(`Failed to extract comments for ${videoId}:`, error);
      return [];
    }
  }

  /**
   * Detect chapters in video transcript
   */
  private async detectChapters(
    transcript: YouTubeTranscript[], 
    metadata: YouTubeMetadata
  ): Promise<VideoChapter[]> {
    const chapters: VideoChapter[] = [];
    
    // Look for chapter markers in description
    const descriptionChapters = this.extractChaptersFromDescription(metadata.description);
    
    if (descriptionChapters.length > 0) {
      // Use description-based chapters
      for (let i = 0; i < descriptionChapters.length; i++) {
        const chapter = descriptionChapters[i];
        const nextChapter = descriptionChapters[i + 1];
        
        const startTime = chapter.startTime;
        const endTime = nextChapter ? nextChapter.startTime : metadata.duration;
        
        const chapterTranscript = transcript
          .filter(t => t.start >= startTime && t.start < endTime)
          .map(t => t.text)
          .join(' ');

        const frameworks = this.detectFrameworksInText(chapterTranscript);
        const concepts = this.extractConceptsFromText(chapterTranscript);

        chapters.push({
          title: chapter.title,
          startTime,
          endTime,
          duration: endTime - startTime,
          transcript: chapterTranscript,
          concepts,
          frameworks
        });
      }
    } else {
      // Auto-detect chapters based on content changes
      chapters.push(...this.autoDetectChapters(transcript, metadata.duration));
    }

    return chapters;
  }

  /**
   * Extract chapters from video description
   */
  private extractChaptersFromDescription(description: string): Array<{title: string; startTime: number}> {
    const chapters: Array<{title: string; startTime: number}> = [];
    const lines = description.split('\n');

    for (const line of lines) {
      // Match timestamps like "0:00", "1:23", "12:34:56"
      const match = line.match(/^(\d{1,2}:)?(\d{1,2}):(\d{2})\s+(.+)$/);
      if (match) {
        const [, hours, minutes, seconds, title] = match;
        const startTime = (hours ? parseInt(hours.replace(':', '')) * 3600 : 0) + 
                         parseInt(minutes) * 60 + 
                         parseInt(seconds);
        
        chapters.push({
          title: title.trim(),
          startTime
        });
      }
    }

    return chapters.sort((a, b) => a.startTime - b.startTime);
  }

  /**
   * Auto-detect chapters based on content analysis
   */
  private autoDetectChapters(transcript: YouTubeTranscript[], totalDuration: number): VideoChapter[] {
    const chapters: VideoChapter[] = [];
    const segmentDuration = Math.max(300, totalDuration / 10); // At least 5 minutes per segment

    for (let i = 0; i * segmentDuration < totalDuration; i++) {
      const startTime = i * segmentDuration;
      const endTime = Math.min((i + 1) * segmentDuration, totalDuration);
      
      const segmentTranscript = transcript
        .filter(t => t.start >= startTime && t.start < endTime)
        .map(t => t.text)
        .join(' ');

      if (segmentTranscript.trim()) {
        const frameworks = this.detectFrameworksInText(segmentTranscript);
        const concepts = this.extractConceptsFromText(segmentTranscript);
        const title = this.generateChapterTitle(segmentTranscript, frameworks);

        chapters.push({
          title,
          startTime,
          endTime,
          duration: endTime - startTime,
          transcript: segmentTranscript,
          concepts,
          frameworks
        });
      }
    }

    return chapters;
  }

  /**
   * Generate chapter title based on content
   */
  private generateChapterTitle(text: string, frameworks: FrameworkReference[]): string {
    if (frameworks.length > 0) {
      return `${frameworks[0].framework} Discussion`;
    }

    // Extract key phrases for title
    const words = text.toLowerCase().split(' ');
    const keyWords = words.filter(word => 
      word.length > 4 && 
      !this.isStopWord(word) &&
      (this.isBusinessTerm(word) || this.isActionWord(word))
    );

    if (keyWords.length > 0) {
      return keyWords.slice(0, 3).map(w => 
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(' ') + ' Segment';
    }

    return 'Content Segment';
  }

  /**
   * Identify speakers in transcript (basic implementation)
   */
  private async identifySpeakers(transcript: YouTubeTranscript[]): Promise<SpeakerSegment[]> {
    // This is a simplified speaker identification
    // In a real implementation, you'd use audio analysis or pattern recognition
    
    const segments: SpeakerSegment[] = [];
    let currentSpeaker = 'Speaker 1';
    let segmentStart = 0;
    let segmentText = '';

    for (let i = 0; i < transcript.length; i++) {
      const current = transcript[i];
      segmentText += ' ' + current.text;

      // Simple heuristics for speaker change detection
      const isQuestionBoundary = current.text.includes('?') && 
                                transcript[i + 1]?.text.toLowerCase().startsWith('yes') ||
                                transcript[i + 1]?.text.toLowerCase().startsWith('no') ||
                                transcript[i + 1]?.text.toLowerCase().startsWith('well');

      const isLongPause = transcript[i + 1] && 
                         (transcript[i + 1].start - (current.start + current.duration)) > 2;

      if (isQuestionBoundary || isLongPause || i === transcript.length - 1) {
        segments.push({
          speaker: currentSpeaker,
          startTime: segmentStart,
          endTime: current.start + current.duration,
          text: segmentText.trim(),
          confidence: 0.6 // Low confidence for this simple method
        });

        // Switch speaker
        currentSpeaker = currentSpeaker === 'Speaker 1' ? 'Speaker 2' : 'Speaker 1';
        segmentStart = transcript[i + 1]?.start || current.start + current.duration;
        segmentText = '';
      }
    }

    return segments;
  }

  /**
   * Generate timestamp references for important content
   */
  private generateTimestampReferences(transcript: YouTubeTranscript[]): TimestampReference[] {
    const references: TimestampReference[] = [];

    for (const segment of transcript) {
      const text = segment.text.toLowerCase();
      
      // Look for framework mentions
      const frameworks = this.detectFrameworksInText(text);
      
      if (frameworks.length > 0) {
        const timestamp = this.formatTimestamp(segment.start);
        
        references.push({
          text: segment.text,
          timestamp,
          startTime: segment.start,
          context: this.getContextAroundSegment(transcript, segment),
          relevance: frameworks[0].confidence,
          frameworks: frameworks.map(f => f.framework)
        });
      }

      // Look for key business concepts
      const hasKeywords = this.BUSINESS_CATEGORIES.marketing
        .concat(this.BUSINESS_CATEGORIES.sales)
        .concat(this.BUSINESS_CATEGORIES.strategy)
        .some(keyword => text.includes(keyword));

      if (hasKeywords && references.length < 50) {
        const timestamp = this.formatTimestamp(segment.start);
        
        references.push({
          text: segment.text,
          timestamp,
          startTime: segment.start,
          context: this.getContextAroundSegment(transcript, segment),
          relevance: 0.7,
          frameworks: []
        });
      }
    }

    return references
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 20); // Top 20 most relevant references
  }

  /**
   * Get context around a transcript segment
   */
  private getContextAroundSegment(transcript: YouTubeTranscript[], target: YouTubeTranscript): string {
    const index = transcript.findIndex(t => t === target);
    const contextRadius = 2;
    
    const start = Math.max(0, index - contextRadius);
    const end = Math.min(transcript.length, index + contextRadius + 1);
    
    return transcript.slice(start, end).map(t => t.text).join(' ');
  }

  /**
   * Format seconds to timestamp string
   */
  private formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Create ContentItem from YouTube data
   */
  private async createContentItem(
    videoData: YouTubeMetadata & { 
      fullTranscript?: string;
      chapters?: VideoChapter[];
      timestampReferences?: TimestampReference[];
    }, 
    url: string
  ): Promise<ContentItem> {
    const content = videoData.fullTranscript || videoData.description;
    const contentMetadata = await this.analyzeVideoContent(videoData, content);
    const businessRelevance = this.calculateBusinessRelevance(content);
    
    const contentItem: ContentItem = {
      id: `youtube_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: videoData.title,
      type: 'youtube',
      source: url,
      uploadedAt: new Date(),
      status: 'processing',
      progress: 0,
      metadata: {
        ...contentMetadata,
        wordCount: content.split(' ').length,
        characterCount: content.length,
        language: 'en', // Could be detected from transcript
        author: videoData.channelName,
        createdDate: videoData.publishedAt,
        extractedText: content.substring(0, 1000), // Preview
        businessRelevance,
        youtubeMetadata: {
          videoId: videoData.videoId,
          channelId: videoData.channelId,
          duration: videoData.duration,
          viewCount: videoData.viewCount,
          likeCount: videoData.likeCount,
          thumbnailUrl: videoData.thumbnailUrl,
          tags: videoData.tags,
          chapters: videoData.chapters,
          timestampReferences: videoData.timestampReferences
        }
      }
    };

    return contentItem;
  }

  /**
   * Analyze video content for framework detection and quality assessment
   */
  private async analyzeVideoContent(
    videoData: YouTubeMetadata & { fullTranscript?: string },
    content: string
  ): Promise<ContentMetadata> {
    const frameworks = this.detectFrameworksInText(content);
    const businessConcepts = this.extractBusinessConceptsFromText(content);
    const quality = this.assessVideoQuality(videoData, content);
    
    return {
      wordCount: content.split(' ').length,
      characterCount: content.length,
      quality,
      language: 'en',
      author: videoData.channelName,
      createdDate: videoData.publishedAt,
      extractedText: content,
      summary: this.generateVideoSummary(content, videoData),
      framework: frameworks.map(f => f.framework),
      keywords: this.extractKeywords(content),
      businessConcepts
    };
  }

  /**
   * Detect frameworks in text content
   */
  private detectFrameworksInText(text: string): FrameworkReference[] {
    const frameworks: FrameworkReference[] = [];
    const lowerText = text.toLowerCase();

    Object.entries(this.FRAMEWORK_KEYWORDS).forEach(([framework, keywords]) => {
      const matches = keywords.filter(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );

      if (matches.length > 0) {
        const confidence = Math.min(matches.length / keywords.length, 1);
        
        frameworks.push({
          framework: framework as HormoziFramework,
          confidence,
          context: this.extractFrameworkContext(lowerText, matches[0]),
          explanation: `Detected through keywords: ${matches.join(', ')}`,
          relatedConcepts: matches
        });
      }
    });

    return frameworks.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Extract framework context from text
   */
  private extractFrameworkContext(text: string, keyword: string): string {
    const index = text.indexOf(keyword);
    if (index === -1) return '';

    const start = Math.max(0, index - 100);
    const end = Math.min(text.length, index + keyword.length + 100);
    
    return text.substring(start, end).trim();
  }

  /**
   * Extract business concepts from text
   */
  private extractBusinessConceptsFromText(text: string): BusinessConcept[] {
    const concepts: BusinessConcept[] = [];
    const lowerText = text.toLowerCase();

    Object.entries(this.BUSINESS_CATEGORIES).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        const matches = lowerText.match(regex);
        
        if (matches && matches.length > 0) {
          const importance = Math.min(matches.length / 5, 1);
          const context = this.extractFrameworkContext(lowerText, keyword);
          
          concepts.push({
            concept: keyword,
            category: category as BusinessCategory,
            importance,
            context,
            relatedFrameworks: this.getRelatedFrameworks(keyword)
          });
        }
      });
    });

    return concepts.sort((a, b) => b.importance - a.importance).slice(0, 15);
  }

  /**
   * Get related frameworks for a keyword
   */
  private getRelatedFrameworks(keyword: string): HormoziFramework[] {
    const related: HormoziFramework[] = [];

    Object.entries(this.FRAMEWORK_KEYWORDS).forEach(([framework, keywords]) => {
      if (keywords.some(k => k.includes(keyword) || keyword.includes(k))) {
        related.push(framework as HormoziFramework);
      }
    });

    return related;
  }

  /**
   * Extract concepts from text segment
   */
  private extractConceptsFromText(text: string): string[] {
    const concepts: string[] = [];
    const lowerText = text.toLowerCase();

    // Extract business terms
    Object.values(this.BUSINESS_CATEGORIES).flat().forEach(term => {
      if (lowerText.includes(term)) {
        concepts.push(term);
      }
    });

    return [...new Set(concepts)].slice(0, 10);
  }

  /**
   * Extract keywords from content
   */
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));

    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([word]) => word);
  }

  /**
   * Check if word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'cannot', 'be', 'am', 'is', 'are', 'was', 'were',
      'been', 'being', 'get', 'got', 'go', 'went', 'come', 'came', 'see', 'saw', 'know'
    ]);
    
    return stopWords.has(word.toLowerCase());
  }

  /**
   * Check if word is a business term
   */
  private isBusinessTerm(word: string): boolean {
    return Object.values(this.BUSINESS_CATEGORIES)
      .flat()
      .some(term => term.includes(word) || word.includes(term));
  }

  /**
   * Check if word is an action word
   */
  private isActionWord(word: string): boolean {
    const actionWords = [
      'build', 'create', 'develop', 'implement', 'execute', 'optimize', 'improve',
      'scale', 'grow', 'increase', 'maximize', 'generate', 'convert', 'acquire'
    ];
    
    return actionWords.some(action => word.includes(action));
  }

  /**
   * Assess video content quality
   */
  private assessVideoQuality(
    videoData: YouTubeMetadata & { fullTranscript?: string },
    content: string
  ): number {
    let score = 50; // Base score

    // Duration factor (optimal range: 10-45 minutes)
    const durationMinutes = videoData.duration / 60;
    if (durationMinutes >= 10 && durationMinutes <= 45) {
      score += 20;
    } else if (durationMinutes >= 5) {
      score += 10;
    } else if (durationMinutes < 2) {
      score -= 15;
    }

    // View count factor
    if (videoData.viewCount > 10000) {
      score += 15;
    } else if (videoData.viewCount > 1000) {
      score += 10;
    }

    // Like ratio (if available)
    if (videoData.likeCount > 0 && videoData.viewCount > 0) {
      const likeRatio = videoData.likeCount / videoData.viewCount;
      if (likeRatio > 0.02) {
        score += 10;
      } else if (likeRatio > 0.01) {
        score += 5;
      }
    }

    // Content length and structure
    if (content.length > 5000) {
      score += 10;
    } else if (content.length > 2000) {
      score += 5;
    }

    // Recency
    const daysSincePublished = Math.floor(
      (Date.now() - videoData.publishedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSincePublished <= 365) {
      score += 10;
    } else if (daysSincePublished <= 1095) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate video summary
   */
  private generateVideoSummary(content: string, videoData: YouTubeMetadata): string {
    const summary = content.substring(0, 300);
    const duration = this.formatTimestamp(videoData.duration);
    
    return `${videoData.title} (${duration}) - ${summary}${content.length > 300 ? '...' : ''}`;
  }

  /**
   * Calculate business relevance score
   */
  private calculateBusinessRelevance(content: string): BusinessRelevanceScore {
    const lowerContent = content.toLowerCase();
    
    // Calculate framework relevance
    const frameworkRelevance = {
      grandSlamOffer: this.calculateFrameworkScore(lowerContent, 'Grand Slam Offer'),
      coreFour: this.calculateFrameworkScore(lowerContent, 'Core Four'),
      valueLadder: this.calculateFrameworkScore(lowerContent, 'Value Ladder'),
      ltvCac: this.calculateFrameworkScore(lowerContent, 'LTV/CAC'),
      scalingSystems: this.calculateFrameworkScore(lowerContent, 'Scaling Systems')
    };

    // Calculate topic categories
    const topicCategories = {
      marketing: this.calculateCategoryScore(lowerContent, 'marketing'),
      sales: this.calculateCategoryScore(lowerContent, 'sales'),
      operations: this.calculateCategoryScore(lowerContent, 'operations'),
      leadership: this.calculateCategoryScore(lowerContent, 'leadership'),
      finance: this.calculateCategoryScore(lowerContent, 'finance'),
      strategy: this.calculateCategoryScore(lowerContent, 'strategy')
    };

    // Calculate overall score
    const frameworkAvg = Object.values(frameworkRelevance).reduce((a, b) => a + b, 0) / 5;
    const topicAvg = Object.values(topicCategories).reduce((a, b) => a + b, 0) / 6;
    const overallScore = (frameworkAvg + topicAvg) / 2;

    return {
      overallScore: Math.round(overallScore),
      frameworkRelevance,
      topicCategories
    };
  }

  /**
   * Calculate framework-specific relevance score
   */
  private calculateFrameworkScore(text: string, framework: HormoziFramework): number {
    const keywords = this.FRAMEWORK_KEYWORDS[framework] || [];
    const matches = keywords.filter(keyword => text.includes(keyword.toLowerCase()));
    
    return Math.round((matches.length / keywords.length) * 100);
  }

  /**
   * Calculate category-specific relevance score
   */
  private calculateCategoryScore(text: string, category: BusinessCategory): number {
    const keywords = this.BUSINESS_CATEGORIES[category] || [];
    const matches = keywords.filter(keyword => text.includes(keyword.toLowerCase()));
    
    return Math.round((matches.length / keywords.length) * 100);
  }

  /**
   * Parse ISO 8601 duration to seconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    return hours * 3600 + minutes * 60 + seconds;
  }
}