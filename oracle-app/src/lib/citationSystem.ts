/**
 * Citation and Source Attribution System for Oracle Knowledge Base
 * Alice Intelligence - Comprehensive source tracking and validation
 */

import {
  AuthorityLevel,
  VerificationStatus,
  SourceAttribution,
  FreshnessScore
} from '../types/businessIntelligence';

// Citation format templates for different source types
export enum CitationFormat {
  BOOK = 'book',
  VIDEO = 'video', 
  PODCAST = 'podcast',
  INTERVIEW = 'interview',
  CASE_STUDY = 'case_study',
  FRAMEWORK = 'framework',
  SOCIAL_MEDIA = 'social_media',
  WEBINAR = 'webinar',
  COURSE = 'course'
}

// Source type definitions with citation templates
export interface SourceType {
  format: CitationFormat;
  citation_template: string;
  authority_weight: number;        // 0-1 scale for authority scoring
  verification_requirements: string[];
  freshness_decay_rate: number;   // How quickly content becomes outdated
  typical_lifespan_months: number;
}

// Comprehensive source type registry
export const SOURCE_TYPE_REGISTRY: { [key in CitationFormat]: SourceType } = {
  [CitationFormat.BOOK]: {
    format: CitationFormat.BOOK,
    citation_template: '{author} - {title}, Chapter {chapter_number}: {chapter_title} (Page {page_number})',
    authority_weight: 1.0,
    verification_requirements: ['isbn_verification', 'page_number_validation', 'quote_accuracy'],
    freshness_decay_rate: 0.05,     // Books age slowly
    typical_lifespan_months: 60     // 5 years typical relevance
  },
  
  [CitationFormat.VIDEO]: {
    format: CitationFormat.VIDEO,
    citation_template: '{author} - "{title}" ({publication_date}) [Timestamp: {timestamp}]',
    authority_weight: 0.9,
    verification_requirements: ['url_validation', 'timestamp_accuracy', 'content_match'],
    freshness_decay_rate: 0.1,      // Videos age moderately
    typical_lifespan_months: 24     // 2 years typical relevance
  },
  
  [CitationFormat.PODCAST]: {
    format: CitationFormat.PODCAST,
    citation_template: '{guest} on "{show_name}" with {host} ({publication_date}) [Episode: {episode_number}, Timestamp: {timestamp}]',
    authority_weight: 0.8,
    verification_requirements: ['episode_verification', 'timestamp_validation', 'guest_confirmation'],
    freshness_decay_rate: 0.12,
    typical_lifespan_months: 18
  },
  
  [CitationFormat.INTERVIEW]: {
    format: CitationFormat.INTERVIEW,
    citation_template: '{interviewee} interviewed by {interviewer} on "{platform}" ({date}) [{context}]',
    authority_weight: 0.8,
    verification_requirements: ['platform_verification', 'date_accuracy', 'interviewer_validation'],
    freshness_decay_rate: 0.1,
    typical_lifespan_months: 24
  },
  
  [CitationFormat.CASE_STUDY]: {
    format: CitationFormat.CASE_STUDY,
    citation_template: 'Case Study: {business_name} - {outcome_description} ({date_range}) [Source: {data_source}]',
    authority_weight: 0.95,
    verification_requirements: ['outcome_verification', 'data_source_validation', 'timeline_accuracy'],
    freshness_decay_rate: 0.15,     // Case studies can become outdated quickly
    typical_lifespan_months: 12
  },
  
  [CitationFormat.FRAMEWORK]: {
    format: CitationFormat.FRAMEWORK,
    citation_template: '{framework_name} → {component} as described in "{source_material}" by {author}',
    authority_weight: 0.95,
    verification_requirements: ['framework_consistency', 'component_accuracy', 'source_validation'],
    freshness_decay_rate: 0.03,     // Core frameworks are timeless
    typical_lifespan_months: 120    // 10 years+ relevance
  },
  
  [CitationFormat.SOCIAL_MEDIA]: {
    format: CitationFormat.SOCIAL_MEDIA,
    citation_template: '{author} (@{handle}) on {platform} ({date}) - "{post_excerpt}"',
    authority_weight: 0.4,
    verification_requirements: ['post_existence', 'date_verification', 'content_accuracy'],
    freshness_decay_rate: 0.3,      // Social media ages very quickly
    typical_lifespan_months: 6
  },
  
  [CitationFormat.WEBINAR]: {
    format: CitationFormat.WEBINAR,
    citation_template: '"{webinar_title}" webinar by {presenter} ({date}) [Timestamp: {timestamp}]',
    authority_weight: 0.7,
    verification_requirements: ['webinar_verification', 'presenter_validation', 'content_match'],
    freshness_decay_rate: 0.15,
    typical_lifespan_months: 12
  },
  
  [CitationFormat.COURSE]: {
    format: CitationFormat.COURSE,
    citation_template: '"{course_name}" by {instructor} - Module {module_number}: {module_title}',
    authority_weight: 0.85,
    verification_requirements: ['course_access', 'module_verification', 'instructor_validation'],
    freshness_decay_rate: 0.08,
    typical_lifespan_months: 36
  }
};

