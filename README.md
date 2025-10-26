# DS-X: COGNITY🎓

> Navigate BU's 6,000+ courses with AI-powered insights and career guidance

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://www.python.org/)

DS-X is an intelligent academic planning platform designed specifically for Boston University students. Built during [Hackathon Name], it transforms the complex process of course selection and degree planning into a seamless, AI-powered experience.

![DS-X Demo](docs/demo.gif)

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Team](#-team)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

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
- **Drag-and-Drop Interface**: Intuitive semester-by-semester course planning
- **Prerequisite Validation**: Automatic checking to ensure courses are taken in the correct order
- **Credit Tracking**: Real-time monitoring of semester and total credit load
- **Multi-Semester View**: Plan up to 4 years (8 semesters) in advance

### 📊 **Progress Tracking**
- **BU Hub Requirements**: Track all 21 Hub requirements across 6 categories toward your 26 required units
- **Visual Progress Indicators**: Circular charts and status tables for degree completion
- **Milestone Tracking**: See how many courses, credits, and Hub units you've completed
- **Motivational Feedback**: Progress-based encouragement as you work toward graduation

### 👨‍🏫 **Professor Research Network**
- **4,000+ Faculty Profiles**: Browse professors across all BU departments
- **Research Exploration**: View publications via OpenAlex integration
- **AI Email Generator**: Create professional outreach emails to connect with faculty
- **Department Filtering**: Find professors by school and research area

### 💾 **Data Management**
- **Persistent Planning**: Save and load your semester plans (user accounts coming soon)
- **Export Options**: Download your course plan as PDF or CSV
- **Course Comparison**: Side-by-side comparison of multiple courses

---

## 🎥 Demo

**Live Demo**: [Coming Soon - Deploying to Vercel]

**Screenshots**:

### Course Catalog
![Course Catalog](docs/screenshots/catalog.png)

### AI Career Advisor
![AI Career Advisor](docs/screenshots/advisor.png)

### Semester Planner
![Semester Planner](docs/screenshots/planner.png)

### Progress Tracking
![Progress Tracking](docs/screenshots/progress.png)

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
   ```bash
   git clone https://github.com/UgaTheDev/DS-X.git
   cd DS-X
   ```

2. **Set up the Frontend**
   ```bash
   cd frontend
   npm install
   ```

3. **Set up the Backend**
   ```bash
   cd ../backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

4. **Configure Environment Variables**

   Create a `.env` file in the `backend` directory:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/dsx_db
   
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

5. **Initialize the Database**
   ```bash
   cd backend
   source venv/bin/activate
   python scripts/init_db.py
   python scripts/load_courses.py
   python scripts/load_faculty.py
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

## 📁 Project Structure

```
DS-X/
├── frontend/                # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── CourseCatalog.tsx
│   │   │   ├── SemesterPlanner.tsx
│   │   │   ├── Progress.tsx
│   │   │   ├── UniversalCareerRecommender.tsx
│   │   │   └── ProfessorNetwork.tsx
│   │   ├── store/           # Zustand state management
│   │   │   └── plannerStore.ts
│   │   ├── types/           # TypeScript type definitions
│   │   │   └── course.ts
│   │   ├── services/        # API service layer
│   │   │   └── api.ts
│   │   ├── data/            # Static data and constants
│   │   │   └── careerPaths.ts
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                 # Python + FastAPI backend
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   ├── models/          # SQLAlchemy models
│   │   │   ├── course.py
│   │   │   ├── professor.py
│   │   │   └── user.py
│   │   ├── routes/          # API endpoints
│   │   │   ├── courses.py
│   │   │   ├── professors.py
│   │   │   ├── ai_advisor.py
│   │   │   └── gemini.py
│   │   ├── database.py      # Database configuration
│   │   └── config.py        # App configuration
│   ├── scripts/             # Data processing scripts
│   │   ├── init_db.py
│   │   ├── load_courses.py
│   │   ├── load_faculty.py
│   │   └── scrape_courses.py
│   ├── requirements.txt
│   └── .env
│
├── docs/                    # Documentation and screenshots
├── README.md
└── LICENSE
```

---

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Key Endpoints

#### **Courses**
```http
GET    /courses                    # Get all courses
GET    /courses/{id}               # Get course by ID
GET    /courses/search?q={query}   # Search courses
POST   /courses/filter             # Filter courses by criteria
```

#### **AI Advisor**
```http
POST   /ai-advisor/                # Get AI career recommendations
POST   /gemini/                    # General AI chat advisor
```

#### **Professors**
```http
GET    /professors                 # Get all professors
GET    /professors/{id}            # Get professor by ID
GET    /professors/search?q={query} # Search professors
GET    /professors/{id}/publications # Get professor's publications
POST   /professors/generate-email  # Generate outreach email
```

#### **User Plans** (Coming Soon)
```http
GET    /plans                      # Get user's saved plans
POST   /plans                      # Save a new plan
PUT    /plans/{id}                 # Update a plan
DELETE /plans/{id}                 # Delete a plan
```

Full interactive API documentation available at: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔐 Environment Variables

### Backend `.env`

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GEMINI_API_KEY` | Google Gemini AI API key | Yes |
| `OPENALEX_EMAIL` | Email for OpenAlex API | No |
| `SECRET_KEY` | JWT secret for authentication | Yes |
| `ENVIRONMENT` | `development` or `production` | Yes |

### Frontend `.env`

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend API base URL | Yes |

---

## 🗺️ Roadmap

### ✅ Completed (v1.0)
- [x] Course catalog with 4,000+ BU courses
- [x] AI career recommendations
- [x] Semester planner with drag-and-drop
- [x] BU Hub requirements tracking (all 21 requirements)
- [x] Professor network with research integration
- [x] AI email generator

### 🚧 In Progress (v1.1)
- [ ] User authentication and accounts
- [ ] Persistent semester plans (cloud storage)
- [ ] Course reviews and ratings
- [ ] Mobile responsive design improvements

### 🔮 Planned (v2.0)
- [ ] Schedule conflict detection
- [ ] Auto-generate optimal semester schedules
- [ ] Course availability and enrollment data
- [ ] Integration with BU Student Link
- [ ] Mobile apps (iOS/Android)
- [ ] Email notifications for course openings
- [ ] Study group formation

### 🌟 Future Ideas (v3.0+)
- [ ] Expand to other universities
- [ ] Graduate program recommendations
- [ ] Peer course recommendations
- [ ] Academic advisor matching
- [ ] Career outcome analytics

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Contribution Guidelines

- Write clear, descriptive commit messages
- Follow the existing code style (we use ESLint and Prettier for frontend)
- Add tests for new features
- Update documentation as needed
- Make sure all tests pass before submitting PR

### Areas We Need Help With

- 🎨 UI/UX improvements
- 🐛 Bug fixes and testing
- 📱 Mobile responsiveness
- 📚 Documentation
- 🌐 Internationalization
- ♿ Accessibility improvements

---

## 👥 Team

**DS-X** was built by a team of passionate Boston University students:

- **[Your Name]** - Full-Stack Development, AI Integration
- **[Team Member 2]** - Frontend Development, UI/UX Design
- **[Team Member 3]** - Backend Development, Database Design
- **[Team Member 4]** - Data Engineering, Web Scraping

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Boston University** - For providing course data and inspiring this project
- **Google Gemini** - For powering our AI recommendations
- **OpenAlex** - For academic research data
- **[Hackathon Name]** - For the opportunity to build this project
- **Our Mentors** - For guidance and support throughout development
- **Open Source Community** - For the amazing tools and libraries that made this possible

---

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/UgaTheDev/DS-X/issues)
- **Discussions**: [GitHub Discussions](https://github.com/UgaTheDev/DS-X/discussions)
- **Email**: [your-email@bu.edu](mailto:your-email@bu.edu)

---

## 🌟 Star Us!

If you find DS-X helpful, please consider giving us a ⭐ on [GitHub](https://github.com/UgaTheDev/DS-X)! It helps others discover the project and motivates us to keep improving it.

---

<div align="center">
  <sub>Built with ❤️ by BU students, for BU students</sub>
</div>
