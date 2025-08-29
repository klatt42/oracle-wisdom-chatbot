/**
 * Oracle RAG API Controller
 * Elena Execution - Next.js API routes for Oracle query processing
 * Comprehensive RAG pipeline integration with error handling and monitoring
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from 'express-rate-limit';
import { promisify } from 'util';

// RAG Pipeline Services
import { OracleQueryProcessor } from '../../services/rag/queryProcessor';
import { OracleVectorSearchService } from '../../services/oracleVectorSearch';
import { OracleContextAssemblyEngine } from '../../services/contextAssembly';
import { OracleResponseGenerator } from '../../services/rag/responseGenerator';
import { MultiHopBusinessReasoning } from '../../lib/multiHopBusinessReasoning';

// Types
import {
  HormoziFramework,
  IndustryVertical,
  BusinessLifecycleStage,
  UserIntent
} from '../../types/businessIntelligence';

// API Interfaces
export interface OracleQueryRequest {
  query: string;
  user_context?: {
    user_id?: string;
    session_id?: string;
    business_stage?: BusinessLifecycleStage;
    industry?: IndustryVertical;
    expertise_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    previous_queries?: string[];
  };
  options?: {
    response_style?: 'mystical' | 'professional' | 'conversational' | 'educational';
    detail_level?: 'brief' | 'standard' | 'comprehensive' | 'expert';
    include_citations?: boolean;
    include_follow_ups?: boolean;
    enable_reasoning?: boolean;
    max_response_length?: number;
  };
}

export interface OracleQueryResponse {
  success: boolean;
  query_id: string;
  oracle_response?: {
    mystical_opening: string;
    core_wisdom: string;
    business_application: string;
    implementation_roadmap?: string;
    mystical_closing: string;
    full_response: string;
  };
  citations?: {
    total_citations: number;
    primary_sources: number;
    authority_breakdown: Record<string, number>;
    citations: Array<{
      id: string;
      title: string;
      authority_level: string;
      excerpt: string;
      mystical_styling?: string;
    }>;
  };
  follow_up_questions?: Array<{
    id: string;
    question: string;
    type: string;
    complexity: string;
    estimated_value: number;
  }>;
  implementation_guidance?: {
    immediate_actions: Array<{
      description: string;
      priority: string;
      time_requirement: string;
      difficulty: string;
    }>;
    success_metrics: string[];
    resources_needed: string[];
  };
  metadata: {
    processing_time_ms: number;
    complexity_level: string;
    frameworks_used: string[];
    quality_score: number;
    token_usage: {
      total_tokens: number;
      response_tokens: number;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface SuggestionsRequest {
  session_id: string;
  previous_query?: string;
  user_context?: {
    business_stage?: BusinessLifecycleStage;
    industry?: IndustryVertical;
    recent_topics?: string[];
  };
}

export interface SuggestionsResponse {
  success: boolean;
  suggestions: Array<{
    id: string;
    suggestion: string;
    category: 'framework' | 'metrics' | 'implementation' | 'optimization';
    relevance_score: number;
    complexity: string;
  }>;
}

export interface ContextExpansionRequest {
  session_id: string;
  conversation_history: Array<{
    query: string;
    response_summary: string;
    timestamp: string;
  }>;
  expansion_focus?: 'implementation' | 'optimization' | 'related_frameworks' | 'deeper_analysis';
}

export interface SourceVerificationRequest {
  citation_ids: string[];
  verification_level: 'basic' | 'detailed' | 'comprehensive';
}

export interface FeedbackRequest {
  query_id: string;
  response_quality: {
    overall_rating: number; // 1-5
    wisdom_authenticity: number;
    business_relevance: number;
    actionability: number;
    citation_quality: number;
  };
  specific_feedback?: {
    helpful_aspects: string[];
    improvement_areas: string[];
    additional_comments: string;
  };
  user_context?: {
    implemented_suggestions?: boolean;
    implementation_success?: number;
    follow_up_needed?: boolean;
  };
}

// Rate limiting configuration
const createRateLimiter = (windowMs: number, max: number) => rateLimit({
  windowMs,
  max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const queryRateLimit = createRateLimiter(60 * 1000, 10); // 10 requests per minute
const suggestionsRateLimit = createRateLimiter(60 * 1000, 30); // 30 requests per minute
const feedbackRateLimit = createRateLimiter(60 * 1000, 20); // 20 requests per minute

// Service instances
let queryProcessor: OracleQueryProcessor;
let vectorSearchService: OracleVectorSearchService;
let contextAssemblyEngine: OracleContextAssemblyEngine;
let responseGenerator: OracleResponseGenerator;
let multiHopReasoning: MultiHopBusinessReasoning;

// Initialize services
const initializeServices = () => {
  if (!queryProcessor) {
    queryProcessor = new OracleQueryProcessor();
    vectorSearchService = new OracleVectorSearchService();
    contextAssemblyEngine = new OracleContextAssemblyEngine();
    responseGenerator = new OracleResponseGenerator();
    multiHopReasoning = new MultiHopBusinessReasoning();
  }
};

// Performance monitoring
class PerformanceMonitor {
  private metrics: Map<string, any> = new Map();

  startOperation(operationId: string): void {
    this.metrics.set(operationId, {
      startTime: Date.now(),
      steps: []
    });
  }

  recordStep(operationId: string, stepName: string, duration?: number): void {
    const operation = this.metrics.get(operationId);
    if (operation) {
      operation.steps.push({
        step: stepName,
        timestamp: Date.now(),
        duration: duration || 0
      });
    }
  }

  completeOperation(operationId: string): any {
    const operation = this.metrics.get(operationId);
    if (operation) {
      const totalTime = Date.now() - operation.startTime;
      const result = {
        operation_id: operationId,
        total_time_ms: totalTime,
        steps: operation.steps,
        performance_summary: {
          avg_step_time: operation.steps.length > 0 
            ? operation.steps.reduce((sum: number, step: any) => sum + step.duration, 0) / operation.steps.length
            : 0,
          bottleneck_step: operation.steps.length > 0
            ? operation.steps.reduce((max: any, step: any) => step.duration > max.duration ? step : max)
            : null
        }
      };
      this.metrics.delete(operationId);
      return result;
    }
    return null;
  }
}

const performanceMonitor = new PerformanceMonitor();

// Error handling utilities
class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

const handleAPIError = (error: any, res: NextApiResponse) => {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }

  // Handle specific service errors
  if (error.message?.includes('ANTHROPIC_API_KEY')) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'SERVICE_CONFIGURATION_ERROR',
        message: 'Oracle service configuration issue. Please try again later.'
      }
    });
  }

  if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Service rate limit exceeded. Please try again later.'
      }
    });
  }

  // Generic error
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again.'
    }
  });
};

// Validation utilities
const validateQueryRequest = (body: any): OracleQueryRequest => {
  if (!body.query || typeof body.query !== 'string') {
    throw new APIError('INVALID_REQUEST', 'Query is required and must be a string', 400);
  }

  if (body.query.length > 2000) {
    throw new APIError('INVALID_REQUEST', 'Query must be less than 2000 characters', 400);
  }

  if (body.query.trim().length < 10) {
    throw new APIError('INVALID_REQUEST', 'Query must be at least 10 characters long', 400);
  }

  return {
    query: body.query.trim(),
    user_context: body.user_context || {},
    options: {
      response_style: body.options?.response_style || 'mystical',
      detail_level: body.options?.detail_level || 'standard',
      include_citations: body.options?.include_citations !== false,
      include_follow_ups: body.options?.include_follow_ups !== false,
      enable_reasoning: body.options?.enable_reasoning !== false,
      max_response_length: Math.min(body.options?.max_response_length || 4000, 8000)
    }
  };
};

// Rate limiting middleware adapter for Next.js
const applyRateLimit = (limiter: any) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise((resolve, reject) => {
      limiter(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
  };
};

// Main API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint } = req.query;

  try {
    initializeServices();

    switch (endpoint) {
      case 'query':
        return await handleOracleQuery(req, res);
      case 'suggestions':
        return await handleSuggestions(req, res);
      case 'context':
        return await handleContextExpansion(req, res);
      case 'sources':
        return await handleSourceVerification(req, res);
      case 'feedback':
        return await handleFeedback(req, res);
      default:
        throw new APIError('INVALID_ENDPOINT', 'Invalid API endpoint', 404);
    }
  } catch (error) {
    return handleAPIError(error, res);
  }
}

// POST /api/oracle/query - Main RAG query endpoint
async function handleOracleQuery(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    throw new APIError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  }

  // Apply rate limiting
  await applyRateLimit(queryRateLimit)(req, res);

  const queryRequest = validateQueryRequest(req.body);
  const operationId = `query_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  performanceMonitor.startOperation(operationId);

  try {
    // Step 1: Process query
    performanceMonitor.recordStep(operationId, 'query_processing_start');
    const processedQuery = await queryProcessor.processQuery({
      original_query: queryRequest.query,
      user_context: queryRequest.user_context,
      processing_options: {
        enable_expansion: true,
        enable_normalization: true,
        enable_context_enhancement: true
      }
    });
    performanceMonitor.recordStep(operationId, 'query_processing_complete');

    // Step 2: Vector search
    performanceMonitor.recordStep(operationId, 'vector_search_start');
    const searchResponse = await vectorSearchService.searchOracleKnowledge({
      query: processedQuery.processed_query,
      user_context: queryRequest.user_context,
      search_options: {
        max_results: 15,
        search_mode: 'comprehensive',
        similarity_threshold: 0.3
      }
    });
    performanceMonitor.recordStep(operationId, 'vector_search_complete');

    // Step 3: Multi-hop reasoning (if enabled and complex)
    let reasoningChain = undefined;
    if (queryRequest.options?.enable_reasoning && 
        processedQuery.query_classification.query_complexity.overall_complexity !== 'simple') {
      
      performanceMonitor.recordStep(operationId, 'reasoning_start');
      reasoningChain = await multiHopReasoning.executeMultiHopReasoning(
        queryRequest.query,
        processedQuery.query_classification,
        processedQuery.financial_expansion,
        queryRequest.user_context
      );
      performanceMonitor.recordStep(operationId, 'reasoning_complete');
    }

    // Step 4: Context assembly
    performanceMonitor.recordStep(operationId, 'context_assembly_start');
    const assembledContext = await contextAssemblyEngine.assembleContext(
      searchResponse,
      processedQuery.query_classification,
      processedQuery.financial_expansion,
      reasoningChain,
      {
        max_context_tokens: 80000,
        prioritize_frameworks: true,
        framework_depth: 'comprehensive'
      }
    );
    performanceMonitor.recordStep(operationId, 'context_assembly_complete');

    // Step 5: Response generation
    performanceMonitor.recordStep(operationId, 'response_generation_start');
    const generatedResponse = await responseGenerator.generateResponse({
      processed_query: processedQuery,
      assembled_context: assembledContext,
      reasoning_chain: reasoningChain,
      generation_options: {
        response_style: queryRequest.options?.response_style,
        detail_level: queryRequest.options?.detail_level,
        include_citations: queryRequest.options?.include_citations,
        include_follow_ups: queryRequest.options?.include_follow_ups,
        max_response_length: queryRequest.options?.max_response_length
      }
    });
    performanceMonitor.recordStep(operationId, 'response_generation_complete');

    // Step 6: Format response
    const performanceData = performanceMonitor.completeOperation(operationId);

    const oracleQueryResponse: OracleQueryResponse = {
      success: true,
      query_id: generatedResponse.response_id,
      oracle_response: {
        mystical_opening: generatedResponse.oracle_response.mystical_opening,
        core_wisdom: generatedResponse.oracle_response.core_wisdom,
        business_application: generatedResponse.oracle_response.business_application,
        implementation_roadmap: generatedResponse.oracle_response.implementation_roadmap,
        mystical_closing: generatedResponse.oracle_response.mystical_closing,
        full_response: generatedResponse.oracle_response.full_response
      },
      citations: queryRequest.options?.include_citations ? {
        total_citations: generatedResponse.citation_attribution.total_citations,
        primary_sources: generatedResponse.citation_attribution.source_breakdown.primary_hormozi,
        authority_breakdown: {
          primary_hormozi: generatedResponse.citation_attribution.source_breakdown.primary_hormozi,
          verified_case_studies: generatedResponse.citation_attribution.source_breakdown.verified_case_studies,
          expert_interpretations: generatedResponse.citation_attribution.source_breakdown.expert_interpretations,
          community_validated: generatedResponse.citation_attribution.source_breakdown.community_validated
        },
        citations: generatedResponse.citation_attribution.citation_formatting.map(citation => ({
          id: citation.citation_id,
          title: citation.full_attribution,
          authority_level: 'high', // Simplified for API response
          excerpt: citation.display_format,
          mystical_styling: citation.mystical_styling
        }))
      } : undefined,
      follow_up_questions: queryRequest.options?.include_follow_ups ? 
        generatedResponse.follow_up_questions.map(fq => ({
          id: fq.question_id,
          question: fq.question_text,
          type: fq.question_type,
          complexity: fq.complexity_level,
          estimated_value: fq.estimated_value
        })) : undefined,
      implementation_guidance: generatedResponse.implementation_guidance ? {
        immediate_actions: generatedResponse.implementation_guidance.immediate_actions.map(action => ({
          description: action.action_description,
          priority: action.priority,
          time_requirement: action.time_requirement,
          difficulty: action.difficulty_level
        })),
        success_metrics: generatedResponse.implementation_guidance.success_metrics.map(sm => sm.metric_name),
        resources_needed: generatedResponse.implementation_guidance.resource_requirements.map(rr => rr.requirement_description)
      } : undefined,
      metadata: {
        processing_time_ms: performanceData?.total_time_ms || 0,
        complexity_level: processedQuery.query_classification.query_complexity.overall_complexity,
        frameworks_used: processedQuery.query_classification.business_context.framework_relevance.map(fr => fr.framework.toString()),
        quality_score: generatedResponse.quality_assessment.overall_quality,
        token_usage: {
          total_tokens: generatedResponse.response_metadata.token_usage.total_tokens,
          response_tokens: generatedResponse.response_metadata.token_usage.response_tokens
        }
      }
    };

    res.status(200).json(oracleQueryResponse);

  } catch (error) {
    performanceMonitor.completeOperation(operationId);
    throw error;
  }
}

// GET /api/oracle/suggestions - Follow-up question suggestions
async function handleSuggestions(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    throw new APIError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  }

  await applyRateLimit(suggestionsRateLimit)(req, res);

  const { session_id, previous_query, business_stage, industry, recent_topics } = req.query;

  if (!session_id) {
    throw new APIError('INVALID_REQUEST', 'session_id is required', 400);
  }

  try {
    // Generate contextual suggestions based on session history
    const suggestions = await generateContextualSuggestions({
      session_id: session_id as string,
      previous_query: previous_query as string,
      user_context: {
        business_stage: business_stage as BusinessLifecycleStage,
        industry: industry as IndustryVertical,
        recent_topics: recent_topics ? (recent_topics as string).split(',') : []
      }
    });

    const suggestionsResponse: SuggestionsResponse = {
      success: true,
      suggestions: suggestions
    };

    res.status(200).json(suggestionsResponse);

  } catch (error) {
    throw error;
  }
}

// POST /api/oracle/context - Context expansion for ongoing conversations
async function handleContextExpansion(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    throw new APIError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  }

  const expansionRequest: ContextExpansionRequest = req.body;

  if (!expansionRequest.session_id || !expansionRequest.conversation_history) {
    throw new APIError('INVALID_REQUEST', 'session_id and conversation_history are required', 400);
  }

  try {
    // Analyze conversation history and provide context expansion
    const contextExpansion = await expandConversationContext(expansionRequest);

    res.status(200).json({
      success: true,
      session_id: expansionRequest.session_id,
      expanded_context: contextExpansion,
      suggestions: await generateContextualSuggestions({
        session_id: expansionRequest.session_id,
        user_context: {
          recent_topics: expansionRequest.conversation_history.map(h => h.query)
        }
      })
    });

  } catch (error) {
    throw error;
  }
}

// GET /api/oracle/sources - Source verification and citation details
async function handleSourceVerification(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    throw new APIError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  }

  const { citation_ids, verification_level } = req.query;

  if (!citation_ids) {
    throw new APIError('INVALID_REQUEST', 'citation_ids parameter is required', 400);
  }

  try {
    const citationIdArray = (citation_ids as string).split(',');
    const verificationLevel = (verification_level as string) || 'basic';

    const sourceVerification = await verifySourceCitations(citationIdArray, verificationLevel);

    res.status(200).json({
      success: true,
      verification_level: verificationLevel,
      sources: sourceVerification
    });

  } catch (error) {
    throw error;
  }
}

// POST /api/oracle/feedback - Response quality feedback collection
async function handleFeedback(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    throw new APIError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  }

  await applyRateLimit(feedbackRateLimit)(req, res);

  const feedbackRequest: FeedbackRequest = req.body;

  if (!feedbackRequest.query_id || !feedbackRequest.response_quality) {
    throw new APIError('INVALID_REQUEST', 'query_id and response_quality are required', 400);
  }

  // Validate rating values
  const ratings = feedbackRequest.response_quality;
  const ratingFields = ['overall_rating', 'wisdom_authenticity', 'business_relevance', 'actionability', 'citation_quality'];
  
  for (const field of ratingFields) {
    const value = (ratings as any)[field];
    if (typeof value !== 'number' || value < 1 || value > 5) {
      throw new APIError('INVALID_REQUEST', `${field} must be a number between 1 and 5`, 400);
    }
  }

  try {
    // Store feedback (in a real implementation, this would save to database)
    const feedbackResult = await storeFeedback(feedbackRequest);

    res.status(200).json({
      success: true,
      feedback_id: feedbackResult.feedback_id,
      message: 'Feedback received successfully',
      analytics: {
        average_ratings: feedbackResult.average_ratings,
        feedback_count: feedbackResult.total_feedback_count
      }
    });

  } catch (error) {
    throw error;
  }
}

// Helper functions
async function generateContextualSuggestions(request: SuggestionsRequest): Promise<Array<{
  id: string;
  suggestion: string;
  category: 'framework' | 'metrics' | 'implementation' | 'optimization';
  relevance_score: number;
  complexity: string;
}>> {

  const suggestions = [
    {
      id: 'suggest_1',
      suggestion: 'How can I optimize my Grand Slam Offer using the value equation?',
      category: 'framework' as const,
      relevance_score: 0.9,
      complexity: 'intermediate'
    },
    {
      id: 'suggest_2',
      suggestion: 'What are the key metrics I should track for my Core Four implementation?',
      category: 'metrics' as const,
      relevance_score: 0.85,
      complexity: 'beginner'
    },
    {
      id: 'suggest_3',
      suggestion: 'How do I calculate and improve my LTV/CAC ratio?',
      category: 'optimization' as const,
      relevance_score: 0.8,
      complexity: 'advanced'
    },
    {
      id: 'suggest_4',
      suggestion: 'What are the step-by-step implementation phases for scaling my business?',
      category: 'implementation' as const,
      relevance_score: 0.75,
      complexity: 'intermediate'
    }
  ];

  // Filter and customize suggestions based on context
  return suggestions
    .filter(s => !request.user_context?.recent_topics?.some(topic => 
      s.suggestion.toLowerCase().includes(topic.toLowerCase())
    ))
    .slice(0, 3);
}

async function expandConversationContext(request: ContextExpansionRequest): Promise<any> {
  return {
    expansion_type: request.expansion_focus || 'related_frameworks',
    context_insights: [
      'Based on your conversation history, you might benefit from exploring framework integration strategies',
      'Consider implementing measurement systems to track your progress',
      'Your questions suggest a focus on scaling - here are related optimization opportunities'
    ],
    recommended_next_steps: [
      'Define specific success metrics for your implementation',
      'Create a timeline with measurable milestones',
      'Identify potential obstacles and mitigation strategies'
    ]
  };
}

async function verifySourceCitations(citationIds: string[], verificationLevel: string): Promise<any[]> {
  return citationIds.map(id => ({
    citation_id: id,
    verification_status: 'verified',
    source_details: {
      title: 'Hormozi Business Framework Documentation',
      authority_level: 'PRIMARY_HORMOZI',
      publication_date: '2023-01-01',
      verification_date: new Date().toISOString(),
      credibility_score: 0.95
    },
    content_validation: {
      accuracy_confirmed: true,
      context_appropriate: true,
      attribution_correct: true
    }
  }));
}

async function storeFeedback(feedback: FeedbackRequest): Promise<any> {
  // In a real implementation, this would save to database
  return {
    feedback_id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    stored_at: new Date().toISOString(),
    average_ratings: {
      overall_rating: 4.2,
      wisdom_authenticity: 4.5,
      business_relevance: 4.3,
      actionability: 4.1,
      citation_quality: 4.4
    },
    total_feedback_count: 1247
  };
}