/**
 * Oracle Content Processing Status API
 * Elena Execution - Real-time processing status endpoint
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from 'express-rate-limit';
import jwt from 'jsonwebtoken';

// Services
import { UniversalContentProcessor } from '../../../services/content/universalContentProcessor';

// Rate limiting
const statusRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'Too many status requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication middleware
function authenticateRequest(req: NextApiRequest): { userId: string; email: string } {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('Authentication token required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'oracle-secret') as any;
    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    throw new Error('Invalid authentication token');
  }
}

// Rate limiting middleware
function applyRateLimit(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  return new Promise((resolve, reject) => {
    statusRateLimit(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve();
    });
  });
}

// Main handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET method is allowed'
      }
    });
  }

  try {
    // Apply rate limiting
    await applyRateLimit(req, res);

    // Authenticate request
    const { userId, email } = authenticateRequest(req);

    // Get content IDs from query
    const { ids, includeQueueStatus } = req.query;
    
    if (!ids) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CONTENT_IDS',
          message: 'Content IDs parameter is required'
        }
      });
    }

    // Parse content IDs
    const contentIds = Array.isArray(ids) ? ids as string[] : [ids as string];
    
    if (contentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_CONTENT_IDS',
          message: 'At least one content ID is required'
        }
      });
    }

    if (contentIds.length > 50) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TOO_MANY_IDS',
          message: 'Maximum 50 content IDs allowed per request'
        }
      });
    }

    // Initialize content processor
    const contentProcessor = new UniversalContentProcessor();

    // Get processing status for all requested IDs
    const statusUpdates = contentProcessor.getProcessingStatus(contentIds);

    // Get queue status if requested
    let queueStatus = undefined;
    if (includeQueueStatus === 'true') {
      queueStatus = contentProcessor.getQueueStatus();
    }

    // Format response
    const response = {
      success: true,
      data: {
        statusUpdates,
        queueStatus,
        requestedIds: contentIds,
        foundIds: statusUpdates.map(s => s.contentId),
        missingIds: contentIds.filter(id => !statusUpdates.some(s => s.contentId === id))
      },
      message: `Retrieved status for ${statusUpdates.length} of ${contentIds.length} requested items`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Status API error:', error);
    
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
        message: 'An unexpected error occurred while retrieving processing status'
      }
    });
  }
}