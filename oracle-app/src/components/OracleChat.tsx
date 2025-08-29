'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, BookOpen, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'oracle';
  content: string;
  citations?: string[];
  timestamp: Date;
}

export function OracleChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'oracle',
      content: 'Welcome to the Oracle. I am your conduit to Alex Hormozi&apos;s business wisdom. Ask me about scaling, marketing, operations, or any business challenge you face. What wisdom do you seek?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call Claude API with Hormozi context
      const response = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!response.ok) throw new Error('Oracle connection failed');

      const data = await response.json();
      
      const oracleMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'oracle',
        content: data.response,
        citations: data.citations || [],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, oracleMessage]);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'oracle',
        content: 'The Oracle&apos;s connection has been disrupted. Please try again, seeker.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Oracle Header */}
      <header className="oracle-card mx-4 mt-4 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-400 oracle-glow" />
            <div>
              <h1 className="oracle-title text-2xl font-bold">ORACLE</h1>
              <p className="oracle-text text-sm opacity-80">Alex Hormozi Business Wisdom</p>
            </div>
          </div>
          <div className="oracle-text text-sm opacity-60">
            {messages.length - 1} exchanges
          </div>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.role === 'user' 
                  ? 'bg-blue-500/20 text-blue-300' 
                  : 'bg-yellow-400/20 text-yellow-400'
              }`}>
                {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-6 h-6" />}
              </div>

              {/* Message Content */}
              <div className={`flex-1 max-w-3xl ${
                message.role === 'user' ? 'text-right' : 'text-left'
              }`}>
                <div className={`oracle-card p-4 ${
                  message.role === 'user' 
                    ? 'bg-blue-500/10 border-blue-400/20' 
                    : 'bg-yellow-400/5 border-yellow-400/20'
                }`}>
                  <div className="oracle-text whitespace-pre-wrap">
                    {message.content}
                  </div>

                  {/* Citations */}
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-yellow-400/20">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-yellow-400">Sources</span>
                      </div>
                      <div className="space-y-1">
                        {message.citations.map((citation, index) => (
                          <div key={index} className="text-xs oracle-text opacity-70">
                            • {citation}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-xs oracle-text opacity-50">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div className="oracle-card p-4 bg-yellow-400/5 border-yellow-400/20">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                  </div>
                  <span className="oracle-text text-sm">The Oracle consults the wisdom...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="oracle-card mx-4 mb-4 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the Oracle about Alex Hormozi&apos;s business wisdom..."
            className="oracle-input flex-1 px-4 py-3 text-lg resize-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="oracle-button px-6 py-3 disabled:opacity-50 disabled:transform-none disabled:shadow-none flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            <span className="hidden sm:inline">Seek</span>
          </button>
        </form>
        
        <div className="mt-3 text-center">
          <p className="oracle-text text-xs opacity-50">
            Powered by Alex Hormozi&apos;s wisdom through advanced AI • BizInsiderPro Oracle
          </p>
        </div>
      </div>
    </div>
  );
}