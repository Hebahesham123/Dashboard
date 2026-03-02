'use client'

import { useAuth } from './AuthContext'
import { useLocale } from './LocaleContext'
import LoginForm from './LoginForm'
import Dashboard from './Dashboard'

export default function AuthGuard() {
  const { user, profile, loading, signOut, hasAccess } = useAuth()
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
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4" dir={dir}>
        <div className="text-center max-w-md">
          <p className="text-red-400 font-medium">{t('access_denied')}</p>
          <button
            type="button"
            onClick={() => signOut()}
            className="mt-4 px-4 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600"
          >
            {t('sign_out')}
          </button>
        </div>
      </div>
    )
  }

  return <Dashboard profile={profile!} />
}
