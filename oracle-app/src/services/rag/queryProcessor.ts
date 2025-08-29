/**
 * Oracle Query Preprocessing System
 * Alice Intelligence - Advanced query preprocessing for optimal RAG performance
 * Integrates with existing business search optimizer architecture
 */

import { 
  AdvancedBusinessQueryClassifier,
  BusinessQueryClassification 
} from '../../lib/advancedBusinessQueryClassifier';
import { 
  FinancialMetricsQueryExpansion,
  FinancialMetricsExpansion 
} from '../../lib/financialMetricsQueryExpansion';
import { 
  ContextAwareFrameworkSearch 
} from '../../lib/contextAwareFrameworkSearch';
import {
  HormoziFramework,
  IndustryVertical,
  BusinessLifecycleStage,
  UserIntent,
  FinancialMetricCategory,
  FunctionalArea
} from '../../types/businessIntelligence';

// Query preprocessing interfaces
export interface QueryProcessingRequest {
  original_query: string;
  user_context?: UserContext;
  processing_options?: ProcessingOptions;
  session_history?: QueryHistoryItem[];
}

export interface UserContext {
  user_id?: string;
  business_stage?: BusinessLifecycleStage;
  industry?: IndustryVertical;
  functional_role?: FunctionalArea;
  expertise_level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  current_priorities?: string[];
  recent_topics?: string[];
}

export interface ProcessingOptions {
  enable_expansion?: boolean;
  enable_normalization?: boolean;
  enable_context_enhancement?: boolean;
  enable_complexity_routing?: boolean;
  max_expansion_terms?: number;
  synonym_confidence_threshold?: number;
  framework_focus?: HormoziFramework[];
}

export interface QueryHistoryItem {
  query: string;
  timestamp: string;
  intent: UserIntent;
  frameworks_used?: HormoziFramework[];
}

// Query processing response
export interface ProcessedQuery {
  processing_id: string;
  original_query: string;
  processed_query: string;
  query_classification: BusinessQueryClassification;
  financial_expansion?: FinancialMetricsExpansion;
  query_enhancements: QueryEnhancement[];
  terminology_normalizations: TerminologyNormalization[];
  business_context_additions: BusinessContextAddition[];
  routing_recommendation: RoutingRecommendation;
  processing_metadata: ProcessingMetadata;
}

export interface QueryEnhancement {
  enhancement_type: 'synonym_expansion' | 'framework_specification' | 'context_enrichment' | 'metric_clarification' | 'implementation_focus';
  original_terms: string[];
  enhanced_terms: string[];
  confidence_score: number;
  business_relevance: number;
  explanation: string;
}

export interface TerminologyNormalization {
  original_term: string;
  normalized_term: string;
  normalization_type: 'hormozi_framework' | 'business_metric' | 'industry_standard' | 'functional_area';
  confidence: number;
  alternative_forms: string[];
  context_sensitivity: number;
}

export interface BusinessContextAddition {
  context_type: 'framework_components' | 'success_metrics' | 'implementation_stages' | 'industry_specifics' | 'business_stage_considerations';
  added_terms: string[];
  relevance_score: number;
  integration_method: 'append' | 'embed' | 'alternative_query';
  source_reasoning: string;
}

export interface RoutingRecommendation {
  recommended_strategy: 'direct_search' | 'multi_stage_search' | 'framework_focused' | 'comprehensive_analysis';
  complexity_level: 'simple' | 'moderate' | 'complex' | 'highly_complex';
  search_priorities: SearchPriority[];
  estimated_processing_time: string;
  special_handling_notes: string[];
}

export interface SearchPriority {
  priority_type: 'framework_content' | 'financial_metrics' | 'implementation_guides' | 'case_studies' | 'foundational_concepts';
  weight: number;
  specific_focus: string[];
  quality_requirements: QualityRequirement[];
}

export interface QualityRequirement {
  requirement_type: 'authority_level' | 'recency' | 'completeness' | 'actionability';
  minimum_threshold: number;
  preferred_threshold: number;
  importance: 'critical' | 'high' | 'medium' | 'low';
}

export interface ProcessingMetadata {
  processing_timestamp: string;
  processing_duration_ms: number;
  classification_confidence: number;
  enhancement_coverage: number;
  normalization_completeness: number;
  routing_certainty: number;
  optimization_techniques_applied: OptimizationTechnique[];
  potential_improvements: ImprovementSuggestion[];
}

export interface OptimizationTechnique {
  technique_name: string;
  technique_description: string;
  impact_assessment: 'low' | 'medium' | 'high' | 'significant';
  success_indicators: string[];
}

export interface ImprovementSuggestion {
  improvement_type: 'query_refinement' | 'context_addition' | 'terminology_clarification' | 'scope_adjustment';
  suggestion: string;
  expected_benefit: string;
  implementation_effort: 'minimal' | 'moderate' | 'substantial';
}

