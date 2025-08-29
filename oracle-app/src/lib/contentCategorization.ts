/**
 * Advanced Content Categorization System
 * Elena Execution - Hormozi Business Wisdom Classification
 * 
 * This system uses AI analysis and rule-based categorization to
 * classify content into frameworks, metrics, strategies, and other
 * business categories with high precision.
 */

import OpenAI from 'openai';
import { ContentCategory, BusinessPhase, DifficultyLevel } from './advancedIngestionPipeline';

// Initialize OpenAI for content analysis
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface CategoryAnalysis {
  primary_category: ContentCategory;
  secondary_categories: ContentCategory[];
  confidence_score: number;
  business_phase: BusinessPhase;
  difficulty_level: DifficultyLevel;
  detected_frameworks: string[];
  key_metrics: string[];
  strategic_concepts: string[];
  implementation_signals: string[];
  reasoning: string;
}

export interface FrameworkDetection {
  framework_name: string;
  confidence: number;
  evidence_phrases: string[];
  application_context: string;
}

export class HormoziContentCategorizer {
  
  // Main categorization method
  async categorizeContent(content: string, title?: string): Promise<CategoryAnalysis> {
    try {
      console.log('🔍 Analyzing content for categorization...');
      
      // Use AI analysis as primary method
      const aiAnalysis = await this.aiPoweredCategorization(content, title);
      
      // Use rule-based analysis as validation/fallback
      const ruleBasedAnalysis = this.ruleBasedCategorization(content);
      
      // Combine and validate results
      return this.combineAnalysisResults(aiAnalysis, ruleBasedAnalysis, content);
      
    } catch (error) {
      console.error('Categorization failed, using fallback:', error);
      return this.fallbackCategorization(content);
    }
  }

