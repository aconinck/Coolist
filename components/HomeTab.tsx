'use client'

import { useEffect, useState } from 'react'
import { getChecklistItems, getEvents, toggleChecklistItem, type ChecklistItem, type EventItem } from '@/lib/db'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function formatEventDate(dateStr: string) {
  const diff = Math.round(
    (new Date(dateStr + 'T12:00:00').setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000
  )
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function HomeTab() {
  const [tasks, setTasks] = useState<ChecklistItem[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  useEffect(() => {
    Promise.all([getChecklistItems(), getEvents()]).then(([t, e]) => {
      setTasks(t)
      setEvents(e.filter(ev => {
        const diff = Math.round((new Date(ev.event_date + 'T12:00:00').setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000)
        return diff >= 0 && diff <= 7
      }).slice(0, 3))
      setLoading(false)
    })
  }, [])

  const toggle = async (item: ChecklistItem) => {
    setTasks(prev => prev.map(i => i.id === item.id ? { ...i, is_done: !i.is_done } : i))
    await toggleChecklistItem(item.id, !item.is_done)
  }

  const active = tasks.filter(t => !t.is_done).slice(0, 6)
  const done = tasks.filter(t => t.is_done).slice(0, 3)

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1a1410', letterSpacing: '-0.03em' }}>
            {getGreeting()}
          </h1>
          <p className="text-sm mt-1" style={{ color: '#a89d96' }}>{today}</p>
        </div>
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-bold"
          style={{ background: '#e87648', color: '#ffffff' }}
        >
          C
        </div>
      </div>

      {/* Upcoming events strip */}
      {events.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#a89d96' }}>Upcoming</p>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {events.map(ev => {
              const diff = Math.round((new Date(ev.event_date + 'T12:00:00').setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000)
              const urgent = diff <= 1
              return (
                <div
                  key={ev.id}
                  className="shrink-0 rounded-2xl px-4 py-3 min-w-[160px]"
                  style={{
                    background: urgent ? '#e87648' : '#ffffff',
                    border: urgent ? 'none' : '1px solid #ede8e3',
                  }}
                >
                  <p className="text-xs font-semibold mb-1" style={{ color: urgent ? 'rgba(255,255,255,0.75)' : '#a89d96' }}>
                    {formatEventDate(ev.event_date)}
                  </p>
                  <p className="text-sm font-semibold leading-tight" style={{ color: urgent ? '#ffffff' : '#1a1410' }}>
                    {ev.title}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Reminder banner */}
      <div
        className="rounded-3xl p-5 flex items-center justify-between"
        style={{ background: '#fdf0e8' }}
      >
        <div className="flex-1">
          <p className="text-base font-bold" style={{ color: '#1a1410', letterSpacing: '-0.02em' }}>
            Set the reminder
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: '#a89d96' }}>
            Never miss a family task!{'\n'}Stay on track every day.
          </p>
          <button
            className="mt-3 px-4 py-2 rounded-xl text-xs font-bold"
            style={{ background: '#1a1410', color: '#ffffff' }}
          >
            Set Now
          </button>
        </div>
        <div className="text-5xl ml-4" aria-hidden>🔔</div>
      </div>

      {/* Daily tasks */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-base font-bold" style={{ color: '#1a1410', letterSpacing: '-0.02em' }}>
            Daily tasks
          </p>
          <span className="text-xs" style={{ color: '#a89d96' }}>
            {active.length} remaining
          </span>
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {[1,2,3].map(n => (
              <div key={n} className="h-16 rounded-2xl animate-pulse" style={{ background: '#ede8e3' }} />
            ))}
          </div>
        )}

        {!loading && active.length === 0 && (
          <div
            className="rounded-2xl p-5 text-center"
            style={{ background: '#ffffff', border: '1px solid #ede8e3' }}
          >
            <p className="text-2xl mb-2">🎉</p>
            <p className="text-sm font-semibold" style={{ color: '#1a1410' }}>All done for today!</p>
            <p className="text-xs mt-1" style={{ color: '#a89d96' }}>Add tasks using the bar above.</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {active.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => toggle(item)}
              className="flex items-center gap-4 rounded-2xl px-4 py-4 text-left w-full transition-all active:scale-98"
              style={{ background: '#ffffff', border: '1px solid #ede8e3' }}
            >
              {/* Timeline dot */}
              <div className="relative flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: '#e87648' }}
                />
                {idx < active.length - 1 && (
                  <div className="absolute top-6 w-0.5 h-full" style={{ background: '#ede8e3' }} />
                )}
              </div>
              <span className="flex-1 text-sm font-medium" style={{ color: '#1a1410' }}>
                {item.title}
              </span>
            </button>
          ))}

          {done.length > 0 && (
            <div className="mt-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: '#a89d96' }}>
                Completed
              </p>
              {done.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggle(item)}
                  className="flex items-center gap-4 rounded-2xl px-4 py-3 text-left w-full mb-2"
                  style={{ background: '#faf7f4', border: '1px solid #ede8e3' }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: '#e87648' }}
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="flex-1 text-sm line-through" style={{ color: '#a89d96' }}>
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
