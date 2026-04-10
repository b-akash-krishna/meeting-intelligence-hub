# Meeting Intelligence Hub

> AI-powered meeting memory — upload transcripts to extract action items, decisions, sentiment analysis, and get cited answers via RAG chat.

**Built for the Cymonic 14-Day AI Sprint | All 5 phases complete.**

---

## Features

| Feature | Status |
|---|---|
| Transcript upload (.vtt / .txt) with drag-and-drop | ✅ |
| Action item extraction (assignee, task, deadline, quote) | ✅ |
| Decision extraction with reasoning context | ✅ |
| Semantic RAG chat with timestamp citations | ✅ |
| Speaker sentiment timeline & vibe analysis | ✅ |
| CSV, JSON, and Markdown export | ✅ |
| Premium dark-mode Next.js UI | ✅ |

---

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, TypeScript
- **Backend:** FastAPI, Uvicorn, Pydantic v2
- **LLMs:** LangChain — Groq `llama-3.1-8b-instant` (primary) + Gemini `gemini-2.5-flash` (fallback)
- **Embeddings:** Gemini `gemini-embedding-001` (768-dim)
- **Vector Store:** Pinecone
- **Transcript formats:** `.txt`, `.vtt`

---

## Prerequisites

- Python 3.12+
- Node.js 18+
- A Pinecone account with an index configured for **768-dimensional** embeddings
- API keys for:
  - **Google Gemini** (embeddings + fallback chat)
  - **Groq** (primary chat & extraction)
  - **Pinecone** (vector retrieval)

---

## Backend Setup

```bash
# From the project root
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Configure environment variables

```bash
# Copy the example file
copy .env.example .env   # Windows
cp .env.example .env     # macOS/Linux
```

Fill in your `.env`:
```env
GOOGLE_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=meeting-hub
```

> ⚠️ The Pinecone index **must** be configured for **768 dimensions** to match the Gemini embedding model.

### Run the API

```bash
uvicorn main:app --reload --port 8000
```

- Swagger UI: http://localhost:8000/docs
- Health check: http://localhost:8000/health

---

## Frontend Setup

```bash
cd frontend
npm install
npx next dev --port 3000
```

App: http://localhost:3000

> **Note (Windows):** If `npm run dev` returns an EPERM error, use `npx next dev --port 3000` instead. This is a Windows Turbopack file-watcher permission issue.

---

## Project Structure

```
meeting-intelligence-hub/
  backend/
    api/             # FastAPI route handlers (upload.py, chat.py)
    models/          # Pydantic schemas
    services/        # llm_extractor.py, sentiment_analyzer.py, vector_db.py
    utils/           # VTT + TXT parsers
    main.py          # FastAPI app entry point
    requirements.txt
    .env.example
  frontend/
    src/
      app/           # Next.js pages (Overview, Actions, Decisions, Sentiment, Exports)
      components/    # React components
      lib/           # meeting-session hook, briefing utilities
      types/         # TypeScript types
  DESIGN_DOCUMENT.md
  README.md
  test_transcript.txt       # Small test file for parser verification
  test_real_meeting.vtt     # Realistic VTT meeting transcript for full demo
```

---

## Sample Test Files

| File | Purpose |
|---|---|
| `test_transcript.txt` | Quick parser/extraction sanity check |
| `test_real_meeting.vtt` | Full end-to-end demo with realistic meeting content |

---

## Lightweight Verification

```bash
# From project root (with venv activated)
python test_parser.py   # Parser sanity check
python test_llm.py      # Action + decision extraction
python test_rag.py      # Pinecone upsert + cited chat
```

Frontend lint:
```bash
cd frontend && npm run lint
```

---

## End-to-End Demo Steps

1. **Upload** — Drag `test_real_meeting.vtt` into the upload zone
2. **Actions** — Navigate to `/actions` to see extracted tasks with owners & deadlines
3. **Decisions** — Navigate to `/decisions` to see finalized choices with rationale
4. **Sentiment** — Navigate to `/sentiment` to see the meeting mood timeline
5. **Chat** — Click "Ask Assistant" → ask *"What were the key blockers?"*
6. **Export** — Navigate to `/exports` → download CSV or Markdown briefing

---

## Known Limitations

- Long meetings can hit Groq/Gemini free-tier rate limits
- Sentiment analysis is keyword-heuristic, not a dedicated classifier (by design — reduces cost & latency)
- Session data is in-memory; a page refresh resets the session (no persistent DB in this MVP)
- CSV export is implemented; PDF export is deferred to post-MVP
- Cross-meeting Pinecone isolation can be improved with stricter metadata filtering

---

## Important Runtime Notes

- If your machine has broken proxy env vars (`HTTP_PROXY=http://127.0.0.1:9`), the backend auto-clears them during startup
- Pinecone index must be **768-dimensional** (the Gemini embedding model produces 768-dim vectors)
- The extraction pipeline is rate-limited (`MAX_EXTRACTION_CONCURRENCY = 3`) to prevent quota bursts
