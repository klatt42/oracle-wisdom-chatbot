/**
 * Oracle RAG API Route
 * Elena Execution - Production-ready RAG query endpoint
 * Integrates all RAG components: Query Processing, Vector Search, Context Assembly, Response Ranking
 */

import { NextRequest, NextResponse } from 'next/server';
// Import only types and enums that are used in interface definitions - these won't cause build issues
import { 
  UserIntent,
  BusinessLifecycleStage,
  IndustryVertical,
  FunctionalArea
} from '../../../types/businessIntelligence';

// Type interfaces - imported types are safe for interfaces
type QueryPreprocessingRequest = {
  request_id: string;
  original_query: string;
  user_context?: UserContextData;
  preprocessing_options: PreprocessingOptions;
  optimization_targets: OptimizationTarget[];
};

type UserContextData = {
  business_stage?: BusinessLifecycleStage;
  industry?: IndustryVertical;
  functional_role?: FunctionalArea;
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  previous_queries?: string[];
  session_context?: {
    session_id: string;
    query_history: string[];
    topic_progression: string[];
    implementation_focus_areas: string[];
    current_business_challenges: string[];
  };
};

type PreprocessingOptions = {
  enable_query_expansion: boolean;
  enable_business_terminology_optimization: boolean;
  enable_framework_detection: boolean;
  enable_intent_classification: boolean;
  enable_context_enrichment: boolean;
  enable_synonym_expansion: boolean;
  enable_entity_extraction: boolean;
  enable_sentiment_analysis: boolean;
  max_query_length: number;
  preserve_user_language_style: boolean;
};

type OptimizationTarget = {
  target_type: string;
  weight: number;
};

type SemanticSearchQuery = {
  query_text: string;
  search_strategy: any;
  business_filters: any;
  performance_parameters: any;
  result_enhancement: any;
};

type AssemblyContext = {
  context_id: string;
  original_query: string;
  user_intent: string;
  business_context: any;
  source_chunks: any[];
  assembly_strategy: any;
  quality_requirements: any;
};

// API request/response interfaces
export interface OracleRAGRequest {
  query: string;
  user_context?: {
    business_stage?: BusinessLifecycleStage;
    industry?: IndustryVertical;
    functional_role?: FunctionalArea;
    experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    previous_queries?: string[];
    session_id?: string;
    user_preferences?: {
      response_style?: 'comprehensive' | 'concise' | 'action_oriented' | 'educational';
      complexity_preference?: 'beginner' | 'intermediate' | 'advanced' | 'adaptive';
      citation_detail?: 'minimal' | 'moderate' | 'detailed' | 'comprehensive';
    };
  };
  search_options?: {
    max_results?: number;
    similarity_threshold?: number;
    enable_query_expansion?: boolean;
    enable_business_optimization?: boolean;
    prioritize_frameworks?: string[];
    filter_by_complexity?: string;
  };
  response_preferences?: {
    include_implementation_guidance?: boolean;
    include_citations?: boolean;
    include_related_content?: boolean;
    response_length?: 'short' | 'medium' | 'long' | 'comprehensive';
    focus_on_actionability?: boolean;
  };
}

export interface OracleRAGResponse {
  success: boolean;
  response_id: string;
  query_id: string;
  
  // Main response content
  synthesized_answer: string;
  confidence_score: number;
  processing_time: number;
  
  // Enhanced response data
  implementation_guidance?: {
    immediate_actions: string[];
    strategic_actions: string[];
    success_metrics: string[];
    timeline: string;
  };
  
  // Source information
  citations: Array<{
    citation_text: string;
    source_type: string;
    authority_level: string;
    relevance_score: number;
  }>;
  
  source_summary: {
    total_sources: number;
    primary_frameworks: string[];
    content_types: string[];
    average_authority: number;
  };
  
  // Additional context
  related_content?: string[];
  business_context: {
    detected_intent: string;
    business_scenarios: string[];
    framework_focus: string[];
    complexity_assessment: string;
  };
  
  // Quality indicators
  quality_metrics: {
    relevance_score: number;
    completeness_score: number;
    actionability_score: number;
    business_alignment_score: number;
  };
  
