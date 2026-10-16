import React from 'react'
import { User, History, Zap } from 'lucide-react'

// Top navigation bar
export default function NavBar({ currentUser, onSignIn, onLogout, onHistory }) {
  return (
    <header className="border-b border-slate-800/60 bg-[#080E1B]/95 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Zap className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-slate-100 tracking-tight">
              ATS<span className="text-blue-400">Analyzer</span>
            </span>
            <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/15 border border-blue-500/25 text-blue-400">
              v2
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <button
                onClick={onHistory}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 transition font-medium"
              >
                <History className="w-3.5 h-3.5 text-slate-400" />
                History
              </button>
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-800/50 border border-slate-700/40">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                    <span className="text-[9px] font-bold text-white">{currentUser.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="text-xs font-medium text-slate-300 hidden sm:block">
                    {currentUser.name}
                  </span>
                </div>
                <button onClick={onLogout} className="text-xs text-rose-400 hover:text-rose-300 transition font-medium">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onSignIn}
              className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white transition shadow-sm shadow-blue-900/40 flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
