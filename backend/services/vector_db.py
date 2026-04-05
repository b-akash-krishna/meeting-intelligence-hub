import os
from functools import lru_cache
from typing import Dict, List

from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path)

index_name = os.getenv("PINECONE_INDEX_NAME", "meeting-hub")


@lru_cache(maxsize=1)
def get_embeddings():
    try:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "Missing AI dependencies. Install backend requirements before using vector search."
        ) from exc

    return GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")


def get_vector_store():
    try:
        from langchain_pinecone import PineconeVectorStore
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "Missing Pinecone integration dependency. Install backend requirements before using vector search."
        ) from exc

    return PineconeVectorStore(index_name=index_name, embedding=get_embeddings())


def build_citation(chunk: Dict) -> str:
    return f"[Time: {chunk['start_time']}-{chunk['end_time']}] {chunk['speaker']}"


def upsert_transcript_chunks(meeting_id: str, chunks: List[Dict]):
    """Embeds parsed chunks into Pinecone with citation metadata."""
    if not chunks:
        return

    from langchain_core.documents import Document

    documents = []
    for idx, chunk in enumerate(chunks):
        citation = build_citation(chunk)
        documents.append(
            Document(
                page_content=f"{citation}: {chunk['text']}",
                metadata={
                    "meeting_id": meeting_id,
                    "speaker": chunk["speaker"],
                    "start_time": chunk["start_time"],
                    "end_time": chunk["end_time"],
                    "citation": citation,
                    "chunk_index": idx,
                },
            )
        )

    print(f"[{meeting_id}] Embedding and storing {len(documents)} chunks to Pinecone...")
    vector_store = get_vector_store()
    vector_store.add_documents(documents)