  // Error handling
  warnings?: string[];
  error?: string;
  
  // Metadata
  metadata: {
    preprocessing_time: number;
    search_time: number;
    assembly_time: number;
    ranking_time: number;
    total_processing_time: number;
    cache_hit?: boolean;
    query_complexity: string;
  };
}

// Main RAG service class
class OracleRAGService {
  private ragEngine: any;
  private queryPreprocessor: any;
  private vectorSearch: any;
  private contextAssembly: any;
  private responseRanking: any;
  private initialized: boolean = false;

  constructor() {
    // Modules will be dynamically imported during initialization
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    console.log('🔮 Initializing Oracle RAG Service...');
    const initStartTime = Date.now();
    
    try {
      // Dynamic imports to avoid build-time module resolution issues
      const [
        { default: RAGQueryEngine },
        { default: QueryPreprocessor },
        { default: EnhancedVectorSearch },
        { default: ContextAssemblyEngine },
        { default: ResponseRankingSystem }
      ] = await Promise.all([
        import('../../../lib/ragQueryEngine'),
        import('../../../lib/queryPreprocessor'),
        import('../../../lib/enhancedVectorSearch'),
        import('../../../lib/contextAssemblyEngine'),
        import('../../../lib/responseRankingSystem')
      ]);
      
      // Initialize service instances
      this.ragEngine = new RAGQueryEngine();
      this.queryPreprocessor = new QueryPreprocessor();
      this.vectorSearch = new EnhancedVectorSearch();
      this.contextAssembly = new ContextAssemblyEngine();
      this.responseRanking = new ResponseRankingSystem();
      
      // Initialize the services that need async setup
      await Promise.all([
        this.ragEngine.initialize(),
        this.vectorSearch.initialize()
      ]);
      
      this.initialized = true;
      console.log(`✅ Oracle RAG Service initialized in ${Date.now() - initStartTime}ms`);
    } catch (error) {
      console.error('❌ Failed to initialize Oracle RAG Service:', error);
      throw error;
    }
  }

  async processRAGQuery(request: OracleRAGRequest): Promise<OracleRAGResponse> {
    const totalStartTime = Date.now();
    
    try {
      await this.initialize();
      
      // Step 1: Query Preprocessing
      console.log('🔄 Step 1: Query Preprocessing...');
      const preprocessingStartTime = Date.now();
      
      const preprocessingRequest: QueryPreprocessingRequest = {
        request_id: this.generateRequestId(),
        original_query: request.query,
        user_context: this.convertUserContext(request.user_context),
        preprocessing_options: this.buildPreprocessingOptions(request.search_options),
        optimization_targets: this.buildOptimizationTargets(request)
      };
      
      const processedQuery = await this.queryPreprocessor.preprocessQuery(preprocessingRequest);
      const preprocessingTime = Date.now() - preprocessingStartTime;
      
      // Step 2: Enhanced Vector Search  
      console.log('🔍 Step 2: Enhanced Vector Search...');
      const searchStartTime = Date.now();
      
      const searchQuery: SemanticSearchQuery = this.buildSearchQuery(processedQuery, request);
      const searchResults = await this.vectorSearch.search(searchQuery);
      const searchTime = Date.now() - searchStartTime;
      
      // Step 3: Context Assembly
      console.log('🔧 Step 3: Context Assembly...');
      const assemblyStartTime = Date.now();
      
      const assemblyContext: AssemblyContext = this.buildAssemblyContext(
        processedQuery, 
        searchResults, 
        request
      );
      const assembledResponse = await this.contextAssembly.assembleResponse(assemblyContext);
      const assemblyTime = Date.now() - assemblyStartTime;
      
      // Step 4: Response Ranking (if multiple candidates - simplified for single response)
      console.log('🎯 Step 4: Response Quality Assessment...');
      const rankingStartTime = Date.now();
      
      const qualityAssessment = this.assessResponseQuality(assembledResponse, processedQuery, request);
      const rankingTime = Date.now() - rankingStartTime;
      
      // Step 5: Response Formatting
      const totalProcessingTime = Date.now() - totalStartTime;
      const response = this.formatResponse(
        assembledResponse,
        processedQuery,
        searchResults,
        qualityAssessment,
        {
          preprocessing_time: preprocessingTime,
          search_time: searchTime,
          assembly_time: assemblyTime,
          ranking_time: rankingTime,
          total_processing_time: totalProcessingTime
        }
      );
      
      console.log(`✅ Oracle RAG query processed successfully in ${totalProcessingTime}ms`);
      return response;
      
    } catch (error) {
      console.error('❌ Oracle RAG query processing failed:', error);
      
      return {
        success: false,
        response_id: this.generateResponseId(),
        query_id: this.generateQueryId(),
        synthesized_answer: '',
        confidence_score: 0,
        processing_time: Date.now() - totalStartTime,
        citations: [],
        source_summary: {
          total_sources: 0,
          primary_frameworks: [],
          content_types: [],
          average_authority: 0
        },
        business_context: {
          detected_intent: 'unknown',
          business_scenarios: [],
          framework_focus: [],
          complexity_assessment: 'unknown'
        },
        quality_metrics: {
          relevance_score: 0,
          completeness_score: 0,
          actionability_score: 0,
          business_alignment_score: 0
        },
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        metadata: {
          preprocessing_time: 0,
          search_time: 0,
          assembly_time: 0,
          ranking_time: 0,
          total_processing_time: Date.now() - totalStartTime,
          query_complexity: 'unknown'
        }
      };
    }
  }

