'use client'

import { useEffect, useState } from 'react'
import { getChecklistItems, toggleChecklistItem, deleteChecklistItem, createChecklistItem, type ChecklistItem } from '@/lib/db'
import { getWishlistItems, deleteWishlistItem, type WishlistItem } from '@/lib/db'

type Template = 'groceries' | 'tasks' | 'wishlist' | 'travel'

const TEMPLATES: { id: Template; label: string; icon: string; color: string; bg: string }[] = [
  { id: 'groceries', label: 'Groceries',  icon: '🛒', color: '#4caf7d', bg: '#f0faf4' },
  { id: 'tasks',     label: 'Tasks',      icon: '✓',  color: '#5b8dee', bg: '#f0f4fd' },
  { id: 'wishlist',  label: 'Wishlist',   icon: '★',  color: '#e87648', bg: '#fdf0e8' },
  { id: 'travel',    label: 'Travel',     icon: '✈',  color: '#9b6ed4', bg: '#f5f0fd' },
]

const PRIORITY_STYLE: Record<string, { bg: string; color: string }> = {
  high:   { bg: '#fef0f0', color: '#e05c5c' },
  medium: { bg: '#fef8ec', color: '#f0a83a' },
  low:    { bg: '#f0faf4', color: '#4caf7d' },
}

export default function ListsTab({ refreshKey }: { refreshKey?: number }) {
  const [active, setActive] = useState<Template>('groceries')
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([getChecklistItems(), getWishlistItems()]).then(([c, w]) => {
      setChecklist(c)
      setWishlist(w)
      setLoading(false)
    })
  }, [refreshKey])

  const addItem = async () => {
    if (!newItem.trim()) return
    setAdding(true)
    const item = await createChecklistItem(newItem.trim())
    setChecklist(prev => [...prev, item])
    setNewItem('')
    setAdding(false)
  }

  const toggle = async (item: ChecklistItem) => {
    setChecklist(prev => prev.map(i => i.id === item.id ? { ...i, is_done: !i.is_done } : i))
    await toggleChecklistItem(item.id, !item.is_done)
  }

  const remove = async (id: string) => {
    setChecklist(prev => prev.filter(i => i.id !== id))
    await deleteChecklistItem(id)
  }

  const removeWish = async (id: string) => {
    setWishlist(prev => prev.filter(i => i.id !== id))
    await deleteWishlistItem(id)
  }

  const tpl = TEMPLATES.find(t => t.id === active)!
  const activeItems = checklist.filter(i => !i.is_done)
  const doneItems = checklist.filter(i => i.is_done)

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Template grid */}
      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="rounded-2xl p-4 text-left transition-all"
            style={{
              background: active === t.id ? t.color : '#ffffff',
              border: active === t.id ? 'none' : '1px solid #ede8e3',
              boxShadow: active === t.id ? `0 4px 16px ${t.color}40` : 'none',
            }}
          >
            <span className="text-2xl block mb-2">{t.icon}</span>
            <span
              className="text-sm font-semibold block"
              style={{ color: active === t.id ? '#ffffff' : '#1a1410' }}
            >
              {t.label}
            </span>
            <span
              className="text-xs block mt-0.5"
              style={{ color: active === t.id ? 'rgba(255,255,255,0.7)' : '#a89d96' }}
            >
              {t.id === 'wishlist'
                ? `${wishlist.length} items`
                : `${checklist.filter(i => !i.is_done).length} pending`}
            </span>
          </button>
        ))}
      </div>

      {/* Active template content */}
      <div
        className="rounded-3xl p-5 flex flex-col gap-4"
        style={{ background: '#ffffff', border: '1px solid #ede8e3' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
            style={{ background: tpl.bg }}
          >
            {tpl.icon}
          </div>
          <h3 className="text-base font-bold" style={{ color: '#1a1410', letterSpacing: '-0.02em' }}>
            {tpl.label}
          </h3>
        </div>

        {/* Checklist / Tasks / Groceries / Travel view */}
        {active !== 'wishlist' && (
          <>
            {/* Add item inline */}
            <div
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
              style={{ background: '#faf7f4' }}
            >
              <input
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder={`Add to ${tpl.label.toLowerCase()}…`}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: '#1a1410' }}
              />
              <button
                onClick={addItem}
                disabled={adding || !newItem.trim()}
                className="text-xs font-bold px-3 py-1 rounded-lg disabled:opacity-30"
                style={{ background: tpl.color, color: '#ffffff' }}
              >
                {adding ? '…' : '+'}
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col gap-2">
                {[1,2,3].map(n => (
                  <div key={n} className="h-5 rounded-full animate-pulse" style={{ background: '#ede8e3', width: `${60+n*12}%` }} />
                ))}
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {activeItems.length === 0 && (
                  <li className="text-xs text-center py-3" style={{ color: '#a89d96' }}>
                    Empty — add something above
                  </li>
                )}
                {activeItems.map(item => (
                  <li key={item.id} className="flex items-center gap-3 group py-0.5">
                    <button
                      onClick={() => toggle(item)}
                      className="w-5 h-5 shrink-0 rounded-full border-2 transition-colors"
                      style={{ borderColor: tpl.color }}
                    />
                    <span className="flex-1 text-sm" style={{ color: '#1a1410' }}>{item.title}</span>
                    <button
                      onClick={() => remove(item.id)}
                      className="opacity-0 group-hover:opacity-100 text-xs transition-opacity"
                      style={{ color: '#a89d96' }}
                    >✕</button>
                  </li>
                ))}
                {doneItems.length > 0 && (
                  <>
                    <div className="h-px mt-1" style={{ background: '#f0ebe6' }} />
                    {doneItems.slice(0, 3).map(item => (
                      <li key={item.id} className="flex items-center gap-3 group py-0.5">
                        <div
                          className="w-5 h-5 shrink-0 rounded-full flex items-center justify-center"
                          style={{ background: tpl.color }}
                          onClick={() => toggle(item)}
                        >
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span className="flex-1 text-sm line-through" style={{ color: '#a89d96' }}>{item.title}</span>
                        <button onClick={() => remove(item.id)} className="opacity-0 group-hover:opacity-100 text-xs" style={{ color: '#a89d96' }}>✕</button>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            )}
          </>
        )}

        {/* Wishlist view */}
        {active === 'wishlist' && (
          <div className="flex flex-col gap-2">
            {wishlist.length === 0 && (
              <p className="text-xs text-center py-3" style={{ color: '#a89d96' }}>
                No wishes yet — add them from the input bar above
              </p>
            )}
            {wishlist.map(item => {
              const p = PRIORITY_STYLE[item.priority] ?? PRIORITY_STYLE.medium
              return (
                <div key={item.id} className="flex items-start gap-3 group py-1">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium" style={{ color: '#1a1410' }}>{item.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={p}>
                        {item.priority}
                      </span>
                    </div>
                    {item.family_member && (
                      <p className="text-xs mt-0.5" style={{ color: '#a89d96' }}>for {item.family_member}</p>
                    )}
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        className="text-xs block truncate mt-0.5 hover:underline" style={{ color: '#e87648' }}>
                        {item.url}
                      </a>
                    )}
                  </div>
                  <button onClick={() => removeWish(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-xs shrink-0 mt-0.5 transition-opacity"
                    style={{ color: '#a89d96' }}>✕</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
