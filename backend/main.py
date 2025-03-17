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
    
    # Generate AI summary
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
    
    # Generate a more detailed AI summary
    summary = """Today was a packed day filled with various activities and accomplishments. 
The morning started early with physical activity and self-care routines, followed by productive work sessions and team interactions. 
The afternoon was particularly busy with meetings and project work, but I managed to maintain focus and make significant progress. 
Despite the heavy workload, I took short breaks to stay refreshed and maintain productivity.
The evening wound down nicely with a mix of personal activities and home tasks, helping create a good work-life balance.

Overall, it was a well-balanced day with good productivity and personal time management. The variety of activities helped keep the energy levels up throughout the day."""

    return {
        "snippets": snippets,
        "aiSummary": summary
    }

# Initialize with sample entries
journal_entries = []

def initialize_sample_entries():
    today = datetime.now()
    for i in range(10):  # Generate entries for the past 10 days
        entry_date = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        
        # Make the entry from 3 days ago extra long
        if i == 3:
            entry_content = generate_long_day_snippets(entry_date)
        else:
            entry_content = generate_day_snippets(entry_date)
            
        journal_entries.append({
            "content": json.dumps(entry_content),
            "date": f"{entry_date}T00:00:00.000Z"
        })

# Initialize sample entries when the server starts
initialize_sample_entries()

@app.get("/entries", response_model=List[JournalEntry])
async def get_entries():
    return journal_entries

@app.post("/entries")
async def create_entry(entry: JournalEntry):
    journal_entries.append(entry.dict())
    return {"message": "Entry created successfully"}

@app.get("/entries/{date}")
async def get_entry(date: str):
    entry = next((entry for entry in journal_entries if entry["date"].startswith(date)), None)
    if not entry:
        return {"content": "", "date": date}
    return entry

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

@app.put("/entries/{date}")
async def update_entry(date: str, entry: JournalEntry):
    try:
        content_data = json.loads(entry.content)
        if 'snippets' in content_data:
            # Generate AI summary for the snippets
            ai_summary = await generate_ai_summary(content_data['snippets'])
            content_data['aiSummary'] = ai_summary
            entry.content = json.dumps(content_data)

        # Find and update existing entry for the date
        for i, existing_entry in enumerate(journal_entries):
            if existing_entry["date"].startswith(date):
                journal_entries[i] = entry.dict()
                return {"message": "Entry updated successfully"}
        
        # If no existing entry, create new one
        journal_entries.append(entry.dict())
        return {"message": "Entry created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Welcome to the API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 