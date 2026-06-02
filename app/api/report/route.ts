import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'
import { calcConvictionScore, getWeekStart } from '@/lib/utils'
import { Trade, ReportData } from '@/lib/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Get this week's trades
  const weekStart = getWeekStart()
  const { data: trades, error: tradesError } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', user.id)
    .gte('trade_date', weekStart)
    .order('trade_date', { ascending: true })

  if (tradesError) return NextResponse.json({ error: tradesError.message }, { status: 500 })
  if (!trades || trades.length < 3) {
    return NextResponse.json({ error: 'Need at least 3 trades to generate a report' }, { status: 400 })
  }

  const convictionScore = calcConvictionScore(trades as Trade[])
  const wins = trades.filter(t => t.result_pct > 0)
  const losses = trades.filter(t => t.result_pct <= 0)
  const winRate = Math.round((wins.length / trades.length) * 100)
  const avgConviction = (trades.reduce((a, t) => a + t.conviction_level, 0) / trades.length).toFixed(1)
  const totalPnl = trades.reduce((a, t) => a + (t.pnl_usd || 0), 0)

  // Build trade summary for Claude
  const tradeSummary = trades.map(t => ({
    ticker: t.ticker,
    direction: t.direction,
    result_pct: t.result_pct,
    pnl_usd: t.pnl_usd,
    conviction: t.conviction_level,
    emotion: t.emotional_state,
    setup: t.setup_tag,
    exit: t.exit_reason,
    notes: t.notes,
    date: t.trade_date,
  }))

  const prompt = `You are ConvictionOS, a trading performance coach. Analyze this trader's week and give direct, actionable feedback.

TRADER DATA:
- Total trades: ${trades.length}
- Wins: ${wins.length} | Losses: ${losses.length} | Win rate: ${winRate}%
- Avg conviction: ${avgConviction}/5
- Total PnL: $${totalPnl.toFixed(2)}
- Conviction Score: ${convictionScore}/100

INDIVIDUAL TRADES:
${JSON.stringify(tradeSummary, null, 2)}

Respond ONLY with a valid JSON object (no markdown, no explanation, just JSON) with this exact structure:
{
  "summary": "2-3 sentence direct assessment of this trader's week. Be blunt, not mean. Specific to their actual data.",
  "strengths": ["strength 1 based on actual patterns", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1 based on actual patterns", "weakness 2", "weakness 3"],
  "recommendation": "One specific, actionable thing to focus on next week. Not generic. Based on their actual behavior.",
  "score_breakdown": {
    "discipline": <0-100 score for following their conviction level>,
    "consistency": <0-100 score for consistent execution>,
    "risk_management": <0-100 score for stop discipline and exit quality>,
    "emotional_control": <0-100 score based on emotional states logged>
  }
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const reportData: ReportData = JSON.parse(text.replace(/```json|```/g, '').trim())

    // Upsert into weekly_reports
    const { data: report, error: reportError } = await supabase
      .from('weekly_reports')
      .upsert({
        user_id: user.id,
        week_start: weekStart,
        conviction_score: convictionScore,
        top_pattern: reportData.strengths[0] || 'Strong week',
        bottom_pattern: reportData.weaknesses[0] || 'Room to improve',
        trade_count: trades.length,
        win_rate: winRate,
        avg_conviction: parseFloat(avgConviction),
        report_json: reportData,
      }, { onConflict: 'user_id,week_start' })
      .select()
      .single()

    if (reportError) return NextResponse.json({ error: reportError.message }, { status: 500 })

    return NextResponse.json({ report, reportData, convictionScore })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate report' }, { status: 500 })
  }
}
