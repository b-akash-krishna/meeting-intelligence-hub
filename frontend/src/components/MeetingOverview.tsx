"use client";

import Link from "next/link";
import { Activity, ArrowRight, CheckSquare, FileText, Target, TrendingUp, Users } from "lucide-react";

import FileUpload from "@/components/FileUpload";
import ChatDrawer from "@/components/ChatDrawer";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useMeetingSession } from "@/lib/meeting-session";

const vibeStyles: Record<string, string> = {
  Collaborative: "bg-emerald-100 text-emerald-900 border border-emerald-200",
  Conflict: "bg-rose-100 text-rose-900 border border-rose-200",
  Uncertainty: "bg-amber-100 text-amber-900 border border-amber-200",
  Neutral: "bg-stone-100 text-stone-700 border border-stone-200",
};

const destinationCards = [
  {
    href: "/actions",
    label: "Action Center",
    description: "Review ownership, deadlines, and why each assigned update matters.",
    icon: CheckSquare,
  },
  {
    href: "/decisions",
    label: "Decision Register",
    description: "See the commitments, rationale, and operating direction captured from the meeting.",
    icon: Target,
  },
  {
    href: "/sentiment",
    label: "Sentiment Brief",
    description: "Track the meeting mood over time and understand speaker tone distribution.",
    icon: TrendingUp,
  },
  {
    href: "/exports",
    label: "Download Center",
    description: "Export the briefing as CSV, JSON, or a polished markdown summary.",
    icon: FileText,
  },
];

export default function MeetingOverview() {
  const { session, saveUpload, clearSession } = useMeetingSession();

  return (
    <WorkspaceShell
      eyebrow="Workspace Overview"
      title="A calmer meeting workspace with one clear path for each kind of insight."
      description="Start with a transcript, then move through actions, decisions, sentiment, and exports as separate reading surfaces. The latest analyzed meeting stays available across pages."
    >
      <div className="grid gap-8 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="space-y-8">
          <div className="panel rounded-[1.75rem] p-5 sm:p-8">
            <FileUpload onUploadSuccess={saveUpload} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="panel rounded-[1.5rem] p-5">
              <div className="flex items-center gap-4">
                <div className="metric-badge">
                  <Activity className="h-5 w-5 text-[color:var(--accent)]" />
                </div>
                <div>
                  <p className="text-sm ink-muted">Meetings Analyzed</p>
                  <p className="text-3xl font-semibold text-slate-950">{session ? 1 : 0}</p>
                </div>
              </div>
            </div>

            <div className="panel rounded-[1.5rem] p-5">
              <div className="flex items-center gap-4">
                <div className="metric-badge">
                  <CheckSquare className="h-5 w-5 text-[color:var(--accent)]" />
                </div>
                <div>
                  <p className="text-sm ink-muted">Actions</p>
                  <p className="text-3xl font-semibold text-slate-950">{session?.actionItems.length ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="panel rounded-[1.5rem] p-5">
              <div className="flex items-center gap-4">
                <div className="metric-badge">
                  <Target className="h-5 w-5 text-[color:var(--accent)]" />
                </div>
                <div>
                  <p className="text-sm ink-muted">Decisions</p>
                  <p className="text-3xl font-semibold text-slate-950">{session?.decisions.length ?? 0}</p>
                </div>
              </div>
            </div>

            <div className="panel rounded-[1.5rem] p-5">
              <div className="flex items-center gap-4">
                <div className="metric-badge">
                  <Users className="h-5 w-5 text-[color:var(--accent)]" />
                </div>
                <div>
                  <p className="text-sm ink-muted">Speakers</p>
                  <p className="text-3xl font-semibold text-slate-950">{session?.speakerSummary.length ?? 0}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {destinationCards.map(({ href, label, description, icon: Icon }) => (
              <Link key={href} href={href} className="panel panel-link rounded-[1.6rem] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="metric-badge">
                      <Icon className="h-5 w-5 text-[color:var(--accent)]" />
                    </div>
                    <div>
                      <p className="text-xl font-semibold text-slate-950">{label}</p>
                      <p className="mt-2 text-sm leading-6 ink-muted">{description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-[color:var(--accent)]" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="panel rounded-[1.75rem] p-6">
            <p className="section-title">Current Brief</p>
            {session ? (
              <div className="mt-4 space-y-5">
                <div className="rounded-[1.4rem] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-5">
                  <p className="text-sm ink-muted">Meeting ID</p>
                  <p className="mt-2 break-all text-sm font-semibold text-slate-950">{session.meetingId ?? "Pending"}</p>
                  <p className="mt-4 text-sm ink-muted">Status</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{session.statusMessage}</p>
                </div>

                <div className="rounded-[1.4rem] border border-[color:var(--line)] bg-[color:var(--surface-strong)] p-5">
                  <p className="text-sm ink-muted">Overall vibe</p>
                  <div className="mt-3">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${vibeStyles[session.overallVibe] ?? vibeStyles.Neutral}`}>
                      {session.overallVibe}
                    </span>
                  </div>
                  <p className="mt-4 text-sm ink-muted">Topline</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    {session.actionItems.length} action items, {session.decisions.length} decisions, and {session.timeline.length} sentiment checkpoints are ready to review.
                  </p>
                </div>

                <button
                  onClick={clearSession}
                  className="inline-flex items-center justify-center rounded-full border border-[color:var(--line-strong)] px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[color:var(--accent-soft-line)] hover:text-[color:var(--accent)]"
                >
                  Clear current meeting
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-[1.4rem] border border-dashed border-[color:var(--line-strong)] bg-[color:var(--surface-strong)] p-5">
                <p className="text-sm leading-6 ink-muted">
                  Upload a transcript to unlock the segmented workspace. Once a meeting is processed, each page will focus on one kind of output instead of showing everything at once.
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
