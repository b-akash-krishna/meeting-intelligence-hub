export interface ActionItem {
  assignee: string;
  task: string;
  deadline: string | null;
  quote: string;
}

export interface Decision {
  decision_text: string;
  reasoning_context: string;
}

export interface SentimentTimelinePoint {
  window_label: string;
  start_time: string;
  end_time: string;
  vibe: string;
  intensity: number;
  chunk_count: number;
}

export interface SpeakerSentimentSummary {
  speaker: string;
  dominant_vibe: string;
  engagement: number;
  sentiment_score: number;
}

export interface InsightsPayload {
  action_items: ActionItem[];
  decisions: Decision[];
  overall_vibe: string;
  timeline: SentimentTimelinePoint[];
  speaker_summary: SpeakerSentimentSummary[];
}

export interface UploadResponse {
  meeting_id: string;
  status: string;
  message: string;
  insights: InsightsPayload;
}

export interface MeetingSession {
  meetingId: string | null;
  statusMessage: string;
  actionItems: ActionItem[];
  decisions: Decision[];
  overallVibe: string;
  timeline: SentimentTimelinePoint[];
  speakerSummary: SpeakerSentimentSummary[];
}

export interface ChatMessage {
  role: "human" | "ai";
  text: string;
}

export interface ChatSource {
  citation: string;
  text: string;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
}
