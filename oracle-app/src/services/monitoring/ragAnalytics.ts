/**
 * Oracle RAG Performance Analytics & Monitoring
 * Alex Analytics - Comprehensive performance monitoring for Oracle RAG system
 * Provides detailed analytics for continuous optimization and business value measurement
 */

import { 
  HormoziFramework, 
  IndustryVertical, 
  BusinessLifecycleStage,
  UserIntent 
} from '../../types/businessIntelligence';

// Core Analytics Interfaces
export interface RAGPerformanceMetrics {
  metric_id: string;
  timestamp: string;
  session_id: string;
  user_id?: string;
  query_metadata: {
    original_query: string;
    query_length: number;
    query_complexity: 'simple' | 'moderate' | 'complex';
    detected_intent: UserIntent;
    detected_frameworks: HormoziFramework[];
    user_context: {
      business_stage?: BusinessLifecycleStage;
      industry?: IndustryVertical;
      expertise_level?: string;
    };
  };
  performance_timing: {
    total_response_time_ms: number;
    query_processing_ms: number;
    vector_search_ms: number;
    context_assembly_ms: number;
    business_analysis_ms: number;
    response_generation_ms: number;
    overhead_ms: number;
  };
  search_metrics: {
    total_results: number;
    relevant_results: number;
    average_relevance_score: number;
    top_result_relevance: number;
    search_mode: string;
    similarity_threshold: number;
    search_effectiveness: number;
  };
  context_metrics: {
    assembled_tokens: number;
    context_sources: number;
    framework_coverage: number;
    context_quality_score: number;
    token_efficiency: number;
  };
  response_metrics: {
    response_length: number;
    mystical_elements: number;
    business_concepts: number;
    actionable_items: number;
    citations_count: number;
    follow_up_questions: number;
    implementation_guidance_items: number;
  };
  quality_assessment: {
    overall_quality: number;
    relevance_score: number;
    accuracy_score: number;
    completeness_score: number;
    actionability_score: number;
    clarity_score: number;
    authority_score: number;
  };
  business_value: {
    framework_applicability: number;
    implementation_readiness: number;
    strategic_value: number;
    financial_impact_potential: number;
    user_stage_alignment: number;
  };
}

export interface UserFeedbackMetrics {
  feedback_id: string;
  timestamp: string;
  query_id: string;
  session_id: string;
  user_id?: string;
  satisfaction_ratings: {
    overall_satisfaction: number; // 1-5
    wisdom_authenticity: number;
    business_relevance: number;
    actionability: number;
    citation_quality: number;
    response_clarity: number;
  };
  behavioral_indicators: {
    time_spent_reading_ms: number;
    follow_up_questions_asked: number;
    implementation_attempted: boolean;
    response_bookmarked: boolean;
    shared_response: boolean;
    rated_helpful: boolean;
  };
  qualitative_feedback?: {
    helpful_aspects: string[];
    improvement_suggestions: string[];
    additional_needs: string[];
    framework_preferences: HormoziFramework[];
  };
  outcome_tracking?: {
    business_impact_reported: string;
    implementation_success: number; // 1-5
    roi_achieved?: number;
    time_to_implementation_days?: number;
  };
}

export interface CitationAccuracyMetrics {
  citation_id: string;
  timestamp: string;
  query_id: string;
  source_attribution: {
    cited_source: string;
    actual_source: string;
    attribution_accuracy: number;
    authority_level: 'primary_hormozi' | 'verified_case_study' | 'expert_interpretation' | 'community_validated';
  };
  content_validation: {
    factual_accuracy: number;
    context_appropriateness: number;
    quote_precision: number;
    framework_alignment: number;
  };
  user_verification?: {
    user_reported_accuracy: number;
    source_verification_requested: boolean;
    accuracy_disputed: boolean;
  };
}

export interface SystemHealthMetrics {
  timestamp: string;
  system_status: 'healthy' | 'degraded' | 'critical';
  component_health: {
    query_processor: ComponentHealth;
    vector_search: ComponentHealth;
    context_assembly: ComponentHealth;
    response_generator: ComponentHealth;
    business_analyzer: ComponentHealth;
  };
  resource_utilization: {
    cpu_usage_percent: number;
    memory_usage_mb: number;
    token_usage: {
      daily_tokens: number;
      monthly_tokens: number;
      cost_usd: number;
    };
    database_metrics: {
      query_latency_ms: number;
      connection_pool_usage: number;
      storage_usage_gb: number;
    };
  };
  error_metrics: {
    error_rate_percent: number;
    critical_errors: number;
    timeout_errors: number;
    api_errors: number;
    recent_errors: ErrorEvent[];
  };
}

