# 🔮 Oracle Knowledge Base Setup Guide

## **Overview**
This guide walks you through setting up the Supabase vector database integration for the Oracle Wisdom Chatbot, enabling semantic search of Alex Hormozi's business wisdom.

---

## **Prerequisites**
- Supabase project with database access
- OpenAI API key (for embeddings generation)
- Anthropic API key (for Claude integration)
- Node.js and npm installed

---

## **Setup Process**

### **Step 1: Environment Configuration**
1. Copy the environment variables template:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your API keys and Supabase credentials:
   ```bash
   # Anthropic Claude API
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # OpenAI API (for embeddings generation)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

### **Step 2: Supabase Database Setup**
1. Open your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the following SQL to initialize the database:

```sql
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
```

### **Step 3: Knowledge Base Processing**
1. Run the knowledge base setup script:
   ```bash
   npm run setup-kb
   ```

2. Follow the instructions to complete the database initialization

3. Once database setup is complete, uncomment the processing lines in the setup script and run again to populate the knowledge base

### **Step 4: Test the Integration**
1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Oracle interface and test with business questions like:
   - "How do I create a grand slam offer?"
   - "What are the Core Four lead generation methods?"
   - "How should I scale my business systems?"

---

## **Key Features**

### **Vector Search Capabilities**
- **Semantic Search**: Find relevant wisdom based on meaning, not just keywords
- **Context Awareness**: Filter by business context (offers, leads, scaling, mindset)
- **Citation Integration**: Automatic source attribution for credibility

### **Knowledge Base Integration**
- **Alex Hormozi Wisdom**: Complete business methodologies and frameworks
- **Success Patterns**: Documented proven strategies with results
- **Implementation Guides**: Step-by-step business building guidance
- **Business Frameworks**: Systematic approaches to value creation and scaling

### **Oracle Enhancement**
- **Dynamic Wisdom Retrieval**: Real-time knowledge base search during conversations
- **Contextual Responses**: Relevant framework application for specific challenges
- **Mystical Presentation**: Business wisdom delivered through Oracle persona

---

## **Database Schema Overview**

### **hormozi_wisdom**
Stores Alex Hormozi business wisdom with vector embeddings:
- `content`: The wisdom text content
- `source`: Source file or document reference
- `book`, `chapter`: Citation information
- `topic`: Business area (offers, leads, scaling, mindset)
- `framework`: Specific methodology (grand_slam_offers, core_four)
- `business_phase`: Applicable stage (startup, scaling, optimization)
- `embedding`: Vector representation for semantic search

### **oracle_conversations**
Tracks Oracle interactions for analytics:
- `user_message`: User query or question
- `oracle_response`: Oracle's wisdom response
- `citations`: Source references used
- `session_id`: Conversation grouping
- `user_satisfaction`: Feedback rating
- `implementation_intent`: User's action intent

### **success_patterns**
Documents proven business strategies:
- `pattern_name`: Strategy identifier
- `business_context`: Application scenario
- `implementation_steps`: Detailed execution plan
- `success_metrics`: Measurable outcomes
- `validation_count`: Success verification count

---

## **Usage Examples**

### **Business Context Detection**
The Oracle automatically detects business context from user messages:
- **Offers**: "value proposition", "pricing", "offer"
- **Leads**: "marketing", "customers", "lead generation"
- **Scaling**: "grow", "systems", "scale"
- **Mindset**: "psychology", "decisions", "thinking"

### **Citation Generation**
Citations are automatically generated from knowledge base results:
- `"$100M Offers - Alex Hormozi, Chapter 3"`
- `"Business Frameworks - Alex Hormozi Methodologies"`
- `"Success Patterns - Proven Hormozi Strategies"`

### **Vector Search Integration**
Oracle performs semantic search for each query:
1. Analyze user message for business context
2. Search knowledge base with context filtering
3. Format relevant wisdom for Claude prompt enhancement
4. Generate Oracle response with integrated knowledge
5. Provide citations for credibility and trust

---

## **Maintenance and Updates**

### **Adding New Content**
1. Add markdown files to `docs/knowledge-base/`
2. Run knowledge base processing to update vectors
3. Test Oracle responses for new content integration

### **Performance Optimization**
- Monitor vector search performance with database indexes
- Adjust similarity thresholds based on result quality
- Update embedding models for improved semantic understanding

### **Analytics and Improvement**
- Review `oracle_conversations` for common patterns
- Track user satisfaction and implementation success
- Refine knowledge base content based on usage analytics

---

## **Troubleshooting**

### **Vector Extension Issues**
- Ensure `vector` extension is enabled in Supabase
- Check database permissions for vector operations
- Verify vector index creation success

### **Embedding Generation**
- Confirm OpenAI API key is valid and has credits
- Check rate limits for embedding API calls
- Monitor embedding generation costs

### **Search Quality**
- Adjust similarity thresholds in search functions
- Review knowledge base content chunking strategy
- Test different embedding models for improved results

---

## **Oracle Knowledge Base: Ready for Business Wisdom Empire**

Your Oracle Wisdom Chatbot is now equipped with comprehensive Alex Hormozi knowledge integration, semantic search capabilities, and citation systems for credible business guidance delivery.

**Key Integration Benefits:**
- **Authentic Wisdom**: Direct Alex Hormozi methodology access
- **Contextual Intelligence**: Business-aware response generation
- **Credible Authority**: Source attribution for trust building
- **Practical Application**: Actionable business advice delivery
- **Scalable Architecture**: Expandable knowledge base system

The Oracle is ready to transform business inquiries into practical, proven strategies backed by Alex Hormozi's $100M+ business success methodologies.