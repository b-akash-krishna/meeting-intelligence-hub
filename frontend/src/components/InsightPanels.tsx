"use client";

import type { ActionItem, Decision } from "@/types/meeting";
import { classifyActionPurpose, classifyActionUrgency, deriveDecisionPurpose } from "@/lib/briefing";

const urgencyConfig: Record<string, { bg: string; color: string; border: string }> = {
  Immediate: { bg: "rgba(244,63,94,0.15)", color: "#fb7185", border: "rgba(244,63,94,0.3)" },
  "Near-term": { bg: "rgba(245,158,11,0.15)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  Scheduled: { bg: "rgba(99,102,241,0.15)", color: "#818cf8", border: "rgba(99,102,241,0.3)" },
  Routine: { bg: "rgba(148,163,184,0.1)", color: "#94a3b8", border: "rgba(148,163,184,0.2)" },
};

export function ActionItemPanel({ items }: { items: ActionItem[] }) {
  if (items.length === 0) {
    return (
      <p className="mt-5 text-sm italic" style={{ color: "var(--muted)" }}>
        No action items were assigned in this transcript.
      </p>
    );
  }

  return (
    <div className="mt-5 grid gap-4">
      {items.map((item, idx) => {
        const purpose = classifyActionPurpose(item.task);
        const urgency = classifyActionUrgency(item.deadline);
        const uc = urgencyConfig[urgency] ?? urgencyConfig.Routine;

        return (
          <article
            key={`${item.assignee}-${idx}`}
            className="rounded-[1.35rem] p-5 transition-all"
            style={{
              background: "var(--surface-strong)",
              border: "1px solid var(--line)",
              borderLeft: "3px solid rgba(99,102,241,0.5)",
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="section-title">Action Update {String(idx + 1).padStart(2, "0")}</p>
                <h4
                  className="mt-2 text-xl"
                  style={{
                    fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                    fontWeight: 700,
                    color: "var(--foreground)",
                  }}
                >
                  {item.task}
                </h4>
              </div>
              <span
                className="inline-flex rounded-full px-3 py-1.5 text-xs font-bold shrink-0"
                style={{ background: uc.bg, color: uc.color, border: `1px solid ${uc.border}` }}
              >
                {urgency}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                { label: "Owner", value: item.assignee },
                { label: "Timeline", value: item.deadline || "No explicit deadline" },
                { label: "Purpose", value: purpose.label },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-2xl p-4"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid var(--line)",
                  }}
                >
                  <p className="section-title text-[0.62rem]">{label}</p>
                  <p
                    className="mt-2 text-sm font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.15fr]">
              <div>
                <p className="section-title">Operational Intent</p>
                <p className="mt-2 text-sm leading-6 ink-muted">{purpose.detail}</p>
              </div>
              <div>
                <p className="section-title">Evidence</p>
                <p
                  className="mt-2 rounded-2xl px-4 py-3 text-sm italic leading-6"
                  style={{
                    background: "rgba(99,102,241,0.06)",
                    border: "1px solid rgba(99,102,241,0.18)",
                    color: "var(--muted)",
                  }}
                >
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
    return (
      <p className="mt-5 text-sm italic" style={{ color: "var(--muted)" }}>
        No final decisions were identified.
      </p>
    );
  }

  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      {items.map((item, idx) => {
        const purpose = deriveDecisionPurpose(item);

        return (
          <article
            key={`${item.decision_text}-${idx}`}
            className="rounded-[1.35rem] p-5"
            style={{
              background: "var(--surface-strong)",
              border: "1px solid var(--line)",
              borderLeft: "3px solid rgba(167,139,250,0.5)",
            }}
          >
            <p className="section-title">Decision Note {String(idx + 1).padStart(2, "00")}</p>
            <h4
              className="mt-2 text-xl"
              style={{
                fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                fontWeight: 700,
                color: "var(--foreground)",
              }}
            >
              {item.decision_text}
            </h4>

            <div
              className="mt-4 rounded-2xl p-4"
              style={{
                background: "rgba(167,139,250,0.07)",
                border: "1px solid rgba(167,139,250,0.2)",
              }}
            >
              <p className="section-title text-[0.62rem]">Purpose</p>
              <p className="mt-2 text-sm font-semibold" style={{ color: "#a78bfa" }}>
                {purpose}
              </p>
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
