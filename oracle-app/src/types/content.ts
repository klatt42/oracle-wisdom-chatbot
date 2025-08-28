/**
 * Oracle Content Management Type Definitions
 * Elena Execution - Comprehensive types for content processing system
 */

// Content Item Types
export interface ContentItem {
  id: string;
  title: string;
  type: ContentType;
  source: string;
  originalFilename?: string;
  filePath?: string;
  size?: number;
  mimeType?: string;
  uploadedAt: Date;
  processedAt?: Date;
  status: ProcessingStatus;
  progress: number;
  error?: string;
  metadata: ContentMetadata;
  chunks?: ContentChunk[];
  embeddings?: EmbeddingVector[];
  searchScore?: number;
}

export type ContentType = 'pdf' | 'docx' | 'txt' | 'md' | 'url' | 'youtube' | 'json' | 'csv';

export type ProcessingStatus = 'uploading' | 'processing' | 'chunking' | 'embedding' | 'completed' | 'error' | 'archived';

// Content Metadata
export interface ContentMetadata {
  wordCount?: number;
  characterCount?: number;
  extractedChunks?: number;
  embeddings?: number;
  framework?: string[];
  quality?: number;
  language?: string;
  author?: string;
  createdDate?: Date;
  modifiedDate?: Date;
  extractedText?: string;
  summary?: string;
  keywords?: string[];
  businessRelevance?: BusinessRelevanceScore;
}

export interface BusinessRelevanceScore {
  overallScore: number;
  frameworkRelevance: {
    grandSlamOffer: number;
    coreFour: number;
    valueLadder: number;
    ltvCac: number;
    scalingSystems: number;
  };
  topicCategories: {
    marketing: number;
    sales: number;
    operations: number;
    leadership: number;
    finance: number;
    strategy: number;
  };
}

// Content Chunks
export interface ContentChunk {
  id: string;
  contentId: string;
  chunkIndex: number;
  text: string;
  startPosition: number;
  endPosition: number;
  wordCount: number;
  characterCount: number;
  metadata: ChunkMetadata;
  embedding?: EmbeddingVector;
  searchScore?: number;
}

export interface ChunkMetadata {
  section?: string;
  subsection?: string;
  pageNumber?: number;
  paragraph?: number;
  contextBefore?: string;
  contextAfter?: string;
  extractedEntities?: EntityExtraction[];
  frameworkReferences?: FrameworkReference[];
  businessConcepts?: BusinessConcept[];
  quality?: number;
}

// Entity Extraction
export interface EntityExtraction {
  type: 'person' | 'organization' | 'location' | 'concept' | 'metric' | 'process';
  text: string;
  confidence: number;
  startOffset: number;
  endOffset: number;
  context?: string;
}

// Framework References
export interface FrameworkReference {
  framework: HormoziFramework;
  confidence: number;
  context: string;
  explanation?: string;
  relatedConcepts?: string[];
}

export type HormoziFramework = 
  | 'Grand Slam Offer'
  | 'Core Four'
  | 'Value Ladder'
  | 'LTV/CAC'
  | 'Scaling Systems'
  | 'Lead Generation'
  | 'Customer Acquisition'
  | 'Business Operations'
  | 'Revenue Optimization'
  | 'Team Building';

// Business Concepts
export interface BusinessConcept {
  concept: string;
  category: BusinessCategory;
  importance: number;
  context: string;
  relatedFrameworks?: HormoziFramework[];
}

export type BusinessCategory = 
  | 'marketing'
  | 'sales'
  | 'operations'
  | 'leadership'
  | 'finance'
  | 'strategy'
  | 'customer_experience'
  | 'product_development'
  | 'scaling'
  | 'optimization';

// Embedding Vectors
export interface EmbeddingVector {
  id: string;
  chunkId: string;
  vector: number[];
  dimensions: number;
  model: string;
  createdAt: Date;
  metadata?: EmbeddingMetadata;
}

export interface EmbeddingMetadata {
  tokens: number;
  cost?: number;
  processingTime?: number;
  quality?: number;
}

// Processing Results
export interface ProcessingResult {
  success: boolean;
  contentId: string;
  processingTime: number;
  statistics: ProcessingStatistics;
  errors?: ProcessingError[];
  warnings?: ProcessingWarning[];
  recommendations?: ProcessingRecommendation[];
}

export interface ProcessingStatistics {
  originalSize: number;
  processedSize: number;
  chunksCreated: number;
  embeddingsGenerated: number;
  frameworksDetected: number;
  qualityScore: number;
  businessRelevanceScore: number;
  processingSteps: ProcessingStep[];
}

