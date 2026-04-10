"use client";

import Link from "next/link";
import { Activity, ArrowRight, CheckSquare, FileText, Target, TrendingUp, Users } from "lucide-react";

import FileUpload from "@/components/FileUpload";
import ChatDrawer from "@/components/ChatDrawer";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useMeetingSession } from "@/lib/meeting-session";

const vibeStyles: Record<string, { bg: string; color: string; border: string }> = {
  Collaborative: { bg: "rgba(16,185,129,0.15)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
  Conflict: { bg: "rgba(244,63,94,0.15)", color: "#fb7185", border: "rgba(244,63,94,0.3)" },
  Uncertainty: { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  Neutral: { bg: "rgba(148,163,184,0.12)", color: "#94a3b8", border: "rgba(148,163,184,0.25)" },
};

// Each metric card has its own accent color
const metricCards = [
  {
    key: "meetings",
    label: "Meetings Analyzed",
    icon: Activity,
    iconColor: "#6366f1",
    iconBg: "rgba(99,102,241,0.15)",
    iconBorder: "rgba(99,102,241,0.3)",
  },
  {
    key: "actions",
    label: "Actions",
    icon: CheckSquare,
    iconColor: "#10b981",
    iconBg: "rgba(16,185,129,0.15)",
    iconBorder: "rgba(16,185,129,0.3)",
  },
  {
    key: "decisions",
    label: "Decisions",
    icon: Target,
    iconColor: "#a78bfa",
    iconBg: "rgba(167,139,250,0.15)",
    iconBorder: "rgba(167,139,250,0.3)",
  },
  {
    key: "speakers",
    label: "Speakers",
    icon: Users,
    iconColor: "#f59e0b",
    iconBg: "rgba(245,158,11,0.15)",
    iconBorder: "rgba(245,158,11,0.3)",
  },
];

const destinationCards = [
  {
    href: "/actions",
    label: "Action Center",
    description: "Review ownership, deadlines, and why each assigned update matters.",
    icon: CheckSquare,
    glow: "rgba(16,185,129,0.25)",
    iconColor: "#10b981",
    iconBg: "rgba(16,185,129,0.12)",
    iconBorder: "rgba(16,185,129,0.25)",
  },
  {
    href: "/decisions",
    label: "Decision Register",
    description: "See the commitments, rationale, and operating direction captured from the meeting.",
    icon: Target,
    glow: "rgba(167,139,250,0.25)",
    iconColor: "#a78bfa",
    iconBg: "rgba(167,139,250,0.12)",
    iconBorder: "rgba(167,139,250,0.25)",
  },
  {
    href: "/sentiment",
    label: "Sentiment Brief",
    description: "Track the meeting mood over time and understand speaker tone distribution.",
    icon: TrendingUp,
    glow: "rgba(99,102,241,0.25)",
    iconColor: "#6366f1",
    iconBg: "rgba(99,102,241,0.12)",
    iconBorder: "rgba(99,102,241,0.25)",
  },
  {
    href: "/exports",
    label: "Download Center",
    description: "Export the briefing as CSV, JSON, or a polished markdown summary.",
    icon: FileText,
    glow: "rgba(245,158,11,0.25)",
    iconColor: "#f59e0b",
    iconBg: "rgba(245,158,11,0.12)",
    iconBorder: "rgba(245,158,11,0.25)",
  },
];

export default function MeetingOverview() {
  const { session, saveUpload, clearSession } = useMeetingSession();

  const metricValues: Record<string, number> = {
    meetings: session ? 1 : 0,
    actions: session?.actionItems.length ?? 0,
    decisions: session?.decisions.length ?? 0,
    speakers: session?.speakerSummary.length ?? 0,
  };

  return (
    <WorkspaceShell
      eyebrow="Workspace Overview"
      title="A calmer meeting workspace with one clear path for each kind of insight."
      description="Start with a transcript, then move through actions, decisions, sentiment, and exports as separate reading surfaces. The latest analyzed meeting stays available across pages."
    >
      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="space-y-8">
          {/* Upload Panel */}
          <div className="panel rounded-[1.75rem] p-5 sm:p-8">
            <FileUpload onUploadSuccess={saveUpload} />
          </div>

          {/* Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {metricCards.map(({ key, label, icon: Icon, iconColor, iconBg, iconBorder }) => (
              <div key={key} className="panel rounded-[1.5rem] p-5">
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center rounded-xl"
                    style={{
                      width: "2.75rem",
                      height: "2.75rem",
                      background: iconBg,
                      border: `1px solid ${iconBorder}`,
                      flexShrink: 0,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: iconColor }} />
                  </div>
                  <div>
                    <p className="text-xs ink-muted font-medium">{label}</p>
                    <p
                      className="text-3xl font-bold"
                      style={{
                        fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                        color: "var(--foreground)",
                        letterSpacing: "-0.04em",
                        lineHeight: 1.1,
                      }}
                    >
                      {metricValues[key]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Destination Cards */}
          <div className="grid gap-4 lg:grid-cols-2">
            {destinationCards.map(({ href, label, description, icon: Icon, iconColor, iconBg, iconBorder }) => (
              <Link
                key={href}
                href={href}
                className="panel panel-link rounded-[1.6rem] p-6 block"
                style={{ textDecoration: "none" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div
                      className="flex items-center justify-center rounded-xl"
                      style={{
                        width: "2.75rem",
                        height: "2.75rem",
                        background: iconBg,
                        border: `1px solid ${iconBorder}`,
                      }}
                    >
                      <Icon className="h-5 w-5" style={{ color: iconColor }} />
                    </div>
                    <div>
                      <p
                        className="text-lg font-semibold"
                        style={{
                          fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                          color: "var(--foreground)",
                        }}
                      >
                        {label}
                      </p>
                      <p className="mt-1.5 text-sm leading-6 ink-muted">{description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 mt-1" style={{ color: iconColor }} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar — Current Brief */}
        <aside className="space-y-6">
          <div className="panel rounded-[1.75rem] p-6">
            <p className="section-title">Current Brief</p>
            {session ? (
              <div className="mt-4 space-y-4">
                <div
                  className="rounded-[1.4rem] p-5"
                  style={{
                    background: "var(--surface-strong)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <p className="text-xs ink-muted font-medium uppercase tracking-wider">Meeting ID</p>
                  <p className="mt-2 break-all text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                    {session.meetingId ?? "Pending"}
                  </p>
                  <p className="mt-4 text-xs ink-muted font-medium uppercase tracking-wider">Status</p>
                  <p className="mt-2 text-sm leading-6 ink-muted">{session.statusMessage}</p>
                </div>

                <div
                  className="rounded-[1.4rem] p-5"
                  style={{
                    background: "var(--surface-strong)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <p className="text-xs ink-muted font-medium uppercase tracking-wider">Overall Vibe</p>
                  <div className="mt-3">
                    {(() => {
                      const vs = vibeStyles[session.overallVibe] ?? vibeStyles.Neutral;
                      return (
                        <span
                          className="inline-flex rounded-full px-3 py-1.5 text-sm font-semibold"
                          style={{ background: vs.bg, color: vs.color, border: `1px solid ${vs.border}` }}
                        >
                          {session.overallVibe}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="mt-4 text-xs ink-muted font-medium uppercase tracking-wider">Summary</p>
                  <p className="mt-2 text-sm leading-6 ink-muted">
                    {session.actionItems.length} action items, {session.decisions.length} decisions, and{" "}
                    {session.timeline.length} sentiment checkpoints ready to review.
                  </p>
                </div>

                <button
                  onClick={clearSession}
                  className="inline-flex items-center justify-center w-full rounded-full px-5 py-2.5 text-sm font-medium transition-all"
                  style={{
                    background: "var(--surface-strong)",
                    border: "1px solid var(--line-strong)",
                    color: "var(--muted)",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(244,63,94,0.4)";
                    (e.currentTarget as HTMLElement).style.color = "#fb7185";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--line-strong)";
                    (e.currentTarget as HTMLElement).style.color = "var(--muted)";
                  }}
                >
                  Clear current meeting
                </button>
              </div>
            ) : (
              <div
                className="mt-4 rounded-[1.4rem] p-5"
                style={{
                  background: "var(--surface-strong)",
                  border: "1px dashed var(--line-strong)",
                }}
              >
                <p className="text-sm leading-6 ink-muted">
                  Upload a transcript to unlock the segmented workspace. Once a meeting is processed, each page will
                  focus on one kind of output instead of showing everything at once.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>

      <ChatDrawer meetingId={session?.meetingId} />
    </WorkspaceShell>
  );
}
