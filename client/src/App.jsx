import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Zap, CheckCircle } from 'lucide-react'

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
  const [textModified, setTextModified] = useState(false)
  const [downloadingReport, setDownloadingReport] = useState(false)
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

  // Auth state
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [currentUser, setCurrentUser] = useState(null)
  const [showAuth, setShowAuth] = useState(false)
  const [historyList, setHistoryList] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  // Toast
  const [toast, setToast] = useState(null)
  const notify = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
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
    notify(`Welcome back, ${user.name}!`, 'success')
  }

  const handleLogout = () => {
    setToken('')
    localStorage.removeItem('token')
    setCurrentUser(null)
    notify('Logged out successfully')
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
      notify(err.response?.data?.error || 'Could not load history', 'error')
    }
  }

  // File input handler
  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setResumeText('')
    setTextModified(false)
    setResult(null)
    if (f.name.endsWith('.txt')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setResumeText(ev.target.result)
        setTextModified(false)
      }
      reader.readAsText(f)
    }
  }

  // Sample data
  const handleLoadSampleGood = () => {
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
    setTextModified(false)
    setResult(null)
    notify('Loaded demo resume (sample data)')
  }

  const handleLoadSamplePoor = () => {
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
    setTextModified(false)
    setResult(null)
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
  // BUG FIX: Always prefer extracted resumeText for re-scans.
  // This prevents binary re-upload on re-scans which caused score=9 on some PDF files.
  const handleAnalyze = async () => {
    if (!file && !resumeText.trim()) {
      setError('Upload a resume file or paste text in the Text Editor tab.')
      return
    }
    setError('')
    setLoading(true)

    const formData = new FormData()

    // If we already have extracted/edited text (from previous parse or manual edit),
    // always use it. This prevents binary re-upload from causing score variability.
    // Only send the binary file on the very first analysis (no text yet).
    if (resumeText.trim()) {
      formData.append('resumeText', resumeText)
      formData.append('filename', file ? file.name : 'resume_editor.txt')
    } else if (file) {
      // No text yet — send binary file for first-time extraction
      formData.append('resume', file)
    }

    if (jobDescription) formData.append('jobDescription', jobDescription)

    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    try {
      const response = await axios.post('/api/resumes/analyze', formData, { headers })
      setResult(response.data)
      // Populate resumeText from extracted content so subsequent re-scans use text
      if (response.data?.extraction?.text && !textModified) {
        setResumeText(response.data.extraction.text)
      }
      notify(`Analysis complete — Score: ${response.data.scoring.overallScore}/100`, 'success')
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  // Handle PDF report downloads
  // BUG FIX: Always use POST /report/generate for current analysis (works for ALL users including guests).
  // Only use GET /:id/report when downloading from history (requires saved ID + auth).
  const handleDownloadReport = async (reportId = null, customFilename = null) => {
    setDownloadingReport(true)
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      let response
      let targetName = customFilename || (file ? file.name : (result?.filename || 'Resume'))
      targetName = targetName.replace(/[^\w.-]/g, '_').replace(/\.pdf$/i, '')

      if (reportId && token) {
        // Downloading a saved historical report (requires auth + ownership)
        response = await axios.get(`/api/resumes/${reportId}/report`, {
          headers,
          responseType: 'blob'
        })
      } else if (result?.scoring) {
        // On-demand PDF generation from current analysis (works for ALL users)
        response = await axios.post('/api/resumes/report/generate', {
          scoring: result.scoring,
          jdMatch: result.jdMatch,
          filename: targetName
        }, {
          headers,
          responseType: 'blob'
        })
      } else {
        notify('No analysis result available to generate report.', 'error')
        return
      }

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ATS_Report_${targetName}.pdf`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
      notify('PDF report downloaded successfully!', 'success')
    } catch (err) {
      console.error('Download report error:', err)
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text()
          const json = JSON.parse(text)
          notify(json.error || 'Failed to download report.', 'error')
        } catch {
          notify('Failed to download report.', 'error')
        }
      } else {
        notify(err.response?.data?.error || err.message || 'Failed to download report.', 'error')
      }
    } finally {
      setDownloadingReport(false)
    }
  }

  const handleAddSkillToResume = (skill) => {
    let current = resumeText || (result?.extraction?.text || '')
    if (!current) {
      notify('No resume text found. Use the Text Editor tab to paste your resume.', 'error')
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
    setTextModified(true)
    notify(`Added "${skill}" to Skills. Click "Re-Scan" to update score.`, 'success')
  }

  const handleAddCustomRequirement = (skill) => {
    handleAddSkillToResume(skill)
    setCustomRequirement('')
  }

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
      notify(`Could not generate bullet: ${err.response?.data?.error || err.message}`, 'error')
    } finally {
      setGeneratingBulletFor(null)
    }
  }

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
    setTextModified(true)
    setBulletModal(null)
    notify('Bullet added to resume text. Click "Re-Scan" to update score.', 'success')
  }

  const handleCopyBullet = (text) => {
    navigator.clipboard.writeText(text)
    notify('Copied to clipboard')
  }

  return (
    <div className="min-h-screen bg-[#060B14] text-slate-200 antialiased font-sans">
      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border text-sm max-w-xs ${toast.type === 'success'
          ? 'bg-emerald-950/90 border-emerald-700/60 text-emerald-200'
          : toast.type === 'error'
            ? 'bg-rose-950/90 border-rose-700/60 text-rose-200'
            : 'bg-slate-900/95 border-slate-700/60 text-slate-100'
          }`}>
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <Zap className="w-4 h-4 text-blue-400 flex-shrink-0" />
          )}
          <span className="text-xs font-medium">{toast.msg}</span>
        </div>
      )}

      <NavBar
        currentUser={currentUser}
        onSignIn={() => setShowAuth(true)}
        onLogout={handleLogout}
        onHistory={fetchHistory}
      />

      <main className="max-w-[1560px] mx-auto px-4 sm:px-6 py-8">
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
              onTextChange={(val) => { setResumeText(val); setTextModified(true) }}
              onJdChange={setJobDescription}
              onClearFile={() => { setFile(null); setResumeText(''); setTextModified(false); setResult(null) }}
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
              <div className="p-3 rounded-xl border border-slate-800/40 bg-[#0A1020]/60 text-[11px] text-slate-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60 flex-shrink-0" />
                Sign in to save analysis history. PDF download works without signing in.
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
                onDownloadReport={handleDownloadReport}
                downloadingReport={downloadingReport}
                onAddSkillToResume={handleAddSkillToResume}
                onGenerateBullet={handleGenerateBullet}
                generatingBulletFor={generatingBulletFor}
                customRequirement={customRequirement}
                onCustomRequirementChange={setCustomRequirement}
                onAddCustomRequirement={handleAddCustomRequirement}
              />
            ) : (
              <EmptyState onLoadSampleGood={handleLoadSampleGood} onLoadSamplePoor={handleLoadSamplePoor} />
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
          onDownloadReport={handleDownloadReport}
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

function EmptyState({ onLoadSampleGood, onLoadSamplePoor }) {
  return (
    <div className="bg-[#0C1424] border border-slate-800/60 rounded-2xl p-12 text-center shadow-xl flex flex-col items-center justify-center min-h-[520px] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-blue-600/5 blur-3xl" />
      </div>

      {/* Icon */}
      <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600/20 to-violet-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6 shadow-lg shadow-blue-900/20">
        <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h3 className="text-lg font-bold text-slate-100 mb-2">Ready to Analyze</h3>
      <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-8">
        Upload your resume on the left, optionally paste a job description, and hit{' '}
        <span className="text-blue-400 font-medium">Run Analysis</span> to get your ATS score.
      </p>

      {/* Feature badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {['ATS Score', 'Keyword Gap Analysis', 'AI Coaching', 'PDF Report'].map(f => (
          <span key={f} className="px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700/50 text-[11px] text-slate-400 font-medium">
            {f}
          </span>
        ))}
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={onLoadSampleGood}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-blue-900/30"
        >
          Load Strong Resume Demo
        </button>
        <button
          onClick={onLoadSamplePoor}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition border border-slate-700/60"
        >
          Load Weak Resume Demo
        </button>
      </div>
    </div>
  )
}
