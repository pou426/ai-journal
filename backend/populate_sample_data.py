import os
from datetime import datetime, timedelta
from dotenv import load_dotenv
from supabase import create_client, Client
import uuid
import argparse
import random

# Load environment variables
load_dotenv()

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are not set")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Sample activities for different times of day
MORNING_ACTIVITIES = [
    "Woke up feeling refreshed and ready for the day",
    "Had a healthy breakfast with oatmeal and fruits",
    "Did some morning stretches and yoga",
    "Started working on my project early",
    "Went for a morning walk in the park",
    "Had coffee with a friend",
    "Read a chapter of my book",
    "Meditated for 15 minutes"
]

AFTERNOON_ACTIVITIES = [
    "Had a productive team meeting",
    "Grabbed lunch with colleagues",
    "Worked on some challenging code",
    "Took a short break to clear my mind",
    "Attended a workshop on new technologies",
    "Had a client presentation",
    "Solved a complex bug",
    "Collaborated with team members"
]

EVENING_ACTIVITIES = [
    "Wrapped up work for the day",
    "Went to the gym for a workout",
    "Cooked dinner with my partner",
    "Watched an episode of my favorite show",
    "Called my family to catch up",
    "Planned tomorrow's tasks",
    "Did some light reading",
    "Wrote in my journal"
]

def generate_day_snippets(date, user_id):
    """Generate 2-4 snippets per time period for a given date."""
    snippets = []
    
    # Morning snippets (7 AM - 11 AM)
    morning_count = random.randint(2, 3)  # Random number of morning snippets
    morning_activities = random.sample(MORNING_ACTIVITIES, morning_count)  # Get unique morning activities
    for i in range(morning_count):
        hour = 7 + i * 2
        minute = random.randint(0, 59)  # Random minute
        timestamp = date.replace(hour=hour, minute=minute).isoformat()
        snippets.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "entry": morning_activities[i],
            "created_at": timestamp
        })
    
    # Afternoon snippets (12 PM - 5 PM)
    afternoon_count = random.randint(2, 4)  # Random number of afternoon snippets
    afternoon_activities = random.sample(AFTERNOON_ACTIVITIES, afternoon_count)  # Get unique afternoon activities
    for i in range(afternoon_count):
        hour = 12 + i
        minute = random.randint(0, 59)  # Random minute
        timestamp = date.replace(hour=hour, minute=minute).isoformat()
        snippets.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "entry": afternoon_activities[i],
            "created_at": timestamp
        })
    
    # Evening snippets (6 PM - 10 PM)
    evening_count = random.randint(2, 3)  # Random number of evening snippets
    evening_activities = random.sample(EVENING_ACTIVITIES, evening_count)  # Get unique evening activities
    for i in range(evening_count):
        hour = 18 + i * 2
        minute = random.randint(0, 59)  # Random minute
        timestamp = date.replace(hour=hour, minute=minute).isoformat()
        snippets.append({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "entry": evening_activities[i],
            "created_at": timestamp
        })
    
    # Sort snippets by timestamp
    return sorted(snippets, key=lambda x: x['created_at'])

def create_journal_entry(date, snippets, user_id):
    """Create a journal entry by concatenating all snippets for the day."""
    entries = [s['entry'] for s in snippets]
    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "date": date.date().isoformat(),
        "entry": " ".join(entries)
    }

def populate_sample_data(user_id, days=7):
    """
    Populate the database with sample data for the past N days, starting from yesterday.
    
    Args:
        user_id (str): The user ID to create data for
        days (int): Number of days of data to generate
    """
    yesterday = datetime.now() - timedelta(days=1)  # Start from yesterday
    
    for i in range(days):
        # Generate date for this iteration
        date = yesterday - timedelta(days=i)
        
        # Generate snippets for the day
        snippets = generate_day_snippets(date, user_id)
        
        # Create journal entry
        journal_entry = create_journal_entry(date, snippets, user_id)
        
        try:
            # Insert snippets
            for snippet in snippets:
                supabase.table("snippets").insert(snippet).execute()
            
            # Insert journal entry
            supabase.table("journals").insert(journal_entry).execute()
            
            print(f"Successfully populated data for {date.date()}")
        except Exception as e:
            print(f"Error populating data for {date.date()}: {str(e)}")

def main():
    parser = argparse.ArgumentParser(description='Populate database with sample data')
    parser.add_argument('--user-id', required=True,
                      help='User ID to create sample data for')
    parser.add_argument('--days', type=int, default=7,
                      help='Number of days of data to generate (default: 7)')
    
    args = parser.parse_args()
    
    print(f"\nThis will generate {args.days} days of sample data")
    print(f"For user ID: {args.user_id}")
    confirmation = input("Are you sure you want to proceed? (y/N): ")
    
    if confirmation.lower() == 'y':
        populate_sample_data(args.user_id, args.days)
        print("\nFinished populating sample data!")
    else:
        print("Operation cancelled")

if __name__ == "__main__":
    main() 