interface ComponentHealth {
  status: 'healthy' | 'degraded' | 'failed';
  last_success: string;
  error_rate: number;
  average_latency_ms: number;
  uptime_percent: number;
}

interface ErrorEvent {
  timestamp: string;
  component: string;
  error_type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// Analytics Aggregation Interfaces
export interface RAGAnalyticsSummary {
  period_start: string;
  period_end: string;
  total_queries: number;
  unique_users: number;
  performance_summary: {
    average_response_time_ms: number;
    p95_response_time_ms: number;
    p99_response_time_ms: number;
    fastest_response_ms: number;
    slowest_response_ms: number;
    success_rate: number;
  };
  quality_summary: {
    average_quality_score: number;
    average_relevance_score: number;
    average_satisfaction: number;
    citation_accuracy_rate: number;
    framework_detection_accuracy: number;
  };
  usage_patterns: {
    peak_hours: number[];
    popular_frameworks: FrameworkUsageStats[];
    common_intents: IntentUsageStats[];
    business_stage_distribution: Record<BusinessLifecycleStage, number>;
    industry_distribution: Record<IndustryVertical, number>;
  };
  business_impact: {
    implementation_rate: number;
    reported_roi: number;
    user_retention_rate: number;
    knowledge_transfer_score: number;
    strategic_value_delivered: number;
  };
}

interface FrameworkUsageStats {
  framework: HormoziFramework;
  usage_count: number;
  average_satisfaction: number;
  implementation_rate: number;
  business_impact_score: number;
}

interface IntentUsageStats {
  intent: UserIntent;
  usage_count: number;
  average_response_time_ms: number;
  success_rate: number;
  user_satisfaction: number;
}

// RAG Analytics Service
export class OracleRAGAnalytics {
  private metricsBuffer: RAGPerformanceMetrics[] = [];
  private feedbackBuffer: UserFeedbackMetrics[] = [];
  private citationBuffer: CitationAccuracyMetrics[] = [];
  private systemMetrics: SystemHealthMetrics[] = [];
  
  private readonly bufferFlushSize = 100;
  private readonly bufferFlushInterval = 300000; // 5 minutes

  constructor() {
    this.initializeAnalytics();
    this.startPeriodicFlush();
  }

  // Performance Metrics Collection
  async recordQueryPerformance(
    queryMetadata: {
      query_id: string;
      session_id: string;
      user_id?: string;
      original_query: string;
      query_classification: any;
      user_context: any;
    },
    performanceTiming: {
      total_response_time_ms: number;
      query_processing_ms: number;
      vector_search_ms: number;
      context_assembly_ms: number;
      business_analysis_ms: number;
      response_generation_ms: number;
    },
    searchResults: any,
    assembledContext: any,
    generatedResponse: any,
    qualityAssessment: any
  ): Promise<void> {
    const performanceMetric: RAGPerformanceMetrics = {
      metric_id: `perf_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      session_id: queryMetadata.session_id,
      user_id: queryMetadata.user_id,
      query_metadata: {
        original_query: queryMetadata.original_query,
        query_length: queryMetadata.original_query.length,
        query_complexity: this.assessQueryComplexity(queryMetadata.query_classification),
        detected_intent: queryMetadata.query_classification.classified_intent.primary_intent,
        detected_frameworks: queryMetadata.query_classification.business_context.framework_relevance.map((fr: any) => fr.framework),
        user_context: {
          business_stage: queryMetadata.user_context?.business_stage,
          industry: queryMetadata.user_context?.industry,
          expertise_level: queryMetadata.user_context?.expertise_level
        }
      },
      performance_timing: {
        ...performanceTiming,
        overhead_ms: Math.max(0, performanceTiming.total_response_time_ms - 
          (performanceTiming.query_processing_ms + performanceTiming.vector_search_ms + 
           performanceTiming.context_assembly_ms + performanceTiming.business_analysis_ms + 
           performanceTiming.response_generation_ms))
      },
      search_metrics: this.extractSearchMetrics(searchResults),
      context_metrics: this.extractContextMetrics(assembledContext),
      response_metrics: this.extractResponseMetrics(generatedResponse),
      quality_assessment: this.normalizeQualityAssessment(qualityAssessment),
      business_value: this.assessBusinessValue(queryMetadata, generatedResponse, qualityAssessment)
    };

    this.metricsBuffer.push(performanceMetric);
    await this.checkBufferFlush();
  }

  // User Feedback Collection
  async recordUserFeedback(
    queryId: string,
    sessionId: string,
    userId: string | undefined,
    satisfactionRatings: {
      overall_satisfaction: number;
      wisdom_authenticity: number;
      business_relevance: number;
      actionability: number;
      citation_quality: number;
      response_clarity: number;
    },
    behavioralIndicators?: {
      time_spent_reading_ms?: number;
      follow_up_questions_asked?: number;
      implementation_attempted?: boolean;
      response_bookmarked?: boolean;
      shared_response?: boolean;
      rated_helpful?: boolean;
    },
    qualitativeFeedback?: {
      helpful_aspects?: string[];
      improvement_suggestions?: string[];
      additional_needs?: string[];
      framework_preferences?: HormoziFramework[];
    }
  ): Promise<void> {
    const feedbackMetric: UserFeedbackMetrics = {
      feedback_id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      query_id: queryId,
      session_id: sessionId,
      user_id: userId,
      satisfaction_ratings: satisfactionRatings,
      behavioral_indicators: {
        time_spent_reading_ms: behavioralIndicators?.time_spent_reading_ms || 0,
        follow_up_questions_asked: behavioralIndicators?.follow_up_questions_asked || 0,
        implementation_attempted: behavioralIndicators?.implementation_attempted || false,
        response_bookmarked: behavioralIndicators?.response_bookmarked || false,
        shared_response: behavioralIndicators?.shared_response || false,
        rated_helpful: behavioralIndicators?.rated_helpful || false
      },
      qualitative_feedback: qualitativeFeedback
    };

    this.feedbackBuffer.push(feedbackMetric);
    await this.checkBufferFlush();
  }

  // Citation Accuracy Monitoring
  async recordCitationAccuracy(
    queryId: string,
    citationData: {
      cited_source: string;
      actual_source: string;
      authority_level: 'primary_hormozi' | 'verified_case_study' | 'expert_interpretation' | 'community_validated';
      factual_accuracy: number;
      context_appropriateness: number;
      quote_precision: number;
      framework_alignment: number;
    }
  ): Promise<void> {
    const citationMetric: CitationAccuracyMetrics = {
      citation_id: `citation_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString(),
      query_id: queryId,
      source_attribution: {
        cited_source: citationData.cited_source,
        actual_source: citationData.actual_source,
        attribution_accuracy: this.calculateAttributionAccuracy(citationData.cited_source, citationData.actual_source),
        authority_level: citationData.authority_level
      },
      content_validation: {
        factual_accuracy: citationData.factual_accuracy,
        context_appropriateness: citationData.context_appropriateness,
        quote_precision: citationData.quote_precision,
        framework_alignment: citationData.framework_alignment
      }
    };

    this.citationBuffer.push(citationMetric);
    await this.checkBufferFlush();
  }

