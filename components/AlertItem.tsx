import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { Alerta } from '@/lib/types';

interface AlertItemProps {
  alerta: Alerta;
  compact?: boolean;
}

function getIcon(nivel: string) {
  if (nivel === 'critico') return <AlertTriangle size={18} color="#ef4444" fill="#fee2e2" />;
  if (nivel === 'advertencia') return <AlertCircle size={18} color="#f59e0b" fill="#fef3c7" />;
  return <Info size={18} color="#2b638c" fill="#dbeafe" />;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

export default function AlertItem({ alerta, compact = false }: AlertItemProps) {
  return (
    <div
      className={`alert-${alerta.nivel}`}
      style={{
        display: 'flex',
        gap: '0.75rem',
        padding: compact ? '0.75rem 1rem' : '1rem 1.25rem',
        background: alerta.estado === 'atendida' ? 'var(--surface-container-low)' : 'var(--surface-container-lowest)',
        opacity: alerta.estado === 'atendida' ? 0.6 : 1,
        marginBottom: '0.5rem',
        borderRadius: 8,
      }}
    >
      <div style={{ flexShrink: 0, marginTop: 1 }}>{getIcon(alerta.nivel)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {alerta.vehiculo_placa && (
          <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 500, marginBottom: '0.125rem' }}>
            Unidad: {alerta.vehiculo_placa} | {formatTime(alerta.fecha_generacion)}
          </div>
        )}
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)', lineHeight: 1.4 }}>
          {alerta.mensaje}
        </div>
        {!compact && (
          <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem' }}>
            {formatDate(alerta.fecha_generacion)} · {alerta.tipo_alerta.replace(/_/g, ' ')}
          </div>
        )}
      </div>
    </div>
  );
}