  // Helper methods for building request objects
  private convertUserContext(context?: OracleRAGRequest['user_context']): UserContextData | undefined {
    if (!context) return undefined;
    
    return {
      business_stage: context.business_stage,
      industry: context.industry,
      functional_role: context.functional_role,
      experience_level: context.experience_level,
      previous_queries: context.previous_queries,
      session_context: context.session_id ? {
        session_id: context.session_id,
        query_history: context.previous_queries || [],
        topic_progression: [],
        implementation_focus_areas: [],
        current_business_challenges: []
      } : undefined
    };
  }

  private buildPreprocessingOptions(searchOptions?: OracleRAGRequest['search_options']): PreprocessingOptions {
    return {
      enable_query_expansion: searchOptions?.enable_query_expansion ?? true,
      enable_business_terminology_optimization: searchOptions?.enable_business_optimization ?? true,
      enable_framework_detection: true,
      enable_intent_classification: true,
      enable_context_enrichment: true,
      enable_synonym_expansion: true,
      enable_entity_extraction: true,
      enable_sentiment_analysis: false,
      max_query_length: 500,
      preserve_user_language_style: true
    };
  }

  private buildOptimizationTargets(request: OracleRAGRequest): OptimizationTarget[] {
    const targets: OptimizationTarget[] = [
      { target_type: 'business_relevance', weight: 0.3 },
      { target_type: 'search_precision', weight: 0.25 }
    ];
    
    if (request.response_preferences?.focus_on_actionability) {
      targets.push({ target_type: 'implementation_focus', weight: 0.25 });
    }
    
    if (request.user_context?.experience_level === 'beginner') {
      targets.push({ target_type: 'learning_progression', weight: 0.2 });
    }
    
    return targets;
  }

  private buildSearchQuery(processedQuery: any, request: OracleRAGRequest): SemanticSearchQuery {
    return {
      query_text: processedQuery.processed_query,
      search_strategy: {
        primary_method: 'adaptive',
        fallback_methods: ['semantic', 'hybrid'],
        similarity_algorithms: [{
          algorithm_type: 'cosine',
          weight: 1.0,
          business_context_boost: true
        }],
        ranking_weights: {
          semantic_similarity: 0.25,
          business_context_match: 0.25,
          framework_relevance: 0.2,
          authority_score: 0.15,
          recency_score: 0.1,
          user_preference_alignment: 0.05,
          implementation_feasibility: 0.0
        }
      },
      business_filters: {
        lifecycle_stages: request.user_context?.business_stage ? [request.user_context.business_stage] : undefined,
        industry_verticals: request.user_context?.industry ? [request.user_context.industry] : undefined,
        functional_areas: request.user_context?.functional_role ? [request.user_context.functional_role] : undefined,
        complexity_levels: request.search_options?.filter_by_complexity ? [request.search_options.filter_by_complexity] : undefined
      },
      performance_parameters: {
        max_results: request.search_options?.max_results ?? 10,
        similarity_threshold: request.search_options?.similarity_threshold ?? 0.7,
        query_expansion: request.search_options?.enable_query_expansion ?? true,
        result_diversification: true,
        cache_duration_minutes: 60,
        timeout_seconds: 30
      },
      result_enhancement: {
        include_citations: request.response_preferences?.include_citations ?? true,
        include_relationships: true,
        include_implementation_guidance: request.response_preferences?.include_implementation_guidance ?? true,
        include_success_metrics: true,
        snippet_optimization: true,
        contextual_highlighting: true
      }
    };
  }

