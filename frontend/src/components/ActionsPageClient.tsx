"use client";

import ChatDrawer from "@/components/ChatDrawer";
import EmptySegmentState from "@/components/EmptySegmentState";
import { ActionItemPanel } from "@/components/InsightPanels";
import WorkspaceShell from "@/components/WorkspaceShell";
import { useMeetingSession } from "@/lib/meeting-session";

export default function ActionsPageClient() {
  const { session } = useMeetingSession();

  return (
    <WorkspaceShell
      eyebrow="Action Center"
      title="Assigned work is easier to understand when ownership, purpose, and timing stand on their own."
      description="This view isolates follow-through items so the user can read responsibilities without competing decisions, charts, and exports on the same screen."
    >
      {!session ? (
        <EmptySegmentState
          title="No action items to review yet"
          description="Upload a meeting on the overview page first. Once the transcript is processed, every extracted action item will appear here with ownership, operational purpose, evidence, and urgency."
        />
      ) : (
        <div className="panel rounded-[1.75rem] p-6">
          <div className="border-b border-[color:var(--line)] pb-4">
            <p className="section-title">Execution Ledger</p>
            <h2 className="mt-2 text-2xl font-semibold" style={{ fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)", fontWeight: 700, color: "var(--foreground)" }}>Assigned Action Items</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 ink-muted">
              Each update below is framed as a concrete follow-through item so users can quickly understand the owner, the intent behind the request, and what evidence in the transcript supports it.
            </p>
          </div>
          <ActionItemPanel items={session.actionItems} />
        </div>
      )}

      <ChatDrawer meetingId={session?.meetingId} />
    </WorkspaceShell>
  );
}
