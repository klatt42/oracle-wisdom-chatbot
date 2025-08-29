/**
 * Content Hierarchy Architecture for Oracle Knowledge Base
 * Alice Intelligence - Optimized business topic navigation
 */

import {
  HormoziFramework,
  BusinessLifecycleStage,
  IndustryVertical,
  FunctionalArea,
  FinancialMetricCategory,
  ContentRelationshipType,
  EnhancedBusinessMetadata
} from '../types/businessIntelligence';

// Hierarchical content organization
export interface ContentHierarchyNode {
  node_id: string;
  title: string;
  description: string;
  level: HierarchyLevel;
  priority_weight: number;        // 1-10 scale for ranking
  search_boost: number;          // Multiplier for search relevance
  
  // Business context
  business_impact: BusinessImpact;
  implementation_complexity: ImplementationComplexity;
  applicability_breadth: ApplicabilityBreadth;
  
  // Relationships
  parent_nodes: string[];
  child_nodes: string[];
  related_nodes: string[];
  prerequisite_nodes: string[];
  
  // Content mapping
  content_ids: string[];         // Associated Oracle knowledge IDs
  framework_components: string[];
  key_concepts: string[];
  
  // Navigation optimization
  common_entry_point: boolean;   // Frequently accessed starting point
  learning_pathway_anchor: boolean; // Key milestone in learning progression
  troubleshooting_hub: boolean;  // Common problem-solving destination
}

export enum HierarchyLevel {
  PHILOSOPHY = 1,        // Core business philosophy and mindset
  FRAMEWORK = 2,         // Major systematic approaches
  SYSTEM = 3,           // Operational systems and processes  
  TACTIC = 4,           // Specific implementation tactics
  TOOL = 5,             // Concrete tools and resources
  EXAMPLE = 6           // Case studies and specific examples
}

export enum BusinessImpact {
  TRANSFORMATIONAL = 'transformational',  // Fundamental business change
  HIGH = 'high',                          // Significant improvement
  MEDIUM = 'medium',                      // Moderate improvement
  LOW = 'low',                           // Incremental improvement
  SPECIALIZED = 'specialized'             // Niche application
}

export enum ImplementationComplexity {
  FOUNDATIONAL = 'foundational',         // Basic principles, easy to start
  STRAIGHTFORWARD = 'straightforward',   // Clear steps, moderate effort
  COMPLEX = 'complex',                   // Multiple components, coordination needed
  ADVANCED = 'advanced',                 // Requires expertise and resources
  EXPERT = 'expert'                      // Highly specialized implementation
}

export enum ApplicabilityBreadth {
  UNIVERSAL = 'universal',               // Applies to all businesses
  BROAD = 'broad',                      // Most business types
  TARGETED = 'targeted',                // Specific business phases/types
  SPECIALIZED = 'specialized',          // Niche applications
  CONTEXTUAL = 'contextual'             // Specific situations only
}

// Core Hormozi Framework Hierarchy
export class HormoziFrameworkHierarchy {
  
  // Tier 1: Foundational Philosophy (Level 1)
  static readonly TIER_1_PHILOSOPHY: ContentHierarchyNode[] = [
    {
      node_id: 'hormozi_business_philosophy',
      title: 'Hormozi Business Philosophy',
      description: 'Core mindset and principles underlying all Hormozi methodologies',
      level: HierarchyLevel.PHILOSOPHY,
      priority_weight: 10,
      search_boost: 2.0,
      business_impact: BusinessImpact.TRANSFORMATIONAL,
      implementation_complexity: ImplementationComplexity.FOUNDATIONAL,
      applicability_breadth: ApplicabilityBreadth.UNIVERSAL,
      parent_nodes: [],
      child_nodes: ['value_obsession', 'systems_thinking', 'data_driven_decisions'],
      related_nodes: [],
      prerequisite_nodes: [],
      content_ids: [],
      framework_components: ['mindset', 'principles', 'philosophy'],
      key_concepts: ['value creation', 'systematic approach', 'outcome focus'],
      common_entry_point: true,
      learning_pathway_anchor: true,
      troubleshooting_hub: false
    },
    {
      node_id: 'value_obsession',
      title: 'Value-First Business Approach',
      description: 'Prioritizing customer value creation above all else',
      level: HierarchyLevel.PHILOSOPHY,
      priority_weight: 9,
      search_boost: 1.8,
      business_impact: BusinessImpact.TRANSFORMATIONAL,
      implementation_complexity: ImplementationComplexity.FOUNDATIONAL,
      applicability_breadth: ApplicabilityBreadth.UNIVERSAL,
      parent_nodes: ['hormozi_business_philosophy'],
      child_nodes: ['grand_slam_offers', 'customer_centric_systems'],
      related_nodes: ['systems_thinking'],
      prerequisite_nodes: [],
      content_ids: [],
      framework_components: ['value_creation', 'customer_focus'],
      key_concepts: ['customer value', 'value proposition', 'value delivery'],
      common_entry_point: true,
      learning_pathway_anchor: true,
      troubleshooting_hub: false
    }
  ];

