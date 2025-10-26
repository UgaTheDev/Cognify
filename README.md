# BU Course Planner

An interactive course planning tool for Boston University students.

## Features
- 📚 Browse course catalog
- 📅 Drag-and-drop semester planning
- ✅ Prerequisite validation
- 📊 Degree progress visualization

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Python + FastAPI
- **Database**: PostgreSQL

## Setup

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app:main:app -- reload
```

## Development
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs
