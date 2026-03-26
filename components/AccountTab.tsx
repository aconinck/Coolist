'use client'

import { useState } from 'react'

type Member = {
  id: string
  name: string
  role: string
  avatar: string
  canViewBills: boolean
  canEditCalendar: boolean
  canEditLists: boolean
}

const INITIAL_MEMBERS: Member[] = [
  { id: '1', name: 'Arthur', role: 'Admin', avatar: 'A', canViewBills: true, canEditCalendar: true, canEditLists: true },
  { id: '2', name: 'Spouse', role: 'Member', avatar: 'S', canViewBills: true, canEditCalendar: true, canEditLists: true },
]

type SettingRow = { label: string; value: string; icon: string }
const SETTINGS: SettingRow[] = [
  { icon: '🔔', label: 'Notifications', value: 'On' },
  { icon: '🌙', label: 'Appearance', value: 'Warm Light' },
  { icon: '🔒', label: 'Privacy & Security', value: '' },
  { icon: '❓', label: 'Help & Feedback', value: '' },
]

export default function AccountTab() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS)
  const [editingMember, setEditingMember] = useState<string | null>(null)

  const togglePermission = (id: string, key: keyof Pick<Member, 'canViewBills' | 'canEditCalendar' | 'canEditLists'>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, [key]: !m[key] } : m))
  }

  return (
    <div className="flex flex-col gap-6 pb-4">
      {/* Profile card */}
      <div
        className="rounded-3xl p-5 flex items-center gap-4"
        style={{ background: '#ffffff', border: '1px solid #ede8e3' }}
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shrink-0"
          style={{ background: '#e87648', color: '#ffffff' }}
        >
          A
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-black" style={{ color: '#1a1410', letterSpacing: '-0.03em' }}>
            Arthur
          </p>
          <p className="text-sm" style={{ color: '#a89d96' }}>arthurconinck@gmail.com</p>
          <span
            className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1"
            style={{ background: '#fdf0e8', color: '#e87648' }}
          >
            Admin
          </span>
        </div>
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: '#faf7f4', border: '1px solid #ede8e3' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 2L12 4.5l-7.5 7.5H2V9.5L9.5 2z" stroke="#a89d96" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Family section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-base font-bold" style={{ color: '#1a1410', letterSpacing: '-0.02em' }}>
            Family
          </p>
          <button
            className="text-xs font-bold px-3 py-1.5 rounded-xl"
            style={{ background: '#fdf0e8', color: '#e87648' }}
          >
            + Invite
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {members.map(member => (
            <div key={member.id}
              className="rounded-2xl overflow-hidden"
              style={{ border: '1px solid #ede8e3' }}
            >
              {/* Member row */}
              <button
                onClick={() => setEditingMember(editingMember === member.id ? null : member.id)}
                className="flex items-center gap-3 w-full px-4 py-3"
                style={{ background: '#ffffff' }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                  style={{ background: member.role === 'Admin' ? '#e87648' : '#5b8dee', color: '#ffffff' }}
                >
                  {member.avatar}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold" style={{ color: '#1a1410' }}>{member.name}</p>
                  <p className="text-xs" style={{ color: '#a89d96' }}>{member.role}</p>
                </div>
                <svg
                  width="12" height="7" viewBox="0 0 12 7" fill="none"
                  style={{ transform: editingMember === member.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                >
                  <path d="M1 1l5 5 5-5" stroke="#a89d96" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              {/* Permissions panel */}
              {editingMember === member.id && (
                <div className="px-4 py-3 flex flex-col gap-3" style={{ background: '#faf7f4', borderTop: '1px solid #ede8e3' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#a89d96' }}>Permissions</p>
                  {([
                    { key: 'canViewBills', label: 'View Bills' },
                    { key: 'canEditCalendar', label: 'Edit Calendar' },
                    { key: 'canEditLists', label: 'Edit Lists' },
                  ] as const).map(perm => (
                    <div key={perm.key} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: '#6b6059' }}>{perm.label}</span>
                      <button
                        onClick={() => togglePermission(member.id, perm.key)}
                        disabled={member.role === 'Admin'}
                        className="relative w-10 h-6 rounded-full transition-all disabled:opacity-50"
                        style={{ background: member[perm.key] ? '#e87648' : '#d4cdc8' }}
                      >
                        <div
                          className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                          style={{ left: member[perm.key] ? 22 : 4 }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div>
        <p className="text-base font-bold mb-3" style={{ color: '#1a1410', letterSpacing: '-0.02em' }}>Settings</p>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid #ede8e3' }}
        >
          {SETTINGS.map((s, i) => (
            <button
              key={s.label}
              className="flex items-center gap-4 w-full px-4 py-3.5 text-left"
              style={{
                background: '#ffffff',
                borderTop: i > 0 ? '1px solid #f5f0eb' : 'none',
              }}
            >
              <span className="text-lg w-6 text-center">{s.icon}</span>
              <span className="flex-1 text-sm font-medium" style={{ color: '#1a1410' }}>{s.label}</span>
              <div className="flex items-center gap-2">
                {s.value && <span className="text-xs" style={{ color: '#a89d96' }}>{s.value}</span>}
                <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                  <path d="M1 1l4 4-4 4" stroke="#d4cdc8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sign out */}
      <button
        className="w-full rounded-2xl py-4 text-sm font-bold"
        style={{ background: '#fef0f0', color: '#e05c5c' }}
      >
        Sign Out
      </button>
    </div>
  )
}