// Business terminology mappings
interface HormoziTerminologyMap {
  canonical_term: string;
  variations: string[];
  framework_association: HormoziFramework;
  business_context: string[];
  implementation_terms: string[];
  success_indicators: string[];
}

interface FinancialMetricMap {
  metric_name: string;
  variations: string[];
  category: FinancialMetricCategory;
  calculation_terms: string[];
  optimization_terms: string[];
  benchmark_terms: string[];
  related_metrics: string[];
}

interface BusinessSynonymMap {
  primary_term: string;
  business_synonyms: string[];
  industry_variants: Map<IndustryVertical, string[]>;
  stage_specific_terms: Map<BusinessLifecycleStage, string[]>;
  functional_variants: Map<FunctionalArea, string[]>;
  confidence_scores: Map<string, number>;
}

// Main Oracle Query Processor
export class OracleQueryProcessor {
  private businessClassifier: AdvancedBusinessQueryClassifier;
  private financialExpansion: FinancialMetricsQueryExpansion;
  private frameworkSearch: ContextAwareFrameworkSearch;
  
  private hormoziTerminology: Map<string, HormoziTerminologyMap> = new Map();
  private financialMetrics: Map<string, FinancialMetricMap> = new Map();
  private businessSynonyms: Map<string, BusinessSynonymMap> = new Map();
  private processingCache: Map<string, ProcessedQuery> = new Map();
  
  private readonly CACHE_DURATION = 300000; // 5 minutes
  private readonly DEFAULT_OPTIONS: ProcessingOptions = {
    enable_expansion: true,
    enable_normalization: true,
    enable_context_enhancement: true,
    enable_complexity_routing: true,
    max_expansion_terms: 10,
    synonym_confidence_threshold: 0.6,
    framework_focus: []
  };

  constructor() {
    this.businessClassifier = new AdvancedBusinessQueryClassifier();
    this.financialExpansion = new FinancialMetricsQueryExpansion();
    this.frameworkSearch = new ContextAwareFrameworkSearch();
    
    this.initializeHormoziTerminology();
    this.initializeFinancialMetrics();
    this.initializeBusinessSynonyms();
  }

