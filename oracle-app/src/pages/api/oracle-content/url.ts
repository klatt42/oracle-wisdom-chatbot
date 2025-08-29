/**
 * Oracle URL Content Processing API
 * Elena Execution - URL content extraction endpoint
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { URL } from 'url';

// Services
import { UniversalContentProcessor } from '../../../services/content/universalContentProcessor';
import { OracleUrlProcessor } from '../../../services/content/urlProcessor';

// Types
import { ContentItem } from '../../../types/content';

// Rate limiting
const urlRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // 20 URL requests per window
  message: 'Too many URL processing requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuration
const BLOCKED_DOMAINS = ['localhost', '127.0.0.1', 'internal', 'private'];
const MAX_URLS_PER_REQUEST = 5;

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
    urlRateLimit(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve();
    });
  });
}

// URL validation
function validateUrl(urlString: string): { isValid: boolean; error?: string; url?: URL } {
  try {
    const url = new URL(urlString);
    
    // Check protocol
    if (!['http:', 'https:'].includes(url.protocol)) {
      return {
        isValid: false,
        error: 'Only HTTP and HTTPS URLs are supported'
      };
    }

    // Check for blocked domains
    if (BLOCKED_DOMAINS.some(blocked => url.hostname.includes(blocked))) {
      return {
        isValid: false,
        error: 'URL domain is not allowed'
      };
    }

    // Check for common file extensions that should be uploaded instead
    const fileExtensions = ['.pdf', '.docx', '.doc', '.txt', '.md'];
    if (fileExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext))) {
      return {
        isValid: false,
        error: 'Direct file URLs should be uploaded via the file upload endpoint'
      };
    }

    return {
      isValid: true,
      url
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format'
    };
  }
}

// Request body validation
interface UrlProcessRequest {
  urls?: string[];
  url?: string;
  options?: {
    extractImages?: boolean;
    followRedirects?: boolean;
    respectRobots?: boolean;
    quality?: 'fast' | 'standard' | 'high';
    extractFrameworks?: boolean;
    generateSummary?: boolean;
  };
}

function validateRequestBody(body: any): { isValid: boolean; error?: string; data?: UrlProcessRequest } {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  const urls = body.urls || (body.url ? [body.url] : []);
  
  if (!Array.isArray(urls) || urls.length === 0) {
    return { isValid: false, error: 'At least one URL is required' };
  }

  if (urls.length > MAX_URLS_PER_REQUEST) {
    return { 
      isValid: false, 
      error: `Maximum ${MAX_URLS_PER_REQUEST} URLs allowed per request` 
    };
  }

  // Validate all URLs
  for (const url of urls) {
    if (typeof url !== 'string') {
      return { isValid: false, error: 'All URLs must be strings' };
    }

    const validation = validateUrl(url);
    if (!validation.isValid) {
      return { isValid: false, error: `Invalid URL "${url}": ${validation.error}` };
    }
  }

  return {
    isValid: true,
    data: {
      urls,
      options: body.options || {}
    }
  };
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
    const { userId, email } = authenticateRequest(req);

    // Validate request body
    const bodyValidation = validateRequestBody(req.body);
    if (!bodyValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: bodyValidation.error
        }
      });
    }

    const { urls, options } = bodyValidation.data!;

    // Initialize services
    const contentProcessor = new UniversalContentProcessor();
    const urlProcessor = new OracleUrlProcessor();

    const results: any[] = [];
    const errors: any[] = [];

    // Process each URL
    for (const url of urls) {
      try {
        // Create initial content item
        const contentItem: ContentItem = {
          id: `url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: `Web Content: ${url}`,
          type: 'url',
          source: url,
          uploadedAt: new Date(),
          status: 'processing',
          progress: 0,
          metadata: {
            wordCount: 0,
            characterCount: 0,
            quality: 0,
            uploadedBy: email,
            userId,
            businessRelevance: {
              overallScore: 0,
              frameworkRelevance: {
                grandSlamOffer: 0,
                coreFour: 0,
                valueLadder: 0,
                ltvCac: 0,
                scalingSystems: 0
              },
              topicCategories: {
                marketing: 0,
                sales: 0,
                operations: 0,
                leadership: 0,
                finance: 0,
                strategy: 0
              }
            }
          }
        };

        // Start background processing
        const processingOptions = {
          quality: options?.quality || 'standard',
          extractFrameworks: options?.extractFrameworks !== false,
          generateSummary: options?.generateSummary !== false,
          ...options
        };

        // Process content asynchronously
        contentProcessor.processContent(contentItem, processingOptions)
          .then(result => {
            console.log(`URL content processing completed for ${contentItem.id}`);
          })
          .catch(error => {
            console.error(`URL content processing failed for ${contentItem.id}:`, error);
          });

        results.push({
          id: contentItem.id,
          url: contentItem.source,
          type: contentItem.type,
          status: 'processing',
          message: 'URL processing started successfully'
        });

      } catch (error) {
        errors.push({
          url,
          error: error instanceof Error ? error.message : 'Unknown processing error'
        });
      }
    }

    // Return response
    const response = {
      success: true,
      data: {
        processed: results.length,
        failed: errors.length,
        results,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `Successfully initiated processing for ${results.length} URL(s)`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('URL processing API error:', error);
    
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
        message: 'An unexpected error occurred during URL processing'
      }
    });
  }
}