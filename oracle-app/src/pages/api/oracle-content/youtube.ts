/**
 * Oracle YouTube Video Processing API
 * Elena Execution - YouTube content extraction endpoint
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from 'express-rate-limit';
import jwt from 'jsonwebtoken';

// Services
import { UniversalContentProcessor } from '../../../services/content/universalContentProcessor';
import { OracleYouTubeProcessor } from '../../../services/content/youtubeProcessor';

// Types
import { ContentItem } from '../../../types/content';

// Rate limiting
const youtubeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 YouTube requests per window (more restrictive due to API costs)
  message: 'Too many YouTube processing requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuration
const MAX_VIDEOS_PER_REQUEST = 3;
const MAX_VIDEO_DURATION = 7200; // 2 hours in seconds

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
    youtubeRateLimit(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve();
    });
  });
}

// YouTube URL validation
function validateYouTubeUrl(urlString: string): { isValid: boolean; error?: string; videoId?: string } {
  try {
    const url = new URL(urlString);
    
    // Check if it's a YouTube domain
    if (!['www.youtube.com', 'youtube.com', 'youtu.be', 'm.youtube.com'].includes(url.hostname)) {
      return {
        isValid: false,
        error: 'URL must be from YouTube domain'
      };
    }

    // Extract video ID
    let videoId: string | null = null;
    
    if (url.hostname === 'youtu.be') {
      // Short URL format: https://youtu.be/VIDEO_ID
      videoId = url.pathname.slice(1).split('?')[0];
    } else if (url.pathname === '/watch') {
      // Standard format: https://www.youtube.com/watch?v=VIDEO_ID
      videoId = url.searchParams.get('v');
    } else if (url.pathname.startsWith('/embed/')) {
      // Embed format: https://www.youtube.com/embed/VIDEO_ID
      videoId = url.pathname.split('/embed/')[1]?.split('?')[0];
    } else if (url.pathname.startsWith('/v/')) {
      // Old format: https://www.youtube.com/v/VIDEO_ID
      videoId = url.pathname.split('/v/')[1]?.split('?')[0];
    }

    if (!videoId || videoId.length !== 11) {
      return {
        isValid: false,
        error: 'Invalid YouTube video URL format'
      };
    }

    // Check for valid video ID format (11 characters, alphanumeric + _ -)
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return {
        isValid: false,
        error: 'Invalid YouTube video ID format'
      };
    }

    return {
      isValid: true,
      videoId
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format'
    };
  }
}

// Request body validation
interface YouTubeProcessRequest {
  urls?: string[];
  url?: string;
  options?: {
    includeTranscript?: boolean;
    includeComments?: boolean;
    transcriptLanguage?: string;
    maxComments?: number;
    chapterDetection?: boolean;
    speakerIdentification?: boolean;
    timestampReferences?: boolean;
    quality?: 'fast' | 'standard' | 'high';
    extractFrameworks?: boolean;
    generateSummary?: boolean;
  };
}

function validateRequestBody(body: any): { isValid: boolean; error?: string; data?: YouTubeProcessRequest } {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  const urls = body.urls || (body.url ? [body.url] : []);
  
  if (!Array.isArray(urls) || urls.length === 0) {
    return { isValid: false, error: 'At least one YouTube URL is required' };
  }

  if (urls.length > MAX_VIDEOS_PER_REQUEST) {
    return { 
      isValid: false, 
      error: `Maximum ${MAX_VIDEOS_PER_REQUEST} videos allowed per request` 
    };
  }

  // Validate all URLs
  for (const url of urls) {
    if (typeof url !== 'string') {
      return { isValid: false, error: 'All URLs must be strings' };
    }

    const validation = validateYouTubeUrl(url);
    if (!validation.isValid) {
      return { isValid: false, error: `Invalid YouTube URL "${url}": ${validation.error}` };
    }
  }

  // Validate options
  if (body.options) {
    const { maxComments, transcriptLanguage } = body.options;
    
    if (maxComments && (typeof maxComments !== 'number' || maxComments < 0 || maxComments > 500)) {
      return { isValid: false, error: 'maxComments must be a number between 0 and 500' };
    }

    if (transcriptLanguage && typeof transcriptLanguage !== 'string') {
      return { isValid: false, error: 'transcriptLanguage must be a string' };
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
    const youtubeProcessor = new OracleYouTubeProcessor(process.env.YOUTUBE_API_KEY);

    const results: any[] = [];
    const errors: any[] = [];

    // Process each YouTube URL
    for (const url of urls) {
      try {
        const urlValidation = validateYouTubeUrl(url);
        if (!urlValidation.isValid || !urlValidation.videoId) {
          errors.push({
            url,
            error: urlValidation.error || 'Invalid YouTube URL'
          });
          continue;
        }

        // Create initial content item
        const contentItem: ContentItem = {
          id: `youtube_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: `YouTube Video: ${urlValidation.videoId}`,
          type: 'youtube',
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
            youtubeVideoId: urlValidation.videoId,
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
          youtubeOptions: {
            includeTranscript: options?.includeTranscript !== false,
            includeComments: options?.includeComments || false,
            transcriptLanguage: options?.transcriptLanguage || 'en',
            maxComments: Math.min(options?.maxComments || 50, 500),
            chapterDetection: options?.chapterDetection !== false,
            speakerIdentification: options?.speakerIdentification || false,
            timestampReferences: options?.timestampReferences !== false
          }
        };

        // Process content asynchronously
        contentProcessor.processContent(contentItem, processingOptions)
          .then(result => {
            console.log(`YouTube content processing completed for ${contentItem.id}`);
          })
          .catch(error => {
            console.error(`YouTube content processing failed for ${contentItem.id}:`, error);
          });

        results.push({
          id: contentItem.id,
          url: contentItem.source,
          videoId: urlValidation.videoId,
          type: contentItem.type,
          status: 'processing',
          message: 'YouTube video processing started successfully',
          estimatedDuration: 'Processing may take 2-5 minutes depending on video length'
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
      message: `Successfully initiated processing for ${results.length} YouTube video(s)`,
      timestamp: new Date().toISOString(),
      note: 'YouTube processing includes transcript extraction, chapter detection, and business framework analysis'
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('YouTube processing API error:', error);
    
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
        message: 'An unexpected error occurred during YouTube video processing'
      }
    });
  }
}