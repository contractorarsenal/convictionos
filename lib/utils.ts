import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Trade, ReportData } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPct(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

export function formatUSD(value: number | null): string {
  if (value === null) return '—'
  const sign = value >= 0 ? '+' : ''
  return `${sign}$${Math.abs(value).toFixed(2)}`
}

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export function calcConvictionScore(trades: Trade[]): number {
  if (trades.length === 0) return 0

  // Discipline: did they follow their conviction? High conviction wins score high
  const disciplineScore = trades.reduce((acc, t) => {
    if (t.conviction_level >= 4 && t.result_pct > 0) return acc + 25
    if (t.conviction_level <= 2 && t.result_pct > 0) return acc + 10
    if (t.conviction_level >= 4 && t.result_pct < 0) return acc + 5
    if (t.conviction_level <= 2 && t.result_pct < 0) return acc + 15
    return acc + 12
  }, 0) / trades.length

  // Emotional control: calm and confident = good
  const emotionScore = trades.reduce((acc, t) => {
    if (t.emotional_state === 'calm' || t.emotional_state === 'confident') return acc + 25
    if (t.emotional_state === 'fomo' || t.emotional_state === 'revenge') return acc + 0
    if (t.emotional_state === 'greedy') return acc + 5
    return acc + 12
  }, 0) / trades.length

  // Exit quality
  const exitScore = trades.reduce((acc, t) => {
    if (t.exit_reason === 'target_hit' || t.exit_reason === 'stop_hit') return acc + 25
    if (t.exit_reason === 'panic' || t.exit_reason === 'late') return acc + 0
    if (t.exit_reason === 'early') return acc + 10
    return acc + 12
  }, 0) / trades.length

  // Win rate contribution
  const wins = trades.filter(t => t.result_pct > 0).length
  const winRate = (wins / trades.length) * 25

  const total = disciplineScore + emotionScore + exitScore + winRate
  return Math.min(100, Math.round(total))
}

export function getScoreColor(score: number): string {
  if (score >= 75) return '#00FF94'
  if (score >= 50) return '#FFD600'
  if (score >= 25) return '#FF8C00'
  return '#FF3B5C'
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'ELITE'
  if (score >= 65) return 'SHARP'
  if (score >= 50) return 'DEVELOPING'
  if (score >= 35) return 'INCONSISTENT'
  return 'RESET NEEDED'
}
