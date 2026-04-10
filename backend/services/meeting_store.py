"""
In-memory meeting store — holds raw chunks and insights per meeting_id.
Used as a fallback when Pinecone is unavailable (quota exceeded, cold start, etc.).
Keyed by meeting_id, cleared on server restart.
"""
from typing import Dict, List, Any

# { meeting_id: { "chunks": [...], "insights": {...} } }
_store: Dict[str, Dict[str, Any]] = {}


def save_meeting(meeting_id: str, chunks: List[Dict], insights: Dict) -> None:
    _store[meeting_id] = {"chunks": chunks, "insights": insights}


def get_meeting(meeting_id: str) -> Dict[str, Any] | None:
    return _store.get(meeting_id)


def get_latest_meeting() -> Dict[str, Any] | None:
    """Return the most recently uploaded meeting (last key in dict)."""
    if not _store:
        return None
    last_id = list(_store.keys())[-1]
    return {"meeting_id": last_id, **_store[last_id]}


def build_context_from_store(meeting_id: str | None) -> str:
    """
    Build a text context block from stored chunks + insights for use
    by the LLM when Pinecone retrieval returns nothing.
    """
    if meeting_id:
        data = get_meeting(meeting_id)
    else:
        data = get_latest_meeting()

    if not data:
        return ""

    parts: List[str] = []

    # Add action items
    insights = data.get("insights", {})
    actions = insights.get("action_items", [])
    if actions:
        parts.append("=== ACTION ITEMS ===")
        for a in actions:
            deadline = f", deadline: {a['deadline']}" if a.get("deadline") else ""
            parts.append(f"- {a['assignee']}: {a['task']}{deadline}")

    # Add decisions
    decisions = insights.get("decisions", [])
    if decisions:
        parts.append("\n=== DECISIONS ===")
        for d in decisions:
            parts.append(f"- {d['decision_text']}: {d['reasoning_context']}")

    # Add full transcript (truncated if long)
    chunks = data.get("chunks", [])
    if chunks:
        parts.append("\n=== TRANSCRIPT ===")
        transcript_lines = []
        for c in chunks:
            if c.get("text", "").strip():
                transcript_lines.append(f"[{c.get('start_time', '?')}] {c.get('speaker', 'Unknown')}: {c['text']}")
        transcript_text = "\n".join(transcript_lines)
        # Keep within ~8k chars
        if len(transcript_text) > 8000:
            transcript_text = transcript_text[:8000] + "\n[... truncated ...]"
        parts.append(transcript_text)

    return "\n".join(parts)
