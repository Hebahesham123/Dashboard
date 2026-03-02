'use client'

import { type SampleInquiry, type SubmissionStatus } from '@/lib/supabase'
import { useLocale } from './LocaleContext'

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
  contacted: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  in_progress: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  cancelled: 'bg-red-500/20 text-red-300 border-red-500/40',
}

export function getStatusStyle(status: SubmissionStatus | null) {
  return STATUS_COLORS[status || 'new'] ?? STATUS_COLORS.new
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
  const value = submission.status || 'new'

  const statusOptions: { value: SubmissionStatus; labelKey: string }[] = [
    { value: 'new', labelKey: 'status_new' },
    { value: 'contacted', labelKey: 'status_contacted' },
    { value: 'in_progress', labelKey: 'status_in_progress' },
    { value: 'completed', labelKey: 'status_completed' },
    { value: 'cancelled', labelKey: 'status_cancelled' },
  ]

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation()
    const next = e.target.value as SubmissionStatus
    onStatusChange(submission.id, next)
  }

  const isSm = size === 'sm'
  return (
    <select
      value={value}
      onChange={handleChange}
      disabled={disabled}
      onClick={(e) => e.stopPropagation()}
      className={`
        status-select rounded-lg border bg-black/20 text-current font-medium
        focus:outline-none focus:ring-2 focus:ring-blue-400
        ${getStatusStyle(value)}
        ${isSm ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'}
      `}
      aria-label={t('status')}
      style={{ color: 'inherit' }}
    >
      {statusOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {t(opt.labelKey)}
        </option>
      ))}
    </select>
  )
}
