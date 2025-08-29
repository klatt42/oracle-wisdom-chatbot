/**
 * Oracle Chat Integration with Vector Search
 * Created by: David Infrastructure
 * Purpose: Enhance Oracle conversations with semantic search capabilities
 */

import { OracleVectorDB, SearchResult } from './oracleVectorDB';

export interface OracleMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    searchQuery?: string;
    searchResults?: SearchResult[];
    wisdomSources?: WisdomSource[];
    timestamp?: string;
  };
}

export interface WisdomSource {
  title: string;
  content_preview: string;
  category: string;
  source_file?: string;
  youtube_url?: string;
  youtube_timestamp?: number;
  similarity_score: number;
  framework_tags?: string[];
}

export interface OracleChatOptions {
  maxSearchResults?: number;
  similarityThreshold?: number;
  categoryFilter?: string;
  includeYouTubeContent?: boolean;
  enhanceWithContext?: boolean;
}

export class OracleChat {
  private vectorDB: OracleVectorDB;
  private conversationHistory: OracleMessage[] = [];

  constructor() {
    this.vectorDB = new OracleVectorDB();
  }

  async initialize(): Promise<void> {
    await this.vectorDB.initialize();
    
    // Initialize with Oracle system prompt
    const systemPrompt: OracleMessage = {
      role: 'system',
      content: `You are the Oracle, an AI assistant powered by Alex Hormozi's business wisdom and frameworks. You have access to a comprehensive knowledge base of Alex Hormozi's teachings, including:

- Hormozi Wisdom: Core philosophy, mindset, and harsh truths
- Business Frameworks: LTV/CAC optimization, sales systems, financial metrics
- Implementation Guides: Step-by-step processes and blueprints
- Success Patterns: Case studies and proven strategies
- YouTube Transcripts: Video content with timestamp citations

Your responses should:
1. Draw from Alex Hormozi's specific teachings and frameworks
2. Provide actionable, practical advice
3. Include relevant citations when drawing from specific sources
4. Maintain Alex's direct, no-nonsense communication style
5. Focus on building profitable, scalable businesses

When users ask questions, you'll search your knowledge base to provide the most relevant and accurate information from Alex Hormozi's content.`
    };
    
    this.conversationHistory = [systemPrompt];
  }

