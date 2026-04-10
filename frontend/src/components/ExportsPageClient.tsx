"use client";

import { FileJson, FileSpreadsheet, FileText, Download } from "lucide-react";
import ChatDrawer from "@/components/ChatDrawer";
import EmptySegmentState from "@/components/EmptySegmentState";
import WorkspaceShell from "@/components/WorkspaceShell";
import { buildMeetingReport } from "@/lib/briefing";
import { useMeetingSession } from "@/lib/meeting-session";

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.map(c => `"${String(c).replaceAll(`"`, `""`)}`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}

function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8;") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  Object.assign(document.createElement("a"), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}

const cards = [
  { key: "csv", icon: FileSpreadsheet, label: "CSV", sub: "For spreadsheets & trackers", color: "#16a34a" },
  { key: "json", icon: FileJson,        label: "JSON", sub: "For integrations & APIs",  color: "var(--blue)" },
  { key: "md",  icon: FileText,         label: "Markdown", sub: "Polished briefing note", color: "#7c3aed" },
];

export default function ExportsPageClient() {
  const { session } = useMeetingSession();
  const report = session ? buildMeetingReport({
    meetingId: session.meetingId, overallVibe: session.overallVibe,
    actionItems: session.actionItems, decisions: session.decisions,
    timeline: session.timeline, speakerSummary: session.speakerSummary,
  }) : null;

  const handlers: Record<string, () => void> = {
    csv: () => {
      if (!session || !report) return;
      downloadCsv("meeting-export.csv", [
        ["Section", "Field 1", "Field 2", "Field 3", "Field 4"],
        ["Meeting", "Vibe", session.overallVibe, "ID", session.meetingId ?? ""],
        ...report.actionItems.map(i => ["Action", i.assignee, i.task, i.deadline ?? "", i.urgency]),
        ...report.decisions.map(i => ["Decision", i.decision, i.reasoning, i.purpose, ""]),
        ...session.timeline.map(p => ["Timeline", p.window_label, `${p.start_time}-${p.end_time}`, p.vibe, String(p.intensity)]),
      ]);
    },
    json: () => { if (report) downloadText("meeting-report.json", JSON.stringify(report, null, 2), "application/json;charset=utf-8;"); },
    md: () => {
      if (!report) return;
      const md = [
        "# Meeting Intelligence Brief", "",
        `- Meeting ID: ${report.meetingId ?? "N/A"}`,
        `- Overall Vibe: ${report.overallVibe}`, "",
        "## Action Items",
        ...report.actionItems.flatMap((item, i) => [`### ${i + 1}. ${item.task}`, `- Owner: ${item.assignee}`, `- Deadline: ${item.deadline ?? "None"}`, ""]),
        "## Decisions",
        ...report.decisions.flatMap((item, i) => [`### ${i + 1}. ${item.decision}`, `- Reasoning: ${item.reasoning}`, ""]),
        "## Sentiment", ...report.timeline.map(p => `- ${p.window_label}: ${p.vibe} (${p.start_time}–${p.end_time})`),
      ].join("\n");
      downloadText("meeting-brief.md", md, "text/markdown;charset=utf-8;");
    },
  };

  return (
    <WorkspaceShell eyebrow="Exports" title="Download Meeting Brief">
      {!session ? (
        <EmptySegmentState title="No meeting loaded" description="Upload a transcript on the overview page to enable exports." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map(({ key, icon: Icon, label, sub, color }) => (
            <button key={key} onClick={handlers[key]} className="panel panel-link rounded-2xl p-5 text-left">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center justify-center rounded-xl" style={{ width: "2.5rem", height: "2.5rem", background: `${color}18`, border: `1px solid ${color}35` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <Download className="h-4 w-4 ink-muted" />
              </div>
              <p className="font-bold text-base" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>{label}</p>
              <p className="text-xs ink-muted mt-1">{sub}</p>
            </button>
          ))}
        </div>
      )}
      <ChatDrawer meetingId={session?.meetingId} />
    </WorkspaceShell>
  );
}
