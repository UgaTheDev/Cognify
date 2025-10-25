# Setup Instructions

## API Keys Configuration

1. **Copy the environment template:**

```bash
   cd backend
   cp .env.example .env
```

2. **Add your Google API key to `backend/.env`:**

   - Get your API key from: https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Copy the key

3. **The .env file should look like:**

```
   GOOGLE_API_KEY=AIzaSyAC01g1nY4O0ZtPnu-qdKY7nH_1FkhBbXE
   DEBUG=True
```

4. **Restart the backend server** to load the new environment variables:

```bash
   cd backend
   uvicorn app.main:app --reload
```

## What Uses the Google API?

- ✅ AI Career Recommendations (Universal Career Advisor)
- ✅ Cold Email Generation (Professor Research feature)
- ✅ Any future AI-powered features

## Security Notes

- ✅ `.env` file is in `.gitignore` - your key won't be committed
- ✅ Never share your API key
- ✅ Use `.env.example` as a template for team members

## Getting Your Google API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Choose "Create API key in new project" (or use existing project)
5. Copy the key and paste it into `backend/.env`

**Note:** Google Gemini API has a generous free tier!
