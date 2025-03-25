import requests
import sys
import os
from typing import Dict, Any, Tuple

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import HUGGINGFACE_API_TOKEN, API_TIMEOUT_SECONDS

# HuggingFace API configuration
API_URL = "https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english"
HEADERS = {"Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}"}

def analyze_sentiment(text: str) -> Tuple[float, Dict[str, Any]]:
    """
    Analyze sentiment of text using HuggingFace's distilbert model.
    
    Args:
        text: The text to analyze
        
    Returns:
        Tuple containing:
        - A sentiment score from -1 (negative) to 1 (positive)
        - The raw response from the API
    """
    try:
        payload = {"inputs": text}
        response = requests.post(API_URL, headers=HEADERS, json=payload, timeout=API_TIMEOUT_SECONDS)
        result = response.json()
        
        # Handle error case
        if isinstance(result, dict) and "error" in result:
            print(f"Error from HuggingFace API: {result['error']}")
            return 0.0, result
        
        # Extract sentiment scores from response
        try:
            if isinstance(result, list) and len(result) > 0:
                # The API returns a list of labels with scores
                scores = result[0]
                
                # Find the positive and negative scores
                positive_score = next((item["score"] for item in scores if item["label"] == "POSITIVE"), 0)
                negative_score = next((item["score"] for item in scores if item["label"] == "NEGATIVE"), 0)
                
                # Calculate normalized score between -1 and 1
                # If positive score is higher, result is positive; if negative score is higher, result is negative
                if positive_score > negative_score:
                    sentiment_score = positive_score
                else:
                    sentiment_score = -negative_score
                    
                return sentiment_score, result
        except Exception as e:
            print(f"Error processing sentiment analysis result: {str(e)}")
    except requests.exceptions.Timeout:
        print("Timeout error when calling HuggingFace API")
        return 0.0, {"error": "timeout"}
    except requests.exceptions.RequestException as e:
        print(f"Request error when calling HuggingFace API: {str(e)}")
        return 0.0, {"error": str(e)}
    except Exception as e:
        print(f"Unexpected error in sentiment analysis: {str(e)}")
        return 0.0, {"error": str(e)}
        
    # Default return if any issues
    return 0.0, {} 