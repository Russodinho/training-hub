import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Creates a pending sync request. garmin_sync_poller.ps1 (1-minute Task
// Scheduler trigger, on the PC that owns the local GarminDB data) picks
// this up, runs the real sync, and marks it done — see the migration
// comment in 0006_sync_requests.sql for why this can't just run the sync
// directly from here.
export async function POST() {
  const sb = createServiceClient()
  const { data, error } = await sb
    .from('sync_requests')
    .insert({ type: 'garmin', status: 'pending' })
    .select('id, status, requested_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Poll for a request's status: /api/garmin/request-sync?id=123
export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const sb = createServiceClient()
  const { data, error } = await sb
    .from('sync_requests')
    .select('id, status, requested_at, completed_at, error')
    .eq('id', id)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json(data)
}
