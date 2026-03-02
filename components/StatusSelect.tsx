'use client'

import { type SampleInquiry, type SubmissionStatus, NOT_REACHED_COOLDOWN_MS } from '@/lib/supabase'
import { useLocale } from './LocaleContext'

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  reached: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  done: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/40',
  not_reached: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
}

export function getStatusStyle(status: SubmissionStatus | null) {
  return STATUS_COLORS[status || 'new'] ?? STATUS_COLORS.new
}

function getNotReachedLabel(count: number, t: (k: string) => string): string {
  if (count === 1) return t('not_reached_1st')
  if (count === 2) return t('not_reached_2nd')
  if (count === 3) return t('not_reached_3rd')
  return t('not_reached_nth').replace('{n}', String(count))
}

export default function StatusSelect({
  submission,
  onStatusChange,
  disabled,
  size = 'md',
}: {
  submission: SampleInquiry
  onStatusChange: (id: string, status: SubmissionStatus) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}) {
  const { t } = useLocale()
  const rawValue = submission.status ?? 'new'
  const value = (['new', 'reached', 'done', 'cancelled', 'not_reached'] as const).includes(rawValue as SubmissionStatus)
    ? (rawValue as SubmissionStatus)
    : 'new'
  const notReachedCount = submission.not_reached_count ?? 0
  const lastAt = submission.not_reached_last_at ? new Date(submission.not_reached_last_at).getTime() : 0
  const now = Date.now()
  const notReachedBlocked = lastAt > 0 && now - lastAt < NOT_REACHED_COOLDOWN_MS

  const statusOptions: { value: SubmissionStatus; labelKey: string }[] = [
    { value: 'new', labelKey: 'status_new' },
    { value: 'reached', labelKey: 'status_reached' },
    { value: 'done', labelKey: 'status_done' },
    { value: 'cancelled', labelKey: 'status_cancelled' },
    { value: 'not_reached', labelKey: 'status_not_reached' },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation()
    const next = e.target.value as SubmissionStatus
    if (next === 'not_reached' && notReachedBlocked) return
    onStatusChange(submission.id, next)
  }

  const isSm = size === 'sm'
  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      onClick={(e) => e.stopPropagation()}
      title={
        value === 'done'
          ? t('not_reached_when_done')
          : value !== 'new'
            ? t('status_new_disabled')
            : notReachedBlocked
              ? t('not_reached_wait')
              : undefined
      }
      className={`
        status-select rounded-lg border bg-black/20 text-current font-medium
        focus:outline-none focus:ring-2 focus:ring-blue-400
        ${getStatusStyle(value)}
        ${isSm ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'}
      `}
      aria-label={t('status')}
      style={{ color: 'inherit' }}
    >
      {statusOptions.map((opt) => {
        const notReachedWhenDone = opt.value === 'not_reached' && value === 'done'
        const newDisabled = opt.value === 'new' && value !== 'new'
        const optDisabled =
          (opt.value === 'not_reached' && notReachedBlocked) || notReachedWhenDone || newDisabled
        const label =
          opt.value === 'not_reached' && value === 'not_reached' && notReachedCount > 0
            ? getNotReachedLabel(notReachedCount, t)
            : t(opt.labelKey as string)
        return (
          <option key={opt.value} value={opt.value} disabled={optDisabled}>
            {label}
          </option>
        )
      })}
    </select>
  )
}
