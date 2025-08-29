-- Oracle Vector Search Functions
-- Created by: David Infrastructure
-- Purpose: Provide optimized vector similarity search for Oracle chat interface

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
    WHERE created_at >= NOW() - INTERVAL '%s days' % days_back
  ),
  top_queries AS (
    SELECT array_agg(query_text ORDER BY search_count DESC) as queries
    FROM (
      SELECT query_text, COUNT(*) as search_count
      FROM oracle_search_analytics 
      WHERE created_at >= NOW() - INTERVAL '%s days' % days_back
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
      WHERE created_at >= NOW() - INTERVAL '%s days' % days_back
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