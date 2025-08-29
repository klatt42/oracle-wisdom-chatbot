/**
 * Oracle Content Management Testing Setup
 * Victoria Validator - Test environment configuration and utilities
 */

import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';

// Test utilities
export const TEST_CONFIG = {
  TEST_DIR: path.join(process.cwd(), 'test-data'),
  UPLOAD_DIR: path.join(process.cwd(), 'test-uploads'),
  TIMEOUT: 30000,
  JWT_SECRET: 'test-oracle-secret',
  YOUTUBE_API_KEY: 'test-youtube-key'
};

// Mock content samples
export const MOCK_CONTENT = {
  PDF_SAMPLE: 'test-business-guide.pdf',
  DOCX_SAMPLE: 'test-marketing-strategy.docx',
  TXT_SAMPLE: 'test-sales-framework.txt',
  MD_SAMPLE: 'test-business-plan.md',
  BUSINESS_URL: 'https://example.com/business-article',
  YOUTUBE_URL: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  INVALID_URL: 'not-a-valid-url',
  MALICIOUS_URL: 'javascript:alert(1)'
};

// Test user credentials
export const TEST_USERS = {
  ADMIN: {
    userId: 'admin-test-123',
    email: 'admin@oracle-test.com',
    role: 'admin',
    token: ''
  },
  REGULAR_USER: {
    userId: 'user-test-456',
    email: 'user@oracle-test.com',
    role: 'user',
    token: ''
  },
  UNAUTHORIZED: {
    userId: 'unauthorized-789',
    email: 'unauthorized@oracle-test.com',
    role: 'user',
    token: 'invalid-token'
  }
};

// Framework detection test cases
export const FRAMEWORK_TEST_CASES = [
  {
    name: 'Grand Slam Offer Detection',
    text: 'Our grand slam offer includes an irresistible value proposition with a 30-day money-back guarantee, exclusive bonuses worth $500, and limited-time scarcity.',
    expectedFrameworks: ['Grand Slam Offer'],
    expectedConfidence: 0.6
  },
  {
    name: 'Core Four Detection',
    text: 'The lead magnet converts at 15% on our landing page, followed by a 5-part nurture sequence that drives leads through our optimized sales process.',
    expectedFrameworks: ['Core Four'],
    expectedConfidence: 0.5
  },
  {
    name: 'Value Ladder Detection',
    text: 'Our value ladder starts with a $7 tripwire, upsells to a $97 course, then cross-sells our $497 coaching program and $2,000 mastermind.',
    expectedFrameworks: ['Value Ladder'],
    expectedConfidence: 0.7
  },
  {
    name: 'Multiple Framework Detection',
    text: 'We use lead magnets to build our value ladder, starting with free content, then upselling to premium offers with grand slam guarantees.',
    expectedFrameworks: ['Grand Slam Offer', 'Core Four', 'Value Ladder'],
    expectedConfidence: 0.4
  }
];

// Quality assessment test cases
export const QUALITY_TEST_CASES = [
  {
    name: 'High Quality Business Content',
    content: {
      wordCount: 2500,
      hasStructure: true,
      hasAuthor: true,
      isRecent: true,
      businessTerms: 8
    },
    expectedQuality: 85
  },
  {
    name: 'Medium Quality Content',
    content: {
      wordCount: 800,
      hasStructure: true,
      hasAuthor: false,
      isRecent: false,
      businessTerms: 4
    },
    expectedQuality: 65
  },
  {
    name: 'Low Quality Content',
    content: {
      wordCount: 150,
      hasStructure: false,
      hasAuthor: false,
      isRecent: false,
      businessTerms: 1
    },
    expectedQuality: 35
  }
];

// URL test cases
export const URL_TEST_CASES = [
  {
    name: 'Valid Business Article',
    url: 'https://example.com/business-strategy-guide',
    shouldSucceed: true,
    expectedType: 'url'
  },
  {
    name: 'Invalid URL Format',
    url: 'not-a-url',
    shouldSucceed: false,
    expectedError: 'Invalid URL format'
  },
  {
    name: 'Blocked Domain',
    url: 'http://localhost/article',
    shouldSucceed: false,
    expectedError: 'URL domain is not allowed'
  },
  {
    name: 'Direct File URL',
    url: 'https://example.com/document.pdf',
    shouldSucceed: false,
    expectedError: 'Direct file URLs should be uploaded via the file upload endpoint'
  }
];

