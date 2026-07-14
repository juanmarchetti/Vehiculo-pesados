'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import AlertItem from '@/components/AlertItem';
import type { Alerta } from '@/lib/types';
import { Loader2, CheckCircle } from 'lucide-react';

const NIVELES = ['todos', 'critico', 'advertencia', 'informativo'];

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroNivel, setFiltroNivel] = useState('todos');

  useEffect(() => {
    fetch('/api/alertas')
      .then(res => res.json())
      .then(data => {
        setAlertas(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const filtered = alertas.filter(
    a => filtroNivel === 'todos' || a.nivel === filtroNivel
  );

  const noLeidas = alertas.filter(a => a.estado === 'no_leida').length;

  const marcarAtendida = async (id: string) => {
    try {
      await fetch('/api/alertas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: 'leida' })
      });
      setAlertas(prev => prev.map(a => a.id === id ? { ...a, estado: 'leida' } : a));
    } catch (e) {
      console.error(e);
    }
  };

  const marcarTodasAtendidas = async () => {
    try {
      await fetch('/api/alertas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'leida' })
      });
      setAlertas(prev => prev.map(a => ({ ...a, estado: 'leida' })));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout breadcrumb={[{ label: 'Alertas y Notificaciones' }]}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 className="headline-lg" style={{ color: 'var(--on-surface)' }}>
              Alertas y Notificaciones
            </h1>
            {noLeidas > 0 && (
              <span style={{
                background: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 700,
                padding: '0.2rem 0.6rem', borderRadius: 20,
              }}>
                {noLeidas} sin leer
              </span>
            )}
          </div>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
            {alertas.length} alertas activas en el sistema.
          </p>
        </div>
        {noLeidas > 0 && (
          <button onClick={marcarTodasAtendidas} className="btn btn-secondary">
            Marcar todas como atendidas
          </button>
        )}
      </div>

      {/* Nivel filter */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1rem' }}>
        {NIVELES.map(n => {
          const color = n === 'critico' ? '#ef4444' : n === 'advertencia' ? '#f59e0b' : n === 'informativo' ? 'var(--tertiary)' : 'var(--primary-container)';
          return (
            <button
              key={n}
              onClick={() => setFiltroNivel(n)}
              style={{
                padding: '0.4rem 0.875rem', borderRadius: 6,
                border: filtroNivel === n ? `2px solid ${color}` : '1.5px solid var(--surface-container-highest)',
                background: filtroNivel === n ? `${color}15` : 'transparent',
                color: filtroNivel === n ? color : 'var(--on-surface)',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                textTransform: 'capitalize', transition: 'all 0.15s',
              }}
            >
              {n === 'todos' ? 'Todos' : n.charAt(0).toUpperCase() + n.slice(1)}
              <span style={{ marginLeft: '0.375rem', fontFamily: 'IBM Plex Mono, monospace', fontSize: '0.7rem' }}>
                ({alertas.filter(a => n === 'todos' || a.nivel === n).length})
              </span>
            </button>
          );
        })}
      </div>

      {/* Alerts list */}
      <div className="card" style={{ padding: '1.25rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto', color: 'var(--primary-container)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-surface-variant)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={32} color="var(--primary-container)" opacity={0.5} />
            <span>Sin alertas para el nivel seleccionado.</span>
          </div>
        ) : (
          filtered.map(a => {
            // Adapt the a object to match the static mock shape where `vehiculo_placa` is at root
            const adapted = {
              ...a,
              vehiculo_placa: a.vehiculo?.placa || a.vehiculo_placa,
              estado: a.estado === 'leida' ? 'atendida' : a.estado // Map schema 'leida' to component 'atendida'
            };
            return (
            <div key={a.id} style={{ position: 'relative' }}>
              <AlertItem alerta={adapted} />
              {adapted.estado === 'no_leida' && (
                <button
                  onClick={() => marcarAtendida(a.id)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: '0.7rem', color: 'var(--tertiary)', background: 'none', border: 'none',
                    cursor: 'pointer', fontWeight: 600, letterSpacing: '0.04em',
                  }}
                >
                  Marcar atendida
                </button>
              )}
            </div>
          )})
        )}
      </div>
    </AppLayout>
  );
}
