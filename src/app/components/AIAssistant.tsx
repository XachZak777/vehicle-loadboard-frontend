import { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
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

function formatInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <span key={i} className="font-mono">{part.slice(1, -1)}</span>;
    return part;
  });
}

const TABLE_SEP = /^\|[-:\s|]+\|$/;
const TABLE_ROW = /^\|(.+)\|$/;

function parseTableCells(row: string): string[] {
  return row.split('|').map(c => c.trim()).filter(Boolean);
}

function renderContent(text: string): ReactNode {
  const lines = text.split('\n');
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (!trimmed) {
      elements.push(<div key={i} className="h-1" />);
      i++;
      continue;
    }

    // Horizontal divider
    if (/^-{3,}$/.test(trimmed)) {
      elements.push(<hr key={i} className="border-border my-1" />);
      i++;
      continue;
    }

    // Heading (###, ##, #)
    const headingMatch = trimmed.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      elements.push(
        <p key={i} className="font-semibold mt-1.5 mb-0.5">{formatInline(headingMatch[1])}</p>
      );
      i++;
      continue;
    }

    // Blockquote (> text) — render as a subtle note
    if (/^>\s?/.test(trimmed)) {
      const content = trimmed.replace(/^>\s?/, '');
      elements.push(
        <div key={i} className="border-l-2 border-amber-400 pl-2 py-0.5 text-muted-foreground text-[11px]">
          {formatInline(content)}
        </div>
      );
      i++;
      continue;
    }

    // Markdown table — collect all consecutive table lines
    if (TABLE_ROW.test(trimmed)) {
      const tableLines: string[] = [];
      while (i < lines.length && TABLE_ROW.test(lines[i].trim())) {
        tableLines.push(lines[i].trim());
        i++;
      }
      // Filter out separator rows (|---|---|)
      const dataRows = tableLines.filter(l => !TABLE_SEP.test(l));
      if (dataRows.length === 0) continue;

      const firstCells = parseTableCells(dataRows[0]);
      const isKeyValue = firstCells.length === 2;

      if (isKeyValue) {
        // Skip generic header row (e.g. "Detail | Info")
        const headerIsGeneric = /detail|info|field|value|key/i.test(firstCells.join(' '));
        const rows = headerIsGeneric ? dataRows.slice(1) : dataRows;
        elements.push(
          <div key={`tbl-${i}`} className="space-y-0.5 my-1">
            {rows.map((row, ri) => {
              const cells = parseTableCells(row);
              if (cells.length < 2) return null;
              return (
                <div key={ri} className="flex gap-1.5 flex-wrap">
                  <span className="font-semibold flex-shrink-0">{formatInline(cells[0])}:</span>
                  <span>{formatInline(cells[1])}</span>
                </div>
              );
            })}
          </div>
        );
      } else {
        // Multi-column — render rows as lines
        elements.push(
          <div key={`tbl-${i}`} className="space-y-0.5 my-1">
            {dataRows.map((row, ri) => (
              <p key={ri}>{parseTableCells(row).map(formatInline).reduce<ReactNode[]>((a, c, ci) => [...a, ci > 0 ? ' · ' : '', ...c], [])}</p>
            ))}
          </div>
        );
      }
      continue;
    }

    // Bullet list item
    if (/^[-•*]\s/.test(trimmed)) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5 pl-1">
          <span className="mt-[5px] size-1 rounded-full bg-current flex-shrink-0 opacity-60" />
          <span>{formatInline(trimmed.replace(/^[-•*]\s/, ''))}</span>
        </div>
      );
      i++;
      continue;
    }

    // Numbered list item
    const numMatch = trimmed.match(/^(\d+)[.)]\s+(.+)/);
    if (numMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-1.5 pl-1">
          <span className="flex-shrink-0 font-semibold opacity-70">{numMatch[1]}.</span>
          <span>{formatInline(numMatch[2])}</span>
        </div>
      );
      i++;
      continue;
    }

    elements.push(<p key={i}>{formatInline(trimmed)}</p>);
    i++;
  }

  return <div className="space-y-0.5 text-xs leading-snug">{elements}</div>;
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
        className="fixed bottom-6 left-6 z-50 print:hidden bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-amber-500/50 animate-pulse"
        title="Open AI Assistant"
      >
        <MessageSquare className="size-6" />
      </button>
    );
  }

  return (
    /* Mobile: full-width panel anchored to bottom. Desktop: floating 360px widget */
    <div className="fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-auto z-50 print:hidden sm:w-[360px] h-[55vh] sm:h-[500px] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <Card className="h-full flex flex-col shadow-2xl border-0 overflow-hidden rounded-t-xl sm:rounded-xl bg-white dark:bg-gray-900 gap-0">

        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-white/20 rounded-none">
              <Bot className="size-3.5" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">AI Load Assistant</p>
              <p className="text-[10px] text-white/80">Powered by Claude AI</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1">
            <X className="size-4" />
          </button>
        </div>

        {limitReached ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-3">
              <Lock className="size-5 text-amber-500" />
            </div>
            <h3 className="text-sm font-semibold mb-1">Daily limit reached</h3>
            <p className="text-xs text-muted-foreground mb-3">
              You've used all {LIMIT} free AI messages for today.
            </p>
            {resetAt && (
              <div className="bg-muted/60 border border-border rounded-lg px-3 py-2 text-xs">
                <p className="text-muted-foreground">Resets in</p>
                <p className="text-base font-semibold mt-0.5">{formatResetTime(resetAt)}</p>
                <p className="text-muted-foreground mt-1">
                  at {new Date(resetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2 min-h-0">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-1.5 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-none bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mt-0.5">
                      <Bot className="size-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[82%] px-2.5 py-1.5 rounded-xl text-xs leading-snug ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-tr-sm'
                      : 'bg-muted text-foreground rounded-tl-sm'
                  }`}>
                    {message.role === 'user'
                      ? <p className="whitespace-pre-wrap text-xs">{message.content}</p>
                      : renderContent(message.content)}
                    <p className={`text-[9px] mt-1 ${message.role === 'user' ? 'text-white/60' : 'text-muted-foreground'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-6 h-6 rounded-none bg-gray-600 flex items-center justify-center mt-0.5">
                      <User className="size-3 text-white" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-1.5">
                  <div className="flex-shrink-0 w-6 h-6 rounded-none bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mt-0.5">
                    <Bot className="size-3 text-white" />
                  </div>
                  <div className="bg-muted px-2.5 py-1.5 rounded-xl rounded-tl-sm">
                    <div className="flex gap-1 items-center h-3">
                      <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 border-t border-border bg-background">
              <div className="px-2.5 pt-1.5 pb-0 flex items-center gap-1.5">
                {Array.from({ length: LIMIT }).map((_, i) => (
                  <div key={i} className={`h-0.5 flex-1 rounded-full ${i < messagesUsed ? 'bg-amber-500' : 'bg-muted'}`} />
                ))}
                <span className="text-[10px] text-muted-foreground ml-1 whitespace-nowrap">{remaining} left today</span>
              </div>
              <div className="flex gap-1.5 p-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about loads on your route..."
                  disabled={isLoading}
                  className="flex-1 h-8 text-xs"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white h-8 w-8 p-0 flex-shrink-0"
                >
                  {isLoading ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
