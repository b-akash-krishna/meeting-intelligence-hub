# Meeting Intelligence Hub — Design Document

**Cymonic AI Sprint | April 2026**

---

## Problem Statement

Meeting transcripts are long, noisy, and rarely revisited. Teams lose hours re-meeting to clarify points that were already discussed. The core problem is not *generating* transcripts — that is solved. The unsolved challenge is extracting structured, queryable intelligence from meetings and making it available without reading a 20-page document.

This system answers four critical questions from any uploaded transcript:
1. **What was decided?** (Decision register)
2. **Who owns what?** (Action item ledger)
3. **What was the tone?** (Sentiment timeline)
4. **Where exactly did a claim come from?** (RAG chat with cited evidence)

---

## Solution Architecture

### Data Flow
```
User uploads .vtt / .txt
        ↓
FastAPI parses → timestamped speaker chunks
        ↓
Parallel pipelines:
  ├── LLM Extraction (Groq → Gemini fallback)
  │       → ActionItem[], Decision[]
  ├── Heuristic Sentiment
  │       → Timeline windows + speaker summary
  └── Embedding → Pinecone upsert
        ↓
Combined InsightsPayload → Frontend
        ↓
User asks question → Pinecone retrieval → LLM answer + citations
```

### Components

| Layer | Technology | Role |
|---|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 | Premium dark-mode dashboard |
| Backend | FastAPI, Uvicorn | Async REST API orchestration |
| LLM Extraction | LangChain + Groq `llama-3.1-8b-instant` | Structured JSON action/decision extraction |
| LLM Fallback | Gemini `gemini-2.5-flash` | Automatic fallback on Groq failures |
| Embeddings | Gemini `gemini-embedding-001` (768-dim) | Semantic transcript chunk indexing |
| Vector Store | Pinecone | RAG retrieval with citation metadata |
| Data Validation | Pydantic v2 | Strict typed schemas throughout |

---

## Key Design Choices

### Why FastAPI + Next.js, not Streamlit?
Streamlit gives you a working prototype in 30 minutes, but the output looks like a prototype. FastAPI + Next.js gives a proper API contract and a premium UI that scores on the Innovation & Presentation rubric (20%). The gap in judge perception is significant.

### Why Groq as primary LLM?
Groq inference is 10–20× faster than OpenAI for the same model class at free-tier quotas. For a demo that needs to process a real-world VTT file in a reasonable time, this matters. Gemini is configured as a `with_fallbacks()` chain so the system degrades gracefully.

### Why heuristic sentiment instead of a second LLM call?
Running an LLM pass on every 5-minute window of a 60-minute transcript would use ~12 inference calls just for sentiment, on top of the extraction pipeline. The heuristic keyword classifier is deterministic, instant, and sufficient for a dashboard indicator. The tradeoff is documented.

### Why rate-limit extraction to 3 concurrent calls?
Free-tier Groq and Gemini quotas can spike on long transcripts. Throttling to `MAX_EXTRACTION_CONCURRENCY = 3` eliminates burst failures during demos without meaningfully slowing down a typical meeting file.

### Why Pinecone instead of a local vector store?
Pinecone handles the embedding dimension, index management, and pagination concerns that would require boilerplate with a local store like Chroma or FAISS. For a 14-day sprint, this is the right abstraction.

---

## Tradeoffs & What I Would Improve With More Time

| Area | Current MVP | With More Time |
|---|---|---|
| **Persistence** | In-memory session (lost on refresh) | PostgreSQL via Supabase for meeting history |
| **Sentiment** | Keyword heuristic | LLM-based vibe classification per window |
| **RAG isolation** | Pinecone metadata filter by meeting_id | Stricter namespace separation + chunk deduplication |
| **Export** | CSV, JSON, Markdown | PDF via `weasyprint` or `reportlab` |
| **Auth** | None | NextAuth.js with org-level meeting namespacing |
| **Multi-meeting** | Single session | Cross-meeting RAG with meeting selector |
| **Extraction quality** | Chunk-level extraction | Full-transcript consolidation pass to merge duplicates |

---

## Risks Encountered

- **Free-tier rate limits** on Groq and Gemini during long transcripts — mitigated via concurrency limiting and fallback chains
- **Windows EPERM error** with Next.js Turbopack's file watcher — mitigated via `npx next dev` workaround (documented in README)
- **768-dim Pinecone constraint** — Gemini embeddings default to larger dimensions; fixed via `ReducedDimensionEmbeddings` wrapper with `output_dimensionality=768`

---

## Success Criteria (All Met)

- ✅ Upload a realistic meeting transcript
- ✅ See action items and decisions extracted automatically with LLM
- ✅ Ask a cited question and get a grounded answer with timestamps
- ✅ Inspect a sentiment timeline and per-speaker tone summary
- ✅ Export the output in CSV, JSON, or Markdown