  // Tier 2: Core Frameworks (Level 2)
  static readonly TIER_2_FRAMEWORKS: ContentHierarchyNode[] = [
    {
      node_id: 'grand_slam_offers',
      title: 'Grand Slam Offers Framework',
      description: 'Creating irresistible value propositions that customers cannot refuse',
      level: HierarchyLevel.FRAMEWORK,
      priority_weight: 10,
      search_boost: 3.0,
      business_impact: BusinessImpact.TRANSFORMATIONAL,
      implementation_complexity: ImplementationComplexity.STRAIGHTFORWARD,
      applicability_breadth: ApplicabilityBreadth.UNIVERSAL,
      parent_nodes: ['value_obsession'],
      child_nodes: ['value_equation', 'offer_enhancement', 'guarantee_structuring'],
      related_nodes: ['pricing_psychology', 'customer_psychology'],
      prerequisite_nodes: ['value_obsession'],
      content_ids: [],
      framework_components: ['value_equation', 'problem_stacking', 'solution_delivery', 'guarantees', 'scarcity'],
      key_concepts: ['irresistible offers', 'value maximization', 'risk reversal'],
      common_entry_point: true,
      learning_pathway_anchor: true,
      troubleshooting_hub: true
    },
    {
      node_id: 'core_four_leads',
      title: 'Core Four Lead Generation',
      description: 'Systematic approach to generating leads through four primary channels',
      level: HierarchyLevel.FRAMEWORK,
      priority_weight: 10,
      search_boost: 3.0,
      business_impact: BusinessImpact.HIGH,
      implementation_complexity: ImplementationComplexity.COMPLEX,
      applicability_breadth: ApplicabilityBreadth.BROAD,
      parent_nodes: ['systematic_growth'],
      child_nodes: ['warm_outreach', 'cold_outreach', 'warm_content', 'cold_content'],
      related_nodes: ['lead_magnets', 'conversion_systems'],
      prerequisite_nodes: ['grand_slam_offers'],
      content_ids: [],
      framework_components: ['warm_outreach', 'cold_outreach', 'warm_content', 'cold_content'],
      key_concepts: ['lead generation', 'channel diversification', 'systematic acquisition'],
      common_entry_point: true,
      learning_pathway_anchor: true,
      troubleshooting_hub: true
    },
    {
      node_id: 'closer_framework',
      title: 'CLOSER Sales Framework',
      description: 'Systematic approach to sales conversations and closing',
      level: HierarchyLevel.FRAMEWORK,
      priority_weight: 9,
      search_boost: 2.5,
      business_impact: BusinessImpact.HIGH,
      implementation_complexity: ImplementationComplexity.STRAIGHTFORWARD,
      applicability_breadth: ApplicabilityBreadth.BROAD,
      parent_nodes: ['sales_mastery'],
      child_nodes: ['clarify', 'label', 'overview', 'sell', 'explain_away', 'reinforce'],
      related_nodes: ['objection_handling', 'sales_psychology'],
      prerequisite_nodes: ['grand_slam_offers'],
      content_ids: [],
      framework_components: ['clarify', 'label', 'overview', 'sell', 'explain_away', 'reinforce'],
      key_concepts: ['sales process', 'systematic closing', 'objection handling'],
      common_entry_point: false,
      learning_pathway_anchor: true,
      troubleshooting_hub: true
    }
  ];

