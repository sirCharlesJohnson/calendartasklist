import { createClient } from '@supabase/supabase-js'

// Check if we have valid environment variables
const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url' &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'your_supabase_anon_key' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('http') &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.includes('supabase.co')

// Only create client if properly configured, otherwise use dummy values
const supabaseUrl = isSupabaseConfigured 
  ? process.env.NEXT_PUBLIC_SUPABASE_URL!
  : 'https://placeholder.supabase.co'
const supabaseAnonKey = isSupabaseConfigured 
  ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  : 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export configuration status for debugging
export { isSupabaseConfigured }

// Database types
export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string
          text: string
          completed: boolean
          date: string | null
          priority: 'high' | 'medium' | 'low'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          text: string
          completed?: boolean
          date?: string | null
          priority?: 'high' | 'medium' | 'low'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          text?: string
          completed?: boolean
          date?: string | null
          priority?: 'high' | 'medium' | 'low'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
