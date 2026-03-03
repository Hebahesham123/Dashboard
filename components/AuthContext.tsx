'use client'

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase, PROFILES_TABLE, type Profile, type UserRole } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const PROFILE_FETCH_TIMEOUT_MS = 8000
const INITIAL_LOAD_MAX_MS = 4000

type AuthContextValue = {
  user: User | null
  profile: Profile | null
  loading: boolean
  profileChecked: boolean
  signOut: () => Promise<void>
  hasAccess: boolean
  retryProfileFetch: () => Promise<void>
  autoSignIn: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const ALLOWED_ROLES: UserRole[] = ['admin', 'call_center']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileChecked, setProfileChecked] = useState(false)
  const userRef = useRef<User | null>(null)
  userRef.current = user
  const hadSessionRef = useRef(false)

  const fetchOrCreateProfile = useCallback(async (uid: string, email: string): Promise<Profile | null> => {
    const { data: existing, error: selectError } = await supabase
      .from(PROFILES_TABLE)
      .select('*')
      .eq('user_id', uid)
      .maybeSingle()

    if (selectError) {
      console.error('Profile select failed:', selectError.message, selectError)
      return null
    }
    if (existing) return existing as Profile

    const { data: inserted, error: insertError } = await supabase
      .from(PROFILES_TABLE)
      .insert({ user_id: uid, email: email || '', role: 'call_center' })
      .select()
      .single()

    if (insertError) {
      console.error('Profile insert failed:', insertError.message, insertError)
      return null
    }
    return inserted as Profile
  }, [])

  // Only release initial load when we still have no user (so we don't sign out a user who just logged in)
  useEffect(() => {
    const t = setTimeout(() => {
      if (userRef.current === null) {
        setProfileChecked(true)
        setLoading(false)
      }
    }, INITIAL_LOAD_MAX_MS)
    return () => clearTimeout(t)
  }, [])

  // Auto sign-in: no login screen — use env credentials when there's no session
  const autoSignIn = useCallback(async () => {
    const email = process.env.NEXT_PUBLIC_DASHBOARD_EMAIL
    const password = process.env.NEXT_PUBLIC_DASHBOARD_PASSWORD
    if (!email || !password) return false
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return !error
  }, [])

  // Single source of truth: only onAuthStateChange (no getSession()) to avoid auth lock contention
  useEffect(() => {
    let cancelled = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return
      setUser(session?.user ?? null)
      if (!session?.user) {
        setProfile(null)
        setProfileChecked(true)
        if (hadSessionRef.current) {
          setLoading(false)
          return
        }
        const ok = await autoSignIn()
        if (!cancelled && !ok) setLoading(false)
        return
      }
      hadSessionRef.current = true
      setProfileChecked(false)
      setLoading(true)
      let done = false
      const profileTimeout = setTimeout(() => {
        if (cancelled || done) return
        done = true
        setProfileChecked(true)
        setLoading(false)
      }, PROFILE_FETCH_TIMEOUT_MS)
      try {
        // Wait for session to be applied so RLS allows profile read/insert
        await new Promise((r) => setTimeout(r, 400))
        if (cancelled) return
        let p = await fetchOrCreateProfile(session.user.id, session.user.email ?? '')
        if (p == null && !cancelled && !done) {
          await new Promise((r) => setTimeout(r, 800))
          if (cancelled) return
          p = await fetchOrCreateProfile(session.user.id, session.user.email ?? '')
        }
        if (cancelled) return
        if (!done) {
          done = true
          clearTimeout(profileTimeout)
          setProfile(p)
          setProfileChecked(true)
          setLoading(false)
        }
      } catch (e) {
        if (!cancelled && !done) {
          done = true
          clearTimeout(profileTimeout)
          setProfileChecked(true)
          setLoading(false)
        }
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [fetchOrCreateProfile, autoSignIn])

  useEffect(() => {
    if (loading || !user || profile) return
    const t = setTimeout(() => {
      fetchOrCreateProfile(user.id, user.email ?? '').then((p) => {
        if (p) setProfile(p)
      })
    }, 2000)
    return () => clearTimeout(t)
  }, [loading, user, profile, fetchOrCreateProfile])

  const signOut = useCallback(async () => {
    setUser(null)
    setProfile(null)
    setProfileChecked(false)
    supabase.auth.signOut().catch(() => {})
  }, [])

  const hasAccess = !!profile && ALLOWED_ROLES.includes(profile.role)

  const retryProfileFetch = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const p = await fetchOrCreateProfile(user.id, user.email ?? '')
    setProfile(p)
    setProfileChecked(true)
    setLoading(false)
  }, [user, fetchOrCreateProfile])

  return (
    <AuthContext.Provider value={{ user, profile, loading, profileChecked, signOut, hasAccess, retryProfileFetch, autoSignIn }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
