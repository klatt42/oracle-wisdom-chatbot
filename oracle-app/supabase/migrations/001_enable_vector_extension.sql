-- Enable vector extension for semantic search capabilities
-- This migration sets up the foundation for Oracle's knowledge base vector storage

-- Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.environment" = 'development';