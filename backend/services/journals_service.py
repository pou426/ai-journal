from datetime import datetime, date
import uuid
from fastapi import HTTPException
from typing import List, Dict, Any, Optional, Tuple
import traceback

from .db_service import get_client
from .ai_service import generate_journal_from_snippets
from .snippets_service import get_todays_snippets

async def create_or_update_journal(user_id: uuid.UUID, journal_date: date, entry: str, sentiment_score: Optional[float] = None) -> Dict[str, Any]:
    """
    Create or update a journal entry for a specific date.
    
    Args:
        user_id: The user's UUID
        journal_date: The date of the journal entry
        entry: The journal entry text
        sentiment_score: Optional sentiment score from -1 to 1
        
    Returns:
        The created or updated journal data
    """
    try:
        # Check if a journal entry exists for this date
        existing = get_client().table("journals").select("*").eq("user_id", str(user_id)).eq("date", journal_date.isoformat()).execute()
        
        journal_data = {
            "entry": entry
        }
        
        # Add sentiment score if provided
        if sentiment_score is not None:
            journal_data["sentiment_score"] = sentiment_score
        
        if existing.data:
            # Update existing journal
            result = get_client().table("journals").update(journal_data).eq("id", existing.data[0]["id"]).execute()
        else:
            # Create new journal
            journal_data.update({
                "user_id": str(user_id),  # Convert UUID to string
                "date": journal_date.isoformat()
            })
            result = get_client().table("journals").insert(journal_data).execute()
        
        return result.data[0]
    except Exception as e:
        print(f"Error in create_or_update_journal: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

async def get_journal(user_id: uuid.UUID, journal_date: date) -> Optional[Dict[str, Any]]:
    """
    Get a journal entry for a specific date.
    
    Args:
        user_id: The user's UUID
        journal_date: The date of the journal entry
        
    Returns:
        The journal data or None if not found
    """
    try:
        result = get_client().table("journals").select("*").eq("user_id", str(user_id)).eq("date", journal_date.isoformat()).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        print(f"Error in get_journal: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

async def get_journals(user_id: uuid.UUID) -> List[Dict[str, Any]]:
    """
    Get all journal entries for a user.
    
    Args:
        user_id: The user's UUID
        
    Returns:
        A list of journal entries
    """
    try:
        result = get_client().table("journals").select("*").eq("user_id", str(user_id)).order("date", desc=True).execute()
        return result.data
    except Exception as e:
        print(f"Error in get_journals: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

async def create_journal_from_snippets(user_id: uuid.UUID) -> Dict[str, Any]:
    """
    Create a journal entry from today's snippets.
    
    Args:
        user_id: The user's UUID
        
    Returns:
        The created journal data
    """
    try:
        # Get all snippets for today
        snippets = await get_todays_snippets(user_id)
        
        # Only generate summary and create journal if there are snippets
        if not snippets:
            raise HTTPException(status_code=400, detail="No snippets found for today")
            
        # Generate AI summary using Gemini
        snippets_text = '\n\n'.join([s['entry'] for s in snippets])
        
        try:
            journal_text, sentiment_score = generate_journal_from_snippets(snippets_text)
        except Exception as e:
            print(f"Error generating journal with sentiment: {str(e)}")
            print(traceback.format_exc())
            # Fallback to a simple concatenation of snippets if AI generation fails
            journal_text = ' '.join([s['entry'] for s in snippets])
            sentiment_score = 0.0
        
        # Create or update the journal entry
        today = datetime.utcnow().date()
        return await create_or_update_journal(user_id, today, journal_text, sentiment_score)
    except Exception as e:
        print(f"Error in create_journal_from_snippets: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e)) 