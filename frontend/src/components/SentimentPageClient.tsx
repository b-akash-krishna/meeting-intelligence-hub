"use client";

import ChatDrawer from "@/components/ChatDrawer";
import EmptySegmentState from "@/components/EmptySegmentState";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useMeetingSession } from "@/lib/meeting-session";

const vibeStyles: Record<string, string> = {
  Collaborative: "bg-emerald-100 text-emerald-900 border border-emerald-200",
  Conflict: "bg-rose-100 text-rose-900 border border-rose-200",
  Uncertainty: "bg-amber-100 text-amber-900 border border-amber-200",
  Neutral: "bg-stone-100 text-stone-700 border border-stone-200",
};

const progressStyles: Record<string, string> = {
  Collaborative: "bg-emerald-500",
  Conflict: "bg-rose-500",
  Uncertainty: "bg-amber-500",
  Neutral: "bg-slate-400",
};

export default function SentimentPageClient() {
  const { session } = useMeetingSession();

  return (
    <WorkspaceShell
      eyebrow="Sentiment Brief"
      title="Tone analysis is more useful when the emotional arc and speaker balance are separated from the rest of the dashboard."
      description="This page focuses on the meeting atmosphere only: the dominant vibe, how it changed across the conversation, and which speakers carried the strongest tone."
    >
      {!session ? (
        <EmptySegmentState
          title="No sentiment briefing yet"
          description="Upload a transcript from the overview page first. Once processed, this page will show the meeting mood over time along with speaker-level tone summaries."
        />
      ) : (
        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.9fr]">
          <div className="panel rounded-[1.75rem] p-6">
            <div className="border-b border-[color:var(--line)] pb-4">
              <p className="section-title">Atmosphere Tracking</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Sentiment Timeline</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 ink-muted">
                Each checkpoint reflects a window in the meeting, helping the user understand where collaboration, uncertainty, or conflict intensified.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {session.timeline.map((point) => (
                <article key={`${point.window_label}-${point.start_time}`} className="panel-strong rounded-[1.35rem] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-semibold text-slate-950">{point.window_label}</p>
                      <p className="mt-1 text-sm ink-muted">{point.start_time} to {point.end_time}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${vibeStyles[point.vibe] ?? vibeStyles.Neutral}`}>
                      {point.vibe}
                    </span>
                  </div>

                  <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-stone-200">
                    <div
                      className={`h-full rounded-full ${progressStyles[point.vibe] ?? progressStyles.Neutral}`}
                      style={{ width: `${Math.max(18, Math.min(100, (Math.abs(point.intensity) + point.chunk_count) * 10))}%` }}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm ink-muted">
                    <span>{point.chunk_count} supporting chunks</span>
                    <span>intensity score {point.intensity}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="panel rounded-[1.75rem] p-6">
              <p className="section-title">Overall Read</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Meeting Vibe</h2>
              <div className="mt-5">
                <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${vibeStyles[session.overallVibe] ?? vibeStyles.Neutral}`}>
                  {session.overallVibe}
                </span>
              </div>
              <p className="mt-4 text-sm leading-6 ink-muted">
                This top-level signal acts as a quick briefing for whether the meeting felt aligned, tense, uncertain, or neutral overall.
              </p>
            </div>

            <div className="panel rounded-[1.75rem] p-6">
              <div className="border-b border-[color:var(--line)] pb-4">
                <p className="section-title">Voice Distribution</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Speaker Tone</h2>
              </div>
              <div className="mt-5 space-y-3">
                {session.speakerSummary.map((speaker) => (
                  <article key={speaker.speaker} className="panel-strong rounded-[1.25rem] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-slate-950">{speaker.speaker}</p>
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${vibeStyles[speaker.dominant_vibe] ?? vibeStyles.Neutral}`}>
                        {speaker.dominant_vibe}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm ink-muted">
                      <span>{speaker.engagement} chunks</span>
                      <span>score {speaker.sentiment_score}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <ChatDrawer meetingId={session?.meetingId} />
    </WorkspaceShell>
  );
}
