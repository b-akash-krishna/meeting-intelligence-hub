"use client";

import { useState } from "react";
import { MessageSquare, Send, X, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage, ChatResponse, ChatSource } from "@/types/meeting";

interface DrawerMessage extends ChatMessage { sources?: ChatSource[]; }

export default function ChatDrawer({ meetingId = null }: { meetingId?: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<DrawerMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    const userQuery = query;
    setHistory(p => [...p, { role: "human", text: userQuery }]);
    setQuery("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/v1/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userQuery, meeting_id: meetingId, history: history.map(({ role, text }) => ({ role, text })) }),
      });
      const data: ChatResponse = await res.json();
      setHistory(p => [...p, { role: "ai", text: data.answer || "I couldn't find an answer.", sources: data.sources }]);
    } catch {
      setHistory(p => [...p, { role: "ai", text: "Network error — is the backend running?" }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {/* FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 chat-fab-glow flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105"
          style={{ background: "var(--accent)", zIndex: 50 }}
        >
          <MessageSquare className="h-4 w-4" />
          Ask AI
        </button>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" style={{ background: "rgba(62,44,35,0.2)", backdropFilter: "blur(3px)" }} onClick={() => setIsOpen(false)} />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 z-50 flex h-full w-full flex-col sm:w-[28rem]"
        style={{
          background: "var(--surface-strong)",
          borderLeft: "1px solid var(--line)",
          boxShadow: "-8px 0 32px rgba(62,44,35,0.12)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.28s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom: "1px solid var(--line)" }}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-lg" style={{ width: "2rem", height: "2rem", background: "var(--accent-soft)", border: "1px solid var(--accent-soft-line)" }}>
              <Bot className="h-4 w-4" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>Meeting AI</p>
              <p className="text-xs ink-muted">Ask anything about your transcript</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="rounded-full p-1.5 transition" style={{ color: "var(--muted)" }} onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--danger)"} onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--muted)"}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center gap-3 py-12">
              <div className="flex items-center justify-center rounded-xl" style={{ width: "3rem", height: "3rem", background: "var(--accent-soft)", border: "1px solid var(--accent-soft-line)" }}>
                <MessageSquare className="h-5 w-5" style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>No messages yet</p>
                <p className="text-xs ink-muted mt-1">Ask a question about your uploaded meeting</p>
              </div>
            </div>
          ) : (
            history.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === "human" ? "justify-end" : "justify-start"}`}>
                {msg.role === "ai" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-soft-line)" }}>
                    <Bot className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
                  </div>
                )}
                <div
                  className="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-6"
                  style={
                    msg.role === "human"
                      ? { background: "var(--accent)", color: "#fff", borderBottomRightRadius: "4px" }
                      : { background: "var(--background)", border: "1px solid var(--line)", color: "var(--foreground)", borderBottomLeftRadius: "4px" }
                  }
                >
                  <div className="markdown-prose text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                  </div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 text-xs" style={{ borderTop: msg.role === "human" ? "1px solid rgba(255,255,255,0.3)" : "1px solid var(--line)" }}>
                      <p className="font-semibold mb-1" style={{ color: msg.role === "human" ? "rgba(255,255,255,0.85)" : "var(--accent)" }}>
                        {msg.sources.length} source{msg.sources.length > 1 ? "s" : ""}
                      </p>
                      {msg.sources.map((s, i) => <p key={i} className="line-clamp-1 ink-muted">{s.citation}</p>)}
                    </div>
                  )}
                </div>
                {msg.role === "human" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--background)", border: "1px solid var(--line)" }}>
                    <User className="h-3.5 w-3.5 ink-muted" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-2 justify-start">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--accent-soft)", border: "1px solid var(--accent-soft-line)" }}>
                <Bot className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
              </div>
              <div className="flex items-center gap-1.5 rounded-2xl rounded-bl px-3.5 py-2.5" style={{ background: "var(--background)", border: "1px solid var(--line)" }}>
                <div className="w-1.5 h-1.5 rounded-full dot-1" style={{ background: "var(--accent)" }} />
                <div className="w-1.5 h-1.5 rounded-full dot-2" style={{ background: "var(--accent)" }} />
                <div className="w-1.5 h-1.5 rounded-full dot-3" style={{ background: "var(--accent)" }} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3.5" style={{ borderTop: "1px solid var(--line)" }}>
          <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "var(--background)", border: "1px solid var(--line-strong)" }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSend()}
              placeholder="What were the key decisions?"
              className="flex-1 border-none bg-transparent text-sm outline-none"
              style={{ color: "var(--foreground)" }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="flex items-center justify-center rounded-lg p-2 transition disabled:opacity-40"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
