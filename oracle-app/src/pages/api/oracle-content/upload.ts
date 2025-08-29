/**
 * Oracle Content Upload API
 * Elena Execution - File upload processing endpoint
 */

import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs/promises';
import path from 'path';
import { rateLimit } from 'express-rate-limit';
import jwt from 'jsonwebtoken';

// Services
import { UniversalContentProcessor } from '../../../services/content/universalContentProcessor';
import { OracleFileHandler } from '../../../services/content/fileHandler';

// Types
import { ContentItem, ContentType } from '../../../types/content';

// Rate limiting
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per window
  message: 'Too many upload requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuration
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPES = ['pdf', 'docx', 'txt', 'md'];

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

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
    uploadRateLimit(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve();
    });
  });
}

// File validation
function validateFile(file: File): { isValid: boolean; error?: string; contentType?: ContentType } {
  if (!file.originalFilename) {
    return { isValid: false, error: 'File name is required' };
  }

  const extension = path.extname(file.originalFilename).toLowerCase().slice(1);
  
  if (!ALLOWED_TYPES.includes(extension)) {
    return { 
      isValid: false, 
      error: `File type .${extension} not supported. Allowed types: ${ALLOWED_TYPES.join(', ')}` 
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size ${Math.round(file.size / 1024 / 1024)}MB exceeds maximum ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  return {
    isValid: true,
    contentType: extension as ContentType
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

    // Ensure upload directory exists
    await ensureUploadDir();

    // Initialize services
    const contentProcessor = new UniversalContentProcessor();
    const fileHandler = new OracleFileHandler();

    // Parse form data
    const form = formidable({
      uploadDir: UPLOAD_DIR,
      keepExtensions: true,
      maxFileSize: MAX_FILE_SIZE,
      maxFiles: 5,
    });

    const [fields, files] = await form.parse(req);
    
    const uploadedFiles = Array.isArray(files.files) ? files.files : files.files ? [files.files] : [];
    
    if (uploadedFiles.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILES_UPLOADED',
          message: 'No files were uploaded'
        }
      });
    }

    const results: any[] = [];
    const errors: any[] = [];

    // Process each uploaded file
    for (const file of uploadedFiles) {
      try {
        // Validate file
        const validation = validateFile(file);
        if (!validation.isValid) {
          errors.push({
            file: file.originalFilename,
            error: validation.error
          });
          continue;
        }

        // Create content item
        const contentItem: ContentItem = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: file.originalFilename || 'Unknown File',
          type: validation.contentType!,
          source: file.filepath,
          originalFilename: file.originalFilename,
          filePath: file.filepath,
          size: file.size,
          mimeType: file.mimetype || undefined,
          uploadedAt: new Date(),
          status: 'uploading',
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
          quality: (fields.quality?.[0] as 'fast' | 'standard' | 'high') || 'standard',
          extractFrameworks: fields.extractFrameworks?.[0] === 'true',
          generateSummary: fields.generateSummary?.[0] === 'true'
        };

        // Process content asynchronously
        contentProcessor.processContent(contentItem, processingOptions)
          .then(result => {
            console.log(`Content processing completed for ${contentItem.id}`);
          })
          .catch(error => {
            console.error(`Content processing failed for ${contentItem.id}:`, error);
          });

        results.push({
          id: contentItem.id,
          filename: contentItem.title,
          type: contentItem.type,
          size: contentItem.size,
          status: 'processing',
          message: 'File uploaded successfully, processing started'
        });

      } catch (error) {
        errors.push({
          file: file.originalFilename,
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
      message: `Successfully initiated processing for ${results.length} file(s)`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Upload API error:', error);
    
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
        message: 'An unexpected error occurred during file upload'
      }
    });
  }
}

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};