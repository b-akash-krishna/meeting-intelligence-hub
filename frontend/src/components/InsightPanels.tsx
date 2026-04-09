"use client";

import type { ActionItem, Decision } from "@/types/meeting";

function classifyPurpose(text: string) {
  const normalized = text.toLowerCase();

  if (normalized.includes("fix") || normalized.includes("bug") || normalized.includes("issue")) {
    return {
      label: "Risk Reduction",
      detail: "This update exists to remove delivery risk or stabilize a problem area before the next milestone.",
    };
  }

  if (normalized.includes("update") || normalized.includes("draft") || normalized.includes("send") || normalized.includes("prepare")) {
    return {
      label: "Stakeholder Communication",
      detail: "This update is meant to keep teams aligned, circulate materials, or prepare outward-facing communication.",
    };
  }

  if (normalized.includes("test") || normalized.includes("validate") || normalized.includes("verify") || normalized.includes("check")) {
    return {
      label: "Quality Assurance",
      detail: "This item supports validation, readiness checks, or confidence-building before launch or approval.",
    };
  }

  if (normalized.includes("create") || normalized.includes("implement") || normalized.includes("build")) {
    return {
      label: "Execution",
      detail: "This is a build or implementation task intended to move the workstream forward directly.",
    };
  }

  return {
    label: "Operational Follow-up",
    detail: "This item helps the team maintain momentum and close the loop on a discussion outcome.",
  };
}

function classifyUrgency(deadline: string | null) {
  if (!deadline) {
    return "Routine";
  }

  const normalized = deadline.toLowerCase();
  if (normalized.includes("today") || normalized.includes("1 pm") || normalized.includes("2 pm") || normalized.includes("3 pm")) {
    return "Immediate";
  }
  if (normalized.includes("tomorrow") || normalized.includes("monday")) {
    return "Near-term";
  }
  return "Scheduled";
}

function deriveDecisionPurpose(decision: Decision) {
  const combined = `${decision.decision_text} ${decision.reasoning_context}`.toLowerCase();

  if (combined.includes("launch") || combined.includes("rollout") || combined.includes("release")) {
    return "Release Governance";
  }
  if (combined.includes("copy") || combined.includes("creative") || combined.includes("wording")) {
    return "Messaging Alignment";
  }
  if (combined.includes("timeline") || combined.includes("cutoff") || combined.includes("date")) {
    return "Timeline Control";
  }
  return "Execution Direction";
}

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
        const purpose = classifyPurpose(item.task);
        const urgency = classifyUrgency(item.deadline);

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
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{item.assignee}</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--line)] bg-white/70 p-4 dark:bg-slate-900/40">
                <p className="section-title">Timeline</p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{item.deadline || "No explicit deadline"}</p>
              </div>
              <div className="rounded-2xl border border-[color:var(--line)] bg-white/70 p-4 dark:bg-slate-900/40">
                <p className="section-title">Purpose</p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{purpose.label}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.15fr]">
              <div>
                <p className="section-title">Operational Intent</p>
                <p className="mt-2 text-sm leading-6 ink-muted">{purpose.detail}</p>
              </div>
              <div>
                <p className="section-title">Evidence</p>
                <p className="mt-2 rounded-2xl border border-[color:var(--line)] bg-white/60 px-4 py-3 text-sm italic text-slate-600 dark:bg-slate-900/40 dark:text-slate-300">
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
            <h4 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{item.decision_text}</h4>

            <div className="mt-4 rounded-2xl border border-[color:var(--line)] bg-white/70 p-4 dark:bg-slate-900/40">
              <p className="section-title">Purpose</p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{purpose}</p>
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
