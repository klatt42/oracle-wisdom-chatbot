/**
 * Real Oracle Chat - Direct Hormozi Wisdom Database Integration
 * Elena Execution - Technical Fix for Database Connectivity Issues
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export interface HormoziWisdomResult {
  id: string;
  content: string;
  source: string;
  book?: string;
  chapter?: string;
  topic: string;
  framework: string;
  business_phase: string;
  difficulty_level: string;
  implementation_time: string;
  success_metrics: string[];
  related_concepts: string[];
  similarity?: number;
}

export interface OracleResponse {
  content: string;
  metadata: {
    searchQuery: string;
    searchResults: HormoziWisdomResult[];
    wisdomSources: WisdomSource[];
    timestamp: string;
  };
}

export interface WisdomSource {
  title: string;
  content_preview: string;
  category: string;
  similarity_score: number;
  framework_tags?: string[];
}

export class RealOracleChat {
  private supabase: SupabaseClient;
  private openai: OpenAI | null;
  private conversationHistory: Array<{role: string; content: string}> = [];

  constructor() {
    // Initialize Supabase with service role for full access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('🔥 CRITICAL: Missing Supabase credentials for Oracle database access');
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Initialize OpenAI for enhanced responses
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      console.warn('⚠️ OpenAI API key missing - Oracle will use template responses');
      this.openai = null;
    } else {
      this.openai = new OpenAI({ apiKey: openaiKey });
    }
  }

  async initialize(): Promise<void> {
    console.log('🔮 Initializing Real Oracle Chat with Hormozi Wisdom Database...');
    
    try {
      // Test database connectivity
      const { count, error } = await this.supabase
        .from('hormozi_wisdom')
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new Error(`Database connectivity failed: ${error.message}`);
      }

      console.log(`✅ Connected to Hormozi Wisdom Database: ${count} wisdom entries available`);

      // Initialize conversation with system prompt
      this.conversationHistory = [{
        role: 'system',
        content: `You are the Oracle, powered by Alex Hormozi's business wisdom database with ${count} proven strategies.

Your database contains:
- Grand Slam Offers and value creation principles
- Lead generation and customer acquisition systems  
- Business scaling and operational frameworks
- Sales optimization and revenue strategies
- Mindset and entrepreneurial philosophy

Respond with:
1. Direct, actionable advice from Alex Hormozi's teachings
2. Specific framework references when relevant
3. Real citations from the database search results
4. Alex's no-nonsense, practical communication style
5. Focus on profitable, scalable business strategies

Always use the search results provided to give specific, data-backed responses.`
      }];

    } catch (error) {
      console.error('❌ Oracle initialization failed:', error);
      throw error;
    }
  }

  async generateResponse(userMessage: string, options: any = {}): Promise<OracleResponse> {
    try {
      console.log('🔍 Oracle processing query:', userMessage);

      // Search Hormozi wisdom database
      const searchResults = await this.searchHormoziWisdom(userMessage, options);
      console.log(`📊 Found ${searchResults.length} relevant wisdom entries`);

      // Generate enhanced response
      const oracleContent = await this.generateEnhancedResponse(userMessage, searchResults);

      // Format wisdom sources
      const wisdomSources: WisdomSource[] = searchResults.map(result => ({
        title: `${result.framework} - ${result.topic}`,
        content_preview: result.content.substring(0, 150) + '...',
        category: result.topic,
        similarity_score: result.similarity || 0,
        framework_tags: [result.framework]
      }));

      const response: OracleResponse = {
        content: oracleContent,
        metadata: {
          searchQuery: userMessage,
          searchResults,
          wisdomSources,
          timestamp: new Date().toISOString()
        }
      };

      console.log('✅ Oracle response generated successfully');
      return response;

    } catch (error) {
      console.error('❌ Oracle response generation failed:', error);
      
      // Fallback response with diagnostic info
      return {
        content: `I encountered a technical issue accessing the wisdom database. Error details: ${error.message}\n\nPlease try rephrasing your question or contact support if this persists.`,
        metadata: {
          searchQuery: userMessage,
          searchResults: [],
          wisdomSources: [],
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  private async searchHormoziWisdom(query: string, options: any): Promise<HormoziWisdomResult[]> {
    try {
      const { data, error } = await this.supabase
        .rpc('search_hormozi_wisdom', {
          query_text: query,
          match_count: options.maxSearchResults || 5
        });

      if (error) {
        console.error('🔥 Database search error:', error);
        throw new Error(`Search failed: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.log('⚠️ No wisdom entries found for query, falling back to general topic search');
        
        // Fallback to topic-based search
        const { data: fallbackData, error: fallbackError } = await this.supabase
          .from('hormozi_wisdom')
          .select('*')
          .or(`topic.ilike.%${query}%,framework.ilike.%${query}%,content.ilike.%${query}%`)
          .limit(options.maxSearchResults || 5);

        if (fallbackError) {
          throw new Error(`Fallback search failed: ${fallbackError.message}`);
        }

        return fallbackData || [];
      }

      return data;

    } catch (error) {
      console.error('❌ Hormozi wisdom search failed:', error);
      throw error;
    }
  }

  private async generateEnhancedResponse(userQuery: string, searchResults: HormoziWisdomResult[]): Promise<string> {
    if (searchResults.length === 0) {
      return this.generateFallbackResponse(userQuery);
    }

    // Use OpenAI if available, otherwise use template response
    if (this.openai) {
      return await this.generateAIResponse(userQuery, searchResults);
    } else {
      return this.generateTemplateResponse(userQuery, searchResults);
    }
  }

  private async generateAIResponse(userQuery: string, searchResults: HormoziWisdomResult[]): Promise<string> {
    try {
      const context = this.buildSearchContext(userQuery, searchResults);

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          ...this.conversationHistory,
          { role: 'user', content: `${context}\n\nUser Question: ${userQuery}` }
        ],
        max_tokens: 800,
        temperature: 0.7
      });

      return completion.choices[0]?.message?.content || this.generateTemplateResponse(userQuery, searchResults);

    } catch (error) {
      console.error('❌ AI response generation failed:', error);
      return this.generateTemplateResponse(userQuery, searchResults);
    }
  }

  private generateTemplateResponse(userQuery: string, searchResults: HormoziWisdomResult[]): string {
    const topResult = searchResults[0];
    
    let response = `## ${topResult.framework}\n\n`;
    response += `${topResult.content}\n\n`;
    
    response += `**Implementation:**\n`;
    response += `• Business Phase: ${topResult.business_phase}\n`;
    response += `• Difficulty Level: ${topResult.difficulty_level}\n`;
    response += `• Time Frame: ${topResult.implementation_time}\n\n`;
    
    if (topResult.success_metrics && topResult.success_metrics.length > 0) {
      response += `**Success Metrics:**\n`;
      topResult.success_metrics.forEach(metric => {
        response += `• ${metric}\n`;
      });
      response += '\n';
    }
    
    if (topResult.related_concepts && topResult.related_concepts.length > 0) {
      response += `**Related Concepts:**\n`;
      topResult.related_concepts.forEach(concept => {
        response += `• ${concept}\n`;
      });
      response += '\n';
    }
    
    response += `*Source: ${topResult.source}*\n`;
    
    if (searchResults.length > 1) {
      response += `\n**Additional Resources:**\n`;
      searchResults.slice(1, 3).forEach((result, index) => {
        response += `${index + 2}. **${result.framework}** - ${result.content.substring(0, 100)}...\n`;
      });
    }
    
    return response;
  }

  private generateFallbackResponse(userQuery: string): string {
    return `I searched the Hormozi wisdom database but couldn't find specific content matching "${userQuery}". 

Here's Alex Hormozi's core business principle that applies to most situations:

**Focus on the fundamentals:**
1. Identify your highest-leverage activity
2. Remove everything else from your plate  
3. Execute consistently until you see results

The biggest mistake entrepreneurs make is trying to do everything at once. Pick ONE thing, master it, then move to the next.

**Remember:** More is not better. Better is better.

Try asking about specific topics like "Grand Slam Offers", "lead generation", "business scaling", or "sales systems" for more targeted advice.`;
  }

  private buildSearchContext(userQuery: string, searchResults: HormoziWisdomResult[]): string {
    let context = `Based on Alex Hormozi's wisdom database, here are the most relevant teachings for "${userQuery}":\n\n`;
    
    searchResults.forEach((result, index) => {
      context += `${index + 1}. **${result.framework}** (${result.topic})\n`;
      context += `Content: ${result.content}\n`;
      context += `Source: ${result.source}\n`;
      
      if (result.success_metrics && result.success_metrics.length > 0) {
        context += `Success Metrics: ${result.success_metrics.join(', ')}\n`;
      }
      
      context += '\n';
    });
    
    context += 'Please provide a comprehensive response based on this wisdom, using Alex Hormozi\'s direct, practical communication style.';
    
    return context;
  }

  getConversationHistory(): Array<{role: string; content: string}> {
    return [...this.conversationHistory];
  }

  clearHistory(): void {
    this.conversationHistory = this.conversationHistory.slice(0, 1); // Keep system prompt
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const { data, error } = await this.supabase
        .from('hormozi_wisdom')
        .select('framework, topic')
        .ilike('content', `%${query}%`)
        .limit(5);

      if (error || !data) return [];

      return [...new Set(data.map(item => item.framework))].slice(0, 5);
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  async getCategoryInsights(category: string): Promise<HormoziWisdomResult[]> {
    try {
      const { data, error } = await this.supabase
        .from('hormozi_wisdom')
        .select('*')
        .eq('topic', category)
        .limit(3);

      return data || [];
    } catch (error) {
      console.error('Failed to get category insights:', error);
      return [];
    }
  }
}