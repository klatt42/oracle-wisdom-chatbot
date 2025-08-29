/**
 * Oracle Chat API Route
 * Created by: David Infrastructure  
 * Purpose: Provide enhanced chat interface with vector-powered Hormozi wisdom
 */

import { NextRequest, NextResponse } from 'next/server';
import { OracleChat, OracleChatOptions } from '@/lib/oracleChat';

// Initialize Oracle chat instance
let oracleChat: OracleChat | null = null;

async function getOracleChat(): Promise<OracleChat> {
  if (!oracleChat) {
    oracleChat = new OracleChat();
    await oracleChat.initialize();
  }
  return oracleChat;
}

export async function POST(request: NextRequest) {
  try {
    const { message, options } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }
    
    const oracle = await getOracleChat();
    const chatOptions: OracleChatOptions = {
      maxSearchResults: options?.maxSearchResults || 5,
      similarityThreshold: options?.similarityThreshold || 0.8,
      categoryFilter: options?.categoryFilter,
      includeYouTubeContent: options?.includeYouTubeContent !== false,
      enhanceWithContext: options?.enhanceWithContext !== false,
      ...options
    };
    
    const response = await oracle.generateResponse(message, chatOptions);
    
    return NextResponse.json({
      success: true,
      message: response.content,
      metadata: response.metadata,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Oracle chat API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Chat response failed', 
        message: String(error) 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    const oracle = await getOracleChat();
    
    switch (action) {
      case 'history':
        const history = oracle.getConversationHistory();
        return NextResponse.json({
          success: true,
          history: history.slice(1), // Exclude system prompt
          count: history.length - 1
        });
        
      case 'suggestions':
        const query = searchParams.get('query') || '';
        const suggestions = await oracle.getSearchSuggestions(query);
        return NextResponse.json({
          success: true,
          suggestions,
          query
        });
        
      case 'insights':
        const category = searchParams.get('category');
        if (!category) {
          return NextResponse.json(
            { error: 'Category parameter is required for insights' },
            { status: 400 }
          );
        }
        
        const insights = await oracle.getCategoryInsights(category);
        return NextResponse.json({
          success: true,
          category,
          insights,
          count: insights.length
        });
        
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: history, suggestions, or insights' },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('Oracle chat API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Request failed', 
        message: String(error) 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const oracle = await getOracleChat();
    oracle.clearHistory();
    
    return NextResponse.json({
      success: true,
      message: 'Conversation history cleared'
    });
    
  } catch (error) {
    console.error('Oracle chat API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to clear history', 
        message: String(error) 
      },
      { status: 500 }
    );
  }
}