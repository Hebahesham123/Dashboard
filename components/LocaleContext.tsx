'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { Locale } from '@/lib/i18n'
import { getT } from '@/lib/i18n'

type LocaleContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
  dir: 'ltr' | 'rtl'
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const STORAGE_KEY = 'dashboard-locale'

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
      if (stored === 'ar' || stored === 'en') setLocaleState(stored)
    } catch (_) {}
    setMounted(true)
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch (_) {}
  }, [])

  const t = getT(locale)
  const dir = locale === 'ar' ? 'rtl' : 'ltr'

  if (!mounted) {
    return (
      <LocaleContext.Provider
        value={{ locale: 'en', setLocale, t: getT('en'), dir: 'ltr' }}
      >
        {children}
      </LocaleContext.Provider>
    )
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t, dir }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider')
  return ctx
}