// Primary Hormozi source hierarchy
export const HORMOZI_SOURCE_HIERARCHY = {
  // Tier 1: Primary Hormozi Content (Highest Authority)
  primary_books: {
    '$100M_offers': {
      title: '$100M Offers: How To Make Offers So Good People Feel Stupid Saying No',
      author: 'Alex Hormozi',
      isbn: '9781737475712',
      authority_level: AuthorityLevel.PRIMARY_HORMOZI,
      publication_date: new Date('2021-07-01'),
      key_frameworks: ['Grand Slam Offers', 'Value Equation', 'Offer Enhancement'],
      typical_citation: 'Alex Hormozi - $100M Offers, Chapter {chapter}: {chapter_title} (Page {page})'
    },
    
    '$100M_leads': {
      title: '$100M Leads: How to Get Strangers To Want To Buy Your Stuff',
      author: 'Alex Hormozi',
      isbn: '9781737475729',
      authority_level: AuthorityLevel.PRIMARY_HORMOZI,
      publication_date: new Date('2023-05-01'),
      key_frameworks: ['Core Four', 'Lead Generation', 'Customer Acquisition'],
      typical_citation: 'Alex Hormozi - $100M Leads, Chapter {chapter}: {chapter_title} (Page {page})'
    }
  },
  
  // Tier 2: Direct Hormozi Videos and Content
  primary_videos: {
    youtube_channel: {
      channel_name: 'Alex Hormozi',
      channel_url: 'https://www.youtube.com/@AlexHormozi',
      authority_level: AuthorityLevel.PRIMARY_HORMOZI,
      verification_method: 'youtube_api_validation',
      typical_citation: 'Alex Hormozi - "{video_title}" ({publication_date}) [Timestamp: {timestamp}]'
    },
    
    harsh_truths_series: {
      series_name: 'Business Harsh Truths',
      authority_level: AuthorityLevel.PRIMARY_HORMOZI,
      key_themes: ['mindset', 'reality_checks', 'business_principles'],
      typical_citation: 'Alex Hormozi - "{video_title}" Harsh Truths Series ({date}) [Timestamp: {timestamp}]'
    }
  },
  
  // Tier 3: Verified Implementation Cases
  verified_case_studies: {
    gym_launch: {
      business_name: 'Gym Launch',
      outcome: 'Scaled to $100M+ valuation',
      verification_source: 'public_filings_and_interviews',
      authority_level: AuthorityLevel.VERIFIED_CASE_STUDY,
      key_frameworks_demonstrated: ['Grand Slam Offers', 'Systematic Scaling'],
      typical_citation: 'Gym Launch Case Study - {specific_outcome} ({date_range}) [Verified via {verification_method}]'
    },
    
    acquisition_com: {
      business_name: 'Acquisition.com',
      outcome: 'Portfolio company scaling methodology',
      verification_source: 'public_portfolio_results',
      authority_level: AuthorityLevel.VERIFIED_CASE_STUDY,
      key_frameworks_demonstrated: ['Portfolio Scaling', 'Acquisition Strategy'],
      typical_citation: 'Acquisition.com Portfolio - {company_name} results ({date}) [Verified via {source}]'
    }
  }
};

// Citation builder and formatter
export class CitationBuilder {
  
