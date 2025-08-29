/**
 * Oracle Context Assembly Engine
 * Elena Execution - Intelligent context aggregation and organization
 * Enhanced with Alice Intelligence content hierarchy optimization
 */

import { 
  VectorSearchResult, 
  KnowledgeMetadata,
  EnhancedSearchResponse 
} from './oracleVectorSearch';
import { 
  BusinessQueryClassification,
  FrameworkRelevance 
} from '../lib/advancedBusinessQueryClassifier';
import { 
  FinancialMetricsExpansion 
} from '../lib/financialMetricsQueryExpansion';
import { 
  MultiHopReasoningChain 
} from '../lib/multiHopBusinessReasoning';
import {
  HormoziFramework,
  IndustryVertical,
  BusinessLifecycleStage,
  UserIntent,
  FinancialMetricCategory
} from '../types/businessIntelligence';

// Context assembly interfaces
export interface AssembledContext {
  assembly_id: string;
  original_query: string;
  total_sources: number;
  context_sections: ContextSection[];
  citation_chain: CitationChain;
  quality_metrics: ContextQualityMetrics;
  framework_relationships: FrameworkRelationship[];
  content_hierarchy: ContentHierarchy;
  token_optimization: TokenOptimization;
  assembly_metadata: AssemblyMetadata;
}

export interface ContextSection {
  section_id: string;
  section_type: SectionType;
  section_title: string;
  content: string;
  relevance_score: number;
  quality_score: number;
  business_priority: number;
  source_citations: Citation[];
  framework_alignment: FrameworkAlignment[];
  content_metadata: SectionMetadata;
  token_count: number;
}

export enum SectionType {
  PRIMARY_FRAMEWORK = 'primary_framework',
  SUPPORTING_FRAMEWORK = 'supporting_framework',
  FINANCIAL_METRICS = 'financial_metrics',
  IMPLEMENTATION_GUIDANCE = 'implementation_guidance',
  CASE_STUDIES = 'case_studies',
  FOUNDATIONAL_CONCEPTS = 'foundational_concepts',
  CROSS_REFERENCES = 'cross_references',
  EXPERT_INSIGHTS = 'expert_insights'
}

export interface Citation {
  citation_id: string;
  source_id: string;
  source_title: string;
  authority_level: string;
  verification_status: string;
  framework?: HormoziFramework;
  content_excerpt: string;
  relevance_score: number;
  page_reference?: string;
  timestamp: string;
}

export interface CitationChain {
  chain_id: string;
  primary_sources: Citation[];
  supporting_sources: Citation[];
  cross_references: CrossReference[];
  authority_distribution: AuthorityDistribution;
  source_diversity_score: number;
  citation_completeness: number;
}

export interface CrossReference {
  source_a: string;
  source_b: string;
  relationship_type: 'supports' | 'contradicts' | 'elaborates' | 'exemplifies' | 'prerequisites';
  relationship_strength: number;
  explanation: string;
}

export interface AuthorityDistribution {
  primary_hormozi: number;
  verified_case_studies: number;
  expert_interpretations: number;
  community_validated: number;
  unverified: number;
  authority_balance_score: number;
}

export interface FrameworkAlignment {
  framework: HormoziFramework;
  alignment_score: number;
  components_covered: string[];
  implementation_depth: 'surface' | 'moderate' | 'comprehensive' | 'expert';
  practical_applicability: number;
}

export interface FrameworkRelationship {
  relationship_id: string;
  primary_framework: HormoziFramework;
  related_frameworks: HormoziFramework[];
  relationship_type: 'sequential' | 'complementary' | 'foundational' | 'advanced' | 'alternative';
  integration_opportunities: IntegrationOpportunity[];
  synergy_potential: number;
}

export interface IntegrationOpportunity {
  opportunity_type: 'workflow_integration' | 'metric_combination' | 'strategy_layering' | 'process_enhancement';
  description: string;
  implementation_approach: string;
  expected_benefits: string[];
  complexity_level: 'simple' | 'moderate' | 'complex' | 'advanced';
}

export interface ContentHierarchy {
  hierarchy_structure: HierarchyNode[];
  information_flow: InformationFlow[];
  dependency_map: DependencyMapping[];
  learning_progression: LearningPath[];
  implementation_sequence: ImplementationStep[];
}

export interface HierarchyNode {
  node_id: string;
  node_type: 'concept' | 'framework' | 'implementation' | 'case_study' | 'metric';
  title: string;
  content_summary: string;
  importance_level: 'foundational' | 'core' | 'advanced' | 'specialized';
  prerequisites: string[];
  children: string[];
  section_references: string[];
}

export interface InformationFlow {
  flow_id: string;
  source_node: string;
  target_node: string;
  flow_type: 'builds_upon' | 'applies_to' | 'exemplifies' | 'measures' | 'optimizes';
  strength: number;
  explanation: string;
}

export interface DependencyMapping {
  dependent_concept: string;
  prerequisite_concepts: string[];
  dependency_strength: number;
  learning_order: number;
}

export interface LearningPath {
  path_id: string;
  path_name: string;
  target_outcome: string;
  progression_steps: ProgressionStep[];
  estimated_complexity: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  time_investment: string;
}

