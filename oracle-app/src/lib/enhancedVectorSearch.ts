/**
 * Enhanced Vector Search Service
 * Elena Execution - Advanced semantic search with business context understanding
 * Integrates with Alice Intelligence optimization strategies
 */

import { OracleVectorDB, SearchResult } from './oracleVectorDB';
import { 
  BusinessLifecycleStage, 
  IndustryVertical, 
  FunctionalArea,
  UserIntent,
  HormoziFramework,
  BusinessScenario,
  FinancialMetricCategory,
  KPICategory
} from '../types/businessIntelligence';

// Enhanced search interfaces
export interface SemanticSearchQuery {
  query_text: string;
  query_embedding?: number[];
  search_strategy: SearchStrategy;
  business_filters: BusinessFilters;
  performance_parameters: PerformanceParameters;
  result_enhancement: ResultEnhancement;
}

export interface SearchStrategy {
  primary_method: 'semantic' | 'hybrid' | 'multi_vector' | 'adaptive';
  fallback_methods: string[];
  similarity_algorithms: SimilarityAlgorithm[];
  ranking_weights: RankingWeights;
}

export interface BusinessFilters {
  lifecycle_stages?: BusinessLifecycleStage[];
  industry_verticals?: IndustryVertical[];
  functional_areas?: FunctionalArea[];
  framework_focus?: HormoziFramework[];
  business_scenarios?: BusinessScenario[];
  complexity_levels?: string[];
  implementation_timeframes?: string[];
}

export interface PerformanceParameters {
  max_results: number;
  similarity_threshold: number;
  query_expansion: boolean;
  result_diversification: boolean;
  cache_duration_minutes: number;
  timeout_seconds: number;
}

export interface ResultEnhancement {
  include_citations: boolean;
  include_relationships: boolean;
  include_implementation_guidance: boolean;
  include_success_metrics: boolean;
  snippet_optimization: boolean;
  contextual_highlighting: boolean;
}

export interface SimilarityAlgorithm {
  algorithm_type: 'cosine' | 'euclidean' | 'dot_product' | 'manhattan';
  weight: number;
  business_context_boost: boolean;
}

export interface RankingWeights {
  semantic_similarity: number;
  business_context_match: number;
  framework_relevance: number;
  authority_score: number;
  recency_score: number;
  user_preference_alignment: number;
  implementation_feasibility: number;
}

export interface EnhancedSearchResult extends SearchResult {
  semantic_score: number;
  business_context_score: number;
  framework_alignment_score: number;
  implementation_score: number;
  authority_score: number;
  recency_score: number;
  final_relevance_score: number;
  result_explanation: string;
  key_concepts: string[];
  implementation_complexity: string;
  estimated_value: string;
  related_frameworks: string[];
}

// Main enhanced vector search service
export class EnhancedVectorSearch {
  private vectorDB: OracleVectorDB;
  private searchCache: Map<string, CachedSearchResult> = new Map();
  private performanceMetrics: SearchPerformanceMetrics = {
    total_queries: 0,
    average_response_time: 0,
    cache_hit_rate: 0,
    user_satisfaction_score: 0.85
  };

  constructor() {
    this.vectorDB = new OracleVectorDB();
  }

  async initialize(): Promise<void> {
    console.log('🔍 Initializing Enhanced Vector Search Service...');
    await this.vectorDB.initialize();
    console.log('✅ Enhanced Vector Search ready');
  }

