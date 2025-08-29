/**
 * Business-Specific Search Optimization for Oracle Knowledge Base
 * Alice Intelligence - Advanced query processing and result optimization
 */

import {
  BusinessLifecycleStage,
  IndustryVertical,
  FunctionalArea,
  HormoziFramework,
  UserIntent,
  BusinessScenario,
  BusinessQueryContext,
  EnhancedSearchResult
} from '../types/businessIntelligence';

// Business query intent detection
export class BusinessQueryAnalyzer {
  
  // Analyze query to understand business context and intent
  static analyzeQuery(query: string, userContext?: UserContextData): BusinessQueryContext {
    const lowerQuery = query.toLowerCase();
    
    return {
      original_query: query,
      inferred_intent: this.detectUserIntent(lowerQuery),
      business_context: {
        likely_industry: this.inferIndustry(lowerQuery, userContext),
        likely_stage: this.inferBusinessStage(lowerQuery, userContext),
        functional_focus: this.inferFunctionalArea(lowerQuery, userContext)
      },
      metric_references: this.extractMetricReferences(lowerQuery),
      framework_indicators: this.detectFrameworkIndicators(lowerQuery),
      urgency_signals: this.detectUrgencySignals(lowerQuery),
      implementation_readiness: this.assessImplementationReadiness(lowerQuery)
    };
  }
  
  private static detectUserIntent(query: string): UserIntent {
    const intentPatterns = {
      [UserIntent.LEARNING]: [
        'what is', 'explain', 'understand', 'definition', 'concept',
        'how does', 'why is', 'meaning of', 'learn about'
      ],
      [UserIntent.IMPLEMENTATION]: [
        'how to', 'implement', 'execute', 'apply', 'use', 'deploy',
        'set up', 'create', 'build', 'start'
      ],
      [UserIntent.TROUBLESHOOTING]: [
        'fix', 'problem', 'issue', 'not working', 'failing', 'broken',
        'error', 'wrong', 'help', 'stuck'
      ],
      [UserIntent.BENCHMARKING]: [
        'benchmark', 'average', 'typical', 'good', 'normal', 'standard',
        'compare', 'industry average', 'what should'
      ],
      [UserIntent.VALIDATION]: [
        'correct', 'right way', 'validate', 'confirm', 'verify',
        'am i doing', 'is this right', 'should i'
      ],
      [UserIntent.OPTIMIZATION]: [
        'improve', 'optimize', 'better', 'increase', 'boost', 'enhance',
        'maximize', 'grow', 'scale up'
      ],
      [UserIntent.RESEARCH]: [
        'examples', 'case studies', 'data', 'research', 'studies',
        'evidence', 'proof', 'results'
      ],
      [UserIntent.PLANNING]: [
        'plan', 'strategy', 'roadmap', 'timeline', 'schedule',
        'next steps', 'approach', 'preparation'
      ]
    };
    
    // Find best matching intent
    let bestIntent = UserIntent.LEARNING;
    let maxMatches = 0;
    
    Object.entries(intentPatterns).forEach(([intent, patterns]) => {
      const matches = patterns.filter(pattern => query.includes(pattern)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestIntent = intent as UserIntent;
      }
    });
    
    return bestIntent;
  }
  
  private static inferIndustry(query: string, context?: UserContextData): IndustryVertical {
    const industryKeywords = {
      [IndustryVertical.FITNESS_GYMS]: ['gym', 'fitness', 'workout', 'training', 'exercise', 'wellness'],
      [IndustryVertical.SOFTWARE_SAAS]: ['software', 'saas', 'app', 'platform', 'tech', 'digital'],
      [IndustryVertical.ECOMMERCE]: ['ecommerce', 'online store', 'shopify', 'product sales', 'retail'],
      [IndustryVertical.PROFESSIONAL_SERVICES]: ['consulting', 'agency', 'service', 'coaching', 'advisory'],
      [IndustryVertical.REAL_ESTATE]: ['real estate', 'property', 'housing', 'rental', 'investment'],
      [IndustryVertical.RESTAURANTS]: ['restaurant', 'food', 'dining', 'menu', 'kitchen'],
      [IndustryVertical.HEALTHCARE]: ['healthcare', 'medical', 'clinic', 'hospital', 'health'],
      [IndustryVertical.EDUCATION]: ['education', 'school', 'course', 'learning', 'training']
    };
    
    // Check user context first
    if (context?.known_industry) {
      return context.known_industry;
    }
    
    // Analyze query for industry indicators
    let bestIndustry = IndustryVertical.GENERAL;
    let maxMatches = 0;
    
    Object.entries(industryKeywords).forEach(([industry, keywords]) => {
      const matches = keywords.filter(keyword => query.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestIndustry = industry as IndustryVertical;
      }
    });
    
    return bestIndustry;
  }
  
