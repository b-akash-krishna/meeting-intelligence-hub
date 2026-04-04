import sys
import os

# Add backend directory to sys path so we can import utils
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from utils.parser import parse_txt

def test():
    with open("test_transcript.txt", "r") as f:
        content = f.read()
    
    chunks = parse_txt(content)
    print("Parsed Chunks:")
    for chunk in chunks:
        print(f"[{chunk['start_time']} - {chunk['end_time']}] {chunk['speaker']}: {chunk['text']}")

if __name__ == "__main__":
    test()
