"use client";

import ChatDrawer from "@/components/ChatDrawer";
import EmptySegmentState from "@/components/EmptySegmentState";
import { DecisionPanel } from "@/components/InsightPanels";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useMeetingSession } from "@/lib/meeting-session";

export default function DecisionsPageClient() {
  const { session } = useMeetingSession();

  return (
    <WorkspaceShell
      eyebrow="Decision Register"
      title="Key decisions deserve a focused page where the direction and rationale are easy to absorb."
      description="This register keeps final calls separate from operational tasks so users can understand what the team decided before diving into execution details."
    >
      {!session ? (
        <EmptySegmentState
          title="No decisions to review yet"
          description="Upload a transcript on the overview page to populate this register. Once available, decisions will appear here with a concise purpose and the context that justified the call."
        />
      ) : (
        <div className="panel rounded-[1.75rem] p-6">
          <div className="border-b border-[color:var(--line)] pb-4">
            <p className="section-title">Decision Register</p>
            <h2 className="mt-2 text-2xl font-semibold" style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)", fontWeight: 700, color: "var(--foreground)" }}>Business Decisions</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 ink-muted">
              Decisions are organized here as a readable operating log, with explicit purpose tags and supporting reasoning so the outcome can be understood without scanning the entire meeting transcript.
            </p>
          </div>
          <DecisionPanel items={session.decisions} />
        </div>
      )}

      <ChatDrawer meetingId={session?.meetingId} />
    </WorkspaceShell>
  );
}
