'use client'

import { useEffect } from 'react'
import type { SampleInquiry } from '@/lib/supabase'
import { useLocale } from './LocaleContext'
import StatusSelect from './StatusSelect'

const LABEL_KEYS: Record<string, string> = {
  name: 'name',
  phone: 'phone',
  address: 'address',
  message: 'message',
  requested_samples: 'requested_samples',
  attachment_name: 'attachment',
  attachment_url: 'attachment_link',
  created_at: 'submitted',
}

function formatDate(val: string | null, locale: 'en' | 'ar') {
  if (!val) return '—'
  const d = new Date(val)
  if (isNaN(d.getTime())) return val
  return d.toLocaleString(locale === 'ar' ? 'ar-EG' : undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export default function SubmissionDetail({
  submission,
  onClose,
  onStatusChange,
}: {
  submission: SampleInquiry | null
  onClose: () => void
  onStatusChange: (id: string, status: import('@/lib/supabase').SubmissionStatus) => void
}) {
  const { t, dir, locale } = useLocale()

  useEffect(() => {
    if (!submission) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [submission, onClose])

  if (!submission) return null

  const entries = Object.entries(submission).filter(
    ([k]) => k !== 'id' && k !== 'status'
  )

  const isRtl = dir === 'rtl'

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className={`fixed top-0 bottom-0 z-50 w-full max-w-md bg-[#161b22] border-gray-800 shadow-xl overflow-y-auto detail-panel ${
          isRtl ? 'left-0 border-r' : 'right-0 border-l'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
      >
        <div className="sticky top-0 bg-[#161b22] border-b border-gray-800 px-4 py-3 flex items-center justify-between">
          <h2 id="detail-title" className="text-base font-semibold">
            {t('submission')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:text-white hover:bg-gray-800"
            aria-label={t('close')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <span className="text-xs text-gray-500 block mb-1">{t('status')}</span>
            <StatusSelect
              submission={submission}
              onStatusChange={onStatusChange}
              size="md"
            />
          </div>
          {entries.map(([key, value]) => {
            const labelKey = LABEL_KEYS[key] ?? key
            const label = t(labelKey)
            const isUrl = key === 'attachment_url' && value && typeof value === 'string'
            const isDate = key === 'created_at'
            return (
              <div key={key}>
                <span className="text-xs text-gray-500 block mb-0.5">{label}</span>
                <div className="text-sm text-gray-200">
                  {isUrl ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {t('open_attachment')}
                    </a>
                  ) : isDate ? (
                    formatDate(value as string, locale)
                  ) : value != null && value !== '' ? (
                    <span className="whitespace-pre-wrap break-words">{String(value)}</span>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
