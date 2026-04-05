import sys
import os
import asyncio
from dotenv import load_dotenv

sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
load_dotenv(os.path.join(os.path.dirname(__file__), 'backend', '.env'))

from backend.utils.parser import parse_txt
from backend.services.vector_db import upsert_transcript_chunks
from backend.api.chat import chat_rag, ChatRequest

async def main():
    transcript = """Alice: Hi everyone, let's get started. Did we decide on the database?
Bob: Yes, we decided to use Supabase.
Charlie: Actually, I think we should also look into Pinecone for the vector searches. 
Alice: Agreed. Charlie, please create the Pinecone index by tomorrow.
Charlie: Will do."""
    
    print("1. Parsing and Upserting to Pinecone...")
    chunks = parse_txt(transcript)
    meeting_id = "test-meeting-101"
    upsert_transcript_chunks(meeting_id, chunks)
    
    # Pinecone takes a moment to index
    print("Waiting 5 seconds for Pinecone Eventual Consistency...")
    await asyncio.sleep(5)
    
    print("\n2. Executing RAG Query...")
    request = ChatRequest(query="Who is creating the Pinecone index and when?", meeting_id=meeting_id)
    response = await chat_rag(request)
    
    print("\n[AI Answer]:", response['answer'])
    print("\n[Sources Retrieved]:", len(response['sources']))
    for idx, source in enumerate(response['sources']):
        print(f" - Source {idx+1}: {source}")

if __name__ == "__main__":
    asyncio.run(main())