  // Main semantic search with business intelligence
  async search(searchQuery: SemanticSearchQuery): Promise<EnhancedSearchResult[]> {
    const searchStartTime = Date.now();
    const cacheKey = this.generateCacheKey(searchQuery);
    
    try {
      // Check cache first
      if (this.shouldUseCache(searchQuery) && this.searchCache.has(cacheKey)) {
        const cachedResult = this.searchCache.get(cacheKey)!;
        if (this.isCacheValid(cachedResult, searchQuery.performance_parameters.cache_duration_minutes)) {
          console.log('📦 Returning cached search results');
          this.updatePerformanceMetrics(Date.now() - searchStartTime, true);
          return cachedResult.results;
        }
      }
      
      // Execute adaptive search strategy
      const rawResults = await this.executeAdaptiveSearch(searchQuery);
      
      // Apply business intelligence ranking
      const rankedResults = await this.applyBusinessIntelligenceRanking(rawResults, searchQuery);
      
      // Enhance results with additional context
      const enhancedResults = await this.enhanceSearchResults(rankedResults, searchQuery);
      
      // Apply result diversification if requested
      const finalResults = searchQuery.performance_parameters.result_diversification
        ? this.diversifyResults(enhancedResults, searchQuery)
        : enhancedResults;
      
      // Cache results
      if (this.shouldCacheResults(searchQuery)) {
        this.cacheSearchResults(cacheKey, finalResults, searchQuery.performance_parameters.cache_duration_minutes);
      }
      
      const searchTime = Date.now() - searchStartTime;
      this.updatePerformanceMetrics(searchTime, false);
      
      console.log(`🎯 Enhanced search completed: ${finalResults.length} results in ${searchTime}ms`);
      return finalResults;
      
    } catch (error) {
      console.error('❌ Enhanced vector search failed:', error);
      throw error;
    }
  }

  // Adaptive search strategy selection
  private async executeAdaptiveSearch(searchQuery: SemanticSearchQuery): Promise<SearchResult[]> {
    const strategy = searchQuery.search_strategy;
    
    switch (strategy.primary_method) {
      case 'semantic':
        return this.executeSemanticSearch(searchQuery);
      
      case 'hybrid':
        return this.executeHybridSearch(searchQuery);
      
      case 'multi_vector':
        return this.executeMultiVectorSearch(searchQuery);
      
      case 'adaptive':
        return this.executeAdaptiveSearchStrategy(searchQuery);
      
      default:
        return this.executeSemanticSearch(searchQuery);
    }
  }

  // Semantic-only search with query enhancement
  private async executeSemanticSearch(searchQuery: SemanticSearchQuery): Promise<SearchResult[]> {
    // Apply query expansion if requested
    const expandedQuery = searchQuery.performance_parameters.query_expansion
      ? await this.expandQuery(searchQuery.query_text)
      : searchQuery.query_text;
    
    // Apply business filters
    const searchOptions = this.buildSearchOptions(searchQuery);
    
    return this.vectorDB.semanticSearch(expandedQuery, searchOptions);
  }

  // Hybrid semantic + keyword search
  private async executeHybridSearch(searchQuery: SemanticSearchQuery): Promise<SearchResult[]> {
    const expandedQuery = searchQuery.performance_parameters.query_expansion
      ? await this.expandQuery(searchQuery.query_text)
      : searchQuery.query_text;
    
    const searchOptions = this.buildSearchOptions(searchQuery);
    
    return this.vectorDB.hybridSearch(expandedQuery, searchOptions);
  }

  // Multi-vector search using different embedding strategies
  private async executeMultiVectorSearch(searchQuery: SemanticSearchQuery): Promise<SearchResult[]> {
    const searchPromises: Promise<SearchResult[]>[] = [];
    
    // Strategy 1: Full query semantic search
    searchPromises.push(this.executeSemanticSearch(searchQuery));
    
    // Strategy 2: Framework-focused search
    if (searchQuery.business_filters.framework_focus?.length) {
      for (const framework of searchQuery.business_filters.framework_focus) {
        const frameworkQuery = `${framework} ${searchQuery.query_text}`;
        searchPromises.push(
          this.vectorDB.semanticSearch(frameworkQuery, this.buildSearchOptions(searchQuery))
        );
      }
    }
    
    // Strategy 3: Business scenario search
    if (searchQuery.business_filters.business_scenarios?.length) {
      for (const scenario of searchQuery.business_filters.business_scenarios) {
        const scenarioQuery = `${scenario.replace('_', ' ')} ${searchQuery.query_text}`;
        searchPromises.push(
          this.vectorDB.semanticSearch(scenarioQuery, this.buildSearchOptions(searchQuery))
        );
      }
    }
    
    const allResults = await Promise.all(searchPromises);
    return this.mergeAndDeduplicateResults(allResults);
  }

