'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Loader2 } from 'lucide-react';

export default function HistorialPage() {
  const [data, setData] = useState<any[]>([]);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filtroVehiculo, setFiltroVehiculo] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');

  useEffect(() => {
    Promise.all([
      fetch('/api/historial').then(res => res.json()),
      fetch('/api/vehiculos').then(res => res.json()),
      fetch('/api/usuarios').then(res => res.json())
    ]).then(([histData, vehData, usuData]) => {
      setData(Array.isArray(histData) ? histData : []);
      setVehiculos(Array.isArray(vehData) ? vehData : []);
      setUsuarios(Array.isArray(usuData) ? usuData : []);
      setLoading(false);
    });
  }, []);

  const filtered = data.filter(h => {
    const vehiculoOk = !filtroVehiculo || h.vehiculo_id === filtroVehiculo;
    const tipoOk = filtroTipo === 'todos' || h.tipo === filtroTipo;
    return vehiculoOk && tipoOk;
  }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const costoTotal = filtered.reduce((s, h) => s + h.costo, 0);

  return (
    <AppLayout breadcrumb={[{ label: 'Historial de Mantenimiento' }]}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
          Historial de Mantenimiento
        </h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
          Línea de tiempo consolidada de todas las intervenciones de la flota.
        </p>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="label-caps" style={{ color: 'var(--on-surface-variant)', whiteSpace: 'nowrap' }}>Vehículo:</span>
          <select className="form-select" value={filtroVehiculo} onChange={e => setFiltroVehiculo(e.target.value)} style={{ width: 200 }}>
            <option value="">Todos los vehículos</option>
            {vehiculos.map(v => <option key={v.id} value={v.id}>{v.placa} — {v.marca} {v.modelo}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="label-caps" style={{ color: 'var(--on-surface-variant)' }}>Tipo:</span>
          {['todos', 'preventivo', 'correctivo'].map(t => (
            <button
              key={t}
              onClick={() => setFiltroTipo(t)}
              style={{
                padding: '0.3rem 0.75rem', borderRadius: 6,
                border: filtroTipo === t ? '2px solid var(--primary-container)' : '1.5px solid var(--surface-container-highest)',
                background: filtroTipo === t ? 'rgba(255,122,26,0.08)' : 'transparent',
                color: filtroTipo === t ? 'var(--primary-container)' : 'var(--on-surface)',
                fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
              }}
            >{t}</button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1.5rem' }}>
          <div>
            <div className="label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: 2 }}>Registros</div>
            <div className="technical-data" style={{ fontWeight: 700 }}>{filtered.length}</div>
          </div>
          <div>
            <div className="label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: 2 }}>Costo Total</div>
            <div className="technical-data" style={{ fontWeight: 700, color: 'var(--status-active-text)' }}>${costoTotal.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card" style={{ padding: '1.5rem', position: 'relative' }}>
        <div style={{ position: 'absolute', left: '2.75rem', top: '3rem', bottom: '1.5rem', width: 2, background: 'var(--surface-container-high)' }} />
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto', color: 'var(--primary-container)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--on-surface-variant)' }}>
            Sin registros de historial para los filtros seleccionados.
          </div>
        ) : (
          filtered.map((h) => (
            <div key={h.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', position: 'relative' }}>
              {/* Date column */}
              <div style={{ width: 48, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: h.tipo === 'preventivo' ? 'var(--status-active-dot)' : '#f59e0b',
                  border: '3px solid var(--surface-container-lowest)',
                  zIndex: 1,
                  flexShrink: 0,
                }} />
                <div style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textAlign: 'center', marginTop: 4, fontFamily: 'IBM Plex Mono, monospace', lineHeight: 1.3 }}>
                  {new Date(h.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                </div>
              </div>

              {/* Content */}
              <div style={{ flex: 1, background: 'var(--surface-container-low)', borderRadius: 10, padding: '0.875rem 1rem', transition: 'box-shadow 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="placa-chip">{h.vehiculo_placa}</span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
                      padding: '0.15rem 0.5rem', borderRadius: 4,
                      background: h.tipo === 'preventivo' ? 'var(--status-active-bg)' : 'var(--status-taller-bg)',
                      color: h.tipo === 'preventivo' ? 'var(--status-active-text)' : 'var(--status-taller-text)',
                    }}>{h.tipo}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span className="technical-data" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{h.km_en_intervencion?.toLocaleString() || 0} KM</span>
                    <span className="technical-data" style={{ fontWeight: 700, color: 'var(--status-active-text)' }}>${(h.costo || 0).toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{h.descripcion}</div>
                {h.tecnico_asignado_id && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                    Técnico: {usuarios.find(u => u.id === h.tecnico_asignado_id)?.nombre_completo || 'Técnico Externo'}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
