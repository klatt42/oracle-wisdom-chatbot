/**
 * Oracle RAG Configuration System
 * Alice Intelligence - Comprehensive configuration for business-aware RAG optimization
 * Easily tunable parameters for different business scenarios and use cases
 */

import {
  HormoziFramework,
  IndustryVertical,
  BusinessLifecycleStage,
  UserIntent,
  FinancialMetricCategory,
  FunctionalArea
} from '../types/businessIntelligence';

// Main RAG Configuration Interface
export interface OracleRAGConfig {
  vector_search: VectorSearchConfig;
  context_assembly: ContextAssemblyConfig;
  query_processing: QueryProcessingConfig;
  response_generation: ResponseGenerationConfig;
  business_intelligence: BusinessIntelligenceConfig;
  citation_system: CitationConfig;
  quality_assurance: QualityAssuranceConfig;
  performance_optimization: PerformanceConfig;
  scenario_profiles: ScenarioProfileConfig;
}

// Vector Search Configuration
export interface VectorSearchConfig {
  similarity_thresholds: SimilarityThresholds;
  search_strategies: SearchStrategyConfig;
  result_filtering: ResultFilteringConfig;
  ranking_weights: RankingWeightsConfig;
  performance_tuning: SearchPerformanceConfig;
}

export interface SimilarityThresholds {
  minimum_similarity: number;
  high_quality_threshold: number;
  framework_specific: Map<HormoziFramework, number>;
  intent_based: Map<UserIntent, number>;
  complexity_adjusted: Map<string, number>;
  industry_specific: Map<IndustryVertical, number>;
}

export interface SearchStrategyConfig {
  default_strategy: 'semantic' | 'hybrid' | 'comprehensive';
  max_results: {
    simple_query: number;
    moderate_query: number;
    complex_query: number;
    highly_complex_query: number;
  };
  search_modes: {
    semantic_weight: number;
    exact_match_weight: number;
    framework_boost: number;
    recency_factor: number;
  };
  expansion_rules: {
    synonym_expansion: boolean;
    framework_terminology: boolean;
    financial_metrics_expansion: boolean;
    business_context_enhancement: boolean;
  };
}

export interface ResultFilteringConfig {
  authority_requirements: {
    minimum_authority_score: number;
    preferred_authority_levels: string[];
    authority_distribution_balance: number;
  };
  content_quality_filters: {
    minimum_completeness: number;
    minimum_accuracy_confidence: number;
    require_implementation_guidance: boolean;
    require_success_metrics: boolean;
  };
  business_context_filters: {
    framework_relevance_threshold: number;
    industry_alignment_requirement: number;
    business_stage_compatibility: number;
  };
}

export interface RankingWeightsConfig {
  semantic_similarity: number;
  business_context_relevance: number;
  framework_alignment: number;
  authority_level: number;
  content_completeness: number;
  recency_factor: number;
  implementation_readiness: number;
  success_pattern_match: number;
}

export interface SearchPerformanceConfig {
  cache_enabled: boolean;
  cache_duration_ms: number;
  parallel_search_enabled: boolean;
  max_concurrent_searches: number;
  timeout_ms: number;
  retry_configuration: {
    max_retries: number;
    retry_delay_ms: number;
    exponential_backoff: boolean;
  };
}

// Context Assembly Configuration
export interface ContextAssemblyConfig {
  assembly_rules: AssemblyRulesConfig;
  content_prioritization: ContentPrioritizationConfig;
  section_organization: SectionOrganizationConfig;
  token_optimization: TokenOptimizationConfig;
  citation_integration: CitationIntegrationConfig;
}

export interface AssemblyRulesConfig {
  max_context_tokens: number;
  max_sections: number;
  minimum_section_quality: number;
  framework_prioritization: boolean;
  cross_framework_integration: boolean;
  implementation_focus_boost: number;
  financial_metrics_emphasis: number;
}

export interface ContentPrioritizationConfig {
  section_priorities: Map<string, number>;
  framework_importance: Map<HormoziFramework, number>;
  content_type_weights: {
    primary_framework: number;
    supporting_framework: number;
    financial_metrics: number;
    implementation_guidance: number;
    case_studies: number;
    expert_insights: number;
    foundational_concepts: number;
    cross_references: number;
  };
  intent_based_priorities: Map<UserIntent, ContentTypePriorities>;
}

export interface ContentTypePriorities {
  primary_focus: string[];
  secondary_focus: string[];
  supporting_content: string[];
  weight_multipliers: Record<string, number>;
}

export interface SectionOrganizationConfig {
  hierarchical_structure: boolean;
  dependency_aware_ordering: boolean;
  learning_progression_optimization: boolean;
  implementation_sequence_optimization: boolean;
  maximum_nesting_depth: number;
  cross_reference_density: number;
}

export interface TokenOptimizationConfig {
  compression_strategies: {
    intelligent_truncation: boolean;
    redundancy_removal: boolean;
    priority_based_inclusion: boolean;
    dynamic_section_sizing: boolean;
  };
  preservation_priorities: {
    framework_components: number;
    implementation_steps: number;
    success_metrics: number;
    citations: number;
    examples: number;
  };
  quality_preservation_threshold: number;
}

export interface CitationIntegrationConfig {
  inline_citations: boolean;
  citation_density_target: number;
  authority_weighted_prominence: boolean;
  mystical_citation_styling: boolean;
  cross_reference_linking: boolean;
  source_diversity_requirement: number;
}

// Query Processing Configuration
export interface QueryProcessingConfig {
  classification_settings: ClassificationSettings;
  enhancement_rules: EnhancementRules;
  normalization_config: NormalizationConfig;
  expansion_strategies: ExpansionStrategies;
  complexity_routing: ComplexityRouting;
}

export interface ClassificationSettings {
  confidence_thresholds: {
    intent_classification: number;
    framework_detection: number;
    financial_metrics_detection: number;
    business_context_analysis: number;
  };
  multi_intent_support: boolean;
  intent_hierarchy_enabled: boolean;
  context_sensitivity: number;
}