  private static inferBusinessStage(query: string, context?: UserContextData): BusinessLifecycleStage {
    const stageKeywords = {
      [BusinessLifecycleStage.STARTUP]: ['startup', 'new business', 'just starting', 'beginning', 'first'],
      [BusinessLifecycleStage.EARLY_SCALING]: ['growing', 'scaling', 'expanding', 'more customers'],
      [BusinessLifecycleStage.SCALING]: ['scale', 'growth', 'team building', 'systems'],
      [BusinessLifecycleStage.GROWTH]: ['enterprise', 'large scale', 'multiple locations', 'acquisition'],
      [BusinessLifecycleStage.ENTERPRISE]: ['corporation', 'enterprise', 'fortune', 'multinational']
    };
    
    if (context?.known_stage) {
      return context.known_stage;
    }
    
    let bestStage = BusinessLifecycleStage.STARTUP;
    let maxMatches = 0;
    
    Object.entries(stageKeywords).forEach(([stage, keywords]) => {
      const matches = keywords.filter(keyword => query.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestStage = stage as BusinessLifecycleStage;
      }
    });
    
    return bestStage;
  }
  
  private static inferFunctionalArea(query: string, context?: UserContextData): FunctionalArea {
    const functionalKeywords = {
      [FunctionalArea.MARKETING]: ['marketing', 'advertising', 'brand', 'content', 'social media', 'seo'],
      [FunctionalArea.SALES]: ['sales', 'selling', 'closing', 'conversion', 'leads', 'prospects'],
      [FunctionalArea.OPERATIONS]: ['operations', 'process', 'systems', 'efficiency', 'workflow'],
      [FunctionalArea.FINANCE]: ['finance', 'money', 'revenue', 'profit', 'cost', 'budget', 'metrics'],
      [FunctionalArea.LEADERSHIP]: ['leadership', 'team', 'management', 'culture', 'hiring'],
      [FunctionalArea.STRATEGY]: ['strategy', 'planning', 'competitive', 'market', 'positioning'],
      [FunctionalArea.PRODUCT]: ['product', 'development', 'features', 'user experience'],
      [FunctionalArea.CUSTOMER_SUCCESS]: ['retention', 'customer success', 'churn', 'satisfaction']
    };
    
    let bestArea = FunctionalArea.STRATEGY;
    let maxMatches = 0;
    
    Object.entries(functionalKeywords).forEach(([area, keywords]) => {
      const matches = keywords.filter(keyword => query.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestArea = area as FunctionalArea;
      }
    });
    
    return bestArea;
  }
  
  private static extractMetricReferences(query: string): string[] {
    const metricKeywords = [
      'ltv', 'cac', 'lifetime value', 'customer acquisition cost',
      'conversion rate', 'roi', 'roas', 'revenue', 'profit', 'margin',
      'churn', 'retention', 'growth rate', 'market share',
      'average order value', 'aov', 'cost per click', 'cpc'
    ];
    
    return metricKeywords.filter(metric => query.includes(metric));
  }
  
  private static detectFrameworkIndicators(query: string): HormoziFramework[] {
    const frameworkPatterns = {
      [HormoziFramework.GRAND_SLAM_OFFERS]: ['grand slam', 'offers', 'value equation', 'irresistible'],
      [HormoziFramework.CORE_FOUR]: ['core four', 'lead generation', 'outreach', 'content'],
      [HormoziFramework.CLOSER_FRAMEWORK]: ['closer', 'sales process', 'closing'],
      [HormoziFramework.LTV_CAC_OPTIMIZATION]: ['ltv', 'cac', 'unit economics', 'customer lifetime'],
      [HormoziFramework.PRICING_PSYCHOLOGY]: ['pricing', 'psychology', 'anchoring', 'payment']
    };
    
    const detectedFrameworks: HormoziFramework[] = [];
    
    Object.entries(frameworkPatterns).forEach(([framework, patterns]) => {
      if (patterns.some(pattern => query.includes(pattern))) {
        detectedFrameworks.push(framework as HormoziFramework);
      }
    });
    
    return detectedFrameworks;
  }
  
  private static detectUrgencySignals(query: string): string[] {
    const urgencyWords = [
      'urgent', 'asap', 'quickly', 'fast', 'immediate', 'now',
      'crisis', 'emergency', 'failing', 'losing money', 'urgent help'
    ];
    
    return urgencyWords.filter(signal => query.includes(signal));
  }
  
