-- =================================================================
-- ENHANCED ORACLE DATABASE SCHEMA DEPLOYMENT
-- Elena Execution - Complete Enhanced Migration Script
-- =================================================================
-- Execute this in Supabase SQL Editor to deploy the enhanced Oracle schema
--
-- DEPLOYMENT ORDER:
-- 1. Enable vector extension (001)
-- 2. Create Oracle knowledge schema (002) 
-- 3. Create vector search functions (003)
-- 4. Add enhanced content ingestion (004)
--
-- =================================================================

-- =================================================================
-- MIGRATION 001: ENABLE VECTOR EXTENSION
-- =================================================================

-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.environment" = 'development';

-- =================================================================
-- MIGRATION 002: CREATE ORACLE KNOWLEDGE SCHEMA
-- =================================================================

-- Categories table for knowledge organization
CREATE TABLE IF NOT EXISTS oracle_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default Oracle categories
INSERT INTO oracle_categories (name, description) VALUES
  ('hormozi-wisdom', 'Core Alex Hormozi philosophy, mindset, and harsh truths'),
  ('business-frameworks', 'Financial metrics, LTV/CAC, sales systems, and business equations'),
  ('implementation-guides', 'Step-by-step processes, blueprints, and how-to content'),
  ('success-patterns', 'Case studies, proven strategies, and documented results'),
  ('youtube-transcripts', 'Processed YouTube video content with timestamp citations')
ON CONFLICT (name) DO NOTHING;

-- Knowledge chunks table for vector storage
CREATE TABLE IF NOT EXISTS oracle_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content identification
  title TEXT NOT NULL,
  category_id UUID REFERENCES oracle_categories(id) ON DELETE CASCADE,
  source_file TEXT,
  source_url TEXT,
  
  -- Content data
  content TEXT NOT NULL,
  content_preview TEXT,
  word_count INTEGER DEFAULT 0,
  
  -- Vector embeddings (1536 dimensions for OpenAI text-embedding-3-small)
  embedding VECTOR(1536),
  
  -- Metadata for Oracle integration
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  
  -- Processing information
  processed_by TEXT DEFAULT 'Elena Execution',
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- YouTube-specific fields
  youtube_video_id TEXT,
  youtube_timestamp INTEGER, -- seconds from start
  youtube_url TEXT,
  
  -- Business intelligence
  framework_tags TEXT[], -- e.g., ['Grand Slam Offers', 'LTV Optimization']
  business_phase TEXT CHECK (business_phase IN ('startup', 'scaling', 'optimization', 'all')),
  complexity_level TEXT CHECK (complexity_level IN ('beginner', 'intermediate', 'advanced')),
  
  -- Enhanced metadata columns (Migration 004)
  filename TEXT,
  file_type TEXT,
  category_enum TEXT CHECK (category_enum IN ('frameworks', 'metrics', 'strategies', 'mindset', 'operations', 'sales', 'marketing', 'scaling')),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  key_concepts TEXT[],
  implementation_time TEXT,
  success_metrics TEXT[],
  prerequisites TEXT[],
  related_content TEXT[],
  chunk_index INTEGER DEFAULT 0,
  chunk_total INTEGER DEFAULT 1,
  video_id TEXT,
  video_title TEXT,
  video_url TEXT,
  content_type TEXT DEFAULT 'document',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS oracle_knowledge_embedding_idx 
