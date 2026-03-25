import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { url } = await req.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  // Fetch the page HTML server-side (avoids CORS issues from the browser)
  let html = ''
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Coolist/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    html = await res.text()
  } catch {
    return NextResponse.json({ error: 'Could not fetch the URL' }, { status: 400 })
  }

  // Extract only the <head> and a snippet of <body> to keep the prompt small
  const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
  const head = headMatch ? headMatch[1] : ''
  const snippet = (head + html.slice(0, 2000)).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')

  // Ask the AI to summarize the product
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Extract product info from this web page content and return ONLY valid JSON:
{
  "product_name": "clean product name",
  "price": "price as a string like '$29.99', or null if not found",
  "suggested_sentence": "a natural sentence to add this to a wishlist, e.g. 'Add Nike Air Max for $120 to wishlist for João'"
}`,
        },
        { role: 'user', content: snippet.slice(0, 3000) },
      ],
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0].message.content ?? '{}'
    const result = JSON.parse(raw)
    return NextResponse.json({ success: true, ...result, url })
  } catch (err) {
    console.error('URL summarize error:', err)
    return NextResponse.json({ error: 'Failed to summarize URL' }, { status: 500 })
  }
}
