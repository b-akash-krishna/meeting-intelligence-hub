import json
import os
import re
from functools import lru_cache
from typing import Any, Dict, List

from dotenv import load_dotenv

from models.schemas import ActionItemSchema, DecisionSchema

dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path)


def _clear_broken_proxy_env() -> None:
    broken_proxy = "http://127.0.0.1:9"
    for key in ("HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "GIT_HTTP_PROXY", "GIT_HTTPS_PROXY"):
        if os.environ.get(key) == broken_proxy:
            os.environ.pop(key, None)


@lru_cache(maxsize=1)
def get_chat_models() -> Dict[str, Any]:
    _clear_broken_proxy_env()
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_groq import ChatGroq
    except ModuleNotFoundError as exc:
        raise RuntimeError("Missing AI dependencies.") from exc

    gemini_llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.0)
    groq_llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.0)
    return {"gemini": gemini_llm, "groq": groq_llm}


def get_chat_llm():
    models = get_chat_models()
    return models["groq"].with_fallbacks([models["gemini"]])


def _build_transcript_text(chunks: List[Dict]) -> str:
    lines = []
    for chunk in chunks:
        if chunk.get("text", "").strip():
            lines.append(f"[{chunk['start_time']}] {chunk['speaker']}: {chunk['text']}")
    return "\n".join(lines)


def _parse_json_from_text(text: str) -> dict:
    """Extract a JSON object from text that may contain extra content."""
    # Try direct parse first
    try:
        return json.loads(text.strip())
    except Exception:
        pass

    # Find the outermost {...} block
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            return json.loads(match.group())
        except Exception:
            pass

    return {}


def _parse_from_groq_error(error: Exception) -> dict:
    """
    Groq sometimes returns tool_use_failed with valid JSON in 'failed_generation'.
    We extract and parse that JSON rather than discarding it.
    """
    err_str = str(error)
    # Look for the failed_generation field in the error
    fg_match = re.search(r"'failed_generation':\s*'(.*?)'(?:\}|\])", err_str, re.DOTALL)
    if fg_match:
        raw = fg_match.group(1).replace("\\'", "'")
        # Strip the <function=...> wrapper if present
        raw = re.sub(r"^<function=[^>]+>\s*", "", raw.strip())
        return _parse_json_from_text(raw)

    # Also try finding it in the JSON body of the error
    body_match = re.search(r'"failed_generation":\s*"(.*?)"(?:\}|\])', err_str, re.DOTALL)
    if body_match:
        raw = body_match.group(1).replace('\\"', '"').replace("\\'", "'")
        raw = re.sub(r"^<function=[^>]+>\s*", "", raw.strip())
        return _parse_json_from_text(raw)

    return {}


SYSTEM_PROMPT = """You are an expert meeting analyst. Read the full meeting transcript and extract ALL:

1. ACTION ITEMS — tasks assigned to a specific person.
   Fields: assignee (full name), task (what they must do), deadline (date/time or null), quote_source (short exact quote).

2. DECISIONS — final choices agreed upon by the team.
   Fields: decision_text (what was decided), reasoning_context (why / the context).

CRITICAL RULES:
- Return ONLY valid JSON. No markdown, no explanation — just raw JSON.
- Do NOT hallucinate. Only extract real assignments and decisions.
- If none exist, return empty arrays.

Return exactly this JSON structure:
{
  "action_items": [
    {"assignee": "Name", "task": "...", "deadline": "..." or null, "quote_source": "exact short quote"}
  ],
  "decisions": [
    {"decision_text": "...", "reasoning_context": "..."}
  ]
}"""


async def _call_plain_json(llm, transcript_text: str) -> dict:
    """Call the LLM asking for plain JSON output (no tool/structured output)."""
    from langchain_core.messages import HumanMessage, SystemMessage
    response = await llm.ainvoke([
        SystemMessage(content=SYSTEM_PROMPT),
        HumanMessage(content=f"Meeting Transcript:\n\n{transcript_text}"),
    ])
    return _parse_json_from_text(response.content)


