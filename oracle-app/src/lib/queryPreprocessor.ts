/**
 * Query Preprocessing System
 * Elena Execution - Advanced query preprocessing with business terminology optimization
 * Integrated with Alice Intelligence business context understanding
 */

import { BusinessScenarioProcessor } from './businessSearchOptimizer';
import {
  UserIntent,
  BusinessLifecycleStage,
  IndustryVertical,
  FunctionalArea,
  HormoziFramework,
  BusinessScenario,
  FinancialMetricCategory,
  EnhancedBusinessMetadata
} from '../types/businessIntelligence';

// Core preprocessing interfaces
export interface QueryPreprocessingRequest {
  request_id: string;
  original_query: string;
  user_context?: UserContextData;
  preprocessing_options: PreprocessingOptions;
  optimization_targets: OptimizationTarget[];
}

export interface UserContextData {
  business_stage?: BusinessLifecycleStage;
  industry?: IndustryVertical;
  functional_role?: FunctionalArea;
  experience_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  previous_queries?: string[];
  session_context?: SessionContext;
  geographic_context?: string;
  company_size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
}

export interface SessionContext {
  session_id: string;
  query_history: string[];
  topic_progression: string[];
  implementation_focus_areas: string[];
  current_business_challenges: string[];
}

export interface PreprocessingOptions {
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
}

export interface OptimizationTarget {
  target_type: 'search_precision' | 'search_recall' | 'business_relevance' | 'implementation_focus' | 'learning_progression';
  weight: number;
  specific_parameters?: Record<string, any>;
}

export interface ProcessedQuery {
  processed_query_id: string;
  original_query: string;
  processed_query: string;
  query_variants: QueryVariant[];
  extracted_entities: ExtractedEntity[];
  business_context: ProcessedBusinessContext;
  search_optimization: SearchOptimization;
  preprocessing_metadata: PreprocessingMetadata;
}

export interface QueryVariant {
  variant_id: string;
  variant_text: string;
  variant_type: 'expanded' | 'focused' | 'business_optimized' | 'framework_enhanced' | 'synonym_enriched';
  confidence_score: number;
  use_case: string;
  expected_improvement: string;
}

export interface ExtractedEntity {
  entity_id: string;
  entity_text: string;
  entity_type: EntityType;
  confidence_score: number;
  business_relevance: number;
  disambiguation?: string;
  related_concepts: string[];
}

export interface ProcessedBusinessContext {
  detected_intent: UserIntent;
  intent_confidence: number;
  business_scenarios: BusinessScenario[];
  framework_indicators: FrameworkIndicator[];
  financial_concepts: FinancialConcept[];
  implementation_signals: ImplementationSignal[];
  urgency_indicators: UrgencyIndicator[];
  complexity_assessment: ComplexityAssessment;
}

export interface FrameworkIndicator {
  framework: HormoziFramework;
  confidence: number;
  detected_components: string[];
  context_relevance: number;
  implementation_stage: 'introduction' | 'deep_dive' | 'application' | 'troubleshooting';
}

export interface FinancialConcept {
  concept_name: string;
  category: FinancialMetricCategory;
  mentions: string[];
  context_type: 'calculation' | 'optimization' | 'benchmarking' | 'analysis';
  business_impact: 'high' | 'medium' | 'low';
}

export interface ImplementationSignal {
  signal_type: 'how_to' | 'step_by_step' | 'execution' | 'application' | 'troubleshooting';
  strength: number;
  specific_indicators: string[];
  implementation_scope: 'immediate' | 'short_term' | 'long_term' | 'strategic';
}

export interface UrgencyIndicator {
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  urgency_signals: string[];
  business_impact: string;
  recommended_response_speed: 'standard' | 'expedited' | 'priority' | 'emergency';
}

export interface ComplexityAssessment {
  query_complexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  business_complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
  implementation_complexity: 'straightforward' | 'moderate' | 'complex' | 'very_complex';
  recommended_approach: 'direct_answer' | 'structured_explanation' | 'comprehensive_guide' | 'expert_consultation';
}

export interface SearchOptimization {
  optimized_search_terms: string[];
  framework_boost_terms: string[];
  business_context_terms: string[];
  semantic_enhancement_terms: string[];
  negative_terms: string[];
  search_strategy_recommendations: SearchStrategyRecommendation[];
}

