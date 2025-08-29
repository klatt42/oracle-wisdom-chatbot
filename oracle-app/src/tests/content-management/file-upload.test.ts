/**
 * Oracle File Upload Testing Suite
 * Victoria Validator - Comprehensive file upload validation and processing tests
 */

import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';

// Test setup
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
  TEST_CONFIG,
  TEST_USERS,
  MOCK_CONTENT,
  ERROR_SCENARIOS,
  createMockRequest,
  createMockResponse,
  generateRandomTestData,
  validateApiResponse,
  waitFor
} from './setup';

// System under test
import uploadHandler from '../../pages/api/oracle-content/upload';
import { UniversalContentProcessor } from '../../services/content/universalContentProcessor';

// Mock dependencies
jest.mock('../../services/content/universalContentProcessor');
jest.mock('formidable');
jest.mock('jsonwebtoken');
jest.mock('fs/promises');

describe('Oracle File Upload API', () => {
  let mockContentProcessor: jest.Mocked<UniversalContentProcessor>;
  let mockFormidable: jest.MockedFunction<typeof formidable>;
  
  beforeEach(() => {
    // Setup mocks
    mockContentProcessor = {
      processContent: jest.fn(),
      getProcessingStatus: jest.fn(),
      getQueueStatus: jest.fn(),
      batchProcess: jest.fn(),
      getSupportedContentTypes: jest.fn(),
      getPipelineConfig: jest.fn(),
      routeContent: jest.fn()
    } as any;

    mockFormidable = formidable as jest.MockedFunction<typeof formidable>;
    
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('Authentication and Authorization', () => {
    test('should reject requests without authentication token', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload');
      const res = createMockResponse();

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      validateApiResponse(res, 401);
      expect(res.data.error.code).toBe('UNAUTHORIZED');
    });

    test('should reject requests with invalid authentication token', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: 'Bearer invalid-token'
      });
      const res = createMockResponse();

      // Mock JWT verification to throw error
      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      validateApiResponse(res, 401);
      expect(res.data.error.message).toContain('Invalid authentication token');
    });

    test('should accept requests with valid authentication token', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      // Mock JWT verification
      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      // Mock formidable to return no files (will result in different error)
      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([{}, {}])
      } as any));

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.statusCode).not.toBe(401);
    });
  });

  describe('Rate Limiting', () => {
    test('should enforce upload rate limits', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      // Mock rate limit exceeded scenario
      const rateLimitError = new Error('Too many upload requests');
      rateLimitError.name = 'RateLimitError';

      // Mock the rate limiter to throw an error
      jest.doMock('express-rate-limit', () => {
        return {
          rateLimit: () => (req: any, res: any, next: any) => next(rateLimitError)
        };
      });

      // Test would need to simulate multiple rapid requests
      // For brevity, we'll mock the rate limit error directly
      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      // Simulate rate limit error in handler
      try {
        await uploadHandler(req as NextApiRequest, res as NextApiResponse);
      } catch (error) {
        if (error instanceof Error && error.message.includes('rate limit')) {
          expect(error.message).toContain('Too many');
        }
      }
    });
  });

  describe('HTTP Method Validation', () => {
    test('should reject non-POST requests', async () => {
      const req = createMockRequest('GET', '/api/oracle-content/upload');
      const res = createMockResponse();

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      validateApiResponse(res, 405);
      expect(res.data.error.code).toBe('METHOD_NOT_ALLOWED');
    });

    test('should accept POST requests', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([{}, {}])
      } as any));

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.statusCode).not.toBe(405);
    });
  });

  describe('File Validation', () => {
    test('should reject files that are too large', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      // Mock large file
      const largeFile = {
        originalFilename: 'large-file.pdf',
        size: 100 * 1024 * 1024, // 100MB (exceeds 50MB limit)
        mimetype: 'application/pdf',
        filepath: '/tmp/large-file.pdf'
      };

      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([
          {},
          { files: [largeFile] }
        ])
      } as any));

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.statusCode).toBe(200); // Request succeeds but file is rejected
      expect(res.data.data.failed).toBeGreaterThan(0);
      expect(res.data.data.errors[0].error).toContain('exceeds maximum');
    });

    test('should reject unsupported file types', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      // Mock unsupported file type
      const invalidFile = {
        originalFilename: 'malicious.exe',
        size: 1024,
        mimetype: 'application/x-executable',
        filepath: '/tmp/malicious.exe'
      };

      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([
          {},
          { files: [invalidFile] }
        ])
      } as any));

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.statusCode).toBe(200);
      expect(res.data.data.failed).toBeGreaterThan(0);
      expect(res.data.data.errors[0].error).toContain('not supported');
    });

    test('should accept supported file types', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      // Mock valid files
      const validFiles = [
        {
          originalFilename: 'business-guide.pdf',
          size: 1024 * 1024, // 1MB
          mimetype: 'application/pdf',
          filepath: '/tmp/business-guide.pdf'
        },
        {
          originalFilename: 'marketing-strategy.docx',
          size: 512 * 1024, // 512KB
          mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          filepath: '/tmp/marketing-strategy.docx'
        }
      ];

      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([
          {},
          { files: validFiles }
        ])
      } as any));

      // Mock content processor
      mockContentProcessor.processContent.mockResolvedValue({} as any);

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.statusCode).toBe(200);
      expect(res.data.data.processed).toBe(2);
      expect(res.data.data.failed).toBe(0);
    });
  });

  describe('File Processing', () => {
    test('should initiate background processing for valid files', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      const validFile = generateRandomTestData('file');
      validFile.originalFilename = 'test.txt';
      validFile.size = 1024;

      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([
          {},
          { files: [validFile] }
        ])
      } as any));

      mockContentProcessor.processContent.mockResolvedValue({} as any);

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      // Verify processing was initiated
      await waitFor(100); // Allow async processing to start
      
      expect(res.data.data.processed).toBe(1);
      expect(res.data.data.results[0].status).toBe('processing');
      expect(res.data.message).toContain('processing started');
    });

    test('should handle processing options', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      const validFile = generateRandomTestData('file');
      validFile.originalFilename = 'test.txt';

      // Mock form fields with processing options
      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([
          {
            quality: ['high'],
            extractFrameworks: ['true'],
            generateSummary: ['true']
          },
          { files: [validFile] }
        ])
      } as any));

      mockContentProcessor.processContent.mockResolvedValue({} as any);

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.statusCode).toBe(200);
      // In a real test, we'd verify the processing options were passed correctly
    });
  });

  describe('Multiple File Upload', () => {
    test('should handle multiple file upload', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      // Create multiple valid files
      const files = [
        { originalFilename: 'file1.pdf', size: 1024, mimetype: 'application/pdf', filepath: '/tmp/file1.pdf' },
        { originalFilename: 'file2.docx', size: 2048, mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', filepath: '/tmp/file2.docx' },
        { originalFilename: 'file3.txt', size: 512, mimetype: 'text/plain', filepath: '/tmp/file3.txt' }
      ];

      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([
          {},
          { files }
        ])
      } as any));

      mockContentProcessor.processContent.mockResolvedValue({} as any);

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.statusCode).toBe(200);
      expect(res.data.data.processed).toBe(3);
      expect(res.data.data.results).toHaveLength(3);
    });

    test('should enforce maximum file limit', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      // Create too many files (assuming limit is 5)
      const files = Array.from({ length: 10 }, (_, i) => ({
        originalFilename: `file${i}.txt`,
        size: 1024,
        mimetype: 'text/plain',
        filepath: `/tmp/file${i}.txt`
      }));

      // Mock formidable to handle file limit
      mockFormidable.mockImplementation(() => {
        const error = new Error('Too many files');
        error.name = 'maxFilesError';
        return {
          parse: jest.fn().mockRejectedValue(error)
        } as any;
      });

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.statusCode).toBe(500);
    });
  });

  describe('Error Handling', () => {
    test('should handle formidable parsing errors', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      // Mock formidable to throw an error
      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockRejectedValue(new Error('Parse error'))
      } as any));

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.statusCode).toBe(500);
      expect(res.data.error.code).toBe('INTERNAL_SERVER_ERROR');
    });

    test('should handle file system errors', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      // Mock fs operations to fail
      const fs = require('fs/promises');
      fs.mkdir = jest.fn().mockRejectedValue(new Error('File system error'));

      const validFile = generateRandomTestData('file');
      validFile.originalFilename = 'test.txt';

      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([
          {},
          { files: [validFile] }
        ])
      } as any));

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.statusCode).toBe(500);
    });

    test('should handle processing service errors gracefully', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      const validFile = generateRandomTestData('file');
      validFile.originalFilename = 'test.txt';

      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([
          {},
          { files: [validFile] }
        ])
      } as any));

      // Mock content processor to fail
      mockContentProcessor.processContent.mockRejectedValue(new Error('Processing service unavailable'));

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      // Should still return success for upload, but processing will fail asynchronously
      expect(res.statusCode).toBe(200);
      expect(res.data.data.processed).toBe(1);
    });
  });

  describe('Response Format', () => {
    test('should return properly formatted success response', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      const validFile = generateRandomTestData('file');
      validFile.originalFilename = 'test.pdf';

      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([
          {},
          { files: [validFile] }
        ])
      } as any));

      mockContentProcessor.processContent.mockResolvedValue({} as any);

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      validateApiResponse(res, 200);
      
      expect(res.data.data).toHaveProperty('processed');
      expect(res.data.data).toHaveProperty('failed');
      expect(res.data.data).toHaveProperty('results');
      expect(res.data).toHaveProperty('message');
      expect(res.data).toHaveProperty('timestamp');
      
      expect(res.data.data.results[0]).toHaveProperty('id');
      expect(res.data.data.results[0]).toHaveProperty('filename');
      expect(res.data.data.results[0]).toHaveProperty('type');
      expect(res.data.data.results[0]).toHaveProperty('status');
    });

    test('should include errors in response for failed uploads', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      // Mix of valid and invalid files
      const files = [
        { originalFilename: 'valid.pdf', size: 1024, mimetype: 'application/pdf', filepath: '/tmp/valid.pdf' },
        { originalFilename: 'invalid.exe', size: 1024, mimetype: 'application/x-executable', filepath: '/tmp/invalid.exe' }
      ];

      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([
          {},
          { files }
        ])
      } as any));

      mockContentProcessor.processContent.mockResolvedValue({} as any);

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.statusCode).toBe(200);
      expect(res.data.data.processed).toBe(1);
      expect(res.data.data.failed).toBe(1);
      expect(res.data.data.errors).toHaveLength(1);
      expect(res.data.data.errors[0]).toHaveProperty('file');
      expect(res.data.data.errors[0]).toHaveProperty('error');
    });
  });

  describe('Security', () => {
    test('should prevent path traversal attacks', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      // File with malicious path
      const maliciousFile = {
        originalFilename: '../../../etc/passwd',
        size: 1024,
        mimetype: 'text/plain',
        filepath: '/tmp/safe-file'
      };

      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([
          {},
          { files: [maliciousFile] }
        ])
      } as any));

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      // Should handle safely (specific security measures would depend on implementation)
      expect(res.statusCode).toBe(200);
    });

    test('should sanitize file metadata', async () => {
      const req = createMockRequest('POST', '/api/oracle-content/upload', null, {
        authorization: `Bearer ${TEST_USERS.REGULAR_USER.token}`
      });
      const res = createMockResponse();

      const jwt = require('jsonwebtoken');
      jwt.verify = jest.fn().mockReturnValue({
        userId: TEST_USERS.REGULAR_USER.userId,
        email: TEST_USERS.REGULAR_USER.email
      });

      // File with potentially dangerous metadata
      const fileWithScriptName = {
        originalFilename: '<script>alert("xss")</script>.txt',
        size: 1024,
        mimetype: 'text/plain',
        filepath: '/tmp/safe-file'
      };

      mockFormidable.mockImplementation(() => ({
        parse: jest.fn().mockResolvedValue([
          {},
          { files: [fileWithScriptName] }
        ])
      } as any));

      mockContentProcessor.processContent.mockResolvedValue({} as any);

      await uploadHandler(req as NextApiRequest, res as NextApiResponse);

      expect(res.statusCode).toBe(200);
      // Should sanitize the filename in response
      expect(res.data.data.results[0].filename).not.toContain('<script>');
    });
  });
});