  private buildAssemblyContext(processedQuery: any, searchResults: any[], request: OracleRAGRequest): AssemblyContext {
    return {
      context_id: this.generateContextId(),
      original_query: request.query,
      user_intent: processedQuery.business_context.detected_intent,
      business_context: {
        business_stage: request.user_context?.business_stage,
        primary_frameworks: processedQuery.business_context.framework_indicators.map((f: any) => f.framework),
        business_scenarios: processedQuery.business_context.business_scenarios,
        implementation_focus: processedQuery.business_context.implementation_signals.length > 0,
        urgency_level: processedQuery.business_context.urgency_indicators.length > 0 ? 'high' : 'medium',
        complexity_preference: request.user_context?.experience_level === 'expert' ? 'advanced' : (request.user_context?.experience_level || 'intermediate')
      },
      source_chunks: searchResults,
      assembly_strategy: {
        synthesis_approach: this.determineSynthesisApproach(request),
        source_integration_method: 'priority',
        content_organization: this.determineContentOrganization(processedQuery.business_context.detected_intent),
        redundancy_handling: 'consolidate',
        gap_handling: 'acknowledge'
      },
      quality_requirements: {
        minimum_source_count: 2,
        maximum_response_length: this.determineMaxResponseLength(request.response_preferences?.response_length),
        citation_density: request.user_context?.user_preferences?.citation_detail === 'minimal' ? 'sparse' : (request.user_context?.user_preferences?.citation_detail === 'comprehensive' ? 'detailed' : 'moderate'),
        actionability_level: request.response_preferences?.focus_on_actionability ? 'tactical' : 'strategic',
        evidence_strength: 'moderate',
        consistency_threshold: 0.8
      }
    };
  }

  // Response formatting and quality assessment
  private assessResponseQuality(assembledResponse: any, processedQuery: any, request: OracleRAGRequest): any {
    return {
      relevance_score: assembledResponse.quality_metrics.overall_quality_score,
      completeness_score: assembledResponse.quality_metrics.information_completeness,
      actionability_score: assembledResponse.quality_metrics.actionability_score,
      business_alignment_score: assembledResponse.quality_metrics.business_relevance_score
    };
  }