  // System Health Monitoring
  async recordSystemHealth(): Promise<SystemHealthMetrics> {
    const healthMetric: SystemHealthMetrics = {
      timestamp: new Date().toISOString(),
      system_status: await this.assessSystemStatus(),
      component_health: await this.assessComponentHealth(),
      resource_utilization: await this.gatherResourceMetrics(),
      error_metrics: await this.gatherErrorMetrics()
    };

    this.systemMetrics.push(healthMetric);
    if (this.systemMetrics.length > 288) { // Keep 24 hours of 5-minute intervals
      this.systemMetrics = this.systemMetrics.slice(-288);
    }

    return healthMetric;
  }

  // Analytics Queries
  async getPerformanceSummary(
    startDate: Date,
    endDate: Date,
    filters?: {
      user_id?: string;
      business_stage?: BusinessLifecycleStage;
      industry?: IndustryVertical;
      framework?: HormoziFramework;
      intent?: UserIntent;
    }
  ): Promise<RAGAnalyticsSummary> {
    const metrics = await this.getFilteredMetrics(startDate, endDate, filters);
    
    return {
      period_start: startDate.toISOString(),
      period_end: endDate.toISOString(),
      total_queries: metrics.length,
      unique_users: new Set(metrics.map(m => m.user_id).filter(Boolean)).size,
      performance_summary: this.calculatePerformanceSummary(metrics),
      quality_summary: await this.calculateQualitySummary(metrics),
      usage_patterns: this.analyzeUsagePatterns(metrics),
      business_impact: await this.calculateBusinessImpact(metrics)
    };
  }

  async getRealtimeMetrics(): Promise<{
    current_queries_per_minute: number;
    average_response_time_last_hour: number;
    system_health_status: string;
    active_users: number;
    error_rate_last_hour: number;
  }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentMetrics = await this.getFilteredMetrics(oneHourAgo, new Date());
    
    const currentQueriesPerMinute = recentMetrics.length / 60;
    const avgResponseTime = recentMetrics.reduce((sum, m) => sum + m.performance_timing.total_response_time_ms, 0) / recentMetrics.length || 0;
    const activeUsers = new Set(recentMetrics.map(m => m.user_id).filter(Boolean)).size;
    