  // Main query processing method
  async processQuery(request: QueryProcessingRequest): Promise<ProcessedQuery> {
    const processingId = this.generateProcessingId();
    const startTime = Date.now();

    console.log(`🔄 Processing Oracle query: "${request.original_query}"`);

    try {
      // Check cache first
      const cacheKey = this.generateCacheKey(request);
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        console.log('📋 Returning cached processed query');
        return cached;
      }

      const options = { ...this.DEFAULT_OPTIONS, ...request.processing_options };

      // Step 1: Classify business intent and context
      const queryClassification = await this.businessClassifier.classifyQuery(
        request.original_query,
        request.user_context,
        request.session_history?.map(h => h.query)
      );

      // Step 2: Normalize Hormozi and business terminology
      let normalizedQuery = request.original_query;
      const terminologyNormalizations: TerminologyNormalization[] = [];
      
      if (options.enable_normalization) {
        const normalizationResult = await this.normalizeTerminology(
          normalizedQuery,
          queryClassification,
          request.user_context
        );
        normalizedQuery = normalizationResult.normalized_query;
        terminologyNormalizations.push(...normalizationResult.normalizations);
      }

      // Step 3: Expand financial metrics if detected
      let financialExpansion: FinancialMetricsExpansion | undefined;
      if (queryClassification.business_context.financial_focus.length > 0) {
        financialExpansion = await this.financialExpansion.expandFinancialMetricsQuery(
          normalizedQuery,
          queryClassification,
          request.user_context
        );
        normalizedQuery = financialExpansion.expanded_query;
      }

      // Step 4: Apply query enhancements
      const queryEnhancements: QueryEnhancement[] = [];
      let enhancedQuery = normalizedQuery;
      
      if (options.enable_expansion) {
        const enhancementResult = await this.applyQueryEnhancements(
          enhancedQuery,
          queryClassification,
          request.user_context,
          options
        );
        enhancedQuery = enhancementResult.enhanced_query;
        queryEnhancements.push(...enhancementResult.enhancements);
      }

      // Step 5: Add business context
      const businessContextAdditions: BusinessContextAddition[] = [];
      let contextEnhancedQuery = enhancedQuery;
      
      if (options.enable_context_enhancement) {
        const contextResult = await this.addBusinessContext(
          contextEnhancedQuery,
          queryClassification,
          request.user_context,
          request.session_history
        );
        contextEnhancedQuery = contextResult.context_enhanced_query;
        businessContextAdditions.push(...contextResult.context_additions);
      }

      // Step 6: Generate routing recommendation
      const routingRecommendation = await this.generateRoutingRecommendation(
        queryClassification,
        queryEnhancements,
        options
      );

      // Step 7: Compile processing metadata
      const processingTime = Date.now() - startTime;
      const processingMetadata = this.generateProcessingMetadata(
        queryClassification,
        queryEnhancements,
        terminologyNormalizations,
        processingTime,
        options
      );

      const processedQuery: ProcessedQuery = {
        processing_id: processingId,
        original_query: request.original_query,
        processed_query: contextEnhancedQuery,
        query_classification: queryClassification,
        financial_expansion: financialExpansion,
        query_enhancements: queryEnhancements,
        terminology_normalizations: terminologyNormalizations,
        business_context_additions: businessContextAdditions,
        routing_recommendation: routingRecommendation,
        processing_metadata: processingMetadata
      };

      // Cache result
      this.cacheResult(cacheKey, processedQuery);

      console.log(`✅ Query processed: ${queryEnhancements.length} enhancements, ${terminologyNormalizations.length} normalizations`);
      return processedQuery;

    } catch (error) {
      console.error('❌ Query processing failed:', error);
      throw error;
    }
  }

  // Step 2: Normalize terminology
  private async normalizeTerminology(
    query: string,
    classification: BusinessQueryClassification,
    userContext?: UserContext
  ): Promise<{ normalized_query: string; normalizations: TerminologyNormalization[] }> {

    let normalizedQuery = query;
    const normalizations: TerminologyNormalization[] = [];
    const queryLower = query.toLowerCase();

    // Normalize Hormozi framework terminology
    for (const [key, terminologyMap] of this.hormoziTerminology) {
      for (const variation of terminologyMap.variations) {
        if (queryLower.includes(variation.toLowerCase())) {
          const normalized = terminologyMap.canonical_term;
          normalizedQuery = normalizedQuery.replace(
            new RegExp(variation, 'gi'),
            normalized
          );

          normalizations.push({
            original_term: variation,
            normalized_term: normalized,
            normalization_type: 'hormozi_framework',
            confidence: 0.9,
            alternative_forms: terminologyMap.variations,
            context_sensitivity: 0.8
          });
        }
      }
    }

    // Normalize financial metrics terminology
    for (const [key, metricMap] of this.financialMetrics) {
      for (const variation of metricMap.variations) {
        if (queryLower.includes(variation.toLowerCase())) {
          const normalized = metricMap.metric_name;
          normalizedQuery = normalizedQuery.replace(
            new RegExp(variation, 'gi'),
            normalized
          );

          normalizations.push({
            original_term: variation,
            normalized_term: normalized,
            normalization_type: 'business_metric',
            confidence: 0.85,
            alternative_forms: metricMap.variations,
            context_sensitivity: 0.7
          });
        }
      }
    }

    // Normalize business synonyms based on context
    for (const [primaryTerm, synonymMap] of this.businessSynonyms) {
      for (const synonym of synonymMap.business_synonyms) {
        if (queryLower.includes(synonym.toLowerCase())) {
          const contextScore = this.calculateContextRelevance(
            synonym,
            synonymMap,
            classification,
            userContext
          );

          if (contextScore > 0.6) {
            normalizedQuery = normalizedQuery.replace(
              new RegExp(synonym, 'gi'),
              primaryTerm
            );

            normalizations.push({
              original_term: synonym,
              normalized_term: primaryTerm,
              normalization_type: 'industry_standard',
              confidence: contextScore,
              alternative_forms: synonymMap.business_synonyms,
              context_sensitivity: contextScore
            });
          }
        }
      }
    }

    return {
      normalized_query: normalizedQuery,
      normalizations: normalizations
    };
  }

  // Step 4: Apply query enhancements
  private async applyQueryEnhancements(
    query: string,
    classification: BusinessQueryClassification,
    userContext?: UserContext,
    options?: ProcessingOptions
  ): Promise<{ enhanced_query: string; enhancements: QueryEnhancement[] }> {

    let enhancedQuery = query;
    const enhancements: QueryEnhancement[] = [];

    // Framework-specific synonym expansion
    await this.applyFrameworkSynonymExpansion(
      query,
      classification.business_context.framework_relevance,
      enhancements,
      options
    );

    // Financial metrics clarification
    if (classification.business_context.financial_focus.length > 0) {
      await this.applyFinancialMetricsEnhancement(
        query,
        classification.business_context.financial_focus,
        enhancements,
        options
      );
    }

    // Implementation-focused enhancement
    if (classification.primary_intent.intent_type === UserIntent.IMPLEMENTATION) {
      await this.applyImplementationFocusEnhancement(
        query,
        classification,
        enhancements,
        options
      );
    }

    // Business stage specific enhancement
    if (userContext?.business_stage) {
      await this.applyBusinessStageEnhancement(
        query,
        userContext.business_stage,
        classification,
        enhancements,
        options
      );
    }

    // Industry-specific enhancement
    if (userContext?.industry) {
      await this.applyIndustrySpecificEnhancement(
        query,
        userContext.industry,
        classification,
        enhancements,
        options
      );
    }

    // Build enhanced query from enhancements
    enhancedQuery = this.buildEnhancedQuery(query, enhancements, options);

    return {
      enhanced_query: enhancedQuery,
      enhancements: enhancements
    };
  }

  // Framework synonym expansion
  private async applyFrameworkSynonymExpansion(
    query: string,
    frameworkRelevance: any[],
    enhancements: QueryEnhancement[],
    options?: ProcessingOptions
  ): Promise<void> {

    for (const relevance of frameworkRelevance) {
      const framework = relevance.framework;
      const terminologyMap = this.hormoziTerminology.get(framework.toLowerCase());

      if (terminologyMap) {
        const synonyms = [
          ...terminologyMap.business_context,
          ...terminologyMap.implementation_terms
        ].slice(0, options?.max_expansion_terms || 5);

        if (synonyms.length > 0) {
          enhancements.push({
            enhancement_type: 'framework_specification',
            original_terms: [terminologyMap.canonical_term],
            enhanced_terms: synonyms,
            confidence_score: relevance.relevance_score,
            business_relevance: 0.9,
            explanation: `Added ${framework} framework-specific terminology for enhanced search precision`
          });
        }
      }
    }
  }

  // Financial metrics enhancement
  private async applyFinancialMetricsEnhancement(
    query: string,
    financialFocus: any[],
    enhancements: QueryEnhancement[],
    options?: ProcessingOptions
  ): Promise<void> {

    for (const focus of financialFocus) {
      for (const metric of focus.specific_metrics) {
        const metricMap = this.financialMetrics.get(metric.toLowerCase());

        if (metricMap) {
          const enhancedTerms = [
            ...metricMap.calculation_terms.slice(0, 2),
            ...metricMap.optimization_terms.slice(0, 2),
            ...metricMap.benchmark_terms.slice(0, 1)
          ];

          if (enhancedTerms.length > 0) {
            enhancements.push({
              enhancement_type: 'metric_clarification',
              original_terms: [metric],
              enhanced_terms: enhancedTerms,
              confidence_score: 0.85,
              business_relevance: 0.95,
              explanation: `Added calculation and optimization terms for ${metric} metric analysis`
            });
          }
        }
      }
    }
  }

  // Implementation focus enhancement
  private async applyImplementationFocusEnhancement(
    query: string,
    classification: BusinessQueryClassification,
    enhancements: QueryEnhancement[],
    options?: ProcessingOptions
  ): Promise<void> {

    const implementationTerms = [
      'step by step',
      'how to implement',
      'execution plan',
      'practical application',
      'implementation guide',
      'action items',
      'best practices',
      'common pitfalls',
      'success metrics',
      'timeline'
    ];

    const contextRelevantTerms = implementationTerms.slice(0, options?.max_expansion_terms || 6);

    enhancements.push({
      enhancement_type: 'implementation_focus',
      original_terms: ['implementation', 'execute', 'apply'],
      enhanced_terms: contextRelevantTerms,
      confidence_score: 0.8,
      business_relevance: 0.9,
      explanation: 'Added implementation-specific terms for actionable guidance search'
    });
  }

  // Business stage enhancement
  private async applyBusinessStageEnhancement(
    query: string,
    businessStage: BusinessLifecycleStage,
    classification: BusinessQueryClassification,
    enhancements: QueryEnhancement[],
    options?: ProcessingOptions
  ): Promise<void> {

    const stageTerms = this.getStageSpecificTerms(businessStage);
    
    if (stageTerms.length > 0) {
      enhancements.push({
        enhancement_type: 'context_enrichment',
        original_terms: [businessStage.toString()],
        enhanced_terms: stageTerms.slice(0, options?.max_expansion_terms || 4),
        confidence_score: 0.75,
        business_relevance: 0.85,
        explanation: `Added ${businessStage}-specific terminology for stage-appropriate content`
      });
    }
  }

  // Industry specific enhancement
  private async applyIndustrySpecificEnhancement(
    query: string,
    industry: IndustryVertical,
    classification: BusinessQueryClassification,
    enhancements: QueryEnhancement[],
    options?: ProcessingOptions
  ): Promise<void> {

    const industryTerms = this.getIndustrySpecificTerms(industry);
    
    if (industryTerms.length > 0) {
      enhancements.push({
        enhancement_type: 'context_enrichment',
        original_terms: [industry.toString()],
        enhanced_terms: industryTerms.slice(0, options?.max_expansion_terms || 3),
        confidence_score: 0.7,
        business_relevance: 0.8,
        explanation: `Added ${industry} industry-specific context for relevant content discovery`
      });
    }
  }

  // Step 5: Add business context
  private async addBusinessContext(
    query: string,
    classification: BusinessQueryClassification,
    userContext?: UserContext,
    sessionHistory?: QueryHistoryItem[]
  ): Promise<{ context_enhanced_query: string; context_additions: BusinessContextAddition[] }> {

    const contextAdditions: BusinessContextAddition[] = [];
    const contextTerms: string[] = [];

    // Add framework components context
    if (classification.business_context.framework_relevance.length > 0) {
      const frameworkComponents = this.getFrameworkComponents(
        classification.business_context.framework_relevance
      );

      if (frameworkComponents.length > 0) {
        contextAdditions.push({
          context_type: 'framework_components',
          added_terms: frameworkComponents,
          relevance_score: 0.85,
          integration_method: 'embed',
          source_reasoning: 'Framework components enhance search precision for structured content'
        });
        contextTerms.push(...frameworkComponents.slice(0, 3));
      }
    }

    // Add success metrics context
    const successMetrics = this.getSuccessMetricsContext(classification, userContext);
    if (successMetrics.length > 0) {
      contextAdditions.push({
        context_type: 'success_metrics',
        added_terms: successMetrics,
        relevance_score: 0.8,
        integration_method: 'append',
        source_reasoning: 'Success metrics help identify results-oriented content'
      });
      contextTerms.push(...successMetrics.slice(0, 2));
    }

    // Add implementation stages context for implementation intent
    if (classification.primary_intent.intent_type === UserIntent.IMPLEMENTATION) {
      const implementationStages = [
        'planning phase',
        'execution phase',
        'measurement phase',
        'optimization phase'
      ];

      contextAdditions.push({
        context_type: 'implementation_stages',
        added_terms: implementationStages,
        relevance_score: 0.9,
        integration_method: 'embed',
        source_reasoning: 'Implementation stages provide structured approach to execution content'
      });
      contextTerms.push(...implementationStages.slice(0, 2));
    }

    // Build context-enhanced query
    const contextEnhancedQuery = contextTerms.length > 0 
      ? `${query} ${contextTerms.join(' ')}`
      : query;

    return {
      context_enhanced_query: contextEnhancedQuery,
      context_additions: contextAdditions
    };
  }

  // Step 6: Generate routing recommendation
  private async generateRoutingRecommendation(
    classification: BusinessQueryClassification,
    enhancements: QueryEnhancement[],
    options: ProcessingOptions
  ): Promise<RoutingRecommendation> {

    const complexityLevel = this.assessQueryComplexity(classification, enhancements);
    const recommendedStrategy = this.determineSearchStrategy(classification, complexityLevel);
    const searchPriorities = this.generateSearchPriorities(classification, enhancements);

    return {
      recommended_strategy: recommendedStrategy,
      complexity_level: complexityLevel,
      search_priorities: searchPriorities,
      estimated_processing_time: this.estimateProcessingTime(complexityLevel, searchPriorities),
      special_handling_notes: this.generateSpecialHandlingNotes(classification, enhancements)
    };
  }

  // Build enhanced query from enhancements
  private buildEnhancedQuery(
    originalQuery: string,
    enhancements: QueryEnhancement[],
    options?: ProcessingOptions
  ): string {

    // Prioritize enhancements by relevance and confidence
    const prioritizedEnhancements = enhancements
      .sort((a, b) => (b.confidence_score * b.business_relevance) - (a.confidence_score * a.business_relevance))
      .slice(0, 3); // Top 3 enhancements

    let enhancedQuery = originalQuery;

    for (const enhancement of prioritizedEnhancements) {
      // Add top terms from each enhancement
      const topTerms = enhancement.enhanced_terms
        .slice(0, Math.min(3, Math.floor((options?.max_expansion_terms || 10) / prioritizedEnhancements.length)));
      
      enhancedQuery += ` ${topTerms.join(' ')}`;
    }

    return enhancedQuery.trim();
  }

  // Initialize terminology mappings
  private initializeHormoziTerminology(): void {
    // Grand Slam Offers
    this.hormoziTerminology.set('grand_slam_offers', {
      canonical_term: 'Grand Slam Offers',
      variations: ['grand slam offer', 'gso', 'irresistible offer', 'value equation'],
      framework_association: HormoziFramework.GRAND_SLAM_OFFERS,
      business_context: ['value proposition', 'offer enhancement', 'conversion optimization'],
      implementation_terms: ['dream outcome', 'perceived likelihood', 'time delay', 'effort sacrifice'],
      success_indicators: ['higher conversion', 'increased sales', 'better offers', 'customer acquisition']
    });

    // Core Four
    this.hormoziTerminology.set('core_four', {
      canonical_term: 'Core Four',
      variations: ['core 4', 'four channels', 'acquisition channels', 'lead generation channels'],
      framework_association: HormoziFramework.CORE_FOUR,
      business_context: ['lead generation', 'customer acquisition', 'marketing channels'],
      implementation_terms: ['warm outreach', 'cold outreach', 'warm content', 'cold content'],
      success_indicators: ['lead volume', 'acquisition cost', 'channel effectiveness', 'lead quality']
    });

    // LTV/CAC Optimization
    this.hormoziTerminology.set('ltv_cac_optimization', {
      canonical_term: 'LTV/CAC Optimization',
      variations: ['ltv cac', 'lifetime value optimization', 'unit economics', 'customer economics'],
      framework_association: HormoziFramework.LTV_CAC_OPTIMIZATION,
      business_context: ['unit economics', 'customer profitability', 'business sustainability'],
      implementation_terms: ['lifetime value', 'acquisition cost', 'payback period', 'retention rate'],
      success_indicators: ['profitable growth', 'sustainable acquisition', 'improved unit economics']
    });

    // Add other frameworks...
  }

  private initializeFinancialMetrics(): void {
    // LTV
    this.financialMetrics.set('ltv', {
      metric_name: 'Customer Lifetime Value',
      variations: ['ltv', 'lifetime value', 'customer lifetime value', 'clv'],
      category: FinancialMetricCategory.RETENTION,
      calculation_terms: ['calculate ltv', 'ltv formula', 'lifetime value calculation'],
      optimization_terms: ['increase ltv', 'improve lifetime value', 'maximize customer value'],
      benchmark_terms: ['ltv benchmark', 'industry average ltv'],
      related_metrics: ['cac', 'retention rate', 'average order value', 'churn rate']
    });

    // CAC
    this.financialMetrics.set('cac', {
      metric_name: 'Customer Acquisition Cost',
      variations: ['cac', 'customer acquisition cost', 'acquisition cost', 'cost per customer'],
      category: FinancialMetricCategory.COST,
      calculation_terms: ['calculate cac', 'cac formula', 'acquisition cost calculation'],
      optimization_terms: ['reduce cac', 'lower acquisition cost', 'optimize cac'],
      benchmark_terms: ['cac benchmark', 'industry cac rates'],
      related_metrics: ['ltv', 'cpa', 'conversion rate', 'lead cost']
    });

    // LTV/CAC Ratio
    this.financialMetrics.set('ltv_cac_ratio', {
      metric_name: 'LTV/CAC Ratio',
      variations: ['ltv/cac', 'ltv to cac ratio', 'ltv cac ratio', 'unit economics ratio'],
      category: FinancialMetricCategory.EFFICIENCY,
      calculation_terms: ['ltv/cac calculation', 'ratio formula', 'unit economics math'],
      optimization_terms: ['improve ltv/cac', 'optimize ratio', 'better unit economics'],
      benchmark_terms: ['3:1 ratio', 'healthy ltv/cac', 'benchmark ratio'],
      related_metrics: ['payback period', 'gross margin', 'retention rate']
    });

    // Add more metrics...
  }

  private initializeBusinessSynonyms(): void {
    // Revenue synonyms
    this.businessSynonyms.set('revenue', {
      primary_term: 'revenue',
      business_synonyms: ['sales', 'income', 'earnings', 'turnover', 'gross receipts'],
      industry_variants: new Map([
        [IndustryVertical.SAAS, ['arr', 'mrr', 'recurring revenue']],
        [IndustryVertical.ECOMMERCE, ['gross sales', 'net sales', 'order volume']],
        [IndustryVertical.CONSULTING, ['billings', 'fee income', 'professional services revenue']]
      ]),
      stage_specific_terms: new Map([
        [BusinessLifecycleStage.STARTUP, ['initial revenue', 'first sales', 'revenue validation']],
        [BusinessLifecycleStage.SCALING, ['revenue growth', 'scaling revenue', 'revenue acceleration']]
      ]),
      functional_variants: new Map([
        [FunctionalArea.FINANCE, ['top line', 'gross revenue', 'revenue recognition']],
        [FunctionalArea.SALES, ['sales revenue', 'deal value', 'closed won revenue']]
      ]),
      confidence_scores: new Map([
        ['sales', 0.95],
        ['income', 0.8],
        ['earnings', 0.75],
        ['turnover', 0.7],
        ['arr', 0.9],
        ['mrr', 0.9]
      ])
    });

    // Growth synonyms
    this.businessSynonyms.set('growth', {
      primary_term: 'growth',
      business_synonyms: ['expansion', 'scaling', 'increase', 'development', 'progress'],
      industry_variants: new Map([
        [IndustryVertical.SAAS, ['user growth', 'subscription growth', 'account expansion']],
        [IndustryVertical.ECOMMERCE, ['order growth', 'customer growth', 'market expansion']]
      ]),
      stage_specific_terms: new Map([
        [BusinessLifecycleStage.STARTUP, ['initial growth', 'early traction', 'growth validation']],
        [BusinessLifecycleStage.SCALING, ['rapid growth', 'growth acceleration', 'scale']]
      ]),
      functional_variants: new Map([
        [FunctionalArea.MARKETING, ['lead growth', 'audience growth', 'reach expansion']],
        [FunctionalArea.SALES, ['sales growth', 'pipeline growth', 'deal growth']]
      ]),
      confidence_scores: new Map([
        ['expansion', 0.9],
        ['scaling', 0.95],
        ['increase', 0.8],
        ['development', 0.7]
      ])
    });

    // Add more synonym mappings...
  }

  // Helper methods
  private calculateContextRelevance(
    synonym: string,
    synonymMap: BusinessSynonymMap,
    classification: BusinessQueryClassification,
    userContext?: UserContext
  ): number {

    let relevance = synonymMap.confidence_scores.get(synonym) || 0.5;

    // Boost for industry-specific terms
    if (userContext?.industry) {
      const industryVariants = synonymMap.industry_variants.get(userContext.industry) || [];
      if (industryVariants.includes(synonym)) {
        relevance += 0.2;
      }
    }

    // Boost for stage-specific terms
    if (userContext?.business_stage) {
      const stageVariants = synonymMap.stage_specific_terms.get(userContext.business_stage) || [];
      if (stageVariants.includes(synonym)) {
        relevance += 0.15;
      }
    }

    // Boost for functional area alignment
    if (userContext?.functional_role) {
      const functionalVariants = synonymMap.functional_variants.get(userContext.functional_role) || [];
      if (functionalVariants.includes(synonym)) {
        relevance += 0.1;
      }
    }

    return Math.min(1.0, relevance);
  }

  private getStageSpecificTerms(stage: BusinessLifecycleStage): string[] {
    const stageTerms = {
      [BusinessLifecycleStage.STARTUP]: ['mvp', 'validation', 'product market fit', 'early traction'],
      [BusinessLifecycleStage.SCALING]: ['growth systems', 'process optimization', 'team building', 'infrastructure'],
      [BusinessLifecycleStage.ESTABLISHED]: ['market leadership', 'competitive advantage', 'operational excellence'],
      [BusinessLifecycleStage.EXPANSION]: ['new markets', 'diversification', 'strategic partnerships']
    };
    return stageTerms[stage] || [];
  }

  private getIndustrySpecificTerms(industry: IndustryVertical): string[] {
    const industryTerms = {
      [IndustryVertical.SAAS]: ['subscription', 'churn', 'mrr', 'user onboarding'],
      [IndustryVertical.ECOMMERCE]: ['cart abandonment', 'conversion rate', 'average order value', 'inventory'],
      [IndustryVertical.CONSULTING]: ['utilization rate', 'billable hours', 'client retention', 'expertise'],
      [IndustryVertical.PROFESSIONAL_SERVICES]: ['project management', 'client satisfaction', 'service delivery']
    };
    return industryTerms[industry] || [];
  }

  private getFrameworkComponents(frameworkRelevance: any[]): string[] {
    const components: string[] = [];
    for (const relevance of frameworkRelevance) {
      const framework = relevance.framework;
      const terminologyMap = this.hormoziTerminology.get(framework.toLowerCase());
      if (terminologyMap) {
        components.push(...terminologyMap.implementation_terms.slice(0, 2));
      }
    }
    return components;
  }

  private getSuccessMetricsContext(
    classification: BusinessQueryClassification,
    userContext?: UserContext
  ): string[] {
    const baseMetrics = ['roi', 'conversion rate', 'growth rate', 'efficiency'];
    
    // Add framework-specific success metrics
    const frameworkMetrics: string[] = [];
    for (const relevance of classification.business_context.framework_relevance) {
      const terminologyMap = this.hormoziTerminology.get(relevance.framework.toLowerCase());
      if (terminologyMap) {
        frameworkMetrics.push(...terminologyMap.success_indicators.slice(0, 1));
      }
    }
    
    return [...baseMetrics.slice(0, 2), ...frameworkMetrics.slice(0, 2)];
  }

  // Query complexity and routing methods
  private assessQueryComplexity(
    classification: BusinessQueryClassification,
    enhancements: QueryEnhancement[]
  ): 'simple' | 'moderate' | 'complex' | 'highly_complex' {

    const complexityFactors = classification.query_complexity.complexity_factors.length;
    const frameworkCount = classification.business_context.framework_relevance.length;
    const enhancementCount = enhancements.length;

    if (complexityFactors >= 3 || frameworkCount >= 3 || enhancementCount >= 5) {
      return 'highly_complex';
    } else if (complexityFactors >= 2 || frameworkCount >= 2 || enhancementCount >= 3) {
      return 'complex';
    } else if (complexityFactors >= 1 || frameworkCount >= 1 || enhancementCount >= 2) {
      return 'moderate';
    } else {
      return 'simple';
    }
  }

  private determineSearchStrategy(
    classification: BusinessQueryClassification,
    complexity: 'simple' | 'moderate' | 'complex' | 'highly_complex'
  ): 'direct_search' | 'multi_stage_search' | 'framework_focused' | 'comprehensive_analysis' {

    if (complexity === 'highly_complex') {
      return 'comprehensive_analysis';
    } else if (classification.business_context.framework_relevance.length > 0) {
      return 'framework_focused';
    } else if (complexity === 'complex') {
      return 'multi_stage_search';
    } else {
      return 'direct_search';
    }
  }

  private generateSearchPriorities(
    classification: BusinessQueryClassification,
    enhancements: QueryEnhancement[]
  ): SearchPriority[] {

    const priorities: SearchPriority[] = [];

    // Framework content priority
    if (classification.business_context.framework_relevance.length > 0) {
      priorities.push({
        priority_type: 'framework_content',
        weight: 0.4,
        specific_focus: classification.business_context.framework_relevance.map(fr => fr.framework.toString()),
        quality_requirements: [
          { requirement_type: 'authority_level', minimum_threshold: 0.8, preferred_threshold: 0.9, importance: 'high' }
        ]
      });
    }

    // Financial metrics priority
    if (classification.business_context.financial_focus.length > 0) {
      priorities.push({
        priority_type: 'financial_metrics',
        weight: 0.3,
        specific_focus: classification.business_context.financial_focus.flatMap(ff => ff.specific_metrics),
        quality_requirements: [
          { requirement_type: 'completeness', minimum_threshold: 0.7, preferred_threshold: 0.85, importance: 'high' }
        ]
      });
    }

    // Implementation guides for implementation intent
    if (classification.primary_intent.intent_type === UserIntent.IMPLEMENTATION) {
      priorities.push({
        priority_type: 'implementation_guides',
        weight: 0.25,
        specific_focus: ['step by step', 'practical guide', 'execution plan'],
        quality_requirements: [
          { requirement_type: 'actionability', minimum_threshold: 0.8, preferred_threshold: 0.9, importance: 'critical' }
        ]
      });
    }

    // Ensure total weight <= 1.0
    const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0);
    if (totalWeight > 1.0) {
      priorities.forEach(p => p.weight = p.weight / totalWeight);
    }

    return priorities;
  }

  private estimateProcessingTime(
    complexity: 'simple' | 'moderate' | 'complex' | 'highly_complex',
    priorities: SearchPriority[]
  ): string {

    const timeEstimates = {
      'simple': '1-2 seconds',
      'moderate': '2-5 seconds',
      'complex': '5-10 seconds',
      'highly_complex': '10-20 seconds'
    };

    return timeEstimates[complexity];
  }

  private generateSpecialHandlingNotes(
    classification: BusinessQueryClassification,
    enhancements: QueryEnhancement[]
  ): string[] {

    const notes: string[] = [];

    if (classification.business_context.framework_relevance.length > 2) {
      notes.push('Multiple framework integration required - ensure cross-framework consistency');
    }

    if (classification.business_context.financial_focus.length > 0) {
      notes.push('Financial metrics focus - prioritize calculation accuracy and benchmarking data');
    }

    if (classification.primary_intent.urgency_level === 'critical') {
      notes.push('High urgency query - optimize for speed while maintaining quality');
    }

    if (enhancements.some(e => e.confidence_score < 0.7)) {
      notes.push('Some enhancement confidence below threshold - monitor result relevance');
    }

    return notes;
  }

  // Processing metadata generation
  private generateProcessingMetadata(
    classification: BusinessQueryClassification,
    enhancements: QueryEnhancement[],
    normalizations: TerminologyNormalization[],
    processingTime: number,
    options: ProcessingOptions
  ): ProcessingMetadata {

    const optimizationTechniques: OptimizationTechnique[] = [];
    
    if (options.enable_normalization && normalizations.length > 0) {
      optimizationTechniques.push({
        technique_name: 'Terminology Normalization',
        technique_description: 'Standardized business and framework terminology',
        impact_assessment: 'high',
        success_indicators: [`${normalizations.length} terms normalized`]
      });
    }

    if (options.enable_expansion && enhancements.length > 0) {
      optimizationTechniques.push({
        technique_name: 'Query Enhancement',
        technique_description: 'Added relevant business context and synonyms',
        impact_assessment: 'high',
        success_indicators: [`${enhancements.length} enhancements applied`]
      });
    }

    return {
      processing_timestamp: new Date().toISOString(),
      processing_duration_ms: processingTime,
      classification_confidence: classification.confidence_score,
      enhancement_coverage: enhancements.length > 0 ? 
        enhancements.reduce((sum, e) => sum + e.confidence_score, 0) / enhancements.length : 0,
      normalization_completeness: normalizations.length > 0 ?
        normalizations.reduce((sum, n) => sum + n.confidence, 0) / normalizations.length : 0,
      routing_certainty: 0.85, // Would be calculated based on routing confidence
      optimization_techniques_applied: optimizationTechniques,
      potential_improvements: []
    };
  }

  // Cache management
  private generateCacheKey(request: QueryProcessingRequest): string {
    return Buffer.from(JSON.stringify({
      query: request.original_query,
      context: request.user_context,
      options: request.processing_options
    })).toString('base64');
  }

  private getCachedResult(cacheKey: string): ProcessedQuery | null {
    const cached = this.processingCache.get(cacheKey);
    if (cached && (Date.now() - new Date(cached.processing_metadata.processing_timestamp).getTime()) < this.CACHE_DURATION) {
      return cached;
    }
    if (cached) {
      this.processingCache.delete(cacheKey);
    }
    return null;
  }

  private cacheResult(cacheKey: string, result: ProcessedQuery): void {
    this.processingCache.set(cacheKey, result);
  }

  private generateProcessingId(): string {
    return `proc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default OracleQueryProcessor;