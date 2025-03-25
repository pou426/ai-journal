import os
from dotenv import load_dotenv

# Load environment variables from parent directory
load_dotenv(dotenv_path="../.env")

# Supabase configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Gemini API configuration
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_RATE_LIMIT_PER_USER = os.getenv('GEMINI_RATE_LIMIT_PER_USER', '5/minute')
GEMINI_GLOBAL_RATE_LIMIT = os.getenv('GEMINI_GLOBAL_RATE_LIMIT', '60/minute')

# HuggingFace configuration
HUGGINGFACE_API_TOKEN = os.getenv('HUGGINGFACE_TOKEN', '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')

# API timeout settings
API_TIMEOUT_SECONDS = int(os.getenv('API_TIMEOUT_SECONDS', '5'))

# Validate required environment variables
missing_vars = []
if not SUPABASE_URL:
    missing_vars.append("SUPABASE_URL")
if not SUPABASE_SERVICE_KEY:
    missing_vars.append("SUPABASE_SERVICE_KEY")
if not GEMINI_API_KEY:
    missing_vars.append("GEMINI_API_KEY")
    
if missing_vars:
    raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}") 