import { LocaleProvider } from '@/components/LocaleContext'
import Dashboard from '@/components/Dashboard'

export default function Home() {
  return (
    <LocaleProvider>
      <Dashboard />
    </LocaleProvider>
  )
}
