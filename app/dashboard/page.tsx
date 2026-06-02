import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calcConvictionScore, formatPct, formatUSD, getWeekStart, getScoreColor } from '@/lib/utils'
import { Trade } from '@/lib/types'
import Nav from '@/components/Nav'
import ConvictionRing from '@/components/ConvictionRing'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Plus, ChevronRight } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile && !profile.trader_style) redirect('/onboard')

  // Get this week's trades
  const weekStart = getWeekStart()
  const { data: weekTrades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .gte('trade_date', weekStart)
    .order('created_at', { ascending: false })

  // Get all trades for stats
  const { data: allTrades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Get latest report
  const { data: latestReport } = await supabase
    .from('weekly_reports')
    .select('*')
    .eq('user_id', user.id)
    .order('week_start', { ascending: false })
    .limit(1)
    .single()

  const trades: Trade[] = weekTrades || []
  const recentTrades: Trade[] = (allTrades || []).slice(0, 8)
  const convictionScore = calcConvictionScore(trades)

  const wins = trades.filter(t => t.result_pct > 0).length
  const losses = trades.filter(t => t.result_pct <= 0).length
  const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0
  const totalPnl = trades.reduce((acc, t) => acc + (t.pnl_usd || 0), 0)
  const avgConviction = trades.length > 0
    ? (trades.reduce((acc, t) => acc + t.conviction_level, 0) / trades.length).toFixed(1)
    : '—'

  // Emotion breakdown
  const emotionMap: Record<string, number> = {}
  trades.forEach(t => {
    emotionMap[t.emotional_state] = (emotionMap[t.emotional_state] || 0) + 1
  })
  const topEmotion = Object.entries(emotionMap).sort((a, b) => b[1] - a[1])[0]

  // Setup breakdown
  const setupMap: Record<string, { count: number; wins: number }> = {}
  trades.forEach(t => {
    const key = t.setup_tag || 'untagged'
    if (!setupMap[key]) setupMap[key] = { count: 0, wins: 0 }
    setupMap[key].count++
    if (t.result_pct > 0) setupMap[key].wins++
  })

  const needsReport = trades.length >= 7 && !latestReport?.week_start?.startsWith(weekStart)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 40px' }}>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '32px',
        }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontFamily: 'Space Mono, monospace', marginBottom: '6px' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <h1 className="font-display" style={{ fontSize: '40px', color: 'var(--text)', lineHeight: 1.1 }}>
              WEEK OVERVIEW
            </h1>
          </div>
          <Link href="/log">
            <button className="btn btn-primary" style={{ gap: '8px' }}>
              <Plus size={16} />
              Log Trade
            </button>
          </Link>
        </div>

        {/* Report CTA */}
        {needsReport && (
          <Link href="/report" style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'rgba(0,255,148,0.06)',
              border: '1px solid var(--accent-border)',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '20px' }}>📊</div>
                <div>
                  <div style={{ color: 'var(--green)', fontWeight: '600', fontSize: '14px' }}>
                    Weekly report ready
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                    You have {trades.length} trades logged. Generate your Conviction Report.
                  </div>
                </div>
              </div>
              <ChevronRight size={18} color="var(--green)" />
            </div>
          </Link>
        )}

        {/* Top stats row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: '20px',
          marginBottom: '20px',
        }}>
          {/* Conviction Score */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'Space Mono, monospace', marginBottom: '8px', letterSpacing: '0.1em' }}>
              THIS WEEK'S SCORE
            </div>
            {trades.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>—</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Log trades to generate score</div>
              </div>
            ) : (
              <ConvictionRing score={convictionScore} size={160} />
            )}
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '12px' }}>
            {[
              { label: 'WIN RATE', value: trades.length ? `${winRate}%` : '—', sub: `${wins}W / ${losses}L`, color: winRate >= 50 ? 'var(--green)' : 'var(--red)' },
              { label: 'TOTAL PNL', value: totalPnl !== 0 ? formatUSD(totalPnl) : '—', sub: `${trades.length} trades this week`, color: totalPnl >= 0 ? 'var(--green)' : 'var(--red)' },
              { label: 'AVG CONVICTION', value: avgConviction, sub: 'out of 5', color: 'var(--text)' },
              { label: 'TOP EMOTION', value: topEmotion ? topEmotion[0].toUpperCase() : '—', sub: topEmotion ? `${topEmotion[1]} trades` : 'no data yet', color: topEmotion?.[0] === 'calm' || topEmotion?.[0] === 'confident' ? 'var(--green)' : topEmotion?.[0] === 'fomo' || topEmotion?.[0] === 'revenge' ? 'var(--red)' : 'var(--yellow)' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '20px',
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontFamily: 'Space Mono, monospace', marginBottom: '8px', letterSpacing: '0.1em' }}>
                  {stat.label}
                </div>
                <div className="font-display" style={{ fontSize: '32px', color: stat.color, lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent trades */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ color: 'var(--text)', fontWeight: '600', fontSize: '14px' }}>Recent Trades</div>
            <Link href="/log" style={{ textDecoration: 'none' }}>
              <button className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 10px' }}>
                <Plus size={12} /> Log Trade
              </button>
            </Link>
          </div>

          {recentTrades.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>📭</div>
              <div style={{ color: 'var(--text-dim)', fontSize: '14px', marginBottom: '16px' }}>No trades yet. Log your first trade.</div>
              <Link href="/log">
                <button className="btn btn-primary">Log Your First Trade</button>
              </Link>
            </div>
          ) : (
            <div>
              {recentTrades.map((trade, i) => {
                const isWin = trade.result_pct > 0
                return (
                  <div
                    key={trade.id}
                    style={{
                      padding: '14px 24px',
                      borderBottom: i < recentTrades.length - 1 ? '1px solid var(--border)' : 'none',
                      display: 'grid',
                      gridTemplateColumns: '100px 80px 1fr 100px 100px 120px',
                      alignItems: 'center',
                      gap: '16px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Ticker */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: isWin ? 'var(--green)' : 'var(--red)',
                        flexShrink: 0,
                      }} />
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>
                        {trade.ticker}
                      </span>
                    </div>

                    {/* Direction */}
                    <span style={{
                      fontSize: '11px',
                      fontFamily: 'Space Mono, monospace',
                      color: trade.direction === 'long' ? 'var(--green)' : 'var(--red)',
                      background: trade.direction === 'long' ? 'rgba(0,255,148,0.08)' : 'rgba(255,59,92,0.08)',
                      border: `1px solid ${trade.direction === 'long' ? 'rgba(0,255,148,0.2)' : 'rgba(255,59,92,0.2)'}`,
                      borderRadius: '4px',
                      padding: '2px 8px',
                      width: 'fit-content',
                    }}>
                      {trade.direction.toUpperCase()}
                    </span>

                    {/* Result */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {isWin ? <TrendingUp size={14} color="var(--green)" /> : <TrendingDown size={14} color="var(--red)" />}
                      <span className="font-mono" style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: isWin ? 'var(--green)' : 'var(--red)',
                      }}>
                        {formatPct(trade.result_pct)}
                      </span>
                      {trade.pnl_usd !== null && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                          ({formatUSD(trade.pnl_usd)})
                        </span>
                      )}
                    </div>

                    {/* Conviction */}
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {[1,2,3,4,5].map(n => (
                        <div key={n} style={{
                          width: '8px', height: '8px', borderRadius: '2px',
                          background: n <= trade.conviction_level ? getScoreColor(trade.conviction_level * 20) : 'rgba(255,255,255,0.08)',
                        }} />
                      ))}
                    </div>

                    {/* Emotion */}
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', textTransform: 'capitalize' }}>
                      {trade.emotional_state}
                    </span>

                    {/* Date */}
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'right' }}>
                      {new Date(trade.trade_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