  // Tier 3: Business Systems (Level 3)
  static readonly TIER_3_SYSTEMS: ContentHierarchyNode[] = [
    {
      node_id: 'ltv_cac_optimization',
      title: 'LTV/CAC Optimization System',
      description: 'Maximizing customer lifetime value while minimizing acquisition costs',
      level: HierarchyLevel.SYSTEM,
      priority_weight: 9,
      search_boost: 2.8,
      business_impact: BusinessImpact.HIGH,
      implementation_complexity: ImplementationComplexity.COMPLEX,
      applicability_breadth: ApplicabilityBreadth.BROAD,
      parent_nodes: ['unit_economics_mastery'],
      child_nodes: ['ltv_maximization', 'cac_reduction', 'retention_systems'],
      related_nodes: ['financial_modeling', 'customer_success'],
      prerequisite_nodes: ['basic_metrics_tracking'],
      content_ids: [],
      framework_components: ['ltv_calculation', 'cac_calculation', 'ratio_optimization', 'retention_strategies'],
      key_concepts: ['unit economics', 'customer value', 'acquisition efficiency'],
      common_entry_point: false,
      learning_pathway_anchor: true,
      troubleshooting_hub: true
    },
    {
      node_id: 'cash_flow_management',
      title: 'Cash Flow Management System',
      description: 'Optimizing cash flow timing and working capital management',
      level: HierarchyLevel.SYSTEM,
      priority_weight: 8,
      search_boost: 2.3,
      business_impact: BusinessImpact.HIGH,
      implementation_complexity: ImplementationComplexity.COMPLEX,
      applicability_breadth: ApplicabilityBreadth.BROAD,
      parent_nodes: ['financial_systems'],
      child_nodes: ['cash_flow_forecasting', 'working_capital_optimization', 'payment_terms_optimization'],
      related_nodes: ['unit_economics', 'financial_modeling'],
      prerequisite_nodes: ['basic_financial_literacy'],
      content_ids: [],
      framework_components: ['cash_flow_analysis', 'payment_optimization', 'working_capital'],
      key_concepts: ['cash flow', 'working capital', 'payment timing'],
      common_entry_point: false,
      learning_pathway_anchor: false,
      troubleshooting_hub: true
    }
  ];
}

// Learning Pathway Architecture
export class LearningPathwayBuilder {
  
  static buildPathwayForStage(stage: BusinessLifecycleStage): LearningPathway {
    switch (stage) {
      case BusinessLifecycleStage.STARTUP:
        return this.buildStartupPathway();
      case BusinessLifecycleStage.EARLY_SCALING:
        return this.buildScalingPathway();
      case BusinessLifecycleStage.SCALING:
        return this.buildScalingPathway();
      case BusinessLifecycleStage.GROWTH:
        return this.buildUniversalPathway();
      default:
        return this.buildUniversalPathway();
    }
  }
  
