from datetime import datetime
import uuid
from fastapi import HTTPException
from typing import List, Dict, Any

from .db_service import get_client

async def create_snippet(user_id: uuid.UUID, entry: str) -> Dict[str, Any]:
    """
    Create a new snippet in the database.
    
    Args:
        user_id: The user's UUID
        entry: The snippet text
        
    Returns:
        The created snippet data
    """
    try:
        data = {
            "user_id": str(user_id),  # Convert UUID to string
            "entry": entry,
            "created_at": datetime.utcnow().isoformat()
        }
        result = get_client().table("snippets").insert(data).execute()
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def get_snippets(user_id: uuid.UUID) -> List[Dict[str, Any]]:
    """
    Get all snippets for a user.
    
    Args:
        user_id: The user's UUID
        
    Returns:
        A list of snippets
    """
    try:
        result = get_client().table("snippets").select("*").eq("user_id", str(user_id)).order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
async def get_todays_snippets(user_id: uuid.UUID) -> List[Dict[str, Any]]:
    """
    Get all snippets for a user created today.
    
    Args:
        user_id: The user's UUID
        
    Returns:
        A list of today's snippets
    """
    try:
        today = datetime.utcnow().date()
        result = get_client().table("snippets").select("*").eq("user_id", str(user_id)).gte("created_at", today.isoformat()).order("created_at").execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 