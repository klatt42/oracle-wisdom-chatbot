// Oracle system types for Alex Hormozi Wisdom Chatbot

export interface OracleMessage {
  id: string;
  role: 'user' | 'oracle';
  content: string;
  citations?: string[];
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
  };
}

export interface OracleResponse {
  response: string;
  citations: string[];
  metadata?: {
    model: string;
    tokens: number;
    processingTime: number;
  };
}

export interface OracleConfig {
  model: string;
  maxTokens: number;
  temperature: number;
  systemPrompt: string;
}

export interface HormoziWisdom {
  topic: string;
  principles: string[];
  examples: string[];
  bookReferences: string[];
}

export interface VectorSearchResult {
  content: string;
  source: string;
  similarity: number;
  metadata: {
    book?: string;
    chapter?: string;
    topic?: string;
  };
}

export interface OracleSession {
  id: string;
  userId?: string;
  startTime: Date;
  lastActivity: Date;
  messageCount: number;
  topics: string[];
}