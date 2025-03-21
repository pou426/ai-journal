import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set")

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

def generate_journal_from_snippets(snippets_text: str) -> str:
    """
    Generate an AI summary from snippets using Gemini.
    
    Args:
        snippets_text: Text containing all snippets separated by newlines
        
    Returns:
        AI-generated journal entry
    """
    prompt = f"Summarise these daily snippets into a concise and coherent journal entry in a reflective and personal tone. Write in first person and start directly with the content. Do not include any introductory text, meta-commentary, or explanations:\n\n${snippets_text}"
    
    response = model.generate_content(prompt)
    return response.text 