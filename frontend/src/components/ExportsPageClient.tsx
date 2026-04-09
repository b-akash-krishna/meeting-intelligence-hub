"use client";

import { FileJson, FileSpreadsheet, FileText } from "lucide-react";

import ChatDrawer from "@/components/ChatDrawer";
import EmptySegmentState from "@/components/EmptySegmentState";
import WorkspaceShell from "@/components/WorkspaceShell";
import { buildMeetingReport } from "@/lib/briefing";
import { useMeetingSession } from "@/lib/meeting-session";

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll(`"`, `""`)}"`).join(","))
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
    if (!session || !report) {
      return;
    }

    const rows: string[][] = [
      ["Section", "Field 1", "Field 2", "Field 3", "Field 4"],
      ["Meeting", "Overall Vibe", session.overallVibe, "Meeting ID", session.meetingId ?? ""],
      ...(report.actionItems.map((item) => ["Action Item", item.assignee, item.task, item.deadline ?? "", `${item.purpose} | ${item.urgency}`])),
      ...(report.decisions.map((item) => ["Decision", item.decision, item.reasoning, item.purpose, ""])),
      ...(session.timeline.map((point) => ["Timeline", point.window_label, `${point.start_time} - ${point.end_time}`, point.vibe, String(point.intensity)])),
      ...(session.speakerSummary.map((speaker) => ["Speaker", speaker.speaker, speaker.dominant_vibe, String(speaker.engagement), String(speaker.sentiment_score)])),
    ];

    downloadCsv("meeting-intelligence-export.csv", rows);
  };

  const handleJsonExport = () => {
    if (!report) {
      return;
    }

    downloadText("meeting-intelligence-report.json", JSON.stringify(report, null, 2), "application/json;charset=utf-8;");
  };

  const handleMarkdownExport = () => {
    if (!report) {
      return;
    }

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
      ...report.timeline.map((point) => `- ${point.window_label}: ${point.vibe} (${point.start_time} to ${point.end_time}, intensity ${point.intensity})`),
      "",
      "## Speaker Summary",
      ...report.speakerSummary.map((speaker) => `- ${speaker.speaker}: ${speaker.dominant_vibe}, engagement ${speaker.engagement}, score ${speaker.sentiment_score}`),
      "",
    ].join("\n");

    downloadText("meeting-intelligence-brief.md", markdown, "text/markdown;charset=utf-8;");
  };

  return (
    <WorkspaceShell
      eyebrow="Download Center"
      title="Exports should feel like the final handoff, not an extra button buried inside a crowded dashboard."
      description="This page groups the deliverables in one place so the user can choose the right format for spreadsheets, integrations, or a briefing note without distraction."
    >
      {!session ? (
        <EmptySegmentState
          title="No briefing available to download yet"
          description="Upload and analyze a transcript on the overview page first. Once a meeting is processed, export-ready files will be available here in CSV, JSON, and markdown formats."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <button onClick={handleCsvExport} className="panel panel-link rounded-[1.75rem] p-6 text-left">
            <div className="metric-badge">
              <FileSpreadsheet className="h-5 w-5 text-[color:var(--accent)]" />
            </div>
            <p className="mt-5 text-2xl font-semibold text-slate-950">Export CSV</p>
            <p className="mt-3 text-sm leading-6 ink-muted">
              Best for spreadsheets, trackers, or operations teams who want meeting insights as rows and columns.
            </p>
          </button>

          <button onClick={handleJsonExport} className="panel panel-link rounded-[1.75rem] p-6 text-left">
            <div className="metric-badge">
              <FileJson className="h-5 w-5 text-[color:var(--accent)]" />
            </div>
            <p className="mt-5 text-2xl font-semibold text-slate-950">Export JSON</p>
            <p className="mt-3 text-sm leading-6 ink-muted">
              Best for structured integrations, automation, and downstream application workflows.
            </p>
          </button>

          <button onClick={handleMarkdownExport} className="panel panel-link rounded-[1.75rem] p-6 text-left">
            <div className="metric-badge">
              <FileText className="h-5 w-5 text-[color:var(--accent)]" />
            </div>
            <p className="mt-5 text-2xl font-semibold text-slate-950">Briefing Note</p>
            <p className="mt-3 text-sm leading-6 ink-muted">
              Best for a polished, readable handoff that summarizes the meeting in a narrative format.
            </p>
          </button>
        </div>
      )}

      <ChatDrawer meetingId={session?.meetingId} />
    </WorkspaceShell>
  );
}
