from datetime import date
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from models import Snippet, Journal, SnippetResponse, JournalResponse
from services import snippets_service, journals_service
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from typing import List, Optional
import os
import traceback
import uuid

# Import configuration
from config import GEMINI_RATE_LIMIT_PER_USER, GEMINI_GLOBAL_RATE_LIMIT

# Create a limiter instance and configure it to use IP address as the key
limiter = Limiter(key_func=get_remote_address)

# Create FastAPI app with the limiter
app = FastAPI(title="Journal API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add the SlowAPI middleware
app.add_middleware(SlowAPIMiddleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get a user-specific key for rate limiting
def get_user_key(request: Request):
    # Try to get the user ID from the request body for POST requests
    try:
        # For async endpoints with await request.json(), we need a custom solution
        # We'll access the already parsed body data stored in the dependency
        if hasattr(request.state, 'snippet') and hasattr(request.state.snippet, 'user_id'):
            return f"user:{request.state.snippet.user_id}"
    except:
        pass
    
    # Extract user_id from path parameter for GET requests
    try:
        if 'user_id' in request.path_params:
            return f"user:{request.path_params['user_id']}"
    except:
        pass
    
    # Fallback to IP address if user_id is not available
    return get_remote_address(request)

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
    try:
        return await journals_service.create_or_update_journal(journal.user_id, journal.date, journal.entry, journal.sentiment_score)
    except Exception as e:
        print(f"Error in create_or_update_journal endpoint: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/journals/{user_id}/{date}", response_model=Optional[JournalResponse])
async def get_journal(user_id: uuid.UUID, date: date):
    try:
        return await journals_service.get_journal(user_id, date)
    except Exception as e:
        print(f"Error in get_journal endpoint: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/journals/{user_id}", response_model=List[JournalResponse])
async def get_journals(user_id: uuid.UUID):
    try:
        return await journals_service.get_journals(user_id)
    except Exception as e:
        print(f"Error in get_journals endpoint: {str(e)}")
        import traceback
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

# Rate limited endpoint for Gemini API
# We need to store the snippet before the rate limiter dependency processes the request
async def create_snippet_with_summary_dependency(request: Request, snippet: Snippet):
    request.state.snippet = snippet
    return snippet

@app.post("/snippets/with-summary", response_model=JournalResponse)
@limiter.limit(GEMINI_RATE_LIMIT_PER_USER, key_func=get_user_key)
@limiter.limit(GEMINI_GLOBAL_RATE_LIMIT)
async def create_snippet_with_summary(
    request: Request,
    snippet: Snippet = Depends(create_snippet_with_summary_dependency)
):
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
    uvicorn.run(app, host="0.0.0.0", port=8000, timeout_keep_alive=120)