    const latestSystemHealth = this.systemMetrics[this.systemMetrics.length - 1];
    const errorRate = latestSystemHealth?.error_metrics.error_rate_percent || 0;

    return {
      current_queries_per_minute: currentQueriesPerMinute,
      average_response_time_last_hour: avgResponseTime,
      system_health_status: latestSystemHealth?.system_status || 'unknown',
      active_users: activeUsers,
      error_rate_last_hour: errorRate
    };
  }

  async getFrameworkPerformanceAnalysis(framework: HormoziFramework): Promise<{
    total_usage: number;
    average_satisfaction: number;
    average_response_time: number;
    implementation_success_rate: number;
    common_use_cases: string[];
    performance_trends: Array<{
      date: string;
      usage_count: number;
      satisfaction: number;
      response_time: number;
    }>;
  }> {
    const frameworkMetrics = this.metricsBuffer.filter(m => 
      m.query_metadata.detected_frameworks.includes(framework)
    );

    const feedbackMetrics = this.feedbackBuffer.filter(fb => 
      frameworkMetrics.some(m => m.metric_id === fb.query_id)
    );

    const averageSatisfaction = feedbackMetrics.reduce((sum, fb) => 
      sum + fb.satisfaction_ratings.overall_satisfaction, 0) / feedbackMetrics.length || 0;

    const averageResponseTime = frameworkMetrics.reduce((sum, m) => 
      sum + m.performance_timing.total_response_time_ms, 0) / frameworkMetrics.length || 0;

    const implementationRate = feedbackMetrics.filter(fb => 
      fb.behavioral_indicators.implementation_attempted).length / feedbackMetrics.length || 0;

    return {
      total_usage: frameworkMetrics.length,
      average_satisfaction: averageSatisfaction,
      average_response_time: averageResponseTime,
      implementation_success_rate: implementationRate,
      common_use_cases: this.extractCommonUseCases(frameworkMetrics),
      performance_trends: this.calculateFrameworkTrends(framework)
    };
  }

  async getUserJourneyAnalysis(userId: string): Promise<{
    total_sessions: number;
    total_queries: number;
    favorite_frameworks: HormoziFramework[];
    expertise_progression: string[];
    satisfaction_trend: number[];
    implementation_success_rate: number;
    business_impact_achieved: string[];
  }> {
    const userMetrics = this.metricsBuffer.filter(m => m.user_id === userId);
    const userFeedback = this.feedbackBuffer.filter(fb => fb.user_id === userId);

    const uniqueSessions = new Set(userMetrics.map(m => m.session_id)).size;
    const frameworkUsage = this.analyzeUserFrameworkPreferences(userMetrics);
    const satisfactionTrend = this.calculateSatisfactionTrend(userFeedback);
    const implementationRate = this.calculateUserImplementationRate(userFeedback);

    return {
      total_sessions: uniqueSessions,
      total_queries: userMetrics.length,
      favorite_frameworks: frameworkUsage.slice(0, 3).map(f => f.framework),
      expertise_progression: this.analyzeExpertiseProgression(userMetrics),
      satisfaction_trend: satisfactionTrend,
      implementation_success_rate: implementationRate,
      business_impact_achieved: this.extractBusinessImpacts(userFeedback)
    };
  }

  // Optimization Recommendations
  async generateOptimizationRecommendations(): Promise<{
    performance_optimizations: string[];
    quality_improvements: string[];
    user_experience_enhancements: string[];
    business_value_maximizers: string[];
  }> {
    const recentMetrics = await this.getFilteredMetrics(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      new Date()
    );

    const performanceOptimizations = this.analyzePerformanceBottlenecks(recentMetrics);
    const qualityImprovements = this.analyzeQualityGaps(recentMetrics);
    const uxEnhancements = await this.analyzeUserExperienceIssues();
    const businessValueMaximizers = this.analyzeBusinessValueOpportunities(recentMetrics);

    return {
      performance_optimizations: performanceOptimizations,
      quality_improvements: qualityImprovements,
      user_experience_enhancements: uxEnhancements,
      business_value_maximizers: businessValueMaximizers
    };
  }

  // Private Helper Methods
  private initializeAnalytics(): void {
    console.log('🔬 Oracle RAG Analytics initialized');
  }

  private startPeriodicFlush(): void {
    setInterval(async () => {
      await this.flushBuffers();
      await this.recordSystemHealth();
    }, this.bufferFlushInterval);
  }

  private async checkBufferFlush(): Promise<void> {
    if (this.metricsBuffer.length >= this.bufferFlushSize ||
        this.feedbackBuffer.length >= this.bufferFlushSize ||
        this.citationBuffer.length >= this.bufferFlushSize) {
      await this.flushBuffers();
    }
  }