export interface SearchStrategyRecommendation {
  strategy_name: string;
  confidence: number;
  parameters: Record<string, any>;
  expected_performance: string;
  fallback_strategies: string[];
}

export interface PreprocessingMetadata {
  processing_timestamp: Date;
  processing_duration: number;
  preprocessing_version: string;
  applied_optimizations: string[];
  detected_language: string;
  query_quality_score: number;
  preprocessing_warnings: string[];
  confidence_factors: ConfidenceFactor[];
}

export interface ConfidenceFactor {
  factor_name: string;
  impact_score: number;
  description: string;
}

// Entity types for business context
export enum EntityType {
  BUSINESS_FRAMEWORK = 'business_framework',
  FINANCIAL_METRIC = 'financial_metric',
  BUSINESS_PROCESS = 'business_process',
  INDUSTRY_TERM = 'industry_term',
  COMPANY_STAGE = 'company_stage',
  FUNCTIONAL_AREA = 'functional_area',
  SUCCESS_METRIC = 'success_metric',
  BUSINESS_CHALLENGE = 'business_challenge',
  IMPLEMENTATION_STEP = 'implementation_step',
  TIMEFRAME = 'timeframe',
  GEOGRAPHIC_REFERENCE = 'geographic_reference',
  COMPETITIVE_REFERENCE = 'competitive_reference'
}

// Main Query Preprocessing System
export class QueryPreprocessor {
  private businessQueryProcessor: BusinessScenarioProcessor;
  private businessTerminologyMap: Map<string, BusinessTerm> = new Map();
  private frameworkDetectionPatterns: Map<HormoziFramework, RegExp[]> = new Map();
  private synonymExpansionMap: Map<string, string[]> = new Map();
  private entityRecognitionRules: EntityRecognitionRule[] = [];
  private preprocessingCache: Map<string, ProcessedQuery> = new Map();

  constructor() {
    this.businessQueryProcessor = new BusinessScenarioProcessor();
    this.initializeBusinessTerminology();
    this.initializeFrameworkDetectionPatterns();
    this.initializeSynonymExpansions();
    this.initializeEntityRecognitionRules();
  }

  // Main preprocessing entry point
  async preprocessQuery(request: QueryPreprocessingRequest): Promise<ProcessedQuery> {
    const processingStartTime = Date.now();
    const processedQueryId = this.generateProcessedQueryId();
    
    console.log(`🔄 Preprocessing query: "${request.original_query}"`);
    
    try {
      // Step 1: Basic query analysis and cleanup
      const cleanedQuery = this.cleanQuery(request.original_query);
      
      // Step 2: Entity extraction and recognition
      const extractedEntities = await this.extractEntities(cleanedQuery, request);
      
      // Step 3: Business context analysis
      const businessContext = await this.analyzeBusinessContext(cleanedQuery, extractedEntities, request);
      
      // Step 4: Query expansion and optimization
      const queryVariants = await this.generateQueryVariants(cleanedQuery, businessContext, request);
      
      // Step 5: Search optimization
      const searchOptimization = await this.optimizeForSearch(cleanedQuery, businessContext, queryVariants, request);
      
      // Step 6: Select best processed query
      const processedQuery = this.selectOptimalProcessedQuery(queryVariants, businessContext, request);
      
      const processingDuration = Date.now() - processingStartTime;
      
      const result: ProcessedQuery = {
        processed_query_id: processedQueryId,
        original_query: request.original_query,
        processed_query: processedQuery,
        query_variants: queryVariants,
        extracted_entities: extractedEntities,
        business_context: businessContext,
        search_optimization: searchOptimization,
        preprocessing_metadata: {
          processing_timestamp: new Date(),
          processing_duration: processingDuration,
          preprocessing_version: '1.0.0',
          applied_optimizations: this.getAppliedOptimizations(request.preprocessing_options),
          detected_language: 'en', // Could be enhanced with actual language detection
          query_quality_score: this.calculateQueryQualityScore(cleanedQuery, businessContext),
          preprocessing_warnings: this.identifyPreprocessingWarnings(cleanedQuery, businessContext),
          confidence_factors: this.analyzeConfidenceFactors(businessContext, extractedEntities)
        }
      };
      
      // Cache the result
      this.cacheProcessedQuery(request.original_query, result);
      
      console.log(`✅ Query preprocessing completed in ${processingDuration}ms`);
      return result;
      
    } catch (error) {
      console.error('❌ Query preprocessing failed:', error);
      throw error;
    }
  }

