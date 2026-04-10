"use client";

import type { ActionItem, Decision } from "@/types/meeting";
import { classifyActionPurpose, classifyActionUrgency, deriveDecisionPurpose } from "@/lib/briefing";

const urgencyColor: Record<string, string> = {
  Immediate: "#dc2626",
  "Near-term": "#d97706",
  Scheduled: "var(--blue)",
  Routine: "var(--muted)",
};

export function ActionItemPanel({ items }: { items: ActionItem[] }) {
  if (!items.length) return <p className="mt-4 text-sm ink-muted italic">No action items found in this transcript.</p>;
  return (
    <div className="mt-4 space-y-3">
      {items.map((item, idx) => {
        const purpose = classifyActionPurpose(item.task);
        const urgency = classifyActionUrgency(item.deadline);
        const uc = urgencyColor[urgency] ?? urgencyColor.Routine;
        return (
          <article key={`${item.assignee}-${idx}`} className="rounded-2xl p-4" style={{ background: "var(--background)", border: "1px solid var(--line)", borderLeft: `3px solid ${uc}` }}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-xs font-bold" style={{ color: uc, letterSpacing: "0.05em" }}>#{String(idx + 1).padStart(2, "0")}</p>
                <p className="text-sm font-semibold mt-0.5" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>{item.task}</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0" style={{ background: `${uc}15`, color: uc, border: `1px solid ${uc}35` }}>
                {urgency}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              {[["Owner", item.assignee], ["Deadline", item.deadline || "None"], ["Category", purpose.label]].map(([k, v]) => (
                <div key={k} className="rounded-lg p-2.5" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
                  <p className="ink-muted uppercase tracking-wide text-[0.6rem] font-semibold mb-0.5">{k}</p>
                  <p className="font-semibold" style={{ color: "var(--foreground)" }}>{v}</p>
                </div>
              ))}
            </div>
            <p className="text-xs ink-muted italic rounded-lg px-3 py-2" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>{item.quote}</p>
          </article>
        );
      })}
    </div>
  );
}

export function DecisionPanel({ items }: { items: Decision[] }) {
  if (!items.length) return <p className="mt-4 text-sm ink-muted italic">No decisions identified.</p>;
  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {items.map((item, idx) => {
        const purpose = deriveDecisionPurpose(item);
        return (
          <article key={`${item.decision_text}-${idx}`} className="rounded-2xl p-4" style={{ background: "var(--background)", border: "1px solid var(--line)", borderLeft: "3px solid #7c3aed" }}>
            <p className="text-xs font-bold mb-1.5" style={{ color: "#7c3aed", letterSpacing: "0.05em" }}>#{String(idx + 1).padStart(2, "0")}</p>
            <p className="text-sm font-semibold mb-3" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>{item.decision_text}</p>
            <div className="rounded-lg px-3 py-2 mb-3" style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)" }}>
              <p className="text-xs ink-muted uppercase tracking-wide font-semibold mb-0.5" style={{ fontSize: "0.6rem" }}>Purpose</p>
              <p className="text-xs font-semibold" style={{ color: "#7c3aed" }}>{purpose}</p>
            </div>
            <p className="text-xs ink-muted leading-5">{item.reasoning_context}</p>
          </article>
        );
      })}
    </div>
  );
}
