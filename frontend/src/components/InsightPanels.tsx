"use client";

import type { ActionItem, Decision } from "@/types/meeting";
import { classifyActionPurpose, classifyActionUrgency, deriveDecisionPurpose } from "@/lib/briefing";

const urgencyStyles: Record<string, string> = {
  Immediate: "bg-rose-100 text-rose-800 border border-rose-200",
  "Near-term": "bg-amber-100 text-amber-800 border border-amber-200",
  Scheduled: "bg-blue-100 text-blue-800 border border-blue-200",
  Routine: "bg-stone-100 text-stone-700 border border-stone-200",
};

export function ActionItemPanel({ items }: { items: ActionItem[] }) {
  if (items.length === 0) {
    return <p className="mt-5 text-sm ink-muted italic">No action items were assigned in this transcript.</p>;
  }

  return (
    <div className="mt-5 grid gap-4">
      {items.map((item, idx) => {
        const purpose = classifyActionPurpose(item.task);
        const urgency = classifyActionUrgency(item.deadline);

        return (
          <article key={`${item.assignee}-${idx}`} className="panel-strong rounded-[1.35rem] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-title">Action Update {String(idx + 1).padStart(2, "0")}</p>
                <h4 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{item.task}</h4>
              </div>
              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${urgencyStyles[urgency]}`}>
                {urgency}
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-[color:var(--line)] bg-white/70 p-4 dark:bg-slate-900/40">
                <p className="section-title">Owner</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{item.assignee}</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--line)] bg-white/70 p-4 dark:bg-slate-900/40">
                <p className="section-title">Timeline</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{item.deadline || "No explicit deadline"}</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--line)] bg-white/70 p-4 dark:bg-slate-900/40">
                <p className="section-title">Purpose</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{purpose.label}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.15fr]">
              <div>
                <p className="section-title">Operational Intent</p>
                <p className="mt-2 text-sm leading-6 ink-muted">{purpose.detail}</p>
              </div>
              <div>
                <p className="section-title">Evidence</p>
                <p className="mt-2 rounded-2xl border border-[color:var(--line)] bg-white/65 px-4 py-3 text-sm italic text-slate-600">
                  {item.quote}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function DecisionPanel({ items }: { items: Decision[] }) {
  if (items.length === 0) {
    return <p className="mt-5 text-sm ink-muted italic">No final decisions were identified.</p>;
  }

  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      {items.map((item, idx) => {
        const purpose = deriveDecisionPurpose(item);

        return (
          <article key={`${item.decision_text}-${idx}`} className="panel-strong rounded-[1.35rem] p-5">
            <p className="section-title">Decision Note {String(idx + 1).padStart(2, "0")}</p>
            <h4 className="mt-2 text-xl font-semibold text-slate-900">{item.decision_text}</h4>

            <div className="mt-4 rounded-2xl border border-[color:var(--line)] bg-white/70 p-4 dark:bg-slate-900/40">
              <p className="section-title">Purpose</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{purpose}</p>
            </div>

            <div className="mt-4">
              <p className="section-title">Reasoning Context</p>
              <p className="mt-2 text-sm leading-6 ink-muted">{item.reasoning_context}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
