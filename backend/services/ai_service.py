import google.generativeai as genai
import sys
import os
from typing import Tuple

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import GEMINI_API_KEY
from .sentiment_service import analyze_sentiment

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

def generate_journal_from_snippets(snippets_text: str) -> Tuple[str, float]:
    """
    Generate an AI summary from snippets using Gemini and analyze its sentiment.
    
    Args:
        snippets_text: Text containing all snippets separated by newlines
        
    Returns:
        Tuple containing:
        - AI-generated journal entry
        - Sentiment score from -1 (negative) to 1 (positive)
    """
    prompt = f"Summarise these daily snippets into a concise and coherent journal entry in a reflective and personal tone using only explicitly stated information. Write in first person and start directly with the content. Do not include any introductory text, meta-commentary, or explanations:\n\n${snippets_text}"
    
    response = model.generate_content(prompt)
    journal_text = response.text
    
    # Try to analyze sentiment but don't block if it fails
    try:
        sentiment_score, _ = analyze_sentiment(journal_text)
    except Exception as e:
        print(f"Error in sentiment analysis, proceeding without it: {str(e)}")
        sentiment_score = 0.0
    
    return journal_text, sentiment_score 