"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, CheckSquare, FileText, Target, TrendingUp, Users } from "lucide-react";

import FileUpload from "@/components/FileUpload";
import ChatDrawer from "@/components/ChatDrawer";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useMeetingSession } from "@/lib/meeting-session";

const vibeColor: Record<string, string> = {
  Collaborative: "#16a34a",
  Conflict: "#dc2626",
  Uncertainty: "#d97706",
  Neutral: "var(--muted)",
};

const metricCards = [
  { key: "meetings", label: "Meetings", icon: Activity, color: "var(--accent)" },
  { key: "actions", label: "Actions", icon: CheckSquare, color: "var(--blue)" },
  { key: "decisions", label: "Decisions", icon: Target, color: "#7c3aed" },
  { key: "speakers", label: "Speakers", icon: Users, color: "#d97706" },
];

const navCards = [
  { href: "/actions", label: "Actions", icon: CheckSquare, color: "var(--blue)" },
  { href: "/decisions", label: "Decisions", icon: Target, color: "#7c3aed" },
  { href: "/sentiment", label: "Sentiment", icon: TrendingUp, color: "var(--accent)" },
  { href: "/exports", label: "Exports", icon: FileText, color: "#16a34a" },
];

export default function MeetingOverview() {
  const { session, saveUpload, clearSession } = useMeetingSession();

  const values: Record<string, number> = {
    meetings: session ? 1 : 0,
    actions: session?.actionItems.length ?? 0,
    decisions: session?.decisions.length ?? 0,
    speakers: session?.speakerSummary.length ?? 0,
  };

  // Prevent SSR/client hydration mismatch — session lives in localStorage
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <WorkspaceShell eyebrow="Overview" title="Meeting Intelligence Hub">
      <div className="space-y-5" suppressHydrationWarning>
        {/* Upload Panel */}
        <div className="panel rounded-2xl p-5 sm:p-7">
          <FileUpload onUploadSuccess={saveUpload} />
        </div>

        {/* Stats — only render client-side to avoid hydration mismatch */}
        {mounted && session ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map(({ key, label, icon: Icon, color }) => (
              <div key={key} className="panel rounded-2xl p-4 flex items-center gap-3">
                <div
                  className="flex items-center justify-center rounded-xl shrink-0"
                  style={{ width: "2.5rem", height: "2.5rem", background: `${color}18`, border: `1px solid ${color}35` }}
                >
                  <Icon className="h-4 w-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-xs ink-muted font-medium">{label}</p>
                  <p
                    className="text-2xl font-bold"
                    style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)", letterSpacing: "-0.04em", lineHeight: 1.1 }}
                  >
                    {values[key]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Navigation Cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {navCards.map(({ href, label, icon: Icon, color }) => (
            <Link
              key={href}
              href={href}
              className="panel panel-link rounded-2xl p-4 flex items-center gap-3"
            >
              <div
                className="flex items-center justify-center rounded-xl shrink-0"
                style={{ width: "2.5rem", height: "2.5rem", background: `${color}18`, border: `1px solid ${color}35` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}
                >
                  {label}
                </p>
                <p className="text-xs ink-muted mt-0.5">
                  {mounted && session ? `${values[label.toLowerCase() as keyof typeof values] ?? "→"} items` : "Upload first"}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Session Brief */}
        {mounted && session && (
          <div className="panel rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="section-title mb-0.5">Current Meeting</p>
                <p className="text-sm font-mono" style={{ color: "var(--foreground)" }}>
                  {session.meetingId ?? "Processing…"}
                </p>
              </div>
              <span
                className="inline-flex rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: `${vibeColor[session.overallVibe] ?? vibeColor.Neutral}18`, color: vibeColor[session.overallVibe] ?? vibeColor.Neutral, border: `1px solid ${vibeColor[session.overallVibe] ?? vibeColor.Neutral}35` }}
              >
                {session.overallVibe}
              </span>
            </div>
            <button
              onClick={clearSession}
              className="text-xs font-medium px-3.5 py-1.5 rounded-full transition-all"
              style={{ border: "1px solid var(--line-strong)", color: "var(--muted)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--danger)"; (e.currentTarget as HTMLElement).style.borderColor = "#fca5a5"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--muted)"; (e.currentTarget as HTMLElement).style.borderColor = "var(--line-strong)"; }}
            >
              Clear session
            </button>
          </div>
        )}
      </div>

      <ChatDrawer meetingId={session?.meetingId} />
    </WorkspaceShell>
  );
}
