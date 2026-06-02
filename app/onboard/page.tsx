'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function OnboardPage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single()

      if (profile?.username) {
        router.push('/dashboard')
      } else {
        setChecking(false)
      }
    }
    checkProfile()
  }, [])

  async function handleSubmit() {
    if (!username.trim()) return
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    await supabase.from('users').update({
      username: username.trim().toLowerCase(),
    }).eq('id', user.id)

    router.push('/dashboard')
  }

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace', fontSize: '13px' }}>
          Loading...
        </div>
      </div>
    )
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
      <div style={{ width: '100%', maxWidth: '480px' }}>
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
              ONE TIME SETUP
            </span>
          </div>
          <h1 className="font-display" style={{ fontSize: '48px', color: 'var(--text)', lineHeight: 1.1, marginBottom: '12px' }}>
            SET YOUR<br />
            <span style={{ color: 'var(--green)' }}>USERNAME</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            This is the only thing we need. You&apos;re ready to start logging.
          </p>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '8px', fontFamily: 'Space Mono, monospace' }}>
            YOUR USERNAME
          </label>
          <input
            className="input"
            placeholder="e.g. solkiller"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            maxLength={30}
            autoFocus
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={!username.trim() || loading}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '16px',
            opacity: !username.trim() ? 0.5 : 1,
          }}
        >
          {loading ? 'Setting up...' : 'Enter ConvictionOS →'}
        </button>
      </div>
    </div>
  )
}
