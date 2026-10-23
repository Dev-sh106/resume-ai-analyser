import React, { useState } from 'react'
import { Upload, Edit3, FileText, Trash2, RefreshCw, ArrowRight, Briefcase, Sparkles, CheckCircle2, FileUp } from 'lucide-react'

// Left panel: file upload, live text editor, and target job description
export default function ResumeInput({
  file, resumeText, jobDescription, loading,
  editorTab, onTabChange,
  onFileChange, onTextChange, onJdChange, onClearFile,
  onAnalyze, onLoadSampleGood, onLoadSamplePoor, onLoadSampleJD
}) {
  const [isDragging, setIsDragging] = useState(false)
  const hasInput = Boolean(file || resumeText.trim())
  const wordCount = resumeText ? resumeText.split(/\s+/).filter(Boolean).length : 0
  const charCount = resumeText ? resumeText.length : 0
  const jdWordCount = jobDescription ? jobDescription.split(/\s+/).filter(Boolean).length : 0

  const tabs = [
    { id: 'upload', label: 'Upload File', icon: Upload, badge: file ? '1 file' : null },
    { id: 'editor', label: 'Live Text', icon: Edit3, badge: wordCount > 0 ? `${wordCount}w` : null },
    { id: 'jd', label: 'Job Description', icon: Briefcase, badge: jdWordCount > 0 ? `${jdWordCount}w` : null },
  ]

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange({ target: { files: e.dataTransfer.files } })
    }
  }

  return (
    <div className="bg-[#0A1020]/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl shadow-black/40 backdrop-blur-md">
      {/* Top Tab Bar & Preset Loaders */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5 bg-[#060B14]/80 flex-wrap gap-2">
        <div className="flex items-center gap-1">
          {tabs.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                editorTab === id
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/35 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${editorTab === id ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>{label}</span>
              {badge && (
                <span className="px-1.5 py-0.2 rounded-md text-[9px] font-mono bg-blue-500/20 text-blue-300 font-bold">
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Demo Samples Dropdown / Quick Links */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onLoadSampleGood}
            title="Load strong senior software engineer resume"
            className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 transition cursor-pointer flex items-center gap-1"
          >
            <span>+ Strong Sample</span>
          </button>
          <button
            onClick={onLoadSamplePoor}
            title="Load resume with formatting and ATS problems"
            className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-rose-950/30 hover:bg-rose-900/40 text-rose-400 border border-rose-800/40 transition cursor-pointer flex items-center gap-1"
          >
            <span>+ Weak Sample</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Upload File */}
      {editorTab === 'upload' && (
        <div className="p-5 space-y-4">
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`block border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative group ${
              isDragging
                ? 'border-blue-400 bg-blue-950/30 scale-[1.01]'
                : 'border-slate-700/60 hover:border-blue-500/60 bg-[#070D18]/70 hover:bg-blue-950/15'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={onFileChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600/25 via-indigo-600/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3.5 group-hover:scale-105 group-hover:border-blue-400/50 transition-all duration-300 shadow-lg shadow-blue-950/40">
              <FileUp className="w-7 h-7" />
            </div>
            <p className="text-sm font-bold text-slate-100 mb-1">
              Click to browse or drop your resume
            </p>
            <p className="text-xs text-slate-400">
              Supports <span className="text-slate-300 font-medium">PDF, DOCX, TXT</span> &nbsp;·&nbsp; Up to 10 MB
            </p>
            <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Affinda API Parser
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> 100% Private & Secure
              </span>
            </div>
          </label>

          {file && (
            <div className="p-3.5 bg-[#0D1528] border border-blue-500/30 rounded-xl flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-xs font-semibold text-slate-100 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB &nbsp;·&nbsp; Ready for scan</p>
                </div>
              </div>
              <button
                onClick={onClearFile}
                title="Remove uploaded resume"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Live Text Editor */}
      {editorTab === 'editor' && (
        <div className="p-4 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium">Resume Text (Extracted or Pasted)</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-slate-500">{charCount} chars</span>
              <span className={`font-mono text-[11px] px-2 py-0.5 rounded-md font-semibold border ${
                wordCount > 300
                  ? 'text-emerald-400 bg-emerald-950/30 border-emerald-800/40'
                  : wordCount > 80
                  ? 'text-blue-400 bg-blue-950/30 border-blue-800/40'
                  : 'text-amber-400 bg-amber-950/30 border-amber-800/40'
              }`}>
                {wordCount} words
              </span>
            </div>
          </div>
          <textarea
            value={resumeText}
            onChange={e => onTextChange(e.target.value)}
            placeholder="Paste your raw resume text here, or use the Upload tab to parse a PDF/DOCX file automatically..."
            className="w-full h-80 bg-[#060B14] border border-slate-800/90 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 resize-none leading-relaxed"
          />
        </div>
      )}

      {/* Tab 3: Job Description */}
      {editorTab === 'jd' && (
        <div className="p-4 space-y-2.5">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs font-semibold text-slate-200">Target Job Description</p>
              <p className="text-[10px] text-slate-400">Match keywords, required technologies, and experience</p>
            </div>
            <button
              onClick={onLoadSampleJD}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-300 hover:bg-blue-600/30 transition flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-blue-400" />
              Load Tech JD
            </button>
          </div>
          <textarea
            value={jobDescription}
            onChange={e => onJdChange(e.target.value)}
            placeholder="Paste the target job description (skills, responsibilities, requirements) to benchmark your resume match rate..."
            className="w-full h-80 bg-[#060B14] border border-slate-800/90 rounded-xl p-4 text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20 resize-none leading-relaxed"
          />
        </div>
      )}

      {/* Bottom Action Footer */}
      <div className="border-t border-slate-800/80 px-4 py-3 bg-[#060B14]/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {jobDescription.trim() ? (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50" />
              Job Match Enabled
            </span>
          ) : (
            <span className="text-xs text-slate-500 flex items-center gap-1">
              General ATS Audit (No JD)
            </span>
          )}
        </div>
        <button
          disabled={loading || !hasInput}
          onClick={onAnalyze}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-xl shadow-blue-900/30 cursor-pointer disabled:cursor-not-allowed border border-blue-400/20"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing Resume...</span>
            </>
          ) : (
            <>
              <span>Run ATS Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
