/**
 * YouTube Content Processing API Endpoint
 * Elena Execution - Oracle Content Processing Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server';
import { youtubeProcessor } from '../../../../lib/content-processing/youtube-processor';

// POST /api/oracle-content/youtube
export async function POST(request: NextRequest) {
  try {
    const { urls, options = {} } = await request.json();

    // Validate request
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { error: 'URLs array is required and cannot be empty' },
        { status: 400 }
      );
    }

    if (urls.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 YouTube URLs allowed per request' },
        { status: 400 }
      );
    }

    // Validate each URL has a valid YouTube video ID
    const validationResults = urls.map(url => {
      if (typeof url !== 'string') {
        return { url, valid: false, error: 'URL must be a string' };
      }

      const videoId = youtubeProcessor.extractVideoId(url);
      return {
        url,
        videoId,
        valid: videoId !== null,
        error: videoId === null ? 'Invalid YouTube URL or video ID not found' : undefined
      };
    });

    const invalidUrls = validationResults.filter(r => !r.valid);
    if (invalidUrls.length > 0) {
      return NextResponse.json(
        {
          error: 'Invalid YouTube URLs provided',
          details: invalidUrls.map(u => ({ url: u.url, error: u.error }))
        },
        { status: 400 }
      );
    }

    // Process videos with controlled concurrency (YouTube API has quotas)
    const maxConcurrent = Math.min(2, Math.ceil(urls.length / 2));
    const results = await youtubeProcessor.processVideos(urls, options, maxConcurrent);

    // Prepare response
    const response = {
      success: true,
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results: results.map((result, index) => ({
        url: urls[index],
        videoId: validationResults[index].videoId,
        success: result.success,
        video_id: result.video_id,
        title: result.title,
        error: result.error,
        metadata: result.metadata
      }))
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('YouTube processing API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during YouTube processing' },
      { status: 500 }
    );
  }
}

// GET /api/oracle-content/youtube?jobId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      // Return all active jobs
      const activeJobs = youtubeProcessor.getActiveJobs();
      return NextResponse.json({
        success: true,
        jobs: activeJobs
      });
    }

    // Return specific job status
    const job = youtubeProcessor.getJobStatus(jobId);
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      job
    });

  } catch (error) {
    console.error('YouTube job status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/oracle-content/youtube/validate
export async function PUT(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    const videoId = youtubeProcessor.extractVideoId(url);
    
    if (!videoId) {
      return NextResponse.json({
        valid: false,
        error: 'Invalid YouTube URL or video ID not found'
      });
    }

    // TODO: Optionally check if video exists and is accessible via YouTube API
    // For now, just validate the URL format
    return NextResponse.json({
      valid: true,
      videoId,
      extractedFromUrl: url
    });

  } catch (error) {
    console.error('YouTube URL validation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during validation' },
      { status: 500 }
    );
  }
}