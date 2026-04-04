import sys
import os
import asyncio
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

from backend.utils.parser import parse_txt
from backend.services.llm_extractor import process_transcript_chunks

async def main():
    transcript = """Alice: Hi everyone, let's get started. Did we decide on the database?
Bob: Yes, we decided to use Supabase.
Charlie: Actually, I think we should also look into Pinecone for the vector searches. 
Alice: Agreed. Bob, please create the Pinecone index by tomorrow."""
    
    chunks = parse_txt(transcript)
    print("Parsed Chunks:", chunks)
    print("\n--- Running LangChain Extraction ---\n")
    
    insights = await process_transcript_chunks(chunks)
    
    print("Extracted Action Items:")
    for a in insights['action_items']:
            print(f"- [Assignee: {a['assignee']}] {a['task']} (Deadline: {a['deadline']}) -> Citation: {a['quote']}")
            
    print("\nExtracted Decisions:")
    for d in insights['decisions']:
            print(f"- {d['decision_text']} (Context: {d['reasoning_context']})")

if __name__ == "__main__":
    asyncio.run(main())
