from typing import List, Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.vector_db import get_vector_store
from services.llm_extractor import get_chat_llm
from services.meeting_store import build_context_from_store

router = APIRouter()


class ChatMessage(BaseModel):
    role: Literal["human", "ai"]
    text: str


class ChatRequest(BaseModel):
    query: str
    meeting_id: Optional[str] = None
    history: List[ChatMessage] = []


class ChatSource(BaseModel):
    citation: str
    text: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[ChatSource]


def format_history(history: List[ChatMessage]) -> str:
    if not history:
        return "No previous conversation."
    return "\n".join(f"{msg.role.upper()}: {msg.text}" for msg in history[-6:])


async def _answer_with_context(query: str, context: str, history: str, sources: list) -> str:
    """Call the LLM with the given context and return the answer text."""
    from langchain_core.messages import HumanMessage, SystemMessage

    system = (
        "You are an expert meeting assistant. The user has uploaded a meeting transcript. "
        "Use the context below to answer their question accurately and helpfully. "
        "The context contains the full transcript, extracted action items, and decisions. "
        "Always answer based on the context — do NOT say you cannot find things if they are present. "
        "Be concise and clear. If there are action items or decisions, list them clearly."
    )

    human = (
        f"Previous conversation:\n{history}\n\n"
        f"Meeting Context:\n{context}\n\n"
        f"Question: {query}"
    )

    llm = get_chat_llm()
    response = await llm.ainvoke([
        SystemMessage(content=system),
        HumanMessage(content=human),
    ])
    return response.content


@router.post("/", response_model=ChatResponse)
async def chat_rag(request: ChatRequest):
    try:
        history_str = format_history(request.history)
        sources: List[dict] = []

        # ── Step 1: Try Pinecone semantic retrieval ──
        pinecone_context = ""
        try:
            vector_store = get_vector_store()
            filter_dict = {"meeting_id": request.meeting_id} if request.meeting_id else {}
            docs = vector_store.similarity_search(
                request.query, k=5,
                filter=filter_dict if filter_dict else None
            )
            if docs:
                sources = [
                    {"citation": doc.metadata.get("citation", "Source"), "text": doc.page_content}
                    for doc in docs
                ]
                pinecone_context = "\n\n".join(
                    f"{s['citation']}\n{s['text']}" for s in sources
                )
                print(f"[Chat] Pinecone returned {len(docs)} docs")
        except Exception as e:
            print(f"[Chat] Pinecone retrieval failed: {type(e).__name__} — using in-memory fallback")

        # ── Step 2: Use in-memory store as primary or additional context ──
        store_context = build_context_from_store(request.meeting_id)

        # Combine: Pinecone results (specific) + full store context (comprehensive)
        if pinecone_context and store_context:
            context = f"{pinecone_context}\n\n{store_context}"
        elif store_context:
            context = store_context
        elif pinecone_context:
            context = pinecone_context
        else:
            context = ""

        if not context:
            return {
                "answer": "No meeting has been uploaded yet. Please upload a transcript on the overview page first.",
                "sources": [],
            }

        # ── Step 3: Generate answer ──
        answer = await _answer_with_context(request.query, context, history_str, sources)

        return {"answer": answer, "sources": sources}

    except Exception as e:
        print(f"[Chat] Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
