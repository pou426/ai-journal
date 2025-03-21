from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import date
from typing import List, Optional
import uuid
import traceback
from dotenv import load_dotenv

# Import models and services
from models import Snippet, Journal, SnippetResponse, JournalResponse
from services import snippets_service, journals_service

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Snippets endpoints
@app.post("/snippets", response_model=SnippetResponse)
async def create_snippet(snippet: Snippet):
    return await snippets_service.create_snippet(snippet.user_id, snippet.entry)

@app.get("/snippets/{user_id}", response_model=List[SnippetResponse])
async def get_snippets(user_id: uuid.UUID):
    return await snippets_service.get_snippets(user_id)

# Journals endpoints
@app.post("/journals", response_model=JournalResponse)
async def create_or_update_journal(journal: Journal):
    return await journals_service.create_or_update_journal(journal.user_id, journal.date, journal.entry)

@app.get("/journals/{user_id}/{date}", response_model=Optional[JournalResponse])
async def get_journal(user_id: uuid.UUID, date: date):
    return await journals_service.get_journal(user_id, date)

@app.get("/journals/{user_id}", response_model=List[JournalResponse])
async def get_journals(user_id: uuid.UUID):
    return await journals_service.get_journals(user_id)

@app.post("/snippets/with-summary", response_model=JournalResponse)
async def create_snippet_with_summary(snippet: Snippet):
    try:
        # Create the snippet
        await snippets_service.create_snippet(snippet.user_id, snippet.entry)
        
        # Generate journal from snippets
        return await journals_service.create_journal_from_snippets(snippet.user_id)
    except Exception as e:
        print(f"Error in create_snippet_with_summary: {str(e)}")
        print(f"Error type: {type(e)}")
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Welcome to the API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)