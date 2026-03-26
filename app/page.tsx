'use client'

import { useState } from 'react'
import MagicInput from '@/components/MagicInput'
import HomeTab from '@/components/HomeTab'
import ListsTab from '@/components/ListsTab'
import CalendarTab from '@/components/CalendarTab'
import BillsTab from '@/components/BillsTab'
import AccountTab from '@/components/AccountTab'

type Tab = 'home' | 'lists' | 'calendar' | 'bills' | 'account'

const TABS: { id: Tab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  {
    id: 'home',
    label: 'Home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"
          stroke={active ? '#e87648' : '#a89d96'} strokeWidth="1.6"
          fill={active ? '#fdf0e8' : 'none'} strokeLinejoin="round"/>
        <path d="M8 20v-7h6v7" stroke={active ? '#e87648' : '#a89d96'} strokeWidth="1.6" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: 'lists',
    label: 'Lists',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="3" width="16" height="16" rx="4"
          fill={active ? '#fdf0e8' : 'none'}
          stroke={active ? '#e87648' : '#a89d96'} strokeWidth="1.6"/>
        <path d="M7 8h8M7 12h5M7 16h6" stroke={active ? '#e87648' : '#a89d96'} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="3" y="4" width="16" height="15" rx="3"
          fill={active ? '#fdf0e8' : 'none'}
          stroke={active ? '#e87648' : '#a89d96'} strokeWidth="1.6"/>
        <path d="M3 9h16M8 3v3M14 3v3" stroke={active ? '#e87648' : '#a89d96'} strokeWidth="1.6" strokeLinecap="round"/>
        <circle cx="11" cy="13.5" r="1" fill={active ? '#e87648' : '#a89d96'}/>
      </svg>
    ),
  },
  {
    id: 'bills',
    label: 'Bills',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="6" width="18" height="12" rx="3"
          fill={active ? '#fdf0e8' : 'none'}
          stroke={active ? '#e87648' : '#a89d96'} strokeWidth="1.6"/>
        <path d="M2 10h18" stroke={active ? '#e87648' : '#a89d96'} strokeWidth="1.6"/>
        <circle cx="6.5" cy="14.5" r="1" fill={active ? '#e87648' : '#a89d96'}/>
      </svg>
    ),
  },
  {
    id: 'account',
    label: 'Account',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="4"
          fill={active ? '#fdf0e8' : 'none'}
          stroke={active ? '#e87648' : '#a89d96'} strokeWidth="1.6"/>
        <path d="M3 19c0-3.314 3.582-6 8-6s8 2.686 8 6"
          stroke={active ? '#e87648' : '#a89d96'} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
]

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSuccess = () => setRefreshKey(k => k + 1)

  // Show magic input on all tabs except account
  const showInput = activeTab !== 'account'

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#f5f0eb' }}>

      {/* ── Magic Input (sticky, shown on most tabs) ────────── */}
      {showInput && (
        <div
          className="sticky top-0 z-20 px-4 pt-4 pb-3"
          style={{
            background: 'rgba(245,240,235,0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          <MagicInput onSuccess={handleSuccess} />
        </div>
      )}

      {/* ── Tab content ─────────────────────────────────────── */}
      <main className="flex-1 px-4 pt-4 pb-28 max-w-lg mx-auto w-full">
        {activeTab === 'home'     && <HomeTab />}
        {activeTab === 'lists'    && <ListsTab refreshKey={refreshKey} />}
        {activeTab === 'calendar' && <CalendarTab refreshKey={refreshKey} />}
        {activeTab === 'bills'    && <BillsTab />}
        {activeTab === 'account'  && <AccountTab />}
      </main>

      {/* ── Bottom Tab Bar ───────────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 flex items-end pb-safe"
        style={{
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderTop: '1px solid rgba(0,0,0,0.05)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {TABS.map(tab => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
            >
              {tab.icon(active)}
              <span
                className="text-[10px] font-semibold transition-colors"
                style={{ color: active ? '#e87648' : '#a89d96' }}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
