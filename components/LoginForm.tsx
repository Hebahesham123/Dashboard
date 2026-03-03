'use client'

import { useState } from 'react'
import { useLocale } from './LocaleContext'
import { useAuth } from './AuthContext'

export default function LoginForm() {
  const { t, dir } = useLocale()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: err } = await signIn(email.trim(), password)
    setSubmitting(false)
    if (err) {
      setError(err)
      return
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4" dir={dir}>
      <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-[#161b22] p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-gray-100 text-center mb-1">
          {t('login_title')}
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          {t('login_subtitle')}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-400 mb-1">
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-1">
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-gray-700 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#161b22] disabled:opacity-50"
          >
            {submitting ? t('loading') : t('sign_in')}
          </button>
        </form>
      </div>
    </div>
  )
}
