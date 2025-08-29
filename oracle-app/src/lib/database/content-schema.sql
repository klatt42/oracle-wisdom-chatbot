-- Oracle Content Processing Infrastructure
-- Database Schema Extensions for Phase 3.5
-- Elena Execution - Technical Foundation

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enhanced content types enumeration
DO $$ BEGIN
    CREATE TYPE content_type AS ENUM ('file', 'url', 'youtube', 'text', 'audio');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Processing status enumeration
DO $$ BEGIN
    CREATE TYPE processing_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'archived');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Content quality tier enumeration
DO $$ BEGIN
    CREATE TYPE quality_tier AS ENUM ('low', 'medium', 'high', 'premium');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Main content items table - enhanced for Phase 3.5
CREATE TABLE IF NOT EXISTS content_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    type content_type NOT NULL,
    source TEXT NOT NULL, -- File path, URL, or YouTube URL
    original_filename TEXT, -- For file uploads
    mime_type TEXT, -- MIME type for files
    file_size BIGINT, -- File size in bytes
    status processing_status DEFAULT 'pending',
    
    -- Processing metadata
    processing_started_at TIMESTAMPTZ,
    processing_completed_at TIMESTAMPTZ,
    processing_duration_ms INTEGER,
    processing_attempts INTEGER DEFAULT 0,
    last_error TEXT,
    
    -- Content metadata
    word_count INTEGER,
    character_count INTEGER,
    language VARCHAR(10) DEFAULT 'en',
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    quality_tier quality_tier,
    
    -- Business intelligence
    detected_frameworks TEXT[],
    business_relevance_score INTEGER CHECK (business_relevance_score >= 0 AND business_relevance_score <= 100),
    topic_categories JSONB, -- {"marketing": 85, "sales": 70, ...}
    key_concepts TEXT[],
    
    -- Content extraction
    extracted_text TEXT,
    summary TEXT,
    author TEXT,
    publication_date TIMESTAMPTZ,
    
    -- Embeddings and search
    content_embedding VECTOR(1536),
    summary_embedding VECTOR(1536),
    
    -- Audit fields
    uploaded_by UUID, -- User ID (for future auth)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ,
    
    -- Indexes
    CONSTRAINT content_items_source_unique UNIQUE(source, type)
);

