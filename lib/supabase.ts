import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, anonKey)

export const TABLE_NAME = 'sample_inquiries'
export const CREATED_AT_COLUMN = 'created_at'

export type SubmissionStatus =
  | 'new'
  | 'contacted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export const STATUS_OPTIONS: { value: SubmissionStatus; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export type SampleInquiry = {
  id: string
  name: string
  phone: string
  address: string | null
  message: string | null
  requested_samples: string | null
  attachment_name: string | null
  attachment_url: string | null
  status?: SubmissionStatus | null
  created_at: string
}
