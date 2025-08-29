/**
 * Financial Metrics Query Expansion System
 * Alice Intelligence - Intelligent query expansion for financial metrics optimization
 * Enhances Elena's RAG system with sophisticated financial metrics understanding
 */

import {
  FinancialMetricCategory,
  KPICategory,
  BusinessLifecycleStage,
  IndustryVertical,
  HormoziFramework
} from '../types/businessIntelligence';
import { BusinessQueryClassification } from './advancedBusinessQueryClassifier';

// Financial metrics query expansion interfaces
export interface FinancialMetricsExpansion {
  expansion_id: string;
  original_query: string;
  expanded_query: string;
  detected_metrics: DetectedFinancialMetric[];
  expansion_strategies: ExpansionStrategy[];
  optimization_focus: OptimizationFocus[];
  business_context_enhancements: BusinessContextEnhancement[];
  calculation_components: CalculationComponent[];
  benchmarking_data: BenchmarkingData[];
}

export interface DetectedFinancialMetric {
  metric_name: string;
  metric_category: FinancialMetricCategory;
  confidence: number;
  metric_variations: string[];
  business_significance: BusinessSignificance;
  calculation_requirements: CalculationRequirements;
  optimization_opportunities: OptimizationOpportunity[];
}

export interface BusinessSignificance {
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  business_functions_affected: string[];
  decision_making_importance: 'informational' | 'tactical' | 'strategic' | 'executive';
  hormozi_framework_relevance: HormoziFrameworkRelevance[];
}

export interface HormoziFrameworkRelevance {
  framework: HormoziFramework;
  relevance_strength: 'weak' | 'moderate' | 'strong' | 'central';
  application_context: string;
  success_correlation: number;
}

export interface CalculationRequirements {
  formula: string;
  required_data_points: DataPoint[];
  calculation_complexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  data_availability_challenges: string[];
  automation_potential: 'low' | 'medium' | 'high';
}

export interface DataPoint {
  data_name: string;
  data_type: 'revenue' | 'cost' | 'time' | 'count' | 'percentage' | 'ratio';
  typical_source: string;
  collection_difficulty: 'easy' | 'moderate' | 'difficult' | 'very_difficult';
  accuracy_importance: 'low' | 'medium' | 'high' | 'critical';
}

export interface OptimizationOpportunity {
  opportunity_type: 'increase' | 'decrease' | 'stabilize' | 'accelerate' | 'improve_quality';
  optimization_levers: OptimizationLever[];
  expected_impact: ExpectedImpact;
  implementation_approach: ImplementationApproach;
  success_indicators: string[];
}

export interface OptimizationLever {
  lever_name: string;
  lever_category: 'revenue' | 'cost' | 'efficiency' | 'time' | 'quality' | 'risk';
  impact_magnitude: 'minimal' | 'moderate' | 'significant' | 'transformational';
  implementation_difficulty: 'easy' | 'moderate' | 'difficult' | 'very_difficult';
  hormozi_framework_alignment: HormoziFramework[];
}

export interface ExpectedImpact {
  metric_improvement_range: {
    conservative: number;
    realistic: number;
    optimistic: number;
  };
  timeframe_to_impact: string;
  business_value_estimate: string;
  risk_factors: string[];
}

export interface ImplementationApproach {
  approach_type: 'gradual' | 'aggressive' | 'phased' | 'experimental';
  recommended_sequence: string[];
  resource_requirements: string[];
  success_probability: number;
}

export interface ExpansionStrategy {
  strategy_name: string;
  expansion_type: 'synonym' | 'related_concept' | 'calculation_context' | 'benchmarking' | 'optimization';
  added_terms: string[];
  business_context_terms: string[];
  industry_specific_terms: string[];
  calculation_terms: string[];
  weight: number;
}

export interface OptimizationFocus {
  focus_area: 'calculation' | 'benchmarking' | 'improvement' | 'troubleshooting' | 'forecasting';
  specific_objectives: string[];
  success_criteria: string[];
  measurement_approaches: string[];
  common_challenges: string[];
}

export interface BusinessContextEnhancement {
  enhancement_type: 'industry_specific' | 'stage_specific' | 'functional_specific' | 'framework_specific';
  context_terms: string[];
  relevance_boost: number;
  application_scenarios: string[];
}

