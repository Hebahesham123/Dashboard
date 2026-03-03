'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { useLocale } from './LocaleContext'
import LoginForm from './LoginForm'
import Dashboard from './Dashboard'

export default function AuthGuard() {
  const { user, profile, loading, profileChecked, signOut, hasAccess, retryProfileFetch } = useAuth()
  const { t, dir } = useLocale()
  const signOutDone = useRef(false)
  const [copyDone, setCopyDone] = useState(false)

  // Only sign out when we know the user has a profile but wrong role — not when profile failed to load
  useEffect(() => {
    if (!user) {
      signOutDone.current = false
      return
    }
    if (profileChecked && profile !== null && !hasAccess && !signOutDone.current) {
      signOutDone.current = true
      signOut()
    }
  }, [user, profile, profileChecked, hasAccess, signOut])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center" dir={dir}>
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-10 h-10 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  if (!profileChecked) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center" dir={dir}>
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-10 h-10 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm">{t('loading')}</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    if (profile === null) {
      const setupSql = `INSERT INTO profiles (user_id, email, role)
SELECT id, email, 'call_center'
FROM auth.users
ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;`
      return (
        <div className="min-h-screen bg-[#0d1117] text-gray-100" dir={dir}>
          <header className="border-b border-gray-800 bg-[#161b22]/80 sticky top-0 z-30">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-xl font-semibold">{t('title')}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{t('subtitle')}</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                {user?.email && (
                  <span className="text-xs text-gray-500 truncate max-w-[180px]">{user.email}</span>
                )}
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-sm text-gray-400 hover:text-white"
                >
                  {t('sign_out')}
                </button>
              </div>
            </div>
          </header>
          <main className="max-w-6xl mx-auto px-4 py-6">
            <div className="w-full max-w-lg flex flex-col gap-5 text-left">
              <h2 className="text-lg font-semibold text-gray-100">{t('setup_title')}</h2>
              <p className="text-sm text-gray-300 bg-blue-900/20 border border-blue-700/40 rounded-lg px-3 py-2">
                {t('setup_why')}
              </p>
              <p className="text-sm text-gray-400">{t('setup_intro')}</p>
              <p className="text-xs text-amber-200/90 bg-amber-900/20 border border-amber-700/40 rounded-lg px-3 py-2">
                {t('setup_deploy_note')}
              </p>
              <p className="text-xs text-gray-500 italic">
                {t('setup_table_first')}
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                <li>{t('setup_step1')}</li>
                <li>{t('setup_step2')}</li>
                <li>{t('setup_step3')}</li>
              </ol>
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-medium text-gray-500">{t('setup_sql_label')}</p>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(setupSql)
                      setCopyDone(true)
                      setTimeout(() => setCopyDone(false), 2000)
                    }}
                    className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-200"
                  >
                    {copyDone ? t('copy_copied') : t('copy_sql')}
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-[#161b22] border border-gray-800 text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap break-all font-mono">
                  {setupSql}
                </pre>
              </div>
              <button
                type="button"
                onClick={() => retryProfileFetch()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium text-white self-start"
              >
                {t('retry')}
              </button>
            </div>
          </main>
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center" dir={dir}>
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div className="w-10 h-10 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-sm">{t('redirecting_to_login')}</p>
        </div>
      </div>
    )
  }

  return <Dashboard profile={profile!} />
}
