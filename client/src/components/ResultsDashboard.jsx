import React, { useState } from 'react'
import {
  Target, AlertCircle, Sparkles, Code2, Info,
  CheckCircle2, XCircle, Check, Download, RefreshCw, Plus,
  AlertTriangle, TrendingUp, FileBarChart2, Copy, Search,
  Award, ShieldAlert, CheckCheck, ExternalLink
} from 'lucide-react'

// Animated score gauge ring with glowing ambient halo
function ScoreGauge({ score }) {
  const getStyle = (s) => {
    if (s >= 85) return { stroke: '#10b981', text: 'text-emerald-400', bg: 'from-emerald-500/20 via-teal-500/10 to-transparent', glow: 'shadow-emerald-500/25', tier: 'Top 5% · ATS Ready' }
    if (s >= 70) return { stroke: '#3b82f6', text: 'text-blue-400', bg: 'from-blue-500/20 via-indigo-500/10 to-transparent', glow: 'shadow-blue-500/25', tier: 'Competitive · Good' }
    if (s >= 50) return { stroke: '#f59e0b', text: 'text-amber-400', bg: 'from-amber-500/20 via-orange-500/10 to-transparent', glow: 'shadow-amber-500/25', tier: 'Needs Optimization' }
    return { stroke: '#ef4444', text: 'text-rose-400', bg: 'from-rose-500/20 via-red-500/10 to-transparent', glow: 'shadow-rose-500/25', tier: 'Critical ATS Gaps' }
  }

  const s = getStyle(score)
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={`relative w-28 h-28 flex items-center justify-center flex-shrink-0 rounded-2xl bg-gradient-to-tr ${s.bg} border border-slate-800/80 shadow-xl ${s.glow}`}>
      <svg className="w-28 h-28 absolute inset-0 transform -rotate-90 p-1" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} stroke="#172033" strokeWidth="7" fill="none" />
        <circle
          cx="50" cy="50" r={radius}
          stroke={s.stroke}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="relative flex flex-col items-center justify-center text-center">
        <span className={`text-3xl font-black ${s.text} tracking-tight leading-none`}>{score}</span>
        <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest mt-1">/ 100</span>
      </div>
    </div>
  )
}

