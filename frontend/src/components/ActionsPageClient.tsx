"use client";

import ChatDrawer from "@/components/ChatDrawer";
import EmptySegmentState from "@/components/EmptySegmentState";
import { ActionItemPanel } from "@/components/InsightPanels";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useMeetingSession } from "@/lib/meeting-session";

export default function ActionsPageClient() {
  const { session } = useMeetingSession();

  return (
    <WorkspaceShell eyebrow="Actions" title="Assigned Action Items">
      {!session ? (
        <EmptySegmentState
          title="No action items to review yet"
          description="Upload a meeting on the overview page first. Once the transcript is processed, every extracted action item will appear here with ownership, operational purpose, evidence, and urgency."
        />
      ) : (
        <div className="panel rounded-2xl p-5">
          <p className="section-title mb-1">Execution Ledger</p>
          <h2 className="text-lg font-bold mb-0" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)", marginBottom: 0 }}>Assigned Action Items</h2>
          <ActionItemPanel items={session.actionItems} />
        </div>
      )}

      <ChatDrawer meetingId={session?.meetingId} />
    </WorkspaceShell>
  );
}
