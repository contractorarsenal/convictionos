'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { TraderStyle } from '@/lib/types'

const STYLES: { value: TraderStyle; label: string; desc: string; emoji: string }[] = [
  { value: 'degen', label: 'Degen', desc: 'Full send. High risk, high reward. Memecoins, new launches.', emoji: '🎰' },
  { value: 'scalper', label: 'Scalper', desc: 'In and out fast. Multiple trades per day, tight stops.', emoji: '⚡' },
  { value: 'momentum', label: 'Momentum', desc: 'Ride the wave. Enter breakouts, follow volume.', emoji: '🌊' },
  { value: 'swing', label: 'Swing', desc: 'Bigger moves over hours or days. Patient entries.', emoji: '📐' },
]

export default function OnboardPage() {
  const [selected, setSelected] = useState<TraderStyle | null>(null)
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit() {
    if (!selected || !username.trim()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    await supabase.from('users').update({
      username: username.trim().toLowerCase(),
      trader_style: selected,
    }).eq('id', user.id)

    router.push('/dashboard')
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '540px' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent-border)',
            borderRadius: '100px',
            padding: '4px 12px',
            marginBottom: '16px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)' }} />
            <span style={{ color: 'var(--green)', fontSize: '12px', fontFamily: 'Space Mono, monospace' }}>
              STEP 1 OF 1
            </span>
          </div>
          <h1 className="font-display" style={{ fontSize: '48px', color: 'var(--text)', lineHeight: 1.1, marginBottom: '12px' }}>
            BUILD YOUR<br />
            <span style={{ color: 'var(--green)' }}>PROFILE</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            This helps ConvictionOS personalize your insights. Be honest.
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '8px', fontFamily: 'Space Mono, monospace' }}>
            YOUR USERNAME
          </label>
          <input
            className="input"
            placeholder="e.g. solkiller"
            value={username}
            onChange={e => setUsername(e.target.value)}
            maxLength={30}
          />
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '12px', fontFamily: 'Space Mono, monospace' }}>
            YOUR TRADING STYLE
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {STYLES.map(s => (
              <button
                key={s.value}
                onClick={() => setSelected(s.value)}
                style={{
                  background: selected === s.value ? 'rgba(0,255,148,0.08)' : 'var(--bg-card)',
                  border: `1px solid ${selected === s.value ? 'var(--accent-border)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  padding: '16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '8px' }}>{s.emoji}</div>
                <div style={{
                  color: selected === s.value ? 'var(--green)' : 'var(--text)',
                  fontWeight: '600',
                  fontSize: '15px',
                  marginBottom: '4px',
                }}>
                  {s.label}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', lineHeight: 1.4 }}>
                  {s.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!selected || !username.trim() || loading}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            opacity: (!selected || !username.trim()) ? 0.5 : 1,
          }}
        >
          {loading ? 'Setting up...' : 'Enter ConvictionOS →'}
        </button>
      </div>
    </div>
  )
}
