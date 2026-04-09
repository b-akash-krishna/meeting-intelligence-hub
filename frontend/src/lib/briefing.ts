import type { ActionItem, Decision, SpeakerSentimentSummary, SentimentTimelinePoint } from "@/types/meeting";

export function classifyActionPurpose(text: string) {
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

export function classifyActionUrgency(deadline: string | null) {
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

export function deriveDecisionPurpose(decision: Decision) {
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

export function buildMeetingReport(input: {
  meetingId: string | null;
  overallVibe: string;
  actionItems: ActionItem[];
  decisions: Decision[];
  timeline: SentimentTimelinePoint[];
  speakerSummary: SpeakerSentimentSummary[];
}) {
  return {
    meetingId: input.meetingId,
    overallVibe: input.overallVibe,
    actionItems: input.actionItems.map((item) => ({
      assignee: item.assignee,
      task: item.task,
      deadline: item.deadline,
      urgency: classifyActionUrgency(item.deadline),
      purpose: classifyActionPurpose(item.task).label,
      operationalIntent: classifyActionPurpose(item.task).detail,
      evidence: item.quote,
    })),
    decisions: input.decisions.map((item) => ({
      decision: item.decision_text,
      reasoning: item.reasoning_context,
      purpose: deriveDecisionPurpose(item),
    })),
    timeline: input.timeline,
    speakerSummary: input.speakerSummary,
  };
}
