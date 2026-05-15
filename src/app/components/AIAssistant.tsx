import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageSquare, X, Send, Loader2, Bot, User } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIAssistant() {
  // Get user from localStorage since this component is outside AuthProvider
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI Load Matching Assistant. I can help you find loads that match your route, equipment, and requirements. Try asking me something like: 'I have a 3-car hauler going from Los Angeles to Dallas, show me available loads.'",
      timestamp: new Date()
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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get all loads from localStorage
      const allLoads = JSON.parse(localStorage.getItem('posted_loads') || '[]');

      // Call Supabase Edge Function
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd25f179/ai-match-loads`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            query: userMessage.content,
            loads: allLoads,
            userId: user?.id
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please make sure your Anthropic API key is configured in Supabase settings, or try again later.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-amber-500/50 animate-pulse"
        title="Open AI Assistant"
      >
        <MessageSquare className="size-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] h-[650px] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <Card className="h-full flex flex-col shadow-2xl border-0 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        {/* Header with gradient */}
        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-5 flex flex-row items-center justify-between space-y-0 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-none backdrop-blur-sm">
              <Bot className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">AI Load Assistant</CardTitle>
              <p className="text-xs text-white/80">Powered by Claude AI</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 p-2 h-auto rounded-none transition-all"
          >
            <X className="size-5" />
          </Button>
        </CardHeader>

        {/* Messages area with custom scrollbar */}
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900 dark:to-gray-950 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-transparent">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {message.role === 'assistant' && (
                <div className="flex-shrink-0 w-9 h-9 rounded-none bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                  <Bot className="size-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] p-4 rounded-2xl shadow-sm transition-all hover:shadow-md ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-tr-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-white/70' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="flex-shrink-0 w-9 h-9 rounded-none bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-md">
                  <User className="size-4 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 animate-in fade-in duration-300">
              <div className="flex-shrink-0 w-9 h-9 rounded-none bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                <Bot className="size-4 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input area with modern styling */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
          <div className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about loads on your route..."
              disabled={isLoading}
              className="flex-1 rounded-none border-gray-200 dark:border-gray-700 focus:border-amber-500 focus:ring-amber-500 px-4 py-3 text-sm"
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-none px-5 transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Send className="size-5" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