export interface CalculationComponent {
  component_name: string;
  component_type: 'numerator' | 'denominator' | 'coefficient' | 'time_period' | 'adjustment_factor';
  business_meaning: string;
  calculation_variations: string[];
  data_source_requirements: string[];
}

export interface BenchmarkingData {
  benchmark_type: 'industry' | 'stage' | 'size' | 'geographic' | 'hormozi_standard';
  benchmark_source: string;
  benchmark_ranges: BenchmarkRange;
  context_factors: string[];
  reliability_score: number;
}

export interface BenchmarkRange {
  poor_performance: number;
  below_average: number;
  average: number;
  above_average: number;
  excellent: number;
  world_class: number;
}

// Main financial metrics query expansion engine
export class FinancialMetricsQueryExpansion {
  private metricsDatabase: Map<string, FinancialMetricDefinition> = new Map();
  private calculationFormulas: Map<string, CalculationFormula> = new Map();
  private industryBenchmarks: Map<IndustryVertical, IndustryBenchmarks> = new Map();
  private hormoziMetricsMapping: Map<HormoziFramework, string[]> = new Map();
  private optimizationStrategies: Map<string, OptimizationStrategy[]> = new Map();

  constructor() {
    this.initializeMetricsDatabase();
    this.initializeCalculationFormulas();
    this.initializeIndustryBenchmarks();
    this.initializeHormoziMetricsMapping();
    this.initializeOptimizationStrategies();
  }

  // Main expansion method
  async expandFinancialMetricsQuery(
    originalQuery: string,
    queryClassification: BusinessQueryClassification,
    userContext?: any
  ): Promise<FinancialMetricsExpansion> {
    
    const expansionId = this.generateExpansionId();
    console.log(`📊 Expanding financial metrics query: "${originalQuery}"`);
    
    try {
      // Step 1: Detect financial metrics in query
      const detectedMetrics = await this.detectFinancialMetrics(originalQuery, queryClassification);
      
      // Step 2: Generate expansion strategies
      const expansionStrategies = await this.generateExpansionStrategies(
        originalQuery,
        detectedMetrics,
        queryClassification
      );
      
      // Step 3: Determine optimization focus areas
      const optimizationFocus = await this.determineOptimizationFocus(
        detectedMetrics,
        queryClassification,
        userContext
      );
      
      // Step 4: Add business context enhancements
      const businessContextEnhancements = await this.addBusinessContextEnhancements(
        detectedMetrics,
        queryClassification,
        userContext
      );
      
      // Step 5: Extract calculation components
      const calculationComponents = await this.extractCalculationComponents(detectedMetrics);
      
      // Step 6: Add benchmarking data
      const benchmarkingData = await this.addBenchmarkingData(
        detectedMetrics,
        queryClassification,
        userContext
      );
      
      // Step 7: Build expanded query
      const expandedQuery = this.buildExpandedQuery(
        originalQuery,
        expansionStrategies,
        businessContextEnhancements
      );
      
      const expansion: FinancialMetricsExpansion = {
        expansion_id: expansionId,
        original_query: originalQuery,
        expanded_query: expandedQuery,
        detected_metrics: detectedMetrics,
        expansion_strategies: expansionStrategies,
        optimization_focus: optimizationFocus,
        business_context_enhancements: businessContextEnhancements,
        calculation_components: calculationComponents,
        benchmarking_data: benchmarkingData
      };
      
      console.log(`✅ Financial metrics query expanded with ${detectedMetrics.length} metrics detected`);
      return expansion;
      
    } catch (error) {
      console.error('❌ Financial metrics query expansion failed:', error);
      throw error;
    }
  }

