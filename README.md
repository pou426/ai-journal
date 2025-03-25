# AI Journal: Little Moments

## Project Structure

## Development

### Backend

```shell
cd backend

# Create the virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your Gemini API key

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```shell
cd mobile-app
npm install
npx expo run:ios
```

## Troubleshooting

### Troubleshooting API Timeout Issues

If you're experiencing timeout errors when fetching journal entries, there are several possible solutions:

#### Symptoms

Errors like these in the client:
```
ERROR Error fetching journal by date: [AxiosError: timeout of 10000ms exceeded]
ERROR JournalService.getJournalByDate error: [AxiosError: timeout of 10000ms exceeded]
ERROR Error fetching selected date content: [AxiosError: timeout of 10000ms exceeded]
```

#### Solutions (Backend)

##### 1. Adjust Timeouts

You can adjust the timeout values for API calls:

```
# In your .env file
API_TIMEOUT_SECONDS=3  # Lower this value to fail faster
```

##### 1. Check HuggingFace API Status

If the HuggingFace API is experiencing issues, the application may slow down. Make sure the HuggingFace token is valid. You can test the API directly:

```bash
curl -X POST \
  https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english \
  -H "Authorization: Bearer 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" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "I love this app"}'
```

##### 1. Increase Client Timeout

If you're using Axios in the client, you can increase the timeout:

```javascript
// Client-side API configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 20000, // Increase from default 10000ms to 20000ms
});
```

##### 1. Server Logs

Check the server logs for errors. The application now has improved error logging to help diagnose issues. 