  // AI-powered content categorization
  private async aiPoweredCategorization(content: string, title?: string): Promise<Partial<CategoryAnalysis>> {
    const analysisPrompt = `Analyze this Alex Hormozi business content for precise categorization:

TITLE: ${title || 'Not provided'}

CONTENT PREVIEW (first 2500 chars):
${content.substring(0, 2500)}

Classify this content using Hormozi's business methodologies. Respond with JSON:

{
  "primary_category": "frameworks|metrics|strategies|mindset|operations|sales|marketing|scaling",
  "secondary_categories": ["array of relevant secondary categories"],
  "confidence_score": 0.95,
  "business_phase": "startup|scaling|optimization|all",
  "difficulty_level": "beginner|intermediate|advanced|expert",
  "detected_frameworks": [
    "Grand Slam Offers",
    "Core Four", 
    "Value Equation",
    "LTV/CAC Optimization",
    "Lead Magnets",
    "Content Marketing",
    "Pricing Psychology"
  ],
  "key_metrics": ["revenue", "conversion rate", "CAC", "LTV", "profit margin"],
  "strategic_concepts": ["market positioning", "competitive advantage", "scaling systems"],
  "implementation_signals": ["step-by-step", "blueprint", "checklist", "framework"],
  "reasoning": "Detailed explanation of categorization decisions"
}

CATEGORIZATION GUIDELINES:
- FRAMEWORKS: Systematic approaches, methodologies, structured processes
- METRICS: KPIs, measurements, financial calculations, performance indicators  
- STRATEGIES: High-level approaches, competitive positioning, market strategies
- MINDSET: Psychology, beliefs, mental models, harsh truths
- OPERATIONS: Systems, processes, team building, infrastructure
- SALES: Closing, objection handling, sales systems, conversion
- MARKETING: Lead generation, content, advertising, brand building
- SCALING: Growth systems, expansion, optimization, team development

Focus on Hormozi-specific frameworks and concepts.`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert business analyst specializing in Alex Hormozi methodologies. Respond only with valid JSON containing the requested categorization analysis.' 
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.1,
        max_tokens: 1500
      });

      const analysisResult = JSON.parse(response.choices[0].message.content || '{}');
      console.log('✅ AI categorization completed');
      
      return analysisResult;
      
    } catch (error) {
      console.error('AI categorization failed:', error);
      throw error;
    }
  }

  // Rule-based content categorization for validation
  private ruleBasedCategorization(content: string): Partial<CategoryAnalysis> {
    const lowerContent = content.toLowerCase();
    
    // Framework detection patterns
    const frameworkPatterns = {
      'Grand Slam Offers': ['grand slam', 'irresistible offer', 'value equation'],
      'Core Four': ['core four', 'warm outreach', 'cold outreach', 'warm content', 'cold content'],
      'Value Equation': ['value equation', 'dream outcome', 'perceived likelihood', 'time delay', 'effort and sacrifice'],
      'LTV/CAC Optimization': ['ltv', 'cac', 'lifetime value', 'customer acquisition cost'],
      'Lead Magnets': ['lead magnet', 'free offer', 'value ladder'],
      'Pricing Psychology': ['pricing', 'anchor', 'psychology', 'payment structure']
    };
    
    // Category indicators
    const categoryIndicators = {
      [ContentCategory.FRAMEWORKS]: [
        'framework', 'system', 'methodology', 'process', 'blueprint', 
        'step-by-step', 'structure', 'model', 'approach'
      ],
      [ContentCategory.METRICS]: [
        'metric', 'kpi', 'measure', 'track', 'calculate', 'roi', 'revenue',
        'profit', 'margin', 'conversion', 'rate', 'percentage'
      ],
      [ContentCategory.STRATEGIES]: [
        'strategy', 'plan', 'approach', 'positioning', 'competitive',
        'market', 'advantage', 'differentiation'
      ],
      [ContentCategory.MINDSET]: [
        'mindset', 'psychology', 'belief', 'think', 'perspective',
        'mental', 'truth', 'harsh', 'reality'
      ],
      [ContentCategory.OPERATIONS]: [
        'operations', 'team', 'hire', 'manage', 'process', 'system',
        'infrastructure', 'organization'
      ],
      [ContentCategory.SALES]: [
        'sales', 'sell', 'close', 'objection', 'conversion', 'prospect',
        'pipeline', 'lead', 'deal'
      ],
      [ContentCategory.MARKETING]: [
        'marketing', 'advertise', 'content', 'brand', 'audience',
        'social media', 'seo', 'traffic'
      ],
      [ContentCategory.SCALING]: [
        'scale', 'growth', 'expand', 'multiply', 'increase', 'optimize',
        'improve', 'accelerate'
      ]
    };
    
    // Business phase indicators
    const phaseIndicators = {
      [BusinessPhase.STARTUP]: ['startup', 'beginning', 'first', 'initial', 'launch', 'start'],
      [BusinessPhase.SCALING]: ['scale', 'growth', 'expand', 'multiply', 'increase', 'grow'],
      [BusinessPhase.OPTIMIZATION]: ['optimize', 'improve', 'refine', 'perfect', 'advanced', 'mastery']
    };
    
    // Difficulty indicators
    const difficultyIndicators = {
      [DifficultyLevel.BEGINNER]: ['basic', 'beginner', 'simple', 'introduction', 'getting started'],
      [DifficultyLevel.INTERMEDIATE]: ['intermediate', 'next level', 'more advanced'],
      [DifficultyLevel.ADVANCED]: ['advanced', 'complex', 'sophisticated', 'expert'],
      [DifficultyLevel.EXPERT]: ['expert', 'mastery', 'professional', 'enterprise']
    };
    
    // Detect frameworks
    const detectedFrameworks: string[] = [];
    for (const [framework, patterns] of Object.entries(frameworkPatterns)) {
      if (patterns.some(pattern => lowerContent.includes(pattern))) {
        detectedFrameworks.push(framework);
      }
    }
    
    // Determine primary category
    let maxScore = 0;
    let primaryCategory = ContentCategory.STRATEGIES;
    const categoryScores: { [key in ContentCategory]: number } = {
      [ContentCategory.FRAMEWORKS]: 0,
      [ContentCategory.METRICS]: 0,
      [ContentCategory.STRATEGIES]: 0,
      [ContentCategory.MINDSET]: 0,
      [ContentCategory.OPERATIONS]: 0,
      [ContentCategory.SALES]: 0,
      [ContentCategory.MARKETING]: 0,
      [ContentCategory.SCALING]: 0,
    };
    
    for (const [category, indicators] of Object.entries(categoryIndicators)) {
      const score = indicators.reduce((count, indicator) => {
        const matches = (lowerContent.match(new RegExp(indicator, 'g')) || []).length;
        return count + matches;
      }, 0);
      
      categoryScores[category as ContentCategory] = score;
      if (score > maxScore) {
        maxScore = score;
        primaryCategory = category as ContentCategory;
      }
    }
    
    // Determine business phase
    let businessPhase = BusinessPhase.ALL;
    let maxPhaseScore = 0;
    for (const [phase, indicators] of Object.entries(phaseIndicators)) {
      const score = indicators.reduce((count, indicator) => {
        return count + (lowerContent.includes(indicator) ? 1 : 0);
      }, 0);
      if (score > maxPhaseScore) {
        maxPhaseScore = score;
        businessPhase = phase as BusinessPhase;
      }
    }
    
    // Determine difficulty level
    let difficultyLevel = DifficultyLevel.INTERMEDIATE;
    let maxDifficultyScore = 0;
    for (const [difficulty, indicators] of Object.entries(difficultyIndicators)) {
      const score = indicators.reduce((count, indicator) => {
        return count + (lowerContent.includes(indicator) ? 1 : 0);
      }, 0);
      if (score > maxDifficultyScore) {
        maxDifficultyScore = score;
        difficultyLevel = difficulty as DifficultyLevel;
      }
    }
    
    // Extract key metrics mentioned
    const keyMetrics = [
      'revenue', 'profit', 'margin', 'ltv', 'cac', 'conversion rate',
      'roi', 'roas', 'ctr', 'cpm', 'cpc', 'aov', 'retention rate'
    ].filter(metric => lowerContent.includes(metric));
    
    // Extract strategic concepts
    const strategicConcepts = [
      'positioning', 'differentiation', 'competitive advantage', 
      'market penetration', 'value proposition', 'target market',
      'customer avatar', 'blue ocean', 'moat'
    ].filter(concept => lowerContent.includes(concept));
    
    return {
      primary_category: primaryCategory,
      business_phase: businessPhase,
      difficulty_level: difficultyLevel,
      detected_frameworks: detectedFrameworks,
      key_metrics: keyMetrics,
      strategic_concepts: strategicConcepts,
      confidence_score: Math.min(0.8, maxScore / 10) // Rule-based has lower confidence
    };
  }

  // Combine AI and rule-based results
  private combineAnalysisResults(
    aiAnalysis: Partial<CategoryAnalysis>,
    ruleAnalysis: Partial<CategoryAnalysis>,
    content: string
  ): CategoryAnalysis {
    
    // Use AI analysis as primary, rule-based as validation
    const combined: CategoryAnalysis = {
      primary_category: aiAnalysis.primary_category || ruleAnalysis.primary_category || ContentCategory.STRATEGIES,
      secondary_categories: aiAnalysis.secondary_categories || [],
      confidence_score: aiAnalysis.confidence_score || ruleAnalysis.confidence_score || 0.7,
      business_phase: aiAnalysis.business_phase || ruleAnalysis.business_phase || BusinessPhase.ALL,
      difficulty_level: aiAnalysis.difficulty_level || ruleAnalysis.difficulty_level || DifficultyLevel.INTERMEDIATE,
      detected_frameworks: this.mergeArrays(aiAnalysis.detected_frameworks, ruleAnalysis.detected_frameworks),
      key_metrics: this.mergeArrays(aiAnalysis.key_metrics, ruleAnalysis.key_metrics),
      strategic_concepts: this.mergeArrays(aiAnalysis.strategic_concepts, ruleAnalysis.strategic_concepts),
      implementation_signals: aiAnalysis.implementation_signals || this.detectImplementationSignals(content),
      reasoning: aiAnalysis.reasoning || 'Rule-based categorization applied'
    };
    
    // Validation: If AI and rules disagree significantly, lower confidence
    if (aiAnalysis.primary_category && ruleAnalysis.primary_category && 
        aiAnalysis.primary_category !== ruleAnalysis.primary_category) {
      combined.confidence_score = Math.max(0.5, combined.confidence_score * 0.8);
    }
    
    return combined;
  }

  // Fallback categorization when all else fails
  private fallbackCategorization(content: string): CategoryAnalysis {
    const lowerContent = content.toLowerCase();
    
    let category = ContentCategory.STRATEGIES;
    if (lowerContent.includes('system') || lowerContent.includes('framework')) {
      category = ContentCategory.FRAMEWORKS;
    } else if (lowerContent.includes('metric') || lowerContent.includes('measure')) {
      category = ContentCategory.METRICS;
    } else if (lowerContent.includes('mindset') || lowerContent.includes('think')) {
      category = ContentCategory.MINDSET;
    }
    
    return {
      primary_category: category,
      secondary_categories: [],
      confidence_score: 0.5,
      business_phase: BusinessPhase.ALL,
      difficulty_level: DifficultyLevel.INTERMEDIATE,
      detected_frameworks: [],
      key_metrics: [],
      strategic_concepts: [],
      implementation_signals: [],
      reasoning: 'Fallback categorization - limited analysis available'
    };
  }

  // Detect specific framework implementations
  async detectFrameworkImplementations(content: string): Promise<FrameworkDetection[]> {
    const detections: FrameworkDetection[] = [];
    
    const hormoziFrameworks = [
      {
        name: 'Grand Slam Offers',
        patterns: ['grand slam', 'irresistible offer', 'value equation', 'dream outcome'],
        context: 'Offer creation and value proposition development'
      },
      {
        name: 'Core Four',
        patterns: ['core four', 'warm outreach', 'cold outreach', 'warm content', 'cold content'],
        context: 'Lead generation and customer acquisition'
      },
      {
        name: 'Value Equation',
        patterns: ['value equation', 'perceived likelihood', 'time delay', 'effort and sacrifice'],
        context: 'Value perception and offer optimization'
      },
      {
        name: 'LTV/CAC Optimization',
        patterns: ['ltv', 'cac', 'lifetime value', 'customer acquisition cost', 'unit economics'],
        context: 'Financial metrics and business sustainability'
      },
      {
        name: 'Lead Magnet Strategy',
        patterns: ['lead magnet', 'free offer', 'value ladder', 'bait'],
        context: 'Lead generation and conversion optimization'
      }
    ];
    
    const lowerContent = content.toLowerCase();
    
    for (const framework of hormoziFrameworks) {
      const matchedPatterns: string[] = [];
      let confidence = 0;
      
      for (const pattern of framework.patterns) {
        if (lowerContent.includes(pattern)) {
          matchedPatterns.push(pattern);
          confidence += 0.25;
        }
      }
      
      if (matchedPatterns.length > 0) {
        detections.push({
          framework_name: framework.name,
          confidence: Math.min(1.0, confidence),
          evidence_phrases: matchedPatterns,
          application_context: framework.context
        });
      }
    }
    
    return detections.sort((a, b) => b.confidence - a.confidence);
  }

  // Utility methods
  private mergeArrays(arr1?: string[], arr2?: string[]): string[] {
    const combined = [...(arr1 || []), ...(arr2 || [])];
    return [...new Set(combined)]; // Remove duplicates
  }

  private detectImplementationSignals(content: string): string[] {
    const signals = [
      'step-by-step', 'blueprint', 'checklist', 'template', 'framework',
      'process', 'system', 'method', 'strategy', 'approach', 'guide',
      'how to', 'implementation', 'execution', 'action plan'
    ];
    
    const lowerContent = content.toLowerCase();
    return signals.filter(signal => lowerContent.includes(signal));
  }
}

// Export singleton instance
export const hormoziCategorizer = new HormoziContentCategorizer();