import React from 'react'
import { Upload, Edit3, FileText, Trash2, RefreshCw, ArrowRight, Briefcase, Sparkles } from 'lucide-react'

// Left panel: file upload, text editor, and job description tabs
export default function ResumeInput({
  file, resumeText, jobDescription, loading,
  editorTab, onTabChange,
  onFileChange, onTextChange, onJdChange, onClearFile,
  onAnalyze, onLoadSampleGood, onLoadSamplePoor, onLoadSampleJD
}) {
  const hasInput = file || resumeText.trim()
  const wordCount = resumeText.split(/\s+/).filter(Boolean).length

  const tabs = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'editor', label: 'Text Editor', icon: Edit3 },
    { id: 'jd', label: 'Job Description', icon: Briefcase },
  ]

  return (
    <div className="bg-[#0C1424] border border-slate-800/70 rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-slate-800/70 px-4 py-2 bg-[#080E1B]/80">
        <div className="flex items-center gap-0.5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                editorTab === id
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-3 h-3 ${editorTab === id ? 'text-blue-400' : 'text-slate-600'}`} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onLoadSampleGood}
            className="text-[10px] font-mono px-2 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 border border-slate-700/40 transition"
          >
            + Good
          </button>
          <button
            onClick={onLoadSamplePoor}
            className="text-[10px] font-mono px-2 py-1 rounded-md bg-slate-800/60 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 border border-slate-700/40 transition"
          >
            + Weak
          </button>
        </div>
      </div>

      {/* File upload tab */}
      {editorTab === 'upload' && (
        <div className="p-5 space-y-4">
          <label className="block border-2 border-dashed border-slate-700/60 hover:border-blue-500/60 rounded-xl p-8 text-center bg-[#0A101D]/60 hover:bg-blue-950/10 transition cursor-pointer relative group">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={onFileChange}
            />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:border-blue-400/40 transition-all duration-200">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-200 mb-1">
              Drop your resume here
            </p>
            <p className="text-[11px] text-slate-500">
              PDF, DOCX, or TXT &nbsp;·&nbsp; Max 10 MB
            </p>
          </label>

          {file && (
            <div className="p-3 bg-blue-950/20 border border-blue-800/40 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/25 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-mono text-xs text-slate-200 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                onClick={onClearFile}
                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-900/20 rounded-lg transition flex-shrink-0 ml-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Text editor tab */}
      {editorTab === 'editor' && (
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-500">Paste or edit resume text below</span>
            <span className={`font-mono px-2 py-0.5 rounded-md ${
              wordCount > 200
                ? 'text-emerald-400 bg-emerald-950/30 border border-emerald-800/40'
                : wordCount > 50
                ? 'text-amber-400 bg-amber-950/30 border border-amber-800/40'
                : 'text-slate-500 bg-slate-800/40 border border-slate-700/40'
            }`}>
              {wordCount} words
            </span>
          </div>
          <textarea
            value={resumeText}
            onChange={e => onTextChange(e.target.value)}
            placeholder="Paste your resume text here, or switch to the Upload tab to upload a file..."
            className="w-full h-80 bg-[#070C18] border border-slate-800/80 rounded-xl p-3.5 text-xs font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 resize-none leading-relaxed"
          />
        </div>
      )}

      {/* Job description tab */}
      {editorTab === 'jd' && (
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-[11px] text-slate-300 font-medium">Job Description</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Paste a job listing to detect keyword gaps</p>
            </div>
            <button
              onClick={onLoadSampleJD}
              className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-blue-600/15 border border-blue-500/25 text-blue-400 hover:bg-blue-600/25 transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Load sample
            </button>
          </div>
          <textarea
            value={jobDescription}
            onChange={e => onJdChange(e.target.value)}
            placeholder="Paste the full job description here..."
            className="w-full h-80 bg-[#070C18] border border-slate-800/80 rounded-xl p-3.5 text-xs font-mono text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/20 resize-none leading-relaxed"
          />
        </div>
      )}

      {/* Action bar */}
      <div className="border-t border-slate-800/70 px-4 py-3 bg-[#080E1B]/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {jobDescription ? (
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              JD attached
            </span>
          ) : (
            <span className="text-[11px] text-slate-600">No job description</span>
          )}
        </div>
        <button
          disabled={loading || !hasInput}
          onClick={onAnalyze}
          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white text-xs font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-blue-900/30 cursor-pointer whitespace-nowrap"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Run Analysis
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
