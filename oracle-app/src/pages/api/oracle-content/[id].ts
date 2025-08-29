/**
 * Oracle Content Management API - Individual Content Item Operations
 * Elena Execution - Content updates and deletion endpoint
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
const contentRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 requests per window
  message: 'Too many content requests, please try again later.',
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
    contentRateLimit(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve();
    });
  });
}

// Content ID validation
function validateContentId(id: string): { isValid: boolean; error?: string } {
  if (!id || typeof id !== 'string') {
    return { isValid: false, error: 'Content ID is required' };
  }

  if (id.length < 10 || id.length > 100) {
    return { isValid: false, error: 'Invalid content ID format' };
  }

  return { isValid: true };
}

// Update request validation
interface ContentUpdateRequest {
  title?: string;
  status?: ProcessingStatus;
  metadata?: {
    tags?: string[];
    description?: string;
    category?: string;
    priority?: number;
  };
  reprocess?: boolean;
  reprocessOptions?: {
    quality?: 'fast' | 'standard' | 'high';
    extractFrameworks?: boolean;
    generateSummary?: boolean;
  };
}

function validateUpdateRequest(body: any): { isValid: boolean; error?: string; data?: ContentUpdateRequest } {
  if (!body || typeof body !== 'object') {
    return { isValid: false, error: 'Request body must be a valid JSON object' };
  }

  const updates: ContentUpdateRequest = {};

  // Validate title
  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      return { isValid: false, error: 'Title must be a non-empty string' };
    }
    if (body.title.length > 200) {
      return { isValid: false, error: 'Title cannot exceed 200 characters' };
    }
    updates.title = body.title.trim();
  }

  // Validate status
  if (body.status !== undefined) {
    const validStatuses: ProcessingStatus[] = [
      'uploading', 'processing', 'chunking', 'embedding', 'completed', 'error', 'archived'
    ];
    if (!validStatuses.includes(body.status)) {
      return { 
        isValid: false, 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      };
    }
    updates.status = body.status;
  }

  // Validate metadata
  if (body.metadata !== undefined) {
    if (typeof body.metadata !== 'object') {
      return { isValid: false, error: 'Metadata must be an object' };
    }

    const metadata: any = {};

    if (body.metadata.tags !== undefined) {
      if (!Array.isArray(body.metadata.tags)) {
        return { isValid: false, error: 'Tags must be an array' };
      }
      if (body.metadata.tags.some((tag: any) => typeof tag !== 'string')) {
        return { isValid: false, error: 'All tags must be strings' };
      }
      if (body.metadata.tags.length > 20) {
        return { isValid: false, error: 'Maximum 20 tags allowed' };
      }
      metadata.tags = body.metadata.tags.map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0);
    }

    if (body.metadata.description !== undefined) {
      if (typeof body.metadata.description !== 'string') {
        return { isValid: false, error: 'Description must be a string' };
      }
      if (body.metadata.description.length > 1000) {
        return { isValid: false, error: 'Description cannot exceed 1000 characters' };
      }
      metadata.description = body.metadata.description.trim();
    }

    if (body.metadata.category !== undefined) {
      if (typeof body.metadata.category !== 'string') {
        return { isValid: false, error: 'Category must be a string' };
      }
      metadata.category = body.metadata.category.trim();
    }

    if (body.metadata.priority !== undefined) {
      if (typeof body.metadata.priority !== 'number' || body.metadata.priority < 1 || body.metadata.priority > 5) {
        return { isValid: false, error: 'Priority must be a number between 1 and 5' };
      }
      metadata.priority = body.metadata.priority;
    }

    if (Object.keys(metadata).length > 0) {
      updates.metadata = metadata;
    }
  }

  // Validate reprocessing options
  if (body.reprocess !== undefined) {
    if (typeof body.reprocess !== 'boolean') {
      return { isValid: false, error: 'Reprocess flag must be boolean' };
    }
    updates.reprocess = body.reprocess;

    if (body.reprocess && body.reprocessOptions) {
      const options: any = {};

      if (body.reprocessOptions.quality !== undefined) {
        if (!['fast', 'standard', 'high'].includes(body.reprocessOptions.quality)) {
          return { isValid: false, error: 'Quality must be fast, standard, or high' };
        }
        options.quality = body.reprocessOptions.quality;
      }

      if (body.reprocessOptions.extractFrameworks !== undefined) {
        if (typeof body.reprocessOptions.extractFrameworks !== 'boolean') {
          return { isValid: false, error: 'Extract frameworks flag must be boolean' };
        }
        options.extractFrameworks = body.reprocessOptions.extractFrameworks;
      }

      if (body.reprocessOptions.generateSummary !== undefined) {
        if (typeof body.reprocessOptions.generateSummary !== 'boolean') {
          return { isValid: false, error: 'Generate summary flag must be boolean' };
        }
        options.generateSummary = body.reprocessOptions.generateSummary;
      }

      updates.reprocessOptions = options;
    }
  }

  if (Object.keys(updates).length === 0) {
    return { isValid: false, error: 'At least one field must be provided for update' };
  }

  return { isValid: true, data: updates };
}

// Check content ownership
async function checkContentOwnership(
  contentId: string, 
  userId: string, 
  isAdmin: boolean,
  storageService: OracleStorageService
): Promise<{ hasAccess: boolean; contentItem?: ContentItem }> {
  try {
    const contentItem = await storageService.getContent(contentId);
    
    if (!contentItem) {
      return { hasAccess: false };
    }

    // Admin has access to all content
    if (isAdmin) {
      return { hasAccess: true, contentItem };
    }

    // Check if user owns the content
    const itemUserId = contentItem.metadata?.userId;
    if (itemUserId === userId) {
      return { hasAccess: true, contentItem };
    }

    return { hasAccess: false, contentItem };
  } catch (error) {
    return { hasAccess: false };
  }
}

// GET handler - Retrieve single content item
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  contentId: string,
  userInfo: { userId: string; email: string; isAdmin?: boolean }
) {
  const storageService = new OracleStorageService();
  
  // Check content ownership
  const ownership = await checkContentOwnership(contentId, userInfo.userId, userInfo.isAdmin || false, storageService);
  
  if (!ownership.hasAccess || !ownership.contentItem) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CONTENT_NOT_FOUND',
        message: 'Content item not found or access denied'
      }
    });
  }

  // Get additional details if available
  const contentProcessor = new UniversalContentProcessor();
  const processingStatus = contentProcessor.getProcessingStatus([contentId]);
  
  const response = {
    success: true,
    data: {
      ...ownership.contentItem,
      processingStatus: processingStatus.length > 0 ? processingStatus[0] : undefined
    },
    message: 'Content item retrieved successfully',
    timestamp: new Date().toISOString()
  };

  res.status(200).json(response);
}

// PUT handler - Update content item
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse,
  contentId: string,
  userInfo: { userId: string; email: string; isAdmin?: boolean }
) {
  // Validate update request
  const validation = validateUpdateRequest(req.body);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_UPDATE_REQUEST',
        message: validation.error
      }
    });
  }

  const updates = validation.data!;
  
  const storageService = new OracleStorageService();
  
  // Check content ownership
  const ownership = await checkContentOwnership(contentId, userInfo.userId, userInfo.isAdmin || false, storageService);
  
  if (!ownership.hasAccess || !ownership.contentItem) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CONTENT_NOT_FOUND',
        message: 'Content item not found or access denied'
      }
    });
  }

  try {
    const contentProcessor = new UniversalContentProcessor();
    let updatedContent = ownership.contentItem;

    // Apply basic updates
    if (updates.title) {
      updatedContent.title = updates.title;
    }

    if (updates.status) {
      updatedContent.status = updates.status;
    }

    if (updates.metadata) {
      updatedContent.metadata = {
        ...updatedContent.metadata,
        ...updates.metadata,
        lastModified: new Date(),
        modifiedBy: userInfo.email
      };
    }

    // Handle reprocessing
    if (updates.reprocess) {
      // Update status to processing
      updatedContent.status = 'processing';
      updatedContent.progress = 0;

      // Start reprocessing
      const reprocessOptions = {
        quality: updates.reprocessOptions?.quality || 'standard',
        extractFrameworks: updates.reprocessOptions?.extractFrameworks !== false,
        generateSummary: updates.reprocessOptions?.generateSummary !== false
      };

      // Process asynchronously
      contentProcessor.processContent(updatedContent, reprocessOptions)
        .then(result => {
          console.log(`Content reprocessing completed for ${contentId}`);
        })
        .catch(error => {
          console.error(`Content reprocessing failed for ${contentId}:`, error);
        });
    }

    // Update in storage
    await storageService.updateContent(contentId, updatedContent);

    const response = {
      success: true,
      data: updatedContent,
      message: updates.reprocess ? 
        'Content item updated and reprocessing started' : 
        'Content item updated successfully',
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Content update error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update content item'
      }
    });
  }
}

// DELETE handler - Delete content item
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse,
  contentId: string,
  userInfo: { userId: string; email: string; isAdmin?: boolean }
) {
  const storageService = new OracleStorageService();
  
  // Check content ownership
  const ownership = await checkContentOwnership(contentId, userInfo.userId, userInfo.isAdmin || false, storageService);
  
  if (!ownership.hasAccess || !ownership.contentItem) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'CONTENT_NOT_FOUND',
        message: 'Content item not found or access denied'
      }
    });
  }

  try {
    // Perform soft delete by updating status
    const updatedContent = {
      ...ownership.contentItem,
      status: 'archived' as ProcessingStatus,
      metadata: {
        ...ownership.contentItem.metadata,
        deletedAt: new Date(),
        deletedBy: userInfo.email,
        archivedReason: 'User deletion'
      }
    };

    await storageService.updateContent(contentId, updatedContent);

    // Note: In a production system, you might want to:
    // 1. Move files to an archive location
    // 2. Remove embeddings from vector database
    // 3. Add to deletion audit log

    const response = {
      success: true,
      data: {
        id: contentId,
        status: 'archived',
        deletedAt: new Date()
      },
      message: 'Content item deleted successfully',
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Content deletion error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETION_FAILED',
        message: 'Failed to delete content item'
      }
    });
  }
}

// Main handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Apply rate limiting
    await applyRateLimit(req, res);

    // Authenticate request
    const userInfo = authenticateRequest(req);

    // Extract content ID from URL
    const { id: contentId } = req.query;
    
    if (!contentId || typeof contentId !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CONTENT_ID',
          message: 'Content ID is required in URL path'
        }
      });
    }

    // Validate content ID format
    const idValidation = validateContentId(contentId);
    if (!idValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_CONTENT_ID',
          message: idValidation.error
        }
      });
    }

    // Route to appropriate handler based on HTTP method
    switch (req.method) {
      case 'GET':
        return await handleGet(req, res, contentId, userInfo);
      
      case 'PUT':
        return await handlePut(req, res, contentId, userInfo);
      
      case 'DELETE':
        return await handleDelete(req, res, contentId, userInfo);
      
      default:
        return res.status(405).json({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: `Method ${req.method} is not allowed. Supported methods: GET, PUT, DELETE`
          }
        });
    }

  } catch (error) {
    console.error('Content API error:', error);
    
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
        message: 'An unexpected error occurred'
      }
    });
  }
}