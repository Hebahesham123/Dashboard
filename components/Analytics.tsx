'use client'

import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts'
import { useLocale } from './LocaleContext'
import type { SampleInquiry, SubmissionStatus } from '@/lib/supabase'
import { CREATED_AT_COLUMN } from '@/lib/supabase'

const STATUS_ORDER: SubmissionStatus[] = ['new', 'reached', 'done', 'cancelled', 'not_reached']

const CHART_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6']

type DayFilter = '7' | '14' | '30' | 'all' | 'custom'

const DAY_FILTER_OPTIONS: { value: DayFilter; labelKey: string }[] = [
  { value: '7', labelKey: 'last_7_days' },
  { value: '14', labelKey: 'last_14_days' },
  { value: '30', labelKey: 'last_30_days' },
  { value: 'all', labelKey: 'all_time' },
  { value: 'custom', labelKey: 'custom_range' },
]

function filterSubmissionsByDays(submissions: SampleInquiry[], dayFilter: DayFilter, customFrom?: string, customTo?: string): SampleInquiry[] {
  if (dayFilter === 'custom' && customFrom && customTo) {
    const fromStart = new Date(customFrom)
    fromStart.setHours(0, 0, 0, 0)
    const toEnd = new Date(customTo)
    toEnd.setHours(23, 59, 59, 999)
    const fromTime = fromStart.getTime()
    const toTime = toEnd.getTime()
    if (fromTime > toTime) return []
    return submissions.filter((row) => {
      const t = row[CREATED_AT_COLUMN as keyof SampleInquiry]
      if (t == null) return false
      const d = new Date(t as string)
      const ts = d.getTime()
      return !isNaN(ts) && ts >= fromTime && ts <= toTime
    })
  }
  if (dayFilter === 'custom') return submissions
  if (dayFilter === 'all') return submissions
  const days = parseInt(dayFilter, 10)
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  cutoff.setHours(0, 0, 0, 0)
  const cutoffTime = cutoff.getTime()
  return submissions.filter((row) => {
    const t = row[CREATED_AT_COLUMN as keyof SampleInquiry]
    if (t == null) return false
    const d = new Date(t as string)
    return !isNaN(d.getTime()) && d.getTime() >= cutoffTime
  })
}

type AnalyticsProps = {
  submissions: SampleInquiry[]
  onBack: () => void
}

function getStatusCounts(submissions: SampleInquiry[]) {
  const counts: Record<string, number> = {}
  STATUS_ORDER.forEach((s) => { counts[s] = 0 })
  submissions.forEach((row) => {
    const s = (row.status ?? 'new') as SubmissionStatus
    counts[s] = (counts[s] ?? 0) + 1
  })
  return STATUS_ORDER.map((status) => ({ status, count: counts[status] ?? 0 }))
}

function getSubmissionsByDay(submissions: SampleInquiry[], days: number) {
  const now = new Date()
  const start = new Date(now)
  start.setDate(start.getDate() - days)
  start.setHours(0, 0, 0, 0)
  const byDay: Record<string, number> = {}
  for (let i = 0; i <= days; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    byDay[d.toISOString().slice(0, 10)] = 0
  }
  submissions.forEach((row) => {
    const t = row[CREATED_AT_COLUMN as keyof SampleInquiry]
    if (t == null) return
    const d = new Date(t as string)
    if (isNaN(d.getTime())) return
    const key = d.toISOString().slice(0, 10)
    if (key in byDay) byDay[key]++
  })
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: date.slice(5), count }))
}

function getSubmissionsByDayForRange(submissions: SampleInquiry[], fromDate: string, toDate: string) {
  const from = new Date(fromDate)
  const to = new Date(toDate)
  from.setHours(0, 0, 0, 0)
  to.setHours(23, 59, 59, 999)
  const byDay: Record<string, number> = {}
  const cur = new Date(from)
  cur.setHours(0, 0, 0, 0)
  while (cur.getTime() <= to.getTime()) {
    byDay[cur.toISOString().slice(0, 10)] = 0
    cur.setDate(cur.getDate() + 1)
  }
  submissions.forEach((row) => {
    const t = row[CREATED_AT_COLUMN as keyof SampleInquiry]
    if (t == null) return
    const d = new Date(t as string)
    if (isNaN(d.getTime())) return
    const key = d.toISOString().slice(0, 10)
    if (key in byDay) byDay[key]++
  })
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date: date.slice(5), count }))
}

function getWeekCounts(submissions: SampleInquiry[]) {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfThisWeek = new Date(startOfToday)
  startOfThisWeek.setDate(startOfThisWeek.getDate() - startOfThisWeek.getDay())
  const startOfLastWeek = new Date(startOfThisWeek)
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)
  let thisWeek = 0
  let lastWeek = 0
  const thisWeekStart: number = startOfThisWeek.getTime()
  const thisWeekEnd: number = thisWeekStart + 7 * 24 * 60 * 60 * 1000
  const lastWeekStart: number = startOfLastWeek.getTime()
  submissions.forEach((row) => {
    const t = row[CREATED_AT_COLUMN as keyof SampleInquiry]
    if (t == null) return
    const d = new Date(t as string)
    const ts: number = d.getTime()
    if (isNaN(ts)) return
    if (ts >= thisWeekStart && ts < thisWeekEnd) thisWeek++
    else if (ts >= lastWeekStart && ts < thisWeekStart) lastWeek++
  })
  return { thisWeek, lastWeek }
}

