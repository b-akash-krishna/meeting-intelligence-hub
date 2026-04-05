import asyncio
import os
from functools import lru_cache
from typing import Any, Dict, List

from dotenv import load_dotenv
from pydantic import BaseModel, Field

from models.schemas import ActionItemSchema, DecisionSchema

dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path)

# We wrap the underlying schemas in a container for OpenAI structured output
class ChunkExtraction(BaseModel):
    action_items: List[ActionItemSchema] = Field(default_factory=list, description="List of action items found in this chunk. Leave empty if none.")
    decisions: List[DecisionSchema] = Field(default_factory=list, description="List of decisions found in this chunk. Leave empty if none.")

def get_extraction_prompt():
    try:
        from langchain_core.prompts import ChatPromptTemplate
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "Missing LangChain core dependency. Install backend requirements before using extraction."
        ) from exc

    return ChatPromptTemplate.from_messages([
        ("system", """You are an expert executive AI assistant. 
Your job is to read the provided transcript chunk and extract two things ONLY:
1. Action Items: Specific tasks assigned to an individual (or 'Team').
2. Decisions: Finalized choices or strategies agreed upon.

RULES:
- An action item is ONLY valid if a specific task is assigned or heavily implied.
- If no action items or decisions exist in the text, return empty lists.
- DO NOT hallucinate. You MUST capture the 'quote_source' exactly as it appears in the text."""),
        ("human", "Transcript Chunk:\nTime: {time}\nSpeaker: {speaker}\nText: {text}")
    ])


@lru_cache(maxsize=1)
def get_chat_models() -> Dict[str, Any]:
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_groq import ChatGroq
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "Missing AI dependencies. Install backend requirements before using extraction or chat."
        ) from exc

    gemini_llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.0)
    groq_llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.0)
    return {
        "gemini": gemini_llm,
        "groq": groq_llm,
    }


def get_structured_extraction_chain():
    models = get_chat_models()
    primary_structured_llm = models["gemini"].with_structured_output(ChunkExtraction)
    fallback_structured_llm = models["groq"].with_structured_output(ChunkExtraction)
    robust_llm = primary_structured_llm.with_fallbacks([fallback_structured_llm])
    return get_extraction_prompt() | robust_llm


def get_chat_llm():
    models = get_chat_models()
    return models["gemini"].with_fallbacks([models["groq"]])

async def extract_from_chunk(chunk: Dict) -> Dict:
    """Extracts data from a single chunk."""
    try:
        extraction_chain = get_structured_extraction_chain()
        response = await extraction_chain.ainvoke({
            "time": f"[{chunk['start_time']} - {chunk['end_time']}]",
            "speaker": chunk['speaker'],
            "text": chunk['text']
        })
        
        actions = []
        if response and hasattr(response, 'action_items'):
            for a in response.action_items:
                actions.append({
                    "assignee": a.assignee,
                    "task": a.task,
                    "deadline": a.deadline,
                    "quote": f"[{chunk['start_time']}] {chunk['speaker']}: {a.quote_source}"
                })
            
        decisions = []
        if response and hasattr(response, 'decisions'):
            for d in response.decisions:
                decisions.append({
                    "decision_text": d.decision_text,
                    "reasoning_context": d.reasoning_context
                })
            
        return {"actions": actions, "decisions": decisions}
    except Exception as e:
        print(f"Extraction error on chunk: {e}")
        return {"actions": [], "decisions": []}


async def process_transcript_chunks(chunks: List[Dict]) -> Dict:
    """Takes a list of parsed chunks, runs them in parallel, and consolidates the results."""
    # Process concurrently
    tasks = [extract_from_chunk(chunk) for chunk in chunks]
    results = await asyncio.gather(*tasks)
    
    all_actions = []
    all_decisions = []
    
    for r in results:
        all_actions.extend(r.get("actions", []))
        all_decisions.extend(r.get("decisions", []))
        
    return {
        "action_items": all_actions,
        "decisions": all_decisions
    }