  private static assessImplementationReadiness(query: string): number {
    const readinessIndicators = {
      high: ['ready to implement', 'have team', 'budget approved', 'lets do this'],
      medium: ['planning to', 'considering', 'evaluating', 'next quarter'],
      low: ['learning about', 'researching', 'curious about', 'wondering']
    };
    
    if (readinessIndicators.high.some(indicator => query.includes(indicator))) {
      return 0.9;
    } else if (readinessIndicators.medium.some(indicator => query.includes(indicator))) {
      return 0.6;
    } else if (readinessIndicators.low.some(indicator => query.includes(indicator))) {
      return 0.3;
    }
    
    return 0.5; // Default moderate readiness
  }
}

// Advanced search result ranking and optimization
export class BusinessSearchRanker {
  
  static rankSearchResults(
    results: any[],
    queryContext: BusinessQueryContext,
    userProfile?: UserProfile
  ): RankedSearchResult[] {
    
    return results.map(result => {
      const businessRelevance = this.calculateBusinessRelevance(result, queryContext);
      const contextFit = this.calculateContextFit(result, queryContext, userProfile);
      const implementationFit = this.calculateImplementationFit(result, queryContext);
      const authorityScore = this.calculateAuthorityScore(result);
      const freshnessScore = this.calculateFreshnessScore(result);
      
      const overallScore = this.combineRankingFactors({
        business_relevance: businessRelevance,
        context_fit: contextFit,
        implementation_fit: implementationFit,
        authority_score: authorityScore,
        freshness_score: freshnessScore
      }, queryContext.inferred_intent);
      
      return {
        ...result,
        ranking_scores: {
          business_relevance: businessRelevance,
          context_fit: contextFit,
          implementation_fit: implementationFit,
          authority_score: authorityScore,
          freshness_score: freshnessScore,
          overall_score: overallScore
        },
        ranking_explanation: this.generateRankingExplanation(
          overallScore, businessRelevance, contextFit, implementationFit
        ),
        implementation_guidance: this.generateImplementationGuidance(result, queryContext),
        related_frameworks: this.identifyRelatedFrameworks(result, queryContext)
      };
    }).sort((a, b) => b.ranking_scores.overall_score - a.ranking_scores.overall_score);
  }
  
  private static calculateBusinessRelevance(result: any, context: BusinessQueryContext): number {
    let relevanceScore = 0.5; // Base score
    
    // Industry alignment
    if (result.metadata?.industry_verticals?.includes(context.business_context.likely_industry)) {
      relevanceScore += 0.2;
    }
    
    // Business stage alignment
    if (result.metadata?.lifecycle_stage === context.business_context.likely_stage) {
      relevanceScore += 0.2;
    }
    
    // Functional area alignment
    if (result.metadata?.functional_areas?.includes(context.business_context.functional_focus)) {
      relevanceScore += 0.15;
    }
    
    // Framework alignment
    const frameworkOverlap = context.framework_indicators.filter(
      framework => result.metadata?.hormozi_frameworks?.includes(framework)
    ).length;
    relevanceScore += Math.min(0.15, frameworkOverlap * 0.05);
    
    return Math.min(1.0, relevanceScore);
  }
  
  private static calculateContextFit(
    result: any,
    context: BusinessQueryContext,
    profile?: UserProfile
  ): number {
    let contextScore = 0.5; // Base score
    
    // Intent alignment
    if (result.metadata?.user_intent_mapping?.includes(context.inferred_intent)) {
      contextScore += 0.3;
    }
    
    // Urgency alignment
    if (context.urgency_signals.length > 0) {
      if (result.metadata?.content_type === 'troubleshooting' || 
          result.metadata?.category === 'crisis_management') {
        contextScore += 0.2;
      }
    }
    
    // User profile alignment
    if (profile) {
      if (profile.experience_level === result.metadata?.difficulty_level) {
        contextScore += 0.1;
      }
      if (profile.preferred_frameworks?.some(f => 
          result.metadata?.hormozi_frameworks?.includes(f))) {
        contextScore += 0.1;
      }
    }
    
    return Math.min(1.0, contextScore);
  }
  
  private static calculateImplementationFit(result: any, context: BusinessQueryContext): number {
    let implementationScore = 0.5; // Base score
    
    // Implementation readiness alignment
    const resultComplexity = result.metadata?.implementation_complexity || 'medium';
    const complexityScores: Record<string, number> = { 'low': 0.2, 'medium': 0.5, 'high': 0.8, 'expert': 1.0 };
    const userReadiness = context.implementation_readiness;
    const contentComplexity = complexityScores[resultComplexity] || 0.5;
    
    // Good fit if user readiness matches content complexity
    const complexityFit = 1 - Math.abs(userReadiness - contentComplexity);
    implementationScore = complexityFit;
    
    return Math.min(1.0, implementationScore);
  }
  
