'use client'

import { useState } from 'react'

type Bill = {
  id: string
  provider: string
  amount: number
  due_date: string
  status: 'upcoming' | 'overdue' | 'paid'
  category: string
}

type Card = {
  id: string
  label: string
  last4: string
  holder: string
  type: 'visa' | 'mastercard' | 'insurance' | 'health'
  color: string
}

// Mock data — will be replaced when DB tables are added
const MOCK_BILLS: Bill[] = [
  { id: '1', provider: 'T-Mobile', amount: 89, due_date: '2026-03-28', status: 'upcoming', category: 'Phone' },
  { id: '2', provider: 'Electricity', amount: 145, due_date: '2026-03-25', status: 'overdue', category: 'Utilities' },
  { id: '3', provider: 'Netflix', amount: 22, due_date: '2026-04-01', status: 'upcoming', category: 'Streaming' },
  { id: '4', provider: 'Gym Membership', amount: 55, due_date: '2026-03-15', status: 'paid', category: 'Health' },
  { id: '5', provider: 'Internet', amount: 79, due_date: '2026-04-05', status: 'upcoming', category: 'Utilities' },
]

const MOCK_CARDS: Card[] = [
  { id: '1', label: 'Chase Sapphire', last4: '4821', holder: 'Arthur Coninck', type: 'visa', color: '#1a3a5c' },
  { id: '2', label: 'Auto Insurance', last4: '', holder: 'VW Atlas · Policy #4472881', type: 'insurance', color: '#2d5a3d' },
  { id: '3', label: 'Health Insurance', last4: '', holder: 'BlueCross · Member ID 88012', type: 'health', color: '#5b3a8c' },
]

const STATUS_STYLE = {
  upcoming: { bg: '#fdf0e8', color: '#e87648', label: 'Due soon' },
  overdue:  { bg: '#fef0f0', color: '#e05c5c', label: 'Overdue' },
  paid:     { bg: '#f0faf4', color: '#4caf7d', label: 'Paid' },
}

export default function BillsTab() {
  const [tab, setTab] = useState<'bills' | 'wallet'>('bills')
  const [bills, setBills] = useState<Bill[]>(MOCK_BILLS)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  const upcoming = bills.filter(b => b.status === 'upcoming')
  const overdue  = bills.filter(b => b.status === 'overdue')
  const paid     = bills.filter(b => b.status === 'paid')

  const markPaid = (id: string) => {
    setBills(prev => prev.map(b => b.id === id ? { ...b, status: 'paid' } : b))
  }

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* Segmented control */}
      <div
        className="flex rounded-2xl p-1"
        style={{ background: 'rgba(116,116,128,0.08)' }}
      >
        {(['bills', 'wallet'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all"
            style={tab === t
              ? { background: '#ffffff', color: '#1a1410', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }
              : { color: '#a89d96' }
            }
          >
            {t === 'bills' ? '💳 Bills' : '🪪 Wallet'}
          </button>
        ))}
      </div>

      {/* ── BILLS TAB ── */}
      {tab === 'bills' && (
        <div className="flex flex-col gap-5">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Overdue', count: overdue.length, color: '#e05c5c', bg: '#fef0f0' },
              { label: 'Upcoming', count: upcoming.length, color: '#e87648', bg: '#fdf0e8' },
              { label: 'Paid', count: paid.length, color: '#4caf7d', bg: '#f0faf4' },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-3 text-center" style={{ background: s.bg }}>
                <p className="text-2xl font-black" style={{ color: s.color, letterSpacing: '-0.04em' }}>{s.count}</p>
                <p className="text-[10px] font-semibold" style={{ color: s.color }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Bill sections */}
          {[
            { title: 'Overdue', items: overdue },
            { title: 'Upcoming', items: upcoming },
            { title: 'Paid', items: paid },
          ].map(section => section.items.length > 0 && (
            <div key={section.title}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#a89d96' }}>
                {section.title}
              </p>
              <div className="flex flex-col gap-2">
                {section.items.map(bill => {
                  const s = STATUS_STYLE[bill.status]
                  return (
                    <div
                      key={bill.id}
                      className="flex items-center gap-4 rounded-2xl px-4 py-3"
                      style={{ background: '#ffffff', border: '1px solid #ede8e3' }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base"
                        style={{ background: s.bg }}
                      >
                        {bill.category === 'Phone' ? '📱' :
                         bill.category === 'Utilities' ? '⚡' :
                         bill.category === 'Streaming' ? '📺' :
                         bill.category === 'Health' ? '💪' : '💳'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: '#1a1410' }}>{bill.provider}</p>
                        <p className="text-xs mt-0.5" style={{ color: '#a89d96' }}>
                          {new Date(bill.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-sm font-black" style={{ color: '#1a1410', letterSpacing: '-0.02em' }}>
                          ${bill.amount}
                        </p>
                        {bill.status !== 'paid' && (
                          <button
                            onClick={() => markPaid(bill.id)}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ background: s.bg, color: s.color }}
                          >
                            Mark paid
                          </button>
                        )}
                        {bill.status === 'paid' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
                            ✓ Paid
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Add bill button */}
          <button
            className="w-full rounded-2xl py-4 text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: '#ffffff', border: '2px dashed #ede8e3', color: '#a89d96' }}
          >
            <span>+</span> Add bill
          </button>
        </div>
      )}

      {/* ── WALLET TAB ── */}
      {tab === 'wallet' && (
        <div className="flex flex-col gap-4">
          <p className="text-xs" style={{ color: '#a89d96' }}>
            Store cards for family reference. Tap to expand.
          </p>
          {MOCK_CARDS.map(card => {
            const expanded = expandedCard === card.id
            return (
              <button
                key={card.id}
                onClick={() => setExpandedCard(expanded ? null : card.id)}
                className="w-full text-left transition-all"
                style={{ outline: 'none' }}
              >
                {/* Card face */}
                <div
                  className="rounded-3xl p-5 w-full"
                  style={{
                    background: card.color,
                    minHeight: expanded ? 160 : 100,
                    transition: 'min-height 0.3s ease',
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        {card.type === 'visa' ? 'VISA' : card.type === 'mastercard' ? 'MC' : card.type === 'insurance' ? 'INSURANCE' : 'HEALTH'}
                      </p>
                      <p className="text-base font-bold mt-0.5" style={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
                        {card.label}
                      </p>
                    </div>
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.2)' }}
                    />
                  </div>

                  {card.last4 ? (
                    <p className="text-sm font-mono tracking-widest" style={{ color: 'rgba(255,255,255,0.8)' }}>
                      •••• •••• •••• {card.last4}
                    </p>
                  ) : null}

                  {expanded && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                      <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>
                        CARDHOLDER / MEMBER
                      </p>
                      <p className="text-sm font-bold mt-1" style={{ color: '#ffffff' }}>
                        {card.holder}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            )
          })}

          {/* Add card */}
          <button
            className="w-full rounded-3xl py-5 text-sm font-bold flex items-center justify-center gap-2"
            style={{ background: '#ffffff', border: '2px dashed #ede8e3', color: '#a89d96' }}
          >
            <span>+</span> Add card
          </button>
        </div>
      )}
    </div>
  )
}
