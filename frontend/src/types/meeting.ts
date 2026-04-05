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

export interface InsightsPayload {
  action_items: ActionItem[];
  decisions: Decision[];
}

export interface UploadResponse {
  meeting_id: string;
  status: string;
  message: string;
  insights: InsightsPayload;
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
