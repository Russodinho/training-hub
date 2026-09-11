// Persists coach check-in messages so each agent runs at most once per
// calendar day, and so /agent can show previous days' output below
// today's. See supabase/migrations/0008_agent_messages.sql.

import { getSupabaseClient, todayStr } from './supabase'
import type { AgentId } from './agentPrompts'

export { todayStr }

export async function getCachedMessage(agentId: AgentId, date: string): Promise<string | null> {
  const sb = getSupabaseClient()
  const { data } = await sb.from('agent_messages').select('message').eq('date', date).eq('agent_id', agentId).maybeSingle()
  return data?.message ?? null
}

// Plain insert, not upsert — the unique (date, agent_id) constraint is the
// real once-per-day guard. A losing concurrent insert hits Postgres 23505
// and is swallowed; the winner's row is what every caller should read via
// getCachedMessage.
export async function saveMessage(agentId: AgentId, date: string, message: string): Promise<void> {
  const sb = getSupabaseClient()
  const { error } = await sb.from('agent_messages').insert({ date, agent_id: agentId, message })
  if (error && error.code !== '23505') {
    console.error('agent_messages insert failed', error)
  }
}

export async function getMessagesForDate(date: string): Promise<Record<string, string>> {
  const sb = getSupabaseClient()
  const { data } = await sb.from('agent_messages').select('agent_id, message').eq('date', date)
  return Object.fromEntries((data ?? []).map(r => [r.agent_id, r.message]))
}

export interface DayMessages {
  date: string
  messages: Record<string, string>
}

export async function getMessageHistory(excludeDate: string, days = 30): Promise<DayMessages[]> {
  const sb = getSupabaseClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data } = await sb
    .from('agent_messages')
    .select('date, agent_id, message')
    .neq('date', excludeDate)
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: false })

  const grouped = new Map<string, Record<string, string>>()
  for (const row of data ?? []) {
    if (!grouped.has(row.date)) grouped.set(row.date, {})
    grouped.get(row.date)![row.agent_id] = row.message
  }
  return Array.from(grouped.entries()).map(([date, messages]) => ({ date, messages }))
}
