# DS-X: COGNIFY🎓

> Navigate BU's 6,000+ courses with AI-powered insights and career guidance

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)

DS-X is an intelligent academic planning platform designed specifically for Boston University students. Built during Boston University DS+X 2025, it transforms the complex process of course selection and degree planning into a seamless, AI-powered experience.

---

## ✨ Features

### 🔍 **Course Discovery**
- **Search 6,000+ BU Courses**: Comprehensive catalog across all schools (CAS, ENG, COM, etc.)
- **Advanced Filtering**: By level (introductory/intermediate/advanced), credits, school, and Hub requirements
- **Real-time Search**: Instant results as you type with intelligent matching

### 🤖 **AI Career Advisor**
- **Custom Career Recommendations**: Enter any career goal and get relevant course suggestions
- **Intelligent Course Matching**: Powered by Google Gemini AI to analyze career requirements and course content
- **Skill Gap Analysis**: See what percentage of required skills each course path covers
- **Interactive Chat Advisor**: Ask questions about degree planning, course selection, and academic strategy

### 📅 **Smart Semester Planner**
- **Credit Tracking**: Real-time monitoring of semester and total credit load
- **Multi-Semester View**: Plan 4 years (8 semesters), if not more, in advance

### 📊 **Progress Tracking**
- **BU Hub Requirements**: Track all 21 Hub requirements across 6 categories toward your 26 required units
- **Visual Progress Indicators**: Circular charts and status tables for degree completion
- **Milestone Tracking**: See how many courses, credits, and Hub units you've completed
- **Motivational Feedback**: Progress-based encouragement as you work toward graduation

### 👨‍🏫 **Professor Research Network**
- **4,000+ Faculty Profiles**: Browse professors across all BU departments
- **Research Exploration**: View publications via OpenAlex integration
- **AI Email Generator**: Create professional outreach emails to connect with faculty
- **Department Filtering**: Find professors by department

---

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library for building interactive interfaces
- **TypeScript 5.5** - Type-safe JavaScript for better developer experience
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Zustand** - Lightweight state management
- **React Router** - Client-side routing
- **Axios** - HTTP client for API requests
- **Lucide React** - Beautiful icon library

### Backend
- **Python 3.11** - Modern Python with type hints
- **FastAPI** - High-performance async web framework
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - Python ORM for database operations
- **Pandas** - Data manipulation and analysis
- **Google Gemini API** - AI-powered course recommendations
- **OpenAlex API** - Academic research paper integration
- **Uvicorn** - ASGI server for FastAPI

### Data Processing
- **Beautiful Soup** - Web scraping BU course catalogs
- **Pandas** - Data cleaning and preprocessing
- **Custom Python Scripts** - Course and faculty data extraction

### DevOps
- **Git & GitHub** - Version control and collaboration
- **Vercel** (planned) - Frontend deployment
- **Railway** (planned) - Backend deployment

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Python** (v3.11 or higher) - [Download](https://www.python.org/)
- **PostgreSQL** (v14 or higher) - [Download](https://www.postgresql.org/)
- **Git** - [Download](https://git-scm.com/)

### Installation

1. **Clone the repository**

2. **Set up the Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Set up the Backend**
   ```bash
   cd ../backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python3 -m uvicorn app.main:app --reload
   ```

4. **Configure Environment Variables**

   Create a `.env` file in the `backend` directory:
   ```env
   # Google Gemini AI
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # OpenAlex (optional - for professor research)
   OPENALEX_EMAIL=your_email@bu.edu
   
   # Server
   ENVIRONMENT=development
   SECRET_KEY=your_secret_key_here
   ```

   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

### Running the Application

You'll need two terminal windows:

**Terminal 1 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will be available at: [http://localhost:5173](http://localhost:5173)

**Terminal 2 - Backend:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python -m uvicorn app.main:app --reload
```
Backend will be available at: [http://localhost:8000](http://localhost:8000)

API documentation (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

Full interactive API documentation available at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
