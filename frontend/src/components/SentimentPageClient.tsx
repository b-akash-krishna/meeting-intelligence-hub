"use client";

import ChatDrawer from "@/components/ChatDrawer";
import EmptySegmentState from "@/components/EmptySegmentState";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useMeetingSession } from "@/lib/meeting-session";

const vibeConfig: Record<string, { color: string; border: string; progress: string }> = {
  Collaborative: { color: "#16a34a", border: "rgba(22,163,74,0.25)", progress: "#16a34a" },
  Conflict:      { color: "#dc2626", border: "rgba(220,38,38,0.25)", progress: "#dc2626" },
  Uncertainty:   { color: "#d97706", border: "rgba(217,119,6,0.25)",  progress: "#d97706" },
  Neutral:       { color: "var(--muted)", border: "var(--line)", progress: "#94a3b8" },
};

export default function SentimentPageClient() {
  const { session } = useMeetingSession();

  return (
    <WorkspaceShell eyebrow="Sentiment" title="Meeting Tone Analysis">
      {!session ? (
        <EmptySegmentState title="No meeting loaded" description="Upload a transcript on the overview page to see sentiment data." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          {/* Timeline */}
          <div className="panel rounded-2xl p-5">
            <p className="section-title mb-4">Sentiment Timeline</p>
            <div className="space-y-3">
              {session.timeline.map((point) => {
                const cfg = vibeConfig[point.vibe] ?? vibeConfig.Neutral;
                const width = Math.max(12, Math.min(100, (Math.abs(point.intensity) + point.chunk_count) * 10));
                return (
                  <div
                    key={`${point.window_label}-${point.start_time}`}
                    className="rounded-xl p-4"
                    style={{ background: "var(--background)", border: `1px solid ${cfg.border}`, borderLeft: `3px solid ${cfg.color}` }}
                  >
                    <div className="flex items-center justify-between gap-3 mb-2.5">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>{point.window_label}</p>
                        <p className="text-xs ink-muted">{point.start_time} → {point.end_time}</p>
                      </div>
                      <span
                        className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.border}` }}
                      >
                        {point.vibe}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full" style={{ background: "var(--line)" }}>
                      <div className="h-full rounded-full progress-bar" style={{ background: cfg.progress, width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Overall vibe */}
            <div className="panel rounded-2xl p-5">
              <p className="section-title mb-3">Overall Vibe</p>
              {(() => {
                const cfg = vibeConfig[session.overallVibe] ?? vibeConfig.Neutral;
                return (
                  <span className="inline-flex px-3 py-1.5 rounded-full text-sm font-bold" style={{ background: `${cfg.color}15`, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                    {session.overallVibe}
                  </span>
                );
              })()}
            </div>

            {/* Speakers */}
            <div className="panel rounded-2xl p-5">
              <p className="section-title mb-3">Speakers</p>
              <div className="space-y-2">
                {session.speakerSummary.map((sp) => {
                  const cfg = vibeConfig[sp.dominant_vibe] ?? vibeConfig.Neutral;
                  const initials = sp.speaker.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                  return (
                    <div key={sp.speaker} className="flex items-center gap-2.5 rounded-xl p-2.5" style={{ background: "var(--background)", border: "1px solid var(--line)" }}>
                      <div className="flex items-center justify-center rounded-lg text-xs font-bold shrink-0" style={{ width: "2rem", height: "2rem", background: "var(--accent-soft)", color: "var(--accent)", border: "1px solid var(--accent-soft-line)" }}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>{sp.speaker}</p>
                        <p className="text-xs ink-muted">{sp.engagement} segments</p>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${cfg.color}15`, color: cfg.color }}>
                        {sp.dominant_vibe}
                      </span>
                    </div>
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
