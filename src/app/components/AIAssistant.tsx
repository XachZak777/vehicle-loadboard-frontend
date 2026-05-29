import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageSquare, X, Send, Loader2, Bot, User, Lock } from 'lucide-react';
import { useAppSelector } from '../store/hooks';
import { useAiChatMutation, useGetAiUsageQuery } from '../store/services/hauliusApi';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

function formatResetTime(resetAt: string): string {
  const date = new Date(resetAt);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  if (diffMs <= 0) return 'soon';
  const h = Math.floor(diffMs / 3_600_000);
  const m = Math.floor((diffMs % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function AIAssistant() {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const user = useAppSelector(state => state.auth.user);
  const [isOpen, setIsOpen] = useState(false);
  const [aiChat] = useAiChatMutation();
  const conversationId = useRef(`conv_${Date.now()}`);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI Load Matching Assistant. I can help you find loads that match your route, equipment, and requirements. Try asking me something like: 'I have a 3-car hauler going from Los Angeles to Dallas, show me available loads.'",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messagesUsed, setMessagesUsed] = useState(0);
  const [resetAt, setResetAt] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: usageData } = useGetAiUsageQuery(undefined, { skip: !isAuthenticated || !isOpen });

  // Sync usage from server on open
  useEffect(() => {
    if (usageData) {
      setMessagesUsed(usageData.messagesUsed);
      setResetAt(usageData.resetAt);
    }
  }, [usageData]);

  // Live countdown tick
  useEffect(() => {
    if (!isOpen) return;
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const LIMIT = usageData?.messagesLimit ?? 3;
  const limitReached = messagesUsed >= LIMIT;
  const remaining = Math.max(0, LIMIT - messagesUsed);

  if (!isAuthenticated) return null;

  const handleSend = async () => {
    if (!input.trim() || isLoading || limitReached) return;

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
      const result = await aiChat({
        message: userMessage.content,
        conversationId: conversationId.current,
        metadata: { timestamp: new Date().toISOString(), userRole: user?.role ?? undefined },
      }).unwrap();

      if (result.success && result.response?.content) {
        setMessages(prev => [...prev, {
          id: result.response!.messageId,
          role: 'assistant',
          content: result.response!.content,
          timestamp: new Date(),
        }]);
        if (result.metadata) {
          setMessagesUsed(result.metadata.messagesUsed);
          setResetAt(result.metadata.resetAt);
        }
      } else if (result.error?.code === 'RATE_LIMIT_EXCEEDED') {
        setMessagesUsed(LIMIT);
        if (result.error.resetAt) setResetAt(result.error.resetAt);
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.error?.message ?? "I'm sorry, something went wrong. Please try again.",
          timestamp: new Date(),
        }]);
      }
    } catch (err: any) {
      const errData = err?.data;
      if (errData?.error?.code === 'RATE_LIMIT_EXCEEDED') {
        setMessagesUsed(LIMIT);
        if (errData.error.resetAt) setResetAt(errData.error.resetAt);
      } else {
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Please try again later.",
          timestamp: new Date(),
        }]);
      }
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
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-amber-500/50 animate-pulse"
        title="Open AI Assistant"
      >
        <MessageSquare className="size-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-[420px] h-[650px] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <Card className="h-full flex flex-col shadow-2xl border-0 overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">

        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-5 flex flex-row items-center justify-between space-y-0 shadow-lg flex-shrink-0">
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

        {limitReached ? (
          /* ── Limit-reached state ── */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-900 dark:to-gray-950">
            <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-4">
              <Lock className="size-8 text-amber-500" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">Daily limit reached</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You've used all {LIMIT} free AI messages for today.
            </p>
            {resetAt && (
              <div className="bg-muted/60 border border-border rounded-lg px-4 py-3 text-sm">
                <p className="text-muted-foreground">Resets in</p>
                <p className="text-lg font-semibold text-foreground mt-0.5">
                  {formatResetTime(resetAt)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  at {new Date(resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Messages area */}
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
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase()}
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
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input area */}
            <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
              {/* Remaining messages indicator */}
              <div className="px-4 pt-2 pb-0">
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: LIMIT }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i < messagesUsed ? 'bg-amber-500' : 'bg-muted'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-muted-foreground ml-1 whitespace-nowrap">
                    {remaining} left today
                  </span>
                </div>
              </div>
              <div className="flex gap-3 p-4">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about loads on your route..."
                  disabled={isLoading}
                  className="flex-1 rounded-none border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent focus-visible:border-amber-500 focus-visible:ring-1 focus-visible:ring-amber-500 focus-visible:ring-offset-0 transition-[border-color,box-shadow] duration-150 ease-in-out px-4 py-3 text-sm"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-none px-5 transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
