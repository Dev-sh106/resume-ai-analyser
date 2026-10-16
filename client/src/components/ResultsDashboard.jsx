import React from 'react'
import {
  Target, AlertCircle, Sparkles, Code2, Info,
  CheckCircle2, XCircle, Check, Download, RefreshCw, Plus,
  AlertTriangle, TrendingUp, FileBarChart2
} from 'lucide-react'

// Animated score gauge ring
function ScoreGauge({ score }) {
  const getColor = (s) => {
    if (s >= 85) return { stroke: '#34d399', text: 'text-emerald-400', bg: 'from-emerald-500/20 to-emerald-700/5', border: 'border-emerald-500/20' }
    if (s >= 70) return { stroke: '#60a5fa', text: 'text-blue-400', bg: 'from-blue-500/20 to-blue-700/5', border: 'border-blue-500/20' }
    if (s >= 50) return { stroke: '#fbbf24', text: 'text-amber-400', bg: 'from-amber-500/20 to-amber-700/5', border: 'border-amber-500/20' }
    return { stroke: '#f87171', text: 'text-rose-400', bg: 'from-rose-500/20 to-rose-700/5', border: 'border-rose-500/20' }
  }
  const c = getColor(score)
  const circumference = 2 * Math.PI * 38
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className={`relative w-24 h-24 flex items-center justify-center flex-shrink-0 rounded-2xl bg-gradient-to-br ${c.bg} border ${c.border} shadow-lg`}>
      <svg className="w-24 h-24 absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" stroke="#1e293b" strokeWidth="6" fill="none" />
        <circle
          cx="50" cy="50" r="38"
          stroke={c.stroke}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      <div className="relative flex flex-col items-center">
        <span className={`text-2xl font-black ${c.text} tracking-tight leading-none`}>{score}</span>
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mt-0.5">/ 100</span>
      </div>
    </div>
  )
}

