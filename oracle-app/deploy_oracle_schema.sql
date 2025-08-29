-- =================================================================
-- ORACLE DATABASE SCHEMA DEPLOYMENT
-- Elena Execution - Complete Migration Script
-- =================================================================
-- Execute this in Supabase SQL Editor to deploy the Oracle schema
--
-- DEPLOYMENT ORDER:
-- 1. Enable vector extension (001)
-- 2. Create Oracle knowledge schema (002) 
-- 3. Create vector search functions (003)
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
  processed_by TEXT DEFAULT 'David Infrastructure',
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- YouTube-specific fields
  youtube_video_id TEXT,
  youtube_timestamp INTEGER, -- seconds from start
  youtube_url TEXT,
  
  -- Business intelligence
  framework_tags TEXT[], -- e.g., ['Grand Slam Offers', 'LTV Optimization']
  business_phase TEXT CHECK (business_phase IN ('startup', 'scaling', 'optimization', 'all')),
  complexity_level TEXT CHECK (complexity_level IN ('beginner', 'intermediate', 'advanced')),
  
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
  processor_name TEXT NOT NULL, -- 'David Infrastructure', 'Elena Execution', etc.
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

-- Row Level Security (RLS) policies
ALTER TABLE oracle_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_processing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE oracle_search_analytics ENABLE ROW LEVEL SECURITY;

-- Public read access for Oracle knowledge (can be restricted later)
CREATE POLICY "Public read access for Oracle categories" 
ON oracle_categories FOR SELECT 
TO PUBLIC USING (true);

CREATE POLICY "Public read access for Oracle knowledge" 
ON oracle_knowledge FOR SELECT 
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

-- =================================================================
-- MIGRATION 003: CREATE VECTOR SEARCH FUNCTIONS
-- =================================================================

