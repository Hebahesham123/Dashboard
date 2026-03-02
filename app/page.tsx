import { AuthProvider } from '@/components/AuthContext'
import { LocaleProvider } from '@/components/LocaleContext'
import AuthGuard from '@/components/AuthGuard'

export default function Home() {
  return (
    <AuthProvider>
      <LocaleProvider>
        <AuthGuard />
      </LocaleProvider>
    </AuthProvider>
  )
}
