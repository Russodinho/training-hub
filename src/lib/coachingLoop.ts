// Generic Claude-drafts / GPT-4-critiques / Claude-refines loop, shared by
// every one of the 12 coaches in src/app/agent. Same 3-step pattern as the
// single training coach built earlier this session (src/lib/agentAnalysis.ts,
// since retired in favor of this multi-coach system) — just generalized to
// take any system prompt + question and return a short plain-text message
// instead of a structured analysis object.

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

function firstText(content: { type: string; text?: string }[]): string {
  return content.find(b => b.type === 'text')?.text ?? ''
}

export async function runCoachMessage(systemPrompt: string, userQuestion: string): Promise<string> {
  const anthropic = new Anthropic()
  const openai = new OpenAI()

  // Step 1 — Claude drafts
  const draftResponse = await anthropic.messages.create({
    model: 'claude-opus-5',
    max_tokens: 400,
    output_config: { effort: 'low' },
    system: systemPrompt,
    messages: [{ role: 'user', content: userQuestion }],
  })
  const draft = firstText(draftResponse.content) || 'No draft produced.'

  // Step 2 — GPT-4 critiques
  const critique = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 250,
    messages: [
      {
        role: 'system',
        content: "You are a skeptical second-opinion reviewer for an AI coach. You'll be given the coach's role/expertise plus the live athlete data it was given, and its draft message. Critique it directly and concisely: point out anything unsupported by the data, generic advice that ignores the specifics given, or anything that runs well over the 120-word limit the coach was told to follow.",
      },
      {
        role: 'user',
        content: `${systemPrompt}\n\nDraft message from the coach:\n${draft}\n\nCritique this draft.`,
      },
    ],
  })
  const critiqueText = critique.choices[0]?.message?.content ?? 'No critique returned.'

  // Step 3 — Claude refines using the critique
  const finalResponse = await anthropic.messages.create({
    model: 'claude-opus-5',
    max_tokens: 400,
    output_config: { effort: 'low' },
    system: systemPrompt,
    messages: [
      { role: 'user', content: userQuestion },
      { role: 'assistant', content: draft },
      {
        role: 'user',
        content: `A second reviewer critiqued your draft:\n${critiqueText}\n\nIncorporate any valid points, ignore invalid ones, and give your final coaching message. Stay under 120 words.`,
      },
    ],
  })

  return (firstText(finalResponse.content) || draft).trim()
}
