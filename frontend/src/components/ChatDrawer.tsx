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
          className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 transition shadow-blue-600/30 font-semibold flex items-center"
        >
          <MessageSquare className="w-5 h-5 mr-2" />
          Ask Assistant
        </button>
      )}

      {/* Slide-out Drawer */}
      <div 
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 transition-transform transform duration-300 ease-in-out z-50 flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-blue-600" />
            <h2 className="font-semibold text-slate-800 dark:text-slate-100">Meeting Intelligence Chat</h2>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-red-500 rounded p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 p-4 overflow-y-auto bg-white dark:bg-slate-900 space-y-6">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
              <MessageSquare className="w-10 h-10 opacity-20" />
              <p className="text-center text-sm">Ask questions across your entire history of transcripts!</p>
            </div>
          ) : (
            history.map((msg, idx) => (
              <div key={idx} className={cn("flex space-x-3", msg.role === "human" ? "justify-end" : "justify-start")}>
                
                {msg.role === "ai" && <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>}

                <div className={cn(
                  "px-4 py-3 rounded-2xl max-w-[85%] text-sm shadow-sm",
                  msg.role === "human" ? "bg-blue-600 text-white rounded-br-none" : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700"
                )}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Sources Accordion (optional for UI) */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 text-xs border-t border-slate-300 dark:border-slate-600 pt-2 text-slate-500 dark:text-slate-400">
                      <strong>Cited from {msg.sources.length} chunks.</strong>
                      {msg.sources.map((source, sourceIdx) => (
                        <p key={`${source.citation}-${sourceIdx}`} className="mt-1 line-clamp-2">
                          {source.citation}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === "human" && <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </div>}
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex space-x-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-bl-none flex items-center space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 rounded-xl px-2 py-1 shadow-inner border border-slate-200 dark:border-slate-700">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="e.g. What did Bob block on?"
              className="flex-1 bg-transparent border-none outline-none text-sm px-3 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="p-2 rounded bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
