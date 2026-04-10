"use client";

import { useState } from "react";
import { MessageSquare, Send, X, Bot, User } from "lucide-react";

import type { ChatMessage, ChatResponse, ChatSource } from "@/types/meeting";

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

    const userQuery = query;
    setHistory((prev) => [...prev, { role: "human", text: userQuery }]);
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
        }),
      });

      const data: ChatResponse = await response.json();
      setHistory((prev) => [
        ...prev,
        {
          role: "ai",
          text: data.answer || "Sorry, I encountered an error.",
          sources: data.sources,
        },
      ]);
    } catch {
      setHistory((prev) => [
        ...prev,
        { role: "ai", text: "Network Error: Could not reach the Chat API." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Floating Action Button ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 chat-fab-glow flex items-center gap-2.5 rounded-full px-5 py-3.5 text-sm font-semibold tracking-wide text-white transition-all hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            zIndex: 50,
          }}
        >
          <MessageSquare className="h-4 w-4" />
          Ask Assistant
        </button>
      )}

      {/* ── Backdrop ── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ── Slide-out Drawer ── */}
      <div
        className="fixed top-0 right-0 z-50 flex h-full w-full flex-col sm:w-[30rem]"
        style={{
          background: "rgba(10,10,22,0.95)",
          borderLeft: "1px solid var(--line)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.6)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            borderBottom: "1px solid var(--line)",
            background: "rgba(99,102,241,0.06)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center rounded-xl"
              style={{
                width: "2.4rem",
                height: "2.4rem",
                background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))",
                border: "1px solid rgba(99,102,241,0.35)",
              }}
            >
              <Bot className="h-5 w-5" style={{ color: "#a78bfa" }} />
            </div>
            <div>
              <p className="section-title" style={{ marginBottom: "2px" }}>Conversation Layer</p>
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Meeting Intelligence Chat
              </h2>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 transition-all"
            style={{ border: "1px solid var(--line)", color: "var(--muted)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(244,63,94,0.4)";
              (e.currentTarget as HTMLElement).style.color = "#fb7185";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
              (e.currentTarget as HTMLElement).style.color = "var(--muted)";
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {history.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <div
                className="flex items-center justify-center rounded-2xl"
                style={{
                  width: "4rem",
                  height: "4rem",
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                <MessageSquare className="h-7 w-7" style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{ color: "var(--foreground)", marginBottom: "6px" }}
                >
                  Ask anything about your meeting
                </p>
                <p className="max-w-xs text-sm ink-muted leading-6">
                  Ask grounded questions and get cited answers with exact timestamps from your transcript.
                </p>
              </div>
            </div>
          ) : (
            history.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "human" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(99,102,241,0.2)",
                      border: "1px solid rgba(99,102,241,0.3)",
                    }}
                  >
                    <Bot className="h-4 w-4" style={{ color: "#a78bfa" }} />
                  </div>
                )}

                <div
                  className="max-w-[85%] rounded-[1.35rem] px-4 py-3 text-sm"
                  style={
                    msg.role === "human"
                      ? {
                          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                          color: "#fff",
                          borderBottomRightRadius: "6px",
                          boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                        }
                      : {
                          background: "var(--surface-strong)",
                          border: "1px solid var(--line)",
                          color: "var(--foreground)",
                          borderBottomLeftRadius: "6px",
                        }
                  }
                >
                  <p className="whitespace-pre-wrap leading-6">{msg.text}</p>

                  {msg.sources && msg.sources.length > 0 && (
                    <div
                      className="mt-3 pt-2 text-xs"
                      style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <p
                        className="font-semibold mb-2"
                        style={{ color: "#a78bfa" }}
                      >
                        📎 {msg.sources.length} cited source{msg.sources.length > 1 ? "s" : ""}
                      </p>
                      {msg.sources.map((source, sourceIdx) => (
                        <p
                          key={`${source.citation}-${sourceIdx}`}
                          className="mt-1 line-clamp-2"
                          style={{ color: "var(--muted)" }}
                        >
                          {source.citation}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {msg.role === "human" && (
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{
                      background: "var(--surface-strong)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <User className="h-4 w-4" style={{ color: "var(--muted)" }} />
                  </div>
                )}
              </div>
            ))
          )}

          {/* Loading dots */}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: "rgba(99,102,241,0.2)",
                  border: "1px solid rgba(99,102,241,0.3)",
                }}
              >
                <Bot className="h-4 w-4" style={{ color: "#a78bfa" }} />
              </div>
              <div
                className="flex items-center gap-2 rounded-[1.35rem] rounded-bl-md px-4 py-3"
                style={{
                  background: "var(--surface-strong)",
                  border: "1px solid var(--line)",
                }}
              >
                <div className="w-2 h-2 rounded-full bg-indigo-400 dot-1" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 dot-2" />
                <div className="w-2 h-2 rounded-full bg-indigo-400 dot-3" />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div
          className="p-4"
          style={{ borderTop: "1px solid var(--line)" }}
        >
          <div
            className="flex items-center gap-2 rounded-2xl px-3 py-2"
            style={{
              background: "var(--surface-strong)",
              border: "1px solid var(--line-strong)",
            }}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="e.g. What were the key blockers?"
              className="flex-1 border-none bg-transparent px-2 py-1.5 text-sm outline-none"
              style={{ color: "var(--foreground)" }}
            />
            <button
              onClick={handleSend}
              disabled={loading || !query.trim()}
              className="flex items-center justify-center rounded-xl p-2.5 transition-all disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff",
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
