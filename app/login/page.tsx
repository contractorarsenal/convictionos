'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setSent(true)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
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
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,255,148,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,148,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Glow orb */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '300px',
        background: 'radial-gradient(ellipse, rgba(0,255,148,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%',
        maxWidth: '400px',
        position: 'relative',
        animation: 'fadeUp 0.5s ease forwards',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--green)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ color: '#080A0E', fontSize: '16px', fontWeight: '800' }}>C</span>
            </div>
            <span className="font-display" style={{ fontSize: '28px', color: 'var(--text)', letterSpacing: '0.1em' }}>
              CONVICTIONOS
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'Space Mono, monospace' }}>
            trading performance system
          </p>
        </div>

        {sent ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--accent-border)',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>📬</div>
            <div style={{ color: 'var(--green)', fontWeight: '600', marginBottom: '8px' }}>Check your email</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
              We sent a confirmation link to <strong style={{ color: 'var(--text)' }}>{email}</strong>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px',
          }}>
            <h1 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '24px',
            }}>
              {isSignup ? 'Create account' : 'Welcome back'}
            </h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '6px', fontFamily: 'Space Mono, monospace' }}>
                  EMAIL
                </label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--text-dim)', fontSize: '12px', marginBottom: '6px', fontFamily: 'Space Mono, monospace' }}>
                  PASSWORD
                </label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
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
                style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '4px' }}
              >
                {loading ? 'Loading...' : isSignup ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div style={{
              marginTop: '20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '13px',
            }}>
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => { setIsSignup(!isSignup); setError('') }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--green)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '500',
                }}
              >
                {isSignup ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
