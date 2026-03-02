'use client'

import type { SampleInquiry } from '@/lib/supabase'
import { useLocale } from './LocaleContext'
import StatusSelect from './StatusSelect'

function formatDate(val: string | null, locale: string) {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d.getTime())) return String(val)
  return d.toLocaleString(locale === 'ar' ? 'ar-EG' : undefined, { dateStyle: 'short', timeStyle: 'short' })
}

export default function SubmissionsTable({
  submissions,
  onSelect,
  onStatusChange,
  sortOrder,
  onSortChange,
  limit,
  onLimitChange,
  searchQuery,
  onSearchChange,
  isLoading,
  selectedId,
}: {
  submissions: SampleInquiry[]
  onSelect: (row: SampleInquiry) => void
  onStatusChange: (id: string, status: import('@/lib/supabase').SubmissionStatus) => void
  sortOrder: 'desc' | 'asc'
  onSortChange: (order: 'desc' | 'asc') => void
  limit: number
  onLimitChange: (n: number) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  isLoading: boolean
  selectedId: string | null
}) {
  const { t, locale } = useLocale()

  const filtered = searchQuery.trim()
    ? submissions.filter((row) =>
        Object.values(row).some(
          (v) => v != null && String(v).toLowerCase().includes(searchQuery.toLowerCase().trim())
        )
      )
    : submissions

  const sorted = [...filtered].sort((a, b) => {
    const t1 = new Date(a.created_at).getTime()
    const t2 = new Date(b.created_at).getTime()
    return sortOrder === 'desc' ? t2 - t1 : t1 - t2
  })

  const displayed = sorted.slice(0, limit)

  return (
    <div className="rounded-lg border border-gray-800 bg-[#161b22] overflow-hidden">
      <div className="p-3 border-b border-gray-800 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-gray-300">{t('submissions')}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="search"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-40 sm:w-48 pl-3 pr-3 py-1.5 rounded-md bg-[#0d1117] border border-gray-700 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={sortOrder}
            onChange={(e) => onSortChange(e.target.value as 'desc' | 'asc')}
            className="py-1.5 px-2 rounded-md bg-[#0d1117] border border-gray-700 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="desc">{t('newest')}</option>
            <option value="asc">{t('oldest')}</option>
          </select>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="py-1.5 px-2 rounded-md bg-[#0d1117] border border-gray-700 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      <div className="min-h-[200px] overflow-x-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-500 text-sm">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin" />
            {t('loading')}
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-16 text-center text-gray-500 text-sm">
            {submissions.length === 0 ? t('no_submissions') : t('no_matching')}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-[#0d1117]/50">
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500">{t('date')}</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500">{t('name')}</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 hidden sm:table-cell">{t('phone')}</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500">{t('status')}</th>
                <th className="text-left py-2.5 px-3 text-xs font-medium text-gray-500 w-16" />
              </tr>
            </thead>
            <tbody>
              {displayed.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onSelect(row)}
                  className={`border-b border-gray-800/80 cursor-pointer hover:bg-[#21262d]/60 transition-colors ${selectedId === row.id ? 'bg-[#21262d]' : ''}`}
                >
                  <td className="py-2.5 px-3 text-gray-400 whitespace-nowrap">
                    {formatDate(row.created_at, locale)}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-gray-200">{row.name ?? '—'}</td>
                  <td className="py-2.5 px-3 text-gray-400 hidden sm:table-cell">{row.phone ?? '—'}</td>
                  <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                    <StatusSelect
                      submission={row}
                      onStatusChange={onStatusChange}
                      size="sm"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelect(row)
                      }}
                      className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                    >
                      {t('view')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {displayed.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-800 text-xs text-gray-500">
          {displayed.length} {t('of')} {filtered.length}
        </div>
      )}
    </div>
  )
}