export interface ProgressionStep {
  step_number: number;
  step_title: string;
  learning_objectives: string[];
  content_sections: string[];
  validation_criteria: string[];
  next_step_prerequisites: string[];
}

export interface ImplementationStep {
  step_id: string;
  step_title: string;
  step_description: string;
  step_type: 'preparation' | 'execution' | 'validation' | 'optimization';
  required_resources: string[];
  success_criteria: string[];
  common_challenges: string[];
  mitigation_strategies: string[];
  related_sections: string[];
}

export interface SectionMetadata {
  content_type: string;
  complexity_level: string;
  implementation_readiness: number;
  business_impact: 'low' | 'medium' | 'high' | 'critical';
  time_to_implement: string;
  resource_requirements: string[];
  success_indicators: string[];
}

export interface ContextQualityMetrics {
  overall_quality: number;
  content_coherence: number;
  source_authority: number;
  framework_coverage: number;
  implementation_completeness: number;
  citation_accuracy: number;
  information_density: number;
  business_relevance: number;
  actionability_score: number;
}

export interface TokenOptimization {
  total_tokens: number;
  context_window_utilization: number;
  optimization_applied: OptimizationTechnique[];
  content_compression_ratio: number;
  quality_preservation_score: number;
  truncation_points: TruncationPoint[];
}

export interface OptimizationTechnique {
  technique_name: string;
  tokens_saved: number;
  quality_impact: number;
  description: string;
}

export interface TruncationPoint {
  section_id: string;
  original_tokens: number;
  final_tokens: number;
  truncation_method: string;
  content_preserved: number;
}

export interface AssemblyMetadata {
  assembly_timestamp: string;
  processing_time_ms: number;
  source_processing_stats: SourceProcessingStats;
  quality_filters_applied: QualityFilter[];
  optimization_strategies: string[];
  content_transformation_log: TransformationLog[];
}

export interface SourceProcessingStats {
  sources_received: number;
  sources_processed: number;
  sources_filtered: number;
  duplicates_removed: number;
  quality_failures: number;
  token_budget_limitations: number;
}

export interface QualityFilter {
  filter_name: string;
  filter_criteria: Record<string, any>;
  sources_affected: number;
  quality_improvement: number;
}

export interface TransformationLog {
  transformation_type: string;
  input_description: string;
  output_description: string;
  quality_change: number;
  token_change: number;
}

// Assembly configuration
export interface AssemblyConfiguration {
  max_context_tokens: number;
  min_section_quality: number;
  max_sections: number;
  prioritize_frameworks: boolean;
  include_citations: boolean;
  enable_cross_references: boolean;
  framework_depth: 'surface' | 'comprehensive' | 'expert';
  content_optimization: 'speed' | 'balanced' | 'quality';
}

// Main Oracle Context Assembly Engine
export class OracleContextAssemblyEngine {
  private readonly DEFAULT_CONFIG: AssemblyConfiguration = {
    max_context_tokens: 100000, // Conservative Claude limit
    min_section_quality: 0.6,
    max_sections: 12,
    prioritize_frameworks: true,
    include_citations: true,
    enable_cross_references: true,
    framework_depth: 'comprehensive',
    content_optimization: 'balanced'
  };

  private frameworkHierarchy: Map<HormoziFramework, FrameworkMetadata> = new Map();
  private contentDeduplicator: ContentDeduplicator = new ContentDeduplicator();
  private tokenCounter: TokenCounter = new TokenCounter();

  constructor() {
    this.initializeFrameworkHierarchy();
  }

  // Main context assembly method
  async assembleContext(
    searchResponse: EnhancedSearchResponse,
    queryClassification: BusinessQueryClassification,
    financialExpansion?: FinancialMetricsExpansion,
    reasoningChain?: MultiHopReasoningChain,
    config?: Partial<AssemblyConfiguration>
  ): Promise<AssembledContext> {

    const assemblyConfig = { ...this.DEFAULT_CONFIG, ...config };
    const assemblyId = this.generateAssemblyId();
    const startTime = Date.now();

    console.log(`🔧 Assembling Oracle context: ${searchResponse.search_results.length} sources`);

    try {
      // Step 1: Filter and preprocess sources
      const qualifiedSources = await this.filterAndPreprocessSources(
        searchResponse.search_results,
        queryClassification,
        assemblyConfig
      );

      // Step 2: Detect framework relationships
      const frameworkRelationships = await this.detectFrameworkRelationships(
        qualifiedSources,
        queryClassification.business_context.framework_relevance
      );

      // Step 3: Create intelligent content sections
      const contextSections = await this.createIntelligentSections(
        qualifiedSources,
        queryClassification,
        frameworkRelationships,
        assemblyConfig
      );

      // Step 4: Build comprehensive citation chain
      const citationChain = await this.buildCitationChain(
        contextSections,
        qualifiedSources,
        assemblyConfig
      );

      // Step 5: Establish content hierarchy
      const contentHierarchy = await this.establishContentHierarchy(
        contextSections,
        frameworkRelationships,
        queryClassification
      );

      // Step 6: Optimize for token limits
      const optimizedSections = await this.optimizeForTokenLimits(
        contextSections,
        assemblyConfig
      );

      // Step 7: Calculate quality metrics
      const qualityMetrics = await this.calculateContextQuality(
        optimizedSections,
        citationChain,
        queryClassification
      );

      // Step 8: Generate token optimization report
      const tokenOptimization = this.generateTokenOptimization(
        contextSections,
        optimizedSections,
        assemblyConfig
      );

      const assemblyTime = Date.now() - startTime;
      const assemblyMetadata = this.generateAssemblyMetadata(
        searchResponse.search_results,
        qualifiedSources,
        assemblyTime,
        assemblyConfig
      );

      const assembledContext: AssembledContext = {
        assembly_id: assemblyId,
        original_query: searchResponse.original_query,
        total_sources: qualifiedSources.length,
        context_sections: optimizedSections,
        citation_chain: citationChain,
        quality_metrics: qualityMetrics,
        framework_relationships: frameworkRelationships,
        content_hierarchy: contentHierarchy,
        token_optimization: tokenOptimization,
        assembly_metadata: assemblyMetadata
      };

      console.log(`✅ Context assembled: ${optimizedSections.length} sections, ${tokenOptimization.total_tokens} tokens`);
      return assembledContext;

    } catch (error) {
      console.error('❌ Context assembly failed:', error);
      throw error;
    }
  }

