'use client'

import { useState } from 'react'
import { useLocale } from './LocaleContext'
import type { CancelledReasonKey } from '@/lib/supabase'
import { CANCELLED_REASON_OPTIONS } from '@/lib/supabase'

const REASON_LABEL_KEYS: Record<CancelledReasonKey, string> = {
  customer_cancelled: 'lost_reason_customer_cancelled',
  not_reached: 'lost_reason_not_reached',
  wrong_number: 'lost_reason_wrong_number',
  no_response: 'lost_reason_no_response',
  other: 'lost_reason_other',
}

type LostReasonModalProps = {
  onConfirm: (reason: CancelledReasonKey, reasonOther: string) => void
  onCancel: () => void
}

export default function LostReasonModal({ onConfirm, onCancel }: LostReasonModalProps) {
  const { t, dir } = useLocale()
  const [reason, setReason] = useState<CancelledReasonKey | null>(null)
  const [reasonOther, setReasonOther] = useState('')

  const handleConfirm = () => {
    if (!reason) return
    onConfirm(reason, reason === 'other' ? reasonOther.trim() : '')
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/60"
        aria-hidden="true"
        onClick={onCancel}
      />
      <div
        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-700 bg-[#161b22] p-5 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lost-reason-title"
        dir={dir}
      >
        <h2 id="lost-reason-title" className="text-base font-semibold text-gray-100 mb-4">
          {t('lost_reason_title')}
        </h2>
        <div className="space-y-2 mb-4">
          {CANCELLED_REASON_OPTIONS.map((key) => (
            <label
              key={key}
              className="flex items-center gap-3 cursor-pointer rounded-lg px-3 py-2 hover:bg-[#21262d]"
            >
              <input
                type="radio"
                name="lost_reason"
                value={key}
                checked={reason === key}
                onChange={() => setReason(key)}
                className="rounded-full border-gray-600 bg-[#0d1117] text-blue-500 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-200">{t(REASON_LABEL_KEYS[key])}</span>
            </label>
          ))}
        </div>
        {reason === 'other' && (
          <div className="mb-4">
            <input
              type="text"
              value={reasonOther}
              onChange={(e) => setReasonOther(e.target.value)}
              placeholder={t('lost_reason_other_placeholder')}
              className="w-full px-3 py-2 rounded-lg bg-[#0d1117] border border-gray-700 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              dir={dir}
            />
          </div>
        )}
        <div className="flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            {t('lost_reason_cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!reason || (reason === 'other' && !reasonOther.trim())}
            className="px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('lost_reason_confirm')}
          </button>
        </div>
      </div>
    </>
  )
}
