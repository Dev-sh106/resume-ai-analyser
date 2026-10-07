import React from 'react'
import {
  Target, AlertCircle, Sparkles, Code2, Info,
  CheckCircle2, XCircle, Check, Download, RefreshCw, Plus
} from 'lucide-react'

// Score gauge ring
function ScoreGauge({ score }) {
  const color =
    score >= 85 ? '#34d399' :
    score >= 70 ? '#60a5fa' :
    score >= 50 ? '#fbbf24' :
    '#f87171'
  const textColor =
    score >= 85 ? 'text-emerald-400' :
    score >= 70 ? 'text-blue-400' :
    score >= 50 ? 'text-amber-400' :
    'text-rose-400'

  return (
    <div className="relative w-20 h-20 flex items-center justify-center flex-shrink-0">
      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-slate-800"
          strokeWidth="3.2"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          strokeDasharray={`${score}, 100`}
          strokeWidth="3.2"
          strokeLinecap="round"
          stroke={color}
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-xl font-extrabold ${textColor} tracking-tight`}>{score}</span>
        <span className="text-[9px] font-mono text-slate-500 uppercase">Score</span>
      </div>
    </div>
  )
}

// Main results panel with tabs
export default function ResultsDashboard({
  result, activeTab, onTabChange,
  onReAnalyze, onAddSkillToResume, onGenerateBullet, generatingBulletFor,
  customRequirement, onCustomRequirementChange, onAddCustomRequirement
}) {
  const score = result.scoring.overallScore

  const tabs = [
    { id: 'requirements', label: `Missing Skills (${result.jdMatch.missingSkills?.length || 0})`, icon: Target },
    { id: 'problems', label: `Issues (${result.scoring.allProblems.length})`, icon: AlertCircle },
    { id: 'coaching', label: 'Coaching', icon: Sparkles },
    { id: 'keywords', label: `Keywords (${result.keywords.totalSkillsCount})`, icon: Code2 },
    { id: 'raw', label: 'Raw Data', icon: Info },
  ]

  return (
    <>
      {/* Score card */}
      <div className="bg-[#0F1626] border border-slate-800/90 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <ScoreGauge score={score} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-slate-100">{result.scoring.rating}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  GRADE {result.scoring.grade}
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                {result.scoring.summaryDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {result.id && (
              <a
                href={`/api/resumes/${result.id}/report`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                PDF Report
              </a>
            )}
            <button
              onClick={onReAnalyze}
              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-Scan
            </button>
          </div>
        </div>

        {/* Subscores */}
        <div className="pt-4 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(result.scoring.subscores).map(([k, v]) => {
            const pct = Math.round((v.score / v.max) * 100)
            return (
              <div key={k} className="p-2.5 rounded-lg bg-[#0A101D] border border-slate-800/80">
                <div className="flex justify-between items-center text-[11px] mb-1">
                  <span className="text-slate-400 truncate">{v.label}</span>
                  <span className="font-mono text-slate-200 text-[10px]">{v.score}/{v.max}</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tabs + content */}
      <div className="bg-[#0F1626] border border-slate-800/90 rounded-xl overflow-hidden shadow-xl">
        <div className="border-b border-slate-800/80 px-4 flex gap-1 bg-[#0A101D] overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`py-3 px-3.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab: Missing skills */}
        {activeTab === 'requirements' && (
          <div className="p-5 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-blue-400" />
                  Skills required by the job but missing from the resume
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Click <span className="text-blue-400 font-semibold">+ Add to Skills</span> to add to your resume text,
                  or <span className="text-blue-400 font-semibold">Suggest Bullet</span> to get a bullet point template.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add custom skill..."
                  value={customRequirement}
                  onChange={e => onCustomRequirementChange(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && customRequirement.trim()) {
                      onAddCustomRequirement(customRequirement.trim())
                    }
                  }}
                  className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500"
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
                <div className="grid grid-cols-1 gap-2.5">
                  {result.jdMatch.missingSkills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#0C1220] border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center justify-between gap-4 transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-semibold text-slate-200">{skill}</span>
                          <span className="text-[10px] font-mono text-slate-500 block">Not found in resume</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAddSkillToResume(skill)}
                          className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium border border-slate-700/60 flex items-center gap-1 transition"
                        >
                          <Plus className="w-3 h-3 text-emerald-400" />
                          + Add to Skills
                        </button>
                        <button
                          disabled={generatingBulletFor === skill}
                          onClick={() => onGenerateBullet(skill)}
                          className="px-2.5 py-1 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-[11px] font-medium border border-blue-500/40 flex items-center gap-1 transition"
                        >
                          {generatingBulletFor === skill ? (
                            <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
                          ) : (
                            <Sparkles className="w-3 h-3 text-blue-400" />
                          )}
                          Suggest Bullet
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <p className="font-semibold text-slate-200">All required skills found</p>
                  <p className="text-[11px] text-slate-500 mt-1">The resume covers all skills mentioned in the job description.</p>
                </div>
              )
            ) : (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/30 rounded-xl border border-slate-800">
                <Target className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-300">No job description provided</p>
                <p className="text-[11px] text-slate-500 mt-1">Paste a job listing in the "Job Description" tab to see skill gaps.</p>
              </div>
            )}

            {result.jdMatch.matchedSkills?.length > 0 && (
              <div className="pt-4 border-t border-slate-800/60">
                <span className="text-[11px] font-mono text-slate-400 block mb-2">
                  FOUND IN RESUME ({result.jdMatch.matchedSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {result.jdMatch.matchedSkills.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[11px] bg-emerald-950/40 text-emerald-300 border border-emerald-800/50 flex items-center gap-1 font-mono">
                      <Check className="w-3 h-3 text-emerald-400" />
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
          <div className="p-5 space-y-4">
            {result.scoring.criticalIssues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />
                  Critical Issues ({result.scoring.criticalIssues.length})
                </h4>
                {result.scoring.criticalIssues.map((p, i) => (
                  <div key={i} className="p-3 bg-rose-950/30 border border-rose-900/50 rounded-xl text-xs space-y-1">
                    <div className="font-semibold text-rose-200">[{p.category}] {p.issue}</div>
                    <div className="text-slate-400 text-[11px]">Fix: <span className="text-slate-300 font-medium">{p.suggestion}</span></div>
                  </div>
                ))}
              </div>
            )}

            {result.scoring.warnings.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Warnings ({result.scoring.warnings.length})
                </h4>
                {result.scoring.warnings.map((p, i) => (
                  <div key={i} className="p-3 bg-amber-950/30 border border-amber-900/50 rounded-xl text-xs space-y-1">
                    <div className="font-semibold text-amber-200">[{p.category}] {p.issue}</div>
                    <div className="text-slate-400 text-[11px]">Fix: <span className="text-slate-300 font-medium">{p.suggestion}</span></div>
                  </div>
                ))}
              </div>
            )}

            {result.scoring.recommendations.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Suggestions ({result.scoring.recommendations.length})
                </h4>
                {result.scoring.recommendations.map((p, i) => (
                  <div key={i} className="p-3 bg-blue-950/30 border border-blue-900/50 rounded-xl text-xs space-y-1">
                    <div className="font-semibold text-blue-200">[{p.category}] {p.issue}</div>
                    <div className="text-slate-400 text-[11px]">Fix: <span className="text-slate-300 font-medium">{p.suggestion}</span></div>
                  </div>
                ))}
              </div>
            )}

            {result.scoring.allProblems.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                No formatting or section issues detected.
              </div>
            )}
          </div>
        )}

        {/* Tab: Coaching */}
        {activeTab === 'coaching' && (
          <div className="p-5 space-y-4">
            <div className="flex justify-between items-center text-xs text-slate-400 pb-2 border-b border-slate-800">
              <span>Source: <span className="font-mono text-slate-200">{result.aiSuggestions?.source}</span></span>
              {result.aiSuggestions?.model && (
                <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-blue-400">
                  {result.aiSuggestions.model}
                </span>
              )}
            </div>

            {result.aiSuggestions?.llmNote && (
              <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-900/50 text-[11px] text-blue-300">
                {result.aiSuggestions.llmNote}
              </div>
            )}

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
              {result.aiSuggestions?.markdownFeedback}
            </div>
          </div>
        )}

        {/* Tab: Keywords */}
        {activeTab === 'keywords' && (
          <div className="p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-300">
              Skills found in resume ({result.keywords.totalSkillsCount})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(result.keywords.skillsByCategory).map(([cat, skills]) => (
                <div key={cat} className="p-3 bg-[#0A101D] border border-slate-800/80 rounded-xl space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 font-semibold block">{cat} ({skills.length})</span>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-200 border border-slate-700/60">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { label: 'FILE TYPE', value: result.extraction.fileType },
                { label: 'WORD COUNT', value: result.extraction.wordCount },
                { label: 'PAGE COUNT', value: result.extraction.pageCount },
                { label: 'LINE COUNT', value: result.extraction.lineCount },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-[#0A101D] rounded-xl border border-slate-800/80">
                  <div className="text-[10px] text-slate-500 font-mono">{label}</div>
                  <div className="text-sm font-bold text-slate-200 mt-1">{value}</div>
                </div>
              ))}
            </div>
            <div>
              <span className="text-[11px] font-mono text-slate-400 block mb-2">EXTRACTED TEXT</span>
              <textarea
                readOnly
                value={result.extraction.text}
                className="w-full h-64 p-3 bg-[#090E1A] border border-slate-800 rounded-lg text-xs font-mono text-slate-400 resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
