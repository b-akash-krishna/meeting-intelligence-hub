import re
from typing import List, Dict


def _extract_speaker_from_text(text: str):
    """
    Detects 'Speaker: text' pattern (plain VTT dialect).
    Returns (speaker, clean_text) or (None, text) if no pattern found.
    """
    # Match "Name:" at the start — up to 4 words, no digits, before colon
    m = re.match(r"^([A-Za-z][A-Za-z\s]{0,30}):\s+(.+)$", text.strip(), re.DOTALL)
    if m:
        candidate = m.group(1).strip()
        # Reject if it looks like a sentence fragment (too many words)
        if len(candidate.split()) <= 4:
            return candidate, m.group(2).strip()
    return None, text.strip()


def parse_vtt(content: str) -> List[Dict]:
    """
    Parses a VTT string into a structured list of speaker-turn chunks.
    Handles both:
      - Standard VTT:  <v SpeakerName> text </v>
      - Plain dialect: SpeakerName: text (most common in real files)
    Merges consecutive same-speaker cues to reduce LLM calls.
    """
    timestamp_pattern = re.compile(
        r"(\d{1,2}:\d{2}:\d{2}[\.,]\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[\.,]\d{3})"
    )
    v_tag_pattern = re.compile(r"<v\s+([^>]+)>")

    lines = content.strip().split("\n")
    raw_chunks: List[Dict] = []

    current_start = None
    current_end = None
    current_lines: List[str] = []

    for line in lines:
        line = line.strip()
        if not line or line.upper() == "WEBVTT" or re.match(r"^\d+$", line):
            # Skip blank lines, WEBVTT header, and numeric cue identifiers
            continue

        time_match = timestamp_pattern.search(line)
        if time_match:
            # Flush previous cue
            if current_start and current_lines:
                full_text = " ".join(current_lines)

                # Try <v SpeakerName> tag first (standard VTT)
                v_match = v_tag_pattern.search(full_text)
                if v_match:
                    speaker = v_match.group(1).strip()
                    clean = re.sub(r"<[^>]+>", "", full_text).strip()
                else:
                    # Fall back to "Speaker: text" pattern
                    clean_no_tags = re.sub(r"<[^>]+>", "", full_text).strip()
                    speaker, clean = _extract_speaker_from_text(clean_no_tags)
                    if speaker is None:
                        speaker = "Unknown"

                if clean:
                    raw_chunks.append({
                        "start_time": current_start,
                        "end_time": current_end,
                        "speaker": speaker,
                        "text": clean,
                    })

            current_start = time_match.group(1)
            current_end = time_match.group(2)
            current_lines = []
        else:
            if current_start:
                current_lines.append(line)

    # Flush last cue
    if current_start and current_lines:
        full_text = " ".join(current_lines)
        v_match = v_tag_pattern.search(full_text)
        if v_match:
            speaker = v_match.group(1).strip()
            clean = re.sub(r"<[^>]+>", "", full_text).strip()
        else:
            clean_no_tags = re.sub(r"<[^>]+>", "", full_text).strip()
            speaker, clean = _extract_speaker_from_text(clean_no_tags)
            if speaker is None:
                speaker = "Unknown"
        if clean:
            raw_chunks.append({
                "start_time": current_start,
                "end_time": current_end,
                "speaker": speaker,
                "text": clean,
            })

    # ── Merge consecutive same-speaker cues into full speaker turns ──
    # Reduces N cues → ~15 speaker turns → fewer LLM calls
    merged: List[Dict] = []
    for chunk in raw_chunks:
        if merged and merged[-1]["speaker"] == chunk["speaker"]:
            merged[-1]["end_time"] = chunk["end_time"]
            merged[-1]["text"] += " " + chunk["text"]
        else:
            merged.append(dict(chunk))

    print(f"[Parser] VTT: {len(raw_chunks)} cues → {len(merged)} speaker turns")
    return merged


def parse_txt(content: str) -> List[Dict]:
    """
    Fallback parser for plain text files.
    Handles 'Speaker: text' per paragraph or line.
    """
    # Try line-by-line first (each line = one speaker utterance)
    lines = [l.strip() for l in content.strip().split("\n") if l.strip()]
    chunks: List[Dict] = []

    for i, line in enumerate(lines):
        speaker, clean = _extract_speaker_from_text(line)
        if speaker is None:
            speaker = "Unknown"
        chunks.append({
            "start_time": f"Offset-{i}",
            "end_time": f"Offset-{i+1}",
            "speaker": speaker,
            "text": clean,
        })

    # Merge consecutive same-speaker lines
    merged: List[Dict] = []
    for chunk in chunks:
        if merged and merged[-1]["speaker"] == chunk["speaker"]:
            merged[-1]["end_time"] = chunk["end_time"]
            merged[-1]["text"] += " " + chunk["text"]
        else:
            merged.append(dict(chunk))

    print(f"[Parser] TXT: {len(chunks)} lines → {len(merged)} speaker turns")
    return merged
