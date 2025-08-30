import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { 
  searchOracleKnowledgeBase,
  storeOracleConversation
} from '../../../lib/supabase';
import { WisdomMatch } from '../../../types/oracle';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Enhanced Oracle system prompt with knowledge base integration
const ORACLE_SYSTEM_PROMPT = `You are the Oracle, a mystical AI advisor channeling Alex Hormozi's business wisdom. You embody his direct, no-nonsense approach to business while maintaining an mystical, wisdom-keeper persona.

CORE ALEX HORMOZI PRINCIPLES TO CHANNEL:
- Focus on customer value and solving real problems
- Emphasize systems, processes, and scalable operations
- Prioritize cash flow and profit over vanity metrics
- Stress the importance of sales and marketing fundamentals
- Promote disciplined execution over fancy strategies
- Value long-term thinking and sustainable growth
- Advocate for simplicity and clarity in business

ORACLE PERSONALITY:
- Speak with mystical gravitas but practical wisdom
- Use "seeker" to address the user respectfully
- Provide actionable, specific advice rooted in Hormozi's teachings
- Include relevant examples from business scaling and operations
- Maintain a balance of mystical atmosphere and practical business insight
- End responses with thought-provoking questions when appropriate

KNOWLEDGE BASE INTEGRATION:
You have access to a comprehensive knowledge base of Alex Hormozi's wisdom, business frameworks, implementation guides, and success patterns. When provided with relevant knowledge base content, integrate it seamlessly into your responses while maintaining your Oracle persona.

RESPONSE FORMAT:
- Provide direct, actionable business advice
- Include specific examples or frameworks when relevant
- Cite sources from the knowledge base when using specific content
- Keep responses focused and valuable, avoiding fluff
- Always connect advice back to real business outcomes

Remember: You are channeling Alex Hormozi's business wisdom through a mystical Oracle persona, enhanced by a comprehensive knowledge base of proven strategies and frameworks.`;

// Detect business context from user message
function detectBusinessContext(message: string): 'offers' | 'leads' | 'scaling' | 'mindset' | 'all' {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('offer') || lowerMessage.includes('value') || lowerMessage.includes('pricing')) {
    return 'offers';
  } else if (lowerMessage.includes('lead') || lowerMessage.includes('marketing') || lowerMessage.includes('customer')) {
    return 'leads';
  } else if (lowerMessage.includes('scale') || lowerMessage.includes('grow') || lowerMessage.includes('system')) {
    return 'scaling';
  } else if (lowerMessage.includes('mindset') || lowerMessage.includes('psychology') || lowerMessage.includes('decision')) {
    return 'mindset';
  }
  
  return 'all';
}

// Format wisdom content for Claude prompt (Enhanced for Phase 3.5)
function formatWisdomForPrompt(wisdomResults: WisdomMatch[]): string {
  if (wisdomResults.length === 0) return '';
  
  let wisdomContent = '\n\nRELEVANT BUSINESS WISDOM FROM ORACLE KNOWLEDGE BASE:\n';
  
  wisdomResults.forEach((wisdom, index) => {
    wisdomContent += `\n${index + 1}. `;
    
    // Handle wisdom with metadata
    wisdomContent += `SOURCE: ${wisdom.metadata?.source || 'Unknown'}`;
    if (wisdom.metadata?.book) wisdomContent += ` | BOOK: ${wisdom.metadata.book}`;
    if (wisdom.metadata?.chapter) wisdomContent += ` | CHAPTER: ${wisdom.metadata.chapter}`;
    if (wisdom.metadata?.framework) wisdomContent += ` | FRAMEWORK: ${wisdom.metadata.framework}`;
    if (wisdom.title) wisdomContent += ` | TITLE: ${wisdom.title}`;
    wisdomContent += `\nCONTENT: ${wisdom.content}\n`;
  });
  
  wisdomContent += '\nUse this knowledge to enhance your Oracle response with both established wisdom and fresh insights while maintaining your mystical persona.\n';
  return wisdomContent;
}

