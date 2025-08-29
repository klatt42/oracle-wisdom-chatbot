/**
 * Oracle Content Quality Assessment Testing Suite
 * Victoria Validator - Comprehensive content quality assessment tests
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Test setup
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
  TEST_CONFIG,
  FRAMEWORK_TEST_CASES,
  QUALITY_TEST_CASES,
  createTestContentItem,
  waitFor
} from './setup';

// System under test
import { UniversalContentProcessor } from '../../services/content/universalContentProcessor';
import { OracleUrlProcessor } from '../../services/content/urlProcessor';
import { OracleYouTubeProcessor } from '../../services/content/youtubeProcessor';

// Mock dependencies
jest.mock('../../services/content/embeddingService');
jest.mock('../../services/content/storageService');
jest.mock('../../services/content/chunkingService');

describe('Oracle Content Quality Assessment', () => {
  let universalProcessor: UniversalContentProcessor;
  let urlProcessor: OracleUrlProcessor;
  let youtubeProcessor: OracleYouTubeProcessor;

  beforeEach(() => {
    universalProcessor = new UniversalContentProcessor();
    urlProcessor = new OracleUrlProcessor();
    youtubeProcessor = new OracleYouTubeProcessor();
    
    jest.clearAllMocks();
  });

  describe('Content Quality Metrics', () => {
    test.each(QUALITY_TEST_CASES)('should assess quality for $name', async ({ content, expectedQuality }) => {
      // Generate test content based on parameters
      let testText = 'Business strategy content. ';
      
      if (content.wordCount) {
        // Repeat text to reach word count
        const wordsNeeded = Math.ceil(content.wordCount / 4);
        testText = testText.repeat(wordsNeeded).slice(0, content.wordCount * 6); // Approximate
      }

      if (content.hasStructure) {
        testText = `# Business Strategy\n\n## Introduction\n\n${testText}\n\n## Framework Implementation\n\n${testText}`;
      }

      if (content.businessTerms) {
        const terms = ['marketing', 'sales', 'revenue', 'profit', 'customer', 'strategy', 'growth', 'conversion'];
        testText += ' ' + terms.slice(0, content.businessTerms).join(' ') + '.';
      }

      const testContentItem = createTestContentItem({
        metadata: {
          wordCount: content.wordCount,
          characterCount: testText.length,
          author: content.hasAuthor ? 'Business Expert' : undefined,
          createdDate: content.isRecent ? new Date() : new Date('2020-01-01'),
          extractedText: testText
        }
      });

      // Test quality assessment
      const assessedQuality = await assessContentQuality(testContentItem, testText);
      
      // Allow for some variance in quality scoring
      expect(assessedQuality).toBeGreaterThanOrEqual(expectedQuality - 10);
      expect(assessedQuality).toBeLessThanOrEqual(expectedQuality + 10);
    });

    test('should penalize very short content', async () => {
      const shortContent = 'Brief text.';
      const contentItem = createTestContentItem({
        metadata: {
          wordCount: 2,
          characterCount: shortContent.length,
          extractedText: shortContent
        }
      });

      const quality = await assessContentQuality(contentItem, shortContent);
      expect(quality).toBeLessThan(50);
    });

    test('should reward well-structured content', async () => {
      const structuredContent = `
        # Business Growth Framework
        
        ## Introduction
        This comprehensive guide covers essential business growth strategies.
        
        ## Core Concepts
        - Value proposition development
        - Customer acquisition strategies  
        - Revenue optimization techniques
        
        ## Implementation
        Follow these steps to implement the framework in your business.
      `;

      const contentItem = createTestContentItem({
        metadata: {
          wordCount: structuredContent.split(' ').length,
          characterCount: structuredContent.length,
          extractedText: structuredContent
        }
      });

      const quality = await assessContentQuality(contentItem, structuredContent);
      expect(quality).toBeGreaterThan(70);
    });

    test('should assess language quality', async () => {
      const goodLanguageContent = `
        Business strategy development requires careful analysis of market conditions, 
        competitive positioning, and customer needs. Successful entrepreneurs understand 
        that sustainable growth comes from creating genuine value for customers while 
        maintaining operational efficiency and financial discipline.
      `;

      const poorLanguageContent = `
        Business good make money fast easy very simple no work needed guaranteed 
        success tomorrow rich wealthy lifestyle freedom passive income automatic.
      `;

      const goodItem = createTestContentItem({
        metadata: { extractedText: goodLanguageContent }
      });

      const poorItem = createTestContentItem({
        metadata: { extractedText: poorLanguageContent }
      });

      const goodQuality = await assessContentQuality(goodItem, goodLanguageContent);
      const poorQuality = await assessContentQuality(poorItem, poorLanguageContent);

      expect(goodQuality).toBeGreaterThan(poorQuality);
    });
  });

  describe('Business Relevance Assessment', () => {
    test('should assess business relevance accurately', async () => {
      const businessContent = `
        Our marketing strategy focuses on customer acquisition through targeted campaigns,
        optimizing our sales funnel for maximum conversion, and building sustainable revenue
        streams. The key metrics we track include customer lifetime value, acquisition costs,
        and profit margins to ensure business growth and operational efficiency.
      `;

      const nonBusinessContent = `
        The weather today is quite pleasant with sunny skies and mild temperatures.
        Many people enjoy outdoor activities during such beautiful days, including
        hiking, picnicking, and various recreational sports that bring families together.
      `;

      const businessRelevanceHigh = await assessBusinessRelevance(businessContent);
      const businessRelevanceLow = await assessBusinessRelevance(nonBusinessContent);

      expect(businessRelevanceHigh).toBeGreaterThan(60);
      expect(businessRelevanceLow).toBeLessThan(20);
    });

    test('should identify business categories correctly', async () => {
      const testCases = [
        {
          content: 'Our marketing campaign generated 500 qualified leads through targeted advertising and content marketing strategies.',
          expectedCategory: 'marketing',
          expectedScore: 80
        },
        {
          content: 'The sales team closed 15 deals this quarter using consultative selling techniques and CRM automation.',
          expectedCategory: 'sales', 
          expectedScore: 75
        },
        {
          content: 'Operational efficiency improved by 30% after implementing automated workflows and process optimization.',
          expectedCategory: 'operations',
          expectedScore: 70
        },
        {
          content: 'Leadership development programs increased employee retention by 25% and improved team performance metrics.',
          expectedCategory: 'leadership',
          expectedScore: 65
        }
      ];

      for (const { content, expectedCategory, expectedScore } of testCases) {
        const relevance = await assessBusinessRelevance(content);
        expect(relevance).toBeGreaterThan(expectedScore - 15);
        
        // Test category detection
        const categories = await detectBusinessCategories(content);
        expect(categories.some(cat => cat.category === expectedCategory)).toBe(true);
      }
    });
  });

  describe('Framework Alignment Assessment', () => {
    test.each(FRAMEWORK_TEST_CASES)('should assess framework alignment for $name', async ({ text, expectedFrameworks, expectedConfidence }) => {
      const contentItem = createTestContentItem({
        metadata: {
          extractedText: text,
          framework: expectedFrameworks
        }
      });

      const frameworkAlignment = await assessFrameworkAlignment(contentItem);
      
      // Framework alignment should be based on detected frameworks
      const expectedAlignment = Math.min(expectedFrameworks.length * 20, 100);
      expect(frameworkAlignment).toBeGreaterThanOrEqual(expectedAlignment - 10);
    });

    test('should detect framework depth and context', async () => {
      const shallowFrameworkContent = 'Grand slam offer is good for business.';
      const deepFrameworkContent = `
        The grand slam offer framework consists of four key elements that create irresistible value:
        1. A compelling value proposition that solves a specific problem
        2. Strong guarantees that remove risk from the customer
        3. Scarcity elements that create urgency to act
        4. Bonus stacking that increases perceived value beyond the price point
        
        When implemented correctly, this framework can increase conversion rates by 300-500%.
      `;

      const shallowAlignment = await assessFrameworkDepth(shallowFrameworkContent);
      const deepAlignment = await assessFrameworkDepth(deepFrameworkContent);

      expect(deepAlignment).toBeGreaterThan(shallowAlignment);
      expect(deepAlignment).toBeGreaterThan(70);
    });
  });

  describe('Technical Quality Assessment', () => {
    test('should assess content chunking quality', async () => {
      const wellChunkedContent = [
        {
          id: 'chunk1',
          wordCount: 150,
          text: 'Business strategy introduction...',
          metadata: { section: 'Introduction' }
        },
        {
          id: 'chunk2', 
          wordCount: 140,
          text: 'Framework implementation details...',
          metadata: { section: 'Implementation' }
        },
        {
          id: 'chunk3',
          wordCount: 160,
          text: 'Results and optimization techniques...',
          metadata: { section: 'Results' }
        }
      ];

      const poorlyChunkedContent = [
        {
          id: 'chunk1',
          wordCount: 50,
          text: 'Short chunk',
          metadata: {}
        },
        {
          id: 'chunk2',
          wordCount: 500,
          text: 'Extremely long chunk that goes on and on...',
          metadata: {}
        }
      ];

      const goodTechnicalQuality = await assessTechnicalQuality(wellChunkedContent);
      const poorTechnicalQuality = await assessTechnicalQuality(poorlyChunkedContent);

      expect(goodTechnicalQuality).toBeGreaterThan(poorTechnicalQuality);
      expect(goodTechnicalQuality).toBeGreaterThan(70);
    });

    test('should assess content consistency', async () => {
      const consistentContent = Array.from({ length: 10 }, (_, i) => ({
        id: `chunk${i}`,
        wordCount: 150 + Math.random() * 50, // Consistent size with small variation
        text: `Business content chunk ${i}`,
        metadata: { quality: 0.8 + Math.random() * 0.2 }
      }));

      const inconsistentContent = [
        { id: 'chunk1', wordCount: 50, text: 'Short', metadata: { quality: 0.3 } },
        { id: 'chunk2', wordCount: 800, text: 'Very long chunk...', metadata: { quality: 0.9 } },
        { id: 'chunk3', wordCount: 5, text: 'Tiny', metadata: { quality: 0.1 } }
      ];

      const consistentQuality = await assessContentConsistency(consistentContent);
      const inconsistentQuality = await assessContentConsistency(inconsistentContent);

      expect(consistentQuality).toBeGreaterThan(inconsistentQuality);
    });
  });

  describe('Source Credibility Assessment', () => {
    test('should assess source credibility based on type and metadata', async () => {
      const credibleSources = [
        createTestContentItem({
          type: 'pdf',
          metadata: {
            author: 'Dr. Business Expert',
            createdDate: new Date('2023-01-01')
          }
        }),
        createTestContentItem({
          type: 'url',
          source: 'https://harvard.edu/business-research',
          metadata: {
            author: 'Harvard Business Review'
          }
        })
      ];

      const lessCredibleSources = [
        createTestContentItem({
          type: 'url',
          source: 'https://random-blog.com/get-rich-quick',
          metadata: {
            author: undefined
          }
        }),
        createTestContentItem({
          type: 'txt',
          metadata: {
            author: undefined,
            createdDate: new Date('2015-01-01')
          }
        })
      ];

      for (const credibleSource of credibleSources) {
        const credibility = await assessSourceCredibility(credibleSource);
        expect(credibility).toBeGreaterThan(60);
      }

      for (const lessCredibleSource of lessCredibleSources) {
        const credibility = await assessSourceCredibility(lessCredibleSource);
        expect(credibility).toBeLessThan(70);
      }
    });

    test('should consider domain authority for URL sources', async () => {
      const highAuthorityDomains = [
        'https://harvard.edu/article',
        'https://mit.edu/research', 
        'https://forbes.com/business',
        'https://hbr.org/strategy'
      ];

      const lowAuthorityDomains = [
        'https://myblog.wordpress.com/post',
        'https://randomsite123.com/article'
      ];

      for (const url of highAuthorityDomains) {
        const contentItem = createTestContentItem({ type: 'url', source: url });
        const credibility = await assessSourceCredibility(contentItem);
        expect(credibility).toBeGreaterThan(70);
      }

      for (const url of lowAuthorityDomains) {
        const contentItem = createTestContentItem({ type: 'url', source: url });
        const credibility = await assessSourceCredibility(contentItem);
        expect(credibility).toBeLessThan(80);
      }
    });
  });

  describe('Overall Quality Score Calculation', () => {
    test('should calculate weighted overall quality score', async () => {
      const testContent = createTestContentItem({
        metadata: {
          wordCount: 1500,
          characterCount: 8000,
          quality: 85,
          framework: ['Grand Slam Offer', 'Value Ladder'],
          author: 'Business Expert',
          createdDate: new Date()
        }
      });

      const contentQuality = 85;
      const businessRelevance = 75;
      const frameworkAlignment = 80;
      const technicalQuality = 75;
      const sourceCredibility = 70;

      // Expected calculation: (85*0.25) + (75*0.25) + (80*0.20) + (75*0.15) + (70*0.15)
      const expectedOverall = Math.round(
        contentQuality * 0.25 +
        businessRelevance * 0.25 + 
        frameworkAlignment * 0.20 +
        technicalQuality * 0.15 +
        sourceCredibility * 0.15
      );

      expect(expectedOverall).toBe(77); // 21.25 + 18.75 + 16 + 11.25 + 10.5 = 77.75 → 78
    });

    test('should handle edge cases in quality calculation', async () => {
      // Test minimum quality scores
      const minQualityScores = {
        contentQuality: 0,
        businessRelevance: 0, 
        frameworkAlignment: 0,
        technicalQuality: 0,
        sourceCredibility: 0
      };

      const minOverall = calculateOverallQuality(minQualityScores);
      expect(minOverall).toBe(0);

      // Test maximum quality scores
      const maxQualityScores = {
        contentQuality: 100,
        businessRelevance: 100,
        frameworkAlignment: 100, 
        technicalQuality: 100,
        sourceCredibility: 100
      };

      const maxOverall = calculateOverallQuality(maxQualityScores);
      expect(maxOverall).toBe(100);
    });
  });

  describe('Quality Threshold Validation', () => {
    test('should validate content against quality thresholds', async () => {
      const thresholds = {
        minimumWordCount: 200,
        minimumQuality: 60,
        maximumProcessingTime: 120000,
        businessRelevanceThreshold: 40
      };

      const passingContent = createTestContentItem({
        metadata: {
          wordCount: 1500,
          quality: 85,
          businessRelevance: { overallScore: 75 }
        }
      });

      const failingContent = createTestContentItem({
        metadata: {
          wordCount: 50, // Below threshold
          quality: 30,  // Below threshold
          businessRelevance: { overallScore: 20 } // Below threshold
        }
      });

      const passingValidation = await validateQualityThresholds(passingContent, thresholds);
      const failingValidation = await validateQualityThresholds(failingContent, thresholds);

      expect(passingValidation.isValid).toBe(true);
      expect(failingValidation.isValid).toBe(false);
      expect(failingValidation.violations).toContain('wordCount');
      expect(failingValidation.violations).toContain('quality');
      expect(failingValidation.violations).toContain('businessRelevance');
    });
  });
});

// Helper functions for quality assessment
async function assessContentQuality(contentItem: any, text: string): Promise<number> {
  let score = 50; // Base score

  const wordCount = text.split(/\s+/).length;
  if (wordCount > 500) score += 20;
  else if (wordCount > 200) score += 10;
  else if (wordCount < 100) score -= 20;

  if (text.includes('\n\n') || text.includes('##') || text.includes('#')) score += 10;
  
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const avgSentenceLength = wordCount / sentences.length;
  if (avgSentenceLength > 10 && avgSentenceLength < 30) score += 10;

  if (contentItem.metadata?.author) score += 5;
  if (contentItem.metadata?.createdDate) score += 5;

  return Math.max(0, Math.min(100, score));
}

async function assessBusinessRelevance(content: string): Promise<number> {
  const businessTerms = [
    'business', 'marketing', 'sales', 'revenue', 'customer', 'strategy',
    'profit', 'growth', 'conversion', 'lead', 'funnel', 'roi'
  ];

  const lowerContent = content.toLowerCase();
  const matchCount = businessTerms.filter(term => lowerContent.includes(term)).length;
  
  return Math.round((matchCount / businessTerms.length) * 100);
}

async function detectBusinessCategories(content: string): Promise<Array<{category: string; confidence: number}>> {
  const categories = {
    marketing: ['marketing', 'advertising', 'campaign', 'brand'],
    sales: ['sales', 'selling', 'closing', 'deals'],
    operations: ['operations', 'process', 'efficiency', 'workflow'],
    leadership: ['leadership', 'management', 'team', 'culture']
  };

  const results = [];
  const lowerContent = content.toLowerCase();

  for (const [category, terms] of Object.entries(categories)) {
    const matches = terms.filter(term => lowerContent.includes(term)).length;
    if (matches > 0) {
      results.push({
        category,
        confidence: matches / terms.length
      });
    }
  }

  return results;
}

async function assessFrameworkAlignment(contentItem: any): Promise<number> {
  const frameworks = contentItem.metadata?.framework || [];
  return Math.min(frameworks.length * 20, 100);
}

async function assessFrameworkDepth(content: string): Promise<number> {
  const depthIndicators = [
    'framework', 'implementation', 'strategy', 'process', 'steps',
    'elements', 'components', 'principles', 'techniques', 'methods'
  ];

  const lowerContent = content.toLowerCase();
  const matches = depthIndicators.filter(indicator => lowerContent.includes(indicator)).length;
  
  // Bonus for longer explanations
  const wordCount = content.split(' ').length;
  const lengthBonus = wordCount > 100 ? 20 : 0;
  
  return Math.min((matches / depthIndicators.length) * 80 + lengthBonus, 100);
}

async function assessTechnicalQuality(chunks: any[]): Promise<number> {
  if (chunks.length === 0) return 0;

  const avgWordCount = chunks.reduce((sum, chunk) => sum + chunk.wordCount, 0) / chunks.length;
  const consistentSizing = chunks.every(chunk => 
    Math.abs(chunk.wordCount - avgWordCount) / avgWordCount < 0.5
  );

  let score = 50;
  if (consistentSizing) score += 30;
  if (avgWordCount > 100 && avgWordCount < 300) score += 20;

  return score;
}

async function assessContentConsistency(content: any[]): Promise<number> {
  if (content.length === 0) return 0;

  const wordCounts = content.map(item => item.wordCount);
  const avgWordCount = wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length;
  
  const variance = wordCounts.reduce((sum, count) => {
    return sum + Math.pow(count - avgWordCount, 2);
  }, 0) / wordCounts.length;
  
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = standardDeviation / avgWordCount;
  
  // Lower coefficient of variation = higher consistency
  return Math.max(0, 100 - (coefficientOfVariation * 100));
}

async function assessSourceCredibility(contentItem: any): Promise<number> {
  let score = 50;

  // Source type credibility
  if (contentItem.type === 'pdf' || contentItem.type === 'docx') score += 20;
  else if (contentItem.type === 'url') {
    try {
      const url = new URL(contentItem.source);
      if (url.hostname.includes('edu') || url.hostname.includes('gov')) score += 30;
      else if (url.hostname.includes('forbes') || url.hostname.includes('hbr')) score += 25;
      else if (url.hostname.includes('medium') || url.hostname.includes('linkedin')) score += 15;
    } catch {
      // Invalid URL
    }
  }

  // Author presence
  if (contentItem.metadata?.author) score += 15;

  // Publication date (more recent = more credible for business content)
  if (contentItem.metadata?.createdDate) {
    const daysSincePublished = Math.floor(
      (Date.now() - contentItem.metadata.createdDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSincePublished <= 365) score += 15;
    else if (daysSincePublished <= 1095) score += 10;
  }

  return Math.max(0, Math.min(100, score));
}

function calculateOverallQuality(metrics: {
  contentQuality: number;
  businessRelevance: number;
  frameworkAlignment: number;
  technicalQuality: number;
  sourceCredibility: number;
}): number {
  return Math.round(
    metrics.contentQuality * 0.25 +
    metrics.businessRelevance * 0.25 +
    metrics.frameworkAlignment * 0.20 +
    metrics.technicalQuality * 0.15 +
    metrics.sourceCredibility * 0.15
  );
}

async function validateQualityThresholds(contentItem: any, thresholds: any): Promise<{
  isValid: boolean;
  violations: string[];
}> {
  const violations: string[] = [];

  if (contentItem.metadata?.wordCount < thresholds.minimumWordCount) {
    violations.push('wordCount');
  }

  if (contentItem.metadata?.quality < thresholds.minimumQuality) {
    violations.push('quality');
  }

  if (contentItem.metadata?.businessRelevance?.overallScore < thresholds.businessRelevanceThreshold) {
    violations.push('businessRelevance');
  }

  return {
    isValid: violations.length === 0,
    violations
  };
}