// YouTube test cases
export const YOUTUBE_TEST_CASES = [
  {
    name: 'Standard YouTube URL',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    shouldSucceed: true,
    expectedVideoId: 'dQw4w9WgXcQ'
  },
  {
    name: 'Short YouTube URL',
    url: 'https://youtu.be/dQw4w9WgXcQ',
    shouldSucceed: true,
    expectedVideoId: 'dQw4w9WgXcQ'
  },
  {
    name: 'YouTube Embed URL',
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    shouldSucceed: true,
    expectedVideoId: 'dQw4w9WgXcQ'
  },
  {
    name: 'Invalid YouTube URL',
    url: 'https://vimeo.com/123456789',
    shouldSucceed: false,
    expectedError: 'URL must be from YouTube domain'
  },
  {
    name: 'Malformed Video ID',
    url: 'https://youtube.com/watch?v=invalid',
    shouldSucceed: false,
    expectedError: 'Invalid YouTube video ID format'
  }
];

// Error scenarios
export const ERROR_SCENARIOS = [
  {
    name: 'File Too Large',
    scenario: 'upload',
    data: { size: 100 * 1024 * 1024 }, // 100MB
    expectedError: 'File size exceeds maximum',
    expectedStatus: 400
  },
  {
    name: 'Invalid File Type',
    scenario: 'upload',
    data: { extension: '.exe' },
    expectedError: 'File type not supported',
    expectedStatus: 400
  },
  {
    name: 'Rate Limit Exceeded',
    scenario: 'rate-limit',
    data: { requests: 100 },
    expectedError: 'Too many requests',
    expectedStatus: 429
  },
  {
    name: 'Unauthorized Access',
    scenario: 'auth',
    data: { token: 'invalid' },
    expectedError: 'Authentication token required',
    expectedStatus: 401
  },
  {
    name: 'Content Not Found',
    scenario: 'get-content',
    data: { id: 'non-existent-id' },
    expectedError: 'Content item not found',
    expectedStatus: 404
  }
];

/**
 * Setup test environment
 */
export async function setupTestEnvironment() {
  // Create test directories
  await fs.mkdir(TEST_CONFIG.TEST_DIR, { recursive: true });
  await fs.mkdir(TEST_CONFIG.UPLOAD_DIR, { recursive: true });

  // Create mock files
  await createMockFiles();

  // Generate test JWT tokens
  generateTestTokens();

  // Setup environment variables
  process.env.JWT_SECRET = TEST_CONFIG.JWT_SECRET;
  process.env.YOUTUBE_API_KEY = TEST_CONFIG.YOUTUBE_API_KEY;
  process.env.NODE_ENV = 'test';
}

/**
 * Cleanup test environment
 */
export async function cleanupTestEnvironment() {
  try {
    // Remove test directories
    await fs.rmdir(TEST_CONFIG.TEST_DIR, { recursive: true });
    await fs.rmdir(TEST_CONFIG.UPLOAD_DIR, { recursive: true });

    // Clear environment variables
    delete process.env.JWT_SECRET;
    delete process.env.YOUTUBE_API_KEY;
  } catch (error) {
    console.warn('Cleanup warning:', error);
  }
}

/**
 * Create mock files for testing
 */
async function createMockFiles() {
  const mockFiles = [
    {
      name: MOCK_CONTENT.TXT_SAMPLE,
      content: generateBusinessContent('txt')
    },
    {
      name: MOCK_CONTENT.MD_SAMPLE,
      content: generateBusinessContent('md')
    }
  ];

  for (const file of mockFiles) {
    await fs.writeFile(
      path.join(TEST_CONFIG.TEST_DIR, file.name),
      file.content,
      'utf8'
    );
  }
}

/**
 * Generate business content for testing
 */
