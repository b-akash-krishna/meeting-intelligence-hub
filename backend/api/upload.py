from fastapi import APIRouter, UploadFile, File
from models.schemas import UploadResponse
from utils.parser import parse_vtt, parse_txt
from services.llm_extractor import process_transcript_chunks
import uuid

router = APIRouter()

@router.post("/upload")
async def upload_transcript(file: UploadFile = File(...)):
    # Verify file type
    if not (file.filename.endswith(".txt") or file.filename.endswith(".vtt")):
        return {"meeting_id": "", "status": "failed", "message": "Unsupported file format. Please upload .txt or .vtt."}

    meeting_id = str(uuid.uuid4())
    
    content = await file.read()
    text = content.decode("utf-8")
    
    # Process transcript -> raw blocks
    if file.filename.endswith(".vtt"):
        chunks = parse_vtt(text)
    else:
        chunks = parse_txt(text)
        
    print(f"[{meeting_id}] Parsed {len(chunks)} chunks. Running LangChain Extraction...")
    
    # Send directly to the LLM extractor pipeline
    insights = await process_transcript_chunks(chunks)
    
    return {
        "meeting_id": meeting_id, 
        "status": "completed",
        "message": f"Successfully processed {len(chunks)} chunks.",
        "insights": insights
    }
