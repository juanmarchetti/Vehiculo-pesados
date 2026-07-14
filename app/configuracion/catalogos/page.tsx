'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { Edit2, PlusCircle, Loader2 } from 'lucide-react';

export default function CatalogosPage() {
  const [tab, setTab] = useState<'preventivo' | 'averia'>('preventivo');
  const [tiposMantenimiento, setTiposMantenimiento] = useState<any[]>([]);
  const [tiposAveria, setTiposAveria] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/catalogos')
      .then(res => res.json())
      .then(data => {
        setTiposMantenimiento(Array.isArray(data.tiposMantenimiento) ? data.tiposMantenimiento : []);
        setTiposAveria(Array.isArray(data.tiposAveria) ? data.tiposAveria : []);
        setLoading(false);
      });
  }, []);

  return (
    <AppLayout breadcrumb={[{ label: 'Configuración' }, { label: 'Catálogos' }]}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
            Catálogos del Sistema
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
            Administración de tipos de mantenimiento y tipos de avería.
          </p>
        </div>
        <button className="btn btn-primary">
          <PlusCircle size={16} />
          Nuevo Tipo
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--surface-container-high)', marginBottom: '1rem' }}>
        {[
          { key: 'preventivo', label: 'Tipos de Mantenimiento Preventivo' },
          { key: 'averia', label: 'Tipos de Avería' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            style={{
              padding: '0.625rem 1.25rem', background: 'none', border: 'none',
              borderBottom: tab === t.key ? '3px solid var(--primary-container)' : '3px solid transparent',
              color: tab === t.key ? 'var(--primary-container)' : 'var(--on-surface-variant)',
              fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
              marginBottom: -2, transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tipos de Mantenimiento */}
      {tab === 'preventivo' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Periodicidad (km)</th>
                <th>Periodicidad (días)</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto', color: 'var(--primary-container)' }} />
                  </td>
                </tr>
              ) : tiposMantenimiento.length > 0 ? (
                tiposMantenimiento.map(t => (
                  <tr key={t.id}>
                    <td><span className="technical-data" style={{ color: 'var(--primary-container)', fontWeight: 700 }}>{t.codigo}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{t.nombre}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', maxWidth: 250 }}>
                      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {t.descripcion}
                      </span>
                    </td>
                    <td><span className="technical-data" style={{ fontWeight: 600 }}>c/ {t.periodicidad_km?.toLocaleString()} km</span></td>
                    <td><span className="technical-data" style={{ fontWeight: 600 }}>c/ {t.periodicidad_dias} días</span></td>
                    <td>
                      <span className={`badge ${t.estado === 'activo' ? 'badge-activo' : 'badge-cancelado'}`}>
                        <span className="badge-dot" />
                        {t.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost" style={{ padding: '0.375rem' }} title="Editar">
                        <Edit2 size={15} color="var(--tertiary)" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
                    No hay tipos de mantenimiento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tipos de Avería */}
      {tab === 'averia' && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nombre</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto', color: 'var(--primary-container)' }} />
                  </td>
                </tr>
              ) : tiposAveria.length > 0 ? (
                tiposAveria.map(a => (
                  <tr key={a.id}>
                    <td><span className="technical-data" style={{ color: 'var(--primary-container)', fontWeight: 700 }}>{a.codigo}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{a.nombre}</td>
                    <td>
                      <button className="btn btn-ghost" style={{ padding: '0.375rem' }} title="Editar">
                        <Edit2 size={15} color="var(--tertiary)" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
                    No hay tipos de avería.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}
