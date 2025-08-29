/**
 * Business Framework Detection Service
 * Elena Execution - Oracle Content Processing Infrastructure
 * 
 * Detects Alex Hormozi and other business frameworks in content
 */

import { supabaseAdmin } from '../supabase';

export interface FrameworkDetection {
  name: string;
  confidence: number;
  context?: string;
  keywords: string[];
  explanation?: string;
}

export interface FrameworkPattern {
  name: string;
  keywords: string[];
  phrases: string[];
  requiredMatches: number;
  contextPatterns?: RegExp[];
}

export class BusinessFrameworkDetector {
  private frameworks: FrameworkPattern[];

  constructor() {
    this.frameworks = this.initializeFrameworkPatterns();
  }

  /**
   * Detect business frameworks in content
   */
  async detectFrameworks(content: string, title?: string): Promise<FrameworkDetection[]> {
    const detections: FrameworkDetection[] = [];
    const combinedText = `${title || ''} ${content}`.toLowerCase();

    for (const framework of this.frameworks) {
      const detection = this.analyzeFramework(combinedText, framework);
      if (detection) {
        detections.push(detection);
      }
    }

    // Sort by confidence score
    return detections.sort((a, b) => b.confidence - a.confidence);
  }

  private analyzeFramework(text: string, framework: FrameworkPattern): FrameworkDetection | null {
    let matchCount = 0;
    const matchedKeywords: string[] = [];
    const matchedPhrases: string[] = [];
    let contextSnippets: string[] = [];

    // Check keyword matches
    for (const keyword of framework.keywords) {
      const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'gi');
      const matches = text.match(regex);
      if (matches) {
        matchCount += matches.length;
        matchedKeywords.push(keyword);
      }
    }

    // Check phrase matches (higher weight)
    for (const phrase of framework.phrases) {
      const regex = new RegExp(phrase.toLowerCase().replace(/\s+/g, '\\s+'), 'gi');
      if (regex.test(text)) {
        matchCount += 3; // Phrases are worth more than individual keywords
        matchedPhrases.push(phrase);
        
        // Extract context around the phrase
        const contextMatch = text.match(new RegExp(`.{0,50}${phrase.toLowerCase()}.{0,50}`, 'gi'));
        if (contextMatch) {
          contextSnippets.push(...contextMatch.slice(0, 2)); // Limit context snippets
        }
      }
    }

    // Check context patterns if defined
    if (framework.contextPatterns) {
      for (const pattern of framework.contextPatterns) {
        if (pattern.test(text)) {
          matchCount += 2;
        }
      }
    }

    // Calculate confidence based on matches and text length
    if (matchCount >= framework.requiredMatches) {
      const confidence = Math.min(100, 
        (matchCount / framework.requiredMatches) * 50 + 
        (matchedPhrases.length * 25) +
        (matchedKeywords.length * 5)
      ) / 100;

      return {
        name: framework.name,
        confidence,
        context: contextSnippets.join(' ... '),
        keywords: [...matchedKeywords, ...matchedPhrases],
        explanation: this.generateExplanation(framework.name, matchedKeywords, matchedPhrases)
      };
    }