  // Adaptive search that selects best strategy based on query characteristics
  private async executeAdaptiveSearchStrategy(searchQuery: SemanticSearchQuery): Promise<SearchResult[]> {
    const queryCharacteristics = this.analyzeQueryCharacteristics(searchQuery.query_text);
    
    // Select optimal strategy based on query analysis
    let selectedStrategy: 'semantic' | 'hybrid' | 'multi_vector';
    
    if (queryCharacteristics.has_specific_frameworks && queryCharacteristics.is_implementation_focused) {
      selectedStrategy = 'multi_vector';
    } else if (queryCharacteristics.has_business_terminology && queryCharacteristics.is_specific) {
      selectedStrategy = 'hybrid';
    } else {
      selectedStrategy = 'semantic';
    }
    
    // Execute with selected strategy
    const modifiedQuery = { ...searchQuery, search_strategy: { ...searchQuery.search_strategy, primary_method: selectedStrategy }};
    return this.executeAdaptiveSearch(modifiedQuery);
  }

  // Business intelligence ranking system
  private async applyBusinessIntelligenceRanking(
    results: SearchResult[], 
    searchQuery: SemanticSearchQuery
  ): Promise<EnhancedSearchResult[]> {
    const enhancedResults: EnhancedSearchResult[] = [];
    const weights = searchQuery.search_strategy.ranking_weights;
    
    for (const result of results) {
      // Calculate individual scoring dimensions
      const semanticScore = result.similarity_score || 0;
      const businessContextScore = this.calculateBusinessContextScore(result, searchQuery);
      const frameworkAlignmentScore = this.calculateFrameworkAlignmentScore(result, searchQuery);
      const implementationScore = this.calculateImplementationScore(result, searchQuery);
      const authorityScore = this.calculateAuthorityScore(result);
      const recencyScore = this.calculateRecencyScore(result);
      
      // Calculate weighted final score
      const finalScore = (
        semanticScore * weights.semantic_similarity +
        businessContextScore * weights.business_context_match +
        frameworkAlignmentScore * weights.framework_relevance +
        implementationScore * weights.implementation_feasibility +
        authorityScore * weights.authority_score +
        recencyScore * weights.recency_score
      );
      
      const enhancedResult: EnhancedSearchResult = {
        ...result,
        semantic_score: semanticScore,
        business_context_score: businessContextScore,
        framework_alignment_score: frameworkAlignmentScore,
        implementation_score: implementationScore,
        authority_score: authorityScore,
        recency_score: recencyScore,
        final_relevance_score: finalScore,
        result_explanation: this.generateResultExplanation(result, searchQuery, finalScore),
        key_concepts: this.extractKeyConcepts(result),
        implementation_complexity: this.assessImplementationComplexity(result),
        estimated_value: this.estimateBusinessValue(result),
        related_frameworks: this.identifyRelatedFrameworks(result)
      };
      
      enhancedResults.push(enhancedResult);
    }
    
    // Sort by final relevance score
    return enhancedResults.sort((a, b) => b.final_relevance_score - a.final_relevance_score);
  }

  // Enhanced result enrichment
  private async enhanceSearchResults(
    results: EnhancedSearchResult[],
    searchQuery: SemanticSearchQuery
  ): Promise<EnhancedSearchResult[]> {
    const enhancement = searchQuery.result_enhancement;
    
    for (const result of results) {
      // Add contextual highlighting
      if (enhancement.contextual_highlighting) {
        result.content = this.addContextualHighlighting(result.content, searchQuery.query_text);
      }
      
      // Optimize content snippets
      if (enhancement.snippet_optimization) {
        result.content_preview = this.optimizeContentSnippet(result, searchQuery);
      }
      
      // Add implementation guidance
      if (enhancement.include_implementation_guidance) {
        // This would be populated by additional processing
        result.metadata = result.metadata || {};
        result.metadata.implementation_steps = this.generateImplementationSteps(result);
      }
      
      // Add success metrics
      if (enhancement.include_success_metrics) {
        result.metadata = result.metadata || {};
        result.metadata.success_metrics = this.identifySuccessMetrics(result);
      }
    }
    
    return results;
  }

  // Query expansion using business terminology
  private async expandQuery(originalQuery: string): Promise<string> {
    let expandedQuery = originalQuery;
    
    // Business terminology expansion
    const expansions = this.getBusinessTerminologyExpansions(originalQuery);
    if (expansions.length > 0) {
      expandedQuery += ' ' + expansions.join(' ');
    }
    
    // Framework synonym expansion
    const frameworkSynonyms = this.getFrameworkSynonyms(originalQuery);
    if (frameworkSynonyms.length > 0) {
      expandedQuery += ' ' + frameworkSynonyms.join(' ');
    }
    
    return expandedQuery;
  }

