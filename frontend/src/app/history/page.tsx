'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plane, MapPin, Calendar, ArrowRight, Trash2,
  Loader2, Clock, Users, Wallet, Plus, History
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface TripSummary {
  id: string
  title: string
  destination: string
  origin: string
  start_date: string
  end_date: string
  status: string
  created_at: string
  group_size: number
  budget_usd: number
}

function statusColor(status: string) {
  if (status === 'ongoing')   return { bg: 'rgba(45,212,160,0.12)',  text: '#2dd4a0',  label: 'Ongoing' }
  if (status === 'completed') return { bg: 'rgba(74,127,212,0.12)',  text: '#7aa8e8',  label: 'Completed' }
  return                             { bg: 'rgba(201,168,76,0.12)', text: '#e4c76b',  label: 'Planned' }
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysBetween(start: string, end: string) {
  if (!start || !end) return null
  const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
  return Math.round(diff)
}

export default function HistoryPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [trips, setTrips] = useState<TripSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.replace('/')
  }, [user, authLoading, router])

  useEffect(() => {
    if (!user) return
    fetchHistory()
  }, [user])

  async function fetchHistory() {
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/trips/history/${user!.uid}`)
      if (res.ok) {
        const data = await res.json()
        setTrips(data)
      }
    } catch (e) {
      console.error('Failed to load history:', e)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(tripId: string) {
    setDeleting(tripId)
    try {
      await fetch(`${API}/api/trips/${tripId}?user_id=${user!.uid}`, { method: 'DELETE' })
      setTrips(prev => prev.filter(t => t.id !== tripId))
    } catch (e) {
      console.error('Delete failed:', e)
    } finally {
      setDeleting(null)
      setConfirmDelete(null)
    }
  }

  async function openTrip(trip: TripSummary) {
    try {
      const res = await fetch(`${API}/api/trips/${trip.id}`)
      if (!res.ok) throw new Error('Not found')
      const full = await res.json()
      // Load into sessionStorage then navigate
      if (full.viability_report)  sessionStorage.setItem('tripwise_viability', JSON.stringify(full.viability_report))
      if (full.itinerary)         sessionStorage.setItem('tripwise_itinerary', JSON.stringify(full.itinerary))
      sessionStorage.setItem('tripwise_tripdata', JSON.stringify({
        origin:      full.origin,
        destination: full.destination,
        start_date:  full.start_date,
        end_date:    full.end_date,
        group_size:  full.group_size,
        budget_usd:  full.budget_usd,
      }))
      sessionStorage.setItem('tripwise_trip_id', full.id)
      router.push(`/trip/${full.id}`)
    } catch {
      alert('Could not load this trip. It may have been deleted.')
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--gold)' }} />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div className="glass rounded-2xl p-6 max-w-sm w-full text-center">
            <Trash2 className="w-10 h-10 mx-auto mb-4" style={{ color: '#f43f5e' }} />
            <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Delete this trip?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              This will permanently remove the trip and all its data. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={!!deleting}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)', color: '#fb7185' }}>
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="sticky top-0 z-40" style={{ background: 'rgba(6,9,18,0.92)', backdropFilter: 'blur(24px)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#1c2642,#0f1628)', border: '1px solid rgba(201,168,76,0.35)' }}>
              <Plane className="w-4 h-4" style={{ color: 'var(--gold)' }} />
            </div>
            <span className="font-display font-bold gradient-text">TripWise</span>
          </button>
          <button onClick={() => router.push('/plan')}
            className="btn-primary flex items-center gap-2 text-sm py-2.5 px-4">
            <Plus className="w-4 h-4" />New trip
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <History className="w-6 h-6" style={{ color: 'var(--gold)' }} />
            <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              My Trips
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            {user?.displayName}&apos;s travel history · {trips.length} {trips.length === 1 ? 'trip' : 'trips'} planned
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--gold)' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading your trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="glass rounded-2xl p-16 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
              <Plane className="w-7 h-7" style={{ color: 'var(--gold)' }} />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              No trips yet
            </h2>
            <p className="mb-8" style={{ color: 'var(--text-secondary)' }}>
              Plan your first trip and it will appear here.
            </p>
            <button className="btn-primary flex items-center gap-2 mx-auto"
              onClick={() => router.push('/plan')}>
              <Plus className="w-4 h-4" />Plan your first trip
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map(trip => {
              const st = statusColor(trip.status)
              const nights = daysBetween(trip.start_date, trip.end_date)
              return (
                <div key={trip.id}
                  className="glass feature-card rounded-2xl p-5 transition-all"
                  style={{ cursor: 'pointer' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0" onClick={() => openTrip(trip)}>
                      {/* Status + route */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="badge" style={{ background: st.bg, color: st.text }}>
                          {st.label}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(trip.created_at)}
                        </span>
                      </div>

                      <h3 className="font-display text-xl font-bold mb-1 gradient-text truncate">
                        {trip.origin} → {trip.destination}
                      </h3>

                      {/* Meta row */}
                      <div className="flex items-center gap-4 flex-wrap mt-2">
                        {trip.start_date && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {formatDate(trip.start_date)}
                              {trip.end_date && ` – ${formatDate(trip.end_date)}`}
                            </span>
                          </div>
                        )}
                        {nights !== null && (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {nights} {nights === 1 ? 'night' : 'nights'}
                            </span>
                          </div>
                        )}
                        {trip.group_size > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {trip.group_size} {trip.group_size === 1 ? 'person' : 'people'}
                            </span>
                          </div>
                        )}
                        {trip.budget_usd > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              ${trip.budget_usd.toLocaleString()}/person
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => openTrip(trip)}
                        className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all font-medium"
                        style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.25)', color: 'var(--gold-light)' }}>
                        Open <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setConfirmDelete(trip.id)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.18)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(244,63,94,0.08)')}>
                        <Trash2 className="w-3.5 h-3.5" style={{ color: '#fb7185' }} />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* New trip CTA at bottom */}
        {trips.length > 0 && (
          <div className="mt-8 text-center">
            <button className="btn-primary flex items-center gap-2 mx-auto"
              onClick={() => router.push('/plan')}>
              <Plus className="w-4 h-4" />Plan another trip
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
