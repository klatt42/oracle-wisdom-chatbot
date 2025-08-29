/**
 * Business Intelligence Types for Oracle Knowledge Architecture
 * Alice Intelligence - Enhanced metadata schema for Hormozi content
 */

// Business phase classification beyond basic startup/scaling/optimization
export enum BusinessLifecycleStage {
  IDEATION = 'ideation',           // Business concept and market validation
  STARTUP = 'startup',             // 0-$1M ARR - Foundation building
  EARLY_SCALING = 'early_scaling', // $1M-$5M ARR - Initial systems
  SCALING = 'scaling',             // $5M-$25M ARR - Advanced systems
  GROWTH = 'growth',               // $25M-$100M ARR - Market expansion
  ENTERPRISE = 'enterprise',       // $100M+ ARR - Market leadership
  EXIT_PREP = 'exit_prep'          // Acquisition and legacy building
}

// Industry vertical classification for business context
export enum IndustryVertical {
  FITNESS_GYMS = 'fitness_gyms',
  SOFTWARE_SAAS = 'software_saas', 
  ECOMMERCE = 'ecommerce',
  PROFESSIONAL_SERVICES = 'professional_services',
  REAL_ESTATE = 'real_estate',
  MANUFACTURING = 'manufacturing',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  FINANCIAL_SERVICES = 'financial_services',
  RETAIL = 'retail',
  RESTAURANTS = 'restaurants',
  GENERAL = 'general'
}

// Functional business area classification
export enum FunctionalArea {
  MARKETING = 'marketing',           // Customer acquisition and branding
  SALES = 'sales',                   // Conversion and revenue generation
  OPERATIONS = 'operations',         // Systems and process management
  FINANCE = 'finance',               // Metrics, forecasting, investment
  LEADERSHIP = 'leadership',         // Team building and culture
  STRATEGY = 'strategy',             // Planning and competitive positioning
  PRODUCT = 'product',               // Development and optimization
  CUSTOMER_SUCCESS = 'customer_success' // Retention and expansion
}

// Hormozi-specific framework classification
export enum HormoziFramework {
  GRAND_SLAM_OFFERS = 'grand_slam_offers',
  CORE_FOUR = 'core_four',
  VALUE_EQUATION = 'value_equation',
  CLOSER_FRAMEWORK = 'closer_framework',
  LTV_CAC_OPTIMIZATION = 'ltv_cac_optimization',
  LEAD_MAGNETS = 'lead_magnets',
  PRICING_PSYCHOLOGY = 'pricing_psychology',
  CASH_FLOW_MANAGEMENT = 'cash_flow_management',
  TEAM_BUILDING = 'team_building',
  OPERATIONAL_EXCELLENCE = 'operational_excellence',
  ACQUISITION_STRATEGY = 'acquisition_strategy'
}

// Framework component breakdown
export interface FrameworkComponent {
  framework: HormoziFramework;
  component_name: string;
  component_description: string;
  implementation_order: number;
  prerequisites: string[];
  success_indicators: string[];
}

// Financial metric categorization
export enum FinancialMetricCategory {
  REVENUE = 'revenue',               // Top-line growth metrics
  COST = 'cost',                     // Expense and efficiency metrics
  PROFITABILITY = 'profitability',   // Margin and profit metrics
  GROWTH = 'growth',                 // Scaling and expansion metrics
  RETENTION = 'retention',           // Customer lifetime metrics
  EFFICIENCY = 'efficiency',         // Operational optimization metrics
  CASH_FLOW = 'cash_flow',          // Working capital and liquidity
  VALUATION = 'valuation'           // Business value metrics
}

// Comprehensive financial metric definition
export interface FinancialMetric {
  metric_id: string;
  metric_name: string;
  category: FinancialMetricCategory;
  calculation_formula: string;
  unit_of_measurement: string;
  
  // Hormozi-specific benchmarks
  hormozi_benchmarks: {
    poor: number;
    average: number;
    good: number;
    excellent: number;
  };
  
  // Industry variations
  industry_benchmarks: { [key in IndustryVertical]?: BenchmarkRange };
  
  // Business phase relevance
  phase_relevance: { [key in BusinessLifecycleStage]?: number }; // 0-1 relevance score
  
  // Associated Hormozi insights
  hormozi_insights: string[];
  optimization_strategies: string[];
  common_mistakes: string[];
  
  // Implementation context
  measurement_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  data_requirements: string[];
  automation_potential: 'low' | 'medium' | 'high';
}

