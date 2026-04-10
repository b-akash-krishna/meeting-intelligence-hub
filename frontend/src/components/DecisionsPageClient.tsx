"use client";

import ChatDrawer from "@/components/ChatDrawer";
import EmptySegmentState from "@/components/EmptySegmentState";
import { DecisionPanel } from "@/components/InsightPanels";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useMeetingSession } from "@/lib/meeting-session";

export default function DecisionsPageClient() {
  const { session } = useMeetingSession();

  return (
    <WorkspaceShell eyebrow="Decisions" title="Decision Register">
      {!session ? (
        <EmptySegmentState
          title="No decisions to review yet"
          description="Upload a transcript on the overview page to populate this register. Once available, decisions will appear here with a concise purpose and the context that justified the call."
        />
      ) : (
        <div className="panel rounded-2xl p-5">
          <p className="section-title mb-1">Decision Register</p>
          <h2 className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)", marginBottom: 0 }}>Business Decisions</h2>
          <DecisionPanel items={session.decisions} />
        </div>
      )}

      <ChatDrawer meetingId={session?.meetingId} />
    </WorkspaceShell>
  );
}
