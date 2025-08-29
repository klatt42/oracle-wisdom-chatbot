/**
 * URL Content Processing API Endpoint
 * Elena Execution - Oracle Content Processing Infrastructure
 */

import { NextRequest, NextResponse } from 'next/server';
import { urlProcessor } from '../../../../lib/content-processing/url-processor';
import { UrlScraper } from '../../../../lib/content-processing/url-scraper';

// POST /api/oracle-content/url
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

    if (urls.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 URLs allowed per request' },
        { status: 400 }
      );
    }

    // Validate each URL
    const validationResults = urls.map(url => {
      if (typeof url !== 'string') {
        return { url, valid: false, error: 'URL must be a string' };
      }

      const validation = UrlScraper.validateUrlFormat(url);
      return {
        url,
        valid: validation.isValid,
        error: validation.error
      };
    });

    const invalidUrls = validationResults.filter(r => !r.valid);
    if (invalidUrls.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid URLs provided',
          details: invalidUrls.map(u => ({ url: u.url, error: u.error }))
        },
        { status: 400 }
      );
    }

    // Process URLs with controlled concurrency
    const maxConcurrent = Math.min(3, Math.ceil(urls.length / 2));
    const results = await urlProcessor.processUrls(urls, options, maxConcurrent);

    // Prepare response
    const response = {
      success: true,
      processed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results: results.map((result, index) => ({
        url: urls[index],
        success: result.success,
        contentId: result.contentId,
        error: result.error,
        metadata: result.metadata
      }))
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('URL processing API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during URL processing' },
      { status: 500 }
    );
  }
}

// GET /api/oracle-content/url?jobId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      // Return all active jobs
      const activeJobs = urlProcessor.getActiveJobs();
      return NextResponse.json({
        success: true,
        jobs: activeJobs
      });
    }

    // Return specific job status
    const job = urlProcessor.getJobStatus(jobId);
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
    console.error('URL job status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/oracle-content/url/validate
export async function PUT(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required and must be a string' },
        { status: 400 }
      );
    }

    const validation = UrlScraper.validateUrlFormat(url);
    
    if (!validation.isValid) {
      return NextResponse.json({
        valid: false,
        error: validation.error
      });
    }

    // Additional validation: check if URL is accessible
    try {
      const response = await fetch(url, { 
        method: 'HEAD', 
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      return NextResponse.json({
        valid: true,
        accessible: response.ok,
        status: response.status,
        contentType: response.headers.get('content-type')
      });
      
    } catch (error) {
      return NextResponse.json({
        valid: true,
        accessible: false,
        error: 'URL is not accessible'
      });
    }

  } catch (error) {
    console.error('URL validation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error during validation' },
      { status: 500 }
    );
  }
}