  private static calculateAuthorityScore(result: any): number {
    // Use Elena's existing authority calculation or implement based on metadata
    return result.metadata?.authority_score || 0.7;
  }
  
  private static calculateFreshnessScore(result: any): number {
    // Use Elena's existing freshness calculation or implement based on metadata
    return result.metadata?.freshness_score?.overall_freshness || 0.8;
  }
  
  private static combineRankingFactors(
    scores: RankingFactors,
    intent: UserIntent
  ): number {
    // Weight factors based on user intent
    const intentWeights: Record<UserIntent | 'default', {
      business_relevance: number;
      context_fit: number;
      implementation_fit: number;
      authority_score: number;
      freshness_score: number;
    }> = {
      [UserIntent.LEARNING]: {
        business_relevance: 0.3,
        context_fit: 0.25,
        implementation_fit: 0.15,
        authority_score: 0.25,
        freshness_score: 0.05
      },
      [UserIntent.IMPLEMENTATION]: {
        business_relevance: 0.35,
        context_fit: 0.3,
        implementation_fit: 0.25,
        authority_score: 0.08,
        freshness_score: 0.02
      },
      [UserIntent.TROUBLESHOOTING]: {
        business_relevance: 0.4,
        context_fit: 0.35,
        implementation_fit: 0.15,
        authority_score: 0.08,
        freshness_score: 0.02
      },
      [UserIntent.BENCHMARKING]: {
        business_relevance: 0.25,
        context_fit: 0.2,
        implementation_fit: 0.1,
        authority_score: 0.35,
        freshness_score: 0.1
      },
      [UserIntent.VALIDATION]: {
        business_relevance: 0.3,
        context_fit: 0.25,
        implementation_fit: 0.15,
        authority_score: 0.25,
        freshness_score: 0.05
      },
      [UserIntent.OPTIMIZATION]: {
        business_relevance: 0.35,
        context_fit: 0.3,
        implementation_fit: 0.25,
        authority_score: 0.08,
        freshness_score: 0.02
      },
      [UserIntent.RESEARCH]: {
        business_relevance: 0.25,
        context_fit: 0.2,
        implementation_fit: 0.1,
        authority_score: 0.3,
        freshness_score: 0.15
      },
      [UserIntent.PLANNING]: {
        business_relevance: 0.3,
        context_fit: 0.25,
        implementation_fit: 0.2,
        authority_score: 0.2,
        freshness_score: 0.05
      },
      // Default weights for other intents
      default: {
        business_relevance: 0.3,
        context_fit: 0.25,
        implementation_fit: 0.2,
        authority_score: 0.2,
        freshness_score: 0.05
      }
    };
    
    const weights = intentWeights[intent] || intentWeights.default;
    
    return (
      scores.business_relevance * weights.business_relevance +
      scores.context_fit * weights.context_fit +
      scores.implementation_fit * weights.implementation_fit +
      scores.authority_score * weights.authority_score +
      scores.freshness_score * weights.freshness_score
    );
  }
  
  private static generateRankingExplanation(
    overallScore: number,
    businessRelevance: number,
    contextFit: number,
    implementationFit: number
  ): string {
    if (overallScore > 0.9) {
      return "Excellent match: High business relevance with perfect context and implementation fit";
    } else if (overallScore > 0.8) {
      return "Very good match: Strong alignment with your business context and needs";
    } else if (overallScore > 0.7) {
      return "Good match: Relevant to your business with good practical applicability";
    } else if (overallScore > 0.6) {
      return "Moderate match: Some relevance but may require adaptation";
    } else {
      return "Basic match: General information that may be helpful";
    }
  }
  
  private static generateImplementationGuidance(result: any, context: BusinessQueryContext): string[] {
    const guidance: string[] = [];
    
    // Add guidance based on implementation readiness
    if (context.implementation_readiness > 0.8) {
      guidance.push("You appear ready to implement - focus on execution steps");
    } else if (context.implementation_readiness > 0.5) {
      guidance.push("Consider planning phase before implementation");
    } else {
      guidance.push("Start with understanding fundamentals before implementation");
    }
    
    // Add urgency-based guidance
    if (context.urgency_signals.length > 0) {
      guidance.push("Priority implementation recommended based on urgency signals");
    }
    
    // Add framework-specific guidance
    if (context.framework_indicators.length > 0) {
      guidance.push(`Focus on ${context.framework_indicators[0]} framework components`);
    }
    
    return guidance;
  }
  
