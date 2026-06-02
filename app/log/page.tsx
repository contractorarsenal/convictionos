'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Nav from '@/components/Nav'
import { TradeFormData, EmotionalState, ExitReason, Direction } from '@/lib/types'
import { CheckCircle2 } from 'lucide-react'

const EMOTIONS: { value: EmotionalState; label: string; emoji: string; color: string }[] = [
  { value: 'calm', label: 'Calm', emoji: '😌', color: 'var(--green)' },
  { value: 'confident', label: 'Confident', emoji: '💪', color: 'var(--green)' },
  { value: 'uncertain', label: 'Uncertain', emoji: '🤔', color: 'var(--yellow)' },
  { value: 'fomo', label: 'FOMO', emoji: '😰', color: 'var(--red)' },
  { value: 'greedy', label: 'Greedy', emoji: '🤑', color: 'var(--orange)' },
  { value: 'revenge', label: 'Revenge', emoji: '😤', color: 'var(--red)' },
]

const EXIT_REASONS: { value: ExitReason; label: string; desc: string }[] = [
  { value: 'target_hit', label: 'Target Hit', desc: 'Exited at planned target' },
  { value: 'stop_hit', label: 'Stop Hit', desc: 'Hit stop loss as planned' },
  { value: 'early', label: 'Too Early', desc: 'Exited before target' },
  { value: 'late', label: 'Too Late', desc: 'Held past the right exit' },
  { value: 'panic', label: 'Panic Exit', desc: 'Emotional, unplanned exit' },
  { value: 'held_too_long', label: 'Held Too Long', desc: 'Winner turned to loser' },
]

const SETUP_TAGS = ['Breakout', 'Dip Buy', 'Momentum', 'News Play', 'Reversal', 'Scalp', 'New Launch', 'Volume Spike', 'Other']

const defaultForm: TradeFormData = {
  ticker: '',
  direction: 'long',
  result_pct: 0,
  pnl_usd: null,
  conviction_level: 3,
  emotional_state: 'calm',
  setup_tag: '',
  exit_reason: 'target_hit',
  notes: '',
  trade_date: new Date().toISOString().split('T')[0],
}

