# AI Journal: Little Moments

This AI-powered journaling app turns short daily snippets into complete entries effortlessly. It also tracks mood with AI-driven sentiment analysis, offering a dashboard for insights into your emotional well-being.

<!-- TODO: Add screenshots and videos -->

## Infrastructure Overview

- **Frontend**: React Native with Expo
- **Backend**: Python FastAPI
- **Database**: Supabase
- **Authentication**: Google Sign-in (Supabase)
- **Content Generate AI Service**: Gemini API
- **Sentiment Analysis AI Services**: `distilbert/distilbert-base-uncased-finetuned-sst-2-english` via HuggingFace Inference API

### Project Structure

```
ai-journal/
├── mobile-app/          # React Native mobile application
│   ├── api/            # API integration layer
│   ├── assets/         # Static assets (images, fonts)
│   ├── components/     # Reusable UI components
│   ├── context/        # React Context providers
│   ├── screens/        # Screen components
│   ├── services/       # Business logic services
│   ├── utils/          # Utility functions
│   ├── App.js          # Main application entry point
│   └── app.config.js   # Expo configuration
├── backend/            # Python FastAPI backend
│   ├── services/       # Business logic and AI services
│   ├── main.py         # FastAPI application entry point
│   ├── models.py       # Database models
│   ├── config.py       # Configuration settings
│   └── requirements.txt # Python dependencies
├── notebooks/          # Exploratory Jupyter notebooks
├── supabase/           # Database schema scripts
├── .env                # Environment variables
└── .env.example        # Example environment variables
```

## Development

Follow [Set Up](#set-up) on how to set up the project for the first time.

To start the application in local development, start the backend:

```shell
cd backend
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

In a separate terminal, start the frontend:

```shell
cd mobile-app
npx expo run:ios
```

### Set Up

#### React Native Expo

Follow [Expo's guide](https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=simulated) to set up your environment with iOS simulator.

#### Database

Create a project (for example "AI Journal") in the Supabase Dashboard for this application.

Under _Authentication_ (sidebar) > _Configuration_, select _Sign In / Up_, select _Allow new users to sign up_ and enable Google under _Auth Providers_.

Create the tables and set up policies at _SQL Editor_ (sidebar), copy and paste the content from the [schema script](supabase/schema.sql) into the editor and click _Run_ to execute the script.

#### Environment Variables

Set up environment variables by copying the example file:

```shell
cp .env.example .env
```

##### API Keys

Follow [Google's guide](https://ai.google.dev/gemini-api/docs/api-key) for Gemini API key, and [Huggingface's guide](https://ai.google.dev/gemini-api/docs/api-key) for user access token.

##### User Authentication

Create a Google Cloud Project (GCP) and following this [guide](https://react-native-google-signin.github.io/docs/setting-up/get-config-file?firebase-or-not=cloud-console#ios) to obtain `IOS_CLIENT_ID` and `IOS_URL_SCHEME`, ensure you are following the guide for _When not using Firebase_. Note that only iOS is supported for this application.

This application uses Supabase authentication with React Native Google Sign In, for more details refer to [Supabase's documentation](https://supabase.com/docs/guides/auth/social-login/auth-google?queryGroups=platform&platform=react-native) and [React Native Google Sign In documentation](https://react-native-google-signin.github.io/docs/setting-up/expo#expo-without-firebase).

##### Supabase

Navigate to your project dashboard. Under _Project Settings_ (sidebar) > _Data API_, you can find the `anon` and `service_role` keys under _Project API Keys_ for `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_KEY`; for `SUPABASE_URL` use the _Project URL_.

#### Backend

```shell
cd backend

# Create the virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install requirements.txt

# Start the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```shell
cd mobile-app

# Install required dependencies
npm install

# Start the frontend server
npx expo run:ios
```

## Further Work

- Support Android devices
- Integrate more third-party sign-in (like Apple, Facebook)
- Implement journal lock for added security
- Support speech-to-text, images, videos and other media inputs

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

##### Adjust Timeouts

You can adjust the timeout values for API calls:

```
# In your .env file
API_TIMEOUT_SECONDS=3  # Lower this value to fail faster
```

##### Check HuggingFace API Status

If the HuggingFace API is experiencing issues, the application may slow down. Make sure the HuggingFace token is valid. You can test the API directly:

```bash
curl -X POST \
  https://api-inference.huggingface.co/models/distilbert-base-uncased-finetuned-sst-2-english \
  -H "Authorization: Bearer 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" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "I love this app"}'
```

##### Increase Client Timeout

If you're using Axios in the client, you can increase the timeout:

```javascript
// Client-side API configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 20000, // Increase from default 10000ms to 20000ms
});
```

##### Server Logs

Check the server logs for errors. The application now has improved error logging to help diagnose issues. 