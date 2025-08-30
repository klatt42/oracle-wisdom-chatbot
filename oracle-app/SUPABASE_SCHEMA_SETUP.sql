-- =================================================================
-- ORACLE SUPABASE DATABASE SCHEMA SETUP
-- Elena Execution - Complete Executable SQL for Supabase
-- =================================================================
-- 
-- COPY AND PASTE THIS ENTIRE SCRIPT INTO SUPABASE SQL EDITOR
-- THEN CLICK "RUN" TO EXECUTE
--
-- =================================================================

-- Enable vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create hormozi_wisdom table with proper UUID primary key
CREATE TABLE IF NOT EXISTS hormozi_wisdom (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  book TEXT,
  chapter TEXT,
  topic TEXT,
  framework TEXT,
  business_phase TEXT,
  difficulty_level TEXT DEFAULT 'intermediate',
  implementation_time TEXT,
  success_metrics TEXT[] DEFAULT '{}',
  related_concepts TEXT[] DEFAULT '{}',
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create oracle conversations table
CREATE TABLE IF NOT EXISTS oracle_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_message TEXT NOT NULL,
  oracle_response TEXT NOT NULL,
  citations JSONB DEFAULT '[]',
  session_id TEXT,
  user_satisfaction INTEGER,
  implementation_intent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create oracle categories table
CREATE TABLE IF NOT EXISTS oracle_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO oracle_categories (name, description) VALUES
  ('hormozi-wisdom', 'Core Alex Hormozi philosophy, mindset, and business principles'),
  ('business-frameworks', 'Financial metrics, systems, and scalable business models'),
  ('implementation-guides', 'Step-by-step processes and actionable blueprints'),
  ('success-patterns', 'Case studies, proven strategies, and documented results'),
  ('scaling-strategies', 'Business growth, team building, and operational excellence')
ON CONFLICT (name) DO NOTHING;

-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_topic ON hormozi_wisdom (topic);
CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_framework ON hormozi_wisdom (framework);
CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_business_phase ON hormozi_wisdom (business_phase);
CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_difficulty ON hormozi_wisdom (difficulty_level);
CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_created ON hormozi_wisdom (created_at);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_content_search 
ON hormozi_wisdom USING gin(to_tsvector('english', content));

-- Vector similarity index (will be used when embeddings are added)
CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_embedding 
ON hormozi_wisdom USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Conversation indexes
CREATE INDEX IF NOT EXISTS idx_oracle_conversations_session ON oracle_conversations (session_id);
CREATE INDEX IF NOT EXISTS idx_oracle_conversations_created ON oracle_conversations (created_at);

-- Success message
DO $$ 
BEGIN 
  RAISE NOTICE '🔮 ORACLE SCHEMA SETUP COMPLETE! Tables and indexes created successfully.';
END $$;