  // Step 1: Filter and preprocess sources
  private async filterAndPreprocessSources(
    searchResults: VectorSearchResult[],
    queryClassification: BusinessQueryClassification,
    config: AssemblyConfiguration
  ): Promise<VectorSearchResult[]> {

    let qualifiedSources: VectorSearchResult[] = [];

    // Quality filtering
    qualifiedSources = searchResults.filter(result => 
      result.quality_score >= config.min_section_quality &&
      result.relevance_score >= config.min_section_quality
    );

    // Deduplication
    qualifiedSources = this.contentDeduplicator.removeDuplicates(qualifiedSources);

    // Authority-based filtering
    qualifiedSources = this.filterByAuthority(qualifiedSources, queryClassification);

    // Framework prioritization if enabled
    if (config.prioritize_frameworks) {
      qualifiedSources = this.prioritizeFrameworkContent(
        qualifiedSources, 
        queryClassification.business_context.framework_relevance
      );
    }

    // Limit by configuration
    qualifiedSources = qualifiedSources.slice(0, config.max_sections * 2); // Allow for section consolidation

    console.log(`📋 Sources filtered: ${searchResults.length} → ${qualifiedSources.length}`);
    return qualifiedSources;
  }

  // Step 2: Detect framework relationships
  private async detectFrameworkRelationships(
    sources: VectorSearchResult[],
    frameworkRelevance: FrameworkRelevance[]
  ): Promise<FrameworkRelationship[]> {

    const relationships: FrameworkRelationship[] = [];
    const detectedFrameworks = this.getDetectedFrameworks(sources);

    for (const primaryFramework of detectedFrameworks) {
      const relatedFrameworks = detectedFrameworks.filter(f => f !== primaryFramework);
      
      if (relatedFrameworks.length > 0) {
        const relationship: FrameworkRelationship = {
          relationship_id: this.generateRelationshipId(),
          primary_framework: primaryFramework,
          related_frameworks: relatedFrameworks,
          relationship_type: this.determineRelationshipType(primaryFramework, relatedFrameworks),
          integration_opportunities: this.findIntegrationOpportunities(primaryFramework, relatedFrameworks, sources),
          synergy_potential: this.calculateSynergyPotential(primaryFramework, relatedFrameworks)
        };

        relationships.push(relationship);
      }
    }

    return relationships;
  }

  // Step 3: Create intelligent content sections
  private async createIntelligentSections(
    sources: VectorSearchResult[],
    queryClassification: BusinessQueryClassification,
    frameworkRelationships: FrameworkRelationship[],
    config: AssemblyConfiguration
  ): Promise<ContextSection[]> {

    const sections: ContextSection[] = [];
    const userIntent = queryClassification.primary_intent.intent_type;

    // Section 1: Primary Framework Content (if applicable)
    const primaryFramework = this.identifyPrimaryFramework(queryClassification, sources);
    if (primaryFramework) {
      const frameworkSection = await this.createFrameworkSection(
        primaryFramework,
        sources,
        SectionType.PRIMARY_FRAMEWORK,
        config
      );
      if (frameworkSection) sections.push(frameworkSection);
    }

    // Section 2: Supporting Framework Content
    const supportingFrameworks = this.identifySupportingFrameworks(queryClassification, sources, primaryFramework);
    for (const framework of supportingFrameworks.slice(0, 2)) { // Limit supporting frameworks
      const supportSection = await this.createFrameworkSection(
        framework,
        sources,
        SectionType.SUPPORTING_FRAMEWORK,
        config
      );
      if (supportSection) sections.push(supportSection);
    }

    // Section 3: Financial Metrics Content (if relevant)
    if (queryClassification.business_context.financial_focus.length > 0) {
      const metricsSection = await this.createFinancialMetricsSection(
        sources,
        queryClassification.business_context.financial_focus,
        config
      );
      if (metricsSection) sections.push(metricsSection);
    }

    // Section 4: Implementation Guidance (for implementation intent)
    if (userIntent === UserIntent.IMPLEMENTATION || userIntent === UserIntent.OPTIMIZATION) {
      const implementationSection = await this.createImplementationSection(
        sources,
        queryClassification,
        config
      );
      if (implementationSection) sections.push(implementationSection);
    }

    // Section 5: Case Studies and Examples
    const caseStudySection = await this.createCaseStudySection(
      sources,
      queryClassification,
      config
    );
    if (caseStudySection) sections.push(caseStudySection);

    // Section 6: Foundational Concepts (for learning intent)
    if (userIntent === UserIntent.LEARNING || userIntent === UserIntent.RESEARCH) {
      const foundationalSection = await this.createFoundationalSection(
        sources,
        queryClassification,
        config
      );
      if (foundationalSection) sections.push(foundationalSection);
    }

    // Section 7: Expert Insights
    const expertSection = await this.createExpertInsightsSection(
      sources,
      queryClassification,
      config
    );
    if (expertSection) sections.push(expertSection);

    // Section 8: Cross-References (if enabled)
    if (config.enable_cross_references && frameworkRelationships.length > 0) {
      const crossRefSection = await this.createCrossReferenceSection(
        frameworkRelationships,
        sources,
        config
      );
      if (crossRefSection) sections.push(crossRefSection);
    }

    // Sort sections by business priority and relevance
    return sections
      .sort((a, b) => (b.business_priority * b.relevance_score) - (a.business_priority * a.relevance_score))
      .slice(0, config.max_sections);
  }