  // Step 1: Detect financial metrics in query
  private async detectFinancialMetrics(
    query: string,
    queryClassification: BusinessQueryClassification
  ): Promise<DetectedFinancialMetric[]> {
    
    const detectedMetrics: DetectedFinancialMetric[] = [];
    const queryLower = query.toLowerCase();
    
    // Check for each known metric
    for (const [metricKey, metricDef] of this.metricsDatabase) {
      const confidence = this.calculateMetricDetectionConfidence(queryLower, metricDef);
      
      if (confidence > 0.3) { // Threshold for detection
        const businessSignificance = this.assessBusinessSignificance(
          metricKey,
          queryClassification
        );
        
        const calculationRequirements = this.getCalculationRequirements(metricKey);
        const optimizationOpportunities = this.getOptimizationOpportunities(metricKey);
        
        const detectedMetric: DetectedFinancialMetric = {
          metric_name: metricDef.display_name,
          metric_category: metricDef.category,
          confidence: confidence,
          metric_variations: metricDef.variations,
          business_significance: businessSignificance,
          calculation_requirements: calculationRequirements,
          optimization_opportunities: optimizationOpportunities
        };
        
        detectedMetrics.push(detectedMetric);
      }
    }
    
    return detectedMetrics.sort((a, b) => b.confidence - a.confidence);
  }

  // Step 2: Generate intelligent expansion strategies
  private async generateExpansionStrategies(
    originalQuery: string,
    detectedMetrics: DetectedFinancialMetric[],
    queryClassification: BusinessQueryClassification
  ): Promise<ExpansionStrategy[]> {
    
    const strategies: ExpansionStrategy[] = [];
    
    // Strategy 1: Synonym expansion for detected metrics
    for (const metric of detectedMetrics) {
      const synonymStrategy: ExpansionStrategy = {
        strategy_name: `${metric.metric_name}_synonyms`,
        expansion_type: 'synonym',
        added_terms: metric.metric_variations,
        business_context_terms: this.getBusinessContextTerms(metric.metric_name),
        industry_specific_terms: this.getIndustrySpecificTerms(metric.metric_name, queryClassification),
        calculation_terms: this.getCalculationTerms(metric.metric_name),
        weight: metric.confidence
      };
      strategies.push(synonymStrategy);
    }
    
    // Strategy 2: Related concept expansion
    const relatedConcepts = this.getRelatedFinancialConcepts(detectedMetrics);
    if (relatedConcepts.length > 0) {
      strategies.push({
        strategy_name: 'related_concepts',
        expansion_type: 'related_concept',
        added_terms: relatedConcepts,
        business_context_terms: [],
        industry_specific_terms: [],
        calculation_terms: [],
        weight: 0.7
      });
    }
    
    // Strategy 3: Calculation context expansion
    const calculationContext = this.getCalculationContextTerms(detectedMetrics);
    if (calculationContext.length > 0) {
      strategies.push({
        strategy_name: 'calculation_context',
        expansion_type: 'calculation_context',
        added_terms: calculationContext,
        business_context_terms: ['formula', 'calculation', 'compute'],
        industry_specific_terms: [],
        calculation_terms: ['numerator', 'denominator', 'ratio', 'percentage'],
        weight: 0.8
      });
    }
    
    // Strategy 4: Benchmarking expansion
    if (this.hasBenchmarkingIntent(originalQuery)) {
      strategies.push({
        strategy_name: 'benchmarking_context',
        expansion_type: 'benchmarking',
        added_terms: ['benchmark', 'industry standard', 'average', 'percentile'],
        business_context_terms: ['compare', 'competitive', 'market rate'],
        industry_specific_terms: this.getIndustryBenchmarkTerms(queryClassification),
        calculation_terms: [],
        weight: 0.9
      });
    }
    
    // Strategy 5: Optimization expansion
    if (this.hasOptimizationIntent(originalQuery)) {
      strategies.push({
        strategy_name: 'optimization_context',
        expansion_type: 'optimization',
        added_terms: ['improve', 'optimize', 'increase', 'maximize', 'enhance'],
        business_context_terms: ['strategies', 'tactics', 'methods', 'approaches'],
        industry_specific_terms: [],
        calculation_terms: [],
        weight: 0.85
      });
    }
    
    return strategies;
  }