  private static identifyRelatedFrameworks(result: any, context: BusinessQueryContext): HormoziFramework[] {
    // Return frameworks related to the result content
    return result.metadata?.hormozi_frameworks || [];
  }
}

// Business scenario-based search enhancement
export class BusinessScenarioProcessor {
  
  static enhanceQueryForScenario(
    originalQuery: string,
    detectedScenario: BusinessScenario,
    userContext?: UserContextData
  ): EnhancedQueryData {
    
    const scenarioEnhancements = this.getScenarioEnhancements(detectedScenario);
    
    return {
      original_query: originalQuery,
      enhanced_query: this.buildEnhancedQuery(originalQuery, scenarioEnhancements),
      scenario: detectedScenario,
      additional_keywords: scenarioEnhancements.keywords,
      priority_frameworks: scenarioEnhancements.frameworks,
      suggested_filters: scenarioEnhancements.filters,
      expected_result_types: scenarioEnhancements.result_types
    };
  }
  
  private static getScenarioEnhancements(scenario: BusinessScenario): ScenarioEnhancement {
    const enhancements: { [key in BusinessScenario]: ScenarioEnhancement } = {
      [BusinessScenario.LAUNCHING_NEW_PRODUCT]: {
        keywords: ['product launch', 'go-to-market', 'validation', 'positioning'],
        frameworks: [HormoziFramework.GRAND_SLAM_OFFERS, HormoziFramework.PRICING_PSYCHOLOGY],
        filters: { content_type: ['framework', 'case_study'], difficulty: ['beginner', 'intermediate'] },
        result_types: ['implementation_guide', 'case_study', 'framework_overview']
      },
      
      [BusinessScenario.SCALING_TEAM]: {
        keywords: ['hiring', 'team building', 'management', 'culture', 'delegation'],
        frameworks: [HormoziFramework.TEAM_BUILDING, HormoziFramework.OPERATIONAL_EXCELLENCE],
        filters: { business_stage: ['scaling', 'growth'], functional_area: ['leadership'] },
        result_types: ['system_guide', 'process_template', 'best_practices']
      },
      
      [BusinessScenario.IMPROVING_CONVERSION]: {
        keywords: ['conversion', 'sales', 'funnel', 'optimization', 'closing'],
        frameworks: [HormoziFramework.CLOSER_FRAMEWORK, HormoziFramework.GRAND_SLAM_OFFERS],
        filters: { functional_area: ['sales', 'marketing'], urgency: ['high'] },
        result_types: ['tactical_guide', 'optimization_checklist', 'troubleshooting']
      },
      
      [BusinessScenario.CRISIS_MANAGEMENT]: {
        keywords: ['crisis', 'emergency', 'cash flow', 'turnaround', 'survival'],
        frameworks: [HormoziFramework.CASH_FLOW_MANAGEMENT, HormoziFramework.LTV_CAC_OPTIMIZATION],
        filters: { urgency: ['critical'], implementation_time: ['immediate'] },
        result_types: ['emergency_guide', 'quick_wins', 'critical_actions']
      },
      
      // Add other scenarios as needed...
      [BusinessScenario.RAISING_CAPITAL]: {
        keywords: ['funding', 'investors', 'pitch', 'valuation', 'metrics'],
        frameworks: [HormoziFramework.LTV_CAC_OPTIMIZATION],
        filters: { content_type: ['metrics', 'framework'], authority: ['high'] },
        result_types: ['metrics_guide', 'preparation_checklist', 'case_study']
      },
      
      [BusinessScenario.EXPANDING_MARKETS]: {
        keywords: ['expansion', 'new market', 'scaling', 'growth', 'replication'],
        frameworks: [HormoziFramework.CORE_FOUR, HormoziFramework.OPERATIONAL_EXCELLENCE],
        filters: { business_stage: ['scaling', 'growth'], complexity: ['advanced'] },
        result_types: ['strategic_framework', 'expansion_template', 'success_stories']
      },
      
      [BusinessScenario.OPTIMIZING_COSTS]: {
        keywords: ['cost reduction', 'efficiency', 'optimization', 'margins', 'profitability'],
        frameworks: [HormoziFramework.LTV_CAC_OPTIMIZATION, HormoziFramework.OPERATIONAL_EXCELLENCE],
        filters: { functional_area: ['operations', 'finance'], focus: ['efficiency'] },
        result_types: ['optimization_guide', 'cost_analysis', 'efficiency_metrics']
      },
      
      [BusinessScenario.BUILDING_SYSTEMS]: {
        keywords: ['systems', 'processes', 'automation', 'scalability', 'documentation'],
        frameworks: [HormoziFramework.OPERATIONAL_EXCELLENCE],
        filters: { content_type: ['system'], implementation_complexity: ['medium', 'advanced'] },
        result_types: ['system_blueprint', 'process_template', 'implementation_guide']
      },
      
      [BusinessScenario.COMPETITIVE_RESPONSE]: {
        keywords: ['competition', 'differentiation', 'positioning', 'strategy', 'advantage'],
        frameworks: [HormoziFramework.GRAND_SLAM_OFFERS, HormoziFramework.PRICING_PSYCHOLOGY],
        filters: { functional_area: ['strategy', 'marketing'], urgency: ['high'] },
        result_types: ['strategic_response', 'differentiation_guide', 'competitive_analysis']
      },
      
      [BusinessScenario.EXIT_PREPARATION]: {
        keywords: ['exit', 'acquisition', 'valuation', 'due diligence', 'preparation'],
        frameworks: [HormoziFramework.ACQUISITION_STRATEGY],
        filters: { business_stage: ['enterprise'], complexity: ['expert'] },
        result_types: ['preparation_guide', 'valuation_framework', 'process_checklist']
      }
    };
    
    return enhancements[scenario];
  }
  
