import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-anon-key'

export const hasSupabaseEnv = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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
  created_at?: string
  updated_at?: string
}