-- Semantic search function with category filtering
CREATE OR REPLACE FUNCTION oracle_semantic_search(
  query_embedding VECTOR(1536),
  similarity_threshold DECIMAL(3,2) DEFAULT 0.8,
  max_results INTEGER DEFAULT 5,
  category_filter TEXT DEFAULT NULL,
  business_phase_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  content_preview TEXT,
  category_name TEXT,
  source_file TEXT,
  source_url TEXT,
  youtube_url TEXT,
  youtube_timestamp INTEGER,
  similarity_score DECIMAL(3,2),
  word_count INTEGER,
  tags TEXT[],
  framework_tags TEXT[],
  business_phase TEXT,
  complexity_level TEXT,
  processed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ok.id,
    ok.title,
    ok.content,
    ok.content_preview,
    oc.name AS category_name,
    ok.source_file,
    ok.source_url,
    ok.youtube_url,
    ok.youtube_timestamp,
    ROUND((1 - (ok.embedding <=> query_embedding))::numeric, 2) AS similarity_score,
    ok.word_count,
    ok.tags,
    ok.framework_tags,
    ok.business_phase,
    ok.complexity_level,
    ok.processed_at
  FROM oracle_knowledge ok
  JOIN oracle_categories oc ON ok.category_id = oc.id
  WHERE 
    (1 - (ok.embedding <=> query_embedding)) >= similarity_threshold
    AND (category_filter IS NULL OR oc.name = category_filter)
    AND (business_phase_filter IS NULL OR ok.business_phase = business_phase_filter OR ok.business_phase = 'all')
    AND ok.embedding IS NOT NULL
  ORDER BY ok.embedding <=> query_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Hybrid search combining vector similarity and text search
CREATE OR REPLACE FUNCTION oracle_hybrid_search(
  query_text TEXT,
  query_embedding VECTOR(1536),
  similarity_threshold DECIMAL(3,2) DEFAULT 0.7,
  max_results INTEGER DEFAULT 10,
  category_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  content_preview TEXT,
  category_name TEXT,
  source_file TEXT,
  source_url TEXT,
  youtube_url TEXT,
  youtube_timestamp INTEGER,
  combined_score DECIMAL(4,2),
  similarity_score DECIMAL(3,2),
  text_rank REAL,
  word_count INTEGER,
  tags TEXT[],
  framework_tags TEXT[],
  business_phase TEXT,
  complexity_level TEXT,
  processed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  WITH vector_results AS (
    SELECT 
      ok.id,
      ok.title,
      ok.content,
      ok.content_preview,
      oc.name AS category_name,
      ok.source_file,
      ok.source_url,
      ok.youtube_url,
      ok.youtube_timestamp,
      ROUND((1 - (ok.embedding <=> query_embedding))::numeric, 2) AS sim_score,
      ok.word_count,
      ok.tags,
      ok.framework_tags,
      ok.business_phase,
      ok.complexity_level,
      ok.processed_at
    FROM oracle_knowledge ok
    JOIN oracle_categories oc ON ok.category_id = oc.id
    WHERE 
      (1 - (ok.embedding <=> query_embedding)) >= similarity_threshold
      AND (category_filter IS NULL OR oc.name = category_filter)
      AND ok.embedding IS NOT NULL
  ),
  text_results AS (
    SELECT 
      ok.id,
      ts_rank_cd(to_tsvector('english', ok.content || ' ' || ok.title), plainto_tsquery('english', query_text)) AS text_score
    FROM oracle_knowledge ok
    WHERE to_tsvector('english', ok.content || ' ' || ok.title) @@ plainto_tsquery('english', query_text)
  )
  SELECT 
    vr.id,
    vr.title,
    vr.content,
    vr.content_preview,
    vr.category_name,
    vr.source_file,
    vr.source_url,
    vr.youtube_url,
    vr.youtube_timestamp,
    ROUND((vr.sim_score * 0.7 + COALESCE(tr.text_score, 0) * 0.3)::numeric, 2) AS combined_score,
    vr.sim_score AS similarity_score,
    COALESCE(tr.text_score, 0) AS text_rank,
    vr.word_count,
    vr.tags,
    vr.framework_tags,
    vr.business_phase,
    vr.complexity_level,
    vr.processed_at
  FROM vector_results vr
  LEFT JOIN text_results tr ON vr.id = tr.id
  ORDER BY combined_score DESC, vr.sim_score DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Framework-specific search for business concepts
CREATE OR REPLACE FUNCTION oracle_framework_search(
  framework_name TEXT,
  query_embedding VECTOR(1536),
  max_results INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category_name TEXT,
  framework_tags TEXT[],
  similarity_score DECIMAL(3,2),
  youtube_url TEXT,
  youtube_timestamp INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ok.id,
    ok.title,
    ok.content,
    oc.name AS category_name,
    ok.framework_tags,
    ROUND((1 - (ok.embedding <=> query_embedding))::numeric, 2) AS similarity_score,
    ok.youtube_url,
    ok.youtube_timestamp
  FROM oracle_knowledge ok
  JOIN oracle_categories oc ON ok.category_id = oc.id
  WHERE 
    framework_name = ANY(ok.framework_tags)
    AND ok.embedding IS NOT NULL
  ORDER BY ok.embedding <=> query_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Get related content based on embeddings similarity
CREATE OR REPLACE FUNCTION oracle_get_related_content(
  content_id UUID,
  similarity_threshold DECIMAL(3,2) DEFAULT 0.8,
  max_results INTEGER DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content_preview TEXT,
  category_name TEXT,
  similarity_score DECIMAL(3,2),
  framework_tags TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  WITH source_content AS (
    SELECT embedding FROM oracle_knowledge WHERE id = content_id
  )
  SELECT 
    ok.id,
    ok.title,
    ok.content_preview,
    oc.name AS category_name,
    ROUND((1 - (ok.embedding <=> sc.embedding))::numeric, 2) AS similarity_score,
    ok.framework_tags
  FROM oracle_knowledge ok
  JOIN oracle_categories oc ON ok.category_id = oc.id
  CROSS JOIN source_content sc
  WHERE 
    ok.id != content_id
    AND (1 - (ok.embedding <=> sc.embedding)) >= similarity_threshold
    AND ok.embedding IS NOT NULL
  ORDER BY ok.embedding <=> sc.embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- YouTube content search with timestamp filtering
CREATE OR REPLACE FUNCTION oracle_youtube_search(
  query_embedding VECTOR(1536),
  video_id TEXT DEFAULT NULL,
  min_timestamp INTEGER DEFAULT NULL,
  max_timestamp INTEGER DEFAULT NULL,
  max_results INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  youtube_video_id TEXT,
  youtube_timestamp INTEGER,
  youtube_url TEXT,
  similarity_score DECIMAL(3,2),
  formatted_timestamp TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ok.id,
    ok.title,
    ok.content,
    ok.youtube_video_id,
    ok.youtube_timestamp,
    ok.youtube_url,
    ROUND((1 - (ok.embedding <=> query_embedding))::numeric, 2) AS similarity_score,
    CASE 
      WHEN ok.youtube_timestamp IS NOT NULL THEN
        LPAD((ok.youtube_timestamp / 3600)::TEXT, 2, '0') || ':' ||
        LPAD(((ok.youtube_timestamp % 3600) / 60)::TEXT, 2, '0') || ':' ||
        LPAD((ok.youtube_timestamp % 60)::TEXT, 2, '0')
      ELSE NULL
    END AS formatted_timestamp
  FROM oracle_knowledge ok
  WHERE 
    ok.youtube_video_id IS NOT NULL
    AND (video_id IS NULL OR ok.youtube_video_id = video_id)
    AND (min_timestamp IS NULL OR ok.youtube_timestamp >= min_timestamp)
    AND (max_timestamp IS NULL OR ok.youtube_timestamp <= max_timestamp)
    AND ok.embedding IS NOT NULL
  ORDER BY ok.embedding <=> query_embedding
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Analytics function to track popular searches
CREATE OR REPLACE FUNCTION oracle_log_search(
  query_text TEXT,
  query_embedding VECTOR(1536),
  results_found INTEGER,
  search_time_ms INTEGER,
  category_filter TEXT DEFAULT NULL,
  user_session TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  search_id UUID;
  top_similarity DECIMAL(3,2);
BEGIN
  -- Calculate top similarity score from results
  SELECT COALESCE(
    ROUND((1 - (embedding <=> query_embedding))::numeric, 2), 0
  ) INTO top_similarity
  FROM oracle_knowledge
  WHERE embedding IS NOT NULL
  ORDER BY embedding <=> query_embedding
  LIMIT 1;
  
  -- Insert search record
  INSERT INTO oracle_search_analytics (
    query_text,
    query_embedding,
    category_filter,
    results_found,
    top_similarity_score,
    search_time_ms,
    user_session
  ) VALUES (
    query_text,
    query_embedding,
    category_filter,
    results_found,
    top_similarity,
    search_time_ms,
    user_session
  ) RETURNING id INTO search_id;
  
  RETURN search_id;
END;
$$ LANGUAGE plpgsql;

-- Get search analytics and performance metrics
CREATE OR REPLACE FUNCTION oracle_get_search_analytics(
  days_back INTEGER DEFAULT 7
)
RETURNS TABLE (
  total_searches BIGINT,
  avg_results_per_search DECIMAL(3,1),
  avg_search_time_ms DECIMAL(6,1),
  top_queries TEXT[],
  popular_categories TEXT[],
  avg_similarity_score DECIMAL(3,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH search_stats AS (
    SELECT 
      COUNT(*) as total_searches,
      AVG(results_found) as avg_results,
      AVG(search_time_ms) as avg_time,
      AVG(top_similarity_score) as avg_similarity
    FROM oracle_search_analytics 
    WHERE created_at >= NOW() - INTERVAL '%s days'
  ),
  top_queries AS (
    SELECT array_agg(query_text ORDER BY search_count DESC) as queries
    FROM (
      SELECT query_text, COUNT(*) as search_count
      FROM oracle_search_analytics 
      WHERE created_at >= NOW() - INTERVAL '%s days'
      GROUP BY query_text
      ORDER BY search_count DESC
      LIMIT 10
    ) tq
  ),
  top_categories AS (
    SELECT array_agg(category_filter ORDER BY category_count DESC) as categories
    FROM (
      SELECT category_filter, COUNT(*) as category_count
      FROM oracle_search_analytics 
      WHERE created_at >= NOW() - INTERVAL '%s days'
        AND category_filter IS NOT NULL
      GROUP BY category_filter
      ORDER BY category_count DESC
      LIMIT 5
    ) tc
  )
  SELECT 
    ss.total_searches::BIGINT,
    ROUND(ss.avg_results::numeric, 1) as avg_results_per_search,
    ROUND(ss.avg_time::numeric, 1) as avg_search_time_ms,
    tq.queries as top_queries,
    tc.categories as popular_categories,
    ROUND(ss.avg_similarity::numeric, 2) as avg_similarity_score
  FROM search_stats ss
  CROSS JOIN top_queries tq
  CROSS JOIN top_categories tc;
END;
$$ LANGUAGE plpgsql;

-- =================================================================
-- DEPLOYMENT VERIFICATION QUERIES
-- =================================================================

-- Test 1: Verify vector extension is enabled
SELECT 
  'vector_extension' as test_name,
  CASE WHEN COUNT(*) > 0 THEN '✅ ENABLED' ELSE '❌ MISSING' END as status
FROM pg_extension WHERE extname = 'vector';

-- Test 2: Verify all tables exist
SELECT 
  'oracle_tables' as test_name,
  CASE WHEN COUNT(*) = 4 THEN '✅ ALL CREATED' ELSE '❌ MISSING TABLES' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('oracle_categories', 'oracle_knowledge', 'oracle_processing_history', 'oracle_search_analytics');

-- Test 3: Verify categories are populated
SELECT 
  'oracle_categories_data' as test_name,
  CASE WHEN COUNT(*) >= 5 THEN '✅ POPULATED' ELSE '❌ EMPTY' END as status
FROM oracle_categories;

-- Test 4: Verify search functions exist
SELECT 
  'oracle_search_functions' as test_name,
  CASE WHEN COUNT(*) >= 6 THEN '✅ ALL CREATED' ELSE '❌ MISSING FUNCTIONS' END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name LIKE 'oracle_%';

-- Test 5: List all created categories
SELECT 
  'category_list' as info_type,
  name as category_name,
  description
FROM oracle_categories 
ORDER BY name;

-- =================================================================
-- ELENA EXECUTION - DEPLOYMENT COMPLETE MARKER
-- =================================================================
-- When all tests show ✅, the Oracle schema deployment is successful
-- Ready for knowledge base content processing and vector embedding
-- =================================================================