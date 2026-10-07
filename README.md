# ATS Resume Tester

A full-stack web app that analyzes resumes against ATS (Applicant Tracking System) criteria and optionally compares them to a job description.

Built with React + Vite on the frontend and Node.js + Express on the backend.

---

## What it does

- Extracts text from PDF, DOCX, or TXT resumes
- Checks for common ATS issues: formatting, missing sections, contact info, keyword density
- Scores the resume 0–100 with a breakdown by category
- If a job description is provided, identifies which required skills are missing
- Optionally uses OpenAI to provide rewrite suggestions (falls back to rule-based advice if no API key)
- Saves analysis history per user (requires account)
- Exports a PDF report

---

## Tech Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS
- **Backend**: Node.js, Express 4, Multer (file upload)
- **Database**: MongoDB + Mongoose (user accounts and analysis history)
- **Resume parsing**: pdf-parse / mammoth (built-in), or Affinda API (optional)
- **AI coaching**: OpenAI GPT-4o-mini (optional), rule-based fallback included
- **PDF reports**: PDFKit

---

## Project Structure

```
ResumeTester/
├── package.json              # Root scripts (runs server and client)
├── .gitignore
├── server/
│   ├── .env.example          # Copy to .env and fill in values
│   ├── server.js             # Express app entry point
│   ├── config/db.js          # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   └── ResumeAnalysis.js
│   ├── middleware/
│   │   ├── auth.js           # JWT middleware
│   │   └── upload.js         # Multer config
│   ├── routes/
│   │   ├── authRoutes.js     # /register, /login, /me
│   │   └── resumeRoutes.js   # /analyze, /history, /:id, /:id/report
│   ├── services/
│   │   ├── documentExtractor.js
│   │   ├── affindaService.js
│   │   ├── openaiService.js
│   │   └── pdfReportGenerator.js
│   ├── atsEngine/
│   │   ├── index.js          # Pipeline entry point
│   │   ├── formattingChecker.js
│   │   ├── sectionChecker.js
│   │   ├── contactChecker.js
│   │   ├── keywordChecker.js
│   │   ├── jdMatcher.js
│   │   └── scoring.js
│   ├── test_engine.js
│   └── test_server_api.js
└── client/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── index.css
    │   └── components/
    │       ├── NavBar.jsx
    │       ├── ResumeInput.jsx
    │       ├── ResultsDashboard.jsx
    │       ├── AuthModal.jsx
    │       ├── HistoryDrawer.jsx
    │       └── BulletModal.jsx
    ├── vite.config.js
    └── tailwind.config.js
```

---

## Setup

### Requirements
- Node.js 18+
- MongoDB (local at `mongodb://127.0.0.1:27017` or Atlas URI)

### 1. Configure environment

```bash
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and a JWT secret
```

### 2. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3. Run in development

```bash
# Terminal 1 — backend (port 5000)
npm run server:dev

# Terminal 2 — frontend (port 3000 or 5173)
npm run client
```

Or build and run in production mode (Express serves the frontend):
```bash
npm run build:client
npm start
```

### 4. Run tests

```bash
npm test          # ATS engine unit tests
npm run test:api  # HTTP API integration tests (requires running server)
```

---

## Environment Variables (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default 5000) | Server port |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for signing JWTs — use a random string |
| `AFFINDA_API_KEY` | No | Affinda resume parsing API key. If not set, uses pdf-parse/mammoth. |
| `OPENAI_API_KEY` | No | OpenAI API key. If not set, uses rule-based coaching. |

**API keys are read from `.env` on the server. They are never sent from the browser.**

---

## Notes on AI coaching

- If `OPENAI_API_KEY` is set, the coaching tab uses GPT-4o-mini to analyze the resume and suggest rewrites.
- If not set, a rule-based fallback generates advice based on the ATS score and detected issues.
- Neither the AI nor the fallback invents metrics or fabricates experience the candidate didn't describe.
- The "Suggest Bullet" feature generates a template bullet point for a missing skill. It is labelled as a template and should be edited before use.