  // Step 1: Query cleaning and normalization
  private cleanQuery(originalQuery: string): string {
    let cleaned = originalQuery.trim();
    
    // Remove excessive whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    
    // Normalize punctuation
    cleaned = cleaned.replace(/[?!]{2,}/g, '?');
    
    // Fix common typos in business terminology
    cleaned = this.fixBusinessTermTypos(cleaned);
    
    // Normalize casing for business acronyms
    cleaned = this.normalizeBusinessAcronyms(cleaned);
    
    return cleaned;
  }

  // Step 2: Advanced entity extraction
  private async extractEntities(cleanedQuery: string, request: QueryPreprocessingRequest): Promise<ExtractedEntity[]> {
    const entities: ExtractedEntity[] = [];
    
    if (request.preprocessing_options.enable_entity_extraction) {
      // Business framework detection
      const frameworkEntities = this.extractFrameworkEntities(cleanedQuery);
      entities.push(...frameworkEntities);
      
      // Financial metrics detection
      const financialEntities = this.extractFinancialEntities(cleanedQuery);
      entities.push(...financialEntities);
      
      // Business process detection
      const processEntities = this.extractBusinessProcessEntities(cleanedQuery);
      entities.push(...processEntities);
      
      // Timeframe detection
      const timeframeEntities = this.extractTimeframeEntities(cleanedQuery);
      entities.push(...timeframeEntities);
      
      // Industry-specific terms
      const industryEntities = this.extractIndustryEntities(cleanedQuery, request.user_context);
      entities.push(...industryEntities);
    }
    
    // Deduplicate and rank entities
    return this.deduplicateAndRankEntities(entities);
  }

  // Step 3: Business context analysis
  private async analyzeBusinessContext(
    cleanedQuery: string, 
    extractedEntities: ExtractedEntity[], 
    request: QueryPreprocessingRequest
  ): Promise<ProcessedBusinessContext> {
    
    // Use Alice Intelligence for intent detection
    const businessQueryContext = this.businessQueryProcessor.enhanceBusinessQuery(cleanedQuery);
    
    // Detect business scenarios
    const businessScenarios = this.detectBusinessScenarios(cleanedQuery, extractedEntities, request.user_context);
    
    // Analyze framework indicators
    const frameworkIndicators = this.analyzeFrameworkIndicators(cleanedQuery, extractedEntities);
    
    // Extract financial concepts
    const financialConcepts = this.extractFinancialConcepts(cleanedQuery, extractedEntities);
    
    // Identify implementation signals
    const implementationSignals = this.identifyImplementationSignals(cleanedQuery);
    
    // Assess urgency
    const urgencyIndicators = this.assessUrgency(cleanedQuery);
    
    // Evaluate complexity
    const complexityAssessment = this.assessComplexity(cleanedQuery, extractedEntities, request.user_context);
    
    return {
      detected_intent: businessQueryContext.inferred_intent,
      intent_confidence: 0.85, // Would be calculated based on signal strength
      business_scenarios: businessScenarios,
      framework_indicators: frameworkIndicators,
      financial_concepts: financialConcepts,
      implementation_signals: implementationSignals,
      urgency_indicators: urgencyIndicators,
      complexity_assessment: complexityAssessment
    };
  }