  // Result diversification to avoid redundancy
  private diversifyResults(results: EnhancedSearchResult[], searchQuery: SemanticSearchQuery): EnhancedSearchResult[] {
    const diversifiedResults: EnhancedSearchResult[] = [];
    const seenConcepts = new Set<string>();
    
    for (const result of results) {
      const conceptsOverlap = result.key_concepts.filter(concept => seenConcepts.has(concept)).length;
      const overlapRatio = conceptsOverlap / Math.max(1, result.key_concepts.length);
      
      // Include if overlap is below threshold (maintaining diversity)
      if (overlapRatio < 0.7 || diversifiedResults.length < 3) {
        diversifiedResults.push(result);
        result.key_concepts.forEach(concept => seenConcepts.add(concept));
      }
      
      if (diversifiedResults.length >= searchQuery.performance_parameters.max_results) {
        break;
      }
    }
    
    return diversifiedResults;
  }

  // Helper methods for scoring and analysis
  private calculateBusinessContextScore(result: SearchResult, searchQuery: SemanticSearchQuery): number {
    let score = 0.0;
    const filters = searchQuery.business_filters;
    
    // Lifecycle stage matching
    if (filters.lifecycle_stages?.length && result.business_phase) {
      if (filters.lifecycle_stages.some(stage => stage === result.business_phase) || result.business_phase === 'all') {
        score += 0.3;
      }
    }
    
    // Framework matching
    if (filters.framework_focus?.length && result.framework_tags?.length) {
      const matches = result.framework_tags.filter(tag =>
        filters.framework_focus!.some(framework => tag.toLowerCase().includes(framework.toLowerCase()))
      );
      score += (matches.length / result.framework_tags.length) * 0.4;
    }
    
    // Complexity level matching
    if (filters.complexity_levels?.length && result.complexity_level) {
      if (filters.complexity_levels.includes(result.complexity_level)) {
        score += 0.2;
      }
    }
    
    return Math.min(1.0, score);
  }

  private calculateFrameworkAlignmentScore(result: SearchResult, searchQuery: SemanticSearchQuery): number {
    if (!result.framework_tags?.length) return 0.0;
    
    const queryLower = searchQuery.query_text.toLowerCase();
    let alignmentScore = 0.0;
    
    for (const framework of result.framework_tags) {
      if (queryLower.includes(framework.toLowerCase())) {
        alignmentScore += 0.25;
      }
    }
    
    return Math.min(1.0, alignmentScore);
  }

  private calculateImplementationScore(result: SearchResult, searchQuery: SemanticSearchQuery): number {
    const hasImplementationSignals = searchQuery.query_text.toLowerCase().includes('implement') ||
                                   searchQuery.query_text.toLowerCase().includes('how to') ||
                                   searchQuery.query_text.toLowerCase().includes('execute');
    
    if (!hasImplementationSignals) return 0.5; // Neutral if not implementation-focused
    
    // Higher score for beginner/intermediate complexity for implementation queries
    if (result.complexity_level === 'beginner') return 0.9;
    if (result.complexity_level === 'intermediate') return 0.7;
    return 0.5;
  }

  private analyzeQueryCharacteristics(query: string): QueryCharacteristics {
    const queryLower = query.toLowerCase();
    
    return {
      is_implementation_focused: queryLower.includes('implement') || queryLower.includes('how to') || queryLower.includes('execute'),
      is_specific: query.split(' ').length > 5,
      has_specific_frameworks: queryLower.includes('grand slam') || queryLower.includes('core four') || queryLower.includes('closer'),
      has_business_terminology: queryLower.includes('ltv') || queryLower.includes('cac') || queryLower.includes('roi'),
      has_urgency_signals: queryLower.includes('urgent') || queryLower.includes('quickly') || queryLower.includes('asap'),
      is_troubleshooting: queryLower.includes('problem') || queryLower.includes('issue') || queryLower.includes('fix'),
      complexity_level: this.assessQueryComplexity(query)
    };
  }

  // Additional helper methods
  private buildSearchOptions(searchQuery: SemanticSearchQuery): any {
    return {
      maxResults: searchQuery.performance_parameters.max_results,
      similarityThreshold: searchQuery.performance_parameters.similarity_threshold,
      businessPhaseFilter: searchQuery.business_filters.lifecycle_stages?.[0]
    };
  }

