import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

/**
 * Browser-side Supabase client.
 * Use this in client components for real-time subscriptions, storage, etc.
 * Prisma remains the primary ORM for database queries via API routes.
 */
let browserClient: SupabaseClient | undefined

export function getSupabaseBrowserClient(): SupabaseClient {
  if (!browserClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        'Supabase environment variables are missing. ' +
          'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env'
      )
    }
    browserClient = createClient(supabaseUrl, supabaseAnonKey)
  }
  return browserClient
}

/**
 * Server-side Supabase client factory.
 * Creates a new client per request to avoid shared state in serverless.
 * Use this in API routes or server components if you need Supabase directly
 * (e.g., for storage uploads or real-time admin operations).
 * Prisma remains the primary ORM for database queries.
 */
export function getSupabaseServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

  if (!url || !key) {
    console.warn(
      'Supabase environment variables are missing. ' +
        'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env'
    )
  }

  return createClient(url, key)
}