  private formatResponse(
    assembledResponse: any,
    processedQuery: any,
    searchResults: any[],
    qualityAssessment: any,
    timingData: any
  ): OracleRAGResponse {
    
    return {
      success: true,
      response_id: this.generateResponseId(),
      query_id: processedQuery.processed_query_id,
      
      synthesized_answer: assembledResponse.synthesized_content.detailed_explanation,
      confidence_score: assembledResponse.confidence_assessment.overall_confidence,
      processing_time: timingData.total_processing_time,
      
      implementation_guidance: {
        immediate_actions: assembledResponse.implementation_roadmap.immediate_actions.map((a: any) => a.action_description).slice(0, 3),
        strategic_actions: assembledResponse.implementation_roadmap.short_term_actions.map((a: any) => a.action_description).slice(0, 3),
        success_metrics: assembledResponse.implementation_roadmap.success_milestones.map((m: any) => m.milestone_description).slice(0, 3),
        timeline: this.estimateImplementationTimeline(assembledResponse.implementation_roadmap)
      },
      
      citations: assembledResponse.source_integration.citation_network.primary_citations.map((citation: any) => ({
        citation_text: citation.citation_text,
        source_type: citation.source_type,
        authority_level: citation.authority_level,
        relevance_score: citation.relevance_to_query
      })),
      
      source_summary: {
        total_sources: searchResults.length,
        primary_frameworks: [...new Set(searchResults.flatMap((r: any) => r.framework_tags || []))].slice(0, 3),
        content_types: [...new Set(searchResults.map((r: any) => r.category_name))].slice(0, 3),
        average_authority: searchResults.reduce((sum: number, r: any) => sum + (r.authority_score || 0.8), 0) / searchResults.length
      },
      
      related_content: assembledResponse.synthesized_content.supporting_evidence
        .map((evidence: any) => evidence.evidence_text)
        .slice(0, 3),
      
      business_context: {
        detected_intent: processedQuery.business_context.detected_intent,
        business_scenarios: processedQuery.business_context.business_scenarios,
        framework_focus: processedQuery.business_context.framework_indicators.map((f: any) => f.framework),
        complexity_assessment: processedQuery.business_context.complexity_assessment.query_complexity
      },
      
      quality_metrics: qualityAssessment,
      
      warnings: assembledResponse.assembly_metadata.assembly_warnings,
      
      metadata: {
        ...timingData,
        query_complexity: processedQuery.business_context.complexity_assessment.query_complexity
      }
    };
  }

  // Helper utility methods
  private generateRequestId(): string { return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; }
  private generateResponseId(): string { return `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; }
  private generateQueryId(): string { return `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; }
  private generateContextId(): string { return `ctx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`; }
  
  private determineSynthesisApproach(request: OracleRAGRequest): 'comprehensive' | 'focused' | 'layered' | 'comparative' {
    if (request.response_preferences?.response_length === 'comprehensive') return 'comprehensive';
    if (request.response_preferences?.focus_on_actionability) return 'focused';
    return 'layered';
  }
  
  private determineContentOrganization(intent: UserIntent): 'framework_based' | 'action_oriented' | 'problem_solution' | 'educational' {
    switch (intent) {
      case UserIntent.IMPLEMENTATION: return 'action_oriented';
      case UserIntent.TROUBLESHOOTING: return 'problem_solution';
      case UserIntent.LEARNING: return 'educational';
      default: return 'framework_based';
    }
  }
  
  private determineMaxResponseLength(preference?: string): number {
    switch (preference) {
      case 'short': return 500;
      case 'medium': return 1000;
      case 'long': return 2000;
      case 'comprehensive': return 4000;
      default: return 1500;
    }
  }
  
  private estimateImplementationTimeline(roadmap: any): string {
    const totalActions = roadmap.immediate_actions.length + roadmap.short_term_actions.length + roadmap.long_term_actions.length;
    if (totalActions <= 3) return '1-2 weeks';
    if (totalActions <= 6) return '2-4 weeks';
    if (totalActions <= 10) return '1-2 months';
    return '2-3 months';
  }
}

// Global service instance
const oracleRAGService = new OracleRAGService();

// API route handlers
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Oracle RAG API is operational',
    version: '1.0.0',
    endpoints: {
      'POST /api/oracle-rag': 'Main RAG query endpoint'
    },
    capabilities: [
      'Advanced query preprocessing with business terminology optimization',
      'Multi-strategy vector search with semantic understanding', 
      'Context assembly from multiple sources',
      'Business-focused response ranking',
      'Implementation guidance generation',
      'Framework-based content organization'
    ]
  });
}

export async function POST(request: NextRequest) {
  try {
    const body: OracleRAGRequest = await request.json();
    
    // Validate request
    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid query parameter'
      }, { status: 400 });
    }
    
    // Process RAG query
    const response = await oracleRAGService.processRAGQuery(body);
    
    return NextResponse.json(response, { 
      status: response.success ? 200 : 500,
      headers: {
        'Content-Type': 'application/json',
        'X-Processing-Time': response.processing_time.toString(),
        'X-Response-ID': response.response_id
      }
    });
    
  } catch (error) {
    console.error('Oracle RAG API error:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

// Rate limiting and caching would be implemented here in production
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';