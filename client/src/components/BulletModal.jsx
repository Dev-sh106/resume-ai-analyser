import React from 'react'
import { Sparkles, Plus, Copy, X } from 'lucide-react'

// Modal showing a generated bullet point suggestion for a missing skill
export default function BulletModal({ data, onClose, onCopy, onInject }) {
  const isTemplate = data.source === 'Rule-based suggestion (edit before using)'

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#0C1424] border border-slate-700/60 rounded-2xl max-w-lg w-full shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Bullet Suggestion</p>
              <p className="text-[10px] text-slate-500">
                For skill: <span className="text-blue-400 font-semibold">{data.skill}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {isTemplate && (
            <div className="flex items-center gap-2 p-2.5 bg-amber-950/30 border border-amber-800/40 rounded-xl">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              <p className="text-[11px] text-amber-300">Template suggestion — edit before adding to your resume</p>
            </div>
          )}

          <div>
            <p className="text-[11px] text-slate-500 mb-2 font-medium">Generated bullet point:</p>
            <div className="p-4 bg-[#070C18] border border-slate-800/60 rounded-xl text-xs font-mono text-slate-200 leading-relaxed">
              <span className="text-slate-500 select-none">• </span>
              "{data.bullet}"
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-slate-600">
              {data.source}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => onCopy(data.bullet)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition border border-slate-700/40"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
              <button
                onClick={() => onInject(data.bullet)}
                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm shadow-blue-900/30"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Resume
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
