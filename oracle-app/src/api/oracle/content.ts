/**
 * Oracle Content Management API Controller
 * Elena Execution - Content upload, processing, and management endpoints
 * Handles file uploads, URL processing, YouTube extraction, and content library management
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from 'express-rate-limit';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Content Processing Services
import { OracleContentProcessor } from '../../services/content/contentProcessor';
import { OracleFileHandler } from '../../services/content/fileHandler';
import { OracleUrlProcessor } from '../../services/content/urlProcessor';
import { OracleYouTubeExtractor } from '../../services/content/youtubeExtractor';
import { OracleEmbeddingService } from '../../services/content/embeddingService';

// Types
import { ContentItem, ProcessingResult, ContentMetadata } from '../../types/content';

// API Interfaces
export interface ContentUploadRequest {
  files?: File[];
  urls?: string[];
  youtubeUrls?: string[];
  processingOptions?: {
    chunkSize?: number;
    overlapSize?: number;
    quality?: 'fast' | 'standard' | 'high';
    extractFrameworks?: boolean;
    generateSummary?: boolean;
  };
}

export interface ContentUploadResponse {
  success: boolean;
  items?: ContentItem[];
  processingIds?: string[];
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface ContentLibraryRequest {
  action: 'list' | 'get' | 'delete' | 'search';
  id?: string;
  query?: string;
  filters?: {
    type?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  };
  page?: number;
  limit?: number;
}

export interface ContentLibraryResponse {
  success: boolean;
  items?: ContentItem[];
  item?: ContentItem;
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface ContentProcessingRequest {
  itemId: string;
  action: 'reprocess' | 'analyze' | 'extract_frameworks' | 'generate_summary';
  options?: any;
}

export interface ContentProcessingResponse {
  success: boolean;
  result?: ProcessingResult;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

// Rate limiting configuration
const createRateLimiter = (windowMs: number, max: number) => rateLimit({
  windowMs,
  max,
  message: 'Too many content requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadRateLimit = createRateLimiter(5 * 60 * 1000, 20); // 20 uploads per 5 minutes
const libraryRateLimit = createRateLimiter(60 * 1000, 100); // 100 requests per minute
const processingRateLimit = createRateLimiter(60 * 1000, 30); // 30 processing requests per minute

// Service instances
let contentProcessor: OracleContentProcessor;
let fileHandler: OracleFileHandler;
let urlProcessor: OracleUrlProcessor;
let youtubeExtractor: OracleYouTubeExtractor;
let embeddingService: OracleEmbeddingService;

// Initialize services
const initializeServices = () => {
  if (!contentProcessor) {
    contentProcessor = new OracleContentProcessor();
    fileHandler = new OracleFileHandler();
    urlProcessor = new OracleUrlProcessor();
    youtubeExtractor = new OracleYouTubeExtractor();
    embeddingService = new OracleEmbeddingService();
  }
};

// Upload directory configuration
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const TEMP_DIR = path.join(UPLOAD_DIR, 'temp');
const PROCESSED_DIR = path.join(UPLOAD_DIR, 'processed');

// Ensure upload directories exist
const ensureDirectories = () => {
  [UPLOAD_DIR, TEMP_DIR, PROCESSED_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Error handling utilities
class APIError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

const handleAPIError = (error: any, res: NextApiResponse) => {
  console.error('Content API Error:', error);

  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }

  // Handle specific error types
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds the maximum limit of 50MB.'
      }
    });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: 'File type not supported. Please upload PDF, DOCX, TXT, or MD files.'
      }
    });
  }

  // Generic error
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred while processing content.'
    }
  });
};

// Validation utilities
const validateFileType = (filename: string): boolean => {
  const supportedExtensions = ['.pdf', '.docx', '.txt', '.md'];
  const extension = path.extname(filename).toLowerCase();
  return supportedExtensions.includes(extension);
};

const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validateYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
  return youtubeRegex.test(url);
};

// Rate limiting middleware adapter
const applyRateLimit = (limiter: any) => {
  return (req: NextApiRequest, res: NextApiResponse) => {
    return new Promise((resolve, reject) => {
      limiter(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    });
  };
};

// File upload configuration
const formConfig = {
  uploadDir: TEMP_DIR,
  keepExtensions: true,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 10,
  filter: (part: formidable.Part) => {
    return part.name === 'files' || part.mimetype?.startsWith('text/') || 
           part.mimetype?.includes('pdf') || part.mimetype?.includes('document');
  }
};

// Main API route handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { endpoint } = req.query;

  try {
    initializeServices();
    ensureDirectories();

    switch (endpoint) {
      case 'upload':
        return await handleContentUpload(req, res);
      case 'library':
        return await handleContentLibrary(req, res);
      case 'process':
        return await handleContentProcessing(req, res);
      case 'status':
        return await handleProcessingStatus(req, res);
      default:
        throw new APIError('INVALID_ENDPOINT', 'Invalid content API endpoint', 404);
    }
  } catch (error) {
    return handleAPIError(error, res);
  }
}

// POST /api/oracle/content/upload - Upload and process content
async function handleContentUpload(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    throw new APIError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  }

  // Apply rate limiting
  await applyRateLimit(uploadRateLimit)(req, res);

  const contentType = req.headers['content-type'] || '';
  const results: ContentItem[] = [];

  try {
    if (contentType.includes('multipart/form-data')) {
      // Handle file uploads
      const form = formidable(formConfig);
      
      const [fields, files] = await form.parse(req);
      const uploadedFiles = Array.isArray(files.files) ? files.files : files.files ? [files.files] : [];
      
      for (const file of uploadedFiles) {
        if (!validateFileType(file.originalFilename || '')) {
          throw new APIError('INVALID_FILE_TYPE', `File type not supported: ${file.originalFilename}`, 400);
        }

        const contentItem = await fileHandler.processFile(file);
        results.push(contentItem);
        
        // Start background processing
        contentProcessor.processContentItem(contentItem.id);
      }
    } else {
      // Handle URL and YouTube submissions
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      
      // Process URLs
      if (body.urls && Array.isArray(body.urls)) {
        for (const url of body.urls) {
          if (!validateUrl(url)) {
            throw new APIError('INVALID_URL', `Invalid URL: ${url}`, 400);
          }

          const contentItem = await urlProcessor.processUrl(url);
          results.push(contentItem);
          
          // Start background processing
          contentProcessor.processContentItem(contentItem.id);
        }
      }

      // Process YouTube URLs
      if (body.youtubeUrls && Array.isArray(body.youtubeUrls)) {
        for (const url of body.youtubeUrls) {
          if (!validateYouTubeUrl(url)) {
            throw new APIError('INVALID_YOUTUBE_URL', `Invalid YouTube URL: ${url}`, 400);
          }

          const contentItem = await youtubeExtractor.processYouTubeUrl(url);
          results.push(contentItem);
          
          // Start background processing
          contentProcessor.processContentItem(contentItem.id);
        }
      }
    }

    const response: ContentUploadResponse = {
      success: true,
      items: results,
      processingIds: results.map(item => item.id),
      message: `Successfully initiated processing for ${results.length} item(s)`
    };

    res.status(200).json(response);

  } catch (error) {
    throw error;
  }
}

// GET /api/oracle/content/library - Manage content library
async function handleContentLibrary(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  await applyRateLimit(libraryRateLimit)(req, res);

  const { action, id, query, filters, page = 1, limit = 50 } = req.query as any;

  try {
    let response: ContentLibraryResponse;

    switch (action) {
      case 'list':
        const items = await contentProcessor.listContentItems({
          query,
          filters: filters ? JSON.parse(filters) : {},
          page: parseInt(page),
          limit: Math.min(parseInt(limit), 100)
        });
        response = {
          success: true,
          items: items.items,
          total: items.total,
          page: parseInt(page),
          limit: Math.min(parseInt(limit), 100)
        };
        break;

      case 'get':
        if (!id) {
          throw new APIError('MISSING_ID', 'Content item ID is required', 400);
        }
        const item = await contentProcessor.getContentItem(id);
        response = {
          success: true,
          item
        };
        break;

      case 'delete':
        if (!id) {
          throw new APIError('MISSING_ID', 'Content item ID is required', 400);
        }
        await contentProcessor.deleteContentItem(id);
        response = {
          success: true,
          message: 'Content item deleted successfully'
        };
        break;

      case 'search':
        if (!query) {
          throw new APIError('MISSING_QUERY', 'Search query is required', 400);
        }
        const searchResults = await contentProcessor.searchContentItems(query, {
          filters: filters ? JSON.parse(filters) : {},
          page: parseInt(page),
          limit: Math.min(parseInt(limit), 100)
        });
        response = {
          success: true,
          items: searchResults.items,
          total: searchResults.total,
          page: parseInt(page),
          limit: Math.min(parseInt(limit), 100)
        };
        break;

      default:
        throw new APIError('INVALID_ACTION', 'Invalid library action', 400);
    }

    res.status(200).json(response);

  } catch (error) {
    throw error;
  }
}

// POST /api/oracle/content/process - Process or reprocess content
async function handleContentProcessing(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'POST') {
    throw new APIError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  }

  await applyRateLimit(processingRateLimit)(req, res);

  const { itemId, action, options } = req.body as ContentProcessingRequest;

  if (!itemId) {
    throw new APIError('MISSING_ITEM_ID', 'Content item ID is required', 400);
  }

  try {
    let result: ProcessingResult;

    switch (action) {
      case 'reprocess':
        result = await contentProcessor.reprocessContentItem(itemId, options);
        break;

      case 'analyze':
        result = await contentProcessor.analyzeContent(itemId);
        break;

      case 'extract_frameworks':
        result = await contentProcessor.extractFrameworks(itemId);
        break;

      case 'generate_summary':
        result = await contentProcessor.generateSummary(itemId);
        break;

      default:
        throw new APIError('INVALID_ACTION', 'Invalid processing action', 400);
    }

    const response: ContentProcessingResponse = {
      success: true,
      result,
      message: `Successfully executed ${action} for content item`
    };

    res.status(200).json(response);

  } catch (error) {
    throw error;
  }
}

// GET /api/oracle/content/status - Get processing status
async function handleProcessingStatus(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method !== 'GET') {
    throw new APIError('METHOD_NOT_ALLOWED', 'Method not allowed', 405);
  }

  const { itemIds } = req.query;

  if (!itemIds) {
    throw new APIError('MISSING_ITEM_IDS', 'Content item IDs are required', 400);
  }

  try {
    const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
    const statusUpdates = await contentProcessor.getProcessingStatus(ids as string[]);

    res.status(200).json({
      success: true,
      statusUpdates,
      message: `Retrieved status for ${ids.length} item(s)`
    });

  } catch (error) {
    throw error;
  }
}