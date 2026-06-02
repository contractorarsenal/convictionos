'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Nav from '@/components/Nav'
import ConvictionRing from '@/components/ConvictionRing'
import { ReportData } from '@/lib/types'
import { getWeekStart, getScoreColor } from '@/lib/utils'
import { Sparkles, TrendingUp, TrendingDown, Target, RefreshCw } from 'lucide-react'

interface ReportState {
  convictionScore: number
  reportData: ReportData
  tradeCount: number
  winRate: number
  weekStart: string
}

export default function ReportPage() {
  const [report, setReport] = useState<ReportState | null>(null)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [tradeCount, setTradeCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    loadExistingReport()
    getTradeCount()
  }, [])

  async function getTradeCount() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const weekStart = getWeekStart()
    const { count } = await supabase
      .from('trades')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('trade_date', weekStart)
    setTradeCount(count || 0)
  }

  async function loadExistingReport() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const weekStart = getWeekStart()
    const { data } = await supabase
      .from('weekly_reports')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start', weekStart)
      .single()

    if (data) {
      setReport({
        convictionScore: data.conviction_score,
        reportData: data.report_json as ReportData,
        tradeCount: data.trade_count,
        winRate: data.win_rate,
        weekStart: data.week_start,
      })
    }
  }

  async function generateReport() {
    setGenerating(true)
    setError('')
    try {
      const res = await fetch('/api/report', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setReport({
        convictionScore: data.convictionScore,
        reportData: data.reportData,
        tradeCount: tradeCount,
        winRate: 0,
        weekStart: getWeekStart(),
      })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const weekLabel = (() => {
    const d = new Date(getWeekStart())
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
  })()

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Nav />
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '80px 24px 60px' }}>

        <div style={{ marginBottom: '32px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Space Mono, monospace', marginBottom: '8px' }}>
            WEEK OF {weekLabel.toUpperCase()}
          </div>
          <h1 className="font-display" style={{ fontSize: '44px', lineHeight: 1 }}>
            CONVICTION<br /><span style={{ color: 'var(--green)' }}>REPORT</span>
          </h1>
        </div>

        {!report ? (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
          }}>
            {tradeCount < 3 ? (
              <>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>📊</div>
                <div style={{ color: 'var(--text)', fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
                  {tradeCount} / 3 trades logged
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                  Log at least 3 trades this week to generate your report.
                </div>
                <div style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: '8px',
                  height: '8px',
                  overflow: 'hidden',
                  maxWidth: '200px',
                  margin: '0 auto',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(tradeCount / 3) * 100}%`,
                    background: 'var(--green)',
                    borderRadius: '8px',
                    transition: 'width 0.5s ease',
                  }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>✨</div>
                <div style={{ color: 'var(--text)', fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
                  {tradeCount} trades ready for analysis
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                  Claude will analyze your patterns, emotions, and habits to generate your Conviction Report.
                </div>
                {error && (
                  <div style={{
                    background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.2)',
                    borderRadius: '8px', padding: '10px 14px', color: 'var(--red)', fontSize: '13px',
                    marginBottom: '16px',
                  }}>
                    {error}
                  </div>
                )}
                <button
                  className="btn btn-primary"
                  onClick={generateReport}
                  disabled={generating}
                  style={{ padding: '12px 28px', fontSize: '15px' }}
                >
                  <Sparkles size={16} />
                  {generating ? 'Analyzing your trades...' : 'Generate Report'}
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Score + summary */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '32px',
              display: 'grid',
              gridTemplateColumns: '200px 1fr',
              gap: '32px',
              alignItems: 'center',
            }}>
              <ConvictionRing score={report.convictionScore} size={180} />
              <div>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Space Mono, monospace', marginBottom: '12px' }}>
                  WEEKLY ASSESSMENT
                </div>
                <p style={{ color: 'var(--text)', fontSize: '15px', lineHeight: 1.7, marginBottom: '16px' }}>
                  {report.reportData.summary}
                </p>
                <button
                  onClick={generateReport}
                  disabled={generating}
                  className="btn btn-ghost"
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                >
                  <RefreshCw size={12} />
                  Regenerate
                </button>
              </div>
            </div>

            {/* Score breakdown */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontFamily: 'Space Mono, monospace', marginBottom: '16px' }}>
                SCORE BREAKDOWN
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(report.reportData.score_breakdown).map(([key, val]) => (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-dim)', fontSize: '13px', textTransform: 'capitalize' }}>
                        {key.replace('_', ' ')}
                      </span>
                      <span className="font-mono" style={{ color: getScoreColor(val), fontSize: '13px', fontWeight: '700' }}>
                        {val}
                      </span>
                    </div>
                    <div style={{ background: 'var(--bg-elevated)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${val}%`,
                        background: getScoreColor(val),
                        borderRadius: '4px',
                        boxShadow: `0 0 8px ${getScoreColor(val)}60`,
                        transition: 'width 0.8s ease',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths + Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(0,255,148,0.1)',
                borderRadius: '16px',
                padding: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <TrendingUp size={16} color="var(--green)" />
                  <span style={{ color: 'var(--green)', fontSize: '12px', fontFamily: 'Space Mono, monospace' }}>WHAT'S WORKING</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {report.reportData.strengths.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,255,148,0.1)', border: '1px solid rgba(0,255,148,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                        <span style={{ color: 'var(--green)', fontSize: '10px', fontWeight: '700' }}>{i+1}</span>
                      </div>
                      <span style={{ color: 'var(--text)', fontSize: '13px', lineHeight: 1.5 }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid rgba(255,59,92,0.1)',
                borderRadius: '16px',
                padding: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <TrendingDown size={16} color="var(--red)" />
                  <span style={{ color: 'var(--red)', fontSize: '12px', fontFamily: 'Space Mono, monospace' }}>WHAT TO STOP</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {report.reportData.weaknesses.map((w, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,59,92,0.1)', border: '1px solid rgba(255,59,92,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                        <span style={{ color: 'var(--red)', fontSize: '10px', fontWeight: '700' }}>{i+1}</span>
                      </div>
                      <span style={{ color: 'var(--text)', fontSize: '13px', lineHeight: 1.5 }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Next week focus */}
            <div style={{
              background: 'rgba(0,255,148,0.04)',
              border: '1px solid var(--accent-border)',
              borderRadius: '16px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Target size={16} color="var(--green)" />
                <span style={{ color: 'var(--green)', fontSize: '12px', fontFamily: 'Space Mono, monospace' }}>FOCUS FOR NEXT WEEK</span>
              </div>
              <p style={{ color: 'var(--text)', fontSize: '15px', lineHeight: 1.6 }}>
                {report.reportData.recommendation}
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
