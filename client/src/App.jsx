import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Zap } from 'lucide-react'

import NavBar from './components/NavBar'
import ResumeInput from './components/ResumeInput'
import ResultsDashboard from './components/ResultsDashboard'
import AuthModal from './components/AuthModal'
import HistoryDrawer from './components/HistoryDrawer'
import BulletModal from './components/BulletModal'

export default function App() {
  // Resume input state
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [editorTab, setEditorTab] = useState('upload')

  // Analysis state
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('requirements')

  // Missing skill injection
  const [customRequirement, setCustomRequirement] = useState('')
  const [generatingBulletFor, setGeneratingBulletFor] = useState(null)
  const [bulletModal, setBulletModal] = useState(null)

  // Auth state — token in localStorage, but API keys are never stored client-side
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [currentUser, setCurrentUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [historyList, setHistoryList] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  // Toast
  const [toast, setToast] = useState('')
  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3500)
  }

  // Verify stored token on load
  useEffect(() => {
    if (token) {
      axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setCurrentUser(res.data.user))
        .catch(() => {
          setToken('')
          localStorage.removeItem('token')
        })
    }
  }, [token])

  const handleAuthSuccess = (newToken, user) => {
    setToken(newToken)
    localStorage.setItem('token', newToken)
    setCurrentUser(user)
    setShowAuth(false)
    notify(`Welcome, ${user.name}`)
  }

  const handleLogout = () => {
    setToken('')
    localStorage.removeItem('token')
    setCurrentUser(null)
    notify('Logged out')
  }

  const fetchHistory = async () => {
    if (!currentUser) {
      setShowAuth(true)
      return
    }
    try {
      const res = await axios.get('/api/resumes/history', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistoryList(res.data)
      setShowHistory(true)
    } catch (err) {
      notify(err.response?.data?.error || 'Could not load history')
    }
  }

  // File input handler
  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    if (f.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (ev) => setResumeText(ev.target.result)
      reader.readAsText(f)
    }
  }

  // Sample data — clearly labelled as demo fixtures
  const handleLoadSampleGood = () => {
    // Demo resume fixture — fictional data for testing purposes
    const sampleText = `Alex Mercer
San Francisco, CA | (555) 234-5678 | alex.mercer@email.com | linkedin.com/in/alex-mercer | github.com/alexmercer

[DEMO RESUME — sample data for testing]

PROFESSIONAL SUMMARY
Senior Software Engineer with 6 years of experience in distributed backend services and cloud infrastructure.

TECHNICAL SKILLS
- Programming Languages: Python, JavaScript, TypeScript, Go, SQL, Bash
- Frameworks & Libraries: FastAPI, Django, React, Node.js, Next.js
- Cloud & Infrastructure: AWS (EC2, S3, Lambda), Docker, Kubernetes, Terraform, CI/CD
- Databases: PostgreSQL, Redis, MongoDB, Elasticsearch
- Tools: Git, Jira, GitHub Actions

PROFESSIONAL EXPERIENCE
Senior Backend Engineer | CloudScale Tech, San Francisco, CA | 2021 - Present
- Architected microservices infrastructure using FastAPI, Python, and PostgreSQL.
- Led database query optimization and Redis caching, reducing server memory usage.
- Migrated 12 legacy applications to Docker containers on Kubernetes (EKS).
- Mentored 6 junior engineers on code review and testing practices.

Software Engineer | NextGen Systems, San Jose, CA | 2018 - 2021
- Built RESTful APIs with Python, Django, and React serving enterprise users.
- Automated integration testing using Pytest and GitHub Actions, raising code coverage.
- Redesigned core analytics dashboard with product and design teams.

EDUCATION
Bachelor of Science in Computer Science | UC Berkeley | 2014 - 2018

CERTIFICATIONS
- AWS Certified Solutions Architect - Associate (2023)`
    const blob = new Blob([sampleText], { type: 'text/plain' })
    setFile(new File([blob], 'demo_resume_good.txt', { type: 'text/plain' }))
    setResumeText(sampleText)
    notify('Loaded demo resume (sample data)')
  }

  const handleLoadSamplePoor = () => {
    // Demo fixture for a weak resume
    const poorText = `John Doe
partyguy99@hotmail.com

ABOUT ME
I am looking for a job where I can use my skills. I like coding and doing computer stuff.

WHAT I DID
Worker at Some Company
Responsible for working on computer files.
Assisted with database tasks and helped out the team.
Duties included answering emails and doing bug fixes.
Worked on the website sometimes.

STUFF I KNOW
Computers, typing, coding, Microsoft Word.`
    const blob = new Blob([poorText], { type: 'text/plain' })
    setFile(new File([blob], 'demo_resume_weak.txt', { type: 'text/plain' }))
    setResumeText(poorText)
    notify('Loaded weak resume demo (sample data)')
  }

  const handleLoadSampleJD = () => {
    setJobDescription(`Senior Backend Engineer - Cloud Infrastructure

Key Responsibilities:
- Design, build, and deploy reliable, high-performance microservices and REST APIs.
- Manage and scale cloud infrastructure on AWS using Docker, Kubernetes, and Terraform.
- Optimize relational database queries in PostgreSQL and implement caching layers with Redis.
- Champion CI/CD automation, unit testing, and agile engineering best practices.
- Collaborate with frontend engineers, product managers, and architects.

Requirements:
- 5+ years of software development experience with Python, Go, or TypeScript.
- Strong proficiency with FastAPI, Django, or modern backend frameworks.
- Production experience with Docker, Kubernetes, and AWS cloud services.
- In-depth knowledge of PostgreSQL, Redis, and distributed systems.
- Experience building automated CI/CD pipelines (e.g. GitHub Actions).`)
    notify('Loaded sample job description')
  }

  // Run analysis
  const handleAnalyze = async () => {
    if (!file && !resumeText.trim()) {
      setError('Upload a resume file or paste text in the Text Editor tab.')
      return
    }
    setError('')
    setLoading(true)

    const formData = new FormData()
    if (file && !resumeText) {
      formData.append('resume', file)
    } else {
      formData.append('resumeText', resumeText)
      formData.append('filename', file ? file.name : 'resume_editor.txt')
    }
    if (jobDescription) formData.append('jobDescription', jobDescription)

    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    try {
      const response = await axios.post('/api/resumes/analyze', formData, { headers })
      setResult(response.data)
      if (!resumeText && response.data?.extraction?.text) {
        setResumeText(response.data.extraction.text)
      }
      notify(`Analysis complete — Score: ${response.data.scoring.overallScore}/100`)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  // Add a missing skill to the skills section of the resume text
  const handleAddSkillToResume = (skill) => {
    let current = resumeText || (result?.extraction?.text || '')
    if (!current) {
      notify('No resume text found. Use the Text Editor tab to paste your resume.')
      return
    }
    if (current.toLowerCase().includes(skill.toLowerCase())) {
      notify(`"${skill}" is already in your resume text.`)
      return
    }

    const skillsRegex = /(TECHNICAL\s+SKILLS|SKILLS|CORE\s+COMPETENCIES|TECHNOLOGIES)([\s\S]*?)(?=(PROFESSIONAL\s+EXPERIENCE|EXPERIENCE|WORK\s+HISTORY|EDUCATION|PROJECTS|$))/i
    const match = current.match(skillsRegex)

    if (match) {
      const header = match[1]
      const body = match[2].trimEnd()
      const updatedBody = body ? `${body}, ${skill}` : `\n- ${skill}`
      current = current.replace(match[0], `${header}${updatedBody}\n\n`)
    } else {
      current = current + `\n\nTECHNICAL SKILLS\n- ${skill}`
    }

    setResumeText(current)
    notify(`Added "${skill}" to Skills. Click "Re-Scan" to update score.`)
  }

  const handleAddCustomRequirement = (skill) => {
    handleAddSkillToResume(skill)
    setCustomRequirement('')
  }

  // Get a bullet point suggestion for a missing skill
  const handleGenerateBullet = async (skill) => {
    setGeneratingBulletFor(skill)
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await axios.post('/api/resumes/generate-bullet', {
        skill,
        resumeText: resumeText || result?.extraction?.text || '',
        jdText: jobDescription
      }, { headers })
      setBulletModal(res.data)
    } catch (err) {
      notify(`Could not generate bullet: ${err.response?.data?.error || err.message}`)
    } finally {
      setGeneratingBulletFor(null)
    }
  }

  // Inject a bullet into the experience section of the resume text
  const handleInjectBullet = (bullet) => {
    let current = resumeText || (result?.extraction?.text || '')
    const expRegex = /(PROFESSIONAL\s+EXPERIENCE|WORK\s+EXPERIENCE|EXPERIENCE)([\s\S]*?)(?=(EDUCATION|PROJECTS|CERTIFICATIONS|$))/i
    const match = current.match(expRegex)

    if (match) {
      const header = match[1]
      const body = match[2]
      const lines = body.split('\n')
      let insertIndex = lines.findIndex(l => l.trim().startsWith('-') || l.trim().startsWith('•'))
      if (insertIndex === -1) insertIndex = 2
      lines.splice(insertIndex, 0, `- ${bullet}`)
      current = current.replace(match[0], `${header}${lines.join('\n')}\n`)
    } else {
      current = current + `\n\nPROFESSIONAL EXPERIENCE\n- ${bullet}`
    }

    setResumeText(current)
    setBulletModal(null)
    notify('Bullet added to resume text. Click "Re-Scan" to update score.')
  }

  const handleCopyBullet = (text) => {
    navigator.clipboard.writeText(text)
    notify('Copied to clipboard')
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-200 antialiased font-sans">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-slate-100 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <NavBar
        currentUser={currentUser}
        onSignIn={() => setShowAuth(true)}
        onLogout={handleLogout}
        onHistory={fetchHistory}
      />

      <main className="max-w-[1560px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left column: input */}
          <div className="lg:col-span-5 space-y-4">
            <ResumeInput
              file={file}
              resumeText={resumeText}
              jobDescription={jobDescription}
              loading={loading}
              editorTab={editorTab}
              onTabChange={setEditorTab}
              onFileChange={handleFileChange}
              onTextChange={setResumeText}
              onJdChange={setJobDescription}
              onClearFile={() => { setFile(null); setResumeText('') }}
              onAnalyze={handleAnalyze}
              onLoadSampleGood={handleLoadSampleGood}
              onLoadSamplePoor={handleLoadSamplePoor}
              onLoadSampleJD={handleLoadSampleJD}
            />

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2.5">
                <span>{error}</span>
              </div>
            )}

            {!currentUser && (
              <div className="p-3 rounded-xl border border-slate-800/60 bg-[#0D1424]/50 text-[11px] text-slate-500">
                Sign in to save your analysis history and download PDF reports.
              </div>
            )}
          </div>

          {/* Right column: results */}
          <div className="lg:col-span-7 space-y-5">
            {result ? (
              <ResultsDashboard
                result={result}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onReAnalyze={handleAnalyze}
                onAddSkillToResume={handleAddSkillToResume}
                onGenerateBullet={handleGenerateBullet}
                generatingBulletFor={generatingBulletFor}
                customRequirement={customRequirement}
                onCustomRequirementChange={setCustomRequirement}
                onAddCustomRequirement={handleAddCustomRequirement}
              />
            ) : (
              <div className="bg-[#0F1626] border border-slate-800/90 rounded-xl p-12 text-center shadow-xl flex flex-col items-center justify-center min-h-[480px]">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 text-2xl font-bold">
                  R
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-1">Ready to analyze</h3>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-6">
                  Upload a resume on the left, optionally add a job description, and click "Run Analysis".
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleLoadSampleGood}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition"
                  >
                    Load Demo Resume
                  </button>
                  <button
                    onClick={handleLoadSamplePoor}
                    className="px-4 py-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-semibold transition"
                  >
                    Load Weak Resume Demo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {showHistory && (
        <HistoryDrawer
          historyList={historyList}
          onClose={() => setShowHistory(false)}
        />
      )}

      {bulletModal && (
        <BulletModal
          data={bulletModal}
          onClose={() => setBulletModal(null)}
          onCopy={handleCopyBullet}
          onInject={handleInjectBullet}
        />
      )}
    </div>
  )
}
