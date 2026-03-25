import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createChecklistItem, createEvent, createWishlistItem } from '@/lib/db'

export const dynamic = 'force-dynamic'

// The JSON schema the AI must always return
const SYSTEM_PROMPT = `You are the Coolist Assistant. Your job is to take raw family notes and return a structured JSON object.

Rules:
- If the user mentions an item to buy or a household task → type: "CHECKLIST"
- If the user mentions a date, deadline, appointment, or reminder → type: "EVENT"
- If the user mentions something they want, a gift, or a wish → type: "WISHLIST"

A single sentence can produce multiple items (e.g. "buy milk and remind me about soccer Friday" → 2 items).

For EVENT items, convert relative dates like "Friday", "tomorrow", "next Monday" to ISO date format (YYYY-MM-DD).
Today's date is: ${new Date().toISOString().split('T')[0]}

Always respond with ONLY valid JSON in this exact structure, nothing else:
{
  "items": [
    {
      "type": "CHECKLIST" | "EVENT" | "WISHLIST",
      "title": "string",
      "date": "YYYY-MM-DD or null",
      "priority": "low" | "medium" | "high" | null,
      "family_member": "string or null"
    }
  ]
}`

type ParsedItem = {
  type: 'CHECKLIST' | 'EVENT' | 'WISHLIST'
  title: string
  date: string | null
  priority: 'low' | 'medium' | 'high' | null
  family_member: string | null
}

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ error: 'Text is required' }, { status: 400 })
  }

  // 1. Ask the AI to parse the input
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  let items: ParsedItem[]
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text.trim() },
      ],
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0].message.content ?? '{}'
    const parsed = JSON.parse(raw)
    items = parsed.items ?? []
  } catch (err) {
    console.error('AI parse error:', err)
    return NextResponse.json({ error: 'Failed to parse input with AI' }, { status: 500 })
  }

  // 2. Save each item to the correct Supabase table
  const results = await Promise.allSettled(
    items.map((item) => {
      switch (item.type) {
        case 'CHECKLIST':
          return createChecklistItem(item.title)
        case 'EVENT':
          // If no date was extracted, default to today
          return createEvent(item.title, item.date ?? new Date().toISOString().split('T')[0])
        case 'WISHLIST':
          return createWishlistItem(
            item.title,
            item.priority ?? 'medium',
            item.family_member
          )
      }
    })
  )

  const saved = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length

  return NextResponse.json({
    success: true,
    parsed: items,
    saved,
    failed,
    message: `Created ${saved} item${saved !== 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}`,
  })
}
