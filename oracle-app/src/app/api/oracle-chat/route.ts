/**
 * Oracle Chat API Route
 * Created by: David Infrastructure  
 * Purpose: Provide enhanced chat interface with vector-powered Hormozi wisdom
 */

import { NextRequest, NextResponse } from 'next/server';
import { RealOracleChat, HormoziWisdomResult, WisdomSource } from '../../../lib/realOracleChat';
import { 
  ApiResponse,
  ContentMetadata,
  OracleMessage
} from '@/types/oracle';

// Initialize Oracle chat instance
let oracleChat: RealOracleChat | null = null;

async function getOracleChat(): Promise<RealOracleChat> {
  if (!oracleChat) {
    console.log('🔮 Initializing Real Oracle Chat instance...');
    oracleChat = new RealOracleChat();
    await oracleChat.initialize();
    console.log('✅ Real Oracle Chat ready for queries');
  }
  return oracleChat;
}

interface ChatRequest {
  message: string;
  options?: any; // Simplified options for Real Oracle Chat
}

type ChatResponse = ApiResponse<{
  message: string;
  metadata: ContentMetadata;
  timestamp: string;
}>;

export async function POST(request: NextRequest): Promise<NextResponse<ChatResponse>> {
  try {
    const requestData: ChatRequest = await request.json();
    const { message, options } = requestData;
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { 
          success: false,
          error: {
            code: 'INVALID_MESSAGE',
            message: 'Message is required and must be a string'
          }
        },
        { status: 400 }
      );
    }
    
    console.log('📨 Processing Oracle chat request:', message);
    const oracle = await getOracleChat();
    
    const chatOptions = {
      maxSearchResults: options?.maxSearchResults || 5,
      similarityThreshold: options?.similarityThreshold || 0.8,
      categoryFilter: options?.categoryFilter,
      ...options
    };
    
    const response = await oracle.generateResponse(message, chatOptions);
    console.log('🔮 Oracle response generated successfully');
    
    const responseMetadata: ContentMetadata = {
      processed_at: new Date().toISOString(),
      ...(response.metadata || {}),
      searchQuery: response.metadata?.searchQuery || '',
      searchResults: response.metadata?.searchResults || [],
      wisdomSources: response.metadata?.wisdomSources || [],
      timestamp: response.metadata?.timestamp || new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: {
        message: response.content,
        metadata: responseMetadata,
        timestamp: new Date().toISOString()
      },
      metadata: {
        request_id: `chat_${Date.now()}`,
        timestamp: new Date().toISOString(),
        processing_time_ms: 0 // Would be calculated from actual processing time
      }
    });
    
  } catch (error) {
    console.error('🔥 Oracle chat API error:', error);
    console.error('🔍 Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    
    return NextResponse.json(
      { 
        success: false, 
        error: {
          code: 'CHAT_ERROR',
          message: `Oracle database connectivity failed: ${error instanceof Error ? error.message : String(error)}`,
          details: { 
            originalError: String(error),
            timestamp: new Date().toISOString(),
            debugInfo: 'Check Supabase connection and hormozi_wisdom table'
          }
        }
      },
      { status: 500 }
    );
  }
}

type HistoryResponse = ApiResponse<{
  history: OracleMessage[];
  count: number;
}>;

type SuggestionsResponse = ApiResponse<{
  suggestions: string[];
  query: string;
}>;

type InsightsResponse = ApiResponse<{
  category: string;
  insights: HormoziWisdomResult[];
  count: number;
}>;

type GetResponse = HistoryResponse | SuggestionsResponse | InsightsResponse;

export async function GET(request: NextRequest): Promise<NextResponse<HistoryResponse | SuggestionsResponse | InsightsResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    const oracle = await getOracleChat();
    
    switch (action) {
      case 'history':
        const history = oracle.getConversationHistory();
        return NextResponse.json({
          success: true,
          data: {
            history: history.slice(1), // Exclude system prompt
            count: history.length - 1
          }
        } as HistoryResponse);
        
      case 'suggestions':
        const query = searchParams.get('query') || '';
        const suggestions = await oracle.getSearchSuggestions(query);
        return NextResponse.json({
          success: true,
          data: {
            suggestions,
            query
          }
        } as SuggestionsResponse);
        
      case 'insights':
        const category = searchParams.get('category');
        if (!category) {
          return NextResponse.json(
            { 
              success: false,
              error: {
                code: 'MISSING_CATEGORY',
                message: 'Category parameter is required for insights'
              }
            },
            { status: 400 }
          );
        }
        
        const insights = await oracle.getCategoryInsights(category);
        return NextResponse.json({
          success: true,
          data: {
            category,
            insights,
            count: insights.length
          }
        } as InsightsResponse);
        
      default:
        return NextResponse.json(
          { 
            success: false,
            error: {
              code: 'INVALID_ACTION',
              message: 'Invalid action. Use: history, suggestions, or insights'
            }
          },
          { status: 400 }
        );
    }
    
  } catch (error) {
    console.error('🔥 Oracle GET API error:', error);
    console.error('🔍 Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    
    return NextResponse.json(
      { 
        success: false, 
        error: {
          code: 'GET_ERROR',
          message: `Oracle GET request failed: ${error instanceof Error ? error.message : String(error)}`,
          details: { 
            originalError: String(error),
            timestamp: new Date().toISOString(),
            debugInfo: 'Check Oracle database connectivity and function availability'
          }
        }
      },
      { status: 500 }
    );
  }
}

type DeleteResponse = ApiResponse<{
  message: string;
}>;

export async function DELETE(_request: NextRequest): Promise<NextResponse<DeleteResponse>> {
  try {
    const oracle = await getOracleChat();
    oracle.clearHistory();
    
    return NextResponse.json({
      success: true,
      data: {
        message: 'Conversation history cleared'
      }
    });
    
  } catch (error) {
    console.error('Oracle chat API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to clear history',
          details: { originalError: String(error) }
        }
      },
      { status: 500 }
    );
  }
}