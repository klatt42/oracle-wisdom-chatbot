/**
 * Universal Oracle Content Processor
 * Alice Intelligence - Unified content processing system for all Oracle content types
 * Routes, processes, and standardizes content from files, URLs, and YouTube videos
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

// Content Processors
import { OracleUrlProcessor } from './urlProcessor';
import { OracleYouTubeProcessor } from './youtubeProcessor';

// Embedding and Storage Services
import { OracleEmbeddingService } from './embeddingService';
import { OracleStorageService } from './storageService';
import { OracleChunkingService } from './chunkingService';

// Types
import { 
  ContentItem, 
  ContentType,
  ProcessingStatus,
  ProcessingResult,
  ContentChunk,
  EmbeddingVector,
  ContentMetadata,
  BusinessRelevanceScore,
  FrameworkReference,
  HormoziFramework,
  BusinessConcept,
  ProcessingStep,
  ProcessingError,
  ProcessingWarning,
  ProcessingRecommendation,
  ProcessingStatistics
} from '../../types/content';

export interface ContentProcessingOptions {
  chunkSize?: number;
  overlapSize?: number;
  quality?: 'fast' | 'standard' | 'high';
  extractFrameworks?: boolean;
  generateSummary?: boolean;
  generateEmbeddings?: boolean;
  validateContent?: boolean;
  preserveFormatting?: boolean;
  batchSize?: number;
  maxRetries?: number;
}

export interface ProcessingPipeline {
  id: string;
  name: string;
  contentType: ContentType;
  stages: ProcessingStage[];
  qualityThresholds: QualityThresholds;
}

export interface ProcessingStage {
  name: string;
  processor: string;
  options: any;
  required: boolean;
  dependencies?: string[];
  timeout?: number;
}

export interface QualityThresholds {
  minimumWordCount: number;
  minimumQuality: number;
  maximumProcessingTime: number;
  requiredFrameworks?: HormoziFramework[];
  businessRelevanceThreshold: number;
}

export interface UnifiedContentResult {
  contentItem: ContentItem;
  chunks: ContentChunk[];
  embeddings: EmbeddingVector[];
  processingResult: ProcessingResult;
  qualityMetrics: QualityMetrics;
  recommendations: ProcessingRecommendation[];
}

export interface QualityMetrics {
  overallScore: number;
  contentQuality: number;
  businessRelevance: number;
  frameworkAlignment: number;
  technicalQuality: number;
  userEngagement?: number;
  sourceCredibility: number;
}

export interface ContentUpdateEvent {
  contentId: string;
  status: ProcessingStatus;
  progress: number;
  stage?: string;
  message?: string;
  error?: ProcessingError;
  metrics?: Partial<QualityMetrics>;
}

export class UniversalContentProcessor extends EventEmitter {
  private urlProcessor: OracleUrlProcessor;
  private youtubeProcessor: OracleYouTubeProcessor;
  private embeddingService: OracleEmbeddingService;
  private storageService: OracleStorageService;
  private chunkingService: OracleChunkingService;

  private processingQueue: Map<string, ContentItem> = new Map();
  private processingStatus: Map<string, ContentUpdateEvent> = new Map();
  private processingPipelines: Map<ContentType, ProcessingPipeline> = new Map();
  
  private readonly DEFAULT_OPTIONS: ContentProcessingOptions = {
    chunkSize: 1000,
    overlapSize: 200,
    quality: 'standard',
    extractFrameworks: true,
    generateSummary: true,
    generateEmbeddings: true,
    validateContent: true,
    preserveFormatting: false,
    batchSize: 10,
    maxRetries: 3
  };

  constructor() {
    super();
    this.initializeServices();
    this.setupProcessingPipelines();
  }

  /**
   * Initialize all content processing services
   */
  private initializeServices(): void {
    this.urlProcessor = new OracleUrlProcessor();
    this.youtubeProcessor = new OracleYouTubeProcessor(process.env.YOUTUBE_API_KEY);
    this.embeddingService = new OracleEmbeddingService();
    this.storageService = new OracleStorageService();
    this.chunkingService = new OracleChunkingService();
  }

  /**
   * Setup processing pipelines for different content types
   */
  private setupProcessingPipelines(): void {
    // URL Processing Pipeline
    this.processingPipelines.set('url', {
      id: 'url-pipeline',
      name: 'Web Content Processing',
      contentType: 'url',
      stages: [
        {
          name: 'content-extraction',
          processor: 'urlProcessor',
          options: { extractImages: false, followRedirects: true },
          required: true,
          timeout: 30000
        },
        {
          name: 'content-validation',
          processor: 'contentValidator',
          options: { checkQuality: true, validateStructure: true },
          required: true,
          dependencies: ['content-extraction']
        },
        {
          name: 'framework-detection',
          processor: 'frameworkDetector',
          options: { confidence: 0.7 },
          required: false,
          dependencies: ['content-validation']
        },
        {
          name: 'content-chunking',
          processor: 'chunkingService',
          options: { chunkSize: 1000, overlapSize: 200 },
          required: true,
          dependencies: ['content-validation']
        },
        {
          name: 'embedding-generation',
          processor: 'embeddingService',
          options: { model: 'text-embedding-ada-002' },
          required: true,
          dependencies: ['content-chunking']
        },
        {
          name: 'storage-persistence',
          processor: 'storageService',
          options: { index: true, backup: true },
          required: true,
          dependencies: ['embedding-generation']
        }
      ],
      qualityThresholds: {
        minimumWordCount: 200,
        minimumQuality: 60,
        maximumProcessingTime: 120000,
        businessRelevanceThreshold: 40
      }
    });

    // YouTube Processing Pipeline
    this.processingPipelines.set('youtube', {
      id: 'youtube-pipeline',
      name: 'YouTube Content Processing',
      contentType: 'youtube',
      stages: [
        {
          name: 'video-extraction',
          processor: 'youtubeProcessor',
          options: { 
            includeTranscript: true, 
            chapterDetection: true,
            timestampReferences: true 
          },
          required: true,
          timeout: 60000
        },
        {
          name: 'transcript-validation',
          processor: 'contentValidator',
          options: { checkTranscriptQuality: true },
          required: true,
          dependencies: ['video-extraction']
        },
        {
          name: 'chapter-analysis',
          processor: 'chapterAnalyzer',
          options: { extractConcepts: true },
          required: false,
          dependencies: ['transcript-validation']
        },
        {
          name: 'framework-detection',
          processor: 'frameworkDetector',
          options: { confidence: 0.6, contextWindow: 500 },
          required: false,
          dependencies: ['transcript-validation']
        },
        {
          name: 'content-chunking',
          processor: 'chunkingService',
          options: { 
            chunkSize: 1200, 
            overlapSize: 300,
            preserveTimestamps: true 
          },
          required: true,
          dependencies: ['transcript-validation']
        },
        {
          name: 'embedding-generation',
          processor: 'embeddingService',
          options: { model: 'text-embedding-ada-002' },
          required: true,
          dependencies: ['content-chunking']
        },
        {
          name: 'storage-persistence',
          processor: 'storageService',
          options: { 
            index: true, 
            backup: true,
            preserveTimestamps: true 
          },
          required: true,
          dependencies: ['embedding-generation']
        }
      ],
      qualityThresholds: {
        minimumWordCount: 500,
        minimumQuality: 50,
        maximumProcessingTime: 300000,
        businessRelevanceThreshold: 35
      }
    });

    // File Processing Pipeline (generic for PDF, DOCX, TXT, MD)
    ['pdf', 'docx', 'txt', 'md'].forEach(type => {
      this.processingPipelines.set(type as ContentType, {
        id: `${type}-pipeline`,
        name: `${type.toUpperCase()} File Processing`,
        contentType: type as ContentType,
        stages: [
          {
            name: 'file-extraction',
            processor: 'fileProcessor',
            options: { preserveFormatting: type === 'md' },
            required: true,
            timeout: 45000
          },
          {
            name: 'content-validation',
            processor: 'contentValidator',
            options: { checkStructure: true, validateEncoding: true },
            required: true,
            dependencies: ['file-extraction']
          },
          {
            name: 'framework-detection',
            processor: 'frameworkDetector',
            options: { confidence: 0.8 },
            required: false,
            dependencies: ['content-validation']
          },
          {
            name: 'content-chunking',
            processor: 'chunkingService',
            options: { 
              chunkSize: 800, 
              overlapSize: 150,
              respectParagraphs: true 
            },
            required: true,
            dependencies: ['content-validation']
          },
          {
            name: 'embedding-generation',
            processor: 'embeddingService',
            options: { model: 'text-embedding-ada-002' },
            required: true,
            dependencies: ['content-chunking']
          },
          {
            name: 'storage-persistence',
            processor: 'storageService',
            options: { index: true, backup: true },
            required: true,
            dependencies: ['embedding-generation']
          }
        ],
        qualityThresholds: {
          minimumWordCount: 100,
          minimumQuality: 70,
          maximumProcessingTime: 180000,
          businessRelevanceThreshold: 30
        }
      });
    });
  }

  /**
   * Process content item through universal pipeline
   */
  async processContent(
    contentItem: ContentItem,
    options: ContentProcessingOptions = {}
  ): Promise<UnifiedContentResult> {
    const mergedOptions = { ...this.DEFAULT_OPTIONS, ...options };
    const pipeline = this.processingPipelines.get(contentItem.type);
    
    if (!pipeline) {
      throw new Error(`No processing pipeline found for content type: ${contentItem.type}`);
    }

    // Initialize processing status
    const processingId = contentItem.id;
    this.processingQueue.set(processingId, contentItem);
    this.updateProcessingStatus(processingId, {
      contentId: processingId,
      status: 'processing',
      progress: 0,
      stage: 'initialization',
      message: 'Starting content processing pipeline'
    });

    const processingSteps: ProcessingStep[] = [];
    const errors: ProcessingError[] = [];
    const warnings: ProcessingWarning[] = [];
    const recommendations: ProcessingRecommendation[] = [];

    let processedContent: string = '';
    let chunks: ContentChunk[] = [];
    let embeddings: EmbeddingVector[] = [];
    let qualityMetrics: QualityMetrics;

    try {
      // Execute pipeline stages
      for (let i = 0; i < pipeline.stages.length; i++) {
        const stage = pipeline.stages[i];
        const progress = ((i + 1) / pipeline.stages.length) * 100;

        this.updateProcessingStatus(processingId, {
          contentId: processingId,
          status: 'processing',
          progress: Math.round(progress * 0.8), // Reserve 20% for final steps
          stage: stage.name,
          message: `Executing ${stage.name}`
        });

        const stepResult = await this.executeProcessingStage(
          stage,
          contentItem,
          { processedContent, chunks, embeddings },
          mergedOptions
        );

        processingSteps.push({
          step: stage.name,
          status: stepResult.success ? 'completed' : 'error',
          startTime: stepResult.startTime,
          endTime: stepResult.endTime,
          duration: stepResult.duration,
          details: stepResult.details
        });

        if (!stepResult.success && stage.required) {
          throw new Error(`Required stage ${stage.name} failed: ${stepResult.error}`);
        }

        // Update results based on stage
        if (stepResult.content) processedContent = stepResult.content;
        if (stepResult.chunks) chunks = stepResult.chunks;
        if (stepResult.embeddings) embeddings = stepResult.embeddings;

        errors.push(...(stepResult.errors || []));
        warnings.push(...(stepResult.warnings || []));
      }

      // Generate quality metrics
      qualityMetrics = await this.calculateQualityMetrics(
        contentItem,
        processedContent,
        chunks,
        pipeline.qualityThresholds
      );

      // Generate recommendations
      recommendations.push(
        ...this.generateRecommendations(qualityMetrics, pipeline.qualityThresholds)
      );

      // Validate against quality thresholds
      this.validateQualityThresholds(qualityMetrics, pipeline.qualityThresholds);

      // Update final processing status
      this.updateProcessingStatus(processingId, {
        contentId: processingId,
        status: 'completed',
        progress: 100,
        stage: 'completed',
        message: 'Content processing completed successfully',
        metrics: qualityMetrics
      });

      // Update content item
      const updatedContentItem = await this.updateContentItem(contentItem, {
        status: 'completed',
        progress: 100,
        processedAt: new Date(),
        metadata: {
          ...contentItem.metadata,
          extractedChunks: chunks.length,
          embeddings: embeddings.length,
          quality: qualityMetrics.overallScore,
          businessRelevance: qualityMetrics.businessRelevance
        }
      });

      const processingResult: ProcessingResult = {
        success: true,
        contentId: processingId,
        processingTime: processingSteps.reduce((sum, step) => sum + (step.duration || 0), 0),
        statistics: {
          originalSize: contentItem.metadata?.characterCount || 0,
          processedSize: processedContent.length,
          chunksCreated: chunks.length,
          embeddingsGenerated: embeddings.length,
          frameworksDetected: this.countDetectedFrameworks(updatedContentItem),
          qualityScore: qualityMetrics.overallScore,
          businessRelevanceScore: qualityMetrics.businessRelevance,
          processingSteps
        },
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined
      };

      return {
        contentItem: updatedContentItem,
        chunks,
        embeddings,
        processingResult,
        qualityMetrics,
        recommendations
      };

    } catch (error) {
      // Handle processing failure
      this.updateProcessingStatus(processingId, {
        contentId: processingId,
        status: 'error',
        progress: 0,
        stage: 'error',
        message: `Processing failed: ${error}`,
        error: {
          code: 'PROCESSING_FAILED',
          message: error instanceof Error ? error.message : String(error),
          severity: 'critical'
        }
      });

      const updatedContentItem = await this.updateContentItem(contentItem, {
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      });

      throw new Error(`Content processing failed for ${processingId}: ${error}`);
    } finally {
      this.processingQueue.delete(processingId);
    }
  }

  /**
   * Execute a single processing stage
   */
  private async executeProcessingStage(
    stage: ProcessingStage,
    contentItem: ContentItem,
    currentState: {
      processedContent: string;
      chunks: ContentChunk[];
      embeddings: EmbeddingVector[];
    },
    options: ContentProcessingOptions
  ): Promise<{
    success: boolean;
    content?: string;
    chunks?: ContentChunk[];
    embeddings?: EmbeddingVector[];
    startTime: Date;
    endTime: Date;
    duration: number;
    details?: any;
    error?: string;
    errors?: ProcessingError[];
    warnings?: ProcessingWarning[];
  }> {
    const startTime = new Date();
    const errors: ProcessingError[] = [];
    const warnings: ProcessingWarning[] = [];

    try {
      let result: any;

      switch (stage.processor) {
        case 'urlProcessor':
          result = await this.urlProcessor.processUrl(contentItem.source, stage.options);
          break;

        case 'youtubeProcessor':
          result = await this.youtubeProcessor.processYouTubeUrl(contentItem.source, stage.options);
          break;

        case 'contentValidator':
          result = await this.validateContent(currentState.processedContent || contentItem.metadata?.extractedText || '', stage.options);
          break;

        case 'frameworkDetector':
          result = await this.detectFrameworks(currentState.processedContent, stage.options);
          break;

        case 'chunkingService':
          result = await this.chunkingService.chunkContent(
            currentState.processedContent,
            {
              chunkSize: stage.options.chunkSize || options.chunkSize,
              overlapSize: stage.options.overlapSize || options.overlapSize,
              contentId: contentItem.id,
              ...stage.options
            }
          );
          break;

        case 'embeddingService':
          result = await this.embeddingService.generateEmbeddings(
            currentState.chunks,
            stage.options
          );
          break;

        case 'storageService':
          result = await this.storageService.storeContent(
            contentItem,
            currentState.chunks,
            currentState.embeddings,
            stage.options
          );
          break;

        default:
          throw new Error(`Unknown processor: ${stage.processor}`);
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      return {
        success: true,
        ...result,
        startTime,
        endTime,
        duration,
        errors,
        warnings
      };

    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      errors.push({
        code: 'STAGE_EXECUTION_ERROR',
        message: error instanceof Error ? error.message : String(error),
        step: stage.name,
        severity: stage.required ? 'critical' : 'medium'
      });

      return {
        success: false,
        startTime,
        endTime,
        duration,
        error: error instanceof Error ? error.message : String(error),
        errors,
        warnings
      };
    }
  }

  /**
   * Route content to appropriate processor based on type
   */
  async routeContent(contentType: ContentType, source: string, options: any = {}): Promise<ContentItem> {
    switch (contentType) {
      case 'url':
        return await this.urlProcessor.processUrl(source, options);
      
      case 'youtube':
        return await this.youtubeProcessor.processYouTubeUrl(source, options);
      
      case 'pdf':
      case 'docx':
      case 'txt':
      case 'md':
        // File processing would be handled by a file processor
        // For now, create a basic content item structure
        return this.createBasicContentItem(contentType, source);
      
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }
  }

  /**
   * Create basic content item structure
   */
  private createBasicContentItem(type: ContentType, source: string): ContentItem {
    return {
      id: uuidv4(),
      title: `${type.toUpperCase()} Content: ${source}`,
      type,
      source,
      uploadedAt: new Date(),
      status: 'processing',
      progress: 0,
      metadata: {
        wordCount: 0,
        characterCount: 0,
        quality: 0,
        businessRelevance: {
          overallScore: 0,
          frameworkRelevance: {
            grandSlamOffer: 0,
            coreFour: 0,
            valueLadder: 0,
            ltvCac: 0,
            scalingSystems: 0
          },
          topicCategories: {
            marketing: 0,
            sales: 0,
            operations: 0,
            leadership: 0,
            finance: 0,
            strategy: 0
          }
        }
      }
    };
  }

  /**
   * Validate content quality and structure
   */
  private async validateContent(content: string, options: any): Promise<{
    isValid: boolean;
    quality: number;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let quality = 100;

    // Word count validation
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 100) {
      issues.push('Content too short (less than 100 words)');
      quality -= 30;
    }

    // Character encoding validation
    if (!/^[\x00-\x7F]*$/.test(content) && content.includes('�')) {
      issues.push('Encoding issues detected');
      quality -= 20;
    }

    // Structure validation
    const hasStructure = content.includes('\n\n') || content.includes('. ');
    if (!hasStructure) {
      issues.push('Poor content structure detected');
      quality -= 15;
      recommendations.push('Consider improving content formatting');
    }

    // Business relevance check
    const businessTerms = ['business', 'marketing', 'sales', 'revenue', 'customer', 'strategy'];
    const hasBusinessTerms = businessTerms.some(term => 
      content.toLowerCase().includes(term)
    );

    if (!hasBusinessTerms) {
      issues.push('Limited business relevance detected');
      quality -= 25;
      recommendations.push('Ensure content contains business-relevant information');
    }

    return {
      isValid: issues.length === 0,
      quality: Math.max(0, quality),
      issues,
      recommendations
    };
  }

  /**
   * Detect business frameworks in content
   */
  private async detectFrameworks(content: string, options: any): Promise<{
    frameworks: FrameworkReference[];
    confidence: number;
  }> {
    // This would use the framework detection logic from URL/YouTube processors
    // For brevity, returning a simplified implementation
    const frameworks: FrameworkReference[] = [];
    
    const frameworkKeywords = {
      'Grand Slam Offer': ['offer', 'value proposition', 'guarantee'],
      'Core Four': ['lead magnet', 'landing page', 'email sequence'],
      'Value Ladder': ['upsell', 'product suite', 'customer journey']
    };

    const lowerContent = content.toLowerCase();
    
    Object.entries(frameworkKeywords).forEach(([framework, keywords]) => {
      const matches = keywords.filter(keyword => lowerContent.includes(keyword));
      if (matches.length > 0) {
        frameworks.push({
          framework: framework as HormoziFramework,
          confidence: matches.length / keywords.length,
          context: this.extractContext(lowerContent, matches[0]),
          explanation: `Detected through keywords: ${matches.join(', ')}`,
          relatedConcepts: matches
        });
      }
    });

    const avgConfidence = frameworks.length > 0 
      ? frameworks.reduce((sum, f) => sum + f.confidence, 0) / frameworks.length
      : 0;

    return {
      frameworks,
      confidence: avgConfidence
    };
  }

  /**
   * Extract context around a keyword
   */
  private extractContext(text: string, keyword: string): string {
    const index = text.indexOf(keyword);
    if (index === -1) return '';

    const start = Math.max(0, index - 100);
    const end = Math.min(text.length, index + keyword.length + 100);
    
    return text.substring(start, end).trim();
  }

  /**
   * Calculate comprehensive quality metrics
   */
  private async calculateQualityMetrics(
    contentItem: ContentItem,
    processedContent: string,
    chunks: ContentChunk[],
    thresholds: QualityThresholds
  ): Promise<QualityMetrics> {
    const contentQuality = this.assessContentQuality(processedContent, contentItem);
    const businessRelevance = this.assessBusinessRelevance(processedContent);
    const frameworkAlignment = this.assessFrameworkAlignment(contentItem);
    const technicalQuality = this.assessTechnicalQuality(chunks);
    const sourceCredibility = this.assessSourceCredibility(contentItem);

    const overallScore = Math.round(
      (contentQuality * 0.25) +
      (businessRelevance * 0.25) +
      (frameworkAlignment * 0.20) +
      (technicalQuality * 0.15) +
      (sourceCredibility * 0.15)
    );

    return {
      overallScore,
      contentQuality,
      businessRelevance,
      frameworkAlignment,
      technicalQuality,
      sourceCredibility
    };
  }

  /**
   * Assess content quality
   */
  private assessContentQuality(content: string, contentItem: ContentItem): number {
    let score = 50;

    // Word count factor
    const wordCount = content.split(/\s+/).length;
    if (wordCount > 500) score += 20;
    else if (wordCount > 200) score += 10;
    else if (wordCount < 100) score -= 20;

    // Structure factor
    if (content.includes('\n\n')) score += 10;
    
    // Language quality (simplified check)
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = wordCount / sentences.length;
    if (avgSentenceLength > 10 && avgSentenceLength < 30) score += 10;

    // Metadata presence
    if (contentItem.metadata?.author) score += 5;
    if (contentItem.metadata?.createdDate) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Assess business relevance
   */
  private assessBusinessRelevance(content: string): number {
    const businessTerms = [
      'business', 'marketing', 'sales', 'revenue', 'customer', 'strategy',
      'profit', 'growth', 'conversion', 'lead', 'funnel', 'roi'
    ];

    const lowerContent = content.toLowerCase();
    const matchCount = businessTerms.filter(term => lowerContent.includes(term)).length;
    
    return Math.round((matchCount / businessTerms.length) * 100);
  }

  /**
   * Assess framework alignment
   */
  private assessFrameworkAlignment(contentItem: ContentItem): number {
    const frameworks = contentItem.metadata?.framework || [];
    return Math.min(frameworks.length * 20, 100);
  }

  /**
   * Assess technical quality
   */
  private assessTechnicalQuality(chunks: ContentChunk[]): number {
    if (chunks.length === 0) return 0;

    const avgWordCount = chunks.reduce((sum, chunk) => sum + chunk.wordCount, 0) / chunks.length;
    const consistentSizing = chunks.every(chunk => 
      Math.abs(chunk.wordCount - avgWordCount) / avgWordCount < 0.5
    );

    let score = 50;
    if (consistentSizing) score += 30;
    if (avgWordCount > 100 && avgWordCount < 300) score += 20;

    return score;
  }

  /**
   * Assess source credibility
   */
  private assessSourceCredibility(contentItem: ContentItem): number {
    let score = 50;

    // Source type credibility
    if (contentItem.type === 'pdf' || contentItem.type === 'docx') score += 20;
    else if (contentItem.type === 'url') {
      const domain = new URL(contentItem.source).hostname;
      if (domain.includes('edu') || domain.includes('gov')) score += 30;
      else if (domain.includes('medium') || domain.includes('linkedin')) score += 15;
    }

    // Author presence
    if (contentItem.metadata?.author) score += 15;

    // Publication date (more recent = more credible for business content)
    if (contentItem.metadata?.createdDate) {
      const daysSincePublished = Math.floor(
        (Date.now() - contentItem.metadata.createdDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSincePublished <= 365) score += 15;
      else if (daysSincePublished <= 1095) score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate processing recommendations
   */
  private generateRecommendations(
    metrics: QualityMetrics,
    thresholds: QualityThresholds
  ): ProcessingRecommendation[] {
    const recommendations: ProcessingRecommendation[] = [];

    if (metrics.contentQuality < 70) {
      recommendations.push({
        type: 'quality',
        message: 'Content quality is below optimal standards',
        action: 'Consider improving content structure and clarity',
        impact: 'medium'
      });
    }

    if (metrics.businessRelevance < thresholds.businessRelevanceThreshold) {
      recommendations.push({
        type: 'content',
        message: 'Business relevance is below threshold',
        action: 'Ensure content contains business-relevant information',
        impact: 'high'
      });
    }

    if (metrics.frameworkAlignment < 40) {
      recommendations.push({
        type: 'content',
        message: 'Limited framework alignment detected',
        action: 'Consider adding references to business frameworks',
        impact: 'medium'
      });
    }

    return recommendations;
  }

  /**
   * Validate quality thresholds
   */
  private validateQualityThresholds(
    metrics: QualityMetrics,
    thresholds: QualityThresholds
  ): void {
    if (metrics.overallScore < thresholds.minimumQuality) {
      throw new Error(`Content quality ${metrics.overallScore}% below minimum threshold ${thresholds.minimumQuality}%`);
    }

    if (metrics.businessRelevance < thresholds.businessRelevanceThreshold) {
      throw new Error(`Business relevance ${metrics.businessRelevance}% below minimum threshold ${thresholds.businessRelevanceThreshold}%`);
    }
  }

  /**
   * Update content item with processing results
   */
  private async updateContentItem(
    contentItem: ContentItem,
    updates: Partial<ContentItem>
  ): Promise<ContentItem> {
    return {
      ...contentItem,
      ...updates,
      metadata: {
        ...contentItem.metadata,
        ...updates.metadata
      }
    };
  }

  /**
   * Update processing status and emit events
   */
  private updateProcessingStatus(contentId: string, event: ContentUpdateEvent): void {
    this.processingStatus.set(contentId, event);
    this.emit('processing-update', event);
  }

  /**
   * Count detected frameworks in content item
   */
  private countDetectedFrameworks(contentItem: ContentItem): number {
    return contentItem.metadata?.framework?.length || 0;
  }

  /**
   * Get processing status for content items
   */
  getProcessingStatus(contentIds: string[]): ContentUpdateEvent[] {
    return contentIds.map(id => 
      this.processingStatus.get(id) || {
        contentId: id,
        status: 'pending',
        progress: 0,
        message: 'Content not found in processing queue'
      }
    );
  }

  /**
   * Get processing queue status
   */
  getQueueStatus(): {
    total: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    const statuses = Array.from(this.processingStatus.values());
    
    return {
      total: statuses.length,
      processing: statuses.filter(s => s.status === 'processing').length,
      completed: statuses.filter(s => s.status === 'completed').length,
      failed: statuses.filter(s => s.status === 'error').length
    };
  }

  /**
   * Batch process multiple content items
   */
  async batchProcess(
    contentItems: ContentItem[],
    options: ContentProcessingOptions = {}
  ): Promise<UnifiedContentResult[]> {
    const batchSize = options.batchSize || this.DEFAULT_OPTIONS.batchSize!;
    const results: UnifiedContentResult[] = [];

    for (let i = 0; i < contentItems.length; i += batchSize) {
      const batch = contentItems.slice(i, i + batchSize);
      const batchPromises = batch.map(item => this.processContent(item, options));
      
      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      } catch (error) {
        console.error(`Batch processing failed for batch starting at index ${i}:`, error);
        // Continue with next batch
      }
    }

    return results;
  }

  /**
   * Get supported content types
   */
  getSupportedContentTypes(): ContentType[] {
    return Array.from(this.processingPipelines.keys());
  }

  /**
   * Get pipeline configuration for content type
   */
  getPipelineConfig(contentType: ContentType): ProcessingPipeline | undefined {
    return this.processingPipelines.get(contentType);
  }
}