  // Step 4: Query variant generation
  private async generateQueryVariants(
    cleanedQuery: string, 
    businessContext: ProcessedBusinessContext, 
    request: QueryPreprocessingRequest
  ): Promise<QueryVariant[]> {
    const variants: QueryVariant[] = [];
    
    // Original query as baseline
    variants.push({
      variant_id: 'original',
      variant_text: cleanedQuery,
      variant_type: 'expanded',
      confidence_score: 1.0,
      use_case: 'baseline',
      expected_improvement: 'none'
    });
    
    // Business terminology expanded variant
    if (request.preprocessing_options.enable_business_terminology_optimization) {
      const businessOptimized = this.createBusinessOptimizedVariant(cleanedQuery, businessContext);
      variants.push(businessOptimized);
    }
    
    // Framework-enhanced variant
    if (request.preprocessing_options.enable_framework_detection && businessContext.framework_indicators.length > 0) {
      const frameworkEnhanced = this.createFrameworkEnhancedVariant(cleanedQuery, businessContext);
      variants.push(frameworkEnhanced);
    }
    
    // Synonym-expanded variant
    if (request.preprocessing_options.enable_synonym_expansion) {
      const synonymExpanded = this.createSynonymExpandedVariant(cleanedQuery);
      variants.push(synonymExpanded);
    }
    
    // Intent-focused variant
    const intentFocused = this.createIntentFocusedVariant(cleanedQuery, businessContext);
    variants.push(intentFocused);
    
    // Context-enriched variant
    if (request.preprocessing_options.enable_context_enrichment && request.user_context) {
      const contextEnriched = this.createContextEnrichedVariant(cleanedQuery, request.user_context, businessContext);
      variants.push(contextEnriched);
    }
    
    return variants;
  }

  // Step 5: Search optimization
  private async optimizeForSearch(
    cleanedQuery: string,
    businessContext: ProcessedBusinessContext,
    queryVariants: QueryVariant[],
    request: QueryPreprocessingRequest
  ): Promise<SearchOptimization> {
    
    const optimizedSearchTerms = this.extractOptimizedSearchTerms(cleanedQuery, businessContext);
    const frameworkBoostTerms = this.extractFrameworkBoostTerms(businessContext);
    const businessContextTerms = this.extractBusinessContextTerms(businessContext, request.user_context);
    const semanticEnhancementTerms = this.generateSemanticEnhancementTerms(cleanedQuery, businessContext);
    const negativeTerms = this.identifyNegativeTerms(cleanedQuery, businessContext);
    
    const searchStrategyRecommendations = this.generateSearchStrategyRecommendations(
      businessContext, 
      request.optimization_targets
    );
    
    return {
      optimized_search_terms: optimizedSearchTerms,
      framework_boost_terms: frameworkBoostTerms,
      business_context_terms: businessContextTerms,
      semantic_enhancement_terms: semanticEnhancementTerms,
      negative_terms: negativeTerms,
      search_strategy_recommendations: searchStrategyRecommendations
    };
  }

  // Business terminology optimization methods
  private createBusinessOptimizedVariant(query: string, businessContext: ProcessedBusinessContext): QueryVariant {
    let optimizedQuery = query;
    
    // Expand business acronyms
    optimizedQuery = this.expandBusinessAcronyms(optimizedQuery);
    
    // Add business context terms
    const contextTerms = this.getRelevantBusinessContextTerms(businessContext);
    if (contextTerms.length > 0) {
      optimizedQuery += ' ' + contextTerms.join(' ');
    }
    
    // Add framework-specific terminology
    for (const indicator of businessContext.framework_indicators) {
      const frameworkTerms = this.getFrameworkSpecificTerminology(indicator.framework);
      optimizedQuery += ' ' + frameworkTerms.join(' ');
    }
    
    return {
      variant_id: 'business_optimized',
      variant_text: optimizedQuery,
      variant_type: 'business_optimized',
      confidence_score: 0.9,
      use_case: 'business_context_search',
      expected_improvement: 'Better business relevance and framework alignment'
    };
  }

  private createFrameworkEnhancedVariant(query: string, businessContext: ProcessedBusinessContext): QueryVariant {
    let enhancedQuery = query;
    
    // Add primary framework terminology
    const primaryFrameworks = businessContext.framework_indicators
      .filter(f => f.confidence > 0.7)
      .slice(0, 2); // Top 2 frameworks
    
    for (const framework of primaryFrameworks) {
      enhancedQuery += ` ${framework.framework} ${framework.detected_components.join(' ')}`;
    }
    
    return {
      variant_id: 'framework_enhanced',
      variant_text: enhancedQuery,
      variant_type: 'framework_enhanced',
      confidence_score: 0.85,
      use_case: 'framework_specific_search',
      expected_improvement: 'Enhanced framework-specific content retrieval'
    };
  }

