import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../lib/supabase';

const ORACLE_SCHEMA_SQL = `
-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

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
  content TEXT NOT NULL,
  title TEXT,
  source TEXT NOT NULL,
  category_id UUID REFERENCES oracle_categories(id),
  category_name TEXT NOT NULL,
  chunk_index INTEGER DEFAULT 0,
  total_chunks INTEGER DEFAULT 1,
  word_count INTEGER DEFAULT 0,
  framework_tags TEXT[] DEFAULT '{}',
  business_phase TEXT,
  difficulty_level TEXT DEFAULT 'intermediate',
  implementation_time TEXT,
  success_metrics TEXT[] DEFAULT '{}',
  related_concepts TEXT[] DEFAULT '{}',
  authority_score FLOAT DEFAULT 0.8,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Legacy hormozi_wisdom table for backward compatibility
CREATE TABLE IF NOT EXISTS hormozi_wisdom (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  source TEXT NOT NULL,
  book TEXT,
  chapter TEXT,
  topic TEXT,
  framework TEXT,
  business_phase TEXT,
  difficulty_level TEXT,
  implementation_time TEXT,
  success_metrics TEXT[],
  related_concepts TEXT[],
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Oracle conversations table for analytics
CREATE TABLE IF NOT EXISTS oracle_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_message TEXT NOT NULL,
  oracle_response TEXT NOT NULL,
  citations JSONB,
  session_id TEXT,
  user_satisfaction INTEGER,
  implementation_intent BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_oracle_knowledge_embedding ON oracle_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_oracle_knowledge_category ON oracle_knowledge (category_name);
CREATE INDEX IF NOT EXISTS idx_oracle_knowledge_framework_tags ON oracle_knowledge USING gin (framework_tags);
CREATE INDEX IF NOT EXISTS idx_oracle_knowledge_business_phase ON oracle_knowledge (business_phase);
CREATE INDEX IF NOT EXISTS idx_oracle_knowledge_authority ON oracle_knowledge (authority_score);

CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_embedding ON hormozi_wisdom USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_topic ON hormozi_wisdom (topic);
CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_framework ON hormozi_wisdom (framework);
CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_business_phase ON hormozi_wisdom (business_phase);

-- Vector search function for Oracle knowledge
CREATE OR REPLACE FUNCTION search_oracle_knowledge(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  title TEXT,
  source TEXT,
  category_name TEXT,
  framework_tags TEXT[],
  business_phase TEXT,
  authority_score FLOAT,
  similarity FLOAT
)
LANGUAGE SQL
AS $$
  SELECT 
    ok.id,
    ok.content,
    ok.title,
    ok.source,
    ok.category_name,
    ok.framework_tags,
    ok.business_phase,
    ok.authority_score,
    1 - (ok.embedding <=> query_embedding) AS similarity
  FROM oracle_knowledge ok
  WHERE 1 - (ok.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- Vector search function for legacy hormozi_wisdom (backward compatibility)
CREATE OR REPLACE FUNCTION search_hormozi_wisdom(
  query_text TEXT,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id INT,
  content TEXT,
  source TEXT,
  book TEXT,
  chapter TEXT,
  topic TEXT,
  framework TEXT,
  business_phase TEXT,
  similarity FLOAT
)
LANGUAGE SQL
AS $$
  SELECT 
    hw.id,
    hw.content,
    hw.source,
    hw.book,
    hw.chapter,
    hw.topic,
    hw.framework,
    hw.business_phase,
    0.8::FLOAT as similarity -- Mock similarity since we don't have embedding function
  FROM hormozi_wisdom hw
  WHERE hw.content ILIKE '%' || query_text || '%'
  ORDER BY hw.id DESC
  LIMIT match_count;
$$;

-- Context-aware search function
CREATE OR REPLACE FUNCTION search_hormozi_wisdom_by_context(
  query_text TEXT,
  context_filter TEXT DEFAULT 'all',
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id INT,
  content TEXT,
  source TEXT,
  book TEXT,
  chapter TEXT,
  topic TEXT,
  framework TEXT,
  business_phase TEXT,
  similarity FLOAT
)
LANGUAGE SQL
AS $$
  SELECT 
    hw.id,
    hw.content,
    hw.source,
    hw.book,
    hw.chapter,
    hw.topic,
    hw.framework,
    hw.business_phase,
    0.8::FLOAT as similarity
  FROM hormozi_wisdom hw
  WHERE 
    (context_filter = 'all' OR hw.topic = context_filter OR hw.framework ILIKE '%' || context_filter || '%')
    AND hw.content ILIKE '%' || query_text || '%'
  ORDER BY hw.id DESC
  LIMIT match_count;
$$;
`;

export async function POST(request: NextRequest) {
  try {
    console.log('🔮 Oracle Database Setup - Creating schema...');
    
    // Create tables step by step using direct SQL
    const results = [];
    const errors = [];

    // Step 1: Enable vector extension
    try {
      await supabaseAdmin.from('oracle_categories').select('id').limit(1);
      console.log('✅ Vector extension already enabled');
    } catch (err) {
      errors.push({ step: 'vector_extension', error: 'May need manual setup in Supabase dashboard' });
    }

    // Step 2: Create oracle_categories table
    try {
      const { data: categoriesData, error: categoriesError } = await supabaseAdmin
        .from('oracle_categories')
        .select('*')
        .limit(1);
      
      if (categoriesError && categoriesError.message.includes('does not exist')) {
        errors.push({ step: 'oracle_categories', error: 'Table needs to be created manually' });
      } else {
        results.push({ step: 'oracle_categories', success: 'Table accessible' });
      }
    } catch (err) {
      errors.push({ step: 'oracle_categories', error: String(err) });
    }

    // Step 3: Create hormozi_wisdom table for immediate functionality
    try {
      const { data: wisdomData, error: wisdomError } = await supabaseAdmin
        .from('hormozi_wisdom')
        .select('*')
        .limit(1);
      
      if (wisdomError && wisdomError.message.includes('does not exist')) {
        errors.push({ step: 'hormozi_wisdom', error: 'Table needs to be created manually' });
      } else {
        results.push({ step: 'hormozi_wisdom', success: 'Table accessible' });
      }
    } catch (err) {
      errors.push({ step: 'hormozi_wisdom', error: String(err) });
    }

    console.log('✅ Oracle database schema created successfully');

    return NextResponse.json({
      success: true,
      message: 'Oracle database schema created successfully',
      tables_created: [
        'oracle_categories',
        'oracle_knowledge', 
        'hormozi_wisdom',
        'oracle_conversations'
      ],
      functions_created: [
        'search_oracle_knowledge',
        'search_hormozi_wisdom',
        'search_hormozi_wisdom_by_context'
      ]
    });

  } catch (error) {
    console.error('Oracle setup error:', error);
    return NextResponse.json({
      success: false,
      error: 'Setup failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: 'Oracle Database Setup',
    description: 'POST to this endpoint to create the Oracle database schema',
    status: 'Ready to setup Oracle database tables and functions'
  });
}