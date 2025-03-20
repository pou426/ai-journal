from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta, date
from typing import List, Optional
import json
import random
import google.generativeai as genai
import os
from dotenv import load_dotenv
from pathlib import Path
from supabase import create_client, Client
import uuid

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are not set")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# Data models
class Snippet(BaseModel):
    entry: str
    user_id: uuid.UUID

class Journal(BaseModel):
    entry: str
    date: date
    user_id: uuid.UUID

class SnippetResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    entry: str

class JournalResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    date: date
    entry: str

# Snippets endpoints
@app.post("/snippets", response_model=SnippetResponse)
async def create_snippet(snippet: Snippet):
    try:
        data = {
            "user_id": str(snippet.user_id),  # Convert UUID to string
            "entry": snippet.entry,
            "created_at": datetime.utcnow().isoformat()
        }
        result = supabase.table("snippets").insert(data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/snippets/{user_id}", response_model=List[SnippetResponse])
async def get_snippets(user_id: uuid.UUID):
    try:
        result = supabase.table("snippets").select("*").eq("user_id", str(user_id)).order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Journals endpoints
@app.post("/journals", response_model=JournalResponse)
async def create_or_update_journal(journal: Journal):
    try:
        # Check if a journal entry exists for this date
        existing = supabase.table("journals").select("*").eq("user_id", str(journal.user_id)).eq("date", journal.date.isoformat()).execute()
        
        if existing.data:
            # Update existing journal
            result = supabase.table("journals").update({
                "entry": journal.entry
            }).eq("id", existing.data[0]["id"]).execute()
        else:
            # Create new journal
            data = {
                "user_id": str(journal.user_id),  # Convert UUID to string
                "date": journal.date.isoformat(),
                "entry": journal.entry
            }
            result = supabase.table("journals").insert(data).execute()
        
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/journals/{user_id}/{date}", response_model=Optional[JournalResponse])
async def get_journal(user_id: uuid.UUID, date: date):
    try:
        result = supabase.table("journals").select("*").eq("user_id", str(user_id)).eq("date", date.isoformat()).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/journals/{user_id}", response_model=List[JournalResponse])
async def get_journals(user_id: uuid.UUID):
    try:
        result = supabase.table("journals").select("*").eq("user_id", str(user_id)).order("date", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/snippets/with-summary", response_model=JournalResponse)
async def create_snippet_with_summary(snippet: Snippet):
    try:
        print(f"Creating snippet for user {snippet.user_id}")
        # 1. Create the snippet
        snippet_data = {
            "user_id": str(snippet.user_id),  # Convert UUID to string
            "entry": snippet.entry,
            "created_at": datetime.utcnow().isoformat()
        }
        print("Snippet data:", snippet_data)
        snippet_result = supabase.table("snippets").insert(snippet_data).execute()
        print("Snippet created:", snippet_result.data)
        
        # 2. Get all snippets for today
        today = datetime.utcnow().date()
        print(f"Fetching snippets for user {snippet.user_id} on {today}")
        snippets_result = supabase.table("snippets").select("*").eq("user_id", str(snippet.user_id)).gte("created_at", today.isoformat()).order("created_at").execute()
        print("Fetched snippets:", snippets_result.data)
        
        # Only generate summary and create journal if there are snippets
        if snippets_result.data:
            # 3. Generate AI summary using Gemini
            snippets_text = '\n\n'.join([s['entry'] for s in snippets_result.data])
            prompt = f"Write a personal journal entry that synthesizes these moments from my day. Write in first person and start directly with the content. Do not include any introductory text, meta-commentary, or explanations:\n\n{snippets_text}"
            print("Generating AI summary with prompt:", prompt)
            
            response = model.generate_content(prompt)
            ai_summary = response.text
            print("Generated AI summary:", ai_summary)
            
            # 4. Create or update the journal entry
            journal_data = {
                "user_id": str(snippet.user_id),  # Convert UUID to string
                "date": today.isoformat(),
                "entry": ai_summary
            }
            print("Journal data:", journal_data)
            
            # Check if journal exists for today
            existing = supabase.table("journals").select("*").eq("user_id", str(snippet.user_id)).eq("date", today.isoformat()).execute()
            print("Existing journal:", existing.data)
            
            if existing.data:
                # Update existing journal
                journal_result = supabase.table("journals").update({
                    "entry": ai_summary
                }).eq("id", existing.data[0]["id"]).execute()
            else:
                # Create new journal
                journal_result = supabase.table("journals").insert(journal_data).execute()
            
            print("Final journal result:", journal_result.data)
            return journal_result.data[0]
        else:
            # If no snippets, return None or raise an error
            raise HTTPException(status_code=400, detail="No snippets found for today")
            
    except Exception as e:
        print(f"Error in create_snippet_with_summary: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Welcome to the API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 