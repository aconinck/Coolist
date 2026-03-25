import { supabase } from './supabase'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ChecklistItem = {
  id: string
  title: string
  is_done: boolean
  created_at: string
}

export type WishlistItem = {
  id: string
  title: string
  url: string | null
  priority: 'low' | 'medium' | 'high'
  family_member: string | null
  created_at: string
}

export type EventItem = {
  id: string
  title: string
  event_date: string
  notes: string | null
  created_at: string
}

// ─── Checklist ────────────────────────────────────────────────────────────────

export async function getChecklistItems(): Promise<ChecklistItem[]> {
  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createChecklistItem(title: string): Promise<ChecklistItem> {
  const { data, error } = await supabase
    .from('checklist_items')
    .insert({ title })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleChecklistItem(id: string, is_done: boolean): Promise<void> {
  const { error } = await supabase
    .from('checklist_items')
    .update({ is_done })
    .eq('id', id)
  if (error) throw error
}

export async function deleteChecklistItem(id: string): Promise<void> {
  const { error } = await supabase.from('checklist_items').delete().eq('id', id)
  if (error) throw error
}

// ─── Wishlist ─────────────────────────────────────────────────────────────────

export async function getWishlistItems(): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createWishlistItem(
  title: string,
  priority: 'low' | 'medium' | 'high' = 'medium',
  family_member: string | null = null,
  url: string | null = null
): Promise<WishlistItem> {
  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({ title, priority, family_member, url })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteWishlistItem(id: string): Promise<void> {
  const { error } = await supabase.from('wishlist_items').delete().eq('id', id)
  if (error) throw error
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function getEvents(): Promise<EventItem[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: true })
  if (error) throw error
  return data
}

export async function createEvent(
  title: string,
  event_date: string,
  notes: string | null = null
): Promise<EventItem> {
  const { data, error } = await supabase
    .from('events')
    .insert({ title, event_date, notes })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id)
  if (error) throw error
}