// Subscore progress bar row with status icon
function SubscoreBar({ label, score, max }) {
  const pct = Math.min(100, Math.round((score / max) * 100))
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'
  const textColor = pct >= 80 ? 'text-emerald-400' : pct >= 60 ? 'text-blue-400' : pct >= 40 ? 'text-amber-400' : 'text-rose-400'

  return (
    <div className="p-3 bg-[#070D18]/70 border border-slate-800/80 rounded-xl space-y-1.5 transition hover:border-slate-700/80">
      <div className="flex justify-between items-center text-xs">
        <span className="text-slate-300 font-medium truncate">{label}</span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`font-mono text-[11px] font-bold ${textColor}`}>{score}/{max}</span>
          <span className="text-[10px] text-slate-500 font-mono">({pct}%)</span>
        </div>
      </div>
      <div className="w-full bg-slate-800/90 h-1.5 rounded-full overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// Main results dashboard
export default function ResultsDashboard({
  result, activeTab, onTabChange,
  onReAnalyze, onDownloadReport, downloadingReport,
  onAddSkillToResume, onGenerateBullet, generatingBulletFor,
  customRequirement, onCustomRequirementChange, onAddCustomRequirement
}) {
  const [issueFilter, setIssueFilter] = useState('all')
  const [skillSearch, setSkillSearch] = useState('')
  const [copiedSummary, setCopiedSummary] = useState(false)

  const score = result.scoring.overallScore

  const getGradeColor = (g) => {
    if (g === 'A') return 'bg-emerald-950/60 text-emerald-300 border-emerald-600/40'
    if (g === 'B') return 'bg-blue-950/60 text-blue-300 border-blue-600/40'
    if (g === 'C') return 'bg-amber-950/60 text-amber-300 border-amber-600/40'
    return 'bg-rose-950/60 text-rose-300 border-rose-600/40'
  }

  const handleCopySummary = () => {
    const text = `ATS Score: ${score}/100 (Grade ${result.scoring.grade} - ${result.scoring.rating})\nStrengths: ${result.scoring.strengths?.length || 0}\nCritical Issues: ${result.scoring.criticalIssues?.length || 0}\nWarnings: ${result.scoring.warnings?.length || 0}\nMatched JD Skills: ${result.jdMatch.matchedSkills?.length || 0}`
    navigator.clipboard.writeText(text)
    setCopiedSummary(true)
    setTimeout(() => setCopiedSummary(false), 2000)
  }

  const tabs = [
    { id: 'requirements', label: 'Skill Gaps', count: result.jdMatch.missingSkills?.length || 0, icon: Target },
    { id: 'problems', label: 'Issues & Fixes', count: result.scoring.allProblems.length, icon: AlertCircle },
    { id: 'coaching', label: 'AI Coach', count: null, icon: Sparkles },
    { id: 'keywords', label: 'Keyword Universe', count: result.keywords.totalSkillsCount, icon: Code2 },
    { id: 'raw', label: 'Raw Extraction', count: null, icon: FileBarChart2 },
  ]

  // Filter issues
  const filteredProblems = {
    critical: result.scoring.criticalIssues || [],
    warnings: result.scoring.warnings || [],
    recommendations: result.scoring.recommendations || []
  }

  // Filter skills
  const filteredMissingSkills = (result.jdMatch.missingSkills || []).filter(s =>
    s.toLowerCase().includes(skillSearch.toLowerCase().trim())
  )

  return (
    <div className="space-y-5">
      {/* 1. Hero Score Card */}
      <div className="bg-[#0A1020]/90 border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/40 backdrop-blur-md relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-80 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-5 border-b border-slate-800/80">
          {/* Left: Gauge + Rating + Summary */}
          <div className="flex items-center gap-5">
            <ScoreGauge score={score} />
            <div className="space-y-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-lg font-extrabold text-white tracking-tight">{result.scoring.rating}</span>
                <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-extrabold border shadow-sm ${getGradeColor(result.scoring.grade)}`}>
                  GRADE {result.scoring.grade}
                </span>
                <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/60">
                  {score >= 80 ? 'ATS Optimized' : score >= 60 ? 'Fair Match' : 'Action Needed'}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-sm leading-relaxed">
                {result.scoring.summaryDesc}
              </p>

              {/* Quick statistics pills */}
              <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                {result.scoring.criticalIssues.length > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-rose-300 font-semibold bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-800/50">
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    {result.scoring.criticalIssues.length} critical
                  </span>
                )}
                {result.scoring.warnings.length > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-amber-300 font-semibold bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-800/50">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    {result.scoring.warnings.length} warnings
                  </span>
                )}
                {result.scoring.strengths?.length > 0 && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-semibold bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-800/50">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {result.scoring.strengths.length} strengths
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => onDownloadReport()}
              disabled={downloadingReport}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-blue-900/30 disabled:opacity-50 cursor-pointer border border-blue-400/20"
              title="Download professional PDF audit report"
            >
              <Download className={`w-4 h-4 ${downloadingReport ? 'animate-bounce text-cyan-300' : 'text-white'}`} />
              <span>{downloadingReport ? 'Generating PDF...' : 'Download PDF Report'}</span>
            </button>

            <button
              onClick={onReAnalyze}
              className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              title="Re-run ATS scan with updated text"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
              <span>Re-Scan</span>
            </button>

            <button
              onClick={handleCopySummary}
              className="p-2.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60 rounded-xl transition cursor-pointer"
              title="Copy ATS Score Summary"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
            </button>
          </div>
        </div>

        {/* Subscore 5-Pillar Breakdown */}
        <div className="pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
              ATS Scoring Pillars
            </span>
            <span className="text-[10px] font-mono text-slate-500">80%+ required for high ATS pass rate</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(result.scoring.subscores).map(([k, v]) => (
              <SubscoreBar key={k} label={v.label} score={v.score} max={v.max} />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Job Description Match Meter (when JD provided) */}
      {result.jdMatch.hasJd && (
        <div className="bg-[#0A1020]/90 border border-slate-800/80 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl shadow-black/30 backdrop-blur-md">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 shadow-inner">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Target Job Description Match</span>
                <span className={`text-[10px] px-2 py-0.2 rounded-md font-mono font-bold border ${
                  (result.jdMatch.matchPercentage || 0) >= 70
                    ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50'
                    : (result.jdMatch.matchPercentage || 0) >= 45
                    ? 'bg-blue-950/50 text-blue-400 border-blue-800/50'
                    : 'bg-amber-950/50 text-amber-400 border-amber-800/50'
                }`}>
                  {(result.jdMatch.matchPercentage || 0) >= 70 ? 'High Match' : (result.jdMatch.matchPercentage || 0) >= 45 ? 'Moderate Match' : 'Low Match'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                <span className="text-emerald-400 font-semibold">{result.jdMatch.matchedSkills?.length || 0}</span> matched of{' '}
                <span className="text-slate-200 font-semibold">{(result.jdMatch.matchedSkills?.length || 0) + (result.jdMatch.missingSkills?.length || 0)}</span> essential job skills
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-2xl font-black font-mono ${
              (result.jdMatch.matchPercentage || 0) >= 70 ? 'text-emerald-400' :
              (result.jdMatch.matchPercentage || 0) >= 45 ? 'text-blue-400' : 'text-amber-400'
            }`}>
              {result.jdMatch.matchPercentage || 0}%
            </span>
            <div className="w-24 sm:w-32 h-2 rounded-full bg-slate-800 overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  (result.jdMatch.matchPercentage || 0) >= 70 ? 'bg-emerald-500' :
                  (result.jdMatch.matchPercentage || 0) >= 45 ? 'bg-blue-500' : 'bg-amber-500'
                }`}
                style={{ width: `${result.jdMatch.matchPercentage || 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Tabs & Tab Content */}
      <div className="bg-[#0A1020]/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 backdrop-blur-md">
        {/* Tab Navigation Header */}
        <div className="border-b border-slate-800/80 px-4 flex gap-1 bg-[#060B14]/80 overflow-x-auto scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-3.5 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-blue-500 text-blue-300 bg-blue-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab 1: Skill Gaps */}
        {activeTab === 'requirements' && (
          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-rose-400" />
                  Target Skills Missing from Your Resume ({result.jdMatch.missingSkills?.length || 0})
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click <span className="text-emerald-400 font-semibold">+ Add</span> to insert into skills, or{' '}
                  <span className="text-blue-400 font-semibold">AI Bullet</span> to create an ATS STAR bullet point.
                </p>
              </div>

              {/* Skill search + Custom skill input */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Filter missing..."
                    value={skillSearch}
                    onChange={e => setSkillSearch(e.target.value)}
                    className="bg-[#060B14] border border-slate-700/60 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 w-32 sm:w-36"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    placeholder="Custom skill..."
                    value={customRequirement}
                    onChange={e => onCustomRequirementChange(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && customRequirement.trim()) {
                        onAddCustomRequirement(customRequirement.trim())
                      }
                    }}
                    className="bg-[#060B14] border border-slate-700/60 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 w-32 sm:w-36"
                  />
                  <button
                    disabled={!customRequirement.trim()}
                    onClick={() => onAddCustomRequirement(customRequirement.trim())}
                    className="p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-xl transition cursor-pointer"
                    title="Add custom skill"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Missing Skills Grid */}
            {result.jdMatch.hasJd ? (
              filteredMissingSkills.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {filteredMissingSkills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#070D18] border border-slate-800/80 hover:border-rose-700/50 rounded-xl flex items-center justify-between gap-3 transition group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                        <span className="text-xs font-semibold text-slate-200 truncate">{skill}</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => onAddSkillToResume(skill)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 text-[11px] font-semibold border border-emerald-800/50 flex items-center gap-1 transition cursor-pointer"
                          title="Inject this skill into resume Skills section"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                        <button
                          disabled={generatingBulletFor === skill}
                          onClick={() => onGenerateBullet(skill)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-[11px] font-semibold border border-blue-500/35 flex items-center gap-1 transition cursor-pointer"
                          title="Generate STAR experience bullet with this skill"
                        >
                          {generatingBulletFor === skill ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-blue-400" />
                          )}
                          AI Bullet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-emerald-950/20 rounded-xl border border-emerald-800/40">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-emerald-300 text-sm">All Job Skills Found in Resume!</p>
                  <p className="text-xs text-slate-400 mt-1">Your resume matches all identified skills from the job description.</p>
                </div>
              )
            ) : (
              <div className="p-8 text-center bg-[#070D18] rounded-xl border border-slate-800/60">
                <Target className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="font-bold text-slate-300 text-sm">No Job Description Attached</p>
                <p className="text-xs text-slate-500 mt-1">Paste a job description in the left tab to analyze exact keyword gaps.</p>
              </div>
            )}

            {/* Matched Skills Pill Cloud */}
            {result.jdMatch.matchedSkills?.length > 0 && (
              <div className="pt-4 border-t border-slate-800/60">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Skills in Resume ({result.jdMatch.matchedSkills.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.jdMatch.matchedSkills.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-xs bg-emerald-950/30 text-emerald-300 border border-emerald-800/40 flex items-center gap-1.5 font-mono">
                      <Check className="w-3 h-3 text-emerald-400" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Issues & Warnings */}
        {activeTab === 'problems' && (
          <div className="p-5 sm:p-6 space-y-5">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800/60 flex-wrap">
              <button
                onClick={() => setIssueFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  issueFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                All Issues ({result.scoring.allProblems.length})
              </button>
              <button
                onClick={() => setIssueFilter('critical')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  issueFilter === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Critical ({filteredProblems.critical.length})
              </button>
              <button
                onClick={() => setIssueFilter('warnings')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  issueFilter === 'warnings' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Warnings ({filteredProblems.warnings.length})
              </button>
              <button
                onClick={() => setIssueFilter('recommendations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  issueFilter === 'recommendations' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                Suggestions ({filteredProblems.recommendations.length})
              </button>
            </div>

            {/* Critical Issues */}
            {(issueFilter === 'all' || issueFilter === 'critical') && filteredProblems.critical.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  Critical Issues ({filteredProblems.critical.length})
                </h4>
                <div className="space-y-2.5">
                  {filteredProblems.critical.map((p, i) => (
                    <div key={i} className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-xl text-xs space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-200 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          {p.issue}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-rose-900/60 text-[10px] font-mono text-rose-300 border border-rose-700/50 uppercase">
                          {p.category}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#060B14]/80 border border-rose-900/30 text-slate-300 text-xs">
                        <span className="text-rose-400 font-semibold">Recommended Fix: </span>
                        {p.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {(issueFilter === 'all' || issueFilter === 'warnings') && filteredProblems.warnings.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Warnings ({filteredProblems.warnings.length})
                </h4>
                <div className="space-y-2.5">
                  {filteredProblems.warnings.map((p, i) => (
                    <div key={i} className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-xl text-xs space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-200 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {p.issue}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-900/60 text-[10px] font-mono text-amber-300 border border-amber-700/50 uppercase">
                          {p.category}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#060B14]/80 border border-amber-900/30 text-slate-300 text-xs">
                        <span className="text-amber-400 font-semibold">Recommended Fix: </span>
                        {p.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {(issueFilter === 'all' || issueFilter === 'recommendations') && filteredProblems.recommendations.length > 0 && (
              <div className="space-y-2.5">
                <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Coaching Recommendations ({filteredProblems.recommendations.length})
                </h4>
                <div className="space-y-2.5">
                  {filteredProblems.recommendations.map((p, i) => (
                    <div key={i} className="p-4 bg-blue-950/20 border border-blue-900/40 rounded-xl text-xs space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-200 text-sm flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          {p.issue}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-blue-900/60 text-[10px] font-mono text-blue-300 border border-blue-700/50 uppercase">
                          {p.category}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#060B14]/80 border border-blue-900/30 text-slate-300 text-xs">
                        <span className="text-blue-400 font-semibold">Pro-Tip: </span>
                        {p.suggestion}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.scoring.allProblems.length === 0 && (
              <div className="p-8 text-center bg-emerald-950/20 rounded-xl border border-emerald-800/40">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-emerald-300">Clean ATS Compliance!</p>
                <p className="text-xs text-slate-400 mt-1">Zero critical issues or formatting blockers found.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: AI Coaching */}
        {activeTab === 'coaching' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-slate-300 font-medium">
                  Advisor Engine: <span className="font-mono text-slate-100">{result.aiSuggestions?.source}</span>
                </span>
              </div>
              {result.aiSuggestions?.model && (
                <span className="font-mono text-[10px] bg-blue-950/50 border border-blue-800/50 px-2.5 py-1 rounded-lg text-blue-300 font-bold">
                  {result.aiSuggestions.model}
                </span>
              )}
            </div>

            {result.aiSuggestions?.llmNote && (
              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-900/40 text-xs text-blue-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <span>{result.aiSuggestions.llmNote}</span>
              </div>
            )}

            <div className="p-4 bg-[#070D18] rounded-xl border border-slate-800/80 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap selection:bg-blue-600/30">
              {result.aiSuggestions?.markdownFeedback}
            </div>
          </div>
        )}

        {/* Tab 4: Keyword Universe */}
        {activeTab === 'keywords' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-400" />
                Detected Skills & Competencies ({result.keywords.totalSkillsCount})
              </h4>
              <span className="text-[10px] font-mono text-slate-500">Categorized by ATS Parser</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {Object.entries(result.keywords.skillsByCategory).map(([cat, skills]) => (
                <div key={cat} className="p-4 bg-[#070D18] border border-slate-800/80 rounded-xl space-y-2.5 hover:border-slate-700/80 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-300 font-bold uppercase tracking-wider">{cat}</span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-bold">{skills.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((s, i) => (
                      <span key={i} className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-slate-800/80 text-slate-200 border border-slate-700/60">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Raw Document Extraction */}
        {activeTab === 'raw' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'File Type', value: result.extraction.fileType },
                { label: 'Word Count', value: result.extraction.wordCount },
                { label: 'Estimated Pages', value: result.extraction.pageCount },
                { label: 'Lines of Text', value: result.extraction.lineCount },
              ].map(({ label, value }) => (
                <div key={label} className="p-3.5 bg-[#070D18] rounded-xl border border-slate-800/80 text-center">
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">{label}</div>
                  <div className="text-base font-extrabold text-white">{value}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                  Raw Parsed Text Representation
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{result.extraction.text?.length || 0} characters</span>
              </div>
              <textarea
                readOnly
                value={result.extraction.text}
                className="w-full h-72 p-4 bg-[#060B14] border border-slate-800/80 rounded-xl text-xs font-mono text-slate-300 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/30 leading-relaxed"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
