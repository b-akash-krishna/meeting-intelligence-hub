from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile

from models.schemas import MeetingInsightsResponse
from utils.parser import parse_vtt, parse_txt
from services.llm_extractor import process_transcript_chunks
from services.vector_db import upsert_transcript_chunks
import uuid

router = APIRouter()

@router.post("/upload", response_model=MeetingInsightsResponse)
async def upload_transcript(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # Verify file type
    if not (file.filename.endswith(".txt") or file.filename.endswith(".vtt")):
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload .txt or .vtt.")

    meeting_id = str(uuid.uuid4())
    
    content = await file.read()
    text = content.decode("utf-8")
    
    # Process transcript -> raw blocks
    if file.filename.endswith(".vtt"):
        chunks = parse_vtt(text)
    else:
        chunks = parse_txt(text)
        
    print(f"[{meeting_id}] Parsed {len(chunks)} chunks. Running pipeline...")
    
    # 1. Background Task: Embed and Push to Pinecone Memory immediately
    # We use a background task so the frontend doesn't hang waiting for Pinecone IO.
    background_tasks.add_task(upsert_transcript_chunks, meeting_id, chunks)
    
    # 2. Extract Action Items securely via LLM Fallbacks
    insights = await process_transcript_chunks(chunks)
    
    return {
        "meeting_id": meeting_id, 
        "status": "completed",
        "message": f"Successfully processed and indexed {len(chunks)} chunks.",
        "insights": insights
    }
