import re
from typing import List, Dict

def parse_vtt(content: str) -> List[Dict]:
    """
    Parses a VTT string into a structured list of dictionaries.
    Gracefully handles missing speaker tags and timestamps.
    """
    # Regex for VTT timestamp lines: 00:00:05.100 --> 00:00:10.500
    timestamp_pattern = re.compile(r"(\d{2}:\d{2}:\d{2}[\.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[\.,]\d{3})")
    # Regex to catch speaker name inside <v Speaker>
    speaker_pattern = re.compile(r"<v\s+([^>]+)>")

    lines = content.strip().split("\n")
    chunks = []
    
    current_start = None
    current_end = None
    current_text = []
    
    for line in lines:
        line = line.strip()
        if not line or line.upper() == "WEBVTT":
            continue
            
        time_match = timestamp_pattern.search(line)
        if time_match:
            # If we hit a new timestamp, save the previous chunk if it exists
            if current_start and current_text:
                full_text = " ".join(current_text)
                speaker_match = speaker_pattern.search(full_text)
                speaker = speaker_match.group(1).strip() if speaker_match else "Unknown"
                
                # Clean the text of standard tags
                clean_text = re.sub(r"<[^>]+>", "", full_text).strip()
                
                chunks.append({
                    "start_time": current_start,
                    "end_time": current_end,
                    "speaker": speaker,
                    "text": clean_text
                })
            
            # Start new chunk
            current_start = time_match.group(1)
            current_end = time_match.group(2)
            current_text = []
        else:
            if current_start:
                current_text.append(line)
                
    # Catch the last chunk
    if current_start and current_text:
        full_text = " ".join(current_text)
        speaker_match = speaker_pattern.search(full_text)
        speaker = speaker_match.group(1).strip() if speaker_match else "Unknown"
        clean_text = re.sub(r"<[^>]+>", "", full_text).strip()
        
        chunks.append({
            "start_time": current_start,
            "end_time": current_end,
            "speaker": speaker,
            "text": clean_text
        })
        
    return chunks

def parse_txt(content: str) -> List[Dict]:
    """
    Fallback parser for plain text. 
    Lacking timestamps, it creates chunks based on paragraphs or newlines.
    """
    paragraphs = [p for p in content.split("\n\n") if p.strip()]
    chunks = []
    
    for i, para in enumerate(paragraphs):
        # basic heuristic: If line starts with "Name:", treat as speaker
        speaker = "Unknown"
        clean_text = para.strip()
        if ":" in clean_text[:30]: 
            parts = clean_text.split(":", 1)
            if len(parts[0].split()) <= 3:
                speaker = parts[0].strip()
                clean_text = parts[1].strip()
                
        chunks.append({
            "start_time": f"Offset-{i}",
            "end_time": f"Offset-{i+1}",
            "speaker": speaker,
            "text": clean_text
        })
        
    return chunks
