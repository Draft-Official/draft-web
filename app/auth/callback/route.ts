import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * Supabase anon key 가져오기
 */
function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
         process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
         '';
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  console.log('[Auth Callback] Full URL:', request.url)
  console.log('[Auth Callback] All params:', Object.fromEntries(searchParams.entries()))
  console.log('[Auth Callback] code:', code ? 'exists' : 'missing')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      getSupabaseAnonKey(),
      {

        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Server Component에서 호출 시 무시
            }
          },
        },
        cookieEncoding: 'raw',
      }
    )
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[Auth Callback] exchangeCodeForSession result:', {
      hasSession: !!data?.session,
      hasUser: !!data?.user,
      error: error?.message
    })
    if (!error) {
      console.log('[Auth Callback] Success! Redirecting to:', `${origin}${next}`)
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[Auth Callback] Error:', error)
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