  private static buildEnhancedQuery(originalQuery: string, enhancements: ScenarioEnhancement): string {
    const additionalTerms = enhancements.keywords.slice(0, 3).join(' '); // Top 3 keywords
    return `${originalQuery} ${additionalTerms}`;
  }

  // Instance method for business query enhancement
  enhanceBusinessQuery(query: string): any {
    return {
      enhanced_query: query,
      business_context: 'General business context',
      priority_terms: ['strategy', 'implementation']
    };
  }
}

// Supporting interfaces and types
export interface UserContextData {
  known_industry?: IndustryVertical;
  known_stage?: BusinessLifecycleStage;
  experience_level?: string;
  previous_queries?: string[];
  implementation_history?: string[];
}

export interface UserProfile {
  experience_level: string;
  preferred_frameworks?: HormoziFramework[];
  business_context: {
    industry: IndustryVertical;
    stage: BusinessLifecycleStage;
    team_size?: number;
    annual_revenue?: number;
  };
  learning_preferences: {
    content_depth: 'overview' | 'detailed' | 'comprehensive';
    implementation_focus: boolean;
    case_study_preference: boolean;
  };
}

export interface RankingFactors {
  business_relevance: number;
  context_fit: number;
  implementation_fit: number;
  authority_score: number;
  freshness_score: number;
}

export interface RankedSearchResult {
  ranking_scores: RankingFactors & { overall_score: number };
  ranking_explanation: string;
  implementation_guidance: string[];
  related_frameworks: HormoziFramework[];
}

export interface ScenarioEnhancement {
  keywords: string[];
  frameworks: HormoziFramework[];
  filters: { [key: string]: any };
  result_types: string[];
}

export interface EnhancedQueryData {
  original_query: string;
  enhanced_query: string;
  scenario: BusinessScenario;
  additional_keywords: string[];
  priority_frameworks: HormoziFramework[];
  suggested_filters: { [key: string]: any };
  expected_result_types: string[];
}

// Main search orchestrator
export class BusinessSearchOrchestrator {
  
  static async executeBusinessOptimizedSearch(
    query: string,
    userContext?: UserContextData,
    userProfile?: UserProfile
  ): Promise<BusinessOptimizedSearchResult> {
    
    // Step 1: Analyze query for business context
    const queryContext = BusinessQueryAnalyzer.analyzeQuery(query, userContext);
    
    // Step 2: Detect business scenario
    const detectedScenario = this.detectBusinessScenario(queryContext);
    
    // Step 3: Enhance query based on scenario
    const enhancedQuery = detectedScenario ? 
      BusinessScenarioProcessor.enhanceQueryForScenario(query, detectedScenario, userContext) :
      null;
    
    // Step 4: Execute search (this would integrate with Elena's search system)
    const rawResults = await this.executeEnhancedSearch(enhancedQuery || { enhanced_query: query });
    
    // Step 5: Rank and optimize results
    const rankedResults = BusinessSearchRanker.rankSearchResults(
      rawResults,
      queryContext,
      userProfile
    );
    
    // Step 6: Add business intelligence enhancements
    const enhancedResults = this.addBusinessIntelligence(rankedResults, queryContext);
    
    return {
      query_context: queryContext,
      detected_scenario: detectedScenario,
      enhanced_query_data: enhancedQuery,
      results: enhancedResults.slice(0, 10), // Top 10 results
      business_insights: this.generateBusinessInsights(queryContext, enhancedResults),
      recommended_next_steps: this.generateNextSteps(queryContext, enhancedResults),
      related_queries: this.generateRelatedQueries(queryContext)
    };
  }
  