function generateBusinessContent(format: string): string {
  const baseContent = {
    title: 'The Ultimate Business Growth Framework',
    sections: [
      {
        heading: 'Grand Slam Offer Strategy',
        content: 'Creating an irresistible offer requires understanding your value proposition, implementing strong guarantees, and adding scarcity elements. The grand slam offer framework helps businesses increase conversion rates by 300%.'
      },
      {
        heading: 'Core Four Implementation',
        content: 'The core four elements include lead magnets that convert at 15% or higher, landing pages optimized for mobile conversion, nurture sequences that build trust, and a streamlined sales process that closes deals.'
      },
      {
        heading: 'Value Ladder Construction',
        content: 'Build your value ladder starting with a low-cost tripwire, then upsell to core products, cross-sell complementary offers, and ascend customers to high-value coaching or consulting programs.'
      },
      {
        heading: 'LTV/CAC Optimization',
        content: 'Track customer lifetime value and acquisition costs religiously. Aim for a 3:1 LTV to CAC ratio minimum, optimize retention rates through excellent customer experience, and reduce churn through proactive support.'
      }
    ]
  };

  if (format === 'md') {
    return `# ${baseContent.title}\n\n${baseContent.sections.map(section => 
      `## ${section.heading}\n\n${section.content}\n\n`
    ).join('')}`;
  }

  return `${baseContent.title}\n\n${baseContent.sections.map(section => 
    `${section.heading}\n\n${section.content}\n\n`
  ).join('')}`;
}

/**
 * Generate JWT tokens for testing
 */
function generateTestTokens() {
  const jwt = require('jsonwebtoken');
  
  // Generate valid tokens
  TEST_USERS.ADMIN.token = jwt.sign(
    {
      userId: TEST_USERS.ADMIN.userId,
      email: TEST_USERS.ADMIN.email,
      role: TEST_USERS.ADMIN.role
    },
    TEST_CONFIG.JWT_SECRET,
    { expiresIn: '1h' }
  );

  TEST_USERS.REGULAR_USER.token = jwt.sign(
    {
      userId: TEST_USERS.REGULAR_USER.userId,
      email: TEST_USERS.REGULAR_USER.email,
      role: TEST_USERS.REGULAR_USER.role
    },
    TEST_CONFIG.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

/**
 * Create test content item
 */
export function createTestContentItem(overrides: any = {}) {
  return {
    id: `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: 'Test Business Article',
    type: 'url',
    source: 'https://test-oracle.com/article',
    uploadedAt: new Date(),
    status: 'completed',
    progress: 100,
    metadata: {
      wordCount: 1500,
      characterCount: 8000,
      quality: 85,
      businessRelevance: {
        overallScore: 78,
        frameworkRelevance: {
          grandSlamOffer: 65,
          coreFour: 45,
          valueLadder: 55,
          ltvCac: 35,
          scalingSystems: 40
        },
        topicCategories: {
          marketing: 80,
          sales: 70,
          operations: 30,
          leadership: 45,
          finance: 50,
          strategy: 75
        }
      },
      framework: ['Grand Slam Offer', 'Value Ladder'],
      keywords: ['business', 'marketing', 'strategy', 'growth'],
      author: 'Test Author',
      createdDate: new Date('2024-01-01'),
      userId: TEST_USERS.REGULAR_USER.userId,
      uploadedBy: TEST_USERS.REGULAR_USER.email
    },
    ...overrides
  };
}

/**
 * Mock HTTP request helper
 */
export function createMockRequest(method: string, url: string, data?: any, headers?: any) {
  return {
    method,
    url,
    body: data,
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    query: {}
  };
}

/**
 * Mock HTTP response helper
 */
export function createMockResponse() {
  const response = {
    statusCode: 200,
    headers: {},
    data: null,
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockImplementation((data) => {
      response.data = data;
      return response;
    }),
    setHeader: jest.fn().mockImplementation((name, value) => {
      response.headers[name] = value;
      return response;
    }),
    end: jest.fn().mockReturnThis()
  };

  response.status.mockImplementation((code) => {
    response.statusCode = code;
    return response;
  });

  return response;
}

/**
 * Wait for async operations
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate random test data
 */
export function generateRandomTestData(type: 'content' | 'file' | 'url' | 'youtube') {
  const random = Math.random().toString(36).substr(2, 9);
  
  switch (type) {
    case 'content':
      return {
        id: `content_${random}`,
        title: `Test Content ${random}`,
        text: FRAMEWORK_TEST_CASES[0].text
      };
    
    case 'file':
      return {
        originalFilename: `test-${random}.txt`,
        size: Math.floor(Math.random() * 1000000) + 1000,
        mimetype: 'text/plain',
        filepath: `/tmp/test-${random}.txt`
      };
    
    case 'url':
      return `https://test-${random}.example.com/article-${random}`;
    
    case 'youtube':
      return `https://youtube.com/watch?v=${random.padEnd(11, '0').substr(0, 11)}`;
    
    default:
      return null;
  }
}

/**
 * Validate API response structure
 */
export function validateApiResponse(response: any, expectedStatus: number = 200) {
  expect(response.statusCode).toBe(expectedStatus);
  expect(response.data).toBeDefined();
  expect(response.data.success).toBeDefined();
  expect(response.data.timestamp).toBeDefined();
  
  if (response.data.success) {
    expect(response.data.data).toBeDefined();
    expect(response.data.message).toBeDefined();
  } else {
    expect(response.data.error).toBeDefined();
    expect(response.data.error.code).toBeDefined();
    expect(response.data.error.message).toBeDefined();
  }
}

/**
 * Test database cleanup
 */
export async function cleanupTestDatabase() {
  // Mock database cleanup - in a real implementation, this would clean test data
  console.log('Cleaning up test database...');
}

/**
 * Global test setup
 */
beforeAll(async () => {
  await setupTestEnvironment();
}, TEST_CONFIG.TIMEOUT);

/**
 * Global test cleanup
 */
afterAll(async () => {
  await cleanupTestEnvironment();
  await cleanupTestDatabase();
}, TEST_CONFIG.TIMEOUT);

/**
 * Test isolation setup
 */
beforeEach(async () => {
  // Reset mocks and state before each test
  jest.clearAllMocks();
});

/**
 * Test isolation cleanup
 */
afterEach(async () => {
  // Clean up test artifacts after each test
  jest.restoreAllMocks();
});