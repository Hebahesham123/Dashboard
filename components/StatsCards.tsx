'use client'

import { useLocale } from './LocaleContext'

export default function StatsCards({
  total,
  today,
  week,
}: {
  total: number
  today: number
  week: number
}) {
  const { t } = useLocale()
  return (
    <div className="flex flex-wrap gap-6 mb-6">
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-white">{total}</span>
        <span className="text-sm text-gray-400">{t('total')}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-white">{today}</span>
        <span className="text-sm text-gray-400">{t('today')}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-white">{week}</span>
        <span className="text-sm text-gray-400">{t('this_week')}</span>
      </div>
    </div>
  )
}
