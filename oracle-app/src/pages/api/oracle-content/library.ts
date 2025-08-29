/**
 * Oracle Content Library Management API
 * Elena Execution - Content library management endpoint
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { rateLimit } from 'express-rate-limit';
import jwt from 'jsonwebtoken';

// Services
import { UniversalContentProcessor } from '../../../services/content/universalContentProcessor';
import { OracleStorageService } from '../../../services/content/storageService';

// Types
import { ContentItem, ContentType, ProcessingStatus, ContentFilters, ContentSortOptions } from '../../../types/content';

// Rate limiting
const libraryRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100, // 100 requests per window
  message: 'Too many library requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Configuration
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

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
    libraryRateLimit(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve();
    });
  });
}

// Query parameter validation and parsing
interface LibraryQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: ContentType[];
  status?: ProcessingStatus[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: Date;
  dateTo?: Date;
  minQuality?: number;
  frameworks?: string[];
  userId?: string;
  includeStats?: boolean;
}

function parseQuery(query: any, userId: string): LibraryQuery {
  const parsed: LibraryQuery = {
    page: Math.max(1, parseInt(query.page || '1')),
    limit: Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(query.limit || DEFAULT_PAGE_SIZE.toString()))),
    search: query.search || undefined,
    userId: query.includeAllUsers === 'true' ? undefined : userId, // Default to user's content only
    includeStats: query.includeStats === 'true'
  };

  // Parse content types
  if (query.type) {
    const types = Array.isArray(query.type) ? query.type : [query.type];
    parsed.type = types.filter((t: string) => ['pdf', 'docx', 'txt', 'md', 'url', 'youtube'].includes(t));
  }

  // Parse status filters
  if (query.status) {
    const statuses = Array.isArray(query.status) ? query.status : [query.status];
    parsed.status = statuses.filter((s: string) => 
      ['uploading', 'processing', 'chunking', 'embedding', 'completed', 'error', 'archived'].includes(s)
    );
  }

  // Parse frameworks
  if (query.frameworks) {
    const frameworks = Array.isArray(query.frameworks) ? query.frameworks : [query.frameworks];
    parsed.frameworks = frameworks.filter((f: string) => f.trim().length > 0);
  }

  // Parse date range
  if (query.dateFrom) {
    try {
      parsed.dateFrom = new Date(query.dateFrom);
    } catch {
      // Invalid date, ignore
    }
  }

  if (query.dateTo) {
    try {
      parsed.dateTo = new Date(query.dateTo);
    } catch {
      // Invalid date, ignore
    }
  }

  // Parse quality filter
  if (query.minQuality) {
    const quality = parseInt(query.minQuality);
    if (!isNaN(quality) && quality >= 0 && quality <= 100) {
      parsed.minQuality = quality;
    }
  }

  // Parse sorting
  if (query.sortBy) {
    const validSortFields = ['uploadedAt', 'processedAt', 'title', 'quality', 'wordCount', 'businessRelevance'];
    if (validSortFields.includes(query.sortBy)) {
      parsed.sortBy = query.sortBy;
      parsed.sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
    }
  }

  return parsed;
}

// Generate library statistics
async function generateLibraryStats(contentItems: ContentItem[]) {
  const stats = {
    total: contentItems.length,
    byStatus: {} as Record<ProcessingStatus, number>,
    byType: {} as Record<ContentType, number>,
    qualityDistribution: {
      excellent: 0, // 90-100
      good: 0,      // 70-89
      fair: 0,      // 50-69
      poor: 0       // 0-49
    },
    frameworkDistribution: {} as Record<string, number>,
    totalWords: 0,
    totalChunks: 0,
    totalEmbeddings: 0,
    averageQuality: 0,
    recentActivity: [] as any[]
  };

  let totalQuality = 0;
  const qualityItems = contentItems.filter(item => item.metadata?.quality);

  for (const item of contentItems) {
    // Status distribution
    stats.byStatus[item.status] = (stats.byStatus[item.status] || 0) + 1;

    // Type distribution
    stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;

    // Quality distribution
    const quality = item.metadata?.quality || 0;
    if (quality >= 90) stats.qualityDistribution.excellent++;
    else if (quality >= 70) stats.qualityDistribution.good++;
    else if (quality >= 50) stats.qualityDistribution.fair++;
    else stats.qualityDistribution.poor++;

    totalQuality += quality;

    // Framework distribution
    if (item.metadata?.framework) {
      for (const framework of item.metadata.framework) {
        stats.frameworkDistribution[framework] = (stats.frameworkDistribution[framework] || 0) + 1;
      }
    }

    // Totals
    stats.totalWords += item.metadata?.wordCount || 0;
    stats.totalChunks += item.metadata?.extractedChunks || 0;
    stats.totalEmbeddings += item.metadata?.embeddings || 0;
  }

  stats.averageQuality = qualityItems.length > 0 ? Math.round(totalQuality / qualityItems.length) : 0;

  // Recent activity (last 10 items)
  stats.recentActivity = contentItems
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 10)
    .map(item => ({
      id: item.id,
      title: item.title,
      type: item.type,
      status: item.status,
      uploadedAt: item.uploadedAt,
      quality: item.metadata?.quality || 0
    }));

  return stats;
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

    // Parse query parameters
    const queryParams = parseQuery(req.query, userId);

    // Initialize services
    const contentProcessor = new UniversalContentProcessor();
    const storageService = new OracleStorageService();

    // Build filters
    const filters: ContentFilters = {};
    
    if (queryParams.type) filters.type = queryParams.type;
    if (queryParams.status) filters.status = queryParams.status;
    if (queryParams.dateFrom || queryParams.dateTo) {
      filters.dateRange = {
        from: queryParams.dateFrom || new Date(0),
        to: queryParams.dateTo || new Date()
      };
    }
    if (queryParams.frameworks) filters.frameworks = queryParams.frameworks as any;
    if (queryParams.minQuality) {
      filters.qualityRange = {
        min: queryParams.minQuality,
        max: 100
      };
    }

    // Build sort options
    const sortOptions: ContentSortOptions = {
      field: (queryParams.sortBy as any) || 'uploadedAt',
      direction: queryParams.sortOrder || 'desc'
    };

    // Get content items
    const searchResult = await storageService.searchContent({
      query: queryParams.search,
      filters,
      sort: sortOptions,
      page: queryParams.page!,
      limit: queryParams.limit!,
      userId: queryParams.userId
    });

    // Generate statistics if requested
    let stats = undefined;
    if (queryParams.includeStats) {
      // Get all user content for stats (not just current page)
      const allUserContent = await storageService.searchContent({
        filters: { ...filters },
        page: 1,
        limit: 10000, // Large number to get all items
        userId: queryParams.userId
      });
      
      stats = await generateLibraryStats(allUserContent.items);
    }

    // Format response
    const response = {
      success: true,
      data: {
        items: searchResult.items,
        pagination: {
          page: queryParams.page!,
          limit: queryParams.limit!,
          total: searchResult.total,
          totalPages: Math.ceil(searchResult.total / queryParams.limit!),
          hasMore: searchResult.hasMore
        },
        filters: {
          search: queryParams.search,
          type: queryParams.type,
          status: queryParams.status,
          dateRange: queryParams.dateFrom || queryParams.dateTo ? {
            from: queryParams.dateFrom,
            to: queryParams.dateTo
          } : undefined,
          minQuality: queryParams.minQuality,
          frameworks: queryParams.frameworks
        },
        sorting: {
          field: sortOptions.field,
          direction: sortOptions.direction
        },
        stats,
        metadata: {
          searchMetadata: searchResult.searchMetadata,
          queryTime: Date.now(),
          userEmail: email
        }
      },
      message: `Retrieved ${searchResult.items.length} content items`,
      timestamp: new Date().toISOString()
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Library API error:', error);
    
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
        message: 'An unexpected error occurred while retrieving content library'
      }
    });
  }
}