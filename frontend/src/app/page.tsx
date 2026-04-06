"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ChatDrawer from "@/components/ChatDrawer";
import { Activity, CheckSquare, Download, Target, TrendingUp, Users } from "lucide-react";

import type {
  ActionItem,
  Decision,
  SpeakerSentimentSummary,
  SentimentTimelinePoint,
  UploadResponse,
} from "@/types/meeting";

interface InsightsState {
  meetingId: string | null;
  actionItems: ActionItem[];
  decisions: Decision[];
  overallVibe: string;
  timeline: SentimentTimelinePoint[];
  speakerSummary: SpeakerSentimentSummary[];
}

const vibeStyles: Record<string, string> = {
  Collaborative: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Conflict: "bg-rose-100 text-rose-700 border border-rose-200",
  Uncertainty: "bg-amber-100 text-amber-700 border border-amber-200",
  Neutral: "bg-slate-100 text-slate-700 border border-slate-200",
};

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${String(cell).replaceAll(`"`, `""`)}"`).join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [insights, setInsights] = useState<InsightsState | null>(null);

  const handleUploadSuccess = (data: UploadResponse) => {
    setInsights({
      meetingId: data.meeting_id,
      actionItems: data.insights.action_items,
      decisions: data.insights.decisions,
      overallVibe: data.insights.overall_vibe,
      timeline: data.insights.timeline,
      speakerSummary: data.insights.speaker_summary,
    });
  };

  const handleExport = () => {
    if (!insights) {
      return;
    }

    const rows: string[][] = [
      ["Section", "Field 1", "Field 2", "Field 3", "Field 4"],
      ["Meeting", "Overall Vibe", insights.overallVibe, "Meeting ID", insights.meetingId ?? ""],
      ...insights.actionItems.map((item) => ["Action Item", item.assignee, item.task, item.deadline ?? "", item.quote]),
      ...insights.decisions.map((item) => ["Decision", item.decision_text, item.reasoning_context, "", ""]),
      ...insights.timeline.map((point) => ["Timeline", point.window_label, `${point.start_time} - ${point.end_time}`, point.vibe, String(point.intensity)]),
      ...insights.speakerSummary.map((speaker) => ["Speaker", speaker.speaker, speaker.dominant_vibe, String(speaker.engagement), String(speaker.sentiment_score)]),
    ];

    downloadCsv("meeting-intelligence-export.csv", rows);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Navbar */}
      <nav className="border-b bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center mr-3">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900 dark:text-white">
                Meeting Intelligence Hub
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:text-3xl sm:truncate">
              Intelligence Dashboard
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Upload your raw transcripts (.txt, .vtt) to extract action items and business decisions structurally via GPT-4o-mini.
            </p>
          </div>
          {insights && (
            <button
              onClick={handleExport}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5 mb-8">
          <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0"><Activity className="h-6 w-6 text-slate-400" /></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Meetings Analyzed</dt>
                  <dd className="text-2xl font-semibold text-slate-900 dark:text-white">{insights ? 1 : 0}</dd>
                </dl>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0"><CheckSquare className="h-6 w-6 text-slate-400" /></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Action Items Extracted</dt>
                  <dd className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {insights ? insights.actionItems.length : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0"><Target className="h-6 w-6 text-slate-400" /></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Decisions Logged</dt>
                  <dd className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {insights ? insights.decisions.length : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0"><TrendingUp className="h-6 w-6 text-slate-400" /></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Overall Vibe</dt>
                  <dd className="mt-1">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${vibeStyles[insights?.overallVibe ?? "Neutral"]}`}>
                      {insights?.overallVibe ?? "Neutral"}
                    </span>
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-slate-800 p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0"><Users className="h-6 w-6 text-slate-400" /></div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-slate-500 truncate">Speakers Tracked</dt>
                  <dd className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {insights ? insights.speakerSummary.length : 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Component */}
        <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-slate-800 p-8 mb-8">
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Insights Results rendering tables */}
        {insights && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Action Items */}
            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b pb-2">Assigned Action Items</h3>
              {insights.actionItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assignee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Task</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deadline</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Source Citation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {insights.actionItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{item.assignee}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-300">{item.task}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-semibold">{item.deadline || "Not Specified"}</td>
                          <td className="px-6 py-4 text-xs italic text-slate-400 bg-slate-50 dark:bg-slate-950 rounded p-1">{item.quote}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No action items were assigned in this transcript.</p>
              )}
            </div>

            {/* Decisions */}
            <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b pb-2">Decisions Logged</h3>
              {insights.decisions.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {insights.decisions.map((item, idx) => (
                    <div key={idx} className="p-4 border border-blue-100 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 rounded-lg">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 border-b border-blue-200 dark:border-blue-800 pb-2 mb-2">{item.decision_text}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{item.reasoning_context}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No final decisions were identified.</p>
              )}
            </div>

            <div className="grid gap-8 xl:grid-cols-[1.4fr_1fr]">
              <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b pb-2">Sentiment Timeline</h3>
                <div className="space-y-4">
                  {insights.timeline.map((point) => (
                    <div key={`${point.window_label}-${point.start_time}`} className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{point.window_label}</p>
                          <p className="text-xs text-slate-500">{point.start_time} to {point.end_time}</p>
                        </div>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${vibeStyles[point.vibe] ?? vibeStyles.Neutral}`}>
                          {point.vibe}
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            point.vibe === "Conflict"
                              ? "bg-rose-500"
                              : point.vibe === "Uncertainty"
                                ? "bg-amber-500"
                                : point.vibe === "Collaborative"
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                          }`}
                          style={{ width: `${Math.max(18, Math.min(100, (Math.abs(point.intensity) + point.chunk_count) * 10))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 shadow-sm rounded-lg border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 border-b pb-2">Speaker Tone</h3>
                <div className="space-y-3">
                  {insights.speakerSummary.map((speaker) => (
                    <div key={speaker.speaker} className="rounded-lg border border-slate-200 dark:border-slate-800 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-semibold text-slate-900 dark:text-white">{speaker.speaker}</p>
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${vibeStyles[speaker.dominant_vibe] ?? vibeStyles.Neutral}`}>
                          {speaker.dominant_vibe}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                        <span>{speaker.engagement} chunks</span>
                        <span>score {speaker.sentiment_score}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        <ChatDrawer meetingId={insights?.meetingId} />
      </main>
    </div>
  );
}
