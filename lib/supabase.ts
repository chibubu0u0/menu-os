import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-anon-key'

export const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type MenuItem = {
  id: string
  category: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  available: boolean
  featured: boolean
  sort_order: number
  label: string | null
  is_limited: boolean
  start_date: string | null
  end_date: string | null
  created_at?: string
  updated_at?: string
}

export type MenuCategory = {
  id: string
  title: string
  english: string | null
  eyebrow: string | null
  note: string | null
  subnote: string | null
  sort_order: number
  visible: boolean
  layout_style: string
  group_title: string | null
  group_english: string | null
  created_at?: string
  updated_at?: string
}

export type SiteSection = {
  id: string
  section_key: string
  title: string
  english: string | null
  body: string | null
  style: string
  visible: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}
