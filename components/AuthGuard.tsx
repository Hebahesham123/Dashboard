'use client'

import { useAuth } from './AuthContext'
import { useLocale } from './LocaleContext'
import LoginForm from './LoginForm'
import Dashboard from './Dashboard'

export default function AuthGuard() {
  const { user, profile, loading, signOut, hasAccess, retryProfileFetch } = useAuth()
  const { t, locale, setLocale, dir } = useLocale()

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

  if (!hasAccess) {
    const sql = `INSERT INTO profiles (user_id, email, role)\nVALUES ('${user.id}', '${(user.email ?? '').replace(/'/g, "''")}', 'call_center')\nON CONFLICT (user_id) DO UPDATE SET role = 'call_center', email = EXCLUDED.email;`
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4" dir={dir}>
        <div className="text-center max-w-lg space-y-4">
          <p className="text-red-400 font-medium">{t('access_denied')}</p>
          <p className="text-gray-400 text-sm">
            {t('access_denied_your_email')}: <span className="text-gray-300">{user.email ?? user.id}</span>
          </p>
          <p className="text-amber-400/90 text-sm font-medium">
            {t('sign_out_and_login')}
          </p>
          <button
            type="button"
            onClick={() => signOut()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-amber-600 text-white hover:bg-amber-500 text-sm font-medium"
          >
            {t('sign_out_and_login')}
          </button>
          <p className="text-gray-400 text-sm text-left border-t border-gray-700 pt-4 mt-2">
            {t('access_denied_steps')}
          </p>
          <p className="text-gray-400 text-sm text-left">{t('access_denied_help')}</p>
          <pre className="text-left text-xs text-gray-300 bg-[#161b22] border border-gray-700 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all">
            {sql}
          </pre>
          <p className="text-gray-500 text-xs">
            User ID: <code className="bg-[#161b22] px-1 rounded">{user.id}</code>
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center flex-wrap">
            <button
              type="button"
              onClick={() => retryProfileFetch()}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 text-sm font-medium"
            >
              {t('retry')}
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 text-sm"
            >
              {t('refresh_after_sql')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return <Dashboard profile={profile!} />
}
