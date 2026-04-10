"use client";

import { FileJson, FileSpreadsheet, FileText, Download } from "lucide-react";

import ChatDrawer from "@/components/ChatDrawer";
import EmptySegmentState from "@/components/EmptySegmentState";
import WorkspaceShell from "@/components/WorkspaceShell";
import { buildMeetingReport } from "@/lib/briefing";
import { useMeetingSession } from "@/lib/meeting-session";

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll(`"`, `""`)}`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8;") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const exportCards = [
  {
    key: "csv",
    icon: FileSpreadsheet,
    label: "Export CSV",
    sub: "Spreadsheet",
    description: "Best for trackers, ops teams, and anyone who needs meeting insights as rows and columns.",
    iconColor: "#10b981",
    iconBg: "rgba(16,185,129,0.15)",
    iconBorder: "rgba(16,185,129,0.3)",
    badge: ".csv",
  },
  {
    key: "json",
    icon: FileJson,
    label: "Export JSON",
    sub: "Structured Data",
    description: "Best for integrations, automation pipelines, and downstream application workflows.",
    iconColor: "#6366f1",
    iconBg: "rgba(99,102,241,0.15)",
    iconBorder: "rgba(99,102,241,0.3)",
    badge: ".json",
  },
  {
    key: "md",
    icon: FileText,
    label: "Briefing Note",
    sub: "Markdown",
    description: "A polished, human-readable summary with all insights in narrative format.",
    iconColor: "#a78bfa",
    iconBg: "rgba(167,139,250,0.15)",
    iconBorder: "rgba(167,139,250,0.3)",
    badge: ".md",
  },
];

export default function ExportsPageClient() {
  const { session } = useMeetingSession();

  const report = session
    ? buildMeetingReport({
        meetingId: session.meetingId,
        overallVibe: session.overallVibe,
        actionItems: session.actionItems,
        decisions: session.decisions,
        timeline: session.timeline,
        speakerSummary: session.speakerSummary,
      })
    : null;

  const handleCsvExport = () => {
    if (!session || !report) return;
    const rows: string[][] = [
      ["Section", "Field 1", "Field 2", "Field 3", "Field 4"],
      ["Meeting", "Overall Vibe", session.overallVibe, "Meeting ID", session.meetingId ?? ""],
      ...report.actionItems.map((item) => [
        "Action Item",
        item.assignee,
        item.task,
        item.deadline ?? "",
        `${item.purpose} | ${item.urgency}`,
      ]),
      ...report.decisions.map((item) => ["Decision", item.decision, item.reasoning, item.purpose, ""]),
      ...session.timeline.map((point) => [
        "Timeline",
        point.window_label,
        `${point.start_time} - ${point.end_time}`,
        point.vibe,
        String(point.intensity),
      ]),
      ...session.speakerSummary.map((speaker) => [
        "Speaker",
        speaker.speaker,
        speaker.dominant_vibe,
        String(speaker.engagement),
        String(speaker.sentiment_score),
      ]),
    ];
    downloadCsv("meeting-intelligence-export.csv", rows);
  };

  const handleJsonExport = () => {
    if (!report) return;
    downloadText(
      "meeting-intelligence-report.json",
      JSON.stringify(report, null, 2),
      "application/json;charset=utf-8;"
    );
  };

  const handleMarkdownExport = () => {
    if (!report) return;
    const markdown = [
      "# Meeting Intelligence Brief",
      "",
      `- Meeting ID: ${report.meetingId ?? "N/A"}`,
      `- Overall Vibe: ${report.overallVibe}`,
      "",
      "## Action Items",
      ...report.actionItems.flatMap((item, index) => [
        `### Action ${index + 1}`,
        `- Owner: ${item.assignee}`,
        `- Task: ${item.task}`,
        `- Deadline: ${item.deadline ?? "No explicit deadline"}`,
        `- Urgency: ${item.urgency}`,
        `- Purpose: ${item.purpose}`,
        `- Operational Intent: ${item.operationalIntent}`,
        `- Evidence: ${item.evidence}`,
        "",
      ]),
      "## Decisions",
      ...report.decisions.flatMap((item, index) => [
        `### Decision ${index + 1}`,
        `- Decision: ${item.decision}`,
        `- Purpose: ${item.purpose}`,
        `- Reasoning: ${item.reasoning}`,
        "",
      ]),
      "## Sentiment Timeline",
      ...report.timeline.map(
        (point) =>
          `- ${point.window_label}: ${point.vibe} (${point.start_time} to ${point.end_time}, intensity ${point.intensity})`
      ),
      "",
      "## Speaker Summary",
      ...report.speakerSummary.map(
        (speaker) =>
          `- ${speaker.speaker}: ${speaker.dominant_vibe}, engagement ${speaker.engagement}, score ${speaker.sentiment_score}`
      ),
      "",
    ].join("\n");
    downloadText("meeting-intelligence-brief.md", markdown, "text/markdown;charset=utf-8;");
  };

  const handlers: Record<string, () => void> = {
    csv: handleCsvExport,
    json: handleJsonExport,
    md: handleMarkdownExport,
  };

  return (
    <WorkspaceShell
      eyebrow="Download Center"
      title="Exports should feel like the final handoff, not an extra button buried inside a crowded dashboard."
      description="This page groups all deliverables in one place so you can choose the right format for spreadsheets, integrations, or a briefing note without distraction."
    >
      {!session ? (
        <EmptySegmentState
          title="No briefing available to download yet"
          description="Upload and analyze a transcript on the overview page first. Once a meeting is processed, export-ready files will be available here in CSV, JSON, and markdown formats."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {exportCards.map(({ key, icon: Icon, label, sub, description, iconColor, iconBg, iconBorder, badge }) => (
            <button
              key={key}
              onClick={handlers[key]}
              className="panel panel-link rounded-[1.75rem] p-7 text-left group"
            >
              {/* Icon */}
              <div className="flex items-center justify-between">
                <div
                  className="flex items-center justify-center rounded-xl"
                  style={{
                    width: "3rem",
                    height: "3rem",
                    background: iconBg,
                    border: `1px solid ${iconBorder}`,
                  }}
                >
                  <Icon className="h-6 w-6" style={{ color: iconColor }} />
                </div>
                <Download
                  className="h-4 w-4 transition-transform group-hover:translate-y-0.5"
                  style={{ color: "var(--muted)" }}
                />
              </div>

              {/* Labels */}
              <div className="mt-5">
                <div className="flex items-center gap-2">
                  <p
                    className="text-xl font-bold"
                    style={{
                      fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                      color: "var(--foreground)",
                    }}
                  >
                    {label}
                  </p>
                  <span
                    className="inline-flex rounded-md px-2 py-0.5 text-xs font-bold font-mono"
                    style={{ background: iconBg, color: iconColor, border: `1px solid ${iconBorder}` }}
                  >
                    {badge}
                  </span>
                </div>
                <p className="mt-1 text-sm ink-muted" style={{ color: iconColor, opacity: 0.75 }}>{sub}</p>
              </div>

              <p className="mt-4 text-sm leading-6 ink-muted">{description}</p>
            </button>
          ))}
        </div>
      )}

      <ChatDrawer meetingId={session?.meetingId} />
    </WorkspaceShell>
  );
}
