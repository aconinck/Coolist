'use client'

import { useState, useRef, useEffect } from 'react'

type Props = {
  onSuccess?: () => void
  defaultValue?: string
}

export default function MagicInput({ onSuccess, defaultValue = '' }: Props) {
  const [text, setText] = useState(defaultValue)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (defaultValue) setText(defaultValue)
  }, [defaultValue])

  const showToast = (message: string, ok: boolean) => {
    setToast({ message, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const submit = async () => {
    if (!text.trim() || loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/parse-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      showToast(data.message, true)
      setText('')
      onSuccess?.()
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Something went wrong', false)
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="relative w-full">
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3.5"
        style={{
          background: '#ffffff',
          border: '1px solid #ede8e3',
          boxShadow: '0 2px 16px rgba(232,118,72,0.08)',
        }}
      >
        {/* AI sparkle */}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M8 1l1.5 4.5L14 7l-4.5 1.5L8 13l-1.5-4.5L2 7l4.5-1.5z" fill="#e87648"/>
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Add milk, remind me about soccer Friday…"
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: '#1a1410', letterSpacing: '-0.01em' }}
          disabled={loading}
        />

        <button
          onClick={submit}
          disabled={loading || !text.trim()}
          className="shrink-0 rounded-xl px-4 py-1.5 text-xs font-bold transition-all disabled:opacity-30"
          style={{ background: '#e87648', color: '#ffffff', letterSpacing: '-0.01em' }}
        >
          {loading ? (
            <span className="flex items-center gap-1.5">
              <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
            </span>
          ) : 'Add'}
        </button>
      </div>

      {toast && (
        <div
          className="absolute top-full mt-2 left-0 right-0 text-center text-xs font-semibold py-2.5 px-4 rounded-2xl z-50"
          style={{
            background: toast.ok ? '#4caf7d' : '#e05c5c',
            color: '#ffffff',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  )
}
