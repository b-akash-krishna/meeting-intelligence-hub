# Meeting Intelligence Hub Design Document

## Objective
Meeting Intelligence Hub converts raw meeting transcripts into useful team memory. The MVP focuses on four practical outcomes:
- extract action items
- extract decisions
- let users ask cited questions over uploaded meetings
- show lightweight sentiment and speaker tone signals

## Problem
Meeting transcripts are long, noisy, and rarely revisited. Teams need a fast way to answer:
- What was decided?
- Who owns what?
- What was the tone of the discussion?
- Where in the meeting did a claim come from?

## MVP Architecture
### Frontend
- Next.js dashboard
- Drag-and-drop upload
- Insights tables for actions and decisions
- Sentiment timeline and speaker summary
- Chat drawer for cited questions
- CSV export for extracted results

### Backend
- FastAPI service
- Transcript parsing for `.txt` and `.vtt`
- LLM extraction pipeline for action items and decisions
- Pinecone-backed retrieval for chat
- Heuristic sentiment analysis for timeline and speaker summary

### External Services
- Groq: primary chat and structured extraction
- Gemini: fallback chat plus embeddings
- Pinecone: vector index for transcript retrieval

## Data Flow
1. User uploads a transcript from the frontend.
2. FastAPI parses the file into timestamped chunks.
3. Chunks are sent through the extraction pipeline.
4. Chunks are embedded and stored in Pinecone.
5. Sentiment windows and speaker summaries are derived from the parsed chunks.
6. The backend returns a combined insight payload to the frontend.
7. The user can ask questions, and the backend retrieves relevant chunks from Pinecone before generating a cited answer.

## Key Design Choices
### FastAPI + Next.js
This combination gives a cleaner MVP than a notebook or Streamlit-style stack. FastAPI is a good fit for async API calls and Next.js gives a stronger presentation layer for the internship rubric.

### LLM Extraction + Heuristic Sentiment
Actions and decisions benefit from LLM reasoning, so they use structured extraction. Sentiment is implemented heuristically in the MVP to avoid extra cost, reduce latency, and keep the system reliable enough for demos.

### Pinecone for Meeting Memory
Vector retrieval makes the chat feature practical across uploaded transcripts. It also allows citations to be grounded in the original chunk text.

### Rate-Limited Extraction
Long transcripts can easily hit free-tier rate limits. The extraction pipeline was intentionally throttled to reduce burst failures during realistic uploads.

## Current MVP Scope
### Included
- `.txt` and `.vtt` transcript support
- action item extraction
- decision extraction
- cited chat
- meeting vibe timeline
- per-speaker tone summary
- CSV export

### Deferred
- PDF export
- persistent relational storage for meetings and insights
- stronger meeting/session isolation in retrieval
- better deduplication of similar retrieval chunks
- model-based sentiment classification
- polished admin/demo workflows

## Tradeoffs
### Why not persist everything in Postgres yet?
The MVP optimizes for working AI flows first. Postgres-backed meeting history is valuable, but not required to demonstrate the core intelligence loop.

### Why heuristic sentiment instead of another model pass?
The main risk during the sprint is system instability under API quotas. A heuristic approach is cheaper, simpler, and sufficient for an MVP dashboard.

### Why not batch all extraction into one giant prompt?
Chunk-level extraction keeps citations easier to trace and reduces failure impact when one LLM call fails.

## Risks
- Groq and Gemini free-tier limits can affect long transcripts
- retrieval can surface duplicate or overly similar chunks
- extraction quality is acceptable for MVP but still needs normalization
- Pinecone index configuration must stay compatible with the configured embedding dimension

## Success Criteria
The MVP is successful if a reviewer can:
- upload a realistic meeting transcript
- see action items and decisions extracted automatically
- ask a meeting question and get a cited answer
- inspect a sentiment summary and speaker overview
- export the output in a simple format

## Next Steps
- improve extraction quality and deduplication
- add PDF export
- add better index hygiene and meeting scoping
- produce a short demo walkthrough using the sample meeting files
