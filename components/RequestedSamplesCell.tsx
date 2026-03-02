'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from './LocaleContext'

/** Parse requested_samples string into array (comma, newline, or semicolon separated) */
export function parseRequestedSamples(value: string | null): string[] {
  if (value == null || String(value).trim() === '') return []
  return String(value)
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** First two words of a string */
function firstTwoWords(s: string): string {
  const t = s.trim()
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length <= 2) return t
  return parts.slice(0, 2).join(' ')
}

export default function RequestedSamplesCell({ value }: { value: string | null }) {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const samples = parseRequestedSamples(value)

  useEffect(() => {
    if (!open) return
    const onOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  if (samples.length === 0) return <span className="text-gray-500">—</span>

  const firstProductPreview = firstTwoWords(samples[0])
  const hasMore = samples.length > 1 || samples[0].trim().split(/\s+/).length > 2

  return (
    <div className="relative max-w-[140px]" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-left text-blue-400 hover:text-blue-300 text-xs font-medium flex items-center gap-1 truncate w-full"
        title={samples.length > 1 ? t('more_samples') : samples[0]}
      >
        <span className="truncate">{firstProductPreview}</span>
        {samples.length > 1 && (
          <span className="text-gray-500 shrink-0">(+{samples.length - 1})</span>
        )}
        {hasMore && <span className="text-gray-500 shrink-0">▼</span>}
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 min-w-[180px] py-2 px-2 rounded-lg bg-[#21262d] border border-gray-700 shadow-xl max-h-48 overflow-y-auto">
          <div className="text-xs font-medium text-gray-500 px-2 pb-1 border-b border-gray-700">
            {t('requested_samples')}
          </div>
          <ul className="mt-1 space-y-0.5">
            {samples.map((s, i) => (
              <li key={i} className="text-sm text-gray-200 px-2 py-1 rounded hover:bg-gray-700/50">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
