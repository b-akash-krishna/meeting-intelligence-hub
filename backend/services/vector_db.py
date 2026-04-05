import os
from functools import lru_cache
from typing import Dict, List

from dotenv import load_dotenv

dotenv_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(dotenv_path)

index_name = os.getenv("PINECONE_INDEX_NAME", "meeting-hub")


def _clear_broken_proxy_env() -> None:
    broken_proxy = "http://127.0.0.1:9"
    for key in ("HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY", "GIT_HTTP_PROXY", "GIT_HTTPS_PROXY"):
        if os.environ.get(key) == broken_proxy:
            os.environ.pop(key, None)


@lru_cache(maxsize=1)
def get_embeddings():
    _clear_broken_proxy_env()

    try:
        from langchain_google_genai import GoogleGenerativeAIEmbeddings
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "Missing AI dependencies. Install backend requirements before using vector search."
        ) from exc

    class ReducedDimensionEmbeddings(GoogleGenerativeAIEmbeddings):
        def embed_documents(self, texts, **kwargs):
            kwargs.setdefault("output_dimensionality", 768)
            return super().embed_documents(texts, **kwargs)

        def embed_query(self, text, **kwargs):
            kwargs.setdefault("output_dimensionality", 768)
            return super().embed_query(text, **kwargs)

    return ReducedDimensionEmbeddings(model="models/gemini-embedding-001")


def get_vector_store():
    try:
        from langchain_pinecone import Pinecone
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "Missing Pinecone integration dependency. Install backend requirements before using vector search."
        ) from exc

    return Pinecone(index_name=index_name, embedding=get_embeddings())


def build_citation(chunk: Dict) -> str:
    return f"[Time: {chunk['start_time']}-{chunk['end_time']}] {chunk['speaker']}"


def upsert_transcript_chunks(meeting_id: str, chunks: List[Dict]):
    """Embeds parsed chunks into Pinecone with citation metadata."""
    if not chunks:
        return

    texts = []
    metadatas = []
    ids = []
    for idx, chunk in enumerate(chunks):
        citation = build_citation(chunk)
        texts.append(f"{citation}: {chunk['text']}")
        metadatas.append(
            {
                "meeting_id": meeting_id,
                "speaker": chunk["speaker"],
                "start_time": chunk["start_time"],
                "end_time": chunk["end_time"],
                "citation": citation,
                "chunk_index": idx,
                "text": f"{citation}: {chunk['text']}",
            }
        )
        ids.append(f"{meeting_id}-{idx}")

    print(f"[{meeting_id}] Embedding and storing {len(texts)} chunks to Pinecone...")
    embeddings = get_embeddings().embed_documents(texts)
    vector_store = get_vector_store()
    vectors = list(zip(ids, embeddings, metadatas))
    vector_store._index.upsert(vectors=vectors)
