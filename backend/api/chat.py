from typing import List, Literal, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.vector_db import get_vector_store
from services.llm_extractor import get_chat_llm

router = APIRouter()


class ChatMessage(BaseModel):
    role: Literal["human", "ai"]
    text: str


class ChatRequest(BaseModel):
    query: str
    meeting_id: Optional[str] = None  # Optional filter by specific meeting
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

    return "\n".join(f"{msg.role.upper()}: {msg.text}" for msg in history[-8:])


def get_chat_prompt():
    try:
        from langchain_core.prompts import ChatPromptTemplate
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "Missing LangChain core dependency. Install backend requirements before using chat."
        ) from exc

    return ChatPromptTemplate.from_messages([
        (
            "system",
            "You are an executive assistant with access to meeting transcripts. "
            "Use ONLY the provided context blocks to answer the user's question. "
            "If the answer is not in the context, say 'I cannot find this in the meeting memory.' "
            "Include citation tags exactly as provided, such as [Time: 00:00:01-00:00:05] Speaker, "
            "at the end of each factual sentence."
        ),
        (
            "human",
            "Conversation so far:\n{history}\n\n"
            "Context blocks:\n{context}\n\nQuestion: {question}"
        )
    ])


@router.post("/", response_model=ChatResponse)
async def chat_rag(request: ChatRequest):
    try:
        vector_store = get_vector_store()

        # Base filter if they specify a specific meeting
        filter_dict = {}
        if request.meeting_id:
            filter_dict["meeting_id"] = request.meeting_id

        # Retrieve top 5 semantic matches
        docs = vector_store.similarity_search(request.query, k=5, filter=filter_dict if filter_dict else None)

        if not docs:
            return {
                "answer": "I cannot find this in the meeting memory.",
                "sources": [],
            }

        sources = [
            {
                "citation": doc.metadata.get("citation", "Unknown citation"),
                "text": doc.page_content,
            }
            for doc in docs
        ]
        context_block = "\n\n".join(
            f"{source['citation']}\n{source['text']}" for source in sources
        )

        # Provide Context to the fallback-resilient LLM
        basic_chain = get_chat_prompt() | get_chat_llm()
        response = await basic_chain.ainvoke({
            "history": format_history(request.history),
            "context": context_block,
            "question": request.query,
        })

        return {
            "answer": response.content,
            "sources": sources,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
