"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ChatDrawer from "@/components/ChatDrawer";
import { ActionItemPanel, DecisionPanel } from "@/components/InsightPanels";
import { Activity, CheckSquare, Download, Target, TrendingUp, Users } from "lucide-react";

import type {
  ActionItem,
  Decision,
  SpeakerSentimentSummary,
  SentimentTimelinePoint,
  UploadResponse,
} from "@/types/meeting";

interface InsightsState {
  meetingId: string | null;
  actionItems: ActionItem[];
  decisions: Decision[];
  overallVibe: string;
  timeline: SentimentTimelinePoint[];
  speakerSummary: SpeakerSentimentSummary[];
}

const vibeStyles: Record<string, string> = {
  Collaborative: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  Conflict: "bg-rose-100 text-rose-800 border border-rose-200",
  Uncertainty: "bg-amber-100 text-amber-800 border border-amber-200",
  Neutral: "bg-stone-100 text-stone-700 border border-stone-200",
};

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll(`"`, `""`)}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [insights, setInsights] = useState<InsightsState | null>(null);

  const handleUploadSuccess = (data: UploadResponse) => {
    setInsights({
      meetingId: data.meeting_id,
      actionItems: data.insights.action_items,
      decisions: data.insights.decisions,
      overallVibe: data.insights.overall_vibe,
      timeline: data.insights.timeline,
      speakerSummary: data.insights.speaker_summary,
    });
  };

  const handleExport = () => {
    if (!insights) {
      return;
    }

    const rows: string[][] = [
      ["Section", "Field 1", "Field 2", "Field 3", "Field 4"],
      ["Meeting", "Overall Vibe", insights.overallVibe, "Meeting ID", insights.meetingId ?? ""],
      ...insights.actionItems.map((item) => ["Action Item", item.assignee, item.task, item.deadline ?? "", item.quote]),
      ...insights.decisions.map((item) => ["Decision", item.decision_text, item.reasoning_context, "", ""]),
      ...insights.timeline.map((point) => ["Timeline", point.window_label, `${point.start_time} - ${point.end_time}`, point.vibe, String(point.intensity)]),
      ...insights.speakerSummary.map((speaker) => ["Speaker", speaker.speaker, speaker.dominant_vibe, String(speaker.engagement), String(speaker.sentiment_score)]),
    ];

    downloadCsv("meeting-intelligence-export.csv", rows);
  };

  return (
    <div className="min-h-screen text-slate-900 dark:text-slate-100">
      <nav className="border-b border-[color:var(--line)] bg-[color:var(--surface)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--line)] bg-[color:var(--surface-strong)]">
              <Activity className="h-5 w-5 text-[color:var(--accent)]" />
            </div>
            <div>
              <p className="section-title">Executive Console</p>
              <span className="text-xl font-semibold tracking-[0.02em]">
                Meeting Intelligence Hub
              </span>
            </div>
          </div>
          <div className="hidden rounded-full border border-[color:var(--line)] bg-white/60 px-4 py-2 text-xs tracking-[0.18em] uppercase ink-muted md:block dark:bg-slate-900/40">
            Multi-Meeting Memory
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <section className="panel overflow-hidden rounded-[2rem] px-7 py-8 sm:px-10 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-end">
            <div>
              <p className="section-title">Classic Reporting Surface</p>
              <h1 className="mt-4 max-w-3xl text-4xl leading-tight font-semibold text-slate-900 dark:text-white sm:text-5xl">
                A polished command center for meeting memory, decisions, and follow-through.
              </h1>
              <div className="accent-rule mt-6 w-32" />
              <p className="mt-6 max-w-2xl text-base leading-7 ink-muted">
                Upload noisy transcripts, review structured outcomes, trace sentiment shifts, and ask grounded questions with citations. The interface is designed to read like an executive briefing, not a generic AI sandbox.
              </p>
            </div>
            <div className="panel-strong rounded-[1.5rem] p-6">
              <p className="section-title">Session Focus</p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm ink-muted">Current workflow</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">Upload, inspect, ask, export</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-[color:var(--line)] bg-white/70 p-4 dark:bg-slate-900/40">
                    <p className="ink-muted">Formats</p>
                    <p className="mt-1 font-semibold">TXT / VTT</p>
                  </div>
                  <div className="rounded-2xl border border-[color:var(--line)] bg-white/70 p-4 dark:bg-slate-900/40">
                    <p className="ink-muted">Exports</p>
                    <p className="mt-1 font-semibold">CSV today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-title">Intelligence Dashboard</p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
              Structured review of what happened, what matters, and what comes next.
            </h2>
          </div>
          {insights && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 self-start rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 md:self-auto"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
          <div className="panel rounded-[1.5rem] p-5">
            <div className="flex items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white/70 dark:bg-slate-900/40"><Activity className="h-5 w-5 text-[color:var(--accent)]" /></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium ink-muted truncate">Meetings Analyzed</dt>
                  <dd className="text-3xl font-semibold text-slate-900 dark:text-white">{insights ? 1 : 0}</dd>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="panel rounded-[1.5rem] p-5">
            <div className="flex items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white/70 dark:bg-slate-900/40"><CheckSquare className="h-5 w-5 text-[color:var(--accent)]" /></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium ink-muted truncate">Action Items Extracted</dt>
                  <dd className="text-3xl font-semibold text-slate-900 dark:text-white">
                    {insights ? insights.actionItems.length : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="panel rounded-[1.5rem] p-5">
            <div className="flex items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white/70 dark:bg-slate-900/40"><Target className="h-5 w-5 text-[color:var(--accent)]" /></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium ink-muted truncate">Decisions Logged</dt>
                  <dd className="text-3xl font-semibold text-slate-900 dark:text-white">
                    {insights ? insights.decisions.length : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="panel rounded-[1.5rem] p-5">
            <div className="flex items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white/70 dark:bg-slate-900/40"><TrendingUp className="h-5 w-5 text-[color:var(--accent)]" /></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium ink-muted truncate">Overall Vibe</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${vibeStyles[insights?.overallVibe ?? "Neutral"]}`}>
                      {insights?.overallVibe ?? "Neutral"}
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="panel rounded-[1.5rem] p-5">
            <div className="flex items-center">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[color:var(--line)] bg-white/70 dark:bg-slate-900/40"><Users className="h-5 w-5 text-[color:var(--accent)]" /></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium ink-muted truncate">Speakers Tracked</dt>
                  <dd className="text-3xl font-semibold text-slate-900 dark:text-white">
                    {insights ? insights.speakerSummary.length : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 panel rounded-[2rem] p-5 sm:p-8">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {insights && (
          <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="panel rounded-[1.75rem] p-6">
              <div className="flex items-center justify-between gap-4 border-b border-[color:var(--line)] pb-4">
                <div>
                  <p className="section-title">Execution Ledger</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Assigned Action Items</h3>
                </div>
              </div>
              <ActionItemPanel items={insights.actionItems} />
            </div>

            <div className="panel rounded-[1.75rem] p-6">
              <div className="border-b border-[color:var(--line)] pb-4">
                <p className="section-title">Decision Register</p>
                <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Decisions Logged</h3>
              </div>
              <DecisionPanel items={insights.decisions} />
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
              <div className="panel rounded-[1.75rem] p-6">
                <div className="border-b border-[color:var(--line)] pb-4">
                  <p className="section-title">Atmosphere Tracking</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Sentiment Timeline</h3>
                </div>
                <div className="mt-5 space-y-4">
                  {insights.timeline.map((point) => (
                    <div key={`${point.window_label}-${point.start_time}`} className="panel-strong rounded-[1.25rem] p-4 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{point.window_label}</p>
                          <p className="text-xs ink-muted">{point.start_time} to {point.end_time}</p>
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${vibeStyles[point.vibe] ?? vibeStyles.Neutral}`}>
                          {point.vibe}
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200/80 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            point.vibe === "Conflict"
                              ? "bg-rose-500"
                              : point.vibe === "Uncertainty"
                                ? "bg-amber-500"
                                : point.vibe === "Collaborative"
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                          }`}
                          style={{ width: `${Math.max(18, Math.min(100, (Math.abs(point.intensity) + point.chunk_count) * 10))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel rounded-[1.75rem] p-6">
                <div className="border-b border-[color:var(--line)] pb-4">
                  <p className="section-title">Voice Distribution</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Speaker Tone</h3>
                </div>
                <div className="mt-5 space-y-3">
                  {insights.speakerSummary.map((speaker) => (
                    <div key={speaker.speaker} className="panel-strong rounded-[1.25rem] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900 dark:text-white">{speaker.speaker}</p>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${vibeStyles[speaker.dominant_vibe] ?? vibeStyles.Neutral}`}>
                          {speaker.dominant_vibe}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm ink-muted">
                        <span>{speaker.engagement} chunks</span>
                        <span>score {speaker.sentiment_score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <ChatDrawer meetingId={insights?.meetingId} />
      </main>
    </div>
  );
}
