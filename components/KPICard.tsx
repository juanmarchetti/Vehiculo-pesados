import type { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: number | string;
  unit?: string;
  subtitle?: string;
  subtitleColor?: string;
  icon: ReactNode;
  iconBg?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
}

export default function KPICard({
  title,
  value,
  unit,
  subtitle,
  subtitleColor = 'var(--on-surface-variant)',
  icon,
  iconBg = 'var(--surface-container)',
  trend,
  trendLabel,
}: KPICardProps) {
  return (
    <div className="kpi-card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Icon */}
      <div style={{
        position: 'absolute', top: '1rem', right: '1rem',
        width: 44, height: 44,
        background: iconBg,
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: 0.85,
      }}>
        {icon}
      </div>

      {/* Title */}
      <div className="label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>
        {title}
      </div>

      {/* Value */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.375rem' }}>
        <span className="kpi-display" style={{ color: 'var(--on-surface)', lineHeight: 1 }}>{value}</span>
        {unit && (
          <span className="technical-data" style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 600 }}>
            {unit}
          </span>
        )}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {trend && (
            <span style={{
              width: 7, height: 7, borderRadius: '50%',
              background: trend === 'up' ? 'var(--status-active-dot)'
                : trend === 'down' ? '#ef4444'
                : '#f59e0b',
              flexShrink: 0,
            }} />
          )}
          <span style={{ fontSize: '0.8rem', color: subtitleColor, fontWeight: 500 }}>
            {subtitle}
          </span>
        </div>
      )}

      {trendLabel && (
        <div className="label-caps" style={{ color: subtitleColor, marginTop: '0.125rem', fontSize: '0.65rem' }}>
          {trendLabel}
        </div>
      )}
    </div>
  );
}
