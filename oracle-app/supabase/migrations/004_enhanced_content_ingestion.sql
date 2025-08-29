-- Enhanced Content Ingestion Schema Extensions
-- Created by: Elena Execution
-- Purpose: Add advanced metadata support for comprehensive content ingestion

-- Add enhanced metadata columns to oracle_knowledge
ALTER TABLE oracle_knowledge 
ADD COLUMN IF NOT EXISTS filename TEXT,
ADD COLUMN IF NOT EXISTS file_type TEXT,
ADD COLUMN IF NOT EXISTS category_enum TEXT CHECK (category_enum IN ('frameworks', 'metrics', 'strategies', 'mindset', 'operations', 'sales', 'marketing', 'scaling')),
ADD COLUMN IF NOT EXISTS difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
ADD COLUMN IF NOT EXISTS key_concepts TEXT[],
ADD COLUMN IF NOT EXISTS implementation_time TEXT,
ADD COLUMN IF NOT EXISTS success_metrics TEXT[],
ADD COLUMN IF NOT EXISTS prerequisites TEXT[],
ADD COLUMN IF NOT EXISTS related_content TEXT[],
ADD COLUMN IF NOT EXISTS chunk_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS chunk_total INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS video_id TEXT,
ADD COLUMN IF NOT EXISTS video_title TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'document';

-- Create indexes for new fields
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

-- Add RLS policies for new tables
ALTER TABLE content_ingestion_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_validation_rules ENABLE ROW LEVEL SECURITY;

-- System write access for new tables
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

-- Public read access for approved content relationships
CREATE POLICY "Public read access for content relationships" 
ON content_relationships FOR SELECT 
TO PUBLIC USING (true);

-- Apply update triggers to new tables
CREATE TRIGGER update_content_ingestion_updated_at 
    BEFORE UPDATE ON content_ingestion_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_quality_updated_at 
    BEFORE UPDATE ON content_quality_metrics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_validation_rules_updated_at 
    BEFORE UPDATE ON content_validation_rules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();