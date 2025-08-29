-- Oracle Knowledge Base Schema for Hormozi Wisdom Vector Storage
-- Created by: David Infrastructure
-- Purpose: Store and search processed Hormozi content with semantic embeddings

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