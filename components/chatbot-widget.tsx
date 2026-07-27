'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I am your AI Career Advisor. Ask me anything about your resume, ATS optimization, or interview strategies!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  async function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessageText = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessageText,
          history: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'I am happy to assist with any career questions!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I ran into an error. Please try asking again!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-4 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all"
        >
          <Bot className="h-6 w-6" />
          <span className="font-semibold text-sm pr-1 hidden sm:inline">AI Career Assistant</span>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`flex flex-col rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all duration-300 ${
              isExpanded 
                ? 'w-[90vw] sm:w-[540px] h-[75vh]' 
                : 'w-[90vw] sm:w-[380px] h-[520px]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/20 p-2 backdrop-blur-md">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">AI Career Assistant</h3>
                  <p className="text-[11px] text-indigo-100 flex items-center gap-1.5 mt-0.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Always active
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="rounded-lg p-1.5 hover:bg-white/15 text-indigo-100 hover:text-white transition"
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-white/15 text-indigo-100 hover:text-white transition"
                  title="Close Chat"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/50 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-500/10'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-white/5 rounded-bl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 px-1 font-medium">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900/50 px-3.5 py-2.5 rounded-2xl w-fit">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs font-medium">Thinking...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about resume tips, ATS scores..."
                className="flex-1 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 p-2.5 text-white transition shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
