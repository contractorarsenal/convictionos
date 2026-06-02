export type TraderStyle = 'scalper' | 'swing' | 'degen' | 'momentum'
export type EmotionalState = 'calm' | 'fomo' | 'revenge' | 'confident' | 'uncertain' | 'greedy'
export type ExitReason = 'target_hit' | 'stop_hit' | 'panic' | 'early' | 'late' | 'held_too_long'
export type Direction = 'long' | 'short'

export interface User {
  id: string
  email: string
  username: string | null
  trader_style: TraderStyle | null
  whop_user_id: string | null
  created_at: string
}

export interface Trade {
  id: string
  user_id: string
  ticker: string
  direction: Direction
  entry_price: number | null
  exit_price: number | null
  result_pct: number
  pnl_usd: number | null
  conviction_level: number // 1-5
  emotional_state: EmotionalState
  setup_tag: string | null
  exit_reason: ExitReason
  notes: string | null
  trade_date: string
  created_at: string
}

export interface WeeklyReport {
  id: string
  user_id: string
  week_start: string
  conviction_score: number // 0-100
  top_pattern: string
  bottom_pattern: string
  trade_count: number
  win_rate: number
  avg_conviction: number
  report_json: ReportData
  created_at: string
}

export interface ReportData {
  summary: string
  strengths: string[]
  weaknesses: string[]
  recommendation: string
  score_breakdown: {
    discipline: number
    consistency: number
    risk_management: number
    emotional_control: number
  }
}

export interface TradeFormData {
  ticker: string
  direction: Direction
  result_pct: number
  pnl_usd: number | null
  conviction_level: number
  emotional_state: EmotionalState
  setup_tag: string
  exit_reason: ExitReason
  notes: string
  trade_date: string
}