  private async flushBuffers(): Promise<void> {
    // In production, this would persist to database
    if (this.metricsBuffer.length > 0) {
      console.log(`📊 Flushing ${this.metricsBuffer.length} performance metrics`);
      // await this.persistPerformanceMetrics(this.metricsBuffer);
      this.metricsBuffer = [];
    }

    if (this.feedbackBuffer.length > 0) {
      console.log(`💬 Flushing ${this.feedbackBuffer.length} feedback entries`);
      // await this.persistFeedbackMetrics(this.feedbackBuffer);
      this.feedbackBuffer = [];
    }

    if (this.citationBuffer.length > 0) {
      console.log(`📚 Flushing ${this.citationBuffer.length} citation metrics`);
      // await this.persistCitationMetrics(this.citationBuffer);
      this.citationBuffer = [];
    }
  }

  private assessQueryComplexity(queryClassification: any): 'simple' | 'moderate' | 'complex' {
    const complexity = queryClassification.query_complexity?.overall_complexity;
    if (complexity === 'simple' || complexity === 'basic') return 'simple';
    if (complexity === 'moderate' || complexity === 'intermediate') return 'moderate';
    return 'complex';
  }

  private extractSearchMetrics(searchResults: any) {
    const results = searchResults.enhanced_results || [];
    const relevantResults = results.filter((r: any) => r.relevance_score > 0.7).length;
    const avgRelevance = results.reduce((sum: number, r: any) => sum + r.relevance_score, 0) / results.length || 0;
    const topRelevance = results.length > 0 ? Math.max(...results.map((r: any) => r.relevance_score)) : 0;

    return {
      total_results: results.length,
      relevant_results: relevantResults,
      average_relevance_score: avgRelevance,
      top_result_relevance: topRelevance,
      search_mode: searchResults.search_metadata?.search_mode || 'unknown',
      similarity_threshold: searchResults.search_metadata?.similarity_threshold || 0,
      search_effectiveness: relevantResults / Math.max(results.length, 1)
    };
  }

  private extractContextMetrics(assembledContext: any) {
    const context = assembledContext.assembled_context || {};
    
    return {
      assembled_tokens: context.estimated_tokens || 0,
      context_sources: assembledContext.source_breakdown?.total_sources || 0,
      framework_coverage: assembledContext.framework_coverage?.coverage_score || 0,
      context_quality_score: assembledContext.quality_assessment?.overall_quality || 0,
      token_efficiency: (context.estimated_tokens > 0) ? 
        (assembledContext.quality_assessment?.overall_quality || 0) / (context.estimated_tokens / 1000) : 0
    };
  }

  private extractResponseMetrics(generatedResponse: any) {
    const response = generatedResponse.oracle_response?.full_response || '';
    const mysticalElements = (response.match(/\b(oracle|wisdom|ancient|reveals|prophecy|insight|sacred)\b/gi) || []).length;
    const businessConcepts = (response.match(/\b(revenue|conversion|customer|value|offer|market|growth|profit)\b/gi) || []).length;
    const actionableItems = (response.match(/\b(implement|create|start|build|develop|launch|optimize|step)\b/gi) || []).length;

    return {
      response_length: response.length,
      mystical_elements: mysticalElements,
      business_concepts: businessConcepts,
      actionable_items: actionableItems,
      citations_count: generatedResponse.citation_attribution?.total_citations || 0,
      follow_up_questions: generatedResponse.follow_up_questions?.length || 0,
      implementation_guidance_items: generatedResponse.implementation_guidance?.immediate_actions?.length || 0
    };
  }

  private normalizeQualityAssessment(qualityAssessment: any) {
    return {
      overall_quality: qualityAssessment?.overall_quality || 0,
      relevance_score: qualityAssessment?.relevance || 0,
      accuracy_score: qualityAssessment?.accuracy || 0,
      completeness_score: qualityAssessment?.completeness || 0,
      actionability_score: qualityAssessment?.actionability || 0,
      clarity_score: qualityAssessment?.clarity || 0,
      authority_score: qualityAssessment?.authority || 0
    };
  }

  private assessBusinessValue(queryMetadata: any, generatedResponse: any, qualityAssessment: any) {
    const frameworks = queryMetadata.query_classification.business_context.framework_relevance || [];
    const frameworkApplicability = frameworks.length > 0 ? 
      frameworks.reduce((sum: number, fr: any) => sum + fr.relevance_score, 0) / frameworks.length : 0;

    return {
      framework_applicability: frameworkApplicability,
      implementation_readiness: generatedResponse.implementation_guidance?.immediate_actions?.length > 0 ? 0.8 : 0.4,
      strategic_value: qualityAssessment?.strategic_value || frameworkApplicability * 0.8,
      financial_impact_potential: this.assessFinancialImpact(queryMetadata, generatedResponse),
      user_stage_alignment: this.assessStageAlignment(queryMetadata.user_context, generatedResponse)
    };
  }