function formatDateForInput(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export default function Analytics({ submissions, onBack }: AnalyticsProps) {
  const { t, dir } = useLocale()
  const [dayFilter, setDayFilter] = useState<DayFilter>('14')
  const today = formatDateForInput(new Date())
  const defaultFrom = formatDateForInput((() => { const d = new Date(); d.setDate(d.getDate() - 14); return d })())
  const [dateFrom, setDateFrom] = useState(defaultFrom)
  const [dateTo, setDateTo] = useState(today)

  const filteredSubmissions = useMemo(
    () => filterSubmissionsByDays(submissions, dayFilter, dateFrom, dateTo),
    [submissions, dayFilter, dateFrom, dateTo]
  )
  const chartDays = dayFilter === 'all' ? 30 : dayFilter === 'custom' ? 0 : parseInt(dayFilter, 10)

  const statusData = useMemo(() => getStatusCounts(filteredSubmissions), [filteredSubmissions])
  const byDayData = useMemo(() => {
    if (dayFilter === 'custom' && dateFrom && dateTo && dateFrom <= dateTo) {
      return getSubmissionsByDayForRange(filteredSubmissions, dateFrom, dateTo)
    }
    return getSubmissionsByDay(filteredSubmissions, chartDays || 14)
  }, [filteredSubmissions, chartDays, dayFilter, dateFrom, dateTo])
  const { thisWeek, lastWeek } = useMemo(() => getWeekCounts(filteredSubmissions), [filteredSubmissions])

  const total = filteredSubmissions.length
  const leadsCount = filteredSubmissions.filter((s) => s.status === 'done').length
  const conversionRate = total > 0 ? Math.round((leadsCount / total) * 100) : 0

  const pieData = statusData
    .filter((d) => d.count > 0)
    .map((d) => ({ name: t(`status_${d.status}` as 'status_new'), value: d.count }))

  const weekChange = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : (thisWeek > 0 ? 100 : 0)

  return (
    <div className="space-y-8" dir={dir}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white">{t('analytics_title')}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t('analytics_subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-gray-500">{t('filter_by_days')}:</span>
          <div className="flex flex-wrap gap-1.5 items-center">
            {DAY_FILTER_OPTIONS.map(({ value, labelKey }) => (
              <button
                key={value}
                type="button"
                onClick={() => setDayFilter(value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border ${
                  dayFilter === value
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {t(labelKey)}
              </button>
            ))}
            {dayFilter === 'custom' && (
              <div className="flex flex-wrap items-center gap-2 ml-2 pl-2 border-l border-gray-700">
                <label className="flex items-center gap-1.5 text-sm text-gray-400">
                  <span>{t('from_date')}</span>
                  <input
                    type="date"
                    value={dateFrom}
                    max={dateTo || today}
                    onChange={(e) => setDateFrom(e.target.value)}
                    dir="ltr"
                    className="rounded-md border border-gray-600 bg-[#21262d] text-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-sm text-gray-400">
                  <span>{t('to_date')}</span>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom || undefined}
                    max={today}
                    onChange={(e) => setDateTo(e.target.value)}
                    dir="ltr"
                    className="rounded-md border border-gray-600 bg-[#21262d] text-gray-200 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </label>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium border border-gray-600"
          >
            {t('back_to_submissions')}
          </button>
        </div>
      </div>

      {/* Conversion rate & week comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-800 bg-[#161b22]/60 p-5">
          <p className="text-sm text-gray-400 mb-1">{t('conversion_rate')}</p>
          <p className="text-3xl font-bold text-white tabular-nums">{conversionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{t('conversion_rate_hint')}</p>
          <p className="text-sm text-gray-400 mt-2">
            {leadsCount} {t('leads_created')} / {total} {t('total')}
          </p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-[#161b22]/60 p-5">
          <p className="text-sm text-gray-400 mb-1">{t('this_week')}</p>
          <p className="text-3xl font-bold text-white tabular-nums">{thisWeek}</p>
          <p className="text-xs text-gray-500 mt-1">{t('submissions')}</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-[#161b22]/60 p-5">
          <p className="text-sm text-gray-400 mb-1">{t('this_week_vs_last')}</p>
          <p className="text-2xl font-bold text-white tabular-nums">
            {thisWeek} <span className="text-gray-500 font-normal">vs</span> {lastWeek}
          </p>
          <p className={`text-sm mt-1 ${weekChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {weekChange >= 0 ? '+' : ''}{weekChange}% {t('from_last_week')}
          </p>
        </div>
      </div>

      {/* Status breakdown bar chart */}
      <div className="rounded-xl border border-gray-800 bg-[#161b22]/40 p-4">
        <h3 className="text-base font-medium text-gray-200 mb-4">{t('status_breakdown')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusData.map((d) => ({ ...d, name: t(`status_${d.status}` as 'status_new') }))} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="name" tick={{ fill: '#8b949e', fontSize: 12 }} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#21262d', border: '1px solid #30363d', borderRadius: 8 }}
                labelStyle={{ color: '#c9d1d9' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name={t('total')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie chart */}
      {pieData.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-[#161b22]/40 p-4">
          <h3 className="text-base font-medium text-gray-200 mb-4">{t('status_breakdown_pie')}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#21262d', border: '1px solid #30363d', borderRadius: 8 }}
                  formatter={(value: number) => [value, t('total')]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Submissions over time */}
      <div className="rounded-xl border border-gray-800 bg-[#161b22]/40 p-4">
        <h3 className="text-base font-medium text-gray-200 mb-4">{t('submissions_over_time')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byDayData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="date" tick={{ fill: '#8b949e', fontSize: 11 }} />
              <YAxis tick={{ fill: '#8b949e', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#21262d', border: '1px solid #30363d', borderRadius: 8 }}
              />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name={t('submissions')} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
