import { useState, useRef, useEffect } from 'react';
import { MapBackground } from '../components/MapBackground';
import { Navbar } from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MessageSquare, Send, Loader2, ArrowLeft, Bot, User, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function AIChatSupport() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "👋 Hi! I'm your AI Support Assistant. I'm here 24/7 to help you with:\n\n• Platform features and how to use them\n• Account and profile questions\n• Load posting and booking process\n• Payment and billing information\n• Rating system\n• Troubleshooting issues\n\nWhat can I help you with today?",
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
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-bd25f179/ai-chat-support`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            message: userMessage.content,
            history: messages.slice(-10), // Send last 10 messages for context
            userId: user?.id
          })
        }
      );

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat support error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or contact our human support team if the issue persists.",
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

  const quickQuestions = [
    "How do I post a load?",
    "How does the rating system work?",
    "What are the payment methods?",
    "How do I verify my FMCSA?",
  ];

  return (
    <div className="min-h-screen bg-background relative">
      <MapBackground />

      <div className="relative z-10">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/ai-tools')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="size-4" />
          Back to AI Tools
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-none bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
              <MessageSquare className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">AI Support Assistant</h1>
              <p className="text-muted-foreground">24/7 instant help for all your questions</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Questions Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start h-auto p-3 text-xs"
                    onClick={() => setInput(question)}
                  >
                    {question}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-[700px] flex flex-col">
              {/* Chat Header */}
              <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-t-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-none backdrop-blur-sm">
                    <Bot className="size-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Support Assistant</CardTitle>
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      Online
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-9 h-9 rounded-none bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-md">
                        <Bot className="size-4 text-white" />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] p-4 rounded-2xl shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-tr-sm'
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
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-none bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-md">
                      <Bot className="size-4 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100 dark:border-gray-700">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input Area */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about Haulius..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-br from-pink-500 to-rose-600 text-white"
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
        </div>
      </div>
      </div>
    </div>
  );
}