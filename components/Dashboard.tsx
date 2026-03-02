'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase, TABLE_NAME, CREATED_AT_COLUMN, type SampleInquiry, type SubmissionStatus } from '@/lib/supabase'
import { useLocale } from './LocaleContext'
import StatsCards from './StatsCards'
import SubmissionsTable from './SubmissionsTable'
import SubmissionDetail from './SubmissionDetail'

function getTodayAndWeek(submissions: SampleInquiry[]) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfWeek = new Date(startOfToday)
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
  let today = 0
  let week = 0
  submissions.forEach((row) => {
    const t = row[CREATED_AT_COLUMN as keyof SampleInquiry]
    if (t == null) return
    const d = new Date(t as string)
    if (isNaN(d.getTime())) return
    if (d >= startOfToday) today++
    if (d >= startOfWeek) week++
  })
  return { today, week }
}

export default function Dashboard() {
  const { t, locale, setLocale, dir } = useLocale()
  const [submissions, setSubmissions] = useState<SampleInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<SampleInquiry | null>(null)
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')
  const [limit, setLimit] = useState(25)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: e } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order(CREATED_AT_COLUMN, { ascending: false })
    setLoading(false)
    if (e) {
      setError(e.message)
      return
    }
    setSubmissions(Array.isArray(data) ? data : [])
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const updateStatus = useCallback(async (id: string, status: SubmissionStatus) => {
    const { error: e } = await supabase.from(TABLE_NAME).update({ status }).eq('id', id)
    if (e) {
      setToast(t('failed_to_update_status'))
      setTimeout(() => setToast(null), 3000)
      return
    }
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    )
    if (selected?.id === id) setSelected((s) => (s ? { ...s, status } : null))
  }, [selected?.id, t])

  useEffect(() => {
    const channel = supabase
      .channel('sample_inquiries_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLE_NAME },
        (payload) => {
          const row = payload.new as SampleInquiry
          if (row) {
            setSubmissions((prev) => [row, ...prev])
            setToast(t('new_submission'))
            setTimeout(() => setToast(null), 4000)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: TABLE_NAME },
        (payload) => {
          const row = payload.new as SampleInquiry
          if (row) {
            setSubmissions((prev) => prev.map((s) => (s.id === row.id ? row : s)))
            setSelected((prev) => (prev?.id === row.id ? row : prev))
          }
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [t])

  const { today, week } = getTodayAndWeek(submissions)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" dir={dir}>
        <div className="text-center max-w-md">
          <p className="text-red-400 font-medium">{t('failed_to_load')}</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
          <button
            type="button"
            onClick={fetchData}
            className="mt-4 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 font-medium"
          >
            {t('retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100" dir={dir} lang={locale === 'ar' ? 'ar' : 'en'}>
      <header className="border-b border-gray-800 bg-[#161b22]/80 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold">{t('title')}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700"
            >
              {locale === 'ar' ? t('lang_en') : t('lang_ar')}
            </button>
            <button
              type="button"
              onClick={() => fetchData()}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              {t('refresh')}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <StatsCards total={submissions.length} today={today} week={week} />
        <SubmissionsTable
          submissions={submissions}
          onSelect={setSelected}
          onStatusChange={updateStatus}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          limit={limit}
          onLimitChange={setLimit}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isLoading={loading}
          selectedId={selected?.id ?? null}
        />
      </main>

      {selected && (
        <SubmissionDetail
          submission={selected}
          onClose={() => setSelected(null)}
          onStatusChange={updateStatus}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-lg bg-[#21262d] border border-gray-700 text-green-400 text-sm toast-enter" style={dir === 'rtl' ? { right: 'auto', left: '1.5rem' } : undefined}>
          {toast}
        </div>
      )}
    </div>
  )
}