-- URL-specific content metadata
CREATE TABLE IF NOT EXISTS url_content_metadata (
    content_id UUID PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    domain TEXT NOT NULL,
    final_url TEXT, -- After redirects
    http_status INTEGER,
    
    -- Web scraping metadata
    page_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT[],
    canonical_url TEXT,
    robots_txt_allowed BOOLEAN DEFAULT true,
    
    -- Content extraction
    readability_score REAL,
    html_structure_quality INTEGER,
    image_count INTEGER DEFAULT 0,
    link_count INTEGER DEFAULT 0,
    
    -- Scraping details
    scraped_at TIMESTAMPTZ DEFAULT NOW(),
    scraper_version TEXT,
    user_agent TEXT,
    
    -- Processing options used
    extract_images BOOLEAN DEFAULT false,
    follow_redirects BOOLEAN DEFAULT true,
    respect_robots BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- YouTube-specific content metadata  
CREATE TABLE IF NOT EXISTS youtube_content_metadata (
    content_id UUID PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
    video_id VARCHAR(20) NOT NULL UNIQUE,
    youtube_url TEXT NOT NULL,
    
    -- Video metadata
    channel_id TEXT,
    channel_name TEXT,
    video_title TEXT,
    video_description TEXT,
    video_duration INTEGER, -- Duration in seconds
    video_duration_formatted TEXT, -- "15:30"
    
    -- Video stats
    view_count BIGINT,
    like_count INTEGER,
    comment_count INTEGER,
    published_at TIMESTAMPTZ,
    
    -- Thumbnail information
    thumbnail_url TEXT,
    thumbnail_width INTEGER,
    thumbnail_height INTEGER,
    
    -- Transcript processing
    transcript_available BOOLEAN DEFAULT false,
    transcript_language VARCHAR(10) DEFAULT 'en',
    transcript_word_count INTEGER,
    auto_generated_transcript BOOLEAN,
    
    -- Chapter detection
    chapters_detected BOOLEAN DEFAULT false,
    chapter_count INTEGER DEFAULT 0,
    chapters JSONB, -- [{"title": "Intro", "start": 0, "end": 120}, ...]
    
    -- Speaker identification
    speaker_identification_enabled BOOLEAN DEFAULT false,
    speaker_count INTEGER DEFAULT 1,
    speakers JSONB, -- [{"id": 1, "name": "Speaker 1", "segments": [...]}]
    
    -- Processing options used
    include_transcript BOOLEAN DEFAULT true,
    include_comments BOOLEAN DEFAULT false,
    max_comments INTEGER DEFAULT 0,
    chapter_detection BOOLEAN DEFAULT true,
    speaker_identification BOOLEAN DEFAULT false,
    timestamp_references BOOLEAN DEFAULT true,
    quality_setting TEXT DEFAULT 'high',
    
    -- API usage tracking
    youtube_api_calls INTEGER DEFAULT 0,
    quota_cost INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- File-specific content metadata (enhanced)
CREATE TABLE IF NOT EXISTS file_content_metadata (
    content_id UUID PRIMARY KEY REFERENCES content_items(id) ON DELETE CASCADE,
    original_filename TEXT NOT NULL,
    file_extension TEXT,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    file_hash SHA256, -- For deduplication
    
    -- File processing
    text_extraction_method TEXT, -- 'pdf-parse', 'docx-parse', 'ocr', etc.
    ocr_confidence REAL, -- For image/PDF OCR
    page_count INTEGER, -- For multi-page documents
    
    -- Storage details
    storage_path TEXT,
    storage_provider TEXT DEFAULT 'local', -- 'local', 's3', 'gcs', etc.
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content chunks for RAG system integration
CREATE TABLE IF NOT EXISTS content_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    
    -- Chunk content
    text_content TEXT NOT NULL,
    word_count INTEGER NOT NULL,
    character_count INTEGER NOT NULL,
    
    -- Positioning in original content
    start_position INTEGER,
    end_position INTEGER,
    page_number INTEGER, -- For paginated content
    section_title TEXT, -- For structured content
    
    -- Chunk metadata
    chunk_type TEXT DEFAULT 'text', -- 'text', 'table', 'list', 'code'
    importance_score REAL DEFAULT 0.5, -- 0.0 to 1.0
    
    -- Business intelligence for chunk
    detected_frameworks TEXT[],
    business_concepts TEXT[],
    key_entities TEXT[],
    
    -- Embeddings
    embedding VECTOR(1536),
    
    -- Chunk processing
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    embedding_model TEXT DEFAULT 'text-embedding-ada-002',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(content_id, chunk_index)
);

-- Processing jobs queue for async processing
CREATE TABLE IF NOT EXISTS processing_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    job_type TEXT NOT NULL, -- 'extract', 'chunk', 'embed', 'analyze'
    status processing_status DEFAULT 'pending',
    priority INTEGER DEFAULT 0, -- Higher = more priority
    
    -- Job configuration
    options JSONB DEFAULT '{}',
    
    -- Processing tracking
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Results and errors
    result JSONB,
    error_message TEXT,
    error_details JSONB,
    
    -- Scheduling
    scheduled_for TIMESTAMPTZ DEFAULT NOW(),
    worker_id TEXT, -- ID of processing worker
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business framework detection results
CREATE TABLE IF NOT EXISTS framework_detections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    chunk_id UUID REFERENCES content_chunks(id) ON DELETE CASCADE,
    
    -- Framework information
    framework_name TEXT NOT NULL,
    confidence_score REAL NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    
    -- Context and explanation
    context_text TEXT, -- Text snippet where framework was detected
    explanation TEXT,
    keywords_matched TEXT[],
    
    -- Position information
    start_position INTEGER,
    end_position INTEGER,
    
    -- Detection metadata
    detection_method TEXT DEFAULT 'keyword_pattern',
    model_version TEXT,
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content processing pipeline stages
CREATE TABLE IF NOT EXISTS processing_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    stage_name TEXT NOT NULL,
    stage_order INTEGER NOT NULL,
    
    -- Stage execution
    status processing_status DEFAULT 'pending',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    
    -- Stage configuration and results
    config JSONB DEFAULT '{}',
    result JSONB DEFAULT '{}',
    error_message TEXT,
    
    -- Progress tracking
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    estimated_duration_ms INTEGER,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(content_id, stage_name)
);

-- Content citations and references
CREATE TABLE IF NOT EXISTS content_citations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content_items(id) ON DELETE CASCADE,
    
    -- Citation information
    citation_text TEXT NOT NULL,
    citation_type TEXT DEFAULT 'auto', -- 'auto', 'manual', 'extracted'
    
    -- Source information
    author TEXT,
    title TEXT,
    publication_date DATE,
    publisher TEXT,
    url TEXT,
    doi TEXT,
    isbn TEXT,
    
    -- Citation formatting
    apa_citation TEXT,
    mla_citation TEXT,
    chicago_citation TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comprehensive indexes for optimal performance

-- Content items indexes
CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(type);
CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status);
CREATE INDEX IF NOT EXISTS idx_content_items_created_at ON content_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_quality_score ON content_items(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_frameworks ON content_items USING GIN(detected_frameworks);
CREATE INDEX IF NOT EXISTS idx_content_items_business_relevance ON content_items(business_relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_topic_categories ON content_items USING GIN(topic_categories);
CREATE INDEX IF NOT EXISTS idx_content_items_embedding ON content_items USING ivfflat (content_embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_content_items_text_search ON content_items USING GIN(to_tsvector('english', title || ' ' || COALESCE(summary, '') || ' ' || COALESCE(extracted_text, '')));

-- URL metadata indexes
CREATE INDEX IF NOT EXISTS idx_url_metadata_domain ON url_content_metadata(domain);
CREATE INDEX IF NOT EXISTS idx_url_metadata_scraped_at ON url_content_metadata(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_url_metadata_robots_allowed ON url_content_metadata(robots_txt_allowed);

-- YouTube metadata indexes  
CREATE INDEX IF NOT EXISTS idx_youtube_metadata_video_id ON youtube_content_metadata(video_id);
CREATE INDEX IF NOT EXISTS idx_youtube_metadata_channel ON youtube_content_metadata(channel_id);
CREATE INDEX IF NOT EXISTS idx_youtube_metadata_published ON youtube_content_metadata(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_youtube_metadata_views ON youtube_content_metadata(view_count DESC);

-- File metadata indexes
CREATE INDEX IF NOT EXISTS idx_file_metadata_hash ON file_content_metadata(file_hash);
CREATE INDEX IF NOT EXISTS idx_file_metadata_extension ON file_content_metadata(file_extension);
CREATE INDEX IF NOT EXISTS idx_file_metadata_size ON file_content_metadata(file_size);

-- Content chunks indexes
CREATE INDEX IF NOT EXISTS idx_chunks_content_id ON content_chunks(content_id);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON content_chunks USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_chunks_importance ON content_chunks(importance_score DESC);
CREATE INDEX IF NOT EXISTS idx_chunks_frameworks ON content_chunks USING GIN(detected_frameworks);
CREATE INDEX IF NOT EXISTS idx_chunks_text_search ON content_chunks USING GIN(to_tsvector('english', text_content));

-- Processing jobs indexes
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_priority ON processing_jobs(priority DESC, created_at);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_scheduled ON processing_jobs(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_content_id ON processing_jobs(content_id);

-- Framework detection indexes
CREATE INDEX IF NOT EXISTS idx_framework_detections_content ON framework_detections(content_id);
CREATE INDEX IF NOT EXISTS idx_framework_detections_framework ON framework_detections(framework_name);
CREATE INDEX IF NOT EXISTS idx_framework_detections_confidence ON framework_detections(confidence_score DESC);

-- Processing stages indexes
CREATE INDEX IF NOT EXISTS idx_processing_stages_content ON processing_stages(content_id, stage_order);
CREATE INDEX IF NOT EXISTS idx_processing_stages_status ON processing_stages(status);

-- Functions for content processing

-- Function to search content with embeddings
CREATE OR REPLACE FUNCTION search_content_by_embedding(
    query_embedding VECTOR(1536),
    content_types content_type[] DEFAULT NULL,
    min_quality INTEGER DEFAULT 0,
    match_threshold FLOAT DEFAULT 0.7,
    match_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    type content_type,
    source TEXT,
    quality_score INTEGER,
    business_relevance_score INTEGER,
    detected_frameworks TEXT[],
    summary TEXT,
    similarity FLOAT
)
LANGUAGE SQL
AS $$
    SELECT 
        ci.id,
        ci.title,
        ci.type,
        ci.source,
        ci.quality_score,
        ci.business_relevance_score,
        ci.detected_frameworks,
        ci.summary,
        1 - (ci.content_embedding <=> query_embedding) AS similarity
    FROM content_items ci
    WHERE 
        ci.status = 'completed'
        AND (content_types IS NULL OR ci.type = ANY(content_types))
        AND COALESCE(ci.quality_score, 0) >= min_quality
        AND 1 - (ci.content_embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
$$;

-- Function to search content chunks with embeddings
CREATE OR REPLACE FUNCTION search_content_chunks_by_embedding(
    query_embedding VECTOR(1536),
    content_types content_type[] DEFAULT NULL,
    frameworks TEXT[] DEFAULT NULL,
    match_threshold FLOAT DEFAULT 0.7,
    match_count INTEGER DEFAULT 20
)
RETURNS TABLE (
    chunk_id UUID,
    content_id UUID,
    content_title TEXT,
    content_type content_type,
    text_content TEXT,
    chunk_index INTEGER,
    detected_frameworks TEXT[],
    importance_score REAL,
    similarity FLOAT
)
LANGUAGE SQL
AS $$
    SELECT 
        cc.id AS chunk_id,
        ci.id AS content_id,
        ci.title AS content_title,
        ci.type AS content_type,
        cc.text_content,
        cc.chunk_index,
        cc.detected_frameworks,
        cc.importance_score,
        1 - (cc.embedding <=> query_embedding) AS similarity
    FROM content_chunks cc
    JOIN content_items ci ON cc.content_id = ci.id
    WHERE 
        ci.status = 'completed'
        AND (content_types IS NULL OR ci.type = ANY(content_types))
        AND (frameworks IS NULL OR cc.detected_frameworks && frameworks)
        AND 1 - (cc.embedding <=> query_embedding) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
$$;

-- Function to get processing pipeline status
CREATE OR REPLACE FUNCTION get_content_processing_status(content_item_id UUID)
RETURNS TABLE (
    stage_name TEXT,
    status processing_status,
    progress_percentage INTEGER,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    error_message TEXT
)
LANGUAGE SQL
AS $$
    SELECT 
        ps.stage_name,
        ps.status,
        ps.progress_percentage,
        ps.started_at,
        ps.completed_at,
        ps.duration_ms,
        ps.error_message
    FROM processing_stages ps
    WHERE ps.content_id = content_item_id
    ORDER BY ps.stage_order;
$$;

-- Function to update content processing progress
CREATE OR REPLACE FUNCTION update_processing_stage_progress(
    content_item_id UUID,
    stage_name_param TEXT,
    new_status processing_status,
    progress_percent INTEGER DEFAULT NULL,
    error_msg TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE processing_stages
    SET 
        status = new_status,
        progress_percentage = COALESCE(progress_percent, progress_percentage),
        error_message = error_msg,
        updated_at = NOW(),
        started_at = CASE WHEN new_status = 'processing' AND started_at IS NULL THEN NOW() ELSE started_at END,
        completed_at = CASE WHEN new_status IN ('completed', 'failed') THEN NOW() ELSE completed_at END,
        duration_ms = CASE 
            WHEN new_status IN ('completed', 'failed') AND started_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (NOW() - started_at)) * 1000
            ELSE duration_ms 
        END
    WHERE content_id = content_item_id AND stage_name = stage_name_param;
    
    RETURN FOUND;
END;
$$;

-- Trigger function to update content items updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_content_items_updated_at BEFORE UPDATE ON content_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_url_metadata_updated_at BEFORE UPDATE ON url_content_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_youtube_metadata_updated_at BEFORE UPDATE ON youtube_content_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_file_metadata_updated_at BEFORE UPDATE ON file_content_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processing_jobs_updated_at BEFORE UPDATE ON processing_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_processing_stages_updated_at BEFORE UPDATE ON processing_stages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Security: Row Level Security (RLS) setup for multi-tenant support (future)
-- Uncomment and modify when user authentication is implemented
-- ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE content_chunks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE processing_jobs ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY content_items_policy ON content_items
--     FOR ALL USING (uploaded_by = current_user_id());

-- Grant permissions (adjust based on your application's user roles)
-- GRANT SELECT, INSERT, UPDATE ON content_items TO authenticated_users;
-- GRANT SELECT, INSERT, UPDATE ON content_chunks TO authenticated_users;
-- GRANT SELECT ON processing_jobs TO authenticated_users;