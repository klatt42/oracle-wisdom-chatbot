# 🔮 Oracle Vector Database Setup Guide
**Created by**: David Infrastructure  
**Purpose**: Supabase vector database configuration for Hormozi wisdom content

## 🚀 Quick Start

### 1. Database Setup

**Run Supabase Migrations:**
```bash
# Navigate to your Supabase project and run migrations
supabase migration up

# Or apply manually in Supabase SQL editor:
# 1. Copy content from supabase/migrations/001_enable_vector_extension.sql
# 2. Copy content from supabase/migrations/002_create_oracle_knowledge_schema.sql  
# 3. Copy content from supabase/migrations/003_create_vector_search_functions.sql
```

### 2. Environment Configuration

**Copy and configure environment variables:**
```bash
cp .env.example .env.local
```

**Required API Keys:**
- **Supabase**: Get from your Supabase project settings
- **OpenAI**: Required for text-embedding-3-small model
- **Anthropic** (Optional): For enhanced Oracle chat responses

### 3. Process Hormozi Content

**Generate vector embeddings for all processed content:**
```bash
# Process all categories
npm run embed-content

# Process specific category
npm run embed-category hormozi-wisdom

# Test vector search functionality
npm run test-vectors
```

## 📊 Database Schema

### Core Tables

**`oracle_categories`**
- Predefined knowledge categories (hormozi-wisdom, business-frameworks, etc.)

**`oracle_knowledge`**
- Main content storage with 1536-dimension embeddings
- Supports both direct content and YouTube transcripts
- Includes business intelligence metadata

**`oracle_processing_history`**
- Processing session tracking and analytics

**`oracle_search_analytics`**
- Search query performance and popularity metrics

### Vector Search Functions

**`oracle_semantic_search()`**
- Pure vector similarity search with category filtering

**`oracle_hybrid_search()`**
- Combines vector similarity with PostgreSQL full-text search

**`oracle_framework_search()`**
- Framework-specific content discovery

**`oracle_youtube_search()`**
- YouTube content with timestamp filtering

## 🔍 API Endpoints

### Search API
```bash
# Semantic search
POST /api/oracle-search
{
  "query": "How to increase customer lifetime value",
  "searchType": "semantic",
  "options": {
    "maxResults": 5,
    "categoryFilter": "business-frameworks"
  }
}

# Quick GET search
GET /api/oracle-search?q=scaling+business&category=hormozi-wisdom
```

### Chat API
```bash
# Enhanced Oracle chat
POST /api/oracle-chat
{
  "message": "How do I build resilience in business?",
  "options": {
    "maxSearchResults": 3,
    "includeYouTubeContent": true
  }
}

# Get conversation history
GET /api/oracle-chat?action=history

# Get search suggestions
GET /api/oracle-chat?action=suggestions&query=business
```

## 📈 Content Processing Pipeline

### 1. Content Organization (Elena Execution)
```bash
npm run process-content
```
- Organizes raw MD files into knowledge categories
- Creates YouTube processing queue
- Generates content metadata

### 2. YouTube Transcript Extraction (David Infrastructure) 
```bash
npm run process-youtube batch
```
- Extracts transcripts from YouTube queue
- Creates timestamped content chunks
- Integrates with vector database

### 3. Vector Embedding Generation (David Infrastructure)
```bash
npm run embed-content
```
- Generates OpenAI embeddings for all content
- Creates optimized content chunks
- Stores in Supabase vector database

## 🎯 Integration Examples

### React Component Integration
```typescript
import { OracleChat } from '@/lib/oracleChat';

const ChatComponent = () => {
  const [oracle] = useState(() => new OracleChat());
  
  useEffect(() => {
    oracle.initialize();
  }, []);
  
  const handleMessage = async (message: string) => {
    const response = await oracle.generateResponse(message, {
      maxSearchResults: 3,
      categoryFilter: 'hormozi-wisdom'
    });
    
    // response.metadata contains search results and sources
    return response.content;
  };
};
```

### Direct Vector Search
```typescript
import { OracleVectorDB } from '@/lib/oracleVectorDB';

const searchOracle = async (query: string) => {
  const vectorDB = new OracleVectorDB();
  await vectorDB.initialize();
  
  const results = await vectorDB.semanticSearch(query, {
    maxResults: 5,
    categoryFilter: 'business-frameworks'
  });
  
  return results.map(r => ({
    title: r.title,
    content: r.content_preview,
    similarity: r.similarity_score,
    source: r.youtube_url || r.source_file
  }));
};
```

## 🔧 Performance Optimization

### Index Configuration
```sql
-- Vector similarity index (automatically created)
CREATE INDEX oracle_knowledge_embedding_idx 
ON oracle_knowledge 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Content search indexes
CREATE INDEX oracle_knowledge_content_idx 
ON oracle_knowledge 
USING GIN (to_tsvector('english', content));
```

### Embedding Optimization
- **Chunk Size**: 1000 characters optimal for OpenAI embeddings
- **Overlap**: 200 characters between chunks for context preservation
- **Model**: text-embedding-3-small for cost-effectiveness
- **Similarity Threshold**: 0.8 for high relevance, 0.7 for broader results

## 📊 Analytics and Monitoring

### Processing Statistics
```bash
# View embedding processing history
SELECT * FROM oracle_processing_history ORDER BY created_at DESC LIMIT 10;

# Content distribution by category
SELECT 
  oc.name,
  COUNT(*) as chunks,
  SUM(ok.word_count) as total_words
FROM oracle_knowledge ok
JOIN oracle_categories oc ON ok.category_id = oc.id
GROUP BY oc.name;
```

### Search Analytics
```bash
# Popular search queries
SELECT query_text, COUNT(*) as frequency 
FROM oracle_search_analytics 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY query_text 
ORDER BY frequency DESC 
LIMIT 10;

# Search performance metrics
SELECT 
  AVG(search_time_ms) as avg_search_time,
  AVG(results_found) as avg_results,
  AVG(top_similarity_score) as avg_similarity
FROM oracle_search_analytics 
WHERE created_at >= NOW() - INTERVAL '24 hours';
```

## 🚨 Troubleshooting

### Common Issues

**1. Vector Extension Not Enabled**
```sql
-- Check if vector extension is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Enable if missing
CREATE EXTENSION IF NOT EXISTS vector;
```

**2. Embedding Generation Fails**
- Verify OpenAI API key in environment variables
- Check API rate limits and quotas
- Ensure content chunks are under 8000 tokens

**3. Search Returns No Results**
- Lower similarity threshold (try 0.7 or 0.6)
- Check if content has been embedded
- Verify category filters are correct

**4. Performance Issues**
- Rebuild vector indexes if needed
- Consider increasing Supabase compute resources
- Monitor embedding costs and optimize chunk sizes

## 🎯 Success Metrics

**Vector Database Status:**
✅ **Supabase vector extension**: Configured and operational  
✅ **Oracle knowledge schema**: All tables and indexes created  
✅ **Embedding pipeline**: OpenAI integration functional  
✅ **Vector search API**: Semantic and hybrid search ready  
✅ **Oracle chat integration**: Enhanced with Hormozi wisdom context  

**Expected Performance:**
- **Search Response Time**: < 200ms for semantic queries
- **Embedding Generation**: ~50 chunks per minute
- **Search Accuracy**: >0.8 similarity for relevant results
- **Content Coverage**: 100% of processed Hormozi content indexed

---

**Created by**: David Infrastructure - Oracle Vector Database System  
**Integration**: Elena Execution (content), Alice Intelligence (structure)  
**Purpose**: Deliver searchable Hormozi wisdom through advanced vector semantics