export default function LogPage() {
  const [form, setForm] = useState<TradeFormData>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  function set<K extends keyof TradeFormData>(key: K, value: TradeFormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.ticker.trim()) { setError('Ticker is required'); return }
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error: insertError } = await supabase.from('trades').insert({
      user_id: user.id,
      ticker: form.ticker.trim().toUpperCase(),
      direction: form.direction,
      result_pct: form.result_pct,
      pnl_usd: form.pnl_usd,
      conviction_level: form.conviction_level,
      emotional_state: form.emotional_state,
      setup_tag: form.setup_tag || null,
      exit_reason: form.exit_reason,
      notes: form.notes || null,
      trade_date: form.trade_date,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <Nav />
        <div style={{
          maxWidth: '480px', margin: '0 auto', padding: '140px 24px 40px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        }}>
          <div style={{ marginBottom: '24px' }}>
            <CheckCircle2 size={48} color="var(--green)" strokeWidth={1.5} />
          </div>
          <h1 className="font-display" style={{ fontSize: '40px', marginBottom: '12px' }}>
            TRADE <span style={{ color: 'var(--green)' }}>LOGGED</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
            {form.ticker} {form.direction} {form.result_pct >= 0 ? '+' : ''}{form.result_pct}% recorded.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => { setForm(defaultForm); setSuccess(false) }}>
              Log Another
            </button>
            <button className="btn btn-secondary" onClick={() => router.push('/dashboard')}>
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px 60px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 className="font-display" style={{ fontSize: '40px', marginBottom: '6px' }}>
            LOG A <span style={{ color: 'var(--green)' }}>TRADE</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'Space Mono, monospace' }}>
            Under 60 seconds. Be honest.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Ticker + Direction + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '6px', fontFamily: 'Space Mono, monospace' }}>TICKER</label>
              <input
                className="input"
                placeholder="e.g. BONK, SOL, WIF"
                value={form.ticker}
                onChange={e => set('ticker', e.target.value)}
                style={{ textTransform: 'uppercase', fontFamily: 'Space Mono, monospace', fontWeight: '700', fontSize: '16px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '6px', fontFamily: 'Space Mono, monospace' }}>DATE</label>
              <input
                className="input"
                type="date"
                value={form.trade_date}
                onChange={e => set('trade_date', e.target.value)}
              />
            </div>
          </div>

          {/* Direction toggle */}
          <div>
            <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '8px', fontFamily: 'Space Mono, monospace' }}>DIRECTION</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['long', 'short'] as Direction[]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set('direction', d)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${form.direction === d
                      ? d === 'long' ? 'rgba(0,255,148,0.4)' : 'rgba(255,59,92,0.4)'
                      : 'var(--border)'}`,
                    background: form.direction === d
                      ? d === 'long' ? 'rgba(0,255,148,0.08)' : 'rgba(255,59,92,0.08)'
                      : 'var(--bg-elevated)',
                    color: form.direction === d
                      ? d === 'long' ? 'var(--green)' : 'var(--red)'
                      : 'var(--text-muted)',
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    letterSpacing: '0.05em',
                  }}
                >
                  {d === 'long' ? '↑ LONG' : '↓ SHORT'}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '6px', fontFamily: 'Space Mono, monospace' }}>
                RESULT (%)
              </label>
              <input
                className="input"
                type="number"
                step="0.01"
                placeholder="e.g. 12.5 or -8.2"
                value={form.result_pct || ''}
                onChange={e => set('result_pct', parseFloat(e.target.value) || 0)}
                style={{
                  fontFamily: 'Space Mono, monospace',
                  fontWeight: '700',
                  color: form.result_pct >= 0 ? 'var(--green)' : 'var(--red)',
                  fontSize: '16px',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '6px', fontFamily: 'Space Mono, monospace' }}>
                PNL ($) <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>optional</span>
              </label>
              <input
                className="input"
                type="number"
                step="0.01"
                placeholder="e.g. 420 or -150"
                value={form.pnl_usd || ''}
                onChange={e => set('pnl_usd', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
          </div>

          {/* Conviction level */}
          <div>
            <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '10px', fontFamily: 'Space Mono, monospace' }}>
              CONVICTION LEVEL <span style={{ color: 'var(--text)', fontFamily: 'Bebas Neue, sans-serif', fontSize: '16px', marginLeft: '8px' }}>{form.conviction_level}/5</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('conviction_level', n)}
                  style={{
                    flex: 1,
                    padding: '12px 0',
                    borderRadius: '8px',
                    border: `1px solid ${form.conviction_level >= n ? 'rgba(0,255,148,0.3)' : 'var(--border)'}`,
                    background: form.conviction_level >= n ? 'rgba(0,255,148,0.1)' : 'var(--bg-elevated)',
                    color: form.conviction_level >= n ? 'var(--green)' : 'var(--text-muted)',
                    fontFamily: 'Bebas Neue, sans-serif',
                    fontSize: '18px',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Unsure</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Max conviction</span>
            </div>
          </div>

          {/* Emotional state */}
          <div>
            <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '10px', fontFamily: 'Space Mono, monospace' }}>
              HOW WERE YOU FEELING?
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {EMOTIONS.map(e => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => set('emotional_state', e.value)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '10px',
                    border: `1px solid ${form.emotional_state === e.value ? e.color + '50' : 'var(--border)'}`,
                    background: form.emotional_state === e.value ? e.color + '12' : 'var(--bg-elevated)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{e.emoji}</span>
                  <span style={{
                    color: form.emotional_state === e.value ? e.color : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: '500',
                  }}>
                    {e.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Exit reason */}
          <div>
            <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '10px', fontFamily: 'Space Mono, monospace' }}>
              WHY DID YOU EXIT?
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {EXIT_REASONS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => set('exit_reason', r.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: `1px solid ${form.exit_reason === r.value ? 'var(--accent-border)' : 'var(--border)'}`,
                    background: form.exit_reason === r.value ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ color: form.exit_reason === r.value ? 'var(--green)' : 'var(--text)', fontSize: '14px', fontWeight: '500' }}>
                    {r.label}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{r.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Setup tag */}
          <div>
            <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '8px', fontFamily: 'Space Mono, monospace' }}>
              SETUP TYPE <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>optional</span>
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {SETUP_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => set('setup_tag', form.setup_tag === tag ? '' : tag)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '100px',
                    border: `1px solid ${form.setup_tag === tag ? 'var(--accent-border)' : 'var(--border)'}`,
                    background: form.setup_tag === tag ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                    color: form.setup_tag === tag ? 'var(--green)' : 'var(--text-muted)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontFamily: 'Space Mono, monospace',
                    transition: 'all 0.15s',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '6px', fontFamily: 'Space Mono, monospace' }}>
              NOTES <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>optional</span>
            </label>
            <textarea
              className="input"
              placeholder="What happened? What did you notice?"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,59,92,0.1)',
              border: '1px solid rgba(255,59,92,0.2)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: 'var(--red)',
              fontSize: '13px',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '16px' }}
          >
            {loading ? 'Saving...' : 'Save Trade'}
          </button>
        </form>
      </div>
    </div>
  )
}
