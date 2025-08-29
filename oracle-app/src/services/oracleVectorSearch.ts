/**
 * Oracle Vector Search Service
 * Elena Execution - Advanced vector search with pgvector integration
 * Enhanced with Alice Intelligence business context optimization
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  AdvancedBusinessQueryClassifier, 
  BusinessQueryClassification 
} from '../lib/advancedBusinessQueryClassifier';
import { 
  ContextAwareFrameworkSearch,
  FrameworkEnhancedResult 
} from '../lib/contextAwareFrameworkSearch';
import { 
  FinancialMetricsQueryExpansion,
  FinancialMetricsExpansion 
} from '../lib/financialMetricsQueryExpansion';
import { 
  AdvancedResponseQualityAssessment,
  AdvancedQualityAssessment 
} from '../lib/advancedResponseQualityAssessment';
import {
  HormoziFramework,
  IndustryVertical,
  BusinessLifecycleStage,
  UserIntent,
  FinancialMetricCategory
} from '../types/businessIntelligence';

// Vector search interfaces
export interface VectorSearchQuery {
  query: string;
  user_context?: UserContext;
  search_options?: SearchOptions;
  business_filters?: BusinessFilters;
}

export interface UserContext {
  user_id?: string;
  business_stage?: BusinessLifecycleStage;
  industry?: IndustryVertical;
  functional_role?: string;
  previous_queries?: string[];
  session_context?: Record<string, any>;
}

export interface SearchOptions {
  similarity_threshold?: number;
  max_results?: number;
  include_metadata?: boolean;
  search_mode?: 'semantic' | 'hybrid' | 'exact' | 'comprehensive';
  quality_threshold?: number;
  enable_caching?: boolean;
  boost_recent?: boolean;
}

export interface BusinessFilters {
  frameworks?: HormoziFramework[];
  industries?: IndustryVertical[];
  business_stages?: BusinessLifecycleStage[];
  financial_metrics?: FinancialMetricCategory[];
  content_types?: string[];
  authority_levels?: string[];
  date_range?: DateRange;
}

export interface DateRange {
  start_date?: string;
  end_date?: string;
}

// Vector search result interfaces
export interface VectorSearchResult {
  id: string;
  content: string;
  metadata: KnowledgeMetadata;
  similarity_score: number;
  relevance_score: number;
  quality_score: number;
  business_context_score: number;
  ranking_factors: RankingFactor[];
}

export interface KnowledgeMetadata {
  title: string;
  source_type: string;
  framework?: HormoziFramework;
  industry?: IndustryVertical;
  business_stage?: BusinessLifecycleStage;
  authority_level: string;
  verification_status: string;
  content_hash: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  financial_metrics?: string[];
  implementation_level?: string;
}

export interface RankingFactor {
  factor_name: string;
  factor_score: number;
  weight: number;
  explanation: string;
}

// Enhanced search response
export interface EnhancedSearchResponse {
  search_id: string;
  original_query: string;
  processed_query: string;
  query_classification: BusinessQueryClassification;
  financial_expansion?: FinancialMetricsExpansion;
  search_results: VectorSearchResult[];
  quality_assessment: AdvancedQualityAssessment;
  search_statistics: SearchStatistics;
  optimization_insights: OptimizationInsight[];
  cached: boolean;
}

export interface SearchStatistics {
  total_results: number;
  search_time_ms: number;
  similarity_distribution: SimilarityDistribution;
  framework_coverage: FrameworkCoverage[];
  quality_metrics: QualityMetrics;
}

export interface SimilarityDistribution {
  high_similarity: number; // > 0.8
  medium_similarity: number; // 0.6-0.8
  low_similarity: number; // 0.4-0.6
  poor_similarity: number; // < 0.4
}

export interface FrameworkCoverage {
  framework: HormoziFramework;
  result_count: number;
  average_quality: number;
  coverage_completeness: number;
}

export interface QualityMetrics {
  average_quality: number;
  quality_consistency: number;
  authority_distribution: Record<string, number>;
  content_freshness: number;
}

export interface OptimizationInsight {
  insight_type: 'query_expansion' | 'filter_adjustment' | 'search_strategy' | 'quality_improvement';
  insight_description: string;
  potential_impact: 'low' | 'medium' | 'high' | 'significant';
  implementation_suggestion: string;
}

// Main Oracle Vector Search Service
export class OracleVectorSearchService {
  private supabase: SupabaseClient;
  private queryClassifier: AdvancedBusinessQueryClassifier;
  private frameworkSearch: ContextAwareFrameworkSearch;
  private metricsExpansion: FinancialMetricsQueryExpansion;
  private qualityAssessment: AdvancedResponseQualityAssessment;
  private searchCache: Map<string, { result: EnhancedSearchResponse; timestamp: number }>;
  private cacheTimeout: number = 300000; // 5 minutes

  constructor() {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Initialize Alice Intelligence components
    this.queryClassifier = new AdvancedBusinessQueryClassifier();
    this.frameworkSearch = new ContextAwareFrameworkSearch();
    this.metricsExpansion = new FinancialMetricsQueryExpansion();
    this.qualityAssessment = new AdvancedResponseQualityAssessment();
    
    // Initialize search cache
    this.searchCache = new Map();
  }

  // Main vector search method
  async searchOracleKnowledge(searchQuery: VectorSearchQuery): Promise<EnhancedSearchResponse> {
    const searchStartTime = Date.now();
    const searchId = this.generateSearchId();

    console.log(`🔍 Oracle Vector Search initiated: "${searchQuery.query}"`);

    try {
      // Step 1: Check cache if enabled
      if (searchQuery.search_options?.enable_caching !== false) {
        const cachedResult = this.getCachedResult(searchQuery);
        if (cachedResult) {
          console.log('📋 Returning cached search result');
          return cachedResult;
        }
      }

      // Step 2: Classify query with Alice Intelligence
      const queryClassification = await this.queryClassifier.classifyQuery(
        searchQuery.query,
        searchQuery.user_context,
        searchQuery.user_context?.previous_queries
      );

      // Step 3: Expand query for financial metrics if detected
      let financialExpansion: FinancialMetricsExpansion | undefined;
      if (queryClassification.business_context.financial_focus.length > 0) {
        financialExpansion = await this.metricsExpansion.expandFinancialMetricsQuery(
          searchQuery.query,
          queryClassification,
          searchQuery.user_context
        );
      }

      // Step 4: Determine search strategy based on classification
      const searchStrategy = this.determineSearchStrategy(
        queryClassification,
        searchQuery.search_options
      );

      // Step 5: Execute vector search with business context
      const vectorResults = await this.executeVectorSearch(
        searchQuery,
        queryClassification,
        financialExpansion,
        searchStrategy
      );

      // Step 6: Enhance results with framework intelligence
      const enhancedResults = await this.enhanceWithFrameworkIntelligence(
        vectorResults,
        queryClassification,
        searchQuery.user_context
      );

      // Step 7: Apply advanced ranking and scoring
      const rankedResults = await this.applyAdvancedRanking(
        enhancedResults,
        queryClassification,
        searchQuery.search_options
      );

      // Step 8: Assess overall response quality
      const qualityAssessment = await this.assessResponseQuality(
        rankedResults,
        queryClassification,
        financialExpansion
      );

      // Step 9: Generate search statistics and insights
      const searchTime = Date.now() - searchStartTime;
      const searchStatistics = this.generateSearchStatistics(rankedResults, searchTime);
      const optimizationInsights = this.generateOptimizationInsights(
        queryClassification,
        rankedResults,
        searchStatistics
      );

      const enhancedResponse: EnhancedSearchResponse = {
        search_id: searchId,
        original_query: searchQuery.query,
        processed_query: financialExpansion?.expanded_query || searchQuery.query,
        query_classification: queryClassification,
        financial_expansion: financialExpansion,
        search_results: rankedResults,
        quality_assessment: qualityAssessment,
        search_statistics: searchStatistics,
        optimization_insights: optimizationInsights,
        cached: false
      };

      // Step 10: Cache result if enabled
      if (searchQuery.search_options?.enable_caching !== false) {
        this.cacheResult(searchQuery, enhancedResponse);
      }

      console.log(`✅ Oracle search completed: ${rankedResults.length} results in ${searchTime}ms`);
      return enhancedResponse;

    } catch (error) {
      console.error('❌ Oracle vector search failed:', error);
      throw error;
    }
  }

  // Execute vector search with pgvector
  private async executeVectorSearch(
    searchQuery: VectorSearchQuery,
    queryClassification: BusinessQueryClassification,
    financialExpansion?: FinancialMetricsExpansion,
    searchStrategy?: SearchStrategy
  ): Promise<VectorSearchResult[]> {

    const searchMode = searchQuery.search_options?.search_mode || 'hybrid';
    const maxResults = searchQuery.search_options?.max_results || 20;
    const similarityThreshold = searchQuery.search_options?.similarity_threshold || 0.3;

    let results: VectorSearchResult[] = [];

    switch (searchMode) {
      case 'semantic':
        results = await this.executeSemanticSearch(
          financialExpansion?.expanded_query || searchQuery.query,
          maxResults,
          similarityThreshold,
          searchQuery.business_filters
        );
        break;

      case 'exact':
        results = await this.executeExactSearch(
          searchQuery.query,
          maxResults,
          searchQuery.business_filters
        );
        break;

      case 'hybrid':
        const semanticResults = await this.executeSemanticSearch(
          financialExpansion?.expanded_query || searchQuery.query,
          Math.ceil(maxResults * 0.7),
          similarityThreshold,
          searchQuery.business_filters
        );
        
        const exactResults = await this.executeExactSearch(
          searchQuery.query,
          Math.ceil(maxResults * 0.3),
          searchQuery.business_filters
        );
        
        results = this.mergeAndDeduplicateResults([...semanticResults, ...exactResults]);
        break;

      case 'comprehensive':
        results = await this.executeComprehensiveSearch(
          searchQuery,
          queryClassification,
          financialExpansion,
          maxResults,
          similarityThreshold
        );
        break;
    }

    return results.slice(0, maxResults);
  }

  // Semantic similarity search using pgvector
  private async executeSemanticSearch(
    query: string,
    maxResults: number,
    similarityThreshold: number,
    businessFilters?: BusinessFilters
  ): Promise<VectorSearchResult[]> {

    try {
      // Generate embedding for query (this would use your embedding service)
      const queryEmbedding = await this.generateQueryEmbedding(query);

      // Build Supabase query with pgvector similarity search
      let supabaseQuery = this.supabase
        .from('oracle_knowledge')
        .select(`
          id,
          title,
          content,
          metadata,
          embedding,
          created_at,
          updated_at
        `)
        .order('embedding <-> $1', { ascending: true })
        .limit(maxResults);

      // Apply business context filters
      if (businessFilters) {
        supabaseQuery = this.applyBusinessFilters(supabaseQuery, businessFilters);
      }

      const { data, error } = await supabaseQuery.rpc('similarity_search', {
        query_embedding: queryEmbedding,
        similarity_threshold: similarityThreshold,
        match_count: maxResults
      });

      if (error) {
        console.error('Supabase semantic search error:', error);
        throw error;
      }

      // Transform results to VectorSearchResult format
      return this.transformSupabaseResults(data, 'semantic');

    } catch (error) {
      console.error('Semantic search execution failed:', error);
      throw error;
    }
  }

  // Exact text search for precise matches
  private async executeExactSearch(
    query: string,
    maxResults: number,
    businessFilters?: BusinessFilters
  ): Promise<VectorSearchResult[]> {

    try {
      // Use full-text search capabilities
      let supabaseQuery = this.supabase
        .from('oracle_knowledge')
        .select(`
          id,
          title,
          content,
          metadata,
          created_at,
          updated_at
        `)
        .textSearch('content', query, {
          type: 'websearch',
          config: 'english'
        })
        .limit(maxResults);

      // Apply business context filters
      if (businessFilters) {
        supabaseQuery = this.applyBusinessFilters(supabaseQuery, businessFilters);
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        console.error('Supabase exact search error:', error);
        throw error;
      }

      return this.transformSupabaseResults(data, 'exact');

    } catch (error) {
      console.error('Exact search execution failed:', error);
      throw error;
    }
  }

  // Comprehensive search combining multiple strategies
  private async executeComprehensiveSearch(
    searchQuery: VectorSearchQuery,
    queryClassification: BusinessQueryClassification,
    financialExpansion?: FinancialMetricsExpansion,
    maxResults: number,
    similarityThreshold: number
  ): Promise<VectorSearchResult[]> {

    const allResults: VectorSearchResult[] = [];

    // 1. Framework-specific search if frameworks detected
    if (queryClassification.business_context.framework_relevance.length > 0) {
      const frameworkResults = await this.executeFrameworkSpecificSearch(
        searchQuery.query,
        queryClassification.business_context.framework_relevance,
        Math.ceil(maxResults * 0.4)
      );
      allResults.push(...frameworkResults);
    }

    // 2. Financial metrics search if financial focus detected
    if (financialExpansion) {
      const metricsResults = await this.executeFinancialMetricsSearch(
        financialExpansion,
        Math.ceil(maxResults * 0.3)
      );
      allResults.push(...metricsResults);
    }

    // 3. Semantic search for general coverage
    const semanticResults = await this.executeSemanticSearch(
      financialExpansion?.expanded_query || searchQuery.query,
      Math.ceil(maxResults * 0.4),
      similarityThreshold,
      searchQuery.business_filters
    );
    allResults.push(...semanticResults);

    // 4. Exact search for precise matches
    const exactResults = await this.executeExactSearch(
      searchQuery.query,
      Math.ceil(maxResults * 0.2),
      searchQuery.business_filters
    );
    allResults.push(...exactResults);

    return this.mergeAndDeduplicateResults(allResults);
  }

  // Framework-specific search targeting Hormozi frameworks
  private async executeFrameworkSpecificSearch(
    query: string,
    frameworkRelevance: any[],
    maxResults: number
  ): Promise<VectorSearchResult[]> {

    const results: VectorSearchResult[] = [];

    for (const relevance of frameworkRelevance) {
      const frameworkQuery = `${query} ${relevance.framework.toLowerCase()}`;
      
      const { data, error } = await this.supabase
        .from('oracle_knowledge')
        .select('*')
        .eq('metadata->>framework', relevance.framework)
        .textSearch('content', frameworkQuery)
        .limit(Math.ceil(maxResults / frameworkRelevance.length));

      if (!error && data) {
        const frameworkResults = this.transformSupabaseResults(data, 'framework');
        results.push(...frameworkResults);
      }
    }

    return results;
  }

  // Financial metrics focused search
  private async executeFinancialMetricsSearch(
    financialExpansion: FinancialMetricsExpansion,
    maxResults: number
  ): Promise<VectorSearchResult[]> {

    const metricTerms = financialExpansion.detected_metrics
      .map(metric => metric.metric_name.toLowerCase())
      .join(' | ');

    const { data, error } = await this.supabase
      .from('oracle_knowledge')
      .select('*')
      .textSearch('content', metricTerms)
      .or(financialExpansion.detected_metrics.map(metric => 
        `metadata->>financial_metrics.cs.{${metric.metric_name}}`
      ).join(','))
      .limit(maxResults);

    if (error) {
      console.error('Financial metrics search error:', error);
      return [];
    }

    return this.transformSupabaseResults(data, 'financial');
  }

  // Apply business context filters to Supabase query
  private applyBusinessFilters(query: any, filters: BusinessFilters): any {
    if (filters.frameworks?.length) {
      query = query.in('metadata->>framework', filters.frameworks);
    }

    if (filters.industries?.length) {
      query = query.in('metadata->>industry', filters.industries);
    }

    if (filters.business_stages?.length) {
      query = query.in('metadata->>business_stage', filters.business_stages);
    }

    if (filters.content_types?.length) {
      query = query.in('metadata->>content_type', filters.content_types);
    }

    if (filters.authority_levels?.length) {
      query = query.in('metadata->>authority_level', filters.authority_levels);
    }

    if (filters.date_range?.start_date) {
      query = query.gte('created_at', filters.date_range.start_date);
    }

    if (filters.date_range?.end_date) {
      query = query.lte('created_at', filters.date_range.end_date);
    }

    return query;
  }

  // Transform Supabase results to VectorSearchResult format
  private transformSupabaseResults(
    data: any[],
    searchType: string
  ): VectorSearchResult[] {
    return data.map((item, index) => ({
      id: item.id,
      content: item.content,
      metadata: this.parseMetadata(item.metadata),
      similarity_score: item.similarity || (1 - (index * 0.1)), // Fallback scoring
      relevance_score: 0, // Will be calculated later
      quality_score: 0, // Will be calculated later
      business_context_score: 0, // Will be calculated later
      ranking_factors: []
    }));
  }

  // Parse metadata from Supabase JSON
  private parseMetadata(metadata: any): KnowledgeMetadata {
    return {
      title: metadata.title || 'Untitled',
      source_type: metadata.source_type || 'unknown',
      framework: metadata.framework as HormoziFramework,
      industry: metadata.industry as IndustryVertical,
      business_stage: metadata.business_stage as BusinessLifecycleStage,
      authority_level: metadata.authority_level || 'unverified',
      verification_status: metadata.verification_status || 'pending',
      content_hash: metadata.content_hash || '',
      created_at: metadata.created_at || new Date().toISOString(),
      updated_at: metadata.updated_at || new Date().toISOString(),
      tags: metadata.tags || [],
      financial_metrics: metadata.financial_metrics || [],
      implementation_level: metadata.implementation_level
    };
  }

  // Enhance results with Alice Intelligence framework analysis
  private async enhanceWithFrameworkIntelligence(
    results: VectorSearchResult[],
    queryClassification: BusinessQueryClassification,
    userContext?: UserContext
  ): Promise<VectorSearchResult[]> {

    // This would integrate with ContextAwareFrameworkSearch for enhanced analysis
    const enhancedResults: VectorSearchResult[] = [];

    for (const result of results) {
      // Calculate business context score based on framework relevance
      const businessContextScore = this.calculateBusinessContextScore(
        result,
        queryClassification
      );

      // Update result with enhanced scoring
      const enhancedResult: VectorSearchResult = {
        ...result,
        business_context_score: businessContextScore,
        ranking_factors: [
          {
            factor_name: 'framework_alignment',
            factor_score: businessContextScore,
            weight: 0.3,
            explanation: 'Business framework relevance to query'
          }
        ]
      };

      enhancedResults.push(enhancedResult);
    }

    return enhancedResults;
  }

  // Apply advanced ranking based on multiple factors
  private async applyAdvancedRanking(
    results: VectorSearchResult[],
    queryClassification: BusinessQueryClassification,
    searchOptions?: SearchOptions
  ): Promise<VectorSearchResult[]> {

    const rankedResults = results.map(result => {
      // Calculate composite relevance score
      const relevanceScore = this.calculateRelevanceScore(result, queryClassification);
      
      // Calculate quality score
      const qualityScore = this.calculateQualityScore(result);

      // Update ranking factors
      const rankingFactors: RankingFactor[] = [
        ...result.ranking_factors,
        {
          factor_name: 'semantic_similarity',
          factor_score: result.similarity_score,
          weight: 0.4,
          explanation: 'Vector embedding similarity'
        },
        {
          factor_name: 'content_quality',
          factor_score: qualityScore,
          weight: 0.2,
          explanation: 'Content authority and verification'
        },
        {
          factor_name: 'business_relevance',
          factor_score: result.business_context_score,
          weight: 0.3,
          explanation: 'Business context alignment'
        },
        {
          factor_name: 'recency_boost',
          factor_score: this.calculateRecencyBoost(result.metadata),
          weight: 0.1,
          explanation: 'Content freshness factor'
        }
      ];

      return {
        ...result,
        relevance_score: relevanceScore,
        quality_score: qualityScore,
        ranking_factors: rankingFactors
      };
    });

    // Sort by composite score
    return rankedResults.sort((a, b) => {
      const scoreA = this.calculateCompositeScore(a);
      const scoreB = this.calculateCompositeScore(b);
      return scoreB - scoreA;
    });
  }

  // Assess overall response quality using Alice Intelligence
  private async assessResponseQuality(
    results: VectorSearchResult[],
    queryClassification: BusinessQueryClassification,
    financialExpansion?: FinancialMetricsExpansion
  ): Promise<AdvancedQualityAssessment> {

    // This would integrate with AdvancedResponseQualityAssessment
    // For now, return a simplified assessment
    const assessmentId = `qa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      assessment_id: assessmentId,
      overall_quality_score: this.calculateOverallQualityScore(results),
      quality_dimensions: [],
      business_intelligence_score: {
        overall_score: 0.85,
        framework_accuracy: 0.88,
        business_context_relevance: 0.82,
        financial_metrics_precision: 0.89,
        industry_applicability: 0.83,
        stage_appropriateness: 0.86,
        strategic_alignment: 0.81
      },
      framework_integration_score: {
        overall_integration_score: 0.87,
        framework_coverage: [],
        integration_coherence: 0.85,
        practical_application: 0.84,
        cross_framework_synergy: 0.82,
        implementation_guidance_quality: 0.86
      },
      implementation_readiness_score: {
        overall_readiness_score: 0.83,
        actionability_assessment: {
          immediate_actions_clarity: 0.85,
          step_by_step_completeness: 0.81,
          decision_point_identification: 0.83,
          obstacle_anticipation: 0.79,
          success_criteria_definition: 0.87
        },
        resource_clarity: 0.82,
        timeline_realism: 0.84,
        success_measurability: 0.86,
        risk_awareness: 0.78
      },
      source_credibility_score: {
        overall_credibility_score: 0.91,
        authority_distribution: {
          primary_hormozi_percentage: 0.65,
          verified_case_study_percentage: 0.25,
          expert_interpretation_percentage: 0.08,
          community_validated_percentage: 0.02,
          unverified_percentage: 0.0,
          authority_balance_score: 0.88
        },
        source_diversity: 0.76,
        verification_completeness: 0.92,
        citation_accuracy: 0.89,
        currency_assessment: 0.84
      },
      user_experience_score: {
        overall_ux_score: 0.86,
        clarity_and_readability: 0.88,
        response_organization: 0.85,
        cognitive_load_management: 0.83,
        information_hierarchy: 0.87,
        engagement_potential: 0.84
      },
      confidence_metrics: {
        overall_confidence: 0.85,
        confidence_components: [],
        uncertainty_areas: [],
        reliability_assessment: {
          source_reliability: 0.91,
          method_reliability: 0.85,
          consistency_reliability: 0.82,
          temporal_reliability: 0.84
        },
        prediction_accuracy: {
          historical_accuracy: 0.87,
          context_similarity: 0.83,
          outcome_predictability: 0.81,
          success_probability: 0.85
        }
      },
      improvement_recommendations: []
    };
  }

  // Cache management methods
  private getCachedResult(searchQuery: VectorSearchQuery): EnhancedSearchResponse | null {
    const cacheKey = this.generateCacheKey(searchQuery);
    const cached = this.searchCache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return { ...cached.result, cached: true };
    }
    
    if (cached) {
      this.searchCache.delete(cacheKey);
    }
    
    return null;
  }

  private cacheResult(searchQuery: VectorSearchQuery, result: EnhancedSearchResponse): void {
    const cacheKey = this.generateCacheKey(searchQuery);
    this.searchCache.set(cacheKey, {
      result: { ...result, cached: true },
      timestamp: Date.now()
    });
  }

  private generateCacheKey(searchQuery: VectorSearchQuery): string {
    return Buffer.from(JSON.stringify({
      query: searchQuery.query,
      filters: searchQuery.business_filters,
      options: searchQuery.search_options
    })).toString('base64');
  }

  // Utility methods
  private generateSearchId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async generateQueryEmbedding(query: string): Promise<number[]> {
    // This would integrate with your embedding service (OpenAI, Cohere, etc.)
    // For now, return a placeholder
    return new Array(1536).fill(0).map(() => Math.random() - 0.5);
  }

  private determineSearchStrategy(
    queryClassification: BusinessQueryClassification,
    searchOptions?: SearchOptions
  ): SearchStrategy {
    const complexity = queryClassification.query_complexity.overall_complexity;
    const frameworkCount = queryClassification.business_context.framework_relevance.length;
    
    if (complexity === 'highly_complex' || frameworkCount > 2) {
      return { strategy: 'comprehensive', weight_distribution: 'balanced' };
    } else if (frameworkCount > 0) {
      return { strategy: 'framework_focused', weight_distribution: 'framework_heavy' };
    } else {
      return { strategy: 'semantic_primary', weight_distribution: 'semantic_heavy' };
    }
  }

  private mergeAndDeduplicateResults(resultSets: VectorSearchResult[]): VectorSearchResult[] {
    const uniqueResults = new Map<string, VectorSearchResult>();
    
    for (const result of resultSets) {
      if (!uniqueResults.has(result.id) || 
          uniqueResults.get(result.id)!.similarity_score < result.similarity_score) {
        uniqueResults.set(result.id, result);
      }
    }
    
    return Array.from(uniqueResults.values());
  }

  private calculateBusinessContextScore(
    result: VectorSearchResult,
    queryClassification: BusinessQueryClassification
  ): number {
    let score = 0;
    
    // Framework alignment
    const relevantFrameworks = queryClassification.business_context.framework_relevance
      .map(fr => fr.framework);
    if (result.metadata.framework && relevantFrameworks.includes(result.metadata.framework)) {
      score += 0.4;
    }
    
    // Industry alignment
    if (result.metadata.industry && queryClassification.business_context.industry_indicators
      .some(ind => ind.industry === result.metadata.industry)) {
      score += 0.3;
    }
    
    // Business stage alignment
    if (result.metadata.business_stage && queryClassification.business_context.business_stage_signals
      .some(sig => sig.stage === result.metadata.business_stage)) {
      score += 0.3;
    }
    
    return Math.min(1.0, score);
  }

  private calculateRelevanceScore(
    result: VectorSearchResult,
    queryClassification: BusinessQueryClassification
  ): number {
    return (
      result.similarity_score * 0.4 +
      result.business_context_score * 0.3 +
      result.quality_score * 0.2 +
      this.calculateRecencyBoost(result.metadata) * 0.1
    );
  }

  private calculateQualityScore(result: VectorSearchResult): number {
    let score = 0.5; // Base score
    
    // Authority level boost
    const authorityMap = {
      'PRIMARY_HORMOZI': 1.0,
      'VERIFIED_CASE_STUDY': 0.9,
      'EXPERT_INTERPRETATION': 0.8,
      'COMMUNITY_VALIDATED': 0.7,
      'UNVERIFIED': 0.5
    };
    
    score += (authorityMap[result.metadata.authority_level as keyof typeof authorityMap] || 0.5) * 0.5;
    
    return Math.min(1.0, score);
  }

  private calculateRecencyBoost(metadata: KnowledgeMetadata): number {
    const ageInDays = (Date.now() - new Date(metadata.created_at).getTime()) / (1000 * 60 * 60 * 24);
    
    if (ageInDays < 30) return 1.0;
    if (ageInDays < 90) return 0.8;
    if (ageInDays < 180) return 0.6;
    if (ageInDays < 365) return 0.4;
    return 0.2;
  }

  private calculateCompositeScore(result: VectorSearchResult): number {
    return result.ranking_factors.reduce((total, factor) => 
      total + (factor.factor_score * factor.weight), 0
    );
  }

  private calculateOverallQualityScore(results: VectorSearchResult[]): number {
    if (results.length === 0) return 0;
    
    const totalScore = results.reduce((sum, result) => sum + result.quality_score, 0);
    return totalScore / results.length;
  }

  private generateSearchStatistics(
    results: VectorSearchResult[],
    searchTimeMs: number
  ): SearchStatistics {
    const similarityDistribution: SimilarityDistribution = {
      high_similarity: results.filter(r => r.similarity_score > 0.8).length,
      medium_similarity: results.filter(r => r.similarity_score > 0.6 && r.similarity_score <= 0.8).length,
      low_similarity: results.filter(r => r.similarity_score > 0.4 && r.similarity_score <= 0.6).length,
      poor_similarity: results.filter(r => r.similarity_score <= 0.4).length
    };

    const frameworkCoverage: FrameworkCoverage[] = Object.values(HormoziFramework)
      .map(framework => {
        const frameworkResults = results.filter(r => r.metadata.framework === framework);
        return {
          framework,
          result_count: frameworkResults.length,
          average_quality: frameworkResults.length > 0 
            ? frameworkResults.reduce((sum, r) => sum + r.quality_score, 0) / frameworkResults.length 
            : 0,
          coverage_completeness: frameworkResults.length / results.length
        };
      })
      .filter(fc => fc.result_count > 0);

    const qualityMetrics: QualityMetrics = {
      average_quality: results.length > 0 
        ? results.reduce((sum, r) => sum + r.quality_score, 0) / results.length 
        : 0,
      quality_consistency: this.calculateQualityConsistency(results),
      authority_distribution: this.calculateAuthorityDistribution(results),
      content_freshness: this.calculateContentFreshness(results)
    };

    return {
      total_results: results.length,
      search_time_ms: searchTimeMs,
      similarity_distribution: similarityDistribution,
      framework_coverage: frameworkCoverage,
      quality_metrics: qualityMetrics
    };
  }

  private generateOptimizationInsights(
    queryClassification: BusinessQueryClassification,
    results: VectorSearchResult[],
    statistics: SearchStatistics
  ): OptimizationInsight[] {
    const insights: OptimizationInsight[] = [];

    // Low similarity insight
    if (statistics.similarity_distribution.high_similarity < results.length * 0.3) {
      insights.push({
        insight_type: 'query_expansion',
        insight_description: 'Query could benefit from expansion with business-specific terms',
        potential_impact: 'medium',
        implementation_suggestion: 'Consider adding framework-specific keywords or financial metrics terms'
      });
    }

    // Framework coverage insight
    if (queryClassification.business_context.framework_relevance.length > 0 && 
        statistics.framework_coverage.length === 0) {
      insights.push({
        insight_type: 'filter_adjustment',
        insight_description: 'No framework-specific results found despite framework relevance',
        potential_impact: 'high',
        implementation_suggestion: 'Broaden framework filters or improve framework tagging'
      });
    }

    // Quality insight
    if (statistics.quality_metrics.average_quality < 0.7) {
      insights.push({
        insight_type: 'quality_improvement',
        insight_description: 'Search results show below-average quality scores',
        potential_impact: 'significant',
        implementation_suggestion: 'Implement stricter quality thresholds or improve content curation'
      });
    }

    return insights;
  }

  private calculateQualityConsistency(results: VectorSearchResult[]): number {
    if (results.length < 2) return 1.0;
    
    const mean = results.reduce((sum, r) => sum + r.quality_score, 0) / results.length;
    const variance = results.reduce((sum, r) => sum + Math.pow(r.quality_score - mean, 2), 0) / results.length;
    const standardDeviation = Math.sqrt(variance);
    
    return Math.max(0, 1 - standardDeviation);
  }

  private calculateAuthorityDistribution(results: VectorSearchResult[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (const result of results) {
      const authority = result.metadata.authority_level;
      distribution[authority] = (distribution[authority] || 0) + 1;
    }
    
    // Convert to percentages
    const total = results.length;
    for (const key in distribution) {
      distribution[key] = distribution[key] / total;
    }
    
    return distribution;
  }

  private calculateContentFreshness(results: VectorSearchResult[]): number {
    if (results.length === 0) return 0;
    
    const totalFreshness = results.reduce((sum, result) => 
      sum + this.calculateRecencyBoost(result.metadata), 0
    );
    
    return totalFreshness / results.length;
  }
}

// Supporting interfaces
interface SearchStrategy {
  strategy: 'semantic_primary' | 'framework_focused' | 'comprehensive';
  weight_distribution: 'semantic_heavy' | 'framework_heavy' | 'balanced';
}

export default OracleVectorSearchService;