export interface BenchmarkRange {
  poor: number;
  average: number;
  good: number;
  excellent: number;
  context_notes?: string;
}

// KPI categorization for business intelligence
export enum KPICategory {
  LEADING_INDICATORS = 'leading_indicators',     // Predictive metrics
  LAGGING_INDICATORS = 'lagging_indicators',     // Historical performance
  OPERATIONAL_KPI = 'operational_kpi',           // Day-to-day operations
  STRATEGIC_KPI = 'strategic_kpi',               // Long-term objectives
  FINANCIAL_KPI = 'financial_kpi',               // Money and profitability
  CUSTOMER_KPI = 'customer_kpi',                 // Customer-focused metrics
  TEAM_KPI = 'team_kpi',                         // People and performance
  COMPETITIVE_KPI = 'competitive_kpi'            // Market positioning
}

// Implementation timeline and resource estimation
export interface TimeEstimate {
  minimum_time: number;      // In days
  typical_time: number;      // Most common implementation time
  maximum_time: number;      // Worst-case scenario
  complexity_factors: string[];
  acceleration_strategies: string[];
}

export interface ResourceRequirement {
  resource_type: 'financial' | 'human' | 'technical' | 'time';
  resource_description: string;
  quantity_range: {
    minimum: number;
    typical: number;
    maximum: number;
  };
  unit: string; // e.g., 'USD', 'hours', 'FTE', 'months'
  criticality: 'essential' | 'important' | 'nice_to_have';
}

// Success criteria and measurement
export interface SuccessCriterion {
  criterion_name: string;
  measurement_method: string;
  target_value: number;
  measurement_unit: string;
  timeframe: string;
  validation_frequency: string;
}

// Source attribution and authority
export interface SourceAttribution {
  source_type: 'book' | 'video' | 'podcast' | 'interview' | 'case_study' | 'framework';
  primary_source: string;        // Main Hormozi content source
  secondary_sources: string[];   // Supporting or validating sources
  publication_date: Date;
  last_verified_date: Date;
  
  // Citation formatting
  citation_text: string;
  citation_url?: string;
  timestamp?: string;           // For video/audio content
  page_number?: number;         // For books/documents
  
  // Authority and reliability
  authority_level: AuthorityLevel;
  verification_status: VerificationStatus;
  contradiction_flags: string[]; // Any conflicting information found
}

export enum AuthorityLevel {
  PRIMARY_HORMOZI = 'primary_hormozi',           // Direct Hormozi content - highest authority
  HORMOZI_TEAM = 'hormozi_team',                 // Acquisition.com team content
  VERIFIED_CASE_STUDY = 'verified_case_study',   // Documented business results
  EXPERT_INTERPRETATION = 'expert_interpretation', // Business expert analysis
  COMMUNITY_VALIDATED = 'community_validated',   // Community-verified content
  UNVERIFIED = 'unverified'                      // Requires validation
}

export enum VerificationStatus {
  VERIFIED = 'verified',             // Confirmed accurate
  PENDING_VERIFICATION = 'pending',   // Awaiting fact-check
  CONFLICTING = 'conflicting',        // Contradictory information exists
  OUTDATED = 'outdated',             // Information may be obsolete
  UNVERIFIED = 'unverified'          // Not yet validated
}

// Content freshness and currency
export interface FreshnessScore {
  publication_recency: number;    // 0-1 score based on publication date
  market_relevance: number;       // 0-1 score based on current market conditions
  framework_evolution: number;    // 0-1 score based on framework updates
  overall_freshness: number;      // Combined freshness score
  next_review_date: Date;         // When to reassess freshness
}

// Business scenario mapping for contextual search
export enum BusinessScenario {
  LAUNCHING_NEW_PRODUCT = 'launching_new_product',
  SCALING_TEAM = 'scaling_team',
  IMPROVING_CONVERSION = 'improving_conversion',
  RAISING_CAPITAL = 'raising_capital',
  EXPANDING_MARKETS = 'expanding_markets',
  OPTIMIZING_COSTS = 'optimizing_costs',
  BUILDING_SYSTEMS = 'building_systems',
  CRISIS_MANAGEMENT = 'crisis_management',
  COMPETITIVE_RESPONSE = 'competitive_response',
  EXIT_PREPARATION = 'exit_preparation'
}