  private static buildStartupPathway(): LearningPathway {
    return {
      pathway_id: 'startup_success_pathway',
      title: 'Startup Success Pathway',
      description: 'Essential frameworks for startup foundation and early traction',
      target_stage: BusinessLifecycleStage.STARTUP,
      estimated_duration_weeks: 12,
      difficulty_progression: 'beginner_to_intermediate',
      
      pathway_nodes: [
        {
          sequence: 1,
          node_id: 'hormozi_business_philosophy',
          rationale: 'Foundation mindset and principles',
          estimated_weeks: 1,
          prerequisites_met: true,
          success_criteria: ['Understand value-first approach', 'Adopt systematic thinking']
        },
        {
          sequence: 2,
          node_id: 'target_market_identification',
          rationale: 'Define who you serve before creating offers',
          estimated_weeks: 2,
          prerequisites_met: true,
          success_criteria: ['Clear customer avatar', 'Validated pain points']
        },
        {
          sequence: 3,
          node_id: 'grand_slam_offers',
          rationale: 'Create compelling value propositions for market entry',
          estimated_weeks: 3,
          prerequisites_met: true,
          success_criteria: ['Irresistible offer created', 'Value equation optimized']
        },
        {
          sequence: 4,
          node_id: 'basic_lead_generation',
          rationale: 'Start with warm outreach and simple lead generation',
          estimated_weeks: 4,
          prerequisites_met: true,
          success_criteria: ['Consistent lead flow', 'Basic funnel operational']
        },
        {
          sequence: 5,
          node_id: 'simple_sales_process',
          rationale: 'Systematic approach to converting leads',
          estimated_weeks: 2,
          prerequisites_met: true,
          success_criteria: ['Repeatable sales process', 'Basic conversion tracking']
        }
      ],
      
      success_milestones: [
        'First paying customers acquired',
        'Positive unit economics validated',
        'Systematic sales process operational',
        'Foundation for scaling established'
      ],
      
      common_pitfalls: [
        'Skipping market validation',
        'Creating weak value propositions',
        'Neglecting systematic processes',
        'Focusing on tactics over fundamentals'
      ],
      
      next_pathways: ['early_scaling_pathway']
    };
  }
  
  private static buildScalingPathway(): LearningPathway {
    return {
      pathway_id: 'scaling_mastery_pathway',
      title: 'Business Scaling Mastery',
      description: 'Advanced systems for systematic business scaling',
      target_stage: BusinessLifecycleStage.SCALING,
      estimated_duration_weeks: 24,
      difficulty_progression: 'intermediate_to_advanced',
      
      pathway_nodes: [
        {
          sequence: 1,
          node_id: 'unit_economics_mastery',
          rationale: 'Master financial fundamentals before scaling',
          estimated_weeks: 2,
          prerequisites_met: true,
          success_criteria: ['LTV/CAC ratio >3:1', 'Payback period <12 months']
        },
        {
          sequence: 2,
          node_id: 'core_four_implementation',
          rationale: 'Systematic multi-channel lead generation',
          estimated_weeks: 8,
          prerequisites_met: true,
          success_criteria: ['All four channels operational', 'Channel attribution tracking']
        },
        {
          sequence: 3,
          node_id: 'team_building_systems',
          rationale: 'Scale through people and systems',
          estimated_weeks: 6,
          prerequisites_met: true,
          success_criteria: ['Hiring system operational', 'Performance management active']
        },
        {
          sequence: 4,
          node_id: 'operational_excellence',
          rationale: 'Optimize processes for efficiency',
          estimated_weeks: 6,
          prerequisites_met: true,
          success_criteria: ['Documented processes', 'Quality systems active']
        },
        {
          sequence: 5,
          node_id: 'advanced_metrics_tracking',
          rationale: 'Data-driven optimization and decision making',
          estimated_weeks: 2,
          prerequisites_met: true,
          success_criteria: ['Comprehensive dashboard', 'Regular optimization cycles']
        }
      ],
      
      success_milestones: [
        '10x revenue growth achieved',
        'Systematic scalability demonstrated',
        'Team operating independently',
        'Market leadership position established'
      ],
      
      common_pitfalls: [
        'Scaling too fast without systems',
        'Neglecting team development',
        'Losing focus on unit economics',
        'Sacrificing quality for growth'
      ],
      
      next_pathways: ['growth_optimization_pathway']
    };
  }
  
