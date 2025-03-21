import google.generativeai as genai
import sys
import os

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import GEMINI_API_KEY

# Configure Gemini API
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