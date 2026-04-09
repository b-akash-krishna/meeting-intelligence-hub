"use client";

import { startTransition, useEffect, useState } from "react";

import type { MeetingSession, UploadResponse } from "@/types/meeting";

const STORAGE_KEY = "meeting-intelligence-session";

function isMeetingSession(value: unknown): value is MeetingSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<MeetingSession>;
  return Array.isArray(candidate.actionItems)
    && Array.isArray(candidate.decisions)
    && Array.isArray(candidate.timeline)
    && Array.isArray(candidate.speakerSummary)
    && typeof candidate.overallVibe === "string";
}

function readStoredSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return isMeetingSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function toMeetingSession(data: UploadResponse): MeetingSession {
  return {
    meetingId: data.meeting_id,
    statusMessage: data.message,
    actionItems: data.insights.action_items,
    decisions: data.insights.decisions,
    overallVibe: data.insights.overall_vibe,
    timeline: data.insights.timeline,
    speakerSummary: data.insights.speaker_summary,
  };
}

export function useMeetingSession() {
  const [session, setSession] = useState<MeetingSession | null>(() => readStoredSession());

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      startTransition(() => {
        setSession(readStoredSession());
      });
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const saveSession = (nextSession: MeetingSession) => {
    setSession(nextSession);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    }
  };

  const saveUpload = (data: UploadResponse) => {
    saveSession(toMeetingSession(data));
  };

  const clearSession = () => {
    setSession(null);

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  };

  return {
    session,
    saveUpload,
    clearSession,
  };
}
