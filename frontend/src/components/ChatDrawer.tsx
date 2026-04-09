"use client";

import { useState } from "react";
import { MessageSquare, Send, X, Bot, User } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { ChatMessage, ChatResponse, ChatSource } from "@/types/meeting";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DrawerMessage extends ChatMessage {
  sources?: ChatSource[];
}

interface ChatDrawerProps {
  meetingId?: string | null;
}

export default function ChatDrawer({ meetingId = null }: ChatDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<DrawerMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    
    // Optimistic UI
    const userQuery = query;
    setHistory(prev => [...prev, { role: "human", text: userQuery }]);
    setQuery("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/v1/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: userQuery,
          meeting_id: meetingId,
          history: history.map(({ role, text }) => ({ role, text })),
        })
      });
      
      const data: ChatResponse = await response.json();
      setHistory(prev => [...prev, { 
        role: "ai", 
        text: data.answer || "Sorry, I encountered an error.", 
        sources: data.sources 
      }]);
    } catch {
      setHistory(prev => [...prev, { role: "ai", text: "Network Error: Could not reach the Chat API." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 flex items-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold tracking-[0.08em] uppercase text-white shadow-xl shadow-slate-900/20 transition hover:opacity-90"
        >
          <MessageSquare className="h-4 w-4" />
          Ask Assistant
        </button>
      )}

      {/* Slide-out Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 z-50 flex h-full w-full transform flex-col border-l border-[color:var(--line)] bg-[color:var(--surface-strong)] shadow-2xl transition-transform duration-300 ease-in-out sm:w-[28rem]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[color:var(--line)] bg-[color:var(--surface)] px-5 py-4">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-[color:var(--accent)]" />
            <div>
              <p className="section-title">Conversation Layer</p>
              <h2 className="font-semibold text-slate-800 dark:text-slate-100">Meeting Intelligence Chat</h2>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="rounded-full border border-[color:var(--line)] p-2 text-slate-500 hover:text-red-500">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 space-y-6 overflow-y-auto bg-transparent p-5">
          {history.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-3 text-slate-400">
              <MessageSquare className="h-10 w-10 opacity-20" />
              <p className="max-w-xs text-center text-sm ink-muted">Ask grounded questions across the uploaded meeting context and review the cited evidence beneath each response.</p>
            </div>
          ) : (
            history.map((msg, idx) => (
              <div key={idx} className={cn("flex space-x-3", msg.role === "human" ? "justify-end" : "justify-start")}>
                
                {msg.role === "ai" && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--accent-soft)]">
                  <Bot className="h-4 w-4 text-[color:var(--accent)]" />
                </div>}

                <div className={cn(
                  "max-w-[85%] rounded-[1.35rem] px-4 py-3 text-sm shadow-sm",
                  msg.role === "human"
                    ? "rounded-br-md bg-[color:var(--accent)] text-white"
                    : "rounded-bl-md border border-[color:var(--line)] bg-white/70 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200"
                )}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Sources Accordion (optional for UI) */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 border-t border-[color:var(--line)] pt-2 text-xs ink-muted">
                      <strong>Cited from {msg.sources.length} chunks.</strong>
                      {msg.sources.map((source, sourceIdx) => (
                        <p key={`${source.citation}-${sourceIdx}`} className="mt-1 line-clamp-2">
                          {source.citation}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === "human" && <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-white/70 dark:bg-slate-900/40">
                  <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                </div>}
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex space-x-3 justify-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--accent-soft)]">
                <Bot className="h-4 w-4 text-[color:var(--accent)]" />
              </div>
              <div className="flex items-center space-x-2 rounded-[1.35rem] rounded-bl-md border border-[color:var(--line)] bg-white/70 px-4 py-3 text-slate-500 dark:bg-slate-900/40">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-[color:var(--line)] bg-[color:var(--surface)] p-5">
          <div className="flex items-center space-x-2 rounded-[1.1rem] border border-[color:var(--line)] bg-white/70 px-2 py-1 shadow-inner dark:bg-slate-900/40">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="e.g. What did Bob block on?"
              className="flex-1 border-none bg-transparent px-3 py-2 text-sm text-slate-800 outline-none dark:text-slate-200 placeholder:text-slate-400"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="rounded-full bg-[color:var(--accent)] p-2 text-white transition hover:opacity-90 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