  // Step 3: Determine optimization focus areas
  private async determineOptimizationFocus(
    detectedMetrics: DetectedFinancialMetric[],
    queryClassification: BusinessQueryClassification,
    userContext?: any
  ): Promise<OptimizationFocus[]> {
    
    const focusAreas: OptimizationFocus[] = [];
    const queryIntent = queryClassification.primary_intent.intent_type;
    
    // Determine focus based on query intent and detected metrics
    for (const metric of detectedMetrics) {
      // Calculation focus
      if (this.hasCalculationSignals(queryClassification.original_query)) {
        focusAreas.push({
          focus_area: 'calculation',
          specific_objectives: [
            `Calculate ${metric.metric_name} accurately`,
            'Understand formula components',
            'Identify required data points'
          ],
          success_criteria: [
            'Complete calculation formula provided',
            'All data requirements identified',
            'Calculation examples included'
          ],
          measurement_approaches: ['formula validation', 'data source verification', 'calculation accuracy'],
          common_challenges: ['data availability', 'calculation complexity', 'data quality']
        });
      }
      
      // Benchmarking focus
      if (this.hasBenchmarkingSignals(queryClassification.original_query)) {
        focusAreas.push({
          focus_area: 'benchmarking',
          specific_objectives: [
            `Compare ${metric.metric_name} against industry standards`,
            'Identify performance gaps',
            'Understand relative positioning'
          ],
          success_criteria: [
            'Industry benchmarks provided',
            'Performance context established',
            'Improvement opportunities identified'
          ],
          measurement_approaches: ['percentile ranking', 'gap analysis', 'peer comparison'],
          common_challenges: ['benchmark data availability', 'context differences', 'data freshness']
        });
      }
      
      // Improvement focus
      if (this.hasImprovementSignals(queryClassification.original_query)) {
        focusAreas.push({
          focus_area: 'improvement',
          specific_objectives: [
            `Improve ${metric.metric_name} performance`,
            'Identify optimization levers',
            'Implement improvement strategies'
          ],
          success_criteria: [
            'Improvement strategies identified',
            'Implementation roadmap provided',
            'Expected impact quantified'
          ],
          measurement_approaches: ['baseline measurement', 'progress tracking', 'impact assessment'],
          common_challenges: ['resource constraints', 'implementation complexity', 'measurement accuracy']
        });
      }
    }
    
    return focusAreas;
  }

  // Step 4: Add business context enhancements
  private async addBusinessContextEnhancements(
    detectedMetrics: DetectedFinancialMetric[],
    queryClassification: BusinessQueryClassification,
    userContext?: any
  ): Promise<BusinessContextEnhancement[]> {
    
    const enhancements: BusinessContextEnhancement[] = [];
    
    // Industry-specific enhancements
    const industryIndicators = queryClassification.business_context.industry_indicators;
    for (const indicator of industryIndicators) {
      const industryTerms = this.getIndustrySpecificMetricTerms(indicator.industry, detectedMetrics);
      if (industryTerms.length > 0) {
        enhancements.push({
          enhancement_type: 'industry_specific',
          context_terms: industryTerms,
          relevance_boost: indicator.confidence * 0.3,
          application_scenarios: indicator.industry_specific_needs
        });
      }
    }
    
    // Business stage enhancements
    const stageSignals = queryClassification.business_context.business_stage_signals;
    for (const signal of stageSignals) {
      const stageTerms = this.getStageSpecificMetricTerms(signal.stage, detectedMetrics);
      if (stageTerms.length > 0) {
        enhancements.push({
          enhancement_type: 'stage_specific',
          context_terms: stageTerms,
          relevance_boost: signal.confidence * 0.25,
          application_scenarios: signal.typical_challenges
        });
      }
    }
    
    // Framework-specific enhancements
    const frameworkRelevance = queryClassification.business_context.framework_relevance;
    for (const framework of frameworkRelevance) {
      const frameworkMetrics = this.hormoziMetricsMapping.get(framework.framework) || [];
      const relevantMetrics = frameworkMetrics.filter(metric =>
        detectedMetrics.some(dm => dm.metric_name.toLowerCase().includes(metric.toLowerCase()))
      );
      
      if (relevantMetrics.length > 0) {
        enhancements.push({
          enhancement_type: 'framework_specific',
          context_terms: [...frameworkMetrics, framework.framework.toString()],
          relevance_boost: framework.relevance_score * 0.4,
          application_scenarios: [framework.application_context]
        });
      }
    }
    
    return enhancements;
  }