  private static detectBusinessScenario(context: BusinessQueryContext): BusinessScenario | null {
    const scenarioPatterns = {
      [BusinessScenario.LAUNCHING_NEW_PRODUCT]: ['launch', 'new product', 'go to market', 'product release'],
      [BusinessScenario.SCALING_TEAM]: ['hire', 'team', 'scaling team', 'building team', 'management'],
      [BusinessScenario.IMPROVING_CONVERSION]: ['conversion', 'sales', 'closing', 'funnel'],
      [BusinessScenario.CRISIS_MANAGEMENT]: ['crisis', 'emergency', 'failing', 'cash flow problem'],
      [BusinessScenario.RAISING_CAPITAL]: ['funding', 'investment', 'raise money', 'investors'],
      [BusinessScenario.EXPANDING_MARKETS]: ['expansion', 'new market', 'geographic expansion'],
      [BusinessScenario.OPTIMIZING_COSTS]: ['cost', 'efficiency', 'reduce expenses', 'margins'],
      [BusinessScenario.BUILDING_SYSTEMS]: ['systems', 'processes', 'automation', 'scalability'],
      [BusinessScenario.COMPETITIVE_RESPONSE]: ['competition', 'competitor', 'differentiate'],
      [BusinessScenario.EXIT_PREPARATION]: ['exit', 'acquisition', 'sell business', 'valuation']
    };
    
    const query = context.original_query.toLowerCase();
    
    for (const [scenario, patterns] of Object.entries(scenarioPatterns)) {
      if (patterns.some(pattern => query.includes(pattern))) {
        return scenario as BusinessScenario;
      }
    }
    
    return null;
  }
  
  private static async executeEnhancedSearch(queryData: { enhanced_query: string }): Promise<any[]> {
    // This would integrate with Elena's search system
    // For now, return mock results
    return [
      { id: '1', title: 'Sample Result 1', content: 'Content...', metadata: {} },
      { id: '2', title: 'Sample Result 2', content: 'Content...', metadata: {} }
    ];
  }
  
  private static addBusinessIntelligence(
    results: RankedSearchResult[],
    context: BusinessQueryContext
  ): EnhancedBusinessResult[] {
    
    return results.map(result => ({
      ...result,
      business_intelligence: {
        applicable_frameworks: context.framework_indicators,
        relevant_metrics: context.metric_references,
        implementation_timeline: this.estimateImplementationTimeline(result, context),
        resource_requirements: this.estimateResourceRequirements(result, context),
        success_indicators: this.identifySuccessIndicators(result, context),
        common_pitfalls: this.identifyCommonPitfalls(result, context)
      },
      contextual_guidance: {
        why_relevant: this.explainRelevance(result, context),
        how_to_apply: this.generateApplicationGuidance(result, context),
        what_to_measure: this.identifyMeasurementApproach(result, context),
        when_to_implement: this.suggestTiming(result, context)
      }
    }));
  }
  
  private static generateBusinessInsights(
    context: BusinessQueryContext,
    results: EnhancedBusinessResult[]
  ): BusinessInsight[] {
    const insights: BusinessInsight[] = [];
    
    // Implementation readiness insight
    if (context.implementation_readiness < 0.5) {
      insights.push({
        type: 'readiness_assessment',
        message: 'Consider building foundational knowledge before implementation',
        priority: 'medium',
        action_items: ['Review prerequisites', 'Assess resource availability', 'Plan learning pathway']
      });
    }
    
    // Urgency insight
    if (context.urgency_signals.length > 0) {
      insights.push({
        type: 'urgency_response',
        message: 'Urgent situation detected - prioritize immediate actions',
        priority: 'high',
        action_items: ['Focus on quick wins', 'Address critical issues first', 'Plan systematic resolution']
      });
    }
    
    // Framework alignment insight
    if (context.framework_indicators.length > 1) {
      insights.push({
        type: 'framework_integration',
        message: 'Multiple frameworks detected - consider integrated approach',
        priority: 'medium',
        action_items: ['Map framework relationships', 'Plan sequential implementation', 'Avoid conflicts']
      });
    }
    
    return insights;
  }
  
