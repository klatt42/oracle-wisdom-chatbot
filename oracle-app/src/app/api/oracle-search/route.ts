/**
 * Oracle Vector Search API Route
 * Created by: David Infrastructure
 * Purpose: Provide vector search endpoints for Oracle chat interface
 */

import { NextRequest, NextResponse } from 'next/server';
import { OracleVectorDB } from '../../../lib/oracleVectorDB';

// Initialize vector database instance
let vectorDB: OracleVectorDB | null = null;

async function getVectorDB(): Promise<OracleVectorDB> {
  if (!vectorDB) {
    vectorDB = new OracleVectorDB();
    await vectorDB.initialize();
  }
  return vectorDB;
}

export async function POST(request: NextRequest) {
  try {
    const { query, searchType, options } = await request.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }
    
    const db = await getVectorDB();
    let results = [];
    
    switch (searchType) {
      case 'semantic':
        results = await db.semanticSearch(query, options || {});
        break;
        
      case 'hybrid':
        results = await db.hybridSearch(query, options || {});
        break;
        
      default:
        // Default to semantic search
        results = await db.semanticSearch(query, options || {});
    }
    
    return NextResponse.json({
      success: true,
      query,
      results,
      count: results.length,
      searchType: searchType || 'semantic'
    });
    
  } catch (error) {
    console.error('Oracle search API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Search failed', 
        message: String(error) 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const maxResults = parseInt(searchParams.get('maxResults') || '5');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }
    
    const db = await getVectorDB();
    const results = await db.semanticSearch(query, {
      categoryFilter: category || undefined,
      maxResults,
      similarityThreshold: 0.8
    });
    
    return NextResponse.json({
      success: true,
      query,
      category: category || 'all',
      results,
      count: results.length
    });
    
  } catch (error) {
    console.error('Oracle search API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Search failed', 
        message: String(error) 
      },
      { status: 500 }
    );
  }
}