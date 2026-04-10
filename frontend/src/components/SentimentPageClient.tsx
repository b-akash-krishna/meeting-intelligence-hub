"use client";

import ChatDrawer from "@/components/ChatDrawer";
import EmptySegmentState from "@/components/EmptySegmentState";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useMeetingSession } from "@/lib/meeting-session";

const vibeConfig: Record<string, { bg: string; color: string; border: string; leftBorder: string; progress: string }> = {
  Collaborative: {
    bg: "rgba(16,185,129,0.08)",
    color: "#34d399",
    border: "rgba(16,185,129,0.2)",
    leftBorder: "#10b981",
    progress: "linear-gradient(90deg, #10b981, #34d399)",
  },
  Conflict: {
    bg: "rgba(244,63,94,0.08)",
    color: "#fb7185",
    border: "rgba(244,63,94,0.2)",
    leftBorder: "#f43f5e",
    progress: "linear-gradient(90deg, #f43f5e, #fb7185)",
  },
  Uncertainty: {
    bg: "rgba(245,158,11,0.08)",
    color: "#fbbf24",
    border: "rgba(245,158,11,0.2)",
    leftBorder: "#f59e0b",
    progress: "linear-gradient(90deg, #f59e0b, #fbbf24)",
  },
  Neutral: {
    bg: "rgba(148,163,184,0.08)",
    color: "#94a3b8",
    border: "rgba(148,163,184,0.2)",
    leftBorder: "#64748b",
    progress: "linear-gradient(90deg, #475569, #64748b)",
  },
};

function SpeakerInitials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();

  return (
    <div
      className="flex items-center justify-center rounded-xl text-sm font-bold shrink-0"
      style={{
        width: "2.4rem",
        height: "2.4rem",
        background: "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))",
        border: "1px solid rgba(99,102,241,0.3)",
        color: "#a78bfa",
        fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
      }}
    >
      {initials}
    </div>
  );
}

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
          {/* Timeline Panel */}
          <div className="panel rounded-[1.75rem] p-6">
            <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "1rem", marginBottom: "1.25rem" }}>
              <p className="section-title">Atmosphere Tracking</p>
              <h2
                className="mt-2 text-2xl"
                style={{
                  fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                  fontWeight: 700,
                  color: "var(--foreground)",
                }}
              >
                Sentiment Timeline
              </h2>
              <p className="mt-2 text-sm leading-6 ink-muted">
                Each checkpoint reflects a window in the meeting, helping the user understand where collaboration,
                uncertainty, or conflict intensified.
              </p>
            </div>

            <div className="space-y-4">
              {session.timeline.map((point, i) => {
                const cfg = vibeConfig[point.vibe] ?? vibeConfig.Neutral;
                const barWidth = Math.max(18, Math.min(100, (Math.abs(point.intensity) + point.chunk_count) * 10));

                return (
                  <article
                    key={`${point.window_label}-${point.start_time}`}
                    className="rounded-[1.35rem] p-5 transition-all"
                    style={{
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                      borderLeft: `3px solid ${cfg.leftBorder}`,
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p
                          className="text-base font-semibold"
                          style={{
                            fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                            color: "var(--foreground)",
                          }}
                        >
                          {point.window_label}
                        </p>
                        <p className="mt-1 text-xs ink-muted">
                          {point.start_time} → {point.end_time}
                        </p>
                      </div>
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-bold"
                        style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                      >
                        {point.vibe}
                      </span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div
                      className="mt-4 h-2 w-full overflow-hidden rounded-full"
                      style={{ background: "rgba(255,255,255,0.06)" }}
                    >
                      <div
                        className="h-full rounded-full progress-bar"
                        style={{
                          background: cfg.progress,
                          width: `${barWidth}%`,
                          boxShadow: `0 0 8px ${cfg.leftBorder}60`,
                        }}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs ink-muted">
                      <span>{point.chunk_count} segments</span>
                      <span>intensity {point.intensity > 0 ? `+${point.intensity}` : point.intensity}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Overall Vibe */}
            <div className="panel rounded-[1.75rem] p-6">
              <p className="section-title">Overall Read</p>
              <h2
                className="mt-2 text-2xl"
                style={{
                  fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                  fontWeight: 700,
                  color: "var(--foreground)",
                }}
              >
                Meeting Vibe
              </h2>
              <div className="mt-5">
                {(() => {
                  const cfg = vibeConfig[session.overallVibe] ?? vibeConfig.Neutral;
                  return (
                    <span
                      className="inline-flex rounded-full px-4 py-2 text-sm font-bold"
                      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                    >
                      {session.overallVibe}
                    </span>
                  );
                })()}
              </div>
              <p className="mt-4 text-sm leading-6 ink-muted">
                This top-level signal acts as a quick briefing for whether the meeting felt aligned, tense, uncertain,
                or neutral overall.
              </p>
            </div>

            {/* Speaker Tone */}
            <div className="panel rounded-[1.75rem] p-6">
              <div style={{ borderBottom: "1px solid var(--line)", paddingBottom: "1rem", marginBottom: "1.25rem" }}>
                <p className="section-title">Voice Distribution</p>
                <h2
                  className="mt-2 text-2xl"
                  style={{
                    fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                    fontWeight: 700,
                    color: "var(--foreground)",
                  }}
                >
                  Speaker Tone
                </h2>
              </div>
              <div className="space-y-3">
                {session.speakerSummary.map((speaker) => {
                  const cfg = vibeConfig[speaker.dominant_vibe] ?? vibeConfig.Neutral;
                  return (
                    <article
                      key={speaker.speaker}
                      className="rounded-[1.25rem] p-4"
                      style={{
                        background: "var(--surface-strong)",
                        border: "1px solid var(--line)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <SpeakerInitials name={speaker.speaker} />
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-semibold text-sm truncate"
                            style={{ color: "var(--foreground)" }}
                          >
                            {speaker.speaker}
                          </p>
                          <p className="text-xs ink-muted mt-0.5">
                            {speaker.engagement} segments · score {speaker.sentiment_score > 0 ? `+${speaker.sentiment_score}` : speaker.sentiment_score}
                          </p>
                        </div>
                        <span
                          className="inline-flex rounded-full px-2.5 py-1 text-xs font-bold shrink-0"
                          style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                        >
                          {speaker.dominant_vibe}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <ChatDrawer meetingId={session?.meetingId} />
    </WorkspaceShell>
  );
}
