import React from 'react'
import { History, Download, FileText, Calendar, Award } from 'lucide-react'

// Slide-out drawer showing the user's past analyses
export default function HistoryDrawer({ historyList, onClose, onDownloadReport }) {
  const getGradeColor = (g) => {
    if (g === 'A') return 'text-emerald-400 bg-emerald-950/50 border-emerald-700/40'
    if (g === 'B') return 'text-blue-400 bg-blue-950/50 border-blue-700/40'
    if (g === 'C') return 'text-amber-400 bg-amber-950/50 border-amber-700/40'
    return 'text-rose-400 bg-rose-950/50 border-rose-700/40'
  }

  const getScoreColor = (s) => {
    if (s >= 85) return 'text-emerald-400'
    if (s >= 70) return 'text-blue-400'
    if (s >= 50) return 'text-amber-400'
    return 'text-rose-400'
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-end" onClick={onClose}>
      <div
        className="bg-[#0C1424] border-l border-slate-800/60 w-full max-w-md h-full flex flex-col shadow-2xl shadow-black/50"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800/60 bg-[#080E1B]/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
              <History className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-100">Analysis History</span>
              <p className="text-[10px] text-slate-500">{historyList.length} saved analyses</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {historyList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <History className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm text-slate-400 font-medium">No saved analyses</p>
              <p className="text-xs text-slate-600 mt-1">Run an analysis while signed in to save it.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {historyList.map(item => (
                <div
                  key={item._id}
                  className="p-4 rounded-xl border border-slate-800/60 bg-[#0A1020] hover:border-slate-700/60 transition group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-slate-800/60 border border-slate-700/40 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{item.filename}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3 h-3 text-slate-600" />
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`font-mono font-black text-base ${getScoreColor(item.overallScore)}`}>
                          {item.overallScore}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold border ${getGradeColor(item.grade)}`}>
                          {item.grade}
                        </span>
                      </div>
                      <button
                        onClick={() => onDownloadReport(item._id ? String(item._id) : null, item.filename)}
                        className="p-2 bg-slate-800/60 hover:bg-blue-600/20 hover:border-blue-500/40 border border-slate-700/40 rounded-lg text-slate-400 hover:text-blue-400 transition cursor-pointer"
                        title="Download PDF report"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Score bar */}
                  <div className="mt-3 w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        item.overallScore >= 85 ? 'bg-emerald-500' :
                        item.overallScore >= 70 ? 'bg-blue-500' :
                        item.overallScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${item.overallScore}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-800/60 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700/40"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