  // Step 7: Build expanded query
  private buildExpandedQuery(
    originalQuery: string,
    strategies: ExpansionStrategy[],
    enhancements: BusinessContextEnhancement[]
  ): string {
    
    let expandedQuery = originalQuery;
    
    // Add terms from expansion strategies (weighted by strategy importance)
    const prioritizedStrategies = strategies.sort((a, b) => b.weight - a.weight);
    
    for (const strategy of prioritizedStrategies.slice(0, 3)) { // Top 3 strategies
      // Add most relevant terms from each strategy
      expandedQuery += ' ' + strategy.added_terms.slice(0, 3).join(' ');
      expandedQuery += ' ' + strategy.business_context_terms.slice(0, 2).join(' ');
      
      if (strategy.calculation_terms.length > 0) {
        expandedQuery += ' ' + strategy.calculation_terms.slice(0, 2).join(' ');
      }
    }
    
    // Add business context enhancements
    const prioritizedEnhancements = enhancements.sort((a, b) => b.relevance_boost - a.relevance_boost);
    
    for (const enhancement of prioritizedEnhancements.slice(0, 2)) { // Top 2 enhancements
      expandedQuery += ' ' + enhancement.context_terms.slice(0, 3).join(' ');
    }
    
    // Clean up the expanded query
    return this.cleanExpandedQuery(expandedQuery);
  }

  // Initialize metrics database with comprehensive definitions
  private initializeMetricsDatabase(): void {
    // Lifetime Value (LTV)
    this.metricsDatabase.set('ltv', {
      display_name: 'Customer Lifetime Value',
      category: FinancialMetricCategory.RETENTION,
      variations: ['ltv', 'lifetime value', 'customer lifetime value', 'clv', 'customer value'],
      calculation_complexity: 'moderate',
      business_importance: 'high',
      hormozi_relevance: ['GRAND_SLAM_OFFERS', 'LTV_CAC_OPTIMIZATION']
    });
    
    // Customer Acquisition Cost (CAC)
    this.metricsDatabase.set('cac', {
      display_name: 'Customer Acquisition Cost',
      category: FinancialMetricCategory.COST,
      variations: ['cac', 'customer acquisition cost', 'acquisition cost', 'cost per customer'],
      calculation_complexity: 'simple',
      business_importance: 'high',
      hormozi_relevance: ['CORE_FOUR', 'LTV_CAC_OPTIMIZATION']
    });
    
    // LTV/CAC Ratio
    this.metricsDatabase.set('ltv_cac_ratio', {
      display_name: 'LTV/CAC Ratio',
      category: FinancialMetricCategory.EFFICIENCY,
      variations: ['ltv/cac', 'ltv to cac ratio', 'ltv cac ratio', 'lifetime value to acquisition cost ratio'],
      calculation_complexity: 'moderate',
      business_importance: 'critical',
      hormozi_relevance: ['LTV_CAC_OPTIMIZATION', 'GRAND_SLAM_OFFERS']
    });
    
    // Monthly Recurring Revenue (MRR)
    this.metricsDatabase.set('mrr', {
      display_name: 'Monthly Recurring Revenue',
      category: FinancialMetricCategory.REVENUE,
      variations: ['mrr', 'monthly recurring revenue', 'monthly revenue', 'recurring revenue'],
      calculation_complexity: 'simple',
      business_importance: 'high',
      hormozi_relevance: ['CASH_FLOW_MANAGEMENT']
    });
    
    // Continue with other metrics...
  }

  private initializeHormoziMetricsMapping(): void {
    this.hormoziMetricsMapping.set(HormoziFramework.GRAND_SLAM_OFFERS, [
      'conversion rate', 'average order value', 'lifetime value', 'price elasticity'
    ]);
    
    this.hormoziMetricsMapping.set(HormoziFramework.CORE_FOUR, [
      'lead generation cost', 'cost per lead', 'lead conversion rate', 'channel effectiveness'
    ]);
    
    this.hormoziMetricsMapping.set(HormoziFramework.LTV_CAC_OPTIMIZATION, [
      'lifetime value', 'customer acquisition cost', 'ltv/cac ratio', 'payback period'
    ]);
    
    // Continue with other framework mappings...
  }