  private assessFinancialImpact(queryMetadata: any, generatedResponse: any): number {
    const query = queryMetadata.original_query.toLowerCase();
    const response = generatedResponse.oracle_response?.full_response?.toLowerCase() || '';
    
    let impact = 0.5; // Base score
    
    // Revenue-related queries have higher financial impact
    if (query.includes('revenue') || query.includes('sales') || query.includes('profit')) {
      impact += 0.2;
    }
    
    // Specific metrics mentioned
    if (query.includes('ltv') || query.includes('cac') || query.includes('roi')) {
      impact += 0.15;
    }
    
    // Implementation guidance provided
    if (response.includes('implement') || response.includes('increase') || response.includes('optimize')) {
      impact += 0.15;
    }
    
    return Math.min(impact, 1.0);
  }

  private assessStageAlignment(userContext: any, generatedResponse: any): number {
    const userStage = userContext?.business_stage || 'growth';
    const response = generatedResponse.oracle_response?.full_response?.toLowerCase() || '';
    
    if (response.includes(userStage) || response.includes('your stage') || response.includes('your level')) {
      return 0.9;
    }
    
    return 0.6; // Default moderate alignment
  }

  private calculateAttributionAccuracy(cited: string, actual: string): number {
    if (cited === actual) return 1.0;
    if (cited.includes(actual) || actual.includes(cited)) return 0.8;
    return 0.3; // Low accuracy for different sources
  }

  private async assessSystemStatus(): Promise<'healthy' | 'degraded' | 'critical'> {
    // Simplified system status assessment
    const recentErrors = this.systemMetrics.slice(-12); // Last hour
    const errorRate = recentErrors.reduce((sum, m) => sum + m.error_metrics.error_rate_percent, 0) / recentErrors.length;
    
    if (errorRate > 10) return 'critical';
    if (errorRate > 5) return 'degraded';
    return 'healthy';
  }

  private async assessComponentHealth(): Promise<SystemHealthMetrics['component_health']> {
    // Mock component health - in production, this would check actual component status
    return {
      query_processor: { status: 'healthy', last_success: new Date().toISOString(), error_rate: 0.1, average_latency_ms: 150, uptime_percent: 99.9 },
      vector_search: { status: 'healthy', last_success: new Date().toISOString(), error_rate: 0.2, average_latency_ms: 300, uptime_percent: 99.8 },
      context_assembly: { status: 'healthy', last_success: new Date().toISOString(), error_rate: 0.05, average_latency_ms: 200, uptime_percent: 99.95 },
      response_generator: { status: 'healthy', last_success: new Date().toISOString(), error_rate: 0.3, average_latency_ms: 2000, uptime_percent: 99.7 },
      business_analyzer: { status: 'healthy', last_success: new Date().toISOString(), error_rate: 0.1, average_latency_ms: 100, uptime_percent: 99.9 }
    };
  }

  private async gatherResourceMetrics(): Promise<SystemHealthMetrics['resource_utilization']> {
    // Mock resource metrics - in production, this would gather actual system metrics
    return {
      cpu_usage_percent: Math.random() * 60 + 20, // 20-80%
      memory_usage_mb: Math.random() * 2000 + 1000, // 1-3GB
      token_usage: {
        daily_tokens: Math.floor(Math.random() * 100000),
        monthly_tokens: Math.floor(Math.random() * 2000000),
        cost_usd: Math.random() * 500
      },
      database_metrics: {
        query_latency_ms: Math.random() * 50 + 10,
        connection_pool_usage: Math.random() * 0.8,
        storage_usage_gb: Math.random() * 100 + 50
      }
    };
  }

  private async gatherErrorMetrics(): Promise<SystemHealthMetrics['error_metrics']> {
    return {
      error_rate_percent: Math.random() * 2,
      critical_errors: Math.floor(Math.random() * 3),
      timeout_errors: Math.floor(Math.random() * 5),
      api_errors: Math.floor(Math.random() * 10),
      recent_errors: []
    };
  }

  private async getFilteredMetrics(startDate: Date, endDate: Date, filters?: any): Promise<RAGPerformanceMetrics[]> {
    // In production, this would query the database with proper filtering
    return this.metricsBuffer.filter(m => {
      const timestamp = new Date(m.timestamp);
      if (timestamp < startDate || timestamp > endDate) return false;
      
      if (filters?.user_id && m.user_id !== filters.user_id) return false;
      if (filters?.business_stage && m.query_metadata.user_context.business_stage !== filters.business_stage) return false;
      if (filters?.industry && m.query_metadata.user_context.industry !== filters.industry) return false;
      if (filters?.framework && !m.query_metadata.detected_frameworks.includes(filters.framework)) return false;
      if (filters?.intent && m.query_metadata.detected_intent !== filters.intent) return false;
      
      return true;
    });
  }

