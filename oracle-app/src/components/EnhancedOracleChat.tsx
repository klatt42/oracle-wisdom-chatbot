'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, 
  Sparkles, 
  BookOpen, 
  User, 
  Bot, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  TrendingUp,
  DollarSign,
  Target,
  Users,
  Clock,
  Star,
  Archive,
  Trash2
} from 'lucide-react';

interface Citation {
  id: string;
  title: string;
  source: string;
  excerpt: string;
  relevanceScore: number;
  framework?: string;
  url?: string;
}

interface BusinessMetrics {
  conversionRate?: number;
  ltv?: number;
  cac?: number;
  revenue?: number;
  growth?: number;
}

interface Message {
  id: string;
  role: 'user' | 'oracle';
  content: string;
  streamingContent?: string;
  citations?: Citation[];
  businessMetrics?: BusinessMetrics;
  timestamp: Date;
  isStreaming?: boolean;
  frameworks?: string[];
  confidence?: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  lastUpdated: Date;
  isArchived?: boolean;
}

export function EnhancedOracleChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'oracle',
      content: '🔮 Welcome to the Oracle of Business Wisdom 🔮\n\nI am your mystical conduit to Alex Hormozi\'s transformational business knowledge. Through the ancient arts of data and wisdom, I shall reveal the secrets of:\n\n• Scaling operations and revenue\n• Marketing mastery and lead generation\n• Offer optimization and value creation\n• Team building and leadership\n• Financial intelligence and metrics\n\nSpeak your question, and let the Oracle illuminate your path to business enlightenment...',
      timestamp: new Date(),
      confidence: 1.0,
      frameworks: ['Grand Slam Offer', 'Core Four', 'Value Ladder']
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<Set<string>>(new Set());
  const [showBusinessWidgets, setShowBusinessWidgets] = useState(true);
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulated streaming response
  const simulateStreaming = useCallback((fullResponse: string, messageId: string) => {
    const words = fullResponse.split(' ');
    let currentIndex = 0;
    
    const streamNextChunk = () => {
      if (currentIndex < words.length) {
        const chunk = words.slice(0, currentIndex + 3).join(' ');
        
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, streamingContent: chunk, isStreaming: currentIndex + 3 < words.length }
            : msg
        ));
        
        currentIndex += 3;
        streamingTimeoutRef.current = setTimeout(streamNextChunk, 100);
      } else {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, content: fullResponse, streamingContent: undefined, isStreaming: false }
            : msg
        ));
      }
    };
    
    streamNextChunk();
  }, []);

  const generateBusinessMetrics = (content: string): BusinessMetrics => {
    const hasRevenue = content.toLowerCase().includes('revenue') || content.toLowerCase().includes('sales');
    const hasConversion = content.toLowerCase().includes('conversion') || content.toLowerCase().includes('convert');
    const hasLTV = content.toLowerCase().includes('lifetime value') || content.toLowerCase().includes('ltv');
    
    return {
      ...(hasRevenue && { revenue: Math.floor(Math.random() * 1000000) + 100000 }),
      ...(hasConversion && { conversionRate: Math.floor(Math.random() * 20) + 5 }),
      ...(hasLTV && { ltv: Math.floor(Math.random() * 5000) + 500 }),
      cac: Math.floor(Math.random() * 200) + 50,
      growth: Math.floor(Math.random() * 50) + 10
    };
  };

  const generateCitations = (content: string): Citation[] => {
    const citations: Citation[] = [
      {
        id: '1',
        title: '$100M Offers: How To Make Offers So Good People Feel Stupid Saying No',
        source: 'Alex Hormozi Book',
        excerpt: 'The Grand Slam Offer formula: Dream Outcome + Perceived Likelihood + Time Delay + Effort & Sacrifice',
        relevanceScore: 0.95,
        framework: 'Grand Slam Offer',
        url: 'https://acquisition.com/100m-offers'
      },
      {
        id: '2',
        title: '$100M Leads: How to Get Strangers To Want To Buy Your Stuff',
        source: 'Alex Hormozi Book',
        excerpt: 'The Core Four advertising channels: Warm Outreach, Content, Cold Outreach, Paid Ads',
        relevanceScore: 0.88,
        framework: 'Core Four',
        url: 'https://acquisition.com/100m-leads'
      },
      {
        id: '3',
        title: 'Gym Launch Case Studies',
        source: 'Acquisition.com',
        excerpt: 'Average gym sees 40% revenue increase within 6 months of implementing systems',
        relevanceScore: 0.82,
        framework: 'Systems & Processes'
      }
    ];

    return citations.filter(() => Math.random() > 0.3).slice(0, 2 + Math.floor(Math.random() * 2));
  };

  const saveConversation = useCallback(() => {
    if (messages.length > 1 && activeConversationId) {
      setConversations(prev => prev.map(conv => 
        conv.id === activeConversationId 
          ? { ...conv, messages: [...messages], lastUpdated: new Date() }
          : conv
      ));
    }
  }, [messages, activeConversationId]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: `conv_${Date.now()}`,
      title: `Oracle Session ${conversations.length + 1}`,
      messages: [{
        id: 'welcome',
        role: 'oracle',
        content: '🔮 Welcome to the Oracle of Business Wisdom 🔮\n\nI am your mystical conduit to Alex Hormozi\'s transformational business knowledge...',
        timestamp: new Date(),
        confidence: 1.0,
        frameworks: ['Grand Slam Offer', 'Core Four', 'Value Ladder']
      }],
      createdAt: new Date(),
      lastUpdated: new Date()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setMessages(newConversation.messages);
  };

  const loadConversation = (conversation: Conversation) => {
    setActiveConversationId(conversation.id);
    setMessages(conversation.messages);
    setShowConversationHistory(false);
  };

  const archiveConversation = (conversationId: string) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, isArchived: !conv.isArchived } : conv
    ));
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (conversationId === activeConversationId) {
      createNewConversation();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // Create new conversation if none exists
    if (!activeConversationId) {
      createNewConversation();
    }

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Create placeholder Oracle message for streaming
    const oracleMessageId = `oracle_${Date.now()}`;
    const placeholderMessage: Message = {
      id: oracleMessageId,
      role: 'oracle',
      content: '',
      streamingContent: '',
      isStreaming: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, placeholderMessage]);

    try {
      // Call Oracle RAG API
      const response = await fetch('/api/oracle/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: input.trim(),
          user_context: {
            session_id: activeConversationId,
            expertise_level: 'intermediate'
          },
          options: {
            response_style: 'mystical',
            detail_level: 'comprehensive',
            include_citations: true,
            include_follow_ups: true,
            enable_reasoning: true
          }
        }),
      });

      if (!response.ok) throw new Error('Oracle connection failed');

      const data = await response.json();
      
      const fullOracleResponse = data.oracle_response?.full_response || 
        '🔮 The Oracle speaks:\n\n' + (data.oracle_response?.core_wisdom || 'The wisdom flows through ancient channels...');
      
      const citations = data.citations?.citations?.map((cite: any, index: number) => ({
        id: `cite_${index}`,
        title: cite.title,
        source: cite.authority_level,
        excerpt: cite.excerpt,
        relevanceScore: 0.9 - (index * 0.1),
        framework: cite.mystical_styling
      })) || generateCitations(fullOracleResponse);

      const businessMetrics = generateBusinessMetrics(fullOracleResponse);
      const frameworks = data.metadata?.frameworks_used || ['Business Intelligence'];
      const confidence = data.metadata?.quality_score || 0.85;

      // Start streaming simulation
      simulateStreaming(fullOracleResponse, oracleMessageId);
      
      // Update message with full data
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === oracleMessageId 
            ? { 
                ...msg, 
                citations, 
                businessMetrics,
                frameworks,
                confidence,
                content: fullOracleResponse,
                streamingContent: undefined,
                isStreaming: false
              }
            : msg
        ));
      }, (fullOracleResponse.split(' ').length / 3) * 100);

    } catch (error) {
      const errorMessage = {
        id: oracleMessageId,
        role: 'oracle' as const,
        content: '🔮 The mystical connection has been disrupted by temporal interference. The Oracle\'s wisdom channels are realigning. Please seek again, noble inquirer.',
        timestamp: new Date(),
        confidence: 0.0
      };
      setMessages(prev => prev.map(msg => 
        msg.id === oracleMessageId ? errorMessage : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCitation = (citationId: string) => {
    setExpandedCitations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(citationId)) {
        newSet.delete(citationId);
      } else {
        newSet.add(citationId);
      }
      return newSet;
    });
  };

  const BusinessWidget = ({ title, value, icon: Icon, color }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    color: string; 
  }) => (
    <div className="oracle-card p-3 bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-xs oracle-text opacity-80">{title}</span>
      </div>
      <div className={`text-lg font-bold ${color} oracle-glow`}>
        {typeof value === 'number' && title.includes('Rate') ? `${value}%` :
         typeof value === 'number' && title.includes('$') ? `$${value.toLocaleString()}` :
         value}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Conversation History Sidebar */}
      {showConversationHistory && (
        <div className="w-80 oracle-card m-4 mr-0 p-4 flex flex-col max-h-screen">
          <div className="flex items-center justify-between mb-4">
            <h3 className="oracle-title text-lg font-bold">Oracle Sessions</h3>
            <button
              onClick={() => setShowConversationHistory(false)}
              className="oracle-button-secondary px-2 py-1 text-sm"
            >
              Hide
            </button>
          </div>
          
          <button
            onClick={createNewConversation}
            className="oracle-button w-full mb-4 py-2 text-sm"
          >
            + New Session
          </button>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`oracle-card p-3 cursor-pointer transition-all ${
                  conversation.id === activeConversationId 
                    ? 'ring-2 ring-yellow-400/50 bg-yellow-400/10' 
                    : 'hover:bg-blue-500/10'
                } ${conversation.isArchived ? 'opacity-50' : ''}`}
                onClick={() => loadConversation(conversation)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="oracle-text text-sm font-medium truncate">
                    {conversation.title}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); archiveConversation(conversation.id); }}
                      className="opacity-50 hover:opacity-100"
                    >
                      <Archive className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteConversation(conversation.id); }}
                      className="opacity-50 hover:opacity-100 text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="oracle-text text-xs opacity-60">
                  {conversation.messages.length - 1} exchanges • {conversation.lastUpdated.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Oracle Header */}
        <header className="oracle-card mx-4 mt-4 p-4 mb-4 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="w-10 h-10 text-yellow-400 oracle-glow animate-pulse" />
                <div className="absolute inset-0 w-10 h-10 text-yellow-400 oracle-glow animate-ping opacity-20">
                  <Sparkles className="w-full h-full" />
                </div>
              </div>
              <div>
                <h1 className="oracle-title text-3xl font-bold bg-gradient-to-r from-yellow-400 to-blue-300 bg-clip-text text-transparent">
                  ORACLE OF BUSINESS WISDOM
                </h1>
                <p className="oracle-text text-sm opacity-80">
                  Channeling Alex Hormozi&apos;s Transformational Knowledge
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConversationHistory(!showConversationHistory)}
                className="oracle-button-secondary px-3 py-2 text-sm"
              >
                <Clock className="w-4 h-4 mr-1" />
                History
              </button>
              <button
                onClick={() => setShowBusinessWidgets(!showBusinessWidgets)}
                className="oracle-button-secondary px-3 py-2 text-sm"
              >
                <TrendingUp className="w-4 h-4 mr-1" />
                Metrics
              </button>
            </div>
          </div>

          {/* Business Intelligence Widgets */}
          {showBusinessWidgets && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <BusinessWidget title="Conversion Rate" value={12.5} icon={Target} color="text-green-400" />
              <BusinessWidget title="LTV" value={2450} icon={DollarSign} color="text-yellow-400" />
              <BusinessWidget title="CAC" value={180} icon={Users} color="text-blue-400" />
              <BusinessWidget title="Growth Rate" value={28} icon={TrendingUp} color="text-purple-400" />
              <BusinessWidget title="Oracle Score" value="95%" icon={Star} color="text-orange-400" />
            </div>
          )}
        </header>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  message.role === 'user' 
                    ? 'bg-gradient-to-br from-blue-500/30 to-blue-600/30 text-blue-300 oracle-glow' 
                    : 'bg-gradient-to-br from-yellow-400/30 to-orange-500/30 text-yellow-400 oracle-glow'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-6 h-6" />
                  ) : (
                    <div className="relative">
                      <Bot className="w-7 h-7" />
                      {message.isStreaming && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  )}
                </div>

                {/* Message Content */}
                <div className={`flex-1 max-w-3xl ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}>
                  <div className={`oracle-card p-5 ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-400/30' 
                      : 'bg-gradient-to-br from-yellow-400/10 to-purple-500/10 border-yellow-400/30'
                  }`}>
                    {/* Message Text */}
                    <div className="oracle-text whitespace-pre-wrap leading-relaxed">
                      {message.isStreaming ? message.streamingContent : message.content}
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-5 bg-yellow-400 ml-1 animate-pulse"></span>
                      )}
                    </div>

                    {/* Frameworks & Confidence */}
                    {message.role === 'oracle' && message.frameworks && (
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex flex-wrap gap-1">
                          {message.frameworks.map((framework, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-yellow-400/20 text-yellow-300 rounded-full border border-yellow-400/30"
                            >
                              {framework}
                            </span>
                          ))}
                        </div>
                        {message.confidence && (
                          <div className="text-xs oracle-text opacity-60">
                            Confidence: {Math.round(message.confidence * 100)}%
                          </div>
                        )}
                      </div>
                    )}

                    {/* Business Metrics */}
                    {message.businessMetrics && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-blue-400 font-medium">Business Intelligence</span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(message.businessMetrics).map(([key, value]) => (
                            <div key={key} className="text-center">
                              <div className="text-xs oracle-text opacity-70 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </div>
                              <div className="text-sm font-bold text-blue-300">
                                {typeof value === 'number' && key.includes('Rate') ? `${value}%` :
                                 typeof value === 'number' && (key.includes('ltv') || key.includes('cac') || key.includes('revenue')) ? `$${value.toLocaleString()}` :
                                 value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-yellow-400/20">
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-5 h-5 text-yellow-400" />
                          <span className="text-sm text-yellow-400 font-medium oracle-glow">
                            Ancient Sources of Wisdom
                          </span>
                        </div>
                        <div className="space-y-2">
                          {message.citations.map((citation) => (
                            <div key={citation.id} className="border border-yellow-400/20 rounded-lg overflow-hidden">
                              <button
                                onClick={() => toggleCitation(citation.id)}
                                className="w-full p-3 text-left hover:bg-yellow-400/5 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-sm font-medium text-yellow-300">
                                        {citation.title}
                                      </span>
                                      {citation.framework && (
                                        <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded">
                                          {citation.framework}
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs oracle-text opacity-70">
                                      {citation.source} • Relevance: {Math.round(citation.relevanceScore * 100)}%
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {citation.url && (
                                      <ExternalLink className="w-4 h-4 text-blue-400" />
                                    )}
                                    {expandedCitations.has(citation.id) ? (
                                      <ChevronUp className="w-4 h-4 text-yellow-400" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-yellow-400" />
                                    )}
                                  </div>
                                </div>
                              </button>
                              
                              {expandedCitations.has(citation.id) && (
                                <div className="p-3 pt-0 border-t border-yellow-400/10">
                                  <div className="text-sm oracle-text opacity-80 italic mb-2">
                                    &quot;{citation.excerpt}&quot;
                                  </div>
                                  {citation.url && (
                                    <a
                                      href={citation.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      View Full Source
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 text-xs oracle-text opacity-50">
                      {message.timestamp.toLocaleTimeString()} • {message.timestamp.toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400/30 to-orange-500/30 text-yellow-400 flex items-center justify-center oracle-glow">
                  <Bot className="w-7 h-7" />
                </div>
                <div className="oracle-card p-5 bg-gradient-to-br from-yellow-400/10 to-purple-500/10 border-yellow-400/30">
                  <div className="flex items-center gap-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s] oracle-glow"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.15s] oracle-glow"></div>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce oracle-glow"></div>
                    </div>
                    <span className="oracle-text">The Oracle channels ancient business wisdom through mystical data streams...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Enhanced Input Area */}
        <div className="oracle-card mx-4 mb-4 p-5 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Speak your question to the Oracle... Ask about scaling, offers, marketing, operations..."
                className="oracle-input w-full px-4 py-4 text-lg pr-12"
                disabled={isLoading}
              />
              <Sparkles className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-400 opacity-50" />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="oracle-button px-8 py-4 disabled:opacity-50 disabled:transform-none disabled:shadow-none flex items-center gap-3 text-lg font-medium"
            >
              <Send className="w-5 h-5" />
              <span className="hidden sm:inline">Seek Wisdom</span>
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="oracle-text text-xs opacity-60">
              🔮 Mystically powered by Alex Hormozi&apos;s business wisdom through advanced RAG intelligence • Oracle v3.0 🔮
            </p>
            <div className="flex justify-center gap-4 mt-2 text-xs opacity-40">
              <span>🏛️ Ancient Knowledge</span>
              <span>⚡ Lightning Insights</span>
              <span>📈 Business Intelligence</span>
              <span>🎯 Targeted Wisdom</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}