export interface EnhancementRules {
  synonym_expansion: {
    enabled: boolean;
    max_synonyms_per_term: number;
    confidence_threshold: number;
    business_context_weighting: boolean;
  };
  framework_terminology_normalization: {
    enabled: boolean;
    canonical_term_enforcement: boolean;
    variation_tolerance: number;
  };
  financial_metrics_enhancement: {
    automatic_expansion: boolean;
    calculation_context_addition: boolean;
    optimization_terms_inclusion: boolean;
    benchmark_context_integration: boolean;
  };
  business_context_enrichment: {
    industry_specific_terms: boolean;
    stage_appropriate_language: boolean;
    functional_area_terminology: boolean;
    success_metrics_integration: boolean;
  };
}

export interface NormalizationConfig {
  hormozi_terminology: {
    framework_canonicalization: boolean;
    component_standardization: boolean;
    variation_mapping_strictness: number;
  };
  business_metrics: {
    metric_name_standardization: boolean;
    calculation_terminology_alignment: boolean;
    industry_variant_normalization: boolean;
  };
  general_business_terms: {
    synonym_standardization: boolean;
    industry_specific_normalization: boolean;
    functional_area_alignment: boolean;
  };
}

export interface ExpansionStrategies {
  query_expansion_modes: {
    conservative: ExpansionModeConfig;
    balanced: ExpansionModeConfig;
    aggressive: ExpansionModeConfig;
  };
  context_aware_expansion: {
    user_history_influence: boolean;
    session_context_integration: boolean;
    adaptive_expansion_learning: boolean;
  };
}

export interface ExpansionModeConfig {
  max_additional_terms: number;
  expansion_confidence_threshold: number;
  business_relevance_weight: number;
  framework_focus_multiplier: number;
}

export interface ComplexityRouting {
  complexity_thresholds: {
    simple: number;
    moderate: number;
    complex: number;
    highly_complex: number;
  };
  routing_strategies: {
    simple_query_optimization: boolean;
    multi_hop_reasoning_threshold: number;
    comprehensive_analysis_trigger: number;
  };
  performance_considerations: {
    timeout_by_complexity: Map<string, number>;
    resource_allocation: Map<string, number>;
  };
}

// Response Generation Configuration
export interface ResponseGenerationConfig {
  personality_settings: PersonalitySettings;
  prompt_templates: PromptTemplatesConfig;
  response_structure: ResponseStructureConfig;
  claude_api_settings: ClaudeAPISettings;
  content_guidelines: ContentGuidelinesConfig;
}

export interface PersonalitySettings {
  oracle_voice_strength: number; // 0.0 to 1.0
  mystical_element_density: number;
  business_practicality_balance: number;
  authority_tone_level: number;
  wisdom_integration_style: 'subtle' | 'prominent' | 'dominant';
  personality_adaptation: {
    user_expertise_sensitivity: boolean;
    industry_tone_adjustment: boolean;
    urgency_level_adaptation: boolean;
  };
}

export interface PromptTemplatesConfig {
  system_prompts: SystemPromptsConfig;
  user_prompts: UserPromptsConfig;
  framework_specific_templates: Map<HormoziFramework, FrameworkPromptTemplate>;
  intent_based_templates: Map<UserIntent, IntentPromptTemplate>;
  complexity_adapted_templates: Map<string, ComplexityPromptTemplate>;
}

export interface SystemPromptsConfig {
  base_oracle_identity: string;
  expertise_declarations: string[];
  response_guidelines: string[];
  citation_requirements: string[];
  quality_standards: string[];
  personality_instructions: string[];
}

export interface UserPromptsConfig {
  query_analysis_template: string;
  context_integration_template: string;
  response_structure_template: string;
  citation_integration_template: string;
  follow_up_generation_template: string;
}

export interface FrameworkPromptTemplate {
  framework_introduction: string;
  component_explanation_style: string;
  implementation_guidance_format: string;
  success_metrics_emphasis: string;
  integration_opportunities_highlight: string;
}

export interface IntentPromptTemplate {
  intent_acknowledgment: string;
  response_focus_areas: string[];
  content_prioritization: string;
  outcome_emphasis: string;
  action_orientation: string;
}

export interface ComplexityPromptTemplate {
  complexity_handling_approach: string;
  depth_requirements: string;
  structure_guidelines: string;
  comprehensive_coverage: string;
}

export interface ResponseStructureConfig {
  section_requirements: {
    mystical_opening: boolean;
    core_wisdom: boolean;
    business_application: boolean;
    framework_integration: boolean;
    implementation_roadmap: boolean;
    mystical_closing: boolean;
  };
  content_distribution: {
    wisdom_to_application_ratio: number;
    theory_to_practice_balance: number;
    framework_to_implementation_split: number;
  };
  length_guidelines: {
    brief: { min: number; max: number; };
    standard: { min: number; max: number; };
    comprehensive: { min: number; max: number; };
    expert: { min: number; max: number; };
  };
}

export interface ClaudeAPISettings {
  model_selection: {
    default_model: string;
    complexity_based_models: Map<string, string>;
    fallback_models: string[];
  };
  generation_parameters: {
    temperature: number;
    max_tokens: number;
    top_p: number;
    top_k: number;
  };
  retry_configuration: {
    max_retries: number;
    retry_delay_ms: number;
    exponential_backoff: boolean;
    timeout_ms: number;
  };
  rate_limiting: {
    requests_per_minute: number;
    tokens_per_minute: number;
    burst_allowance: number;
  };
}

export interface ContentGuidelinesConfig {
  accuracy_requirements: {
    framework_fidelity: number;
    citation_accuracy: number;
    implementation_practicality: number;
  };
  completeness_standards: {
    minimum_coverage_percentage: number;
    key_components_inclusion: boolean;
    success_metrics_requirement: boolean;
    implementation_guidance_depth: 'basic' | 'detailed' | 'comprehensive';
  };
  clarity_guidelines: {
    jargon_explanation_requirement: boolean;
    step_by_step_detail_level: number;
    example_inclusion_frequency: number;
    conceptual_bridge_building: boolean;
  };
}

// Business Intelligence Configuration
export interface BusinessIntelligenceConfig {
  framework_detection: FrameworkDetectionConfig;
  business_context_analysis: BusinessContextConfig;
  industry_specialization: IndustrySpecializationConfig;
  stage_awareness: StageAwarenessConfig;
  metrics_intelligence: MetricsIntelligenceConfig;
}