// User intent classification for query optimization
export enum UserIntent {
  LEARNING = 'learning',                 // Understanding concepts
  IMPLEMENTATION = 'implementation',     // How to execute
  TROUBLESHOOTING = 'troubleshooting',  // Solving problems
  BENCHMARKING = 'benchmarking',        // Comparing performance
  VALIDATION = 'validation',            // Confirming approach
  OPTIMIZATION = 'optimization',        // Improving existing
  RESEARCH = 'research',               // Gathering information
  PLANNING = 'planning'                // Strategic preparation
}

// Enhanced content metadata extending Elena's system
export interface EnhancedBusinessMetadata {
  // Elena's existing fields (maintained for compatibility)
  category_enum: string;
  business_phase: string;
  difficulty_level: string;
  frameworks: string[];
  key_concepts: string[];
  
  // Alice's business intelligence enhancements
  lifecycle_stage: BusinessLifecycleStage;
  industry_verticals: IndustryVertical[];
  functional_areas: FunctionalArea[];
  
  // Framework intelligence
  hormozi_frameworks: HormoziFramework[];
  framework_components: FrameworkComponent[];
  prerequisite_knowledge: string[];
  
  // Financial intelligence
  financial_metrics: FinancialMetric[];
  kpi_categories: KPICategory[];
  benchmark_data: { [key: string]: BenchmarkRange };
  
  // Implementation intelligence
  implementation_timeline: TimeEstimate;
  resource_requirements: ResourceRequirement[];
  success_criteria: SuccessCriterion[];
  risk_factors: string[];
  
  // Search and retrieval optimization
  business_scenarios: BusinessScenario[];
  user_intent_mapping: UserIntent[];
  search_keywords: string[];
  semantic_concepts: string[];
  
  // Authority and attribution
  source_attribution: SourceAttribution;
  content_freshness: FreshnessScore;
  cross_references: string[];          // Related content IDs
  validation_notes: string[];
}

// Query enhancement for business context
export interface BusinessQueryContext {
  original_query: string;
  inferred_intent: UserIntent;
  business_context: {
    likely_industry: IndustryVertical;
    likely_stage: BusinessLifecycleStage;
    functional_focus: FunctionalArea;
  };
  metric_references: string[];          // Financial metrics mentioned
  framework_indicators: HormoziFramework[];
  urgency_signals: string[];            // Words indicating time sensitivity
  implementation_readiness: number;     // 0-1 score for readiness to implement
}

// Search result enhancement
export interface EnhancedSearchResult {
  // Core content
  content_id: string;
  title: string;
  content_snippet: string;
  relevance_score: number;
  
  // Business intelligence
  business_metadata: EnhancedBusinessMetadata;
  
  // Context-specific enhancements
  implementation_pathway: string[];     // Next steps for implementation
  related_metrics: FinancialMetric[];   // Relevant business metrics
  success_examples: string[];          // Case studies or examples
  common_obstacles: string[];          // Typical implementation challenges
  
  // Citation and authority
  citation_text: string;
  authority_score: number;             // Combined authority and freshness
  verification_status: VerificationStatus;
}

// Content relationship types for graph navigation
export enum ContentRelationshipType {
  PREREQUISITE = 'prerequisite',           // Must understand first
  SEQUENCE = 'sequence',                   // Natural progression
  ALTERNATIVE = 'alternative',             // Different approach to same goal
  COMPLEMENT = 'complement',               // Works well together
  CONFLICT = 'conflict',                   // Contradictory approaches
  SPECIALIZATION = 'specialization',       // Specific application
  GENERALIZATION = 'generalization',       // Broader principle
  CASE_STUDY = 'case_study',              // Real-world example
  TOOL_FRAMEWORK = 'tool_framework',       // Implementation tool
  METRIC_VALIDATION = 'metric_validation'  // Measurement approach
}

export interface ContentRelationship {
  source_content_id: string;
  target_content_id: string;
  relationship_type: ContentRelationshipType;
  strength: number;                     // 0-1 relationship strength
  context_description: string;
  business_relevance: number;           // 0-1 business importance
  created_by: 'system' | 'manual' | 'ai_detected';
  validation_status: 'confirmed' | 'pending' | 'disputed';
}

const BusinessIntelligenceTypes = {
  BusinessLifecycleStage,
  IndustryVertical,
  FunctionalArea,
  HormoziFramework,
  FinancialMetricCategory,
  KPICategory,
  AuthorityLevel,
  VerificationStatus,
  BusinessScenario,
  UserIntent,
  ContentRelationshipType
};

export default BusinessIntelligenceTypes;