  private calculatePerformanceSummary(metrics: RAGPerformanceMetrics[]) {
    if (metrics.length === 0) {
      return {
        average_response_time_ms: 0,
        p95_response_time_ms: 0,
        p99_response_time_ms: 0,
        fastest_response_ms: 0,
        slowest_response_ms: 0,
        success_rate: 0
      };
    }

    const responseTimes = metrics.map(m => m.performance_timing.total_response_time_ms).sort((a, b) => a - b);
    const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
    
    return {
      average_response_time_ms: avgResponseTime,
      p95_response_time_ms: responseTimes[Math.floor(responseTimes.length * 0.95)],
      p99_response_time_ms: responseTimes[Math.floor(responseTimes.length * 0.99)],
      fastest_response_ms: responseTimes[0],
      slowest_response_ms: responseTimes[responseTimes.length - 1],
      success_rate: metrics.length / (metrics.length + 0) // Simplified - would include failed requests
    };
  }

  private async calculateQualitySummary(metrics: RAGPerformanceMetrics[]) {
    if (metrics.length === 0) {
      return {
        average_quality_score: 0,
        average_relevance_score: 0,
        average_satisfaction: 0,
        citation_accuracy_rate: 0,
        framework_detection_accuracy: 0
      };
    }

    const avgQuality = metrics.reduce((sum, m) => sum + m.quality_assessment.overall_quality, 0) / metrics.length;
    const avgRelevance = metrics.reduce((sum, m) => sum + m.search_metrics.average_relevance_score, 0) / metrics.length;
    
    // Get corresponding feedback
    const feedbackMetrics = this.feedbackBuffer.filter(fb => 
      metrics.some(m => m.metric_id === fb.query_id)
    );
    const avgSatisfaction = feedbackMetrics.length > 0 ?
      feedbackMetrics.reduce((sum, fb) => sum + fb.satisfaction_ratings.overall_satisfaction, 0) / feedbackMetrics.length : 0;

    return {
      average_quality_score: avgQuality,
      average_relevance_score: avgRelevance,
      average_satisfaction: avgSatisfaction,
      citation_accuracy_rate: 0.88, // Would calculate from citation metrics
      framework_detection_accuracy: 0.85 // Would calculate from validation data
    };
  }

  private analyzeUsagePatterns(metrics: RAGPerformanceMetrics[]) {
    // Extract peak hours
    const hourlyUsage = new Array(24).fill(0);
    metrics.forEach(m => {
      const hour = new Date(m.timestamp).getHours();
      hourlyUsage[hour]++;
    });
    const peakHours = hourlyUsage.map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.hour);

    // Framework usage statistics
    const frameworkUsage = new Map<HormoziFramework, FrameworkUsageStats>();
    metrics.forEach(m => {
      m.query_metadata.detected_frameworks.forEach(framework => {
        if (!frameworkUsage.has(framework)) {
          frameworkUsage.set(framework, {
            framework,
            usage_count: 0,
            average_satisfaction: 0,
            implementation_rate: 0,
            business_impact_score: 0
          });
        }
        const stats = frameworkUsage.get(framework)!;
        stats.usage_count++;
        stats.business_impact_score += m.business_value.strategic_value;
      });
    });

    const popularFrameworks = Array.from(frameworkUsage.values())
      .sort((a, b) => b.usage_count - a.usage_count);

    // Business stage distribution
    const stageDistribution = {} as Record<BusinessLifecycleStage, number>;
    metrics.forEach(m => {
      const stage = m.query_metadata.user_context.business_stage;
      if (stage) {
        stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
      }
    });

