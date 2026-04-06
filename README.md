# Meeting Intelligence Hub

AI-powered meeting memory for transcript upload, action-item extraction, decision tracking, meeting sentiment, and cited chat over indexed transcript chunks.

## MVP Status
- Phase 2 complete: transcript upload and `.txt` / `.vtt` parsing
- Phase 3 complete: action item and decision extraction dashboard
- Phase 4 complete as MVP: semantic indexing plus cited chat over uploaded meetings
- Phase 5 complete as MVP: heuristic sentiment timeline, speaker tone summary, and CSV export
- Phase 6 in progress: packaging, documentation, testing, and presentation polish

## Stack
- Frontend: Next.js 16, React 19, Tailwind CSS
- Backend: FastAPI, Uvicorn, Pydantic
- LLM layer: LangChain with Groq and Gemini
- Vector store: Pinecone
- Transcript formats: `.txt`, `.vtt`

## Current Features
- Upload raw transcript files from the web UI
- Parse speaker-tagged `.vtt` files and plain-text meeting notes
- Extract action items with assignee, task, deadline, and quote
- Extract decisions with reasoning context
- Index transcript chunks into Pinecone for retrieval
- Ask cited questions against uploaded meeting content
- Show overall meeting vibe, timeline windows, and per-speaker tone summary
- Export meeting insights as CSV from the dashboard

## Project Layout
```text
meeting-intelligence-hub/
  backend/
    api/
    models/
    services/
    utils/
    .env.example
    main.py
    requirements.txt
  frontend/
    src/
    package.json
  test_parser.py
  test_llm.py
  test_rag.py
  test_transcript.txt
  test_real_meeting.vtt
```

## Requirements
- Python 3.12 recommended
- Node.js 18+
- A Pinecone index named to match `PINECONE_INDEX_NAME`
- API keys for:
  - Google Gemini embeddings / fallback chat
  - Groq chat completions
  - Pinecone

## Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Copy the example env file and fill in your keys:
```bash
copy .env.example .env
```

Expected env file:
```env
GOOGLE_API_KEY=your_google_api_key
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=meeting-hub
```

Run the API:
```bash
uvicorn main:app --reload --port 8000
```

Backend docs:
- Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend app:
- `http://localhost:3000`

## Sample Files
- [test_transcript.txt](./test_transcript.txt): tiny parser/extraction sample
- [test_real_meeting.vtt](./test_real_meeting.vtt): longer realistic meeting transcript with noise

## Lightweight Verification
From the repo root:

```bash
python test_parser.py
python test_llm.py
python test_rag.py
```

What these cover:
- `test_parser.py`: parser sanity check
- `test_llm.py`: action item and decision extraction
- `test_rag.py`: Pinecone upsert plus cited chat retrieval

Frontend verification:
```bash
cd frontend
npm run lint
```

## Known Limitations
- Long meetings can still hit Groq or Gemini free-tier rate limits
- Chat retrieval may return duplicate source chunks unless the index is cleaned between tests
- Sentiment analysis is currently heuristic, not a dedicated classifier
- CSV export is implemented, but PDF export is not yet part of the MVP
- Cross-meeting memory is functional, but meeting/session isolation can still be improved

## Important Runtime Notes
- If your machine has broken proxy variables like `HTTP_PROXY=http://127.0.0.1:9`, the backend now clears those during LLM and embedding setup
- The Pinecone index used by this project is expected to be compatible with 768-dimensional embeddings
- The current extraction pipeline is rate-limited to reduce quota spikes on realistic transcripts

## Next Work
- Improve extraction quality and normalization
- Deduplicate retrieval sources before answer generation
- Add stronger meeting isolation in Pinecone
- Add PDF export
- Record the final walkthrough and design document
