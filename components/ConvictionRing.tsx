'use client'

import { getScoreColor, getScoreLabel } from '@/lib/utils'

interface ConvictionRingProps {
  score: number
  size?: number
  showLabel?: boolean
}

export default function ConvictionRing({ score, size = 160, showLabel = true }: ConvictionRingProps) {
  const radius = (size / 2) - 16
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference
  const color = getScoreColor(score)
  const label = getScoreLabel(score)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          width={size}
          height={size}
          style={{ transform: 'rotate(-90deg)' }}
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="8"
          />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            style={{
              filter: `drop-shadow(0 0 8px ${color})`,
              transition: 'stroke-dashoffset 1s ease',
            }}
          />
        </svg>

        {/* Center content */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div className="font-display" style={{
            fontSize: size > 120 ? '48px' : '32px',
            color,
            lineHeight: 1,
            textShadow: `0 0 20px ${color}80`,
          }}>
            {score}
          </div>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            fontFamily: 'Space Mono, monospace',
            marginTop: '2px',
          }}>
            /100
          </div>
        </div>
      </div>

      {showLabel && (
        <div style={{
          background: `${color}15`,
          border: `1px solid ${color}30`,
          borderRadius: '100px',
          padding: '4px 14px',
          color,
          fontSize: '11px',
          fontFamily: 'Space Mono, monospace',
          fontWeight: '700',
          letterSpacing: '0.1em',
        }}>
          {label}
        </div>
      )}
    </div>
  )
}