  // Framework section creation
  private async createFrameworkSection(
    framework: HormoziFramework,
    sources: VectorSearchResult[],
    sectionType: SectionType,
    config: AssemblyConfiguration
  ): Promise<ContextSection | null> {

    const frameworkSources = sources.filter(s => s.metadata.framework === framework);
    if (frameworkSources.length === 0) return null;

    // Aggregate content intelligently
    const aggregatedContent = await this.aggregateFrameworkContent(frameworkSources, framework, config);
    
    // Create citations
    const citations = this.createCitations(frameworkSources);

    // Calculate framework alignment
    const frameworkAlignment = this.calculateFrameworkAlignment(frameworkSources, framework);

    const section: ContextSection = {
      section_id: this.generateSectionId(),
      section_type: sectionType,
      section_title: this.generateFrameworkTitle(framework, sectionType),
      content: aggregatedContent.content,
      relevance_score: this.calculateSectionRelevance(frameworkSources),
      quality_score: this.calculateSectionQuality(frameworkSources),
      business_priority: this.calculateBusinessPriority(framework, sectionType),
      source_citations: citations,
      framework_alignment: [frameworkAlignment],
      content_metadata: {
        content_type: 'framework',
        complexity_level: this.assessComplexityLevel(frameworkSources),
        implementation_readiness: aggregatedContent.implementationReadiness,
        business_impact: this.assessBusinessImpact(framework),
        time_to_implement: aggregatedContent.timeToImplement,
        resource_requirements: aggregatedContent.resourceRequirements,
        success_indicators: aggregatedContent.successIndicators
      },
      token_count: this.tokenCounter.count(aggregatedContent.content)
    };

    return section;
  }

  // Financial metrics section creation
  private async createFinancialMetricsSection(
    sources: VectorSearchResult[],
    financialFocus: any[],
    config: AssemblyConfiguration
  ): Promise<ContextSection | null> {

    const metricSources = sources.filter(s => 
      s.metadata.financial_metrics?.some(metric => 
        financialFocus.some(focus => focus.specific_metrics.includes(metric))
      )
    );

    if (metricSources.length === 0) return null;

    const aggregatedContent = await this.aggregateFinancialContent(metricSources, financialFocus, config);
    const citations = this.createCitations(metricSources);

    const section: ContextSection = {
      section_id: this.generateSectionId(),
      section_type: SectionType.FINANCIAL_METRICS,
      section_title: 'Financial Metrics and KPIs',
      content: aggregatedContent.content,
      relevance_score: this.calculateSectionRelevance(metricSources),
      quality_score: this.calculateSectionQuality(metricSources),
      business_priority: 0.9, // High priority for financial metrics
      source_citations: citations,
      framework_alignment: [],
      content_metadata: {
        content_type: 'financial_metrics',
        complexity_level: 'intermediate',
        implementation_readiness: aggregatedContent.implementationReadiness,
        business_impact: 'high',
        time_to_implement: aggregatedContent.timeToImplement,
        resource_requirements: aggregatedContent.resourceRequirements,
        success_indicators: aggregatedContent.successIndicators
      },
      token_count: this.tokenCounter.count(aggregatedContent.content)
    };

    return section;
  }

