import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { MapBackground } from '../components/MapBackground';
import { Navbar } from '../components/Navbar';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MessageSquare, Send, Loader2, ArrowLeft, Bot, User } from 'lucide-react';
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

function formatInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

function renderContent(text: string): ReactNode {
  const paragraphs = text.split(/\n\n+/);
  return (
    <div className="space-y-1">
      {paragraphs.map((para, pi) => {
        const lines = para.split('\n').filter(l => l.trim());
        const isList = lines.length > 1 && lines.every(l => /^[•\-\*]\s/.test(l.trim()));

        if (isList) {
          return (
            <ul key={pi} className="space-y-0.5 pl-1">
              {lines.map((line, li) => (
                <li key={li} className="flex items-start gap-1.5">
                  <span className="mt-[5px] size-1.5 rounded-full bg-current flex-shrink-0 opacity-50" />
                  <span>{formatInline(line.replace(/^[•\-\*]\s/, ''))}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (lines.length === 1 && /^[•\-\*]\s/.test(lines[0].trim())) {
          return (
            <div key={pi} className="flex items-start gap-1.5">
              <span className="mt-[5px] size-1.5 rounded-full bg-current flex-shrink-0 opacity-50" />
              <span>{formatInline(lines[0].replace(/^[•\-\*]\s/, ''))}</span>
            </div>
          );
        }

        return (
          <p key={pi}>
            {lines.map((line, li) => (
              <span key={li}>
                {li > 0 && <br />}
                {formatInline(line)}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
            history: messages.slice(-10),
            userId: user?.id
          })
        }
      );

      if (!response.ok) throw new Error('Failed to get response');
      const data = await response.json();
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again in a moment.",
        timestamp: new Date()
      }]);
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
    /* text-[13px] scopes all rem-relative sizes down only within this page */
    <div className="bg-background map-background-detailed text-[13px]">
      <MapBackground />

      {/* Navbar — sticky, h-16 (64px) */}
      <div className="relative z-10">
        <Navbar />
      </div>

      {/*
        Fixed panel that fills exactly from below the navbar (top-16 = 64px)
        to the bottom of the viewport. No viewport unit math needed.
      */}
      <div className="fixed inset-x-0 bottom-0 top-16 z-10 flex flex-col bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col flex-1 min-h-0 px-2 sm:px-4 pt-2 pb-2 mx-auto w-full max-w-4xl">

          {/* Minimal header */}
          <div className="flex items-center gap-2 mb-1.5 flex-shrink-0">
            <Button
              variant="ghost"
              onClick={() => navigate('/ai-tools')}
              className="gap-1 text-xs px-1.5 h-6 flex-shrink-0"
            >
              <ArrowLeft className="size-3" />
              <span className="hidden sm:inline text-xs">Back</span>
            </Button>
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="p-0.5 rounded-none bg-gradient-to-br from-orange-500 to-amber-600 flex-shrink-0">
                <MessageSquare className="size-3 text-white" />
              </div>
              <span className="text-xs sm:text-base font-bold truncate">AI Support</span>
            </div>
          </div>

          {/* Main row: sidebar (desktop) + chat */}
          <div className="flex gap-3 flex-1 min-h-0">

            {/* Sidebar — desktop only */}
            <div className="hidden lg:flex lg:flex-col lg:w-48 flex-shrink-0 gap-1.5">
              <p className="text-xs font-semibold text-muted-foreground px-1">Quick Questions</p>
              {quickQuestions.map((q, i) => (
                <Button key={i} variant="outline" size="sm"
                  className="w-full text-left justify-start h-auto py-1.5 px-2.5 text-xs leading-snug"
                  onClick={() => setInput(q)}>
                  {q}
                </Button>
              ))}
            </div>

            {/* Chat card — fills all remaining height */}
            <Card className="flex flex-col flex-1 min-h-0 gap-0 overflow-hidden">

              {/* Chat header */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-pink-500 to-rose-600 text-white flex-shrink-0">
                <div className="p-0.5 bg-white/20 rounded-none">
                  <Bot className="size-3" />
                </div>
                <p className="text-xs font-semibold">Support Assistant</p>
                <div className="flex items-center gap-1 ml-auto text-[10px] text-white/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Online
                </div>
              </div>

              {/* Messages — fills remaining card height, scrolls internally */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 min-h-0">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex gap-1 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-none bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mt-0.5">
                        <Bot className="size-2.5 text-white" />
                      </div>
                    )}
                    <div className={`max-w-[86%] px-2 py-1 rounded-lg text-xs leading-snug ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-tr-sm'
                        : 'bg-muted text-foreground rounded-tl-sm'
                    }`}>
                      {renderContent(message.content)}
                      <p className={`text-[9px] mt-0.5 ${message.role === 'user' ? 'text-white/60' : 'text-muted-foreground'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.role === 'user' && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-none bg-gray-600 flex items-center justify-center mt-0.5">
                        <User className="size-2.5 text-white" />
                      </div>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-1">
                    <div className="flex-shrink-0 w-5 h-5 rounded-none bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mt-0.5">
                      <Bot className="size-2.5 text-white" />
                    </div>
                    <div className="bg-muted px-2 py-1 rounded-lg rounded-tl-sm">
                      <div className="flex gap-0.5 items-center h-3">
                        <div className="w-1 h-1 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-1 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-1 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick chips — mobile only */}
              <div className="lg:hidden flex gap-1 overflow-x-auto px-2 py-1 border-t border-border flex-shrink-0">
                {quickQuestions.map((q, i) => (
                  <button key={i} onClick={() => setInput(q)}
                    className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full border border-pink-300 dark:border-pink-800 text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/30 whitespace-nowrap">
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="px-2 py-1.5 border-t border-border flex-shrink-0">
                <div className="flex gap-1.5">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything..."
                    disabled={isLoading}
                    className="flex-1 text-xs h-7"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="bg-gradient-to-br from-pink-500 to-rose-600 text-white h-7 w-7 p-0 flex-shrink-0"
                  >
                    {isLoading ? <Loader2 className="size-3 animate-spin" /> : <Send className="size-3" />}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