  // Build complete citation from source data
  static buildCitation(sourceData: SourceCitationData): FormattedCitation {
    const sourceType = SOURCE_TYPE_REGISTRY[sourceData.format];
    const template = sourceType.citation_template;
    
    // Replace template variables with actual data
    let formattedCitation = template;
    Object.entries(sourceData.variables).forEach(([key, value]) => {
      formattedCitation = formattedCitation.replace(`{${key}}`, String(value));
    });
    
    return {
      citation_text: formattedCitation,
      authority_score: this.calculateAuthorityScore(sourceData),
      verification_status: sourceData.verification_status,
      freshness_score: this.calculateFreshnessScore(sourceData),
      source_url: sourceData.source_url,
      last_verified: sourceData.last_verified || new Date(),
      verification_notes: sourceData.verification_notes || []
    };
  }
  
  // Calculate authority score based on source type and verification
  private static calculateAuthorityScore(sourceData: SourceCitationData): number {
    const sourceType = SOURCE_TYPE_REGISTRY[sourceData.format];
    let baseScore = sourceType.authority_weight;
    
    // Adjust based on verification status
    switch (sourceData.verification_status) {
      case VerificationStatus.VERIFIED:
        // No penalty for verified content
        break;
      case VerificationStatus.PENDING_VERIFICATION:
        baseScore *= 0.8;
        break;
      case VerificationStatus.CONFLICTING:
        baseScore *= 0.5;
        break;
      case VerificationStatus.OUTDATED:
        baseScore *= 0.6;
        break;
      case VerificationStatus.UNVERIFIED:
        baseScore *= 0.4;
        break;
    }
    
    // Boost score for primary Hormozi sources
    if (sourceData.authority_level === AuthorityLevel.PRIMARY_HORMOZI) {
      baseScore = Math.min(1.0, baseScore * 1.2);
    }
    
    return Math.round(baseScore * 100) / 100; // Round to 2 decimals
  }
  
  // Calculate freshness score based on publication date and content type
  private static calculateFreshnessScore(sourceData: SourceCitationData): FreshnessScore {
    const sourceType = SOURCE_TYPE_REGISTRY[sourceData.format];
    const monthsSincePublication = this.getMonthsSinceDate(sourceData.publication_date);
    
    // Calculate decay based on source type and age
    const decayFactor = Math.exp(-sourceType.freshness_decay_rate * monthsSincePublication);
    const publicationRecency = Math.max(0, Math.min(1, decayFactor));
    
    // Market relevance (external factors)
    const marketRelevance = this.assessMarketRelevance(sourceData);
    
    // Framework evolution (how much the framework has changed)
    const frameworkEvolution = this.assessFrameworkEvolution(sourceData);
    
    const overallFreshness = (publicationRecency * 0.4 + marketRelevance * 0.3 + frameworkEvolution * 0.3);
    
    return {
      publication_recency: Math.round(publicationRecency * 100) / 100,
      market_relevance: Math.round(marketRelevance * 100) / 100,
      framework_evolution: Math.round(frameworkEvolution * 100) / 100,
      overall_freshness: Math.round(overallFreshness * 100) / 100,
      next_review_date: this.calculateNextReviewDate(sourceData.publication_date, sourceType)
    };
  }
  
  private static getMonthsSinceDate(date: Date): number {
    const now = new Date();
    return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 30.44); // Average month length
  }
  
  private static assessMarketRelevance(sourceData: SourceCitationData): number {
    // This would integrate with market data APIs or manual curation
    // For now, return a baseline score with some randomization for demonstration
    return 0.8; // Default high relevance for Hormozi content
  }
  
  private static assessFrameworkEvolution(sourceData: SourceCitationData): number {
    // This would track framework updates and changes over time
    // For now, return high score for core frameworks
    return 0.9; // Hormozi frameworks are generally stable
  }
  
  private static calculateNextReviewDate(publicationDate: Date, sourceType: SourceType): Date {
    const reviewDate = new Date(publicationDate);
    reviewDate.setMonth(reviewDate.getMonth() + Math.floor(sourceType.typical_lifespan_months / 2));
    return reviewDate;
  }
}