  private mergeAndDeduplicateResults(allResults: SearchResult[][]): SearchResult[] {
    const seenIds = new Set<string>();
    const mergedResults: SearchResult[] = [];
    
    for (const resultSet of allResults) {
      for (const result of resultSet) {
        const resultId = result.id || result.title + result.content.substring(0, 100);
        if (!seenIds.has(resultId)) {
          seenIds.add(resultId);
          mergedResults.push(result);
        }
      }
    }
    
    return mergedResults;
  }

  // Utility methods (implementations would be more detailed in production)
  private generateCacheKey(searchQuery: SemanticSearchQuery): string {
    return btoa(JSON.stringify({
      query: searchQuery.query_text,
      filters: searchQuery.business_filters,
      strategy: searchQuery.search_strategy.primary_method
    }));
  }

  private shouldUseCache(searchQuery: SemanticSearchQuery): boolean {
    return searchQuery.performance_parameters.cache_duration_minutes > 0;
  }

  private isCacheValid(cachedResult: CachedSearchResult, cacheDurationMinutes: number): boolean {
    const ageMinutes = (Date.now() - cachedResult.timestamp) / (1000 * 60);
    return ageMinutes < cacheDurationMinutes;
  }

  private shouldCacheResults(searchQuery: SemanticSearchQuery): boolean {
    return searchQuery.performance_parameters.cache_duration_minutes > 0;
  }

  private cacheSearchResults(cacheKey: string, results: EnhancedSearchResult[], duration: number): void {
    this.searchCache.set(cacheKey, {
      results,
      timestamp: Date.now(),
      duration_minutes: duration
    });
  }

  private updatePerformanceMetrics(searchTime: number, wasCached: boolean): void {
    this.performanceMetrics.total_queries++;
    this.performanceMetrics.average_response_time = 
      (this.performanceMetrics.average_response_time + searchTime) / 2;
    
    if (wasCached) {
      this.performanceMetrics.cache_hit_rate = 
        (this.performanceMetrics.cache_hit_rate * (this.performanceMetrics.total_queries - 1) + 1) / 
        this.performanceMetrics.total_queries;
    }
  }

  // Additional scoring methods (simplified implementations)
  private calculateAuthorityScore(result: SearchResult): number { return 0.8; }
  private calculateRecencyScore(result: SearchResult): number { return 0.7; }
  private generateResultExplanation(result: SearchResult, query: SemanticSearchQuery, score: number): string { 
    return `Relevance: ${(score * 100).toFixed(1)}% - High match for business context and framework alignment`; 
  }
  private extractKeyConcepts(result: SearchResult): string[] { return result.framework_tags || []; }
  private assessImplementationComplexity(result: SearchResult): string { return result.complexity_level || 'intermediate'; }
  private estimateBusinessValue(result: SearchResult): string { return 'high'; }
  private identifyRelatedFrameworks(result: SearchResult): string[] { return result.framework_tags || []; }
  private addContextualHighlighting(content: string, query: string): string { return content; }
  private optimizeContentSnippet(result: EnhancedSearchResult, query: SemanticSearchQuery): string { 
    return result.content_preview; 
  }
  private generateImplementationSteps(result: EnhancedSearchResult): string[] { return []; }
  private identifySuccessMetrics(result: EnhancedSearchResult): string[] { return []; }
  private getBusinessTerminologyExpansions(query: string): string[] { return []; }
  private getFrameworkSynonyms(query: string): string[] { return []; }
  private assessQueryComplexity(query: string): 'beginner' | 'intermediate' | 'advanced' { return 'intermediate'; }
}

// Supporting interfaces
interface QueryCharacteristics {
  is_implementation_focused: boolean;
  is_specific: boolean;
  has_specific_frameworks: boolean;
  has_business_terminology: boolean;
  has_urgency_signals: boolean;
  is_troubleshooting: boolean;
  complexity_level: 'beginner' | 'intermediate' | 'advanced';
}

interface CachedSearchResult {
  results: EnhancedSearchResult[];
  timestamp: number;
  duration_minutes: number;
}

interface SearchPerformanceMetrics {
  total_queries: number;
  average_response_time: number;
  cache_hit_rate: number;
  user_satisfaction_score: number;
}

export default EnhancedVectorSearch;