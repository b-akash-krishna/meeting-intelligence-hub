import sys
sys.path.insert(0, ".")
from utils.parser import parse_vtt

content = open("../demo_meeting.vtt", encoding="utf-8").read()
chunks = parse_vtt(content)
print(f"Total speaker turns: {len(chunks)}")
for c in chunks:
    print(f"  [{c['speaker']}] {c['start_time']} -- {c['text'][:70]}")
