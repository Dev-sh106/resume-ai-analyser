import React from 'react'
import { History, Download } from 'lucide-react'

// Slide-out drawer showing the user's past analyses
export default function HistoryDrawer({ historyList, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-[#0F1626] border-l border-slate-800 w-full max-w-md h-full p-6 shadow-2xl flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
          <span className="font-bold text-xs text-slate-200 flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            Your Analysis History
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg">
            &times;
          </button>
        </div>

        <div className="flex-1">
          {historyList.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No saved analyses found.</p>
          ) : (
            <div className="space-y-2.5">
              {historyList.map(item => (
                <div
                  key={item._id}
                  className="p-3 rounded-xl border border-slate-800 bg-[#0A101D] flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-xs text-slate-200">{item.filename}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-blue-400">
                      {item.overallScore}/100
                    </span>
                    <a
                      href={`/api/resumes/${item._id}/report`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                      title="Download PDF report"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold mt-4"
        >
          Close
        </button>
      </div>
    </div>
  )
}