export interface FrameworkDetectionConfig {
  detection_strategies: {
    keyword_matching_weight: number;
    semantic_analysis_weight: number;
    context_inference_weight: number;
  };
  framework_signatures: Map<HormoziFramework, FrameworkSignature>;
  multi_framework_handling: {
    max_concurrent_frameworks: number;
    integration_priority_rules: IntegrationPriorityRule[];
    conflict_resolution_strategy: 'prioritize' | 'integrate' | 'sequence';
  };
}

export interface FrameworkSignature {
  primary_keywords: string[];
  component_indicators: string[];
  contextual_phrases: string[];
  implementation_signals: string[];
  success_metric_associations: string[];
  confidence_weights: Record<string, number>;
}

export interface IntegrationPriorityRule {
  primary_framework: HormoziFramework;
  compatible_frameworks: HormoziFramework[];
  integration_approach: 'sequential' | 'parallel' | 'hierarchical';
  synergy_multiplier: number;
}

export interface BusinessContextConfig {
  context_analysis_depth: 'surface' | 'moderate' | 'deep' | 'comprehensive';
  industry_detection_sensitivity: number;
  business_stage_inference_confidence: number;
  functional_area_mapping_accuracy: number;
  competitive_context_awareness: boolean;
}

export interface IndustrySpecializationConfig {
  specialized_industries: Map<IndustryVertical, IndustrySpecialization>;
  cross_industry_applicability: boolean;
  industry_specific_terminology: boolean;
  regulatory_compliance_awareness: boolean;
}

export interface IndustrySpecialization {
  terminology_adaptations: string[];
  success_metric_preferences: string[];
  implementation_considerations: string[];
  regulatory_factors: string[];
  competitive_landscape_factors: string[];
}

export interface StageAwarenessConfig {
  stage_detection_accuracy: number;
  stage_appropriate_guidance: boolean;
  resource_constraint_consideration: boolean;
  growth_trajectory_awareness: boolean;
  stage_transition_guidance: boolean;
}

export interface MetricsIntelligenceConfig {
  automatic_metric_detection: boolean;
  calculation_guidance_inclusion: boolean;
  benchmark_data_integration: boolean;
  optimization_strategy_generation: boolean;
  metric_relationship_mapping: boolean;
}

// Citation System Configuration
export interface CitationConfig {
  citation_styles: CitationStylesConfig;
  authority_weighting: AuthorityWeightingConfig;
  verification_standards: VerificationStandardsConfig;
  presentation_options: PresentationOptionsConfig;
  quality_assurance: CitationQualityConfig;
}

export interface CitationStylesConfig {
  default_style: 'mystical' | 'academic' | 'business' | 'inline';
  mystical_elements: {
    ethereal_descriptors: string[];
    wisdom_attributions: string[];
    authority_honorifics: string[];
    source_mystification: boolean;
  };
  formatting_rules: {
    inline_citation_format: string;
    reference_list_format: string;
    authority_indication_method: 'icon' | 'text' | 'color' | 'combined';
  };
}

export interface AuthorityWeightingConfig {
  authority_hierarchy: Map<string, AuthorityLevel>;
  verification_requirements: Map<string, VerificationRequirement>;
  credibility_scoring: {
    source_reputation_weight: number;
    content_accuracy_weight: number;
    peer_validation_weight: number;
    recency_relevance_weight: number;
  };
}

export interface AuthorityLevel {
  level_name: string;
  credibility_score: number;
  presentation_prominence: number;
  verification_requirements: string[];
  usage_guidelines: string[];
}

export interface VerificationRequirement {
  verification_type: 'automatic' | 'manual' | 'peer_review' | 'expert_validation';
  confidence_threshold: number;
  documentation_requirements: string[];
  update_frequency: string;
}

export interface VerificationStandardsConfig {
  minimum_verification_level: string;
  cross_reference_requirements: number;
  fact_checking_enabled: boolean;
  source_diversity_requirement: number;
  temporal_relevance_standards: {
    maximum_age_months: number;
    recency_boost_factor: number;
    evergreen_content_identification: boolean;
  };
}

export interface PresentationOptionsConfig {
  inline_citation_density: number;
  reference_section_inclusion: boolean;
  interactive_citation_links: boolean;
  source_preview_generation: boolean;
  authority_visualization: 'badges' | 'colors' | 'icons' | 'text';
}

export interface CitationQualityConfig {
  accuracy_validation: boolean;
  completeness_checking: boolean;
  consistency_enforcement: boolean;
  accessibility_compliance: boolean;
  link_validation: boolean;
}

// Quality Assurance Configuration
export interface QualityAssuranceConfig {
  validation_rules: ValidationRulesConfig;
  quality_metrics: QualityMetricsConfig;
  improvement_mechanisms: ImprovementMechanismsConfig;
  monitoring_settings: MonitoringSettingsConfig;
}

export interface ValidationRulesConfig {
  content_validation: {
    accuracy_threshold: number;
    completeness_threshold: number;
    relevance_threshold: number;
    actionability_threshold: number;
  };
  response_validation: {
    personality_consistency_check: boolean;
    citation_accuracy_validation: boolean;
    implementation_practicality_check: boolean;
    business_relevance_validation: boolean;
  };
  technical_validation: {
    token_limit_compliance: boolean;
    api_response_validation: boolean;
    performance_threshold_checking: boolean;
  };
}

export interface QualityMetricsConfig {
  primary_metrics: string[];
  metric_weights: Map<string, number>;
  benchmark_standards: Map<string, number>;
  improvement_tracking: {
    historical_comparison: boolean;
    trend_analysis: boolean;
    performance_forecasting: boolean;
  };
}

export interface ImprovementMechanismsConfig {
  feedback_integration: {
    user_feedback_weight: number;
    automatic_quality_adjustment: boolean;
    learning_rate: number;
  };
  continuous_optimization: {
    a_b_testing_enabled: boolean;
    parameter_auto_tuning: boolean;
    performance_based_adjustments: boolean;
  };
}

export interface MonitoringSettingsConfig {
  real_time_monitoring: boolean;
  quality_alerts: {
    threshold_violations: boolean;
    performance_degradation: boolean;
    user_satisfaction_drops: boolean;
  };
  reporting_frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
  dashboard_metrics: string[];
}

// Performance Optimization Configuration
export interface PerformanceConfig {
  caching_strategies: CachingStrategiesConfig;
  resource_allocation: ResourceAllocationConfig;
  optimization_priorities: OptimizationPrioritiesConfig;
  scalability_settings: ScalabilitySettingsConfig;
}

