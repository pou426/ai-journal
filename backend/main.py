from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List
import json
import random
import google.generativeai as genai
from sample_data import MORNING_ACTIVITIES, AFTERNOON_ACTIVITIES, EVENING_ACTIVITIES
import os
from dotenv import load_dotenv
from pathlib import Path

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

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-pro')

# Data model
class JournalEntry(BaseModel):
    content: str
    date: str

# Add these constants near the top
DATA_DIR = Path("data")
ENTRIES_FILE = DATA_DIR / "entries.json"

# Add these storage functions
def initialize_storage():
    DATA_DIR.mkdir(exist_ok=True)
    if not ENTRIES_FILE.exists():
        ENTRIES_FILE.write_text("[]")

def load_entries():
    try:
        return json.loads(ENTRIES_FILE.read_text())
    except:
        return []

def save_entries(entries):
    ENTRIES_FILE.write_text(json.dumps(entries, indent=2))

# Update initialize_sample_entries
async def initialize_sample_entries():
    # Only initialize if no entries exist
    entries = load_entries()
    if not entries:
        today = datetime.now()
        for i in range(10):  # Generate entries for the past 10 days
            entry_date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
            
            # Make the entry from 3 days ago extra long
            if i == 3:
                entry_content = generate_long_day_snippets(entry_date)
            else:
                entry_content = generate_day_snippets(entry_date)
                
            entries.append({
                "content": json.dumps(entry_content),
                "date": f"{entry_date}T00:00:00.000Z"
            })
        
        save_entries(entries)

# Update the API endpoints to use file storage
@app.get("/entries", response_model=List[JournalEntry])
async def get_entries():
    return load_entries()

@app.get("/entries/{date}")
async def get_entry(date: str):
    entries = load_entries()
    entry = next((entry for entry in entries if entry["date"].startswith(date)), None)
    if not entry:
        return {"content": "", "date": date}
    return entry

@app.put("/entries/{date}")
async def update_entry(date: str, entry: JournalEntry):
    try:
        entries = load_entries()
        content_data = json.loads(entry.content)
        
        # If there are snippets and no aiSummary, generate one
        if 'snippets' in content_data and ('aiSummary' not in content_data or not content_data['aiSummary']):
            ai_summary = await generate_ai_summary(content_data['snippets'])
            content_data['aiSummary'] = ai_summary
            entry.content = json.dumps(content_data)

        # Find and update existing entry
        entry_updated = False
        for i, existing_entry in enumerate(entries):
            if existing_entry["date"].startswith(date):
                entries[i] = entry.dict()
                entry_updated = True
                break
        
        # If no existing entry, append new one
        if not entry_updated:
            entries.append(entry.dict())
        
        # Save the updated entries
        save_entries(entries)
        return {"message": "Entry updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.on_event("startup")
async def startup_event():
    initialize_storage()
    await initialize_sample_entries()

def generate_day_snippets(date_str):
    date = datetime.strptime(date_str, "%Y-%m-%d")
    
    # Generate 2-4 snippets per time period
    morning_count = random.randint(1, 2)
    afternoon_count = random.randint(1, 2)
    evening_count = random.randint(1, 2)
    
    snippets = []
    
    # Morning snippets (7 AM - 11 AM)
    for i in range(morning_count):
        hour = random.randint(7, 11)
        minute = random.randint(0, 59)
        timestamp = date.replace(hour=hour, minute=minute).isoformat()
        snippets.append({
            "id": f"{date_str}-morning-{i}",
            "text": random.choice(MORNING_ACTIVITIES),
            "timestamp": timestamp
        })
    
    # Afternoon snippets (12 PM - 5 PM)
    for i in range(afternoon_count):
        hour = random.randint(12, 17)
        minute = random.randint(0, 59)
        timestamp = date.replace(hour=hour, minute=minute).isoformat()
        snippets.append({
            "id": f"{date_str}-afternoon-{i}",
            "text": random.choice(AFTERNOON_ACTIVITIES),
            "timestamp": timestamp
        })
    
    # Evening snippets (6 PM - 10 PM)
    for i in range(evening_count):
        hour = random.randint(18, 22)
        minute = random.randint(0, 59)
        timestamp = date.replace(hour=hour, minute=minute).isoformat()
        snippets.append({
            "id": f"{date_str}-evening-{i}",
            "text": random.choice(EVENING_ACTIVITIES),
            "timestamp": timestamp
        })
    
    # Sort snippets by timestamp
    snippets.sort(key=lambda x: x["timestamp"])
    
    # For sample data, just concatenate the snippets
    summary = "Today was a mix of activities. " + " ".join([s["text"] for s in snippets])
    
    return {
        "snippets": snippets,
        "aiSummary": summary
    }

def generate_long_day_snippets(date_str):
    """Generate a longer day with more snippets for testing."""
    date = datetime.strptime(date_str, "%Y-%m-%d")
    
    snippets = []
    
    # Morning snippets (7 AM - 11 AM)
    for i in range(7):
        hour = random.randint(7, 11)
        minute = random.randint(0, 59)
        timestamp = date.replace(hour=hour, minute=minute).isoformat()
        snippets.append({
            "id": f"{date_str}-morning-{i}",
            "text": MORNING_ACTIVITIES[i % len(MORNING_ACTIVITIES)],
            "timestamp": timestamp
        })
    
    # Afternoon snippets (12 PM - 5 PM)
    for i in range(7):
        hour = random.randint(12, 17)
        minute = random.randint(0, 59)
        timestamp = date.replace(hour=hour, minute=minute).isoformat()
        snippets.append({
            "id": f"{date_str}-afternoon-{i}",
            "text": AFTERNOON_ACTIVITIES[i % len(AFTERNOON_ACTIVITIES)],
            "timestamp": timestamp
        })
    
    # Evening snippets (6 PM - 10 PM)
    for i in range(6):
        hour = random.randint(18, 22)
        minute = random.randint(0, 59)
        timestamp = date.replace(hour=hour, minute=minute).isoformat()
        snippets.append({
            "id": f"{date_str}-evening-{i}",
            "text": EVENING_ACTIVITIES[i % len(EVENING_ACTIVITIES)],
            "timestamp": timestamp
        })
    
    # Sort snippets by timestamp
    snippets.sort(key=lambda x: x["timestamp"])
    
    # For sample data, create a more detailed concatenated summary
    summary = """Today was a packed day filled with various activities. """ + " ".join([s["text"] for s in snippets])
    
    return {
        "snippets": snippets,
        "aiSummary": summary
    }

async def generate_ai_summary(snippets):
    try:
        # Sort snippets by timestamp
        sorted_snippets = sorted(snippets, key=lambda x: x['timestamp'])
        
        # Create the prompt with all snippets
        snippets_text = '\n\n'.join([s['text'] for s in sorted_snippets])
        prompt = f"Write a personal journal entry that synthesizes these moments from my day. Write in first person and start directly with the content. Do not include any introductory text, meta-commentary, or explanations:\n\n{snippets_text}"

        # Generate content using Gemini
        response = await model.generate_content(prompt)
        return response.text

    except Exception as e:
        print(f"Error generating AI summary: {e}")
        # Fallback to concatenated snippets if AI fails
        return '\n\n'.join([s['text'] for s in sorted_snippets])

@app.get("/")
async def root():
    return {"message": "Welcome to the API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 