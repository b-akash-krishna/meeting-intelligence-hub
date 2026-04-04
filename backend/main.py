from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import upload

app = FastAPI(
    title="Meeting Intelligence Hub API",
    description="API for multi-transcript ingestion, RAG chat, and sentiment extraction.",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(upload.router, prefix="/api/v1/meetings", tags=["Meetings"])

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