// Cross-reference validation system
export class CrossReferenceValidator {
  
  // Validate content consistency across multiple sources
  static validateContentConsistency(
    primarySource: SourceCitationData,
    secondarySources: SourceCitationData[],
    contentClaim: string
  ): ConsistencyValidation {
    
    const validationResults: ValidationResult[] = [];
    let conflictingInformation: string[] = [];
    let supportingEvidence: string[] = [];
    
    // Compare against each secondary source
    secondarySources.forEach(source => {
      const result = this.compareSourceContent(primarySource, source, contentClaim);
      validationResults.push(result);
      
      if (result.consistency_score < 0.7) {
        conflictingInformation.push(result.discrepancy_description);
      } else if (result.consistency_score > 0.8) {
        supportingEvidence.push(result.supporting_evidence);
      }
    });
    
    const overallConsistency = validationResults.reduce((avg, result) => 
      avg + result.consistency_score, 0) / validationResults.length;
    
    return {
      content_claim: contentClaim,
      primary_source_citation: CitationBuilder.buildCitation(primarySource).citation_text,
      overall_consistency_score: Math.round(overallConsistency * 100) / 100,
      supporting_sources_count: supportingEvidence.length,
      conflicting_sources_count: conflictingInformation.length,
      validation_results: validationResults,
      supporting_evidence: supportingEvidence,
      conflicting_information: conflictingInformation,
      recommendation: this.generateValidationRecommendation(overallConsistency, validationResults.length),
      last_validated: new Date()
    };
  }
  
  private static compareSourceContent(
    primary: SourceCitationData,
    secondary: SourceCitationData,
    claim: string
  ): ValidationResult {
    // This would use AI/NLP to compare content similarity and consistency
    // For now, return a simulated result based on authority levels
    
    const authorityAlignment = this.calculateAuthorityAlignment(primary, secondary);
    const contentSimilarity = 0.85; // Simulated similarity score
    
    return {
      secondary_source_citation: CitationBuilder.buildCitation(secondary).citation_text,
      consistency_score: (authorityAlignment + contentSimilarity) / 2,
      discrepancy_description: authorityAlignment < 0.7 ? 'Lower authority source with different perspective' : '',
      supporting_evidence: authorityAlignment > 0.8 ? 'High-authority source confirmation' : '',
      validation_method: 'authority_comparison_and_content_analysis',
      validation_date: new Date()
    };
  }
  
  private static calculateAuthorityAlignment(
    source1: SourceCitationData,
    source2: SourceCitationData
  ): number {
    const authority1 = SOURCE_TYPE_REGISTRY[source1.format].authority_weight;
    const authority2 = SOURCE_TYPE_REGISTRY[source2.format].authority_weight;
    
    // Higher alignment for similar authority levels
    return 1 - Math.abs(authority1 - authority2);
  }
  
  private static generateValidationRecommendation(
    consistencyScore: number,
    sourcesCount: number
  ): ValidationRecommendation {
    if (consistencyScore > 0.9 && sourcesCount >= 3) {
      return ValidationRecommendation.HIGH_CONFIDENCE;
    } else if (consistencyScore > 0.7 && sourcesCount >= 2) {
      return ValidationRecommendation.MODERATE_CONFIDENCE;
    } else if (consistencyScore < 0.5) {
      return ValidationRecommendation.REQUIRES_REVIEW;
    } else {
      return ValidationRecommendation.ADDITIONAL_SOURCES_NEEDED;
    }
  }
}

// Supporting interfaces and types
export interface SourceCitationData {
  format: CitationFormat;
  authority_level: AuthorityLevel;
  verification_status: VerificationStatus;
  publication_date: Date;
  source_url?: string;
  last_verified?: Date;
  verification_notes?: string[];
  
  // Template variables for citation formatting
  variables: { [key: string]: any };
}

export interface FormattedCitation {
  citation_text: string;
  authority_score: number;
  verification_status: VerificationStatus;
  freshness_score: FreshnessScore;
  source_url?: string;
  last_verified: Date;
  verification_notes: string[];
}

