import re
from collections import Counter, defaultdict
from typing import Dict, List


POSITIVE_KEYWORDS = {
    "agree",
    "agreed",
    "great",
    "good",
    "fine",
    "smart",
    "okay",
    "thanks",
    "covered",
}

NEGATIVE_KEYWORDS = {
    "issue",
    "risk",
    "broken",
    "failure",
    "fail",
    "spike",
    "blocker",
    "bug",
    "crash",
    "weirdness",
    "slip",
}

UNCERTAINTY_KEYWORDS = {
    "maybe",
    "might",
    "could",
    "probably",
    "roughly",
    "assuming",
    "unclear",
    "risk",
    "if",
}


def _normalize_words(text: str) -> List[str]:
    return re.findall(r"[A-Za-z']+", text.lower())


def _classify_chunk(text: str) -> Dict:
    words = _normalize_words(text)
    counts = Counter(words)

    positive = sum(counts[word] for word in POSITIVE_KEYWORDS)
    negative = sum(counts[word] for word in NEGATIVE_KEYWORDS)
    uncertainty = sum(counts[word] for word in UNCERTAINTY_KEYWORDS)

    if negative >= max(2, positive + 1):
        vibe = "Conflict"
    elif uncertainty >= max(2, positive + 1):
        vibe = "Uncertainty"
    elif positive > 0:
        vibe = "Collaborative"
    else:
        vibe = "Neutral"

    score = positive - negative
    return {
        "vibe": vibe,
        "score": score,
        "positive_hits": positive,
        "negative_hits": negative,
        "uncertainty_hits": uncertainty,
    }


def analyze_transcript_sentiment(chunks: List[Dict]) -> Dict:
    if not chunks:
        return {
            "overall_vibe": "Neutral",
            "timeline": [],
            "speaker_summary": [],
        }

    speaker_stats = defaultdict(lambda: {"score": 0, "counts": Counter(), "chunks": 0})
    timeline = []

    for idx in range(0, len(chunks), 5):
        window_chunks = chunks[idx : idx + 5]
        aggregate = Counter()
        total_score = 0

        for chunk in window_chunks:
            chunk_sentiment = _classify_chunk(chunk["text"])
            aggregate[chunk_sentiment["vibe"]] += 1
            total_score += chunk_sentiment["score"]

            speaker_stats[chunk["speaker"]]["score"] += chunk_sentiment["score"]
            speaker_stats[chunk["speaker"]]["counts"][chunk_sentiment["vibe"]] += 1
            speaker_stats[chunk["speaker"]]["chunks"] += 1

        dominant_vibe = aggregate.most_common(1)[0][0] if aggregate else "Neutral"
        timeline.append(
            {
                "window_label": f"Window {len(timeline) + 1}",
                "start_time": window_chunks[0]["start_time"],
                "end_time": window_chunks[-1]["end_time"],
                "vibe": dominant_vibe,
                "intensity": max(-5, min(5, total_score)),
                "chunk_count": len(window_chunks),
            }
        )

    speaker_summary = []
    for speaker, stats in speaker_stats.items():
        dominant_vibe = stats["counts"].most_common(1)[0][0] if stats["counts"] else "Neutral"
        speaker_summary.append(
            {
                "speaker": speaker,
                "dominant_vibe": dominant_vibe,
                "engagement": stats["chunks"],
                "sentiment_score": max(-10, min(10, stats["score"])),
            }
        )

    speaker_summary.sort(key=lambda item: (-item["engagement"], item["speaker"]))

    overall_counts = Counter(item["vibe"] for item in timeline)
    overall_vibe = overall_counts.most_common(1)[0][0] if overall_counts else "Neutral"

    return {
        "overall_vibe": overall_vibe,
        "timeline": timeline,
        "speaker_summary": speaker_summary,
    }
