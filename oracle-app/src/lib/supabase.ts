import { createClient } from '@supabase/supabase-js';
import { 
  SupabaseWisdomQuery, 
  WisdomMatch, 
  WisdomMetadata,
  ProcessedContent,
  VectorSearchResult 
} from '@/types/oracle';

// Supabase configuration for Oracle knowledge base
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false, // Oracle doesn't need user sessions
  }
});

// Server-side Supabase client with service role for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

// Legacy interface for Hormozi wisdom search results - now extends WisdomMatch
export interface HormoziWisdom extends WisdomMatch {
  id: number;
  content: string;
  source: string;
  book?: string;
  chapter?: string;
  topic?: string;
  framework?: string;
  business_phase?: string;
  difficulty_level?: string;
  implementation_time?: string;
  success_metrics?: string[];
  related_concepts?: string[];
  similarity?: number;
  metadata: WisdomMetadata & {
    book?: string;
    chapter?: string;
    topic?: string;
    framework?: string;
    business_phase?: string;
    difficulty_level?: string;
    implementation_time?: string;
    success_metrics?: string[];
    related_concepts?: string[];
  };
}

// Vector search function for Alex Hormozi wisdom
export async function searchHormoziWisdom(query: string, limit: number = 5): Promise<HormoziWisdom[]> {
  try {
    const { data, error } = await supabaseAdmin
      .rpc('search_hormozi_wisdom', {
        query_text: query,
        match_threshold: 0.7,
        match_count: limit
      });

    if (error) {
      console.error('Vector search error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Supabase search error:', error);
    return [];
  }
}

// Enhanced search with context filtering
export async function searchHormoziWisdomByContext(
  query: string, 
  context: 'offers' | 'leads' | 'scaling' | 'mindset' | 'all' = 'all',
  limit: number = 5
): Promise<HormoziWisdom[]> {
  try {
    const { data, error } = await supabaseAdmin
      .rpc('search_hormozi_wisdom_by_context', {
        query_text: query,
        context_filter: context,
        match_threshold: 0.7,
        match_count: limit
      });

    if (error) {
      console.error('Context vector search error:', error);
      return [];
    }

    return (data || []) as HormoziWisdom[];
  } catch (error) {
    console.error('Context search error:', error);
    return [];
  }
}

// Search across new content processing system (Phase 3.5 integration)
export async function searchProcessedContent(
  query: string,
  contentTypes: ('file' | 'url' | 'youtube' | 'text')[] = ['file', 'url', 'youtube', 'text'],
  frameworks: string[] = [],
  limit: number = 5
): Promise<WisdomMatch[]> {
  try {
    // Generate embedding for the query
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const openai = require('openai');
    const client = new openai.OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    const embeddingResponse = await client.embeddings.create({
      model: 'text-embedding-ada-002',
      input: query
    });
    
    const queryEmbedding: number[] = embeddingResponse.data[0].embedding;

    // Search content chunks using the new database schema
    const { data, error } = await supabaseAdmin
      .rpc('search_content_chunks_by_embedding', {
        query_embedding: queryEmbedding,
        content_types: contentTypes,
        frameworks: frameworks.length > 0 ? frameworks : null,
        match_threshold: 0.7,
        match_count: limit
      });

    if (error) {
      console.error('Processed content search error:', error);
      return [];
    }

    return (data || []) as WisdomMatch[];
  } catch (error) {
    console.error('Processed content search error:', error);
    return [];
  }
}

// Combined search across both legacy and new content systems
export async function searchOracleKnowledgeBase(
  query: string,
  context: 'offers' | 'leads' | 'scaling' | 'mindset' | 'all' = 'all',
  includeProcessedContent: boolean = true,
  limit: number = 5
): Promise<WisdomMatch[]> {
  try {
    const results = [];

    // Search legacy Hormozi wisdom
    const legacyResults = await searchHormoziWisdomByContext(query, context, Math.ceil(limit / 2));
    results.push(...legacyResults.map(item => ({
      ...item,
      source_type: 'legacy_wisdom',
      content_type: 'wisdom'
    })));

    // Search processed content if enabled
    if (includeProcessedContent) {
      const processedResults = await searchProcessedContent(query, ['file', 'url', 'youtube', 'text'], [], Math.ceil(limit / 2));
      results.push(...processedResults.map(item => ({
        ...item,
        source_type: 'processed_content'
      })));
    }

    // Sort by similarity and return top results
    return results
      .sort((a, b) => (b.similarity || 0) - (a.similarity || 0))
      .slice(0, limit);

  } catch (error) {
    console.error('Combined knowledge base search error:', error);
    return [];
  }
}

// Search business frameworks specifically
export async function searchBusinessFrameworks(query: string, limit: number = 3): Promise<HormoziWisdom[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('hormozi_wisdom')
      .select('*')
      .textSearch('content', query)
      .eq('topic', 'business_framework')
      .limit(limit);

    if (error) {
      console.error('Framework search error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Framework search error:', error);
    return [];
  }
}

// Store Oracle conversation for analytics (future feature)
export async function storeOracleConversation(
  message: string,
  response: string,
  citations: string[],
  sessionId?: string
) {
  try {
    const { error } = await supabaseAdmin
      .from('oracle_conversations')
      .insert([
        {
          user_message: message,
          oracle_response: response,
          citations: citations,
          session_id: sessionId,
          created_at: new Date().toISOString(),
        }
      ]);

    if (error) {
      console.error('Error storing conversation:', error);
    }
  } catch (error) {
    console.error('Database error:', error);
  }
}

// Process knowledge base documents for vector storage
export async function processKnowledgeBaseDocuments() {
  console.log('Processing Oracle knowledge base documents...');
  // This function will be called during setup to process MD files
  // Implementation will chunk and embed knowledge base content
}

// Add wisdom content to vector database
export async function addHormoziWisdom(
  content: string,
  source: string,
  metadata: {
    book?: string;
    chapter?: string;
    topic?: string;
    framework?: string;
    business_phase?: string;
    difficulty_level?: string;
    implementation_time?: string;
    success_metrics?: string[];
    related_concepts?: string[];
  }
) {
  try {
    // Generate embedding using OpenAI API (to be implemented)
    // const embedding = await generateEmbedding(content);
    
    const { data, error } = await supabaseAdmin
      .from('hormozi_wisdom')
      .insert([
        {
          content,
          source,
          book: metadata.book,
          chapter: metadata.chapter,
          topic: metadata.topic,
          framework: metadata.framework,
          business_phase: metadata.business_phase,
          difficulty_level: metadata.difficulty_level,
          implementation_time: metadata.implementation_time,
          success_metrics: metadata.success_metrics,
          related_concepts: metadata.related_concepts,
          // embedding: embedding, // Add when embedding generation is implemented
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error adding wisdom:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error processing wisdom:', error);
    return false;
  }
}

// Initialize Oracle database tables and functions (run this once during setup)
export async function initializeOracleDatabase() {
  console.log('Oracle database initialization should be done via Supabase SQL editor:');
  console.log(`
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create enhanced hormozi_wisdom table for comprehensive vector storage
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

-- Create oracle_conversations table for analytics and learning
CREATE TABLE IF NOT EXISTS oracle_conversations (
  id SERIAL PRIMARY KEY,
  user_message TEXT NOT NULL,
  oracle_response TEXT NOT NULL,
  citations JSONB,
  session_id TEXT,
  user_satisfaction INTEGER,
  implementation_intent BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create success_patterns table for tracking proven strategies
CREATE TABLE IF NOT EXISTS success_patterns (
  id SERIAL PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  business_context TEXT,
  implementation_steps JSONB,
  success_metrics JSONB,
  validation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vector search function for Hormozi wisdom
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
    1 - (hw.embedding <=> ai_embed_query(query_text)::vector) AS similarity
  FROM hormozi_wisdom hw
  WHERE 1 - (hw.embedding <=> ai_embed_query(query_text)::vector) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- Create context-aware search function
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
    1 - (hw.embedding <=> ai_embed_query(query_text)::vector) AS similarity
  FROM hormozi_wisdom hw
  WHERE 
    (context_filter = 'all' OR hw.topic = context_filter OR hw.framework ILIKE '%' || context_filter || '%')
    AND 1 - (hw.embedding <=> ai_embed_query(query_text)::vector) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;

-- Create indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_embedding ON hormozi_wisdom USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_topic ON hormozi_wisdom (topic);
CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_framework ON hormozi_wisdom (framework);
CREATE INDEX IF NOT EXISTS idx_hormozi_wisdom_business_phase ON hormozi_wisdom (business_phase);
CREATE INDEX IF NOT EXISTS idx_oracle_conversations_created ON oracle_conversations (created_at);
CREATE INDEX IF NOT EXISTS idx_success_patterns_validation ON success_patterns (validation_count);
  `);
}