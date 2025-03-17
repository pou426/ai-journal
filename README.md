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