async def process_transcript_chunks(chunks: List[Dict]) -> Dict:
    """
    Single-call extraction using plain JSON output (avoids Groq tool_use_failed errors).
    Falls back to Gemini if Groq fails.
    """
    _clear_broken_proxy_env()

    valid_chunks = [c for c in chunks if c.get("text", "").strip()]
    if not valid_chunks:
        return {"action_items": [], "decisions": []}

    transcript_text = _build_transcript_text(valid_chunks)
    print(f"[Extraction] {len(valid_chunks)} chunks, {len(transcript_text)} chars")

    # Trim for token safety (~12k chars ≈ 3k tokens)
    MAX_CHARS = 12000
    if len(transcript_text) > MAX_CHARS:
        transcript_text = transcript_text[:MAX_CHARS] + "\n[... truncated ...]"

    models = get_chat_models()
    raw_data: dict = {}

    # 1. Try Groq with structured output — recover from tool_use_failed
    try:
        from langchain_core.messages import HumanMessage, SystemMessage
        groq_structured = models["groq"].with_structured_output(
            schema={
                "title": "FullTranscriptExtraction",
                "type": "object",
                "properties": {
                    "action_items": {"type": "array", "items": {"type": "object", "properties": {"assignee": {"type": "string"}, "task": {"type": "string"}, "deadline": {"type": ["string", "null"]}, "quote_source": {"type": "string"}}, "required": ["assignee", "task", "quote_source"]}},
                    "decisions": {"type": "array", "items": {"type": "object", "properties": {"decision_text": {"type": "string"}, "reasoning_context": {"type": "string"}}, "required": ["decision_text", "reasoning_context"]}},
                },
                "required": ["action_items", "decisions"],
            }
        )
        result = await groq_structured.ainvoke([
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=f"Meeting Transcript:\n\n{transcript_text}"),
        ])
        raw_data = result if isinstance(result, dict) else (result.dict() if hasattr(result, "dict") else {})
        print(f"[Extraction] Groq structured output succeeded")
    except Exception as groq_err:
        err_str = str(groq_err)
        print(f"[Extraction] Groq structured failed: {err_str[:120]}")

        # Recover from tool_use_failed — the JSON is in the error
        if "failed_generation" in err_str:
            raw_data = _parse_from_groq_error(groq_err)
            if raw_data.get("action_items") or raw_data.get("decisions"):
                print(f"[Extraction] Recovered from Groq error via failed_generation")
            else:
                raw_data = {}

        # 2. Fall back: Groq plain JSON (no structured output)
        if not raw_data:
            try:
                raw_data = await _call_plain_json(models["groq"], transcript_text)
                print(f"[Extraction] Groq plain JSON succeeded")
            except Exception as e2:
                print(f"[Extraction] Groq plain JSON failed: {e2}")

        # 3. Final fallback: Gemini plain JSON
        if not raw_data:
            try:
                raw_data = await _call_plain_json(models["gemini"], transcript_text)
                print(f"[Extraction] Gemini plain JSON succeeded")
            except Exception as e3:
                print(f"[Extraction] All extraction paths failed: {e3}")
                return {"action_items": [], "decisions": []}

    # Build speaker timestamp lookup
    speaker_ts: Dict[str, str] = {}
    for c in valid_chunks:
        if c["speaker"] not in speaker_ts:
            speaker_ts[c["speaker"]] = c["start_time"]

    action_items = []
    for a in raw_data.get("action_items", []):
        if not isinstance(a, dict):
            continue
        assignee = str(a.get("assignee", "Team"))
        ts = speaker_ts.get(assignee, valid_chunks[0]["start_time"])
        action_items.append({
            "assignee": assignee,
            "task": str(a.get("task", "")),
            "deadline": a.get("deadline"),
            "quote": f"[{ts}] {a.get('quote_source', '')}",
        })

    decisions = []
    for d in raw_data.get("decisions", []):
        if not isinstance(d, dict):
            continue
        decisions.append({
            "decision_text": str(d.get("decision_text", "")),
            "reasoning_context": str(d.get("reasoning_context", "")),
        })

    print(f"[Extraction] Done: {len(action_items)} actions, {len(decisions)} decisions")
    return {"action_items": action_items, "decisions": decisions}