    return null;
  }

  private generateExplanation(
    frameworkName: string, 
    keywords: string[], 
    phrases: string[]
  ): string {
    const explanations: Record<string, string> = {
      'Value Equation': 'Content discusses the fundamental value equation: (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort and Sacrifice)',
      'Grand Slam Offer': 'Content covers creating irresistible offers that are so compelling customers feel stupid saying no',
      'Core Four': 'Content addresses the four core advertising channels: warm outreach, cold outreach, posting content, and running ads',
      'Lead Magnets': 'Content focuses on ethical bribes and value-driven lead magnets to attract potential customers',
      'Customer Value Optimization': 'Content discusses maximizing lifetime customer value through strategic upsells and retention',
      'Scaling Framework': 'Content covers systematic approaches to scaling business operations and revenue',
      'Acquisition Channels': 'Content explores various customer acquisition methods and channel optimization',
      'Monetization Strategy': 'Content addresses converting prospects into customers and maximizing revenue per customer',
      'Retention Strategy': 'Content focuses on keeping customers engaged and reducing churn rates',
      'Referral Systems': 'Content covers systematic approaches to generating customer referrals and word-of-mouth marketing'
    };

    return explanations[frameworkName] || 
      `Content contains ${keywords.length + phrases.length} key indicators of the ${frameworkName} framework.`;
  }

  private initializeFrameworkPatterns(): FrameworkPattern[] {
    return [
      {
        name: 'Value Equation',
        keywords: [
          'value', 'equation', 'dream', 'outcome', 'likelihood', 'perceived', 
          'time', 'delay', 'effort', 'sacrifice', 'value proposition'
        ],
        phrases: [
          'dream outcome',
          'perceived likelihood',
          'time delay',
          'effort and sacrifice',
          'value equation',
          'increase perceived likelihood',
          'decrease time delay',
          'reduce effort'
        ],
        requiredMatches: 4,
        contextPatterns: [
          /\(.*dream.*outcome.*\)/i,
          /perceived.*likelihood/i,
          /time.*delay/i
        ]
      },
      {
        name: 'Grand Slam Offer',
        keywords: [
          'offer', 'grand', 'slam', 'irresistible', 'stupid', 'saying', 'no',
          'guarantee', 'bonus', 'urgency', 'scarcity', 'stack'
        ],
        phrases: [
          'grand slam offer',
          'irresistible offer',
          'stupid saying no',
          'feel stupid saying no',
          'offer stack',
          'guarantee stack',
          'bonus stack'
        ],
        requiredMatches: 3,
        contextPatterns: [
          /grand.*slam.*offer/i,
          /irresistible.*offer/i,
          /stupid.*saying.*no/i
        ]
      },
      {
        name: 'Core Four',
        keywords: [
          'core', 'four', 'warm', 'cold', 'outreach', 'content', 'posting', 'ads',
          'advertising', 'channels', 'traffic', 'leads'
        ],
        phrases: [
          'core four',
          'warm outreach',
          'cold outreach',
          'posting content',
          'running ads',
          'four advertising channels',
          'traffic channels'
        ],
        requiredMatches: 4,
        contextPatterns: [
          /core.*four/i,
          /(warm|cold).*outreach/i,
          /posting.*content/i,
          /running.*ads/i
        ]
      },
      {
        name: 'Lead Magnets',
        keywords: [
          'lead', 'magnet', 'ethical', 'bribe', 'free', 'valuable', 'exchange',
          'contact', 'information', 'email', 'download', 'guide'
        ],
        phrases: [
          'lead magnet',
          'ethical bribe',
          'free valuable',
          'in exchange for',
          'contact information',
          'email address',
          'free download',
          'free guide'
        ],
        requiredMatches: 3,
        contextPatterns: [
          /lead.*magnet/i,
          /ethical.*bribe/i,
          /free.*exchange/i
        ]
      },
      {
        name: 'Customer Value Optimization',
        keywords: [
          'ltv', 'lifetime', 'value', 'customer', 'optimize', 'maximize',
          'upsell', 'downsell', 'cross', 'sell', 'retention', 'churn'
        ],
        phrases: [
          'lifetime value',
          'customer lifetime value',
          'ltv optimization',
          'value optimization',
          'maximize customer value',
          'upsell strategy',
          'cross sell',
          'retention rate'
        ],
        requiredMatches: 3,
        contextPatterns: [
          /(lifetime|customer).*value/i,
          /ltv/i,
          /(up|cross).*sell/i
        ]
      },
      {
        name: 'Scaling Framework',
        keywords: [
          'scale', 'scaling', 'growth', 'systematic', 'process', 'framework',
          'operations', 'team', 'systems', 'automation', 'leverage'
        ],
        phrases: [
          'scaling systems',
          'growth framework',
          'systematic scaling',
          'scale operations',
          'scale the business',
          'scaling process',
          'business scaling'
        ],
        requiredMatches: 3,
        contextPatterns: [
          /scal(e|ing).*business/i,
          /scal(e|ing).*system/i,
          /growth.*framework/i
        ]
      },
      {
        name: 'Acquisition Channels',
        keywords: [
          'acquisition', 'channel', 'customer', 'acquire', 'get', 'customers',
          'paid', 'organic', 'referral', 'partnership', 'affiliate'
        ],
        phrases: [
          'customer acquisition',
          'acquisition channel',
          'acquire customers',
          'get customers',
          'paid acquisition',
          'organic acquisition',
          'acquisition strategy'
        ],
        requiredMatches: 3,
        contextPatterns: [
          /customer.*acquisition/i,
          /acquisition.*channel/i,
          /(paid|organic).*acquisition/i
        ]
      },
      {
        name: 'Monetization Strategy',
        keywords: [
          'monetize', 'monetization', 'revenue', 'profit', 'pricing', 'money',
          'convert', 'conversion', 'sales', 'close', 'deal'
        ],
        phrases: [
          'monetization strategy',
          'revenue generation',
          'convert prospects',
          'sales conversion',
          'close deals',
          'pricing strategy',
          'make money'
        ],
        requiredMatches: 3,
        contextPatterns: [
          /monetiz(e|ation)/i,
          /revenue.*generat(e|ion)/i,
          /convert.*prospect/i
        ]
      },
      {
        name: 'Retention Strategy',
        keywords: [
          'retention', 'retain', 'keep', 'customers', 'churn', 'loyalty',
          'engagement', 'satisfaction', 'experience', 'support'
        ],
        phrases: [
          'customer retention',
          'retain customers',
          'keep customers',
          'reduce churn',
          'customer loyalty',
          'customer satisfaction',
          'retention strategy'
        ],
        requiredMatches: 3,
        contextPatterns: [
          /customer.*retention/i,
          /retain.*customer/i,
          /reduce.*churn/i
        ]
      },
      {
        name: 'Referral Systems',
        keywords: [
          'referral', 'refer', 'word', 'mouth', 'recommendation', 'advocate',
          'testimonial', 'review', 'share', 'recommend'
        ],
        phrases: [
          'referral system',
          'word of mouth',
          'customer referral',
          'referral program',
          'get referrals',
          'referral marketing',
          'recommend friends'
        ],
        requiredMatches: 2,
        contextPatterns: [
          /referral.*(system|program)/i,
          /word.*of.*mouth/i,
          /(customer|get).*referral/i
        ]
      }
    ];
  }

  /**
   * Static method for quick framework detection in UI
   */
  static async quickDetect(text: string): Promise<string[]> {
    const detector = new BusinessFrameworkDetector();
    const detections = await detector.detectFrameworks(text);
    return detections
      .filter(d => d.confidence > 0.3)
      .map(d => d.name)
      .slice(0, 5);
  }
}

export default BusinessFrameworkDetector;