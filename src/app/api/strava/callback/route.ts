import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForTokens } from '@/lib/strava'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/?strava=error', req.url))
  }

  const tokens = await exchangeCodeForTokens(code)
  const supabase = createServiceClient()

  // Store tokens
  await supabase.from('strava_tokens').upsert({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expires_at,
    athlete_id: tokens.athlete?.id ?? null,
    updated_at: new Date().toISOString(),
  })

  // Trigger initial sync
  await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/strava/sync`, { method: 'POST' })

  return NextResponse.redirect(new URL('/?strava=connected', req.url))
}
