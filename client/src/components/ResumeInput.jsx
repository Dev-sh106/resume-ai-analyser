import React from 'react'
import { Upload, Edit3, FileText, Trash2, RefreshCw, ArrowRight } from 'lucide-react'

// Left panel: file upload, text editor, and job description tabs
export default function ResumeInput({
  file, resumeText, jobDescription, loading,
  editorTab, onTabChange,
  onFileChange, onTextChange, onJdChange, onClearFile,
  onAnalyze, onLoadSampleGood, onLoadSamplePoor, onLoadSampleJD
}) {
  const hasInput = file || resumeText.trim()

  return (
    <div className="bg-[#0F1626] border border-slate-800/90 rounded-xl overflow-hidden shadow-xl">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5 bg-[#0A101D]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onTabChange('upload')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              editorTab === 'upload' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => onTabChange('editor')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
              editorTab === 'editor' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3 h-3 text-blue-400" />
            Text Editor
          </button>
          <button
            onClick={() => onTabChange('jd')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition ${
              editorTab === 'jd' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Job Description
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onLoadSampleGood}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/50"
          >
            Load demo resume
          </button>
          <button
            onClick={onLoadSamplePoor}
            className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/70 hover:bg-slate-700 text-slate-300 border border-slate-700/50"
          >
            Load weak resume
          </button>
        </div>
      </div>

      {/* File upload tab */}
      {editorTab === 'upload' && (
        <div className="p-5 space-y-4">
          <div className="border border-dashed border-slate-700/80 hover:border-blue-500/80 rounded-xl p-8 text-center bg-[#0C1220]/70 transition cursor-pointer relative group">
            <input
              type="file"
              accept=".pdf,.docx,.doc,.txt"
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              onChange={onFileChange}
            />
            <div className="w-12 h-12 rounded-xl bg-slate-800/80 text-blue-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-200 mb-1">Drop a resume file or click to browse</p>
            <p className="text-[11px] text-slate-500">PDF, DOCX, or TXT (max 10MB)</p>
          </div>

          {file && (
            <div className="p-3 bg-slate-800/40 border border-slate-700/70 rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 truncate">
                <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="font-mono text-slate-200 truncate">{file.name}</span>
                <span className="text-slate-500 text-[11px]">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button onClick={onClearFile} className="text-slate-500 hover:text-rose-400 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Text editor tab */}
      {editorTab === 'editor' && (
        <div className="p-4 space-y-2">
          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <span>Paste or edit resume text</span>
            <span className="font-mono">{resumeText.split(/\s+/).filter(Boolean).length} words</span>
          </div>
          <textarea
            value={resumeText}
            onChange={e => onTextChange(e.target.value)}
            placeholder="Paste resume text here, or use the file upload tab."
            className="w-full h-80 bg-[#090E1A] border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500/80 resize-none leading-relaxed"
          />
        </div>
      )}

      {/* Job description tab */}
      {editorTab === 'jd' && (
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400">Paste the job description to check keyword match</span>
            <button
              onClick={onLoadSampleJD}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-blue-400 hover:underline"
            >
              Load sample JD
            </button>
          </div>
          <textarea
            value={jobDescription}
            onChange={e => onJdChange(e.target.value)}
            placeholder="Paste the job description here..."
            className="w-full h-80 bg-[#090E1A] border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-blue-500/80 resize-none leading-relaxed"
          />
        </div>
      )}

      {/* Action bar */}
      <div className="border-t border-slate-800/80 px-4 py-3 bg-[#0B101C] flex items-center justify-between">
        <div className="text-[11px] text-slate-500 font-mono">
          {jobDescription ? 'Job description attached' : 'No job description'}
        </div>
        <button
          disabled={loading || !hasInput}
          onClick={onAnalyze}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-semibold rounded-lg transition flex items-center gap-2 shadow-lg shadow-blue-900/30 cursor-pointer"
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
