"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ChatDrawer from "@/components/ChatDrawer";
import { Activity, CheckSquare, Target } from "lucide-react";

import type { ActionItem, Decision, UploadResponse } from "@/types/meeting";

interface InsightsState {
  meetingId: string | null;
  actionItems: ActionItem[];
  decisions: Decision[];
}

export default function Home() {
  const [insights, setInsights] = useState<InsightsState | null>(null);

  const handleUploadSuccess = (data: UploadResponse) => {
    setInsights({
      meetingId: data.meeting_id,
      actionItems: data.insights.action_items,
      decisions: data.insights.decisions,
    });
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
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
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
          </div>
        )}
        
        <ChatDrawer meetingId={insights?.meetingId} />
      </main>
    </div>
  );
}
