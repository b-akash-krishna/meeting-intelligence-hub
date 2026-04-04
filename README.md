# Meeting Intelligence Hub

> cymonic-internship-ai-sprint-2026

The Meeting Intelligence Hub is an AI-powered system that ingests multiple meeting transcripts and transforms them into actionable intelligence by extracting decisions, action items, sentiment insights, and enabling contextual querying across meetings using Retrieval-Augmented Generation (RAG).

## Architecture
- **Frontend**: Next.js (React), Tailwind CSS
- **Backend**: FastAPI (Python), Uvicorn
- **LLM Orchestration**: LangChain, OpenAI (`gpt-4o-mini`, `gpt-4o`)
- **Vector Database**: Pinecone
- **Storage Database**: Supabase (PostgreSQL)

## Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Poetry or Python `venv`
- API Keys: `OPENAI_API_KEY`, `PINECONE_API_KEY`, `SUPABASE_URL`, `SUPABASE_KEY`

## Setup Instructions

### 1. Backend Setup (FastAPI)
The backend is a fast, asynchronous Python API.

```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
OPENAI_API_KEY=your_key_here
PINECONE_API_KEY=your_key_here
PINECONE_INDEX_NAME=meeting-intelligence
SUPABASE_URL=your_db_url
SUPABASE_KEY=your_db_key
```

Run the backend:
```bash
uvicorn main:app --reload --port 8000
```
API Documentation will be available at: http://localhost:8000/docs

### 2. Frontend Setup (Next.js)
The frontend uses the React App Router for fast rendering and dynamic routing.

```bash
cd frontend
npm install
npm run dev
```
The application will be accessible at: http://localhost:3000

## Data Flow Pipeline
1. **Upload**: Users upload `.txt` or `.vtt` meeting transcripts.
2. **Preprocessing**: The FastAPI backend parses the file into a structural schema with timestamps.
3. **Extraction Route**: Utilizing LangChain and `gpt-4o-mini` with JSON Structured Outputs, the system extracts decisions and assigned action items reliably.
4. **Embedding Route**: Semantic chunk splits are embedded and upserted into Pinecone Vector DB.
5. **Chat Interface**: Cross-meeting logic queries the Vector space and constructs heavily cited LLM responses answering natural language queries.

## Evaluation Focus
This codebase focuses explicitly on:
- **Modularity:** Separation of concerns between Data Models, UI Components, Prompts, and API Routes.
- **Robustness:** Gracefully handling complex, unstructured or messy transcripts.
- **Accuracy:** Zeroing hallucination possibilities through strict RAG Prompting & Source Citation logic.