// Subscore progress bar row
function SubscoreBar({ label, score, max }) {
  const pct = Math.round((score / max) * 100)
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-blue-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-slate-400 truncate">{label}</span>
        <span className="text-[10px] font-mono text-slate-300 ml-2 flex-shrink-0">{score}/{max}</span>
      </div>
      <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
        <div
          className={`${color} h-full rounded-full transition-all duration-700`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// Main results panel with tabs
export default function ResultsDashboard({
  result, activeTab, onTabChange,
  onReAnalyze, onDownloadReport, downloadingReport,
  onAddSkillToResume, onGenerateBullet, generatingBulletFor,
  customRequirement, onCustomRequirementChange, onAddCustomRequirement
}) {
  const score = result.scoring.overallScore
  const getGradeColor = (g) => {
    if (g === 'A') return 'bg-emerald-950/60 text-emerald-300 border-emerald-700/40'
    if (g === 'B') return 'bg-blue-950/60 text-blue-300 border-blue-700/40'
    if (g === 'C') return 'bg-amber-950/60 text-amber-300 border-amber-700/40'
    return 'bg-rose-950/60 text-rose-300 border-rose-700/40'
  }

  const tabs = [
    { id: 'requirements', label: 'Skill Gaps', count: result.jdMatch.missingSkills?.length || 0, icon: Target },
    { id: 'problems', label: 'Issues', count: result.scoring.allProblems.length, icon: AlertCircle },
    { id: 'coaching', label: 'Coaching', count: null, icon: Sparkles },
    { id: 'keywords', label: 'Keywords', count: result.keywords.totalSkillsCount, icon: Code2 },
    { id: 'raw', label: 'Raw', count: null, icon: FileBarChart2 },
  ]

  return (
    <>
      {/* Score card */}
      <div className="bg-[#0C1424] border border-slate-800/70 rounded-2xl p-5 shadow-2xl shadow-black/30">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 pb-5 border-b border-slate-800/60">
          {/* Left: gauge + rating */}
          <div className="flex items-center gap-4">
            <ScoreGauge score={score} />
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-bold text-slate-100">{result.scoring.rating}</span>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${getGradeColor(result.scoring.grade)}`}>
                  GRADE {result.scoring.grade}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                {result.scoring.summaryDesc}
              </p>
              {/* Quick stats */}
              <div className="flex items-center gap-3 pt-1">
                {result.scoring.criticalIssues.length > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-rose-400 font-medium">
                    <XCircle className="w-3 h-3" />
                    {result.scoring.criticalIssues.length} critical
                  </span>
                )}
                {result.scoring.warnings.length > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    {result.scoring.warnings.length} warnings
                  </span>
                )}
                {result.scoring.strengths?.length > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    {result.scoring.strengths.length} strengths
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => onDownloadReport()}
              disabled={downloadingReport}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 rounded-xl text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              title="Download PDF report"
            >
              <Download className={`w-3.5 h-3.5 ${downloadingReport ? 'animate-bounce text-blue-400' : 'text-slate-400'}`} />
              {downloadingReport ? 'Downloading...' : 'PDF Report'}
            </button>
            <button
              onClick={onReAnalyze}
              className="px-3.5 py-2 bg-blue-600/15 hover:bg-blue-600/25 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-medium flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-Scan
            </button>
          </div>
        </div>

        {/* Subscores */}
        <div className="pt-4 space-y-3">
          <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest block mb-3">Subscore Breakdown</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {Object.entries(result.scoring.subscores).map(([k, v]) => (
              <SubscoreBar key={k} label={v.label} score={v.score} max={v.max} />
            ))}
          </div>
        </div>
      </div>

      {/* JD match summary (if available) */}
      {result.jdMatch.hasJd && (
        <div className="bg-[#0C1424] border border-slate-800/70 rounded-2xl px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Job Description Match</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {result.jdMatch.matchedSkills?.length || 0} of {((result.jdMatch.matchedSkills?.length || 0) + (result.jdMatch.missingSkills?.length || 0))} required skills found
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xl font-black font-mono ${
              (result.jdMatch.matchPercentage || 0) >= 70 ? 'text-emerald-400' :
              (result.jdMatch.matchPercentage || 0) >= 40 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              {result.jdMatch.matchPercentage || 0}%
            </span>
            <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  (result.jdMatch.matchPercentage || 0) >= 70 ? 'bg-emerald-500' :
                  (result.jdMatch.matchPercentage || 0) >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${result.jdMatch.matchPercentage || 0}%`, transition: 'width 0.7s ease' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs + content */}
      <div className="bg-[#0C1424] border border-slate-800/70 rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
        <div className="border-b border-slate-800/60 px-4 flex gap-0.5 bg-[#080E1B]/60 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-3 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-300'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-slate-600'}`} />
                {tab.label}
                {tab.count !== null && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                    isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab: Missing skills / Skill Gaps */}
        {activeTab === 'requirements' && (
          <div className="p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/50">
              <div>
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-400" />
                  Skills required by the JD but missing from your resume
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Click <span className="text-blue-400">+ Add</span> to inject into your resume text, or <span className="text-blue-400">Suggest Bullet</span> for a template.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
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
                  className="bg-[#0A1020] border border-slate-700/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/60 w-36"
                />
                <button
                  disabled={!customRequirement.trim()}
                  onClick={() => onAddCustomRequirement(customRequirement.trim())}
                  className="p-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white rounded-lg transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {result.jdMatch.hasJd ? (
              result.jdMatch.missingSkills?.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {result.jdMatch.missingSkills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#0A1020] border border-slate-800/60 hover:border-rose-800/50 rounded-xl flex items-center justify-between gap-4 transition group"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-semibold text-slate-200">{skill}</span>
                          <span className="text-[10px] text-slate-600 block">Not found in resume</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onAddSkillToResume(skill)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-900/40 hover:border-emerald-700/60 text-slate-300 hover:text-emerald-300 text-[11px] font-medium border border-slate-700/50 flex items-center gap-1 transition"
                        >
                          <Plus className="w-3 h-3" />
                          Add
                        </button>
                        <button
                          disabled={generatingBulletFor === skill}
                          onClick={() => onGenerateBullet(skill)}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/15 hover:bg-blue-600/25 text-blue-300 text-[11px] font-medium border border-blue-500/30 flex items-center gap-1 transition"
                        >
                          {generatingBulletFor === skill ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Sparkles className="w-3 h-3" />
                          )}
                          Bullet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-emerald-950/20 rounded-xl border border-emerald-800/30">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                  <p className="font-semibold text-emerald-300 text-sm">All required skills found!</p>
                  <p className="text-[11px] text-slate-500 mt-1">Your resume covers all skills in the job description.</p>
                </div>
              )
            ) : (
              <div className="p-8 text-center bg-slate-900/30 rounded-xl border border-slate-800/50">
                <Target className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-300 text-sm">No job description provided</p>
                <p className="text-[11px] text-slate-500 mt-1">Paste a job listing in the "Job Description" tab to see skill gaps.</p>
              </div>
            )}

            {result.jdMatch.matchedSkills?.length > 0 && (
              <div className="pt-3 border-t border-slate-800/50">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2">
                  Found in resume ({result.jdMatch.matchedSkills.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.jdMatch.matchedSkills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg text-[11px] bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 flex items-center gap-1 font-mono">
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Issues */}
        {activeTab === 'problems' && (
          <div className="p-5 space-y-5">
            {result.scoring.criticalIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  Critical Issues ({result.scoring.criticalIssues.length})
                </h4>
                <div className="space-y-2">
                  {result.scoring.criticalIssues.map((p, i) => (
                    <div key={i} className="p-3.5 bg-rose-950/25 border border-rose-900/40 rounded-xl text-xs space-y-1.5">
                      <div className="font-semibold text-rose-200 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-rose-900/50 text-[9px] font-mono text-rose-400 border border-rose-800/50">{p.category}</span>
                        {p.issue}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Fix: <span className="text-slate-300 font-medium">{p.suggestion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.scoring.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Warnings ({result.scoring.warnings.length})
                </h4>
                <div className="space-y-2">
                  {result.scoring.warnings.map((p, i) => (
                    <div key={i} className="p-3.5 bg-amber-950/25 border border-amber-900/40 rounded-xl text-xs space-y-1.5">
                      <div className="font-semibold text-amber-200 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-amber-900/50 text-[9px] font-mono text-amber-400 border border-amber-800/50">{p.category}</span>
                        {p.issue}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Fix: <span className="text-slate-300 font-medium">{p.suggestion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.scoring.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Suggestions ({result.scoring.recommendations.length})
                </h4>
                <div className="space-y-2">
                  {result.scoring.recommendations.map((p, i) => (
                    <div key={i} className="p-3.5 bg-blue-950/20 border border-blue-900/40 rounded-xl text-xs space-y-1.5">
                      <div className="font-semibold text-blue-200 flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded bg-blue-900/50 text-[9px] font-mono text-blue-400 border border-blue-800/50">{p.category}</span>
                        {p.issue}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Fix: <span className="text-slate-300 font-medium">{p.suggestion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.scoring.allProblems.length === 0 && (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-semibold text-emerald-300">No issues detected</p>
                <p className="text-xs text-slate-500 mt-1">Your resume has excellent formatting and structure.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab: Coaching */}
        {activeTab === 'coaching' && (
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-800/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-slate-400">
                  Source: <span className="font-mono text-slate-200">{result.aiSuggestions?.source}</span>
                </span>
              </div>
              {result.aiSuggestions?.model && (
                <span className="font-mono text-[10px] bg-blue-950/40 border border-blue-800/40 px-2 py-0.5 rounded-lg text-blue-400">
                  {result.aiSuggestions.model}
                </span>
              )}
            </div>

            {result.aiSuggestions?.llmNote && (
              <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-900/40 text-[11px] text-blue-300 flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                {result.aiSuggestions.llmNote}
              </div>
            )}

            <div className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
              {result.aiSuggestions?.markdownFeedback}
            </div>
          </div>
        )}

        {/* Tab: Keywords */}
        {activeTab === 'keywords' && (
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-blue-400" />
                Skills found in resume ({result.keywords.totalSkillsCount})
              </h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(result.keywords.skillsByCategory).map(([cat, skills]) => (
                <div key={cat} className="p-3.5 bg-[#0A1020] border border-slate-800/60 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase tracking-wider">{cat}</span>
                    <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md">{skills.length}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800/70 text-slate-300 border border-slate-700/50">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Raw data */}
        {activeTab === 'raw' && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'File Type', value: result.extraction.fileType },
                { label: 'Words', value: result.extraction.wordCount },
                { label: 'Pages', value: result.extraction.pageCount },
                { label: 'Lines', value: result.extraction.lineCount },
              ].map(({ label, value }) => (
                <div key={label} className="p-3.5 bg-[#0A1020] rounded-xl border border-slate-800/60 text-center">
                  <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mb-1">{label}</div>
                  <div className="text-lg font-bold text-slate-200">{value}</div>
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Extracted Text</span>
                <span className="text-[10px] text-slate-600">{result.extraction.text?.length || 0} chars</span>
              </div>
              <textarea
                readOnly
                value={result.extraction.text}
                className="w-full h-64 p-3.5 bg-[#070C18] border border-slate-800/60 rounded-xl text-xs font-mono text-slate-400 resize-none focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
