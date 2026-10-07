import React from 'react'
import { Sparkles, Plus, Copy, RefreshCw } from 'lucide-react'

// Modal showing a generated bullet point suggestion for a missing skill
export default function BulletModal({ data, onClose, onCopy, onInject }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1626] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-slate-200">
              Bullet Suggestion: <span className="text-blue-400">{data.skill}</span>
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-lg font-bold">
            &times;
          </button>
        </div>

        <p className="text-[11px] text-slate-400">
          Suggested bullet for <span className="font-semibold text-slate-200">{data.skill}</span>
          {data.source === 'Rule-based suggestion (edit before using)' && (
            <span className="ml-1 text-amber-400">(template — edit before adding to your resume)</span>
          )}
          :
        </p>

        <div className="p-3.5 bg-[#090E1A] border border-slate-800 rounded-xl text-xs font-mono text-slate-200 leading-relaxed">
          "{data.bullet}"
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] font-mono text-slate-500">Source: {data.source}</span>
          <div className="flex gap-2">
            <button
              onClick={() => onCopy(data.bullet)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy
            </button>
            <button
              onClick={() => onInject(data.bullet)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
