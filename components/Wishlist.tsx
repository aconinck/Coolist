'use client'

import { useEffect, useState } from 'react'
import { getWishlistItems, deleteWishlistItem, type WishlistItem } from '@/lib/db'

const PRIORITY: Record<string, { bg: string; text: string; label: string }> = {
  high:   { bg: '#fff1f0', text: '#ff3b30', label: 'High' },
  medium: { bg: '#fff9f0', text: '#ff9500', label: 'Mid' },
  low:    { bg: '#f0fff4', text: '#34c759', label: 'Low' },
}

type Props = {
  onSuggestInput?: (text: string) => void
  refreshKey?: number
}

export default function Wishlist({ onSuggestInput, refreshKey }: Props) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [urlInput, setUrlInput] = useState('')
  const [urlLoading, setUrlLoading] = useState(false)
  const [urlError, setUrlError] = useState('')

  const load = async () => {
    try {
      setItems(await getWishlistItems())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [refreshKey])

  const remove = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await deleteWishlistItem(id)
  }

  const handleUrlSummarize = async () => {
    if (!urlInput.trim()) return
    setUrlLoading(true)
    setUrlError('')
    try {
      const res = await fetch('/api/summarize-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onSuggestInput?.(data.suggested_sentence)
      setUrlInput('')
    } catch (err: unknown) {
      setUrlError(err instanceof Error ? err.message : 'Could not summarize URL')
    } finally {
      setUrlLoading(false)
    }
  }

  // Group by family member
  const grouped = items.reduce<Record<string, WishlistItem[]>>((acc, item) => {
    const key = item.family_member ?? 'Everyone'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex flex-col gap-2.5">
        {[1, 2].map((n) => (
          <div key={n} className="h-5 rounded-full animate-pulse" style={{ background: '#f5f5f7', width: `${65 + n * 10}%` }} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* URL summarizer */}
      <div className="flex flex-col gap-1.5">
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2.5"
          style={{ background: '#f5f5f7' }}
        >
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSummarize()}
            placeholder="Paste a product URL…"
            className="flex-1 bg-transparent outline-none text-xs"
            style={{ color: '#1d1d1f' }}
          />
          <button
            onClick={handleUrlSummarize}
            disabled={urlLoading || !urlInput.trim()}
            className="text-xs font-semibold px-3 py-1 rounded-lg disabled:opacity-30 transition-all"
            style={{ background: '#5e5ce6', color: '#ffffff' }}
          >
            {urlLoading ? '…' : 'Go'}
          </button>
        </div>
        {urlError && (
          <p className="text-xs px-1" style={{ color: '#ff3b30' }}>{urlError}</p>
        )}
      </div>

      {/* Items */}
      {Object.keys(grouped).length === 0 && (
        <p className="text-xs" style={{ color: '#aeaeb2' }}>
          No wishes yet. Tell Coolist what you want!
        </p>
      )}

      {Object.entries(grouped).map(([member, memberItems]) => (
        <div key={member}>
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: '#aeaeb2' }}
          >
            {member}
          </p>
          <ul className="flex flex-col gap-1">
            {memberItems.map((item) => {
              const p = PRIORITY[item.priority] ?? PRIORITY.medium
              return (
                <li key={item.id} className="flex items-start gap-3 group py-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-sm"
                        style={{ color: '#1d1d1f', letterSpacing: '-0.01em' }}
                      >
                        {item.title}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
                        style={{ background: p.bg, color: p.text }}
                      >
                        {p.label}
                      </span>
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs block truncate mt-0.5 hover:underline"
                        style={{ color: '#5e5ce6' }}
                      >
                        {item.url}
                      </a>
                    )}
                  </div>
                  <button
                    onClick={() => remove(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs mt-0.5 shrink-0"
                    style={{ color: '#aeaeb2' }}
                    aria-label="Delete"
                  >
                    ✕
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
