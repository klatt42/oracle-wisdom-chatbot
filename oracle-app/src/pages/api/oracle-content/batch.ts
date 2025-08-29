/**
 * Oracle Content Batch Operations API
 * Elena Execution - Batch content operations endpoint
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from 'express-rate-limit';
import jwt from 'jsonwebtoken';

// Services
import { UniversalContentProcessor } from '../../../services/content/universalContentProcessor';
import { OracleStorageService } from '../../../services/content/storageService';

// Types
import { ContentItem, ProcessingStatus } from '../../../types/content';

// Rate limiting
const batchRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // 5 batch requests per window (restrictive due to resource intensity)
  message: 'Too many batch requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication middleware
function authenticateRequest(req: NextApiRequest): { userId: string; email: string; isAdmin?: boolean } {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('Authentication token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'oracle-secret') as any;
    return { 
      userId: decoded.userId, 
      email: decoded.email,
      isAdmin: decoded.role === 'admin'
    };
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
}

// Rate limiting middleware
function applyRateLimit(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  return new Promise((resolve, reject) => {
    batchRateLimit(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve();
    });
  });
}

// Batch operation types
type BatchOperation = 'delete' | 'archive' | 'reprocess' | 'update_status' | 'update_metadata';

interface BatchRequest {
  operation: BatchOperation;
  contentIds: string[];
  parameters?: {
    status?: ProcessingStatus;
    metadata?: any;
    reprocessOptions?: {
      quality?: 'fast' | 'standard' | 'high';
      extractFrameworks?: boolean;
      generateSummary?: boolean;
    };
  };
}

// Validate batch request
function validateBatchRequest(body: any): { isValid: boolean; error?: string; data?: BatchRequest } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body must be a valid JSON object' };
  }

  const { operation, contentIds, parameters } = body;

  // Validate operation
  const validOperations: BatchOperation[] = ['delete', 'archive', 'reprocess', 'update_status', 'update_metadata'];
  if (!validOperations.includes(operation)) {
    return { 
      isValid: false, 
      error: `Invalid operation. Must be one of: ${validOperations.join(', ')}` 
    };
  }

  // Validate content IDs
  if (!Array.isArray(contentIds)) {
    return { isValid: false, error: 'contentIds must be an array' };
  }

  if (contentIds.length === 0) {
    return { isValid: false, error: 'At least one content ID is required' };
  }

  if (contentIds.length > 100) {
    return { isValid: false, error: 'Maximum 100 content IDs allowed per batch operation' };
  }

  if (contentIds.some(id => typeof id !== 'string' || id.length === 0)) {
    return { isValid: false, error: 'All content IDs must be non-empty strings' };
  }

  // Validate parameters based on operation
  if (operation === 'update_status' && parameters?.status) {
    const validStatuses: ProcessingStatus[] = [
      'uploading', 'processing', 'chunking', 'embedding', 'completed', 'error', 'archived'
    ];
    if (!validStatuses.includes(parameters.status)) {
      return { 
        isValid: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      };
    }
  }

  if (operation === 'reprocess' && parameters?.reprocessOptions) {
    const { quality } = parameters.reprocessOptions;
    if (quality && !['fast', 'standard', 'high'].includes(quality)) {
      return { isValid: false, error: 'Quality must be fast, standard, or high' };
    }
  }

  return {
    isValid: true,
    data: {
      operation,
      contentIds,
      parameters: parameters || {}
    }
  };
}

// Check content ownership for batch
async function checkBatchOwnership(
  contentIds: string[],
  userId: string,
  isAdmin: boolean,
  storageService: OracleStorageService
): Promise<{
  authorizedIds: string[];
  unauthorizedIds: string[];
  contentItems: Map<string, ContentItem>;
}> {
  const authorizedIds: string[] = [];
  const unauthorizedIds: string[] = [];
  const contentItems = new Map<string, ContentItem>();

  for (const contentId of contentIds) {
    try {
      const contentItem = await storageService.getContent(contentId);
      
      if (!contentItem) {
        unauthorizedIds.push(contentId);
        continue;
      }

      // Admin has access to all content
      if (isAdmin) {
        authorizedIds.push(contentId);
        contentItems.set(contentId, contentItem);
        continue;
      }

      // Check if user owns the content
      const itemUserId = contentItem.metadata?.userId;
      if (itemUserId === userId) {
        authorizedIds.push(contentId);
        contentItems.set(contentId, contentItem);
      } else {
        unauthorizedIds.push(contentId);
      }
    } catch (error) {
      unauthorizedIds.push(contentId);
    }
  }

  return { authorizedIds, unauthorizedIds, contentItems };
}

// Execute batch operation
async function executeBatchOperation(
  operation: BatchOperation,
  contentIds: string[],
  contentItems: Map<string, ContentItem>,
  parameters: any,
  userInfo: { userId: string; email: string },
  contentProcessor: UniversalContentProcessor,
  storageService: OracleStorageService
): Promise<{
  succeeded: string[];
  failed: Array<{ id: string; error: string }>;
}> {
  const succeeded: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];

  for (const contentId of contentIds) {
    try {
      const contentItem = contentItems.get(contentId);
      if (!contentItem) {
        failed.push({ id: contentId, error: 'Content item not found' });
        continue;
      }

      switch (operation) {
        case 'delete':
        case 'archive':
          const archivedContent = {
            ...contentItem,
            status: 'archived' as ProcessingStatus,
            metadata: {
              ...contentItem.metadata,
              archivedAt: new Date(),
              archivedBy: userInfo.email,
              archivedReason: operation === 'delete' ? 'Batch deletion' : 'Batch archival'
            }
          };
          await storageService.updateContent(contentId, archivedContent);
          succeeded.push(contentId);
          break;

        case 'update_status':
          if (parameters.status) {
            const statusUpdatedContent = {
              ...contentItem,
              status: parameters.status,
              metadata: {
                ...contentItem.metadata,
                lastModified: new Date(),
                modifiedBy: userInfo.email
              }
            };
            await storageService.updateContent(contentId, statusUpdatedContent);
            succeeded.push(contentId);
          } else {
            failed.push({ id: contentId, error: 'Status parameter required' });
          }
          break;

        case 'update_metadata':
          if (parameters.metadata) {
            const metadataUpdatedContent = {
              ...contentItem,
              metadata: {
                ...contentItem.metadata,
                ...parameters.metadata,
                lastModified: new Date(),
                modifiedBy: userInfo.email
              }
            };
            await storageService.updateContent(contentId, metadataUpdatedContent);
            succeeded.push(contentId);
          } else {
            failed.push({ id: contentId, error: 'Metadata parameter required' });
          }
          break;

        case 'reprocess':
          // Update status to processing
          const reprocessingContent = {
            ...contentItem,
            status: 'processing' as ProcessingStatus,
            progress: 0,
            metadata: {
              ...contentItem.metadata,
              lastReprocessed: new Date(),
              reprocessedBy: userInfo.email
            }
          };
          await storageService.updateContent(contentId, reprocessingContent);

          // Start reprocessing asynchronously
          const reprocessOptions = {
            quality: parameters.reprocessOptions?.quality || 'standard',
            extractFrameworks: parameters.reprocessOptions?.extractFrameworks !== false,
            generateSummary: parameters.reprocessOptions?.generateSummary !== false
          };

          contentProcessor.processContent(reprocessingContent, reprocessOptions)
            .then(() => {
              console.log(`Batch reprocessing completed for ${contentId}`);
            })
            .catch(error => {
              console.error(`Batch reprocessing failed for ${contentId}:`, error);
            });

          succeeded.push(contentId);
          break;

        default:
          failed.push({ id: contentId, error: 'Unknown operation' });
      }
    } catch (error) {
      failed.push({ 
        id: contentId, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  return { succeeded, failed };
}

// Main handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed'
      }
    });
  }

  try {
    // Apply rate limiting
    await applyRateLimit(req, res);

    // Authenticate request
    const userInfo = authenticateRequest(req);

    // Validate batch request
    const validation = validateBatchRequest(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_BATCH_REQUEST',
          message: validation.error
        }
      });
    }

    const { operation, contentIds, parameters } = validation.data!;

    // Initialize services
    const contentProcessor = new UniversalContentProcessor();
    const storageService = new OracleStorageService();

    // Check content ownership
    const ownership = await checkBatchOwnership(
      contentIds,
      userInfo.userId,
      userInfo.isAdmin || false,
      storageService
    );

    if (ownership.authorizedIds.length === 0) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'NO_AUTHORIZED_CONTENT',
          message: 'No authorized content items found for batch operation'
        }
      });
    }

    // Execute batch operation
    const executionResult = await executeBatchOperation(
      operation,
      ownership.authorizedIds,
      ownership.contentItems,
      parameters,
      userInfo,
      contentProcessor,
      storageService
    );

    // Format response
    const response = {
      success: true,
      data: {
        operation,
        totalRequested: contentIds.length,
        authorized: ownership.authorizedIds.length,
        unauthorized: ownership.unauthorizedIds.length,
        succeeded: executionResult.succeeded.length,
        failed: executionResult.failed.length,
        results: {
          succeeded: executionResult.succeeded,
          failed: executionResult.failed,
          unauthorized: ownership.unauthorizedIds
        }
      },
      message: `Batch ${operation} operation completed. ${executionResult.succeeded.length} succeeded, ${executionResult.failed.length} failed.`,
      timestamp: new Date().toISOString()
    };

    // Set appropriate status code
    const statusCode = executionResult.failed.length > 0 ? 207 : 200; // 207 Multi-Status for partial success

    res.status(statusCode).json(response);

  } catch (error) {
    console.error('Batch API error:', error);
    
    if (error instanceof Error && error.message.includes('Authentication')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: error.message
        }
      });
    }

    if (error instanceof Error && error.message.includes('rate limit')) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: error.message
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred during batch operation'
      }
    });
  }
}