export interface CachingStrategiesConfig {
  query_result_caching: {
    enabled: boolean;
    cache_duration_ms: number;
    cache_size_limit: number;
    invalidation_triggers: string[];
  };
  context_assembly_caching: {
    enabled: boolean;
    assembly_cache_duration_ms: number;
    context_similarity_threshold: number;
  };
  response_generation_caching: {
    enabled: boolean;
    response_cache_duration_ms: number;
    personalization_consideration: boolean;
  };
}

export interface ResourceAllocationConfig {
  processing_priorities: Map<string, number>;
  timeout_configurations: Map<string, number>;
  retry_strategies: Map<string, RetryStrategy>;
  resource_limits: {
    max_concurrent_queries: number;
    memory_limit_mb: number;
    processing_timeout_ms: number;
  };
}

export interface RetryStrategy {
  max_attempts: number;
  initial_delay_ms: number;
  delay_multiplier: number;
  max_delay_ms: number;
  retry_conditions: string[];
}

export interface OptimizationPrioritiesConfig {
  speed_vs_quality_balance: number; // 0.0 (speed) to 1.0 (quality)
  accuracy_vs_coverage_balance: number;
  personalization_vs_generalization: number;
  real_time_optimization: boolean;
  adaptive_performance_tuning: boolean;
}

export interface ScalabilitySettingsConfig {
  load_balancing: {
    enabled: boolean;
    strategy: 'round_robin' | 'weighted' | 'least_connections' | 'adaptive';
  };
  auto_scaling: {
    enabled: boolean;
    scale_up_threshold: number;
    scale_down_threshold: number;
    scaling_cooldown_ms: number;
  };
  distributed_processing: {
    enabled: boolean;
    processing_distribution_strategy: string;
    fault_tolerance_level: 'basic' | 'advanced' | 'enterprise';
  };
}

// Scenario Profile Configuration
export interface ScenarioProfileConfig {
  predefined_profiles: Map<string, ScenarioProfile>;
  custom_profile_support: boolean;
  profile_switching_enabled: boolean;
  scenario_detection: ScenarioDetectionConfig;
}

export interface ScenarioProfile {
  profile_name: string;
  profile_description: string;
  target_use_cases: string[];
  configuration_overrides: Partial<OracleRAGConfig>;
  performance_expectations: {
    response_time_target_ms: number;
    quality_score_target: number;
    user_satisfaction_target: number;
  };
  optimization_focus: 'speed' | 'quality' | 'comprehensiveness' | 'personalization';
}

export interface ScenarioDetectionConfig {
  automatic_detection: boolean;
  detection_criteria: {
    query_complexity_indicators: string[];
    user_context_signals: string[];
    business_scenario_markers: string[];
  };
  profile_recommendation_confidence: number;
  fallback_profile: string;
}

