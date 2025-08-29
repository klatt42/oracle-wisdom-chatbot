/**
 * Oracle TypeScript Interfaces
 * Comprehensive type definitions for the Oracle business wisdom system
 */

// ========== LEGACY ORACLE TYPES (Extended) ==========

export interface OracleMessage {
  id: string;
  role: 'user' | 'oracle';
  content: string;
  citations?: string[];
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
  };
}

export interface OracleConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}

export interface HormoziWisdom {
  topic: string;
  principles: string[];
  examples: string[];
  bookReferences: string[];
}

export interface OracleSession {
  id: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  topics: string[];
}

// ========== ORACLE CORE TYPES ==========

export interface OracleQuery {
  query: string;
  framework?: string;
  context?: string;
  user_context?: {
    session_id?: string;
    expertise_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    business_stage?: string;
    industry?: string;
  };
  options?: {
    response_style?: 'mystical' | 'direct' | 'detailed';
    detail_level?: 'brief' | 'comprehensive' | 'expert';
    include_citations?: boolean;
    include_follow_ups?: boolean;
    enable_reasoning?: boolean;
  };
}

export interface OracleResponse {
  answer: string;
  sources: WisdomSource[];
  framework_detected?: string;
  confidence_score: number;
  oracle_response?: {
    core_wisdom: string;
    full_response: string;
    mystical_styling?: string;
  };
  citations?: {
    citations: CitationResult[];
  };
  metadata?: {
    frameworks_used: string[];
    quality_score: number;
    processing_time_ms?: number;
  };
  // Legacy support
  response?: string;
  citations_legacy?: string[];
}

export interface WisdomSource {
  id: string;
  title: string;
  content: string;
  source: string;
  authority_level: 'PRIMARY_HORMOZI' | 'VERIFIED_CASE_STUDY' | 'EXPERT_INTERPRETATION' | 'COMMUNITY_INSIGHT';
  framework?: string;
  relevance_score: number;
  url?: string;
  excerpt?: string;
}

export interface CitationResult {
  title: string;
  authority_level: string;
  excerpt: string;
  mystical_styling?: string;
  relevance_score?: number;
  url?: string;
}

// ========== CONTENT PROCESSING TYPES ==========

export interface ProcessedContent {
  source_type: 'url' | 'youtube' | 'file' | 'legacy_wisdom';
  content?: string;
  text_content?: string;
  content_title?: string;
  metadata: ContentMetadata;
  quality_score?: number;
  embedding?: number[];
  chunks?: ContentChunk[];
}

export interface ContentMetadata {
  url?: string;
  video_id?: string;
  duration?: number;
  processed_at: string;
  file_type?: string;
  file_size?: number;
  language?: string;
  author?: string;
  published_date?: string;
  tags?: string[];
  framework_detected?: string[];
  [key: string]: unknown;
}

export interface ContentChunk {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    start_position?: number;
    end_position?: number;
    section_title?: string;
    importance_score?: number;
  };
}

export interface ProcessingJob {
  id: string;
  type: 'url' | 'youtube' | 'file';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input: string;
  result?: ProcessedContent;
  error?: string;
  created_at: string;
  completed_at?: string;
  progress?: {
    stage: string;
    percentage: number;
  };
}

// ========== DATABASE INTERFACE TYPES ==========

export interface SupabaseWisdomQuery {
  embedding: number[];
  match_threshold: number;
  match_count: number;
  filter?: {
    source_type?: string;
    framework?: string;
    authority_level?: string;
    min_quality_score?: number;
  };
}

export interface WisdomMatch {
  content: string;
  metadata: WisdomMetadata;
  similarity: number;
  id?: string;
  title?: string;
  source?: string;
}

export interface WisdomMetadata {
  source: string;
  authority_level: string;
  framework?: string;
  context?: string;
  tags?: string[];
  created_at?: string;
  book?: string;
  chapter?: string;
  topic?: string;
  [key: string]: unknown;
}

// Legacy support for existing VectorSearchResult
export interface VectorSearchResult extends WisdomMatch {
  metadata: WisdomMetadata & {
    book?: string;
    chapter?: string;
    topic?: string;
  };
}

// ========== URL PROCESSING TYPES ==========

export interface UrlProcessingResult {
  success: boolean;
  url: string;
  title?: string;
  content?: string;
  metadata?: {
    author?: string;
    published_date?: string;
    description?: string;
    keywords?: string[];
    word_count?: number;
    reading_time_minutes?: number;
  };
  quality_metrics?: {
    content_quality_score: number;
    readability_score: number;
    information_density: number;
    business_relevance: number;
  };
  error?: string;
}

export interface UrlScrapingOptions {
  max_content_length?: number;
  extract_images?: boolean;
  follow_redirects?: boolean;
  timeout_ms?: number;
  user_agent?: string;
}

// ========== YOUTUBE PROCESSING TYPES ==========

export interface YouTubeProcessingResult {
  success: boolean;
  video_id: string;
  title?: string;
  description?: string;
  transcript?: string;
  metadata?: YouTubeMetadata;
  chapters?: YouTubeChapter[];
  error?: string;
}

export interface YouTubeMetadata {
  channel_title?: string;
  published_at?: string;
  duration?: string;
  view_count?: number;
  like_count?: number;
  tags?: string[];
  language?: string;
  thumbnail_url?: string;
}

export interface YouTubeChapter {
  start_time: number;
  end_time: number;
  title: string;
  content?: string;
}

// ========== FRAMEWORK DETECTION TYPES ==========

export interface FrameworkDetectionResult {
  frameworks: DetectedFramework[];
  confidence_score: number;
  primary_framework?: string;
}

export interface DetectedFramework {
  name: string;
  confidence: number;
  evidence: string[];
  components: string[];
}

// ========== EMBEDDING TYPES ==========

export interface EmbeddingRequest {
  text: string;
  model?: 'text-embedding-3-small' | 'text-embedding-3-large';
}

export interface EmbeddingResponse {
  embedding: number[];
  token_count?: number;
  model_used: string;
}

// ========== API RESPONSE TYPES ==========

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: {
    request_id: string;
    timestamp: string;
    processing_time_ms: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

// ========== UTILITY TYPES ==========

export type ContentType = 'url' | 'youtube' | 'file' | 'text' | 'legacy_wisdom';

export type ProcessingStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export type AuthorityLevel = 'PRIMARY_HORMOZI' | 'VERIFIED_CASE_STUDY' | 'EXPERT_INTERPRETATION' | 'COMMUNITY_INSIGHT';

export type FrameworkType = 'GRAND_SLAM_OFFERS' | 'CORE_FOUR' | 'VALUE_LADDER' | 'LTGP' | 'COMPOUNDING' | 'UNKNOWN';

// ========== TYPE GUARDS ==========

export function isOracleQuery(obj: unknown): obj is OracleQuery {
  return typeof obj === 'object' && obj !== null && 'query' in obj && typeof (obj as OracleQuery).query === 'string';
}

export function isProcessedContent(obj: unknown): obj is ProcessedContent {
  return typeof obj === 'object' && 
         obj !== null && 
         'source_type' in obj && 
         'metadata' in obj &&
         typeof (obj as ProcessedContent).source_type === 'string';
}

export function isWisdomMatch(obj: unknown): obj is WisdomMatch {
  return typeof obj === 'object' && 
         obj !== null && 
         'content' in obj && 
         'metadata' in obj && 
         'similarity' in obj &&
         typeof (obj as WisdomMatch).similarity === 'number';
}