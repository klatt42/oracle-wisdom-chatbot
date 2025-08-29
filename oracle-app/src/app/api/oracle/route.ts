import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { 
  searchHormoziWisdomByContext, 
  searchOracleKnowledgeBase,
  storeOracleConversation, 
  type HormoziWisdom 
} from '@/lib/supabase';

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
function formatWisdomForPrompt(wisdomResults: any[]): string {
  if (wisdomResults.length === 0) return '';
  
  let wisdomContent = '\n\nRELEVANT BUSINESS WISDOM FROM ORACLE KNOWLEDGE BASE:\n';
  
  wisdomResults.forEach((wisdom, index) => {
    wisdomContent += `\n${index + 1}. `;
    
    // Handle legacy wisdom format
    if (wisdom.source_type === 'legacy_wisdom') {
      wisdomContent += `SOURCE: ${wisdom.source}`;
      if (wisdom.book) wisdomContent += ` | BOOK: ${wisdom.book}`;
      if (wisdom.chapter) wisdomContent += ` | CHAPTER: ${wisdom.chapter}`;
      if (wisdom.framework) wisdomContent += ` | FRAMEWORK: ${wisdom.framework}`;
      wisdomContent += `\nCONTENT: ${wisdom.content}\n`;
    }
    // Handle processed content format
    else if (wisdom.source_type === 'processed_content') {
      wisdomContent += `SOURCE: ${wisdom.content_title} (${wisdom.content_type})`;
      if (wisdom.detected_frameworks && wisdom.detected_frameworks.length > 0) {
        wisdomContent += ` | FRAMEWORKS: ${wisdom.detected_frameworks.join(', ')}`;
      }
      wisdomContent += `\nCONTENT: ${wisdom.text_content}\n`;
    }
    // Fallback for unknown formats
    else {
      wisdomContent += `SOURCE: ${wisdom.source || wisdom.content_title || 'Unknown'}`;
      wisdomContent += `\nCONTENT: ${wisdom.content || wisdom.text_content}\n`;
    }
  });
  
  wisdomContent += '\nUse this knowledge to enhance your Oracle response with both established wisdom and fresh insights while maintaining your mystical persona.\n';
  return wisdomContent;
}

// Generate citations from wisdom results (Enhanced for Phase 3.5)
function generateCitationsFromWisdom(wisdomResults: any[]): string[] {
  const citations: string[] = [];
  
  wisdomResults.forEach(wisdom => {
    let citation = '';
    
    // Handle legacy wisdom format
    if (wisdom.source_type === 'legacy_wisdom') {
      if (wisdom.book && wisdom.chapter) {
        citation = `${wisdom.book} - Alex Hormozi, ${wisdom.chapter}`;
      } else if (wisdom.framework) {
        citation = `Alex Hormozi's ${wisdom.framework} Framework`;
      } else if (wisdom.source.includes('business-frameworks')) {
        citation = 'Business Frameworks - Alex Hormozi Methodologies';
      } else if (wisdom.source.includes('success-patterns')) {
        citation = 'Success Patterns - Proven Hormozi Strategies';
      } else if (wisdom.source.includes('implementation-guides')) {
        citation = 'Implementation Guide - Alex Hormozi Business Building';
      } else {
        citation = 'Alex Hormozi Business Wisdom - Oracle Knowledge Base';
      }
    }
    // Handle processed content format
    else if (wisdom.source_type === 'processed_content') {
      const contentType = wisdom.content_type;
      const title = wisdom.content_title || 'Unknown Source';
      
      if (contentType === 'url') {
        citation = `Web Content: ${title}`;
      } else if (contentType === 'youtube') {
        citation = `YouTube Video: ${title}`;
      } else if (contentType === 'file') {
        citation = `Document: ${title}`;
      } else {
        citation = `Oracle Knowledge Base: ${title}`;
      }
    }
    // Fallback
    else {
      citation = `Oracle Knowledge Base: ${wisdom.source || wisdom.content_title || 'Business Wisdom'}`;
    }
    
    if (!citations.includes(citation)) {
      citations.push(citation);
    }
  });
  
  return citations.slice(0, 4); // Increased to 4 citations for richer sources
}

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Detect business context and search enhanced knowledge base
    const businessContext = detectBusinessContext(message);
    const wisdomResults = await searchOracleKnowledgeBase(message, businessContext, true, 5);
    
    // Format wisdom content for Claude prompt
    const wisdomContent = formatWisdomForPrompt(wisdomResults);
    const enhancedPrompt = ORACLE_SYSTEM_PROMPT + wisdomContent;

    // Call Claude API with enhanced prompt including relevant wisdom
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

    // Extract response content
    const responseContent = response.content[0];
    const oracleResponse = responseContent.type === 'text' ? responseContent.text : 'The Oracle remains silent.';

    // Generate citations from knowledge base results
    const citations = wisdomResults.length > 0 
      ? generateCitationsFromWisdom(wisdomResults)
      : generateMockCitations(message);

    // Store conversation for analytics (asynchronous)
    storeOracleConversation(message, oracleResponse, citations, sessionId).catch(err => {
      console.error('Error storing conversation:', err);
    });

    return NextResponse.json({
      response: oracleResponse,
      citations: citations,
      wisdomUsed: wisdomResults.length > 0,
    });

  } catch (error) {
    console.error('Oracle API Error:', error);
    return NextResponse.json(
      { error: 'The Oracle\'s connection has been disrupted. Please try again.' },
      { status: 500 }
    );
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