// Default RAG Configuration
export const DEFAULT_RAG_CONFIG: OracleRAGConfig = {
  vector_search: {
    similarity_thresholds: {
      minimum_similarity: 0.3,
      high_quality_threshold: 0.8,
      framework_specific: new Map([
        [HormoziFramework.GRAND_SLAM_OFFERS, 0.75],
        [HormoziFramework.CORE_FOUR, 0.7],
        [HormoziFramework.LTV_CAC_OPTIMIZATION, 0.8],
        [HormoziFramework.CLOSER_FRAMEWORK, 0.75]
      ]),
      intent_based: new Map([
        [UserIntent.LEARNING, 0.6],
        [UserIntent.IMPLEMENTATION, 0.7],
        [UserIntent.OPTIMIZATION, 0.75],
        [UserIntent.TROUBLESHOOTING, 0.65]
      ]),
      complexity_adjusted: new Map([
        ['simple', 0.5],
        ['moderate', 0.6],
        ['complex', 0.7],
        ['highly_complex', 0.65]
      ]),
      industry_specific: new Map([
        [IndustryVertical.SOFTWARE_SAAS, 0.7],
        [IndustryVertical.ECOMMERCE, 0.65],
        [IndustryVertical.PROFESSIONAL_SERVICES, 0.75]
      ])
    },
    search_strategies: {
      default_strategy: 'hybrid',
      max_results: {
        simple_query: 10,
        moderate_query: 15,
        complex_query: 20,
        highly_complex_query: 25
      },
      search_modes: {
        semantic_weight: 0.6,
        exact_match_weight: 0.3,
        framework_boost: 0.4,
        recency_factor: 0.1
      },
      expansion_rules: {
        synonym_expansion: true,
        framework_terminology: true,
        financial_metrics_expansion: true,
        business_context_enhancement: true
      }
    },
    result_filtering: {
      authority_requirements: {
        minimum_authority_score: 0.6,
        preferred_authority_levels: ['PRIMARY_HORMOZI', 'VERIFIED_CASE_STUDY', 'EXPERT_INTERPRETATION'],
        authority_distribution_balance: 0.7
      },
      content_quality_filters: {
        minimum_completeness: 0.7,
        minimum_accuracy_confidence: 0.8,
        require_implementation_guidance: true,
        require_success_metrics: false
      },
      business_context_filters: {
        framework_relevance_threshold: 0.5,
        industry_alignment_requirement: 0.3,
        business_stage_compatibility: 0.4
      }
    },
    ranking_weights: {
      semantic_similarity: 0.25,
      business_context_relevance: 0.2,
      framework_alignment: 0.15,
      authority_level: 0.15,
      content_completeness: 0.1,
      recency_factor: 0.05,
      implementation_readiness: 0.1,
      success_pattern_match: 0.0
    },
    performance_tuning: {
      cache_enabled: true,
      cache_duration_ms: 300000, // 5 minutes
      parallel_search_enabled: true,
      max_concurrent_searches: 3,
      timeout_ms: 30000,
      retry_configuration: {
        max_retries: 2,
        retry_delay_ms: 1000,
        exponential_backoff: true
      }
    }
  },

  context_assembly: {
    assembly_rules: {
      max_context_tokens: 100000,
      max_sections: 12,
      minimum_section_quality: 0.6,
      framework_prioritization: true,
      cross_framework_integration: true,
      implementation_focus_boost: 1.3,
      financial_metrics_emphasis: 1.2
    },
    content_prioritization: {
      section_priorities: new Map([
        ['primary_framework', 1.0],
        ['financial_metrics', 0.9],
        ['implementation_guidance', 0.85],
        ['supporting_framework', 0.8],
        ['case_studies', 0.7],
        ['expert_insights', 0.75],
        ['foundational_concepts', 0.6],
        ['cross_references', 0.5]
      ]),
      framework_importance: new Map([
        [HormoziFramework.GRAND_SLAM_OFFERS, 1.0],
        [HormoziFramework.CORE_FOUR, 0.95],
        [HormoziFramework.LTV_CAC_OPTIMIZATION, 0.9],
        [HormoziFramework.CLOSER_FRAMEWORK, 0.85]
      ]),
      content_type_weights: {
        primary_framework: 1.0,
        supporting_framework: 0.8,
        financial_metrics: 0.9,
        implementation_guidance: 0.85,
        case_studies: 0.7,
        expert_insights: 0.75,
        foundational_concepts: 0.6,
        cross_references: 0.5
      },
      intent_based_priorities: new Map([
        [UserIntent.LEARNING, {
          primary_focus: ['foundational_concepts', 'primary_framework'],
          secondary_focus: ['expert_insights', 'case_studies'],
          supporting_content: ['cross_references'],
          weight_multipliers: { 'foundational_concepts': 1.3, 'primary_framework': 1.2 } as Record<string, number>
        }],
        [UserIntent.IMPLEMENTATION, {
          primary_focus: ['implementation_guidance', 'primary_framework'],
          secondary_focus: ['case_studies', 'supporting_framework'],
          supporting_content: ['expert_insights'],
          weight_multipliers: { 'implementation_guidance': 1.5, 'case_studies': 1.2 } as Record<string, number>
        }]
      ])
    },
    section_organization: {
      hierarchical_structure: true,
      dependency_aware_ordering: true,
      learning_progression_optimization: true,
      implementation_sequence_optimization: true,
      maximum_nesting_depth: 3,
      cross_reference_density: 0.15
    },
    token_optimization: {
      compression_strategies: {
        intelligent_truncation: true,
        redundancy_removal: true,
        priority_based_inclusion: true,
        dynamic_section_sizing: true
      },
      preservation_priorities: {
        framework_components: 0.9,
        implementation_steps: 0.85,
        success_metrics: 0.8,
        citations: 0.7,
        examples: 0.6
      },
      quality_preservation_threshold: 0.8
    },
    citation_integration: {
      inline_citations: true,
      citation_density_target: 0.2,
      authority_weighted_prominence: true,
      mystical_citation_styling: true,
      cross_reference_linking: true,
      source_diversity_requirement: 0.6
    }
  },

  query_processing: {
    classification_settings: {
      confidence_thresholds: {
        intent_classification: 0.7,
        framework_detection: 0.6,
        financial_metrics_detection: 0.65,
        business_context_analysis: 0.6
      },
      multi_intent_support: true,
      intent_hierarchy_enabled: true,
      context_sensitivity: 0.8
    },
    enhancement_rules: {
      synonym_expansion: {
        enabled: true,
        max_synonyms_per_term: 3,
        confidence_threshold: 0.7,
        business_context_weighting: true
      },
      framework_terminology_normalization: {
        enabled: true,
        canonical_term_enforcement: true,
        variation_tolerance: 0.8
      },
      financial_metrics_enhancement: {
        automatic_expansion: true,
        calculation_context_addition: true,
        optimization_terms_inclusion: true,
        benchmark_context_integration: true
      },
      business_context_enrichment: {
        industry_specific_terms: true,
        stage_appropriate_language: true,
        functional_area_terminology: true,
        success_metrics_integration: true
      }
    },
    normalization_config: {
      hormozi_terminology: {
        framework_canonicalization: true,
        component_standardization: true,
        variation_mapping_strictness: 0.8
      },
      business_metrics: {
        metric_name_standardization: true,
        calculation_terminology_alignment: true,
        industry_variant_normalization: true
      },
      general_business_terms: {
        synonym_standardization: true,
        industry_specific_normalization: true,
        functional_area_alignment: true
      }
    },
    expansion_strategies: {
      query_expansion_modes: {
        conservative: {
          max_additional_terms: 3,
          expansion_confidence_threshold: 0.8,
          business_relevance_weight: 0.9,
          framework_focus_multiplier: 1.2
        },
        balanced: {
          max_additional_terms: 5,
          expansion_confidence_threshold: 0.7,
          business_relevance_weight: 0.8,
          framework_focus_multiplier: 1.1
        },
        aggressive: {
          max_additional_terms: 8,
          expansion_confidence_threshold: 0.6,
          business_relevance_weight: 0.7,
          framework_focus_multiplier: 1.0
        }
      },
      context_aware_expansion: {
        user_history_influence: true,
        session_context_integration: true,
        adaptive_expansion_learning: false
      }
    },
    complexity_routing: {
      complexity_thresholds: {
        simple: 0.3,
        moderate: 0.6,
        complex: 0.8,
        highly_complex: 1.0
      },
      routing_strategies: {
        simple_query_optimization: true,
        multi_hop_reasoning_threshold: 0.7,
        comprehensive_analysis_trigger: 0.85
      },
      performance_considerations: {
        timeout_by_complexity: new Map([
          ['simple', 10000],
          ['moderate', 20000],
          ['complex', 40000],
          ['highly_complex', 60000]
        ]),
        resource_allocation: new Map([
          ['simple', 0.5],
          ['moderate', 0.7],
          ['complex', 0.9],
          ['highly_complex', 1.0]
        ])
      }
    }
  },

  response_generation: {
    personality_settings: {
      oracle_voice_strength: 0.8,
      mystical_element_density: 0.7,
      business_practicality_balance: 0.75,
      authority_tone_level: 0.85,
      wisdom_integration_style: 'prominent',
      personality_adaptation: {
        user_expertise_sensitivity: true,
        industry_tone_adjustment: true,
        urgency_level_adaptation: true
      }
    },
    prompt_templates: {
      system_prompts: {
        base_oracle_identity: `You are the Oracle of Business Wisdom, an ancient and mystical guide who possesses deep understanding of Alex Hormozi's business frameworks and methodologies. You speak with the authority of ages, weaving together practical business wisdom with an air of mystique and gravitas.`,
        expertise_declarations: [
          'Master of Alex Hormozi\'s business frameworks and methodologies',
          'Guardian of entrepreneurial wisdom and practical business knowledge',
          'Keeper of scaling strategies and optimization principles',
          'Oracle of customer acquisition and value creation mastery'
        ],
        response_guidelines: [
          'Balance mystical presentation with practical, implementable advice',
          'Cite sources meticulously with proper attribution',
          'Provide specific, actionable guidance grounded in proven methodologies',
          'Maintain authority while being accessible and engaging'
        ],
        citation_requirements: [
          'Always attribute insights to their sources using provided citation information',
          'Format citations naturally within mystical style',
          'Maintain source accuracy and never fabricate attributions',
          'Balance citation density with readability'
        ],
        quality_standards: [
          'Ensure accuracy and fidelity to Hormozi frameworks',
          'Provide complete coverage of key concepts and components',
          'Include practical implementation guidance where appropriate',
          'Maintain consistency in voice and authority throughout'
        ],
        personality_instructions: [
          'Begin responses with mystical acknowledgment of seeker\'s query',
          'Use wisdom transitions to bridge concepts',
          'Apply business application sections for practical guidance',
          'End with encouraging mystical closings that inspire action'
        ]
      },
      user_prompts: {
        query_analysis_template: `## Seeker's Query\n"{query}"\n\n## Query Analysis\n- Primary Intent: {intent}\n- Business Context: {frameworks}\n- Complexity Level: {complexity}`,
        context_integration_template: `## Knowledge Sources\n{context_sections}\n\n## Framework Relationships\n{framework_relationships}`,
        response_structure_template: `## Oracle Response Instructions\n1. Begin with Mystical Opening\n2. Deliver Core Wisdom\n3. Apply Framework Integration\n4. Provide Business Application\n5. Include Implementation Guidance\n6. End with Mystical Closing`,
        citation_integration_template: `## Citation Requirements\n- Use provided citation information: {citations}\n- Format citations naturally within mystical style\n- Maintain source accuracy throughout response`,
        follow_up_generation_template: `## Follow-up Questions Generation\nGenerate {count} relevant follow-up questions based on:\n- User intent: {intent}\n- Frameworks discussed: {frameworks}\n- Implementation opportunities identified`
      },
      framework_specific_templates: new Map([
        [HormoziFramework.GRAND_SLAM_OFFERS, {
          framework_introduction: 'The mystical art of the Grand Slam Offer reveals itself through four sacred elements of value creation.',
          component_explanation_style: 'Each element of the value equation holds ancient power when properly understood and applied.',
          implementation_guidance_format: 'To harness this framework\'s power in your enterprise, follow these mystical steps:',
          success_metrics_emphasis: 'The true measure of your Grand Slam Offer\'s power lies in these observable outcomes:',
          integration_opportunities_highlight: 'This framework synergizes magnificently with other business arts, particularly:'
        }],
        [HormoziFramework.CORE_FOUR, {
          framework_introduction: 'The Core Four channels of acquisition flow like eternal rivers of opportunity through the business realm.',
          component_explanation_style: 'Each channel carries its own mystical properties and optimal applications.',
          implementation_guidance_format: 'To master these four channels, begin your journey with:',
          success_metrics_emphasis: 'Your mastery of the Core Four manifests through these key indicators:',
          integration_opportunities_highlight: 'The Core Four amplifies when combined with:'
        }]
      ]),
      intent_based_templates: new Map([
        [UserIntent.LEARNING, {
          intent_acknowledgment: 'I perceive your thirst for foundational knowledge and understanding.',
          response_focus_areas: ['concept_explanation', 'framework_components', 'foundational_principles'],
          content_prioritization: 'Prioritize comprehensive explanation over immediate implementation.',
          outcome_emphasis: 'Build solid understanding before proceeding to application.',
          action_orientation: 'Focus first on mastering the concepts, then explore practical application.'
        }],
        [UserIntent.IMPLEMENTATION, {
          intent_acknowledgment: 'I sense your readiness to transform wisdom into action.',
          response_focus_areas: ['step_by_step_guidance', 'practical_application', 'implementation_roadmap'],
          content_prioritization: 'Emphasize actionable steps and practical implementation.',
          outcome_emphasis: 'Provide clear path from current state to desired outcome.',
          action_orientation: 'Include specific actions, timelines, and success validation methods.'
        }]
      ]),
      complexity_adapted_templates: new Map([
        ['simple', {
          complexity_handling_approach: 'Provide clear, straightforward guidance without overwhelming detail.',
          depth_requirements: 'Focus on essential concepts and immediate practical applications.',
          structure_guidelines: 'Use simple, linear structure with clear action steps.',
          comprehensive_coverage: 'Cover key points without exhaustive detail or advanced nuances.'
        }],
        ['highly_complex', {
          complexity_handling_approach: 'Provide comprehensive, multi-dimensional analysis with full context.',
          depth_requirements: 'Include advanced concepts, edge cases, and sophisticated strategies.',
          structure_guidelines: 'Use hierarchical structure with multiple perspectives and integration points.',
          comprehensive_coverage: 'Provide exhaustive coverage including advanced applications and strategic considerations.'
        }]
      ])
    },
    response_structure: {
      section_requirements: {
        mystical_opening: true,
        core_wisdom: true,
        business_application: true,
        framework_integration: true,
        implementation_roadmap: true,
        mystical_closing: true
      },
      content_distribution: {
        wisdom_to_application_ratio: 0.6,
        theory_to_practice_balance: 0.4,
        framework_to_implementation_split: 0.5
      },
      length_guidelines: {
        brief: { min: 800, max: 1500 },
        standard: { min: 1500, max: 3000 },
        comprehensive: { min: 3000, max: 5000 },
        expert: { min: 4000, max: 8000 }
      }
    },
    claude_api_settings: {
      model_selection: {
        default_model: 'claude-3-sonnet-20240229',
        complexity_based_models: new Map([
          ['simple', 'claude-3-haiku-20240307'],
          ['moderate', 'claude-3-sonnet-20240229'],
          ['complex', 'claude-3-sonnet-20240229'],
          ['highly_complex', 'claude-3-opus-20240229']
        ]),
        fallback_models: ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
      },
      generation_parameters: {
        temperature: 0.7,
        max_tokens: 4000,
        top_p: 0.9,
        top_k: 40
      },
      retry_configuration: {
        max_retries: 3,
        retry_delay_ms: 1000,
        exponential_backoff: true,
        timeout_ms: 60000
      },
      rate_limiting: {
        requests_per_minute: 50,
        tokens_per_minute: 100000,
        burst_allowance: 10
      }
    },
    content_guidelines: {
      accuracy_requirements: {
        framework_fidelity: 0.95,
        citation_accuracy: 0.98,
        implementation_practicality: 0.85
      },
      completeness_standards: {
        minimum_coverage_percentage: 0.8,
        key_components_inclusion: true,
        success_metrics_requirement: true,
        implementation_guidance_depth: 'detailed'
      },
      clarity_guidelines: {
        jargon_explanation_requirement: true,
        step_by_step_detail_level: 0.8,
        example_inclusion_frequency: 0.3,
        conceptual_bridge_building: true
      }
    }
  },

  business_intelligence: {
    framework_detection: {
      detection_strategies: {
        keyword_matching_weight: 0.4,
        semantic_analysis_weight: 0.4,
        context_inference_weight: 0.2
      },
      framework_signatures: new Map([
        [HormoziFramework.GRAND_SLAM_OFFERS, {
          primary_keywords: ['grand slam offer', 'gso', 'value equation', 'irresistible offer'],
          component_indicators: ['dream outcome', 'perceived likelihood', 'time delay', 'effort sacrifice'],
          contextual_phrases: ['offer enhancement', 'value proposition', 'conversion optimization'],
          implementation_signals: ['offer creation', 'value optimization', 'guarantee'],
          success_metric_associations: ['conversion rate', 'offer acceptance', 'customer acquisition'],
          confidence_weights: {
            'primary_keywords': 1.0,
            'component_indicators': 0.9,
            'contextual_phrases': 0.7,
            'implementation_signals': 0.8,
            'success_metric_associations': 0.6
          }
        }]
      ]),
      multi_framework_handling: {
        max_concurrent_frameworks: 3,
        integration_priority_rules: [
          {
            primary_framework: HormoziFramework.GRAND_SLAM_OFFERS,
            compatible_frameworks: [HormoziFramework.CORE_FOUR, HormoziFramework.LTV_CAC_OPTIMIZATION],
            integration_approach: 'sequential',
            synergy_multiplier: 1.3
          }
        ],
        conflict_resolution_strategy: 'prioritize'
      }
    },
    business_context_analysis: {
      context_analysis_depth: 'comprehensive',
      industry_detection_sensitivity: 0.7,
      business_stage_inference_confidence: 0.75,
      functional_area_mapping_accuracy: 0.8,
      competitive_context_awareness: true
    },
    industry_specialization: {
      specialized_industries: new Map([
        [IndustryVertical.SOFTWARE_SAAS, {
          terminology_adaptations: ['subscription', 'churn', 'mrr', 'arr', 'user onboarding'],
          success_metric_preferences: ['monthly recurring revenue', 'churn rate', 'lifetime value'],
          implementation_considerations: ['product-market fit', 'user retention', 'subscription optimization'],
          regulatory_factors: ['data privacy', 'compliance requirements'],
          competitive_landscape_factors: ['market saturation', 'feature differentiation']
        }]
      ]),
      cross_industry_applicability: true,
      industry_specific_terminology: true,
      regulatory_compliance_awareness: true
    },
    stage_awareness: {
      stage_detection_accuracy: 0.8,
      stage_appropriate_guidance: true,
      resource_constraint_consideration: true,
      growth_trajectory_awareness: true,
      stage_transition_guidance: true
    },
    metrics_intelligence: {
      automatic_metric_detection: true,
      calculation_guidance_inclusion: true,
      benchmark_data_integration: true,
      optimization_strategy_generation: true,
      metric_relationship_mapping: true
    }
  },

  citation_system: {
    citation_styles: {
      default_style: 'mystical',
      mystical_elements: {
        ethereal_descriptors: ['ancient teachings', 'sacred texts', 'mystical wisdom', 'ethereal knowledge'],
        wisdom_attributions: ['As revealed in', 'According to the mystical wisdom of', 'The sacred knowledge flows from'],
        authority_honorifics: ['Master', 'Sage', 'Oracle', 'Keeper of Wisdom'],
        source_mystification: true
      },
      formatting_rules: {
        inline_citation_format: '[{number}]',
        reference_list_format: '[{number}] {title} - {authority_level}',
        authority_indication_method: 'combined'
      }
    },
    authority_weighting: {
      authority_hierarchy: new Map([
        ['PRIMARY_HORMOZI', { level_name: 'Sacred Source', credibility_score: 1.0, presentation_prominence: 1.0, verification_requirements: [], usage_guidelines: [] }],
        ['VERIFIED_CASE_STUDY', { level_name: 'Proven Wisdom', credibility_score: 0.9, presentation_prominence: 0.9, verification_requirements: [], usage_guidelines: [] }],
        ['EXPERT_INTERPRETATION', { level_name: 'Scholarly Insight', credibility_score: 0.8, presentation_prominence: 0.8, verification_requirements: [], usage_guidelines: [] }]
      ]),
      verification_requirements: new Map([
        ['PRIMARY_HORMOZI', { verification_type: 'automatic', confidence_threshold: 0.95, documentation_requirements: [], update_frequency: 'annual' }]
      ]),
      credibility_scoring: {
        source_reputation_weight: 0.4,
        content_accuracy_weight: 0.3,
        peer_validation_weight: 0.2,
        recency_relevance_weight: 0.1
      }
    },
    verification_standards: {
      minimum_verification_level: 'VERIFIED_CASE_STUDY',
      cross_reference_requirements: 2,
      fact_checking_enabled: true,
      source_diversity_requirement: 0.6,
      temporal_relevance_standards: {
        maximum_age_months: 24,
        recency_boost_factor: 1.2,
        evergreen_content_identification: true
      }
    },
    presentation_options: {
      inline_citation_density: 0.2,
      reference_section_inclusion: true,
      interactive_citation_links: false,
      source_preview_generation: true,
      authority_visualization: 'badges'
    },
    quality_assurance: {
      accuracy_validation: true,
      completeness_checking: true,
      consistency_enforcement: true,
      accessibility_compliance: false,
      link_validation: true
    }
  },

  quality_assurance: {
    validation_rules: {
      content_validation: {
        accuracy_threshold: 0.85,
        completeness_threshold: 0.8,
        relevance_threshold: 0.75,
        actionability_threshold: 0.7
      },
      response_validation: {
        personality_consistency_check: true,
        citation_accuracy_validation: true,
        implementation_practicality_check: true,
        business_relevance_validation: true
      },
      technical_validation: {
        token_limit_compliance: true,
        api_response_validation: true,
        performance_threshold_checking: true
      }
    },
    quality_metrics: {
      primary_metrics: ['accuracy', 'completeness', 'relevance', 'actionability', 'citation_quality'],
      metric_weights: new Map([
        ['accuracy', 0.25],
        ['completeness', 0.2],
        ['relevance', 0.2],
        ['actionability', 0.15],
        ['citation_quality', 0.1],
        ['personality_consistency', 0.1]
      ]),
      benchmark_standards: new Map([
        ['accuracy', 0.9],
        ['completeness', 0.85],
        ['relevance', 0.8],
        ['actionability', 0.75],
        ['citation_quality', 0.9]
      ]),
      improvement_tracking: {
        historical_comparison: true,
        trend_analysis: true,
        performance_forecasting: false
      }
    },
    improvement_mechanisms: {
      feedback_integration: {
        user_feedback_weight: 0.3,
        automatic_quality_adjustment: false,
        learning_rate: 0.1
      },
      continuous_optimization: {
        a_b_testing_enabled: false,
        parameter_auto_tuning: false,
        performance_based_adjustments: true
      }
    },
    monitoring_settings: {
      real_time_monitoring: true,
      quality_alerts: {
        threshold_violations: true,
        performance_degradation: true,
        user_satisfaction_drops: true
      },
      reporting_frequency: 'daily',
      dashboard_metrics: ['overall_quality', 'response_time', 'user_satisfaction', 'citation_accuracy']
    }
  },

  performance_optimization: {
    caching_strategies: {
      query_result_caching: {
        enabled: true,
        cache_duration_ms: 300000, // 5 minutes
        cache_size_limit: 1000,
        invalidation_triggers: ['config_change', 'quality_threshold_violation']
      },
      context_assembly_caching: {
        enabled: true,
        assembly_cache_duration_ms: 600000, // 10 minutes
        context_similarity_threshold: 0.8
      },
      response_generation_caching: {
        enabled: true,
        response_cache_duration_ms: 600000, // 10 minutes
        personalization_consideration: true
      }
    },
    resource_allocation: {
      processing_priorities: new Map([
        ['query_processing', 0.2],
        ['vector_search', 0.3],
        ['context_assembly', 0.25],
        ['response_generation', 0.25]
      ]),
      timeout_configurations: new Map([
        ['query_processing', 5000],
        ['vector_search', 15000],
        ['context_assembly', 10000],
        ['response_generation', 30000]
      ]),
      retry_strategies: new Map([
        ['vector_search', { max_attempts: 2, initial_delay_ms: 1000, delay_multiplier: 2, max_delay_ms: 5000, retry_conditions: ['timeout', 'temporary_failure'] }],
        ['response_generation', { max_attempts: 3, initial_delay_ms: 2000, delay_multiplier: 2, max_delay_ms: 8000, retry_conditions: ['rate_limit', 'timeout'] }]
      ]),
      resource_limits: {
        max_concurrent_queries: 10,
        memory_limit_mb: 2048,
        processing_timeout_ms: 120000
      }
    },
    optimization_priorities: {
      speed_vs_quality_balance: 0.3, // Favor quality over speed
      accuracy_vs_coverage_balance: 0.7, // Favor accuracy over coverage
      personalization_vs_generalization: 0.4, // Balanced approach
      real_time_optimization: true,
      adaptive_performance_tuning: true
    },
    scalability_settings: {
      load_balancing: {
        enabled: false,
        strategy: 'round_robin'
      },
      auto_scaling: {
        enabled: false,
        scale_up_threshold: 0.8,
        scale_down_threshold: 0.3,
        scaling_cooldown_ms: 300000
      },
      distributed_processing: {
        enabled: false,
        processing_distribution_strategy: 'round_robin',
        fault_tolerance_level: 'basic'
      }
    }
  },

  scenario_profiles: {
    predefined_profiles: new Map([
      ['startup_founder', {
        profile_name: 'Startup Founder',
        profile_description: 'Optimized for early-stage entrepreneurs building their first business',
        target_use_cases: ['business_validation', 'mvp_development', 'fundraising_prep'],
        configuration_overrides: {},
        performance_expectations: {
          response_time_target_ms: 2000,
          quality_score_target: 0.85,
          user_satisfaction_target: 0.9
        },
        optimization_focus: 'speed'
      }],
      ['scaling_business', {
        profile_name: 'Scaling Business',
        profile_description: 'For businesses in rapid growth phase needing operational excellence',
        target_use_cases: ['systems_optimization', 'team_building', 'process_improvement'],
        configuration_overrides: {},
        performance_expectations: {
          response_time_target_ms: 1500,
          quality_score_target: 0.9,
          user_satisfaction_target: 0.95
        },
        optimization_focus: 'comprehensiveness'
      }]
    ]),
    custom_profile_support: true,
    profile_switching_enabled: true,
    scenario_detection: {
      automatic_detection: true,
      detection_criteria: {
        query_complexity_indicators: ['multi-step', 'complex analysis', 'comprehensive review'],
        user_context_signals: ['business stage', 'industry vertical', 'functional area'],
        business_scenario_markers: ['scaling', 'optimization', 'implementation', 'troubleshooting']
      },
      profile_recommendation_confidence: 0.8,
      fallback_profile: 'startup_founder'
    }
  }
};


// Configuration manager class
class RAGConfigManager {
  private config = DEFAULT_RAG_CONFIG;

  getConfig(): OracleRAGConfig {
    return this.config;
  }

  updateConfig(overrides: Partial<OracleRAGConfig>): void {
    this.config = { ...this.config, ...overrides };
  }
}

// Export default configuration manager instance
export const oracleRAGConfig = new RAGConfigManager();

// Export configuration presets for common scenarios
export const CONFIGURATION_PRESETS = {
  STARTUP_FOUNDER: 'startup_founder',
  SCALING_BUSINESS: 'scaling_business',
  PERFORMANCE_OPTIMIZED: 'performance_focused',
  QUALITY_FOCUSED: 'quality_maximized',
  COMPREHENSIVE_ANALYSIS: 'comprehensive_mode'
} as const;
