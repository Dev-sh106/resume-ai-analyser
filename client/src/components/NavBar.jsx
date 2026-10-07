import React from 'react'
import { User, History } from 'lucide-react'

// Top navigation bar
export default function NavBar({ currentUser, onSignIn, onLogout, onHistory }) {
  return (
    <header className="border-b border-slate-800/80 bg-[#0B1120]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-inner shadow-blue-400/30">
            R
          </div>
          <span className="font-bold text-sm text-slate-100 tracking-tight">
            RESUME<span className="text-blue-400">TESTER</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {currentUser ? (
            <>
              <button
                onClick={onHistory}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 flex items-center gap-1.5 transition font-medium"
              >
                <History className="w-3.5 h-3.5 text-slate-400" />
                History
              </button>
              <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
                <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {currentUser.name}
                </span>
                <button onClick={onLogout} className="text-xs text-rose-400 hover:underline">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onSignIn}
              className="text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-sm"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