  // Entity extraction methods
  private extractFrameworkEntities(query: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    for (const [framework, patterns] of this.frameworkDetectionPatterns) {
      for (const pattern of patterns) {
        const matches = query.match(pattern);
        if (matches) {
          entities.push({
            entity_id: `framework_${framework.toLowerCase()}`,
            entity_text: matches[0],
            entity_type: EntityType.BUSINESS_FRAMEWORK,
            confidence_score: 0.9,
            business_relevance: 1.0,
            related_concepts: this.getFrameworkRelatedConcepts(framework)
          });
        }
      }
    }
    
    return entities;
  }

  private extractFinancialEntities(query: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    const financialPatterns = [
      { pattern: /\b(ltv|lifetime value|customer lifetime value)\b/gi, metric: 'Lifetime Value' },
      { pattern: /\b(cac|customer acquisition cost)\b/gi, metric: 'Customer Acquisition Cost' },
      { pattern: /\b(mrr|monthly recurring revenue)\b/gi, metric: 'Monthly Recurring Revenue' },
      { pattern: /\b(arr|annual recurring revenue)\b/gi, metric: 'Annual Recurring Revenue' },
      { pattern: /\b(roas|return on ad spend)\b/gi, metric: 'Return on Ad Spend' },
      { pattern: /\b(roi|return on investment)\b/gi, metric: 'Return on Investment' }
    ];
    
    for (const { pattern, metric } of financialPatterns) {
      const matches = query.match(pattern);
      if (matches) {
        entities.push({
          entity_id: `financial_${metric.toLowerCase().replace(/\s+/g, '_')}`,
          entity_text: matches[0],
          entity_type: EntityType.FINANCIAL_METRIC,
          confidence_score: 0.95,
          business_relevance: 0.95,
          related_concepts: this.getFinancialMetricRelatedConcepts(metric)
        });
      }
    }
    
    return entities;
  }

  // Initialize business terminology and patterns
  private initializeBusinessTerminology(): void {
    // Initialize business term mappings
    this.businessTerminologyMap.set('ltv', {
      full_form: 'lifetime value',
      synonyms: ['customer lifetime value', 'clv'],
      category: 'financial_metric',
      business_impact: 'high'
    });
    
    this.businessTerminologyMap.set('cac', {
      full_form: 'customer acquisition cost',
      synonyms: ['acquisition cost', 'cost per customer'],
      category: 'financial_metric',
      business_impact: 'high'
    });
    
    // Add more business terminology...
  }

  private initializeFrameworkDetectionPatterns(): void {
    this.frameworkDetectionPatterns.set(HormoziFramework.GRAND_SLAM_OFFERS, [
      /grand slam offer[s]?/gi,
      /value equation/gi,
      /irresistible offer[s]?/gi
    ]);
    
    this.frameworkDetectionPatterns.set(HormoziFramework.CORE_FOUR, [
      /core four/gi,
      /warm outreach/gi,
      /cold outreach/gi,
      /warm content/gi,
      /cold content/gi
    ]);
    
    this.frameworkDetectionPatterns.set(HormoziFramework.CLOSER_FRAMEWORK, [
      /closer framework/gi,
      /clarify.*label.*overview/gi,
      /sales process/gi
    ]);
  }

  private initializeSynonymExpansions(): void {
    this.synonymExpansionMap.set('scale', ['grow', 'expand', 'increase', 'scaling']);
    this.synonymExpansionMap.set('revenue', ['income', 'sales', 'earnings', 'money']);
    this.synonymExpansionMap.set('customers', ['clients', 'users', 'buyers', 'prospects']);
    // Add more synonym mappings...
  }

  private initializeEntityRecognitionRules(): void {
    // Initialize entity recognition rules
  }