export interface ConsistencyValidation {
  content_claim: string;
  primary_source_citation: string;
  overall_consistency_score: number;
  supporting_sources_count: number;
  conflicting_sources_count: number;
  validation_results: ValidationResult[];
  supporting_evidence: string[];
  conflicting_information: string[];
  recommendation: ValidationRecommendation;
  last_validated: Date;
}

export interface ValidationResult {
  secondary_source_citation: string;
  consistency_score: number;
  discrepancy_description: string;
  supporting_evidence: string;
  validation_method: string;
  validation_date: Date;
}

export enum ValidationRecommendation {
  HIGH_CONFIDENCE = 'high_confidence',
  MODERATE_CONFIDENCE = 'moderate_confidence',
  ADDITIONAL_SOURCES_NEEDED = 'additional_sources_needed',
  REQUIRES_REVIEW = 'requires_review',
  CONFLICTING_INFORMATION = 'conflicting_information'
}

// Integration with Oracle search and retrieval
export class CitationIntegratedSearch {
  
  // Enhance search results with citation information
  static enhanceSearchResultsWithCitations(
    searchResults: any[], 
    includeSecondaryVerification: boolean = false
  ): CitationEnhancedResult[] {
    
    return searchResults.map(result => {
      const primaryCitation = this.extractPrimaryCitation(result);
      const secondaryCitations = includeSecondaryVerification ? 
        this.findSecondaryCitations(result.content, result.metadata) : [];
      
      return {
        ...result,
        primary_citation: primaryCitation,
        secondary_citations: secondaryCitations,
        citation_confidence: this.calculateCitationConfidence(primaryCitation, secondaryCitations),
        verification_summary: this.generateVerificationSummary(primaryCitation, secondaryCitations)
      };
    });
  }
  
  private static extractPrimaryCitation(searchResult: any): FormattedCitation {
    // Extract citation data from search result metadata
    const sourceData: SourceCitationData = {
      format: searchResult.metadata?.source_type || CitationFormat.FRAMEWORK,
      authority_level: searchResult.metadata?.authority_level || AuthorityLevel.UNVERIFIED,
      verification_status: searchResult.metadata?.verification_status || VerificationStatus.UNVERIFIED,
      publication_date: new Date(searchResult.metadata?.publication_date || Date.now()),
      source_url: searchResult.metadata?.source_url,
      variables: searchResult.metadata?.citation_variables || {}
    };
    
    return CitationBuilder.buildCitation(sourceData);
  }
  
  private static findSecondaryCitations(content: string, metadata: any): FormattedCitation[] {
    // This would search for related content with supporting citations
    // For now, return empty array - would be implemented with actual search
    return [];
  }
  
  private static calculateCitationConfidence(
    primary: FormattedCitation,
    secondary: FormattedCitation[]
  ): number {
    let baseConfidence = primary.authority_score * 0.6 + primary.freshness_score.overall_freshness * 0.4;
    
    // Boost confidence with supporting sources
    if (secondary.length > 0) {
      const secondaryBoost = Math.min(0.3, secondary.length * 0.1);
      baseConfidence += secondaryBoost;
    }
    
    return Math.min(1.0, Math.round(baseConfidence * 100) / 100);
  }
  
  private static generateVerificationSummary(
    primary: FormattedCitation,
    secondary: FormattedCitation[]
  ): string {
    const verificationLevel = primary.verification_status;
    const supportingCount = secondary.length;
    
    if (verificationLevel === VerificationStatus.VERIFIED && supportingCount > 2) {
      return `High confidence: Verified primary source with ${supportingCount} supporting sources`;
    } else if (verificationLevel === VerificationStatus.VERIFIED) {
      return `Moderate confidence: Verified primary source`;
    } else if (supportingCount > 1) {
      return `Moderate confidence: ${supportingCount} supporting sources`;
    } else {
      return `Lower confidence: Requires additional verification`;
    }
  }
}

export interface CitationEnhancedResult {
  primary_citation: FormattedCitation;
  secondary_citations: FormattedCitation[];
  citation_confidence: number;
  verification_summary: string;
}

export default {
  CitationBuilder,
  CrossReferenceValidator,
  CitationIntegratedSearch,
  SOURCE_TYPE_REGISTRY,
  HORMOZI_SOURCE_HIERARCHY,
  CitationFormat,
  ValidationRecommendation
};