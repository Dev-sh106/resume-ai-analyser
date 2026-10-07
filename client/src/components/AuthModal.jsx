import React, { useState } from 'react'

// Login / Register modal
export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { email, password }
        : { name, email, password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Authentication failed')
      onSuccess(data.token, data.user)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1626] border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        <h3 className="font-bold text-sm text-slate-100">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h3>

        {error && (
          <div className="p-2.5 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-lg text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'register' && (
            <div>
              <label className="text-slate-400 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#090E1A] border border-slate-700 rounded-lg p-2 text-slate-200"
              />
            </div>
          )}
          <div>
            <label className="text-slate-400 block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#090E1A] border border-slate-700 rounded-lg p-2 text-slate-200"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#090E1A] border border-slate-700 rounded-lg p-2 text-slate-200"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition mt-2"
          >
            {mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
            className="text-xs text-blue-400 hover:underline"
          >
            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
          <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-300">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
