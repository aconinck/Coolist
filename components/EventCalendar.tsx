'use client'

import { useEffect, useState } from 'react'
import { getEvents, deleteEvent, type EventItem } from '@/lib/db'

function getDiffDays(dateStr: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T12:00:00')
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

function formatRelative(dateStr: string): string {
  const diff = getDiffDays(dateStr)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 0 && diff <= 6) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })
  }
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

type Props = { refreshKey?: number }

export default function EventCalendar({ refreshKey }: Props) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      setEvents(await getEvents())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [refreshKey])

  const remove = async (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
    await deleteEvent(id)
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map((n) => (
          <div key={n} className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-xl animate-pulse shrink-0" style={{ background: '#f5f5f7' }} />
            <div className="flex-1 flex flex-col gap-1.5">
              <div className="h-3.5 rounded-full animate-pulse" style={{ background: '#f5f5f7', width: '60%' }} />
              <div className="h-2.5 rounded-full animate-pulse" style={{ background: '#f5f5f7', width: '30%' }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const upcoming = events.filter((e) => getDiffDays(e.event_date) >= 0)
  const past = events.filter((e) => getDiffDays(e.event_date) < 0)

  return (
    <div className="flex flex-col gap-5">
      {upcoming.length === 0 && past.length === 0 && (
        <p className="text-xs" style={{ color: '#aeaeb2' }}>
          No events yet — add a date above!
        </p>
      )}

      {/* Upcoming */}
      <ul className="flex flex-col gap-2">
        {upcoming.map((event) => {
          const diff = getDiffDays(event.event_date)
          const urgent = diff <= 2
          const day = new Date(event.event_date + 'T12:00:00').getDate()
          const month = new Date(event.event_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })

          return (
            <li key={event.id} className="flex items-start gap-3 group">
              {/* Date badge */}
              <div
                className="shrink-0 w-10 rounded-xl flex flex-col items-center justify-center py-1.5"
                style={
                  urgent
                    ? { background: '#5e5ce6' }
                    : { background: '#f5f5f7' }
                }
              >
                <span
                  className="text-[9px] font-semibold uppercase"
                  style={{ color: urgent ? 'rgba(255,255,255,0.7)' : '#aeaeb2' }}
                >
                  {month}
                </span>
                <span
                  className="text-base font-bold leading-tight"
                  style={{ color: urgent ? '#ffffff' : '#1d1d1f', letterSpacing: '-0.02em' }}
                >
                  {day}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: '#1d1d1f', letterSpacing: '-0.01em' }}
                >
                  {event.title}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: urgent ? '#5e5ce6' : '#aeaeb2', fontWeight: urgent ? 600 : 400 }}
                >
                  {formatRelative(event.event_date)}
                </p>
                {event.notes && (
                  <p className="text-xs mt-1" style={{ color: '#6e6e73' }}>
                    {event.notes}
                  </p>
                )}
              </div>

              <button
                onClick={() => remove(event.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-xs mt-1 shrink-0"
                style={{ color: '#aeaeb2' }}
                aria-label="Delete"
              >
                ✕
              </button>
            </li>
          )
        })}
      </ul>

      {/* Past events */}
      {past.length > 0 && (
        <div>
          <div className="h-px mb-4" style={{ background: '#f2f2f7' }} />
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: '#aeaeb2' }}
          >
            Past
          </p>
          <ul className="flex flex-col gap-1.5">
            {[...past].reverse().map((event) => (
              <li key={event.id} className="flex items-center gap-3 group">
                <span className="text-xs w-14 shrink-0" style={{ color: '#d1d1d6' }}>
                  {formatRelative(event.event_date)}
                </span>
                <span
                  className="flex-1 text-xs line-through truncate"
                  style={{ color: '#d1d1d6' }}
                >
                  {event.title}
                </span>
                <button
                  onClick={() => remove(event.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs shrink-0"
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