export interface ProcessingStep {
  step: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  details?: any;
}

export interface ProcessingError {
  code: string;
  message: string;
  step?: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProcessingWarning {
  code: string;
  message: string;
  step?: string;
  recommendation?: string;
}

export interface ProcessingRecommendation {
  type: 'quality' | 'performance' | 'content' | 'optimization';
  message: string;
  action?: string;
  impact?: 'low' | 'medium' | 'high';
}

// Content Search and Filtering
export interface ContentSearchRequest {
  query?: string;
  filters?: ContentFilters;
  sort?: ContentSortOptions;
  page?: number;
  limit?: number;
}

export interface ContentFilters {
  type?: ContentType[];
  status?: ProcessingStatus[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  frameworks?: HormoziFramework[];
  qualityRange?: {
    min: number;
    max: number;
  };
  wordCountRange?: {
    min: number;
    max: number;
  };
  businessRelevance?: {
    category: BusinessCategory;
    minScore: number;
  };
}

export interface ContentSortOptions {
  field: 'uploadedAt' | 'processedAt' | 'title' | 'quality' | 'wordCount' | 'businessRelevance';
  direction: 'asc' | 'desc';
}

export interface ContentSearchResponse {
  items: ContentItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  searchMetadata?: SearchMetadata;
}

export interface SearchMetadata {
  query: string;
  processingTime: number;
  totalMatches: number;
  qualityDistribution: Record<string, number>;
  frameworkDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
}

// Content Library Management
export interface ContentLibraryStats {
  totalFiles: number;
  totalSize: number;
  completedFiles: number;
  processingFiles: number;
  errorFiles: number;
  totalWords: number;
  totalChunks: number;
  totalEmbeddings: number;
  averageQuality: number;
  frameworkDistribution: Record<HormoziFramework, number>;
  typeDistribution: Record<ContentType, number>;
  recentActivity: ContentActivity[];
}

export interface ContentActivity {
  id: string;
  type: 'upload' | 'process' | 'delete' | 'update';
  contentId: string;
  contentTitle: string;
  timestamp: Date;
  details?: string;
  user?: string;
}

// File Upload Handling
export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: ContentType[];
  chunkSize?: number;
  overlapSize?: number;
  generateSummary?: boolean;
  extractFrameworks?: boolean;
  qualityThreshold?: number;
}

export interface UploadProgress {
  contentId: string;
  filename: string;
  status: ProcessingStatus;
  progress: number;
  stage: string;
  estimatedTimeRemaining?: number;
  error?: string;
}

// URL and YouTube Processing
export interface UrlProcessingOptions {
  extractImages?: boolean;
  followRedirects?: boolean;
  maxDepth?: number;
  respectRobots?: boolean;
  timeout?: number;
}

export interface YouTubeProcessingOptions {
  includeTranscript?: boolean;
  includeComments?: boolean;
  includeMetadata?: boolean;
  transcriptLanguage?: string;
  maxComments?: number;
}

export interface YouTubeMetadata {
  videoId: string;
  title: string;
  description: string;
  duration: number;
  publishedAt: Date;
  channelName: string;
  channelId: string;
  viewCount: number;
  likeCount: number;
  thumbnailUrl: string;
  tags: string[];
  transcript?: YouTubeTranscript[];
  comments?: YouTubeComment[];
}

export interface YouTubeTranscript {
  text: string;
  start: number;
  duration: number;
}

export interface YouTubeComment {
  id: string;
  text: string;
  author: string;
  likeCount: number;
  publishedAt: Date;
  replies?: YouTubeComment[];
}

// Export/Import Types
export interface ContentExportOptions {
  format: 'json' | 'csv' | 'xlsx' | 'pdf';
  includeChunks?: boolean;
  includeEmbeddings?: boolean;
  includeMetadata?: boolean;
  filters?: ContentFilters;
}

export interface ContentExportResult {
  success: boolean;
  filePath?: string;
  downloadUrl?: string;
  fileSize?: number;
  itemCount?: number;
  error?: string;
}

export interface ContentImportOptions {
  format: 'json' | 'csv' | 'xlsx';
  overwriteExisting?: boolean;
  validateFrameworks?: boolean;
  generateEmbeddings?: boolean;
}

export interface ContentImportResult {
  success: boolean;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  errors?: Array<{
    row: number;
    error: string;
  }>;
  warnings?: string[];
}