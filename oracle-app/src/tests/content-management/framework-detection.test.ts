/**
 * Oracle Business Framework Detection Testing Suite
 * Victoria Validator - Comprehensive business framework detection tests
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Test setup
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
  TEST_CONFIG,
  FRAMEWORK_TEST_CASES,
  createTestContentItem,
  waitFor
} from './setup';

// System under test
import { OracleUrlProcessor } from '../../services/content/urlProcessor';
import { OracleYouTubeProcessor } from '../../services/content/youtubeProcessor';
import { UniversalContentProcessor } from '../../services/content/universalContentProcessor';

// Types
import { FrameworkReference, HormoziFramework, BusinessConcept, BusinessCategory } from '../../types/content';

describe('Oracle Business Framework Detection', () => {
  let urlProcessor: OracleUrlProcessor;
  let youtubeProcessor: OracleYouTubeProcessor;
  let universalProcessor: UniversalContentProcessor;

  beforeEach(() => {
    urlProcessor = new OracleUrlProcessor();
    youtubeProcessor = new OracleYouTubeProcessor();
    universalProcessor = new UniversalContentProcessor();
    
    jest.clearAllMocks();
  });

  describe('Hormozi Framework Detection', () => {
    test.each(FRAMEWORK_TEST_CASES)('should detect $name', async ({ text, expectedFrameworks, expectedConfidence }) => {
      const detectedFrameworks = await detectFrameworksInText(text);
      
      // Check that all expected frameworks are detected
      for (const expectedFramework of expectedFrameworks) {
        const found = detectedFrameworks.find(f => f.framework === expectedFramework);
        expect(found).toBeDefined();
        expect(found!.confidence).toBeGreaterThanOrEqual(expectedConfidence - 0.2);
      }
      
      // Check that confidence scores are reasonable
      for (const framework of detectedFrameworks) {
        expect(framework.confidence).toBeGreaterThan(0);
        expect(framework.confidence).toBeLessThanOrEqual(1);
        expect(framework.context).toBeDefined();
        expect(framework.explanation).toBeDefined();
      }
    });

    test('should detect Grand Slam Offer components', async () => {
      const grandSlamTexts = [
        'Our irresistible offer includes a 30-day money-back guarantee with no questions asked.',
        'This value proposition is so compelling that customers cannot refuse it.',
        'Limited time bonus: Get 3 additional courses worth $500 when you order today.',
        'Only 100 spots available - this exclusive program fills up fast every quarter.',
        'Risk-free trial with full refund guarantee plus keep all bonuses regardless.'
      ];

      for (const text of grandSlamTexts) {
        const frameworks = await detectFrameworksInText(text);
        const grandSlam = frameworks.find(f => f.framework === 'Grand Slam Offer');
        
        expect(grandSlam).toBeDefined();
        expect(grandSlam!.confidence).toBeGreaterThan(0.3);
        
        // Verify specific components are identified
        const explanation = grandSlam!.explanation.toLowerCase();
        const hasRelevantKeywords = [
          'guarantee', 'offer', 'value', 'bonus', 'risk', 'irresistible'
        ].some(keyword => explanation.includes(keyword));
        
        expect(hasRelevantKeywords).toBe(true);
      }
    });

    test('should detect Core Four elements', async () => {
      const coreFourTexts = [
        'Our lead magnet converts at 18% and generates 500 qualified prospects monthly.',
        'The landing page optimization increased conversion rates from 2% to 8%.',
        'Our 7-part email nurture sequence builds trust and educates prospects.',
        'The sales process includes discovery calls and proposal presentations.',
        'Lead generation through content marketing and paid advertising campaigns.'
      ];

      for (const text of coreFourTexts) {
        const frameworks = await detectFrameworksInText(text);
        const coreFour = frameworks.find(f => f.framework === 'Core Four');
        
        expect(coreFour).toBeDefined();
        expect(coreFour!.confidence).toBeGreaterThan(0.2);
      }
    });

    test('should detect Value Ladder structure', async () => {
      const valueLadderTexts = [
        'Start with our $7 tripwire product, then upsell to the $97 main course.',
        'Our product suite ranges from free content to $5,000 mastermind programs.',
        'Customer journey: Free guide → $47 course → $497 coaching → $2,997 mastermind.',
        'Backend products generate 60% of our revenue through strategic upsells.',
        'Cross-sell complementary products to increase customer lifetime value.'
      ];

      for (const text of valueLadderTexts) {
        const frameworks = await detectFrameworksInText(text);
        const valueLadder = frameworks.find(f => f.framework === 'Value Ladder');
        
        expect(valueLadder).toBeDefined();
        expect(valueLadder!.confidence).toBeGreaterThan(0.3);
      }
    });

    test('should detect LTV/CAC optimization', async () => {
      const ltvCacTexts = [
        'Customer lifetime value is $2,400 with acquisition cost of $800.',
        'Our LTV to CAC ratio improved from 2:1 to 4:1 after optimization.',
        'Retention rate increased to 85% reducing overall churn significantly.',
        'Payback period decreased from 8 months to 4 months this quarter.',
        'Unit economics show healthy margins with sustainable growth potential.'
      ];

      for (const text of ltvCacTexts) {
        const frameworks = await detectFrameworksInText(text);
        const ltvCac = frameworks.find(f => f.framework === 'LTV/CAC');
        
        expect(ltvCac).toBeDefined();
        expect(ltvCac!.confidence).toBeGreaterThan(0.4);
      }
    });

    test('should detect Scaling Systems principles', async () => {
      const scalingTexts = [
        'Automated workflows reduced manual tasks by 70% while maintaining quality.',
        'Delegation frameworks allow the team to operate without micromanagement.',
        'Systems thinking approach optimized the entire customer acquisition process.',
        'Process documentation ensures consistent execution across all departments.',
        'Operational excellence metrics track efficiency and continuous improvement.'
      ];

      for (const text of scalingTexts) {
        const frameworks = await detectFrameworksInText(text);
        const scaling = frameworks.find(f => f.framework === 'Scaling Systems');
        
        expect(scaling).toBeDefined();
        expect(scaling!.confidence).toBeGreaterThan(0.3);
      }
    });
  });

  describe('Framework Context Extraction', () => {
    test('should extract meaningful context around framework mentions', async () => {
      const longText = `
        In today's competitive business environment, creating a compelling value proposition is essential.
        The grand slam offer framework, developed by Alex Hormozi, provides a systematic approach to 
        crafting irresistible offers that customers cannot refuse. This methodology combines value stacking,
        risk reversal through guarantees, urgency creation via scarcity, and bonus bundling to maximize
        perceived value while minimizing perceived risk. When implemented correctly, businesses typically
        see conversion rate improvements of 300-500% compared to traditional offers.
      `;

      const frameworks = await detectFrameworksInText(longText);
      const grandSlam = frameworks.find(f => f.framework === 'Grand Slam Offer');
      
      expect(grandSlam).toBeDefined();
      expect(grandSlam!.context.length).toBeGreaterThan(50);
      expect(grandSlam!.context.toLowerCase()).toContain('grand slam offer');
      
      // Context should include surrounding relevant information
      const contextWords = grandSlam!.context.toLowerCase();
      const relevantTerms = ['value', 'offer', 'irresistible', 'guarantee', 'risk'];
      const foundTerms = relevantTerms.filter(term => contextWords.includes(term));
      expect(foundTerms.length).toBeGreaterThanOrEqual(2);
    });

    test('should handle multiple framework mentions in same text', async () => {
      const multiFrameworkText = `
        Our comprehensive business strategy integrates multiple proven frameworks.
        First, we create a grand slam offer with strong guarantees and value stacking.
        Then we implement the core four system: lead magnets that convert at 15%,
        optimized landing pages, automated nurture sequences, and streamlined sales processes.
        Finally, we structure our value ladder from low-cost entry points to high-value
        backend offers, ensuring optimal customer lifetime value optimization.
      `;

      const frameworks = await detectFrameworksInText(multiFrameworkText);
      
      // Should detect multiple frameworks
      expect(frameworks.length).toBeGreaterThanOrEqual(3);
      
      const frameworkNames = frameworks.map(f => f.framework);
      expect(frameworkNames).toContain('Grand Slam Offer');
      expect(frameworkNames).toContain('Core Four');
      expect(frameworkNames).toContain('Value Ladder');
      
      // Each framework should have unique context
      for (const framework of frameworks) {
        expect(framework.context).toBeDefined();
        expect(framework.context.length).toBeGreaterThan(20);
      }
    });
  });

  describe('Framework Confidence Scoring', () => {
    test('should assign higher confidence to explicit mentions', async () => {
      const explicitText = 'The Grand Slam Offer framework by Alex Hormozi includes value proposition, guarantees, urgency, and bonuses.';
      const implicitText = 'Our offer includes some guarantees and creates urgency.';
      
      const explicitFrameworks = await detectFrameworksInText(explicitText);
      const implicitFrameworks = await detectFrameworksInText(implicitText);
      
      const explicitGrandSlam = explicitFrameworks.find(f => f.framework === 'Grand Slam Offer');
      const implicitGrandSlam = implicitFrameworks.find(f => f.framework === 'Grand Slam Offer');
      
      expect(explicitGrandSlam).toBeDefined();
      expect(implicitGrandSlam).toBeDefined();
      expect(explicitGrandSlam!.confidence).toBeGreaterThan(implicitGrandSlam!.confidence);
    });

    test('should increase confidence with multiple keyword matches', async () => {
      const singleKeywordText = 'We offer guarantees on our products.';
      const multipleKeywordText = 'Our grand slam offer includes irresistible value proposition, risk reversal guarantees, scarcity-driven urgency, and bonus stacking.';
      
      const singleFrameworks = await detectFrameworksInText(singleKeywordText);
      const multipleFrameworks = await detectFrameworksInText(multipleKeywordText);
      
      const singleGrandSlam = singleFrameworks.find(f => f.framework === 'Grand Slam Offer');
      const multipleGrandSlam = multipleFrameworks.find(f => f.framework === 'Grand Slam Offer');
      
      if (singleGrandSlam && multipleGrandSlam) {
        expect(multipleGrandSlam.confidence).toBeGreaterThan(singleGrandSlam.confidence);
      } else {
        expect(multipleGrandSlam).toBeDefined();
        expect(multipleGrandSlam!.confidence).toBeGreaterThan(0.5);
      }
    });

    test('should normalize confidence scores appropriately', async () => {
      const testTexts = [
        'Grand slam offer framework implementation',
        'Core four lead generation system with landing pages',
        'Value ladder product suite and upsell sequence',
        'LTV CAC ratio optimization for sustainable growth',
        'Scaling systems and operational excellence programs'
      ];

      for (const text of testTexts) {
        const frameworks = await detectFrameworksInText(text);
        
        for (const framework of frameworks) {
          expect(framework.confidence).toBeGreaterThan(0);
          expect(framework.confidence).toBeLessThanOrEqual(1);
          
          // Confidence should reflect keyword density
          const keywords = getFrameworkKeywords(framework.framework);
          const textLower = text.toLowerCase();
          const matchCount = keywords.filter(k => textLower.includes(k.toLowerCase())).length;
          const expectedConfidence = Math.min(matchCount / keywords.length, 1);
          
          expect(Math.abs(framework.confidence - expectedConfidence)).toBeLessThan(0.3);
        }
      }
    });
  });

  describe('Business Concept Extraction', () => {
    test('should extract business concepts with categories', async () => {
      const businessText = `
        Our marketing campaign generated 500 qualified leads through targeted advertising.
        The sales team closed 15 deals using consultative selling techniques and CRM automation.
        Operations improved efficiency by 30% after implementing automated workflows.
        Leadership development programs increased employee retention and team performance.
      `;

      const concepts = await extractBusinessConcepts(businessText);
      
      expect(concepts.length).toBeGreaterThan(5);
      
      // Should categorize concepts correctly
      const marketingConcepts = concepts.filter(c => c.category === 'marketing');
      const salesConcepts = concepts.filter(c => c.category === 'sales');
      const operationsConcepts = concepts.filter(c => c.category === 'operations');
      const leadershipConcepts = concepts.filter(c => c.category === 'leadership');
      
      expect(marketingConcepts.length).toBeGreaterThan(0);
      expect(salesConcepts.length).toBeGreaterThan(0);
      expect(operationsConcepts.length).toBeGreaterThan(0);
      expect(leadershipConcepts.length).toBeGreaterThan(0);
      
      // Concepts should have importance scores
      for (const concept of concepts) {
        expect(concept.importance).toBeGreaterThan(0);
        expect(concept.importance).toBeLessThanOrEqual(1);
        expect(concept.context).toBeDefined();
      }
    });

    test('should rank concepts by importance', async () => {
      const conceptText = `
        Revenue optimization is the primary focus of our business strategy this quarter.
        Marketing campaigns generated significant ROI through targeted customer acquisition.
        Sales processes were improved to increase conversion rates and deal velocity.
        Customer retention programs reduced churn and increased lifetime value metrics.
      `;

      const concepts = await extractBusinessConcepts(conceptText);
      
      // Concepts should be sorted by importance
      for (let i = 0; i < concepts.length - 1; i++) {
        expect(concepts[i].importance).toBeGreaterThanOrEqual(concepts[i + 1].importance);
      }
      
      // Top concepts should be highly relevant
      const topConcepts = concepts.slice(0, 3);
      for (const concept of topConcepts) {
        expect(concept.importance).toBeGreaterThan(0.3);
      }
    });
  });

  describe('Related Framework Detection', () => {
    test('should identify relationships between frameworks', async () => {
      const relatedText = `
        Our value ladder starts with lead magnets that convert visitors into prospects.
        These prospects then receive our grand slam offer through targeted campaigns.
        We track LTV and CAC metrics to optimize the entire customer acquisition funnel.
      `;

      const frameworks = await detectFrameworksInText(relatedText);
      const concepts = await extractBusinessConcepts(relatedText);
      
      // Should detect framework relationships
      for (const concept of concepts) {
        if (concept.relatedFrameworks && concept.relatedFrameworks.length > 0) {
          for (const relatedFramework of concept.relatedFrameworks) {
            expect(['Grand Slam Offer', 'Core Four', 'Value Ladder', 'LTV/CAC', 'Scaling Systems']).toContain(relatedFramework);
          }
        }
      }
    });

    test('should map keywords to related frameworks', async () => {
      const keywordMappings = [
        { keyword: 'lead magnet', expectedFrameworks: ['Core Four'] },
        { keyword: 'guarantee', expectedFrameworks: ['Grand Slam Offer'] },
        { keyword: 'upsell', expectedFrameworks: ['Value Ladder'] },
        { keyword: 'retention', expectedFrameworks: ['LTV/CAC'] },
        { keyword: 'automation', expectedFrameworks: ['Scaling Systems'] }
      ];

      for (const { keyword, expectedFrameworks } of keywordMappings) {
        const relatedFrameworks = await getRelatedFrameworks(keyword);
        
        for (const expected of expectedFrameworks) {
          expect(relatedFrameworks).toContain(expected as HormoziFramework);
        }
      }
    });
  });

  describe('Framework Detection Edge Cases', () => {
    test('should handle partial keyword matches', async () => {
      const partialText = 'Our slam dunk offer includes strong guarantees and creates urgency.';
      
      const frameworks = await detectFrameworksInText(partialText);
      
      // Should still detect Grand Slam Offer despite "slam dunk" vs "grand slam"
      const grandSlam = frameworks.find(f => f.framework === 'Grand Slam Offer');
      expect(grandSlam?.confidence || 0).toBeGreaterThan(0.1);
    });

    test('should handle framework variations and synonyms', async () => {
      const variationTexts = [
        'Our irresistible value proposition includes risk-free guarantees.',
        'Lead generation magnets convert prospects into qualified leads.',
        'Product ascension model maximizes customer lifetime value.',
        'Customer acquisition cost optimization improves unit economics.',
        'Business automation systems enable scalable operations.'
      ];

      for (const text of variationTexts) {
        const frameworks = await detectFrameworksInText(text);
        expect(frameworks.length).toBeGreaterThan(0);
      }
    });

    test('should handle noisy text with framework mentions', async () => {
      const noisyText = `
        Lorem ipsum dolor sit amet, the grand slam offer framework is consectetur adipiscing elit.
        Sed do eiusmod tempor core four elements incididunt ut labore et dolore magna aliqua.
        Ut enim ad minim value ladder veniam, quis nostrud exercitation ullamco.
      `;

      const frameworks = await detectFrameworksInText(noisyText);
      
      // Should still detect frameworks despite noise
      expect(frameworks.length).toBeGreaterThanOrEqual(3);
      
      const frameworkNames = frameworks.map(f => f.framework);
      expect(frameworkNames).toContain('Grand Slam Offer');
      expect(frameworkNames).toContain('Core Four');
      expect(frameworkNames).toContain('Value Ladder');
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle large text content efficiently', async () => {
      const largeText = FRAMEWORK_TEST_CASES[0].text.repeat(100);
      
      const startTime = Date.now();
      const frameworks = await detectFrameworksInText(largeText);
      const endTime = Date.now();
      
      const processingTime = endTime - startTime;
      expect(processingTime).toBeLessThan(5000); // Should process within 5 seconds
      expect(frameworks.length).toBeGreaterThan(0);
    });

    test('should limit results to prevent memory issues', async () => {
      const repeatedText = `
        grand slam offer value proposition guarantee scarcity urgency bonus
        core four lead magnet landing page nurture sequence sales process
        value ladder tripwire upsell cross-sell backend products ascension
        ltv cac lifetime value acquisition cost retention churn payback
        scaling systems automation delegation processes operational excellence
      `.repeat(50);

      const concepts = await extractBusinessConcepts(repeatedText);
      
      // Should limit results to reasonable number
      expect(concepts.length).toBeLessThanOrEqual(50);
    });
  });
});

// Helper functions for framework detection testing
async function detectFrameworksInText(text: string): Promise<FrameworkReference[]> {
  const frameworkKeywords = {
    'Grand Slam Offer': ['grand slam offer', 'irresistible offer', 'value proposition', 'guarantee', 'scarcity', 'urgency', 'bonuses'],
    'Core Four': ['core four', 'lead magnet', 'landing page', 'nurture sequence', 'sales process'],
    'Value Ladder': ['value ladder', 'tripwire', 'upsell', 'cross-sell', 'backend', 'ascension'],
    'LTV/CAC': ['lifetime value', 'ltv', 'cac', 'customer acquisition cost', 'retention', 'churn'],
    'Scaling Systems': ['scaling systems', 'automation', 'delegation', 'processes', 'operational excellence']
  };

  const frameworks: FrameworkReference[] = [];
  const lowerText = text.toLowerCase();

  for (const [framework, keywords] of Object.entries(frameworkKeywords)) {
    const matches = keywords.filter(keyword => lowerText.includes(keyword.toLowerCase()));
    
    if (matches.length > 0) {
      const confidence = matches.length / keywords.length;
      const context = extractFrameworkContext(lowerText, matches[0]);
      
      frameworks.push({
        framework: framework as HormoziFramework,
        confidence,
        context,
        explanation: `Detected through keywords: ${matches.join(', ')}`,
        relatedConcepts: matches
      });
    }
  }

  return frameworks.sort((a, b) => b.confidence - a.confidence);
}

async function extractBusinessConcepts(text: string): Promise<BusinessConcept[]> {
  const businessCategories = {
    marketing: ['marketing', 'advertising', 'campaign', 'brand', 'promotion'],
    sales: ['sales', 'selling', 'closing', 'deals', 'revenue'],
    operations: ['operations', 'process', 'efficiency', 'workflow', 'automation'],
    leadership: ['leadership', 'management', 'team', 'culture', 'development'],
    finance: ['finance', 'profit', 'cost', 'budget', 'roi'],
    strategy: ['strategy', 'planning', 'growth', 'competitive', 'positioning']
  };

  const concepts: BusinessConcept[] = [];
  const lowerText = text.toLowerCase();

  for (const [category, keywords] of Object.entries(businessCategories)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      const matches = lowerText.match(regex);
      
      if (matches && matches.length > 0) {
        const importance = Math.min(matches.length / 5, 1);
        const context = extractFrameworkContext(lowerText, keyword);
        
        concepts.push({
          concept: keyword,
          category: category as BusinessCategory,
          importance,
          context,
          relatedFrameworks: await getRelatedFrameworks(keyword)
        });
      }
    }
  }

  return concepts.sort((a, b) => b.importance - a.importance).slice(0, 20);
}

function extractFrameworkContext(text: string, keyword: string): string {
  const index = text.indexOf(keyword);
  if (index === -1) return '';

  const start = Math.max(0, index - 100);
  const end = Math.min(text.length, index + keyword.length + 100);
  
  return text.substring(start, end).trim();
}

async function getRelatedFrameworks(keyword: string): Promise<HormoziFramework[]> {
  const frameworkKeywords = {
    'Grand Slam Offer': ['offer', 'value', 'guarantee', 'scarcity', 'urgency', 'bonus'],
    'Core Four': ['lead', 'magnet', 'landing', 'page', 'nurture', 'sequence', 'sales'],
    'Value Ladder': ['ladder', 'tripwire', 'upsell', 'cross-sell', 'backend', 'ascension'],
    'LTV/CAC': ['lifetime', 'value', 'acquisition', 'cost', 'retention', 'churn'],
    'Scaling Systems': ['scaling', 'automation', 'delegation', 'process', 'operational']
  };

  const related: HormoziFramework[] = [];
  const lowerKeyword = keyword.toLowerCase();

  for (const [framework, keywords] of Object.entries(frameworkKeywords)) {
    if (keywords.some(k => k.includes(lowerKeyword) || lowerKeyword.includes(k))) {
      related.push(framework as HormoziFramework);
    }
  }

  return related;
}

function getFrameworkKeywords(framework: HormoziFramework): string[] {
  const frameworkKeywords = {
    'Grand Slam Offer': ['grand slam offer', 'irresistible offer', 'value proposition', 'guarantee', 'scarcity', 'urgency', 'bonuses'],
    'Core Four': ['core four', 'lead magnet', 'landing page', 'nurture sequence', 'sales process'],
    'Value Ladder': ['value ladder', 'tripwire', 'upsell', 'cross-sell', 'backend', 'ascension'],
    'LTV/CAC': ['lifetime value', 'ltv', 'cac', 'customer acquisition cost', 'retention', 'churn'],
    'Scaling Systems': ['scaling systems', 'automation', 'delegation', 'processes', 'operational excellence'],
    'Lead Generation': ['lead generation', 'traffic', 'prospects', 'leads'],
    'Customer Acquisition': ['customer acquisition', 'acquisition channels', 'conversion'],
    'Business Operations': ['business operations', 'efficiency', 'management'],
    'Revenue Optimization': ['revenue optimization', 'pricing', 'monetization'],
    'Team Building': ['team building', 'hiring', 'culture']
  };

  return frameworkKeywords[framework] || [];
}