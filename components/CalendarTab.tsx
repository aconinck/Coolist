'use client'

import { useEffect, useState } from 'react'
import { getEvents, deleteEvent, type EventItem } from '@/lib/db'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function getDiff(dateStr: string) {
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(dateStr + 'T12:00:00'); target.setHours(0,0,0,0)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

function formatRelative(dateStr: string) {
  const diff = getDiff(dateStr)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 0 && diff < 7) return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' })
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function CalendarTab({ refreshKey }: { refreshKey?: number }) {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

  const today = new Date()
  const year = selectedDate.getFullYear()
  const month = selectedDate.getMonth()

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  useEffect(() => {
    getEvents().then(e => { setEvents(e); setLoading(false) })
  }, [refreshKey])

  const remove = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    await deleteEvent(id)
  }

  const prevMonth = () => setSelectedDate(new Date(year, month - 1, 1))
  const nextMonth = () => setSelectedDate(new Date(year, month + 1, 1))

  // Get events for a specific day
  const eventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return events.filter(e => e.event_date === dateStr)
  }

  const upcoming = events.filter(e => getDiff(e.event_date) >= 0).slice(0, 8)
  const past = events.filter(e => getDiff(e.event_date) < 0).slice(0, 3)

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Month header */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: '#ffffff', border: '1px solid #ede8e3' }}
        >
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M6 1L1 6l5 5" stroke="#1a1410" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="text-center">
          <p className="text-base font-bold" style={{ color: '#1a1410', letterSpacing: '-0.02em' }}>
            {MONTHS[month]}
          </p>
          <p className="text-xs" style={{ color: '#a89d96' }}>{year}</p>
        </div>
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: '#ffffff', border: '1px solid #ede8e3' }}
        >
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
            <path d="M1 1l5 5-5 5" stroke="#1a1410" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Day name headers */}
      <div className="grid grid-cols-7 text-center">
        {DAYS.map(d => (
          <div key={d} className="text-[10px] font-semibold uppercase py-1" style={{ color: '#a89d96' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          const dayEvents = eventsForDay(day)
          const hasEvent = dayEvents.length > 0

          return (
            <div
              key={day}
              className="aspect-square flex flex-col items-center justify-center rounded-xl relative"
              style={{
                background: isToday ? '#e87648' : hasEvent ? '#fdf0e8' : 'transparent',
              }}
            >
              <span
                className="text-sm font-semibold"
                style={{ color: isToday ? '#ffffff' : '#1a1410' }}
              >
                {day}
              </span>
              {hasEvent && !isToday && (
                <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: '#e87648' }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Upcoming events list */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#a89d96' }}>
          Upcoming
        </p>

        {loading && (
          <div className="flex flex-col gap-3">
            {[1,2].map(n => (
              <div key={n} className="flex gap-3">
                <div className="w-12 h-14 rounded-xl animate-pulse shrink-0" style={{ background: '#ede8e3' }} />
                <div className="flex-1 flex flex-col gap-2 justify-center">
                  <div className="h-3.5 rounded-full animate-pulse" style={{ background: '#ede8e3', width: '55%' }} />
                  <div className="h-2.5 rounded-full animate-pulse" style={{ background: '#ede8e3', width: '30%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && upcoming.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: '#a89d96' }}>
            No upcoming events — add one above!
          </p>
        )}

        <div className="flex flex-col gap-2">
          {upcoming.map(event => {
            const diff = getDiff(event.event_date)
            const urgent = diff <= 2
            const d = new Date(event.event_date + 'T12:00:00')
            return (
              <div
                key={event.id}
                className="flex items-center gap-4 rounded-2xl px-4 py-3 group"
                style={{ background: '#ffffff', border: '1px solid #ede8e3' }}
              >
                <div
                  className="shrink-0 w-12 rounded-xl flex flex-col items-center py-2"
                  style={{ background: urgent ? '#e87648' : '#fdf0e8' }}
                >
                  <span className="text-[9px] font-bold uppercase" style={{ color: urgent ? 'rgba(255,255,255,0.7)' : '#e87648' }}>
                    {d.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-xl font-black leading-tight" style={{ color: urgent ? '#ffffff' : '#e87648', letterSpacing: '-0.03em' }}>
                    {d.getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#1a1410' }}>{event.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: urgent ? '#e87648' : '#a89d96', fontWeight: urgent ? 600 : 400 }}>
                    {formatRelative(event.event_date)}
                  </p>
                </div>
                <button
                  onClick={() => remove(event.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-xs shrink-0"
                  style={{ color: '#a89d96' }}
                >✕</button>
              </div>
            )
          })}
        </div>

        {past.length > 0 && (
          <div className="mt-4">
            <div className="h-px mb-4" style={{ background: '#f0ebe6' }} />
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#a89d96' }}>Past</p>
            {[...past].reverse().map(event => (
              <div key={event.id} className="flex items-center gap-3 group py-1.5">
                <span className="text-xs w-16 shrink-0" style={{ color: '#d4cdc8' }}>
                  {formatRelative(event.event_date)}
                </span>
                <span className="flex-1 text-xs line-through truncate" style={{ color: '#d4cdc8' }}>
                  {event.title}
                </span>
                <button onClick={() => remove(event.id)} className="opacity-0 group-hover:opacity-100 text-xs" style={{ color: '#a89d96' }}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