  // Helper methods
  private generateExpansionId(): string {
    return `fme_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private calculateMetricDetectionConfidence(query: string, metricDef: FinancialMetricDefinition): number {
    let confidence = 0;
    
    for (const variation of metricDef.variations) {
      if (query.includes(variation.toLowerCase())) {
        confidence = Math.max(confidence, 0.9); // High confidence for exact matches
        break;
      }
    }
    
    // Check for partial matches
    if (confidence === 0) {
      for (const variation of metricDef.variations) {
        const words = variation.toLowerCase().split(' ');
        const matches = words.filter(word => query.includes(word)).length;
        if (matches > 0) {
          confidence = Math.max(confidence, (matches / words.length) * 0.7);
        }
      }
    }
    
    return confidence;
  }
  
  private cleanExpandedQuery(query: string): string {
    // Remove duplicates and clean up spacing
    const words = query.split(/\s+/);
    const uniqueWords = [...new Set(words)];
    return uniqueWords.join(' ').trim();
  }
  
  // Additional helper methods (simplified implementations)
  private assessBusinessSignificance(metricKey: string, classification: BusinessQueryClassification): BusinessSignificance { 
    return {
      impact_level: 'high',
      business_functions_affected: ['finance', 'marketing'],
      decision_making_importance: 'strategic',
      hormozi_framework_relevance: []
    }; 
  }
  private getCalculationRequirements(metricKey: string): CalculationRequirements { return {} as CalculationRequirements; }
  private getOptimizationOpportunities(metricKey: string): OptimizationOpportunity[] { return []; }
  private getBusinessContextTerms(metricName: string): string[] { return []; }
  private getIndustrySpecificTerms(metricName: string, classification: BusinessQueryClassification): string[] { return []; }
  private getCalculationTerms(metricName: string): string[] { return ['calculate', 'formula', 'compute']; }
  private getRelatedFinancialConcepts(metrics: DetectedFinancialMetric[]): string[] { return []; }
  private getCalculationContextTerms(metrics: DetectedFinancialMetric[]): string[] { return []; }
  private hasBenchmarkingIntent(query: string): boolean { return query.toLowerCase().includes('benchmark'); }
  private hasOptimizationIntent(query: string): boolean { return query.toLowerCase().includes('improve'); }
  private getIndustryBenchmarkTerms(classification: BusinessQueryClassification): string[] { return []; }
  private hasCalculationSignals(query: string): boolean { return query.toLowerCase().includes('calculate'); }
  private hasBenchmarkingSignals(query: string): boolean { return query.toLowerCase().includes('compare'); }
  private hasImprovementSignals(query: string): boolean { return query.toLowerCase().includes('improve'); }
  private getIndustrySpecificMetricTerms(industry: IndustryVertical, metrics: DetectedFinancialMetric[]): string[] { return []; }
  private getStageSpecificMetricTerms(stage: BusinessLifecycleStage, metrics: DetectedFinancialMetric[]): string[] { return []; }
  private extractCalculationComponents(metrics: DetectedFinancialMetric[]): Promise<CalculationComponent[]> { return Promise.resolve([]); }
  private addBenchmarkingData(metrics: DetectedFinancialMetric[], classification: BusinessQueryClassification, userContext?: any): Promise<BenchmarkingData[]> { return Promise.resolve([]); }
  private initializeCalculationFormulas(): void { }
  private initializeIndustryBenchmarks(): void { }
  private initializeOptimizationStrategies(): void { }
}

// Supporting interfaces
interface FinancialMetricDefinition {
  display_name: string;
  category: FinancialMetricCategory;
  variations: string[];
  calculation_complexity: 'simple' | 'moderate' | 'complex' | 'advanced';
  business_importance: 'low' | 'medium' | 'high' | 'critical';
  hormozi_relevance: string[];
}

interface CalculationFormula {
  formula: string;
  components: string[];
  complexity: string;
}

interface IndustryBenchmarks {
  industry: IndustryVertical;
  benchmarks: Map<string, BenchmarkRange>;
}

interface OptimizationStrategy {
  strategy_name: string;
  levers: OptimizationLever[];
  expected_impact: ExpectedImpact;
}

export default FinancialMetricsQueryExpansion;