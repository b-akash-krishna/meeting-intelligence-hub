import os
import asyncio
from typing import List, Dict
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from models.schemas import ActionItemSchema, DecisionSchema

load_dotenv()

# We wrap the underlying schemas in a container for OpenAI structured output
class ChunkExtraction(BaseModel):
    action_items: List[ActionItemSchema] = Field(default_factory=list, description="List of action items found in this chunk. Leave empty if none.")
    decisions: List[DecisionSchema] = Field(default_factory=list, description="List of decisions found in this chunk. Leave empty if none.")

# Primary LLM: Gemini 1.5 Flash (Extremely fast, massive context)
gemini_llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.0)
primary_structured_llm = gemini_llm.with_structured_output(ChunkExtraction)

# Fallback LLM: Groq Llama 3.1 8B (Blazing fast inference if Gemini rate limits)
groq_llm = ChatGroq(model="llama-3.1-8b-instant", temperature=0.0)
fallback_structured_llm = groq_llm.with_structured_output(ChunkExtraction)

# Link them tightly together for maximum robustness!
robust_llm = primary_structured_llm.with_fallbacks([fallback_structured_llm])

# Define our prompt template
prompt = ChatPromptTemplate.from_messages([
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

extraction_chain = prompt | robust_llm

async def extract_from_chunk(chunk: Dict) -> Dict:
    """Extracts data from a single chunk."""
    try:
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