  private static generateNextSteps(
    context: BusinessQueryContext,
    results: EnhancedBusinessResult[]
  ): NextStepRecommendation[] {
    const nextSteps: NextStepRecommendation[] = [];
    
    // Based on user intent
    switch (context.inferred_intent) {
      case UserIntent.LEARNING:
        nextSteps.push({
          step: 'Deep dive into fundamentals',
          rationale: 'Build strong foundation before advanced topics',
          estimated_time: '1-2 weeks',
          resources: ['Framework overview', 'Core principles', 'Basic examples']
        });
        break;
        
      case UserIntent.IMPLEMENTATION:
        nextSteps.push({
          step: 'Create implementation plan',
          rationale: 'Systematic approach increases success probability',
          estimated_time: '1 week planning + implementation time',
          resources: ['Implementation checklist', 'Resource requirements', 'Success metrics']
        });
        break;
        
      case UserIntent.TROUBLESHOOTING:
        nextSteps.push({
          step: 'Diagnose root cause',
          rationale: 'Addressing symptoms without fixing root cause leads to recurring problems',
          estimated_time: '2-3 days analysis',
          resources: ['Diagnostic framework', 'Common issues checklist', 'Expert guidance']
        });
        break;
    }
    
    return nextSteps;
  }
  
  private static generateRelatedQueries(context: BusinessQueryContext): string[] {
    const relatedQueries: string[] = [];
    
    // Add queries based on framework indicators
    context.framework_indicators.forEach(framework => {
      switch (framework) {
        case HormoziFramework.GRAND_SLAM_OFFERS:
          relatedQueries.push('How to create irresistible offers');
          relatedQueries.push('Value equation optimization');
          break;
        case HormoziFramework.CORE_FOUR:
          relatedQueries.push('Lead generation strategies');
          relatedQueries.push('Channel diversification approach');
          break;
      }
    });
    
    // Add queries based on business context
    if (context.business_context.likely_stage === BusinessLifecycleStage.STARTUP) {
      relatedQueries.push('Startup validation methods');
      relatedQueries.push('Early customer acquisition');
    }
    
    return relatedQueries.slice(0, 5); // Top 5 related queries
  }
  
  // Helper methods for business intelligence
  private static estimateImplementationTimeline(result: any, context: BusinessQueryContext): string {
    // Implementation estimation logic
    return '2-4 weeks';
  }
  
  private static estimateResourceRequirements(result: any, context: BusinessQueryContext): string[] {
    // Resource estimation logic
    return ['Team time', 'Budget allocation', 'Technical setup'];
  }
  
  private static identifySuccessIndicators(result: any, context: BusinessQueryContext): string[] {
    // Success indicator identification logic
    return ['Metric improvements', 'Process efficiency', 'User satisfaction'];
  }
  
  private static identifyCommonPitfalls(result: any, context: BusinessQueryContext): string[] {
    // Common pitfall identification logic
    return ['Incomplete implementation', 'Lack of measurement', 'Team resistance'];
  }
  
  private static explainRelevance(result: any, context: BusinessQueryContext): string {
    return 'This content aligns with your business context and specific needs';
  }
  
  private static generateApplicationGuidance(result: any, context: BusinessQueryContext): string[] {
    return ['Start with assessment', 'Plan implementation', 'Monitor progress'];
  }
  
  private static identifyMeasurementApproach(result: any, context: BusinessQueryContext): string[] {
    return ['Define KPIs', 'Set baselines', 'Track progress'];
  }
  
  private static suggestTiming(result: any, context: BusinessQueryContext): string {
    return 'Implement after completing prerequisites';
  }
}

// Supporting interfaces for business intelligence
export interface BusinessOptimizedSearchResult {
  query_context: BusinessQueryContext;
  detected_scenario: BusinessScenario | null;
  enhanced_query_data: EnhancedQueryData | null;
  results: EnhancedBusinessResult[];
  business_insights: BusinessInsight[];
  recommended_next_steps: NextStepRecommendation[];
  related_queries: string[];
}

export interface EnhancedBusinessResult extends RankedSearchResult {
  business_intelligence: {
    applicable_frameworks: HormoziFramework[];
    relevant_metrics: string[];
    implementation_timeline: string;
    resource_requirements: string[];
    success_indicators: string[];
    common_pitfalls: string[];
  };
  contextual_guidance: {
    why_relevant: string;
    how_to_apply: string[];
    what_to_measure: string[];
    when_to_implement: string;
  };
}

export interface BusinessInsight {
  type: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  action_items: string[];
}

export interface NextStepRecommendation {
  step: string;
  rationale: string;
  estimated_time: string;
  resources: string[];
}

export default {
  BusinessQueryAnalyzer,
  BusinessSearchRanker,
  BusinessScenarioProcessor,
  BusinessSearchOrchestrator
};