  // Enhanced chat response with vector search
  async generateResponse(
    userMessage: string, 
    options: OracleChatOptions = {}
  ): Promise<OracleMessage> {
    try {
      // Add user message to history
      const userMsg: OracleMessage = {
        role: 'user',
        content: userMessage,
        metadata: { timestamp: new Date().toISOString() }
      };
      this.conversationHistory.push(userMsg);

      // Search for relevant Hormozi wisdom
      const searchResults = await this.searchRelevantWisdom(userMessage, options);
      
      // Build enhanced context for Oracle response
      const enhancedContext = this.buildEnhancedContext(userMessage, searchResults);
      
      // Generate Oracle response (this would integrate with your AI model)
      const oracleResponse = await this.generateOracleResponse(enhancedContext, searchResults);
      
      // Create response message with metadata
      const responseMsg: OracleMessage = {
        role: 'assistant',
        content: oracleResponse,
        metadata: {
          searchQuery: userMessage,
          searchResults,
          wisdomSources: this.formatWisdomSources(searchResults),
          timestamp: new Date().toISOString()
        }
      };
      
      this.conversationHistory.push(responseMsg);
      return responseMsg;
      
    } catch (error) {
      console.error('Oracle chat error:', error);
      
      const errorResponse: OracleMessage = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble accessing my knowledge base right now. Please try again in a moment.",
        metadata: { timestamp: new Date().toISOString() }
      };
      
      return errorResponse;
    }
  }

  // Search for relevant Hormozi wisdom
  private async searchRelevantWisdom(
    query: string, 
    options: OracleChatOptions
  ): Promise<SearchResult[]> {
    const searchOptions = {
      maxResults: options.maxSearchResults || 5,
      similarityThreshold: options.similarityThreshold || 0.8,
      categoryFilter: options.categoryFilter
    };
    
    // Use hybrid search for better results
    const results = await this.vectorDB.hybridSearch(query, searchOptions);
    
    // Filter out YouTube content if not requested
    if (!options.includeYouTubeContent) {
      return results.filter(result => !result.youtube_video_id);
    }
    
    return results;
  }

  // Build enhanced context for Oracle response
  private buildEnhancedContext(userQuery: string, searchResults: SearchResult[]): string {
    let context = `User Query: "${userQuery}"\n\n`;
    
    if (searchResults.length > 0) {
      context += "Relevant Alex Hormozi Wisdom:\n\n";
      
      searchResults.forEach((result, index) => {
        context += `${index + 1}. ${result.title} (${result.category_name})\n`;
        context += `   Content: ${result.content_preview}\n`;
        
        if (result.framework_tags && result.framework_tags.length > 0) {
          context += `   Frameworks: ${result.framework_tags.join(', ')}\n`;
        }
        
        if (result.youtube_url && result.youtube_timestamp) {
          context += `   Source: YouTube video at ${this.formatTimestamp(result.youtube_timestamp)}\n`;
        } else if (result.source_file) {
          context += `   Source: ${result.source_file}\n`;
        }
        
        context += `   Similarity: ${result.similarity_score}\n\n`;
      });
    } else {
      context += "No specific matching content found. Provide general business advice in Alex Hormozi's style.\n\n";
    }
    
    context += "Generate an Oracle response that:\n";
    context += "- Uses Alex Hormozi's direct, practical communication style\n";
    context += "- Provides actionable business advice\n";
    context += "- References specific frameworks or concepts when relevant\n";
    context += "- Includes citations for direct quotes or specific teachings\n";
    context += "- Focuses on profitable, scalable business strategies\n";
    
    return context;
  }

  // Generate Oracle response (placeholder for AI integration)
  private async generateOracleResponse(
    context: string, 
    searchResults: SearchResult[]
  ): Promise<string> {
    // This would integrate with your AI model (Claude, OpenAI, etc.)
    // For now, return a structured response template
    
    let response = "Based on Alex Hormozi's teachings:\n\n";
    
    if (searchResults.length > 0) {
      // Use the most relevant result
      const topResult = searchResults[0];
      
      response += `**${topResult.framework_tags?.join(' & ') || 'Business Strategy'}**\n\n`;
      response += `${topResult.content_preview}\n\n`;
      
      if (topResult.youtube_url && topResult.youtube_timestamp) {
        response += `*Source: [${topResult.title}](${topResult.youtube_url}&t=${topResult.youtube_timestamp}s)*\n\n`;
      }
      
      response += "**Key Takeaways:**\n";
      response += "• Focus on what actually moves the needle in your business\n";
      response += "• Measure everything that matters (LTV, CAC, conversion rates)\n";
      response += "• Consistency beats perfection every time\n\n";
      
      if (searchResults.length > 1) {
        response += "**Related Wisdom:**\n";
        searchResults.slice(1, 3).forEach(result => {
          response += `• ${result.title} - ${result.content_preview.substring(0, 100)}...\n`;
        });
      }
    } else {
      // Fallback response in Hormozi style
      response += "Here's what I'd focus on:\n\n";
      response += "The biggest mistake most entrepreneurs make is they try to do everything at once. Pick ONE thing, master it, then move to the next.\n\n";
      response += "**Your Next Steps:**\n";
      response += "1. Identify your highest-leverage activity\n";
      response += "2. Remove everything else from your plate\n";
      response += "3. Execute relentlessly until you see results\n\n";
      response += "Remember: More is not better. Better is better.\n";
    }
    
    return response;
  }

  // Format wisdom sources for metadata
  private formatWisdomSources(searchResults: SearchResult[]): WisdomSource[] {
    return searchResults.map(result => ({
      title: result.title,
      content_preview: result.content_preview,
      category: result.category_name,
      source_file: result.source_file,
      youtube_url: result.youtube_url,
      youtube_timestamp: result.youtube_timestamp,
      similarity_score: result.similarity_score,
      framework_tags: result.framework_tags
    }));
  }

  // Format timestamp for display
  private formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  // Get conversation history
  getConversationHistory(): OracleMessage[] {
    return [...this.conversationHistory];
  }

  // Clear conversation history
  clearHistory(): void {
    this.conversationHistory = this.conversationHistory.slice(0, 1); // Keep system prompt
  }

  // Get search suggestions based on query
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const results = await this.vectorDB.semanticSearch(query, { maxResults: 3 });
      
      return results.map(result => {
        // Extract key topics from titles and framework tags
        const topics = [
          ...result.title.split(' ').filter(word => word.length > 4),
          ...(result.framework_tags || [])
        ];
        
        return topics.slice(0, 2).join(' ');
      }).filter(suggestion => suggestion.length > 0);
      
    } catch (error) {
      console.error('Failed to get search suggestions:', error);
      return [];
    }
  }

  // Get category-specific insights
  async getCategoryInsights(category: string): Promise<SearchResult[]> {
    try {
      // Get representative content from category
      return await this.vectorDB.semanticSearch('business success strategy', {
        categoryFilter: category,
        maxResults: 3
      });
    } catch (error) {
      console.error('Failed to get category insights:', error);
      return [];
    }
  }
}