  // Step 4: Build comprehensive citation chain
  private async buildCitationChain(
    sections: ContextSection[],
    sources: VectorSearchResult[],
    config: AssemblyConfiguration
  ): Promise<CitationChain> {

    if (!config.include_citations) {
      return {
        chain_id: this.generateChainId(),
        primary_sources: [],
        supporting_sources: [],
        cross_references: [],
        authority_distribution: this.calculateAuthorityDistribution([]),
        source_diversity_score: 0,
        citation_completeness: 0
      };
    }

    // Collect all citations from sections
    const allCitations: Citation[] = sections.flatMap(section => section.source_citations);

    // Categorize citations
    const primarySources = allCitations.filter(c => 
      c.authority_level === 'PRIMARY_HORMOZI' || c.relevance_score > 0.8
    );
    
    const supportingSources = allCitations.filter(c => !primarySources.includes(c));

    // Find cross-references between sources
    const crossReferences = this.findCrossReferences(allCitations, sources);

    // Calculate metrics
    const authorityDistribution = this.calculateAuthorityDistribution(allCitations);
    const sourceDiversityScore = this.calculateSourceDiversity(allCitations);
    const citationCompleteness = this.calculateCitationCompleteness(sections, allCitations);

    return {
      chain_id: this.generateChainId(),
      primary_sources: primarySources,
      supporting_sources: supportingSources,
      cross_references: crossReferences,
      authority_distribution: authorityDistribution,
      source_diversity_score: sourceDiversityScore,
      citation_completeness: citationCompleteness
    };
  }

  // Step 5: Establish content hierarchy
  private async establishContentHierarchy(
    sections: ContextSection[],
    frameworkRelationships: FrameworkRelationship[],
    queryClassification: BusinessQueryClassification
  ): Promise<ContentHierarchy> {

    // Create hierarchy nodes from sections
    const hierarchyNodes = this.createHierarchyNodes(sections);

    // Establish information flow
    const informationFlow = this.establishInformationFlow(hierarchyNodes, frameworkRelationships);

    // Create dependency mapping
    const dependencyMap = this.createDependencyMapping(hierarchyNodes, informationFlow);

    // Generate learning progression
    const learningProgression = this.generateLearningProgression(
      hierarchyNodes, 
      dependencyMap, 
      queryClassification.primary_intent
    );

    // Create implementation sequence
    const implementationSequence = this.createImplementationSequence(
      hierarchyNodes, 
      frameworkRelationships
    );

    return {
      hierarchy_structure: hierarchyNodes,
      information_flow: informationFlow,
      dependency_map: dependencyMap,
      learning_progression: learningProgression,
      implementation_sequence: implementationSequence
    };
  }

  // Step 6: Token optimization
  private async optimizeForTokenLimits(
    sections: ContextSection[],
    config: AssemblyConfiguration
  ): Promise<ContextSection[]> {

    const currentTokens = sections.reduce((total, section) => total + section.token_count, 0);
    
    if (currentTokens <= config.max_context_tokens) {
      return sections; // No optimization needed
    }

    console.log(`🔧 Optimizing tokens: ${currentTokens} → ${config.max_context_tokens}`);

    const optimizedSections: ContextSection[] = [];
    let remainingTokens = config.max_context_tokens;

    // Priority-based selection and truncation
    const sortedSections = sections.sort((a, b) => 
      (b.business_priority * b.relevance_score * b.quality_score) - 
      (a.business_priority * a.relevance_score * a.quality_score)
    );

    for (const section of sortedSections) {
      if (remainingTokens <= 0) break;

      if (section.token_count <= remainingTokens) {
        // Include full section
        optimizedSections.push(section);
        remainingTokens -= section.token_count;
      } else {
        // Truncate section intelligently
        const truncatedSection = await this.truncateSection(section, remainingTokens);
        if (truncatedSection && truncatedSection.token_count > 100) { // Minimum viable section
          optimizedSections.push(truncatedSection);
          remainingTokens -= truncatedSection.token_count;
        }
      }
    }

    return optimizedSections;
  }

  // Intelligent section truncation
  private async truncateSection(
    section: ContextSection,
    maxTokens: number
  ): Promise<ContextSection | null> {

    if (maxTokens < 100) return null; // Not worth truncating

    // Preserve key content based on section type
    let truncatedContent = '';
    const lines = section.content.split('\n');
    let currentTokens = 0;

    // Always preserve title/header
    const header = lines[0];
    truncatedContent = header + '\n';
    currentTokens += this.tokenCounter.count(header);

    // Add content line by line until token limit
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const lineTokens = this.tokenCounter.count(line);
      
      if (currentTokens + lineTokens + 50 > maxTokens) { // Reserve 50 tokens for truncation notice
        truncatedContent += '\n[Content truncated for length - additional details available in full context]\n';
        break;
      }
      
      truncatedContent += line + '\n';
      currentTokens += lineTokens;
    }

