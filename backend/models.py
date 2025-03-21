from pydantic import BaseModel
from datetime import datetime, date
from typing import List, Optional
import uuid

# Request models
class Snippet(BaseModel):
    entry: str
    user_id: uuid.UUID

class Journal(BaseModel):
    entry: str
    date: date
    user_id: uuid.UUID

# Response models
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