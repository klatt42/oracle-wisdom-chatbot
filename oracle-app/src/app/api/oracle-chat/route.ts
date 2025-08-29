/**
 * Oracle Chat API Route
 * Created by: David Infrastructure  
 * Purpose: Provide enhanced chat interface with vector-powered Hormozi wisdom
 */

import { NextRequest, NextResponse } from 'next/server';
import { OracleChat, OracleChatOptions } from '@/lib/oracleChat';
import { 
  ApiResponse,
  WisdomSource,
  ContentMetadata 
} from '@/types/oracle';

// Initialize Oracle chat instance
let oracleChat: OracleChat | null = null;

async function getOracleChat(): Promise<OracleChat> {
  if (!oracleChat) {
    oracleChat = new OracleChat();
    await oracleChat.initialize();
  }
  return oracleChat;
}

interface ChatRequest {
  message: string;
  options?: Partial<OracleChatOptions>;
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
      data: {
        message: response.content,
        metadata: response.metadata,
        timestamp: new Date().toISOString()
      },
      metadata: {
        request_id: `chat_${Date.now()}`,
        timestamp: new Date().toISOString(),
        processing_time_ms: 0 // Would be calculated from actual processing time
      }
    });
    
  } catch (error) {
    console.error('Oracle chat API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: {
          code: 'CHAT_ERROR',
          message: 'Chat response failed',
          details: { originalError: String(error) }
        }
      },
      { status: 500 }
    );
  }
}

type HistoryResponse = ApiResponse<{
  history: WisdomSource[];
  count: number;
}>;

type SuggestionsResponse = ApiResponse<{
  suggestions: string[];
  query: string;
}>;

type InsightsResponse = ApiResponse<{
  category: string;
  insights: WisdomSource[];
  count: number;
}>;

type GetResponse = HistoryResponse | SuggestionsResponse | InsightsResponse;

export async function GET(request: NextRequest): Promise<NextResponse<GetResponse>> {
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
        });
        
      case 'suggestions':
        const query = searchParams.get('query') || '';
        const suggestions = await oracle.getSearchSuggestions(query);
        return NextResponse.json({
          success: true,
          data: {
            suggestions,
            query
          }
        });
        
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
        });
        
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
    console.error('Oracle chat API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: {
          code: 'GET_ERROR',
          message: 'Request failed',
          details: { originalError: String(error) }
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