  // Helper methods (simplified implementations)
  private generateProcessedQueryId(): string {
    return `pq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private fixBusinessTermTypos(query: string): string { return query; }
  private normalizeBusinessAcronyms(query: string): string { return query; }
  private deduplicateAndRankEntities(entities: ExtractedEntity[]): ExtractedEntity[] { return entities; }
  private detectBusinessScenarios(query: string, entities: ExtractedEntity[], context?: UserContextData): BusinessScenario[] { return []; }
  private analyzeFrameworkIndicators(query: string, entities: ExtractedEntity[]): FrameworkIndicator[] { return []; }
  private extractFinancialConcepts(query: string, entities: ExtractedEntity[]): FinancialConcept[] { return []; }
  private identifyImplementationSignals(query: string): ImplementationSignal[] { return []; }
  private assessUrgency(query: string): UrgencyIndicator[] { return []; }
  private assessComplexity(query: string, entities: ExtractedEntity[], context?: UserContextData): ComplexityAssessment {
    return {
      query_complexity: 'moderate',
      business_complexity: 'intermediate',
      implementation_complexity: 'moderate',
      recommended_approach: 'structured_explanation'
    };
  }
  private selectOptimalProcessedQuery(variants: QueryVariant[], context: ProcessedBusinessContext, request: QueryPreprocessingRequest): string {
    return variants[0].variant_text;
  }
  private getAppliedOptimizations(options: PreprocessingOptions): string[] { return []; }
  private calculateQueryQualityScore(query: string, context: ProcessedBusinessContext): number { return 0.85; }
  private identifyPreprocessingWarnings(query: string, context: ProcessedBusinessContext): string[] { return []; }
  private analyzeConfidenceFactors(context: ProcessedBusinessContext, entities: ExtractedEntity[]): ConfidenceFactor[] { return []; }
  private cacheProcessedQuery(originalQuery: string, result: ProcessedQuery): void { }
  private extractBusinessProcessEntities(query: string): ExtractedEntity[] { return []; }
  private extractTimeframeEntities(query: string): ExtractedEntity[] { return []; }
  private extractIndustryEntities(query: string, context?: UserContextData): ExtractedEntity[] { return []; }
  private expandBusinessAcronyms(query: string): string { return query; }
  private getRelevantBusinessContextTerms(context: ProcessedBusinessContext): string[] { return []; }
  private getFrameworkSpecificTerminology(framework: HormoziFramework): string[] { return []; }
  private createSynonymExpandedVariant(query: string): QueryVariant { return { variant_id: 'synonym', variant_text: query, variant_type: 'synonym_enriched', confidence_score: 0.8, use_case: 'synonym_expansion', expected_improvement: 'Better semantic coverage' }; }
  private createIntentFocusedVariant(query: string, context: ProcessedBusinessContext): QueryVariant { return { variant_id: 'intent', variant_text: query, variant_type: 'focused', confidence_score: 0.85, use_case: 'intent_alignment', expected_improvement: 'Better intent matching' }; }
  private createContextEnrichedVariant(query: string, userContext: UserContextData, businessContext: ProcessedBusinessContext): QueryVariant { return { variant_id: 'context', variant_text: query, variant_type: 'business_optimized', confidence_score: 0.9, use_case: 'context_enrichment', expected_improvement: 'Better contextual relevance' }; }
  private extractOptimizedSearchTerms(query: string, context: ProcessedBusinessContext): string[] { return []; }
  private extractFrameworkBoostTerms(context: ProcessedBusinessContext): string[] { return []; }
  private extractBusinessContextTerms(context: ProcessedBusinessContext, userContext?: UserContextData): string[] { return []; }
  private generateSemanticEnhancementTerms(query: string, context: ProcessedBusinessContext): string[] { return []; }
  private identifyNegativeTerms(query: string, context: ProcessedBusinessContext): string[] { return []; }
  private generateSearchStrategyRecommendations(context: ProcessedBusinessContext, targets: OptimizationTarget[]): SearchStrategyRecommendation[] { return []; }
  private getFrameworkRelatedConcepts(framework: HormoziFramework): string[] { return []; }
  private getFinancialMetricRelatedConcepts(metric: string): string[] { return []; }
}

// Supporting interfaces
interface BusinessTerm {
  full_form: string;
  synonyms: string[];
  category: string;
  business_impact: string;
}

interface EntityRecognitionRule {
  rule_id: string;
  pattern: RegExp;
  entity_type: EntityType;
  confidence_modifier: number;
}

export default QueryPreprocessor;