    return {
      peak_hours: peakHours,
      popular_frameworks: popularFrameworks,
      common_intents: [], // Would implement intent analysis
      business_stage_distribution: stageDistribution,
      industry_distribution: {} as Record<IndustryVertical, number> // Would implement industry analysis
    };
  }

  private async calculateBusinessImpact(metrics: RAGPerformanceMetrics[]) {
    const feedbackMetrics = this.feedbackBuffer.filter(fb => 
      metrics.some(m => m.metric_id === fb.query_id)
    );

    const implementationRate = feedbackMetrics.filter(fb => 
      fb.behavioral_indicators.implementation_attempted).length / Math.max(feedbackMetrics.length, 1);

    const reportedROI = feedbackMetrics
      .filter(fb => fb.outcome_tracking?.roi_achieved)
      .reduce((sum, fb) => sum + (fb.outcome_tracking?.roi_achieved || 0), 0) / 
      Math.max(feedbackMetrics.filter(fb => fb.outcome_tracking?.roi_achieved).length, 1);

    return {
      implementation_rate: implementationRate,
      reported_roi: reportedROI || 0,
      user_retention_rate: 0.75, // Would calculate from actual user data
      knowledge_transfer_score: metrics.reduce((sum, m) => sum + m.business_value.strategic_value, 0) / metrics.length,
      strategic_value_delivered: metrics.reduce((sum, m) => sum + m.business_value.framework_applicability, 0) / metrics.length
    };
  }

  // Additional helper methods would be implemented here...
  private extractCommonUseCases(metrics: RAGPerformanceMetrics[]): string[] {
    return metrics.map(m => m.query_metadata.original_query.slice(0, 100)).slice(0, 5);
  }

  private calculateFrameworkTrends(framework: HormoziFramework): Array<{ date: string; usage_count: number; satisfaction: number; response_time: number; }> {
    // Mock implementation - would analyze trends over time
    return [];
  }

  private analyzeUserFrameworkPreferences(metrics: RAGPerformanceMetrics[]): FrameworkUsageStats[] {
    return [];
  }

  private calculateSatisfactionTrend(feedback: UserFeedbackMetrics[]): number[] {
    return feedback.map(fb => fb.satisfaction_ratings.overall_satisfaction);
  }

  private calculateUserImplementationRate(feedback: UserFeedbackMetrics[]): number {
    return feedback.filter(fb => fb.behavioral_indicators.implementation_attempted).length / Math.max(feedback.length, 1);
  }

  private analyzeExpertiseProgression(metrics: RAGPerformanceMetrics[]): string[] {
    return ['beginner', 'intermediate']; // Would analyze actual progression
  }

  private extractBusinessImpacts(feedback: UserFeedbackMetrics[]): string[] {
    return feedback.map(fb => fb.outcome_tracking?.business_impact_reported || 'No impact reported').filter(impact => impact !== 'No impact reported');
  }

  private analyzePerformanceBottlenecks(metrics: RAGPerformanceMetrics[]): string[] {
    const recommendations = [];
    
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.performance_timing.total_response_time_ms, 0) / metrics.length;
    if (avgResponseTime > 10000) {
      recommendations.push('Consider implementing response caching for common queries');
    }
    
    const avgVectorSearchTime = metrics.reduce((sum, m) => sum + m.performance_timing.vector_search_ms, 0) / metrics.length;
    if (avgVectorSearchTime > 3000) {
      recommendations.push('Optimize vector search with indexing improvements');
    }
    
    return recommendations;
  }

  private analyzeQualityGaps(metrics: RAGPerformanceMetrics[]): string[] {
    const recommendations = [];
    
    const avgQuality = metrics.reduce((sum, m) => sum + m.quality_assessment.overall_quality, 0) / metrics.length;
    if (avgQuality < 0.8) {
      recommendations.push('Improve context assembly to include more relevant framework content');
    }
    
    const avgRelevance = metrics.reduce((sum, m) => sum + m.search_metrics.average_relevance_score, 0) / metrics.length;
    if (avgRelevance < 0.75) {
      recommendations.push('Enhance vector embeddings for better semantic search accuracy');
    }
    
    return recommendations;
  }

  private async analyzeUserExperienceIssues(): Promise<string[]> {
    const feedback = this.feedbackBuffer.slice(-100); // Recent feedback
    const recommendations = [];
    
    const lowClarityFeedback = feedback.filter(fb => fb.satisfaction_ratings.response_clarity < 3).length;
    if (lowClarityFeedback > feedback.length * 0.2) {
      recommendations.push('Improve response structure and clarity for better user comprehension');
    }
    
    const lowActionabilityFeedback = feedback.filter(fb => fb.satisfaction_ratings.actionability < 3).length;
    if (lowActionabilityFeedback > feedback.length * 0.15) {
      recommendations.push('Include more specific implementation steps in responses');
    }
    
    return recommendations;
  }

  private analyzeBusinessValueOpportunities(metrics: RAGPerformanceMetrics[]): string[] {
    const recommendations = [];
    
    const avgFrameworkApplicability = metrics.reduce((sum, m) => sum + m.business_value.framework_applicability, 0) / metrics.length;
    if (avgFrameworkApplicability < 0.8) {
      recommendations.push('Enhance business context analysis for better framework recommendation accuracy');
    }
    
    const avgFinancialImpact = metrics.reduce((sum, m) => sum + m.business_value.financial_impact_potential, 0) / metrics.length;
    if (avgFinancialImpact < 0.7) {
      recommendations.push('Include more quantitative ROI projections and financial impact estimates');
    }
    
    return recommendations;
  }
}

// Export analytics service
export default OracleRAGAnalytics;