from fastapi import APIRouter, BackgroundTasks, File, HTTPException, UploadFile

from models.schemas import MeetingInsightsResponse
from services.sentiment_analyzer import analyze_transcript_sentiment
from utils.parser import parse_vtt, parse_txt
from services.llm_extractor import process_transcript_chunks
from services.vector_db import upsert_transcript_chunks
from services.meeting_store import save_meeting
import uuid

router = APIRouter()

@router.post("/upload", response_model=MeetingInsightsResponse)
async def upload_transcript(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not (file.filename.endswith(".txt") or file.filename.endswith(".vtt")):
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload .txt or .vtt.")

    meeting_id = str(uuid.uuid4())

    content = await file.read()
    text = content.decode("utf-8")

    if file.filename.endswith(".vtt"):
        chunks = parse_vtt(text)
    else:
        chunks = parse_txt(text)

    print(f"[{meeting_id}] Parsed {len(chunks)} chunks. Running pipeline...")

    # 1. Extract action items + decisions via LLM (single call)
    extraction_insights = await process_transcript_chunks(chunks)
    sentiment_insights = analyze_transcript_sentiment(chunks)
    insights = {**extraction_insights, **sentiment_insights}

    # 2. Save to in-memory store for reliable chat fallback (no Pinecone quota dependency)
    save_meeting(meeting_id, chunks, insights)

    # 3. Background: embed + push to Pinecone for semantic RAG (best-effort)
    background_tasks.add_task(upsert_transcript_chunks, meeting_id, chunks)

    return {
        "meeting_id": meeting_id,
        "status": "completed",
        "message": f"Successfully processed and indexed {len(chunks)} chunks.",
        "insights": insights
    }
