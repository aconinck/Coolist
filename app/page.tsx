'use client'

import { useState } from 'react'
import MagicInput from '@/components/MagicInput'
import Checklist from '@/components/Checklist'
import Wishlist from '@/components/Wishlist'
import EventCalendar from '@/components/EventCalendar'

type Tab = 'checklist' | 'wishlist' | 'events'

const TABS: { id: Tab; label: string; count?: number }[] = [
  { id: 'checklist', label: 'List' },
  { id: 'wishlist', label: 'Wishlist' },
  { id: 'events', label: 'Calendar' },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('checklist')
  const [refreshKey, setRefreshKey] = useState(0)
  const [suggestedInput, setSuggestedInput] = useState('')

  const handleSuccess = () => setRefreshKey((k) => k + 1)

  const handleSuggestInput = (text: string) => {
    setSuggestedInput(text)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: '#f5f5f7' }}
    >
      {/* ── Header ─────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 px-6 py-4"
        style={{
          background: 'rgba(245,245,247,0.85)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: '#5e5ce6' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 4h10M2 7h6M2 10h8" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <span
              className="text-base font-semibold tracking-tight"
              style={{ color: '#1d1d1f', letterSpacing: '-0.02em' }}
            >
              Coolist
            </span>
          </div>
          <span
            className="text-xs font-medium hidden sm:block"
            style={{ color: '#aeaeb2' }}
          >
            Family Organizer
          </span>
        </div>
      </header>

      {/* ── Magic Input ─────────────────────────────────────── */}
      <div
        className="px-4 pt-8 pb-6"
        style={{ background: '#f5f5f7' }}
      >
        <div className="max-w-2xl mx-auto">
          <p
            className="text-center text-xs font-medium uppercase tracking-widest mb-4"
            style={{ color: '#aeaeb2' }}
          >
            What&apos;s on your mind?
          </p>
          <MagicInput
            onSuccess={handleSuccess}
            defaultValue={suggestedInput}
            key={suggestedInput}
          />
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────── */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-8">
        {/* Desktop: 3-column grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-4">
          <Module title="Smart Checklist" subtitle="Groceries & tasks">
            <Checklist />
          </Module>
          <Module title="Family Wishlist" subtitle="Wants & dreams">
            <Wishlist onSuggestInput={handleSuggestInput} refreshKey={refreshKey} />
          </Module>
          <Module title="Calendar" subtitle="Upcoming events">
            <EventCalendar refreshKey={refreshKey} />
          </Module>
        </div>

        {/* Mobile: segmented control + single panel */}
        <div className="md:hidden flex flex-col gap-4">
          {/* Segmented control */}
          <div
            className="flex rounded-xl p-1"
            style={{ background: 'rgba(116,116,128,0.12)' }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={
                  activeTab === tab.id
                    ? {
                        background: '#ffffff',
                        color: '#1d1d1f',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                      }
                    : { color: '#6e6e73' }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'checklist' && (
            <Module title="Smart Checklist" subtitle="Groceries & tasks">
              <Checklist />
            </Module>
          )}
          {activeTab === 'wishlist' && (
            <Module title="Family Wishlist" subtitle="Wants & dreams">
              <Wishlist onSuggestInput={handleSuggestInput} refreshKey={refreshKey} />
            </Module>
          )}
          {activeTab === 'events' && (
            <Module title="Calendar" subtitle="Upcoming events">
              <EventCalendar refreshKey={refreshKey} />
            </Module>
          )}
        </div>
      </main>

      {/* Bottom padding on mobile */}
      <div className="h-6 md:hidden" />
    </div>
  )
}

function Module({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <section
      className="rounded-2xl flex flex-col gap-5 p-5"
      style={{
        background: '#ffffff',
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
      }}
    >
      <div>
        <h2
          className="text-sm font-semibold"
          style={{ color: '#1d1d1f', letterSpacing: '-0.01em' }}
        >
          {title}
        </h2>
        <p className="text-xs mt-0.5" style={{ color: '#aeaeb2' }}>
          {subtitle}
        </p>
      </div>
      <div>{children}</div>
    </section>
  )
}
