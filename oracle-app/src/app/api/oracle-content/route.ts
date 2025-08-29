/**
 * Oracle Content Management API - Unified Endpoint
 * Elena Execution - Oracle Content Processing Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server';
import { processingPipeline } from '../../../lib/content-processing/processing-pipeline';
import { supabaseAdmin } from '../../../lib/supabase';

// GET /api/oracle-content - Get all content with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') as 'file' | 'url' | 'youtube' | 'text' | null;
    const status = searchParams.get('status') as 'pending' | 'processing' | 'completed' | 'failed' | null;
    const framework = searchParams.get('framework');
    const search = searchParams.get('search');

    // Build query
    let query = supabaseAdmin
      .from('content_items')
      .select(`
        *,
        url_content_metadata (*),
        youtube_content_metadata (*),
        file_content_metadata (*),
        framework_detections (*)
      `);

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (framework) {
      query = query.contains('detected_frameworks', [framework]);
    }
    if (search) {
      query = query.or(`title.ilike.%${search}%,extracted_text.ilike.%${search}%`);
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Content query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch content' },
        { status: 500 }
      );
    }

    // Get total count for pagination
    const { count: totalCount } = await supabaseAdmin
      .from('content_items')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: totalCount || 0,
        pages: Math.ceil((totalCount || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Content API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/oracle-content - Process new content
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, options = {} } = body;

    // Validate request
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (items.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 items allowed per batch' },
        { status: 400 }
      );
    }

    // Validate each item
    const validItems = [];
    const errors = [];

    for (const [index, item] of items.entries()) {
      if (!item.type || !['file', 'url', 'youtube', 'text'].includes(item.type)) {
        errors.push({ index, error: 'Invalid or missing type' });
        continue;
      }

      if (!item.source || typeof item.source !== 'string') {
        errors.push({ index, error: 'Invalid or missing source' });
        continue;
      }

      if (item.type === 'text' && (!item.content || typeof item.content !== 'string')) {
        errors.push({ index, error: 'Content is required for text type' });
        continue;
      }

      validItems.push(item);
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Invalid items provided', details: errors },
        { status: 400 }
      );
    }

    // Process items through the universal pipeline
    const maxConcurrent = Math.min(5, Math.ceil(validItems.length / 2));
    const results = await processingPipeline.processBatch(validItems, options, maxConcurrent);

    // Prepare response
    const response = {
      success: true,
      processed: results.length,
      successful: results.filter(r => r.status === 'completed').length,
      failed: results.filter(r => r.status === 'failed').length,
      results: results.map(job => ({
        jobId: job.id,
        type: job.type,
        source: job.source,
        status: job.status,
        progress: job.progress,
        contentId: job.contentId,
        error: job.error,
        metadata: job.metadata,
        processingTime: job.endTime && job.startTime 
          ? job.endTime.getTime() - job.startTime.getTime()
          : undefined
      }))
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Content processing API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during processing' },
      { status: 500 }
    );
  }
}

// DELETE /api/oracle-content?id=xxx - Delete content
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('id');

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Check if content exists
    const { data: content, error: fetchError } = await supabaseAdmin
      .from('content_items')
      .select('id')
      .eq('id', contentId)
      .single();

    if (fetchError || !content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Delete content (cascades to related tables via foreign key constraints)
    const { error: deleteError } = await supabaseAdmin
      .from('content_items')
      .delete()
      .eq('id', contentId);

    if (deleteError) {
      console.error('Content deletion error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Content deletion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/oracle-content?id=xxx - Update content metadata
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('id');
    const updates = await request.json();

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      );
    }

    // Allowed update fields
    const allowedFields = ['title', 'status', 'quality_score', 'business_relevance_score', 'detected_frameworks'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {} as any);

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid update fields provided' },
        { status: 400 }
      );
    }

    // Update content
    const { data, error } = await supabaseAdmin
      .from('content_items')
      .update(filteredUpdates)
      .eq('id', contentId)
      .select()
      .single();

    if (error) {
      console.error('Content update error:', error);
      return NextResponse.json(
        { error: 'Failed to update content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Content update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}