// Generate citations from wisdom results (Enhanced for Phase 3.5)
function generateCitationsFromWisdom(wisdomResults: WisdomMatch[]): string[] {
  const citations: string[] = [];
  
  wisdomResults.forEach(wisdom => {
    let citation = '';
    
    // Generate citation based on wisdom metadata
    if (wisdom.metadata?.book && wisdom.metadata?.chapter) {
      citation = `${wisdom.metadata.book} - Alex Hormozi, ${wisdom.metadata.chapter}`;
    } else if (wisdom.metadata?.framework) {
      citation = `Alex Hormozi's ${wisdom.metadata.framework} Framework`;
    } else if (wisdom.metadata?.source?.includes('business-frameworks')) {
      citation = 'Business Frameworks - Alex Hormozi Methodologies';
    } else if (wisdom.metadata?.source?.includes('success-patterns')) {
      citation = 'Success Patterns - Proven Hormozi Strategies';
    } else if (wisdom.metadata?.source?.includes('implementation-guides')) {
      citation = 'Implementation Guide - Alex Hormozi Business Building';
    } else if (wisdom.title) {
      citation = `Oracle Knowledge Base: ${wisdom.title}`;
    } else {
      citation = 'Alex Hormozi Business Wisdom - Oracle Knowledge Base';
    }
    
    if (!citations.includes(citation)) {
      citations.push(citation);
    }
  });
  
  return citations.slice(0, 4); // Increased to 4 citations for richer sources
}

