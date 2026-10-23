import React from 'react'
import { User, History, Zap, ShieldCheck, Sparkles, LogOut } from 'lucide-react'

// Top navigation bar with status indicators and user menu
export default function NavBar({ currentUser, onSignIn, onLogout, onHistory }) {
  return (
    <header className="border-b border-slate-800/80 bg-[#070D18]/90 backdrop-blur-xl sticky top-0 z-40 shadow-sm shadow-black/40">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 ring-1 ring-white/20">
              <Zap className="w-4 h-4 fill-white text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Resume<span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Tester</span>
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-blue-500/15 border border-blue-500/30 text-blue-400">
                  AI ATS v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block">Real-time Deterministic ATS & Keyword Auditor</p>
            </div>
          </div>

          {/* Engine Status Badges (desktop) */}
          <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-slate-800/80">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Parser Active
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-950/40 text-blue-300 border border-blue-800/40">
              <Sparkles className="w-2.5 h-2.5 text-blue-400" />
              AI Coach
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {currentUser ? (
            <>
              <button
                onClick={onHistory}
                className="text-xs px-3.5 py-1.5 rounded-xl border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800 text-slate-200 flex items-center gap-2 transition font-medium shadow-sm cursor-pointer"
              >
                <History className="w-3.5 h-3.5 text-blue-400" />
                <span>History</span>
              </button>

              <div className="flex items-center gap-2 pl-3 border-l border-slate-800/80">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-800/60 border border-slate-700/50">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-inner">
                    <span className="text-[10px] font-bold text-white">{currentUser.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-200 hidden sm:block max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onSignIn}
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white transition shadow-lg shadow-blue-900/30 flex items-center gap-2 cursor-pointer border border-blue-400/20"
            >
              <User className="w-3.5 h-3.5" />
              Sign In / Register
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