ON oracle_knowledge 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Text search indexes
CREATE INDEX IF NOT EXISTS oracle_knowledge_content_idx 
ON oracle_knowledge 
USING GIN (to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS oracle_knowledge_title_idx 
ON oracle_knowledge 
USING GIN (to_tsvector('english', title));

-- Category and tag indexes
CREATE INDEX IF NOT EXISTS oracle_knowledge_category_idx 
ON oracle_knowledge(category_id);

CREATE INDEX IF NOT EXISTS oracle_knowledge_tags_idx 
ON oracle_knowledge 
USING GIN (tags);

CREATE INDEX IF NOT EXISTS oracle_knowledge_framework_tags_idx 
ON oracle_knowledge 
USING GIN (framework_tags);

-- Enhanced metadata indexes (Migration 004)
CREATE INDEX IF NOT EXISTS oracle_knowledge_filename_idx 
ON oracle_knowledge(filename);

CREATE INDEX IF NOT EXISTS oracle_knowledge_file_type_idx 
ON oracle_knowledge(file_type);

CREATE INDEX IF NOT EXISTS oracle_knowledge_category_enum_idx 
ON oracle_knowledge(category_enum);

CREATE INDEX IF NOT EXISTS oracle_knowledge_difficulty_idx 
ON oracle_knowledge(difficulty_level);

CREATE INDEX IF NOT EXISTS oracle_knowledge_key_concepts_idx 
ON oracle_knowledge 
USING GIN (key_concepts);

CREATE INDEX IF NOT EXISTS oracle_knowledge_prerequisites_idx 
ON oracle_knowledge 
USING GIN (prerequisites);

CREATE INDEX IF NOT EXISTS oracle_knowledge_content_type_idx 
ON oracle_knowledge(content_type);

-- YouTube content indexes
CREATE INDEX IF NOT EXISTS oracle_knowledge_youtube_video_idx 
ON oracle_knowledge(youtube_video_id) 
WHERE youtube_video_id IS NOT NULL;

-- Business intelligence indexes
CREATE INDEX IF NOT EXISTS oracle_knowledge_business_phase_idx 
ON oracle_knowledge(business_phase);

CREATE INDEX IF NOT EXISTS oracle_knowledge_complexity_idx 
ON oracle_knowledge(complexity_level);

-- Processing tracking table
CREATE TABLE IF NOT EXISTS oracle_processing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Processing session info
  session_id UUID DEFAULT gen_random_uuid(),
  processor_name TEXT NOT NULL, -- 'Elena Execution', 'Alice Intelligence', etc.
  operation_type TEXT NOT NULL, -- 'embed_content', 'youtube_extract', 'batch_process'
  
  -- File/content info
  source_file TEXT,
  source_category TEXT,
  chunks_created INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  
  -- Processing results
  status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
  error_message TEXT,
  
  -- Performance metrics
  processing_time_ms INTEGER,
  embedding_cost_estimate DECIMAL(10,6), -- estimated OpenAI API cost
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Processing history indexes
CREATE INDEX IF NOT EXISTS oracle_processing_session_idx 
ON oracle_processing_history(session_id);

CREATE INDEX IF NOT EXISTS oracle_processing_status_idx 
ON oracle_processing_history(status);

CREATE INDEX IF NOT EXISTS oracle_processing_created_idx 
ON oracle_processing_history(created_at DESC);

-- Vector search analytics table
CREATE TABLE IF NOT EXISTS oracle_search_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Search query info
  query_text TEXT NOT NULL,
  query_embedding VECTOR(1536),
  
  -- Search parameters
  similarity_threshold DECIMAL(3,2) DEFAULT 0.8,
  max_results INTEGER DEFAULT 5,
  category_filter TEXT,
  
  -- Results
  results_found INTEGER DEFAULT 0,
  top_similarity_score DECIMAL(3,2),
  
  -- Performance
  search_time_ms INTEGER,
  
  -- User context (if available)
  user_session TEXT,
  conversation_context JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search analytics indexes
CREATE INDEX IF NOT EXISTS oracle_search_query_idx 
ON oracle_search_analytics 
USING GIN (to_tsvector('english', query_text));

CREATE INDEX IF NOT EXISTS oracle_search_created_idx 
ON oracle_search_analytics(created_at DESC);

-- =================================================================
-- MIGRATION 004: ENHANCED CONTENT INGESTION TABLES
-- =================================================================

-- Enhanced content ingestion tracking table
CREATE TABLE IF NOT EXISTS content_ingestion_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Session metadata
  session_name TEXT NOT NULL,
  processor_agent TEXT NOT NULL, -- 'Elena Execution', 'Alice Intelligence', etc.
  source_directory TEXT,
  
  -- Processing statistics
  files_discovered INTEGER DEFAULT 0,
  files_processed INTEGER DEFAULT 0,
  files_failed INTEGER DEFAULT 0,
  total_chunks_created INTEGER DEFAULT 0,
  total_words_processed INTEGER DEFAULT 0,
  
  -- Cost tracking
  embedding_api_calls INTEGER DEFAULT 0,
  analysis_api_calls INTEGER DEFAULT 0,
  estimated_cost DECIMAL(10,4) DEFAULT 0.00,
  
  -- Session status
  status TEXT CHECK (status IN ('started', 'processing', 'completed', 'failed', 'paused')) DEFAULT 'started',
  error_message TEXT,
  
  -- Performance metrics
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  processing_duration_minutes INTEGER,
  
  -- Configuration used
  chunk_size INTEGER DEFAULT 1000,
  chunk_overlap INTEGER DEFAULT 200,
  embedding_model TEXT DEFAULT 'text-embedding-3-small',
  analysis_model TEXT DEFAULT 'gpt-4o-mini',
  
  -- Detailed results
  processing_log JSONB DEFAULT '[]',
  file_results JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingestion session indexes
CREATE INDEX IF NOT EXISTS content_ingestion_status_idx 
ON content_ingestion_sessions(status);

CREATE INDEX IF NOT EXISTS content_ingestion_agent_idx 
ON content_ingestion_sessions(processor_agent);

CREATE INDEX IF NOT EXISTS content_ingestion_created_idx 
ON content_ingestion_sessions(created_at DESC);

-- Content quality metrics table
CREATE TABLE IF NOT EXISTS content_quality_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to ingested content
  knowledge_id UUID REFERENCES oracle_knowledge(id) ON DELETE CASCADE,
  
  -- Quality scores (0.0 - 1.0)
  content_quality_score DECIMAL(3,2),
  metadata_completeness_score DECIMAL(3,2),
  categorization_confidence DECIMAL(3,2),
  
  -- Content analysis
  readability_score DECIMAL(4,2), -- Flesch reading ease
  business_relevance_score DECIMAL(3,2),
  actionability_score DECIMAL(3,2),
  
  -- AI analysis results
  detected_frameworks TEXT[],
  confidence_scores JSONB DEFAULT '{}',
  suggested_improvements TEXT[],
  
  -- Review status
  manual_review_required BOOLEAN DEFAULT FALSE,
  manual_review_notes TEXT,
  quality_approved BOOLEAN DEFAULT FALSE,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quality metrics indexes
CREATE INDEX IF NOT EXISTS content_quality_knowledge_idx 
ON content_quality_metrics(knowledge_id);

CREATE INDEX IF NOT EXISTS content_quality_score_idx 
ON content_quality_metrics(content_quality_score DESC);

CREATE INDEX IF NOT EXISTS content_quality_review_idx 
ON content_quality_metrics(manual_review_required);

-- Content relationships table for cross-referencing
CREATE TABLE IF NOT EXISTS content_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Related content
  primary_content_id UUID REFERENCES oracle_knowledge(id) ON DELETE CASCADE,
  related_content_id UUID REFERENCES oracle_knowledge(id) ON DELETE CASCADE,
  
  -- Relationship type
  relationship_type TEXT CHECK (relationship_type IN ('prerequisite', 'follow_up', 'similar_topic', 'same_framework', 'complementary', 'contradictory')),
  
  -- Relationship strength (0.0 - 1.0)
  similarity_score DECIMAL(3,2),
  relevance_score DECIMAL(3,2),
  
  -- Discovery method
  detected_by TEXT, -- 'embedding_similarity', 'content_analysis', 'manual_review'
  detection_confidence DECIMAL(3,2),
  
  -- Metadata
  notes TEXT,
  created_by TEXT DEFAULT 'Elena Execution',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Relationships indexes
CREATE INDEX IF NOT EXISTS content_relationships_primary_idx 
ON content_relationships(primary_content_id);

CREATE INDEX IF NOT EXISTS content_relationships_related_idx 
ON content_relationships(related_content_id);

CREATE INDEX IF NOT EXISTS content_relationships_type_idx 
ON content_relationships(relationship_type);

CREATE INDEX IF NOT EXISTS content_relationships_similarity_idx 
ON content_relationships(similarity_score DESC);

-- Prevent duplicate relationships (bidirectional)
CREATE UNIQUE INDEX IF NOT EXISTS content_relationships_unique_idx 
ON content_relationships(
  LEAST(primary_content_id::text, related_content_id::text), 
  GREATEST(primary_content_id::text, related_content_id::text), 
  relationship_type
);

-- Content validation rules table
CREATE TABLE IF NOT EXISTS content_validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Rule definition
  rule_name TEXT NOT NULL UNIQUE,
  rule_description TEXT,
  rule_type TEXT CHECK (rule_type IN ('content_length', 'metadata_required', 'category_validation', 'quality_threshold', 'embedding_validation')),
  
  -- Rule parameters
  parameters JSONB DEFAULT '{}',
  
  -- Rule status
  is_active BOOLEAN DEFAULT TRUE,
  enforcement_level TEXT CHECK (enforcement_level IN ('error', 'warning', 'info')) DEFAULT 'warning',
  
  -- Usage tracking
  times_applied INTEGER DEFAULT 0,
  times_passed INTEGER DEFAULT 0,
  times_failed INTEGER DEFAULT 0,
  
  -- Metadata
  created_by TEXT DEFAULT 'Elena Execution',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Validation rules indexes
CREATE INDEX IF NOT EXISTS validation_rules_active_idx 
ON content_validation_rules(is_active);

CREATE INDEX IF NOT EXISTS validation_rules_type_idx 
ON content_validation_rules(rule_type);

-- Insert default validation rules
INSERT INTO content_validation_rules (rule_name, rule_description, rule_type, parameters) VALUES
('minimum_content_length', 'Content must be at least 100 characters', 'content_length', '{"min_length": 100}'),
('required_metadata_fields', 'Essential metadata fields must be populated', 'metadata_required', '{"required_fields": ["category_enum", "business_phase", "difficulty_level"]}'),
('category_consistency', 'Content category must match detected frameworks', 'category_validation', '{"consistency_threshold": 0.7}'),
('embedding_quality', 'Embedding generation must succeed with valid dimensions', 'embedding_validation', '{"expected_dimensions": 1536}'),
('content_quality_threshold', 'Content must meet minimum quality standards', 'quality_threshold', '{"min_quality_score": 0.6}')
ON CONFLICT (rule_name) DO NOTHING;

-- =================================================================
-- MIGRATION 003: VECTOR SEARCH FUNCTIONS
-- =================================================================

-- Semantic search function
CREATE OR REPLACE FUNCTION oracle_semantic_search(
  query_embedding VECTOR(1536),
  similarity_threshold DECIMAL DEFAULT 0.8,
  match_count INTEGER DEFAULT 5,
  category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  source_file TEXT,
  category_name TEXT,
  framework_tags TEXT[],
  business_phase TEXT,
  similarity DECIMAL
)
LANGUAGE SQL
AS $$
  SELECT 
    ok.id,
    ok.title,
    ok.content,
    ok.source_file,
    oc.name as category_name,
    ok.framework_tags,
    ok.business_phase,
    ROUND((1 - (ok.embedding <=> query_embedding))::DECIMAL, 4) as similarity
  FROM oracle_knowledge ok
  LEFT JOIN oracle_categories oc ON ok.category_id = oc.id
  WHERE 
    (category_filter IS NULL OR oc.name = category_filter)
    AND (1 - (ok.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY ok.embedding <=> query_embedding ASC
  LIMIT match_count;
$$;

-- Hybrid search function (semantic + text)
CREATE OR REPLACE FUNCTION oracle_hybrid_search(
  query_text TEXT,
  query_embedding VECTOR(1536),
  similarity_threshold DECIMAL DEFAULT 0.7,
  match_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  source_file TEXT,
  category_name TEXT,
  framework_tags TEXT[],
  business_phase TEXT,
  similarity DECIMAL,
  text_rank REAL
)
LANGUAGE SQL
AS $$
  WITH semantic_results AS (
    SELECT 
      ok.id,
      ok.title,
      ok.content,
      ok.source_file,
      oc.name as category_name,
      ok.framework_tags,
      ok.business_phase,
      ROUND((1 - (ok.embedding <=> query_embedding))::DECIMAL, 4) as similarity,
      0.0 as text_rank
    FROM oracle_knowledge ok
    LEFT JOIN oracle_categories oc ON ok.category_id = oc.id
    WHERE (1 - (ok.embedding <=> query_embedding)) >= similarity_threshold
    ORDER BY ok.embedding <=> query_embedding ASC
    LIMIT match_count
  ),
  text_results AS (
    SELECT 
      ok.id,
      ok.title,
      ok.content,
      ok.source_file,
      oc.name as category_name,
      ok.framework_tags,
      ok.business_phase,
      0.0 as similarity,
      ts_rank(to_tsvector('english', ok.content), plainto_tsquery('english', query_text)) as text_rank
    FROM oracle_knowledge ok
    LEFT JOIN oracle_categories oc ON ok.category_id = oc.id
    WHERE to_tsvector('english', ok.content) @@ plainto_tsquery('english', query_text)
    ORDER BY text_rank DESC
    LIMIT match_count
  )
  SELECT DISTINCT
    COALESCE(sr.id, tr.id) as id,
    COALESCE(sr.title, tr.title) as title,
    COALESCE(sr.content, tr.content) as content,
    COALESCE(sr.source_file, tr.source_file) as source_file,
    COALESCE(sr.category_name, tr.category_name) as category_name,
    COALESCE(sr.framework_tags, tr.framework_tags) as framework_tags,
    COALESCE(sr.business_phase, tr.business_phase) as business_phase,
    COALESCE(sr.similarity, 0.0) as similarity,
    COALESCE(tr.text_rank, 0.0) as text_rank
  FROM semantic_results sr
  FULL OUTER JOIN text_results tr ON sr.id = tr.id
  ORDER BY (COALESCE(sr.similarity, 0.0) + COALESCE(tr.text_rank, 0.0)) DESC
  LIMIT match_count;
$$;

-- Framework-specific search
CREATE OR REPLACE FUNCTION oracle_framework_search(
  framework_name TEXT,
  similarity_threshold DECIMAL DEFAULT 0.8,
  match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  source_file TEXT,
  framework_tags TEXT[],
  business_phase TEXT,
  implementation_time TEXT
)
LANGUAGE SQL
AS $$
  SELECT 
    ok.id,
    ok.title,
    ok.content,
    ok.source_file,
    ok.framework_tags,
    ok.business_phase,
    ok.implementation_time
  FROM oracle_knowledge ok
  WHERE framework_name = ANY(ok.framework_tags)
  ORDER BY ok.created_at DESC
  LIMIT match_count;
$$;

-- Get related content
CREATE OR REPLACE FUNCTION oracle_get_related_content(
  content_id UUID,
  match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  relationship_type TEXT,
  similarity_score DECIMAL
)
LANGUAGE SQL
AS $$
  SELECT 
    ok.id,
    ok.title,
    ok.content,
    cr.relationship_type,
    cr.similarity_score
  FROM content_relationships cr
  JOIN oracle_knowledge ok ON (
    (cr.primary_content_id = content_id AND ok.id = cr.related_content_id) OR
    (cr.related_content_id = content_id AND ok.id = cr.primary_content_id)
  )
  ORDER BY cr.similarity_score DESC
  LIMIT match_count;
$$;

-- YouTube content search
CREATE OR REPLACE FUNCTION oracle_youtube_search(
  query_embedding VECTOR(1536),
  similarity_threshold DECIMAL DEFAULT 0.8,
  match_count INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  youtube_video_id TEXT,
  youtube_url TEXT,
  youtube_timestamp INTEGER,
  similarity DECIMAL
)
LANGUAGE SQL
AS $$
  SELECT 
    ok.id,
    ok.title,
    ok.content,
    ok.youtube_video_id,
    ok.youtube_url,
    ok.youtube_timestamp,
    ROUND((1 - (ok.embedding <=> query_embedding))::DECIMAL, 4) as similarity
  FROM oracle_knowledge ok
  WHERE 
    ok.youtube_video_id IS NOT NULL
    AND (1 - (ok.embedding <=> query_embedding)) >= similarity_threshold
  ORDER BY ok.embedding <=> query_embedding ASC
  LIMIT match_count;
$$;

-- Log search analytics
CREATE OR REPLACE FUNCTION oracle_log_search(
  query_text TEXT,
  query_embedding VECTOR(1536),
  results_found INTEGER,
  search_time_ms INTEGER,
  user_session TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE SQL
AS $$
  INSERT INTO oracle_search_analytics (
    query_text,
    query_embedding,
    results_found,
    search_time_ms,
    user_session
  )
  VALUES (
    query_text,
    query_embedding,
    results_found,
    search_time_ms,
    user_session
  )
  RETURNING id;
$$;

-- Get search analytics
CREATE OR REPLACE FUNCTION oracle_get_search_analytics(
  days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  total_searches BIGINT,
  avg_results_found DECIMAL,
  avg_search_time DECIMAL,
  top_queries TEXT[]
)
LANGUAGE SQL
AS $$
  WITH recent_searches AS (
    SELECT *
    FROM oracle_search_analytics
    WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
  ),
  query_counts AS (
    SELECT 
      query_text,
      COUNT(*) as search_count
    FROM recent_searches
    GROUP BY query_text
    ORDER BY search_count DESC
    LIMIT 10
  )
  SELECT 
    COUNT(*)::BIGINT as total_searches,
    ROUND(AVG(results_found), 2) as avg_results_found,
    ROUND(AVG(search_time_ms), 2) as avg_search_time,
    ARRAY_AGG(qc.query_text ORDER BY qc.search_count DESC) as top_queries
  FROM recent_searches rs
  CROSS JOIN query_counts qc;
$$;

-- Update timestamp triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_oracle_categories_updated_at 
    BEFORE UPDATE ON oracle_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oracle_knowledge_updated_at 
    BEFORE UPDATE ON oracle_knowledge 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oracle_processing_updated_at 
    BEFORE UPDATE ON oracle_processing_history 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_ingestion_updated_at 
    BEFORE UPDATE ON content_ingestion_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_quality_updated_at 
    BEFORE UPDATE ON content_quality_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_validation_rules_updated_at 
    BEFORE UPDATE ON content_validation_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE oracle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_processing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_search_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_ingestion_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_validation_rules ENABLE ROW LEVEL SECURITY;

-- Public read access for Oracle knowledge (can be restricted later)
CREATE POLICY "Public read access for Oracle categories" 
ON oracle_categories FOR SELECT 
TO PUBLIC USING (true);

CREATE POLICY "Public read access for Oracle knowledge" 
ON oracle_knowledge FOR SELECT 
TO PUBLIC USING (true);

CREATE POLICY "Public read access for content relationships" 
ON content_relationships FOR SELECT 
TO PUBLIC USING (true);

-- Restricted write access for processing systems
CREATE POLICY "System write access for Oracle knowledge" 
ON oracle_knowledge FOR ALL 
TO authenticated USING (true);

CREATE POLICY "System write access for processing history" 
ON oracle_processing_history FOR ALL 
TO authenticated USING (true);

CREATE POLICY "System write access for search analytics" 
ON oracle_search_analytics FOR ALL 
TO authenticated USING (true);

CREATE POLICY "System write access for ingestion sessions" 
ON content_ingestion_sessions FOR ALL 
TO authenticated USING (true);

CREATE POLICY "System write access for quality metrics" 
ON content_quality_metrics FOR ALL 
TO authenticated USING (true);

CREATE POLICY "System write access for content relationships" 
ON content_relationships FOR ALL 
TO authenticated USING (true);

CREATE POLICY "System read access for validation rules" 
ON content_validation_rules FOR SELECT 
TO authenticated USING (true);

-- =================================================================
-- DEPLOYMENT COMPLETE
-- =================================================================
-- The Oracle enhanced schema is now ready for advanced content ingestion
-- Execute this script in Supabase SQL Editor to deploy all components
-- =================================================================