  private static buildUniversalPathway(): LearningPathway {
    return {
      pathway_id: 'universal_business_pathway',
      title: 'Universal Business Excellence',
      description: 'Core Hormozi principles applicable across all business stages',
      target_stage: BusinessLifecycleStage.STARTUP, // Default, but applicable to all
      estimated_duration_weeks: 16,
      difficulty_progression: 'beginner_to_advanced',
      
      pathway_nodes: [
        {
          sequence: 1,
          node_id: 'hormozi_business_philosophy',
          rationale: 'Universal foundation principles',
          estimated_weeks: 1,
          prerequisites_met: true,
          success_criteria: ['Mindset alignment', 'Value-first approach adopted']
        },
        {
          sequence: 2,
          node_id: 'grand_slam_offers',
          rationale: 'Universal value creation framework',
          estimated_weeks: 3,
          prerequisites_met: true,
          success_criteria: ['Compelling offers created', 'Value equation mastered']
        },
        {
          sequence: 3,
          node_id: 'systematic_lead_generation',
          rationale: 'Universal customer acquisition approach',
          estimated_weeks: 6,
          prerequisites_met: true,
          success_criteria: ['Multiple channels operational', 'Predictable lead flow']
        },
        {
          sequence: 4,
          node_id: 'unit_economics_optimization',
          rationale: 'Universal financial foundation',
          estimated_weeks: 3,
          prerequisites_met: true,
          success_criteria: ['Positive unit economics', 'Financial clarity']
        },
        {
          sequence: 5,
          node_id: 'systems_and_processes',
          rationale: 'Universal scalability foundation',
          estimated_weeks: 3,
          prerequisites_met: true,
          success_criteria: ['Documented systems', 'Process optimization']
        }
      ],
      
      success_milestones: [
        'Value-driven business model established',
        'Systematic customer acquisition operational',
        'Positive and improving unit economics',
        'Scalable systems foundation built'
      ],
      
      common_pitfalls: [
        'Trying to implement everything at once',
        'Ignoring business fundamentals',
        'Lacking systematic approach',
        'Focusing on tactics over strategy'
      ],
      
      next_pathways: ['stage_specific_pathways']
    };
  }
}

export interface LearningPathway {
  pathway_id: string;
  title: string;
  description: string;
  target_stage: BusinessLifecycleStage;
  estimated_duration_weeks: number;
  difficulty_progression: string;
  
  pathway_nodes: PathwayNode[];
  success_milestones: string[];
  common_pitfalls: string[];
  next_pathways: string[];
}

export interface PathwayNode {
  sequence: number;
  node_id: string;
  rationale: string;
  estimated_weeks: number;
  prerequisites_met: boolean;
  success_criteria: string[];
}

// Content Navigation Optimizer
export class ContentNavigationOptimizer {
  
  // Get optimal entry points based on user context
  static getEntryPoints(
    stage: BusinessLifecycleStage,
    industry: IndustryVertical,
    functionalArea: FunctionalArea
  ): ContentHierarchyNode[] {
    const allNodes = [
      ...HormoziFrameworkHierarchy.TIER_1_PHILOSOPHY,
      ...HormoziFrameworkHierarchy.TIER_2_FRAMEWORKS,
      ...HormoziFrameworkHierarchy.TIER_3_SYSTEMS
    ];
    
    return allNodes
      .filter(node => node.common_entry_point)
      .sort((a, b) => b.priority_weight - a.priority_weight)
      .slice(0, 5); // Top 5 entry points
  }
  
  // Get learning pathway recommendations
  static getPathwayRecommendations(
    currentContent: string,
    userStage: BusinessLifecycleStage,
    completedTopics: string[]
  ): string[] {
    const pathway = LearningPathwayBuilder.buildPathwayForStage(userStage);
    
    return pathway.pathway_nodes
      .filter(node => !completedTopics.includes(node.node_id))
      .map(node => node.node_id)
      .slice(0, 3); // Next 3 recommended topics
  }
  
  // Get troubleshooting hubs for problem-solving
  static getTroubleshootingHubs(): ContentHierarchyNode[] {
    const allNodes = [
      ...HormoziFrameworkHierarchy.TIER_2_FRAMEWORKS,
      ...HormoziFrameworkHierarchy.TIER_3_SYSTEMS
    ];
    
    return allNodes.filter(node => node.troubleshooting_hub);
  }
}

export default {
  HormoziFrameworkHierarchy,
  LearningPathwayBuilder,
  ContentNavigationOptimizer,
  HierarchyLevel,
  BusinessImpact,
  ImplementationComplexity,
  ApplicabilityBreadth
};