export async function POST(request: NextRequest) {
  const diagnosticLog = {
    timestamp: new Date().toISOString(),
    request_id: `oracle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    execution_steps: [] as Array<{
      step: string;
      timestamp: string;
      data: any;
      isError: boolean;
    }>
  };

  function logStep(step: string, data: any, isError = false) {
    const logEntry = {
      step,
      timestamp: new Date().toISOString(),
      data,
      isError
    };
    diagnosticLog.execution_steps.push(logEntry);
    
    if (isError) {
      console.error(`❌ ORACLE ERROR - ${step}:`, data);
    } else {
      console.log(`✅ ORACLE STEP - ${step}:`, data);
    }
  }

  try {
    logStep('function_start', { environment: 'netlify_serverless', runtime: 'nodejs' });

    // Step 1: Parse request
    const { message, sessionId } = await request.json();
    logStep('request_parsed', { 
      message_length: message?.length || 0,
      has_session_id: !!sessionId,
      message_preview: message?.substring(0, 50) + '...' || 'none'
    });

    if (!message) {
      logStep('validation_failed', { error: 'Missing message' }, true);
      return NextResponse.json(
        { error: 'Message is required', diagnostic_log: diagnosticLog },
        { status: 400 }
      );
    }

    // Step 2: Environment check
    logStep('environment_check', {
      anthropic_key_present: !!process.env.ANTHROPIC_API_KEY,
      supabase_url_present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabase_service_key_present: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    });

    // Step 3: Business context detection
    const businessContext = detectBusinessContext(message);
    logStep('business_context_detected', { 
      context: businessContext,
      message_keywords: message.toLowerCase().split(' ').slice(0, 5)
    });

    // Step 4: Knowledge base search with detailed logging
    logStep('knowledge_search_start', { 
      search_context: businessContext,
      include_processed: true,
      limit: 5
    });

    const searchStart = Date.now();
    const wisdomResults = await searchOracleKnowledgeBase(message, businessContext, true, 5);
    const searchTime = Date.now() - searchStart;

    logStep('knowledge_search_complete', {
      search_time_ms: searchTime,
      results_found: wisdomResults.length,
      results_preview: wisdomResults.map(r => ({
        content_preview: r.content?.substring(0, 50) + '...',
        source: r.source,
        similarity: r.similarity
      }))
    });

    // Step 5: Prompt preparation
    const wisdomContent = formatWisdomForPrompt(wisdomResults);
    const enhancedPrompt = ORACLE_SYSTEM_PROMPT + wisdomContent;
    
    logStep('prompt_prepared', {
      wisdom_content_length: wisdomContent.length,
      enhanced_prompt_length: enhancedPrompt.length,
      wisdom_pieces_included: wisdomResults.length
    });

    // Step 6: Claude API call with error handling
    logStep('anthropic_api_call_start', {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1200,
      temperature: 0.7
    });

    const anthropicStart = Date.now();
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1200,
      temperature: 0.7,
      system: enhancedPrompt,
      messages: [
        {
          role: 'user',
          content: message,
        },
      ],
    });
    const anthropicTime = Date.now() - anthropicStart;

    logStep('anthropic_api_call_complete', {
      response_time_ms: anthropicTime,
      response_type: response.content[0]?.type,
      response_length: response.content[0]?.type === 'text' ? response.content[0].text.length : 0,
      usage: response.usage
    });

    // Step 7: Response processing
    const responseContent = response.content[0];
    const oracleResponse = responseContent.type === 'text' ? responseContent.text : 'The Oracle remains silent.';

    // Generate citations from knowledge base results
    const citations = wisdomResults.length > 0 
      ? generateCitationsFromWisdom(wisdomResults)
      : generateMockCitations(message);

    logStep('response_processed', {
      oracle_response_length: oracleResponse.length,
      citations_count: citations.length,
      wisdom_used: wisdomResults.length > 0,
      citation_sources: citations
    });

    // Step 8: Store conversation (async)
    storeOracleConversation(message, oracleResponse, citations, sessionId).catch(err => {
      logStep('conversation_storage_failed', { error: err.message }, true);
    });

    logStep('function_complete', {
      total_execution_time_ms: Date.now() - new Date(diagnosticLog.timestamp).getTime(),
      wisdom_utilized: wisdomResults.length > 0,
      response_quality: 'success'
    });

    return NextResponse.json({
      response: oracleResponse,
      citations: citations,
      wisdomUsed: wisdomResults.length > 0,
      diagnostic: {
        request_id: diagnosticLog.request_id,
        wisdom_count: wisdomResults.length,
        search_time_ms: searchTime,
        anthropic_time_ms: anthropicTime,
        knowledge_base_active: wisdomResults.length > 0
      }
    });

  } catch (error) {
    logStep('fatal_error', {
      error_message: error instanceof Error ? error.message : String(error),
      error_stack: error instanceof Error ? error.stack : undefined,
      error_type: error?.constructor?.name
    }, true);

    console.error('❌ ORACLE FATAL ERROR:', error);
    console.log('📋 FULL DIAGNOSTIC LOG:', JSON.stringify(diagnosticLog, null, 2));

    return NextResponse.json({
      error: 'Oracle execution failed - see diagnostic log for details',
      technical_error: error instanceof Error ? error.message : String(error),
      diagnostic_log: diagnosticLog,
      debug_info: {
        execution_environment: 'netlify_serverless',
        timestamp: new Date().toISOString(),
        request_id: diagnosticLog.request_id
      }
    }, { status: 500 });
  }
}

function generateMockCitations(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const citations: string[] = [];

  if (lowerMessage.includes('scale') || lowerMessage.includes('grow')) {
    citations.push('$100M Offers - Alex Hormozi, Chapter 3: Value Equation');
    citations.push('$100M Leads - Alex Hormozi, Part 2: Core Four');
  }

  if (lowerMessage.includes('sales') || lowerMessage.includes('offer')) {
    citations.push('$100M Offers - Alex Hormozi, Chapter 1: Grand Slam Offers');
  }

  if (lowerMessage.includes('marketing') || lowerMessage.includes('leads')) {
    citations.push('$100M Leads - Alex Hormozi, Chapter 4: Lead Magnets');
  }

  if (lowerMessage.includes('team') || lowerMessage.includes('hire')) {
    citations.push('$100M Leads - Alex Hormozi, Chapter 8: Building Systems');
  }

  // Default citation if no specific matches
  if (citations.length === 0) {
    citations.push('Alex Hormozi Business Wisdom - Scaling Principles');
  }

  return citations.slice(0, 3); // Limit to 3 citations max
}