    return {
      ...section,
      content: truncatedContent,
      token_count: this.tokenCounter.count(truncatedContent)
    };
  }

  // Content aggregation methods
  private async aggregateFrameworkContent(
    sources: VectorSearchResult[],
    framework: HormoziFramework,
    config: AssemblyConfiguration
  ): Promise<AggregatedContent> {

    const sortedSources = sources.sort((a, b) => 
      (b.quality_score * b.relevance_score) - (a.quality_score * a.relevance_score)
    );

    let content = `# ${framework} Framework\n\n`;
    
    // Get framework metadata for structure
    const frameworkMeta = this.frameworkHierarchy.get(framework);
    if (frameworkMeta) {
      content += `## Framework Overview\n${frameworkMeta.overview}\n\n`;
      
      // Add component details
      content += `## Key Components\n`;
      for (const component of frameworkMeta.components) {
        const componentSources = sortedSources.filter(s => 
          s.content.toLowerCase().includes(component.name.toLowerCase())
        );
        
        if (componentSources.length > 0) {
          content += `### ${component.name}\n`;
          content += `${component.description}\n\n`;
          
          // Add best source content for this component
          const bestSource = componentSources[0];
          const excerpt = this.extractRelevantExcerpt(bestSource.content, component.name, 300);
          content += `${excerpt}\n\n`;
        }
      }
    }

    // Add implementation guidance if available
    const implementationSources = sortedSources.filter(s => 
      s.content.toLowerCase().includes('implement') || 
      s.content.toLowerCase().includes('apply') ||
      s.content.toLowerCase().includes('execute')
    );

    if (implementationSources.length > 0) {
      content += `## Implementation Guidance\n`;
      const implContent = this.extractRelevantExcerpt(implementationSources[0].content, 'implementation', 400);
      content += `${implContent}\n\n`;
    }

    return {
      content: content,
      implementationReadiness: this.assessImplementationReadiness(sources),
      timeToImplement: this.estimateTimeToImplement(framework, sources),
      resourceRequirements: this.extractResourceRequirements(sources),
      successIndicators: this.extractSuccessIndicators(sources)
    };
  }

  private async aggregateFinancialContent(
    sources: VectorSearchResult[],
    financialFocus: any[],
    config: AssemblyConfiguration
  ): Promise<AggregatedContent> {

    let content = `# Financial Metrics and KPIs\n\n`;

    for (const focus of financialFocus) {
      content += `## ${focus.metric_category} Metrics\n\n`;
      
      for (const metric of focus.specific_metrics) {
        const metricSources = sources.filter(s => 
          s.content.toLowerCase().includes(metric.toLowerCase()) ||
          s.metadata.financial_metrics?.includes(metric)
        );

        if (metricSources.length > 0) {
          content += `### ${metric}\n`;
          
          // Definition and calculation
          const definitionSource = metricSources.find(s => 
            s.content.toLowerCase().includes('formula') ||
            s.content.toLowerCase().includes('calculate') ||
            s.content.toLowerCase().includes('definition')
          );

          if (definitionSource) {
            const excerpt = this.extractRelevantExcerpt(definitionSource.content, metric, 200);
            content += `${excerpt}\n\n`;
          }

          // Optimization insights
          const optimizationSource = metricSources.find(s => 
            s.content.toLowerCase().includes('improve') ||
            s.content.toLowerCase().includes('optimize') ||
            s.content.toLowerCase().includes('increase')
          );

          if (optimizationSource) {
            content += `**Optimization Strategies:**\n`;
            const optExcerpt = this.extractRelevantExcerpt(optimizationSource.content, 'improve', 150);
            content += `${optExcerpt}\n\n`;
          }
        }
      }
    }

    return {
      content: content,
      implementationReadiness: 0.8,
      timeToImplement: 'Varies by metric complexity',
      resourceRequirements: ['Analytics tools', 'Data collection systems', 'Reporting infrastructure'],
      successIndicators: ['Accurate metric tracking', 'Trend analysis capability', 'Performance improvement']
    };
  }

  // Utility methods
  private initializeFrameworkHierarchy(): void {
    this.frameworkHierarchy.set(HormoziFramework.GRAND_SLAM_OFFERS, {
      overview: 'Framework for creating irresistible offers that dramatically increase conversion rates',
      components: [
        {
          name: 'Dream Outcome',
          description: 'The ultimate result or transformation the customer desires'
        },
        {
          name: 'Perceived Likelihood of Achievement',
          description: 'Customer\'s belief in their ability to achieve the outcome'
        },
        {
          name: 'Time Delay',
          description: 'How long it takes to achieve the desired outcome'
        },
        {
          name: 'Effort and Sacrifice',
          description: 'What the customer must give up or invest to get the outcome'
        }
      ],
      implementation_complexity: 'intermediate',
      business_impact: 'high'
    });

    this.frameworkHierarchy.set(HormoziFramework.CORE_FOUR, {
      overview: 'The four primary customer acquisition channels for consistent lead generation',
      components: [
        {
          name: 'Warm Outreach',
          description: 'Direct contact with people who know you or your business'
        },
        {
          name: 'Cold Outreach',
          description: 'Direct contact with people who don\'t know you yet'
        },
        {
          name: 'Warm Content',
          description: 'Content marketing to your existing audience'
        },
        {
          name: 'Cold Content',
          description: 'Content marketing to attract new prospects'
        }
      ],
      implementation_complexity: 'beginner',
      business_impact: 'high'
    });

    // Add other frameworks...
  }

  private extractRelevantExcerpt(content: string, keyword: string, maxLength: number): string {
    const sentences = content.split(/[.!?]+/);
    let excerpt = '';
    
    for (const sentence of sentences) {
      if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
        excerpt += sentence.trim() + '. ';
        if (excerpt.length >= maxLength) break;
      }
    }
    
    return excerpt.length > 0 ? excerpt.trim() : content.substring(0, maxLength) + '...';
  }

  // Helper methods and calculations
  private generateAssemblyId(): string {
    return `assembly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSectionId(): string {
    return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRelationshipId(): string {
    return `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateChainId(): string {
    return `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Placeholder implementations for complex calculations
  private filterByAuthority(sources: VectorSearchResult[], classification: BusinessQueryClassification): VectorSearchResult[] {
    return sources.filter(s => s.metadata.authority_level !== 'unverified' || sources.length < 5);
  }

  private prioritizeFrameworkContent(sources: VectorSearchResult[], frameworkRelevance: FrameworkRelevance[]): VectorSearchResult[] {
    const relevantFrameworks = frameworkRelevance.map(fr => fr.framework);
    return sources.sort((a, b) => {
      const aHasFramework = relevantFrameworks.includes(a.metadata.framework!);
      const bHasFramework = relevantFrameworks.includes(b.metadata.framework!);
      if (aHasFramework && !bHasFramework) return -1;
      if (!aHasFramework && bHasFramework) return 1;
      return 0;
    });
  }

  private getDetectedFrameworks(sources: VectorSearchResult[]): HormoziFramework[] {
    const frameworks = new Set<HormoziFramework>();
    for (const source of sources) {
      if (source.metadata.framework) {
        frameworks.add(source.metadata.framework);
      }
    }
    return Array.from(frameworks);
  }

  private determineRelationshipType(primary: HormoziFramework, related: HormoziFramework[]): 'sequential' | 'complementary' | 'foundational' | 'advanced' | 'alternative' {
    // Simplified logic - would be more sophisticated in practice
    if (primary === HormoziFramework.GRAND_SLAM_OFFERS && related.includes(HormoziFramework.CORE_FOUR)) {
      return 'complementary';
    }
    return 'complementary';
  }

  private findIntegrationOpportunities(primary: HormoziFramework, related: HormoziFramework[], sources: VectorSearchResult[]): IntegrationOpportunity[] {
    return [{
      opportunity_type: 'workflow_integration',
      description: `Integrate ${primary} with ${related[0]} for enhanced results`,
      implementation_approach: 'Sequential implementation with feedback loops',
      expected_benefits: ['Improved conversion rates', 'Better lead quality'],
      complexity_level: 'moderate'
    }];
  }

  private calculateSynergyPotential(primary: HormoziFramework, related: HormoziFramework[]): number {
    return 0.75; // Placeholder
  }

  private identifyPrimaryFramework(classification: BusinessQueryClassification, sources: VectorSearchResult[]): HormoziFramework | null {
    const frameworkRelevance = classification.business_context.framework_relevance;
    return frameworkRelevance.length > 0 ? frameworkRelevance[0].framework : null;
  }

  private identifySupporting Frameworks(classification: BusinessQueryClassification, sources: VectorSearchResult[], primary?: HormoziFramework | null): HormoziFramework[] {
    return classification.business_context.framework_relevance
      .slice(1)
      .map(fr => fr.framework)
      .filter(f => f !== primary);
  }

  private createCitations(sources: VectorSearchResult[]): Citation[] {
    return sources.map(source => ({
      citation_id: `cite_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      source_id: source.id,
      source_title: source.metadata.title,
      authority_level: source.metadata.authority_level,
      verification_status: source.metadata.verification_status,
      framework: source.metadata.framework,
      content_excerpt: source.content.substring(0, 200) + '...',
      relevance_score: source.relevance_score,
      timestamp: source.metadata.created_at
    }));
  }

  // Additional helper methods with simplified implementations
  private calculateFrameworkAlignment(sources: VectorSearchResult[], framework: HormoziFramework): FrameworkAlignment {
    return {
      framework: framework,
      alignment_score: 0.85,
      components_covered: ['core_concepts', 'implementation'],
      implementation_depth: 'comprehensive',
      practical_applicability: 0.88
    };
  }

  private calculateSectionRelevance(sources: VectorSearchResult[]): number {
    return sources.reduce((sum, s) => sum + s.relevance_score, 0) / sources.length;
  }

  private calculateSectionQuality(sources: VectorSearchResult[]): number {
    return sources.reduce((sum, s) => sum + s.quality_score, 0) / sources.length;
  }

  private calculateBusinessPriority(framework: HormoziFramework, sectionType: SectionType): number {
    const typePriorities = {
      [SectionType.PRIMARY_FRAMEWORK]: 1.0,
      [SectionType.SUPPORTING_FRAMEWORK]: 0.8,
      [SectionType.FINANCIAL_METRICS]: 0.9,
      [SectionType.IMPLEMENTATION_GUIDANCE]: 0.85,
      [SectionType.CASE_STUDIES]: 0.7,
      [SectionType.FOUNDATIONAL_CONCEPTS]: 0.6,
      [SectionType.CROSS_REFERENCES]: 0.5,
      [SectionType.EXPERT_INSIGHTS]: 0.75
    };
    return typePriorities[sectionType] || 0.5;
  }

  private generateFrameworkTitle(framework: HormoziFramework, sectionType: SectionType): string {
    const prefix = sectionType === SectionType.PRIMARY_FRAMEWORK ? '' : 'Supporting: ';
    return `${prefix}${framework.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())}`;
  }

  // Placeholder implementations for complex methods
  private async createImplementationSection(sources: VectorSearchResult[], classification: BusinessQueryClassification, config: AssemblyConfiguration): Promise<ContextSection | null> { return null; }
  private async createCaseStudySection(sources: VectorSearchResult[], classification: BusinessQueryClassification, config: AssemblyConfiguration): Promise<ContextSection | null> { return null; }
  private async createFoundationalSection(sources: VectorSearchResult[], classification: BusinessQueryClassification, config: AssemblyConfiguration): Promise<ContextSection | null> { return null; }
  private async createExpertInsightsSection(sources: VectorSearchResult[], classification: BusinessQueryClassification, config: AssemblyConfiguration): Promise<ContextSection | null> { return null; }
  private async createCrossReferenceSection(relationships: FrameworkRelationship[], sources: VectorSearchResult[], config: AssemblyConfiguration): Promise<ContextSection | null> { return null; }
  private findCrossReferences(citations: Citation[], sources: VectorSearchResult[]): CrossReference[] { return []; }
  private calculateAuthorityDistribution(citations: Citation[]): AuthorityDistribution {
    return {
      primary_hormozi: 0.4,
      verified_case_studies: 0.3,
      expert_interpretations: 0.2,
      community_validated: 0.1,
      unverified: 0.0,
      authority_balance_score: 0.85
    };
  }
  private calculateSourceDiversity(citations: Citation[]): number { return 0.75; }
  private calculateCitationCompleteness(sections: ContextSection[], citations: Citation[]): number { return 0.92; }
  private createHierarchyNodes(sections: ContextSection[]): HierarchyNode[] { return []; }
  private establishInformationFlow(nodes: HierarchyNode[], relationships: FrameworkRelationship[]): InformationFlow[] { return []; }
  private createDependencyMapping(nodes: HierarchyNode[], flows: InformationFlow[]): DependencyMapping[] { return []; }
  private generateLearningProgression(nodes: HierarchyNode[], deps: DependencyMapping[], intent: UserIntent): LearningPath[] { return []; }
  private createImplementationSequence(nodes: HierarchyNode[], relationships: FrameworkRelationship[]): ImplementationStep[] { return []; }
  private async calculateContextQuality(sections: ContextSection[], citations: CitationChain, classification: BusinessQueryClassification): Promise<ContextQualityMetrics> {
    return {
      overall_quality: 0.87,
      content_coherence: 0.85,
      source_authority: 0.91,
      framework_coverage: 0.83,
      implementation_completeness: 0.79,
      citation_accuracy: 0.92,
      information_density: 0.81,
      business_relevance: 0.88,
      actionability_score: 0.84
    };
  }
  private generateTokenOptimization(original: ContextSection[], optimized: ContextSection[], config: AssemblyConfiguration): TokenOptimization {
    const originalTokens = original.reduce((sum, s) => sum + s.token_count, 0);
    const finalTokens = optimized.reduce((sum, s) => sum + s.token_count, 0);
    return {
      total_tokens: finalTokens,
      context_window_utilization: finalTokens / config.max_context_tokens,
      optimization_applied: [],
      content_compression_ratio: finalTokens / originalTokens,
      quality_preservation_score: 0.92,
      truncation_points: []
    };
  }
  private generateAssemblyMetadata(original: VectorSearchResult[], processed: VectorSearchResult[], time: number, config: AssemblyConfiguration): AssemblyMetadata {
    return {
      assembly_timestamp: new Date().toISOString(),
      processing_time_ms: time,
      source_processing_stats: {
        sources_received: original.length,
        sources_processed: processed.length,
        sources_filtered: original.length - processed.length,
        duplicates_removed: 0,
        quality_failures: 0,
        token_budget_limitations: 0
      },
      quality_filters_applied: [],
      optimization_strategies: [],
      content_transformation_log: []
    };
  }
  private assessComplexityLevel(sources: VectorSearchResult[]): string { return 'intermediate'; }
  private assessBusinessImpact(framework: HormoziFramework): 'low' | 'medium' | 'high' | 'critical' { return 'high'; }
  private assessImplementationReadiness(sources: VectorSearchResult[]): number { return 0.75; }
  private estimateTimeToImplement(framework: HormoziFramework, sources: VectorSearchResult[]): string { return '2-4 weeks'; }
  private extractResourceRequirements(sources: VectorSearchResult[]): string[] { return ['Team training', 'Process documentation', 'Performance metrics']; }
  private extractSuccessIndicators(sources: VectorSearchResult[]): string[] { return ['Improved conversion rates', 'Better lead quality', 'Increased revenue']; }
}

// Supporting classes
class ContentDeduplicator {
  removeDuplicates(sources: VectorSearchResult[]): VectorSearchResult[] {
    const seen = new Set<string>();
    return sources.filter(source => {
      const hash = source.metadata.content_hash || this.generateHash(source.content);
      if (seen.has(hash)) return false;
      seen.add(hash);
      return true;
    });
  }

  private generateHash(content: string): string {
    return Buffer.from(content.substring(0, 100)).toString('base64');
  }
}

class TokenCounter {
  count(text: string): number {
    // Rough token estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

// Supporting interfaces
interface FrameworkMetadata {
  overview: string;
  components: FrameworkComponent[];
  implementation_complexity: string;
  business_impact: string;
}

interface FrameworkComponent {
  name: string;
  description: string;
}

interface AggregatedContent {
  content: string;
  implementationReadiness: number;
  timeToImplement: string;
  resourceRequirements: string[];
  successIndicators: string[];
}

export default OracleContextAssemblyEngine;