'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  getChecklistItems,
  toggleChecklistItem,
  deleteChecklistItem,
  type ChecklistItem,
} from '@/lib/db'

export default function Checklist() {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setItems(await getChecklistItems())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const channel = supabase
      .channel('checklist_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist_items' }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [load])

  const toggle = async (item: ChecklistItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_done: !i.is_done } : i))
    )
    await toggleChecklistItem(item.id, !item.is_done)
  }

  const remove = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
    await deleteChecklistItem(id)
  }

  const active = items.filter((i) => !i.is_done)
  const done = items.filter((i) => i.is_done)

  if (loading) {
    return (
      <div className="flex flex-col gap-2.5">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-5 rounded-full animate-pulse" style={{ background: '#f5f5f7', width: `${70 + n * 8}%` }} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Active */}
      <ul className="flex flex-col gap-1">
        {active.length === 0 && (
          <li className="text-xs py-1" style={{ color: '#aeaeb2' }}>
            All clear — add something above.
          </li>
        )}
        {active.map((item) => (
          <li key={item.id} className="flex items-center gap-3 group py-1">
            <button
              onClick={() => toggle(item)}
              className="w-[18px] h-[18px] shrink-0 rounded-full border transition-all flex items-center justify-center"
              style={{ borderColor: '#d1d1d6' }}
              aria-label="Mark done"
            />
            <span className="flex-1 text-sm" style={{ color: '#1d1d1f', letterSpacing: '-0.01em' }}>
              {item.title}
            </span>
            <button
              onClick={() => remove(item.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-xs w-4 h-4 rounded flex items-center justify-center"
              style={{ color: '#aeaeb2' }}
              aria-label="Delete"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {/* Done */}
      {done.length > 0 && (
        <div>
          <div className="h-px mb-4" style={{ background: '#f2f2f7' }} />
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#aeaeb2' }}>
            Completed · {done.length}
          </p>
          <ul className="flex flex-col gap-1">
            {done.map((item) => (
              <li key={item.id} className="flex items-center gap-3 group py-1">
                <button
                  onClick={() => toggle(item)}
                  className="w-[18px] h-[18px] shrink-0 rounded-full flex items-center justify-center transition-all"
                  style={{ background: '#5e5ce6' }}
                  aria-label="Mark undone"
                >
                  <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                    <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="flex-1 text-sm line-through" style={{ color: '#aeaeb2', letterSpacing: '-0.01em' }}>
                  {item.title}
                </span>
                <button
                  onClick={() => remove(item.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                  style={{ color: '#aeaeb2' }}
                  aria-label="Delete"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
