'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import type { Vehiculo } from '@/lib/types';
import { Eye, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const ESTADOS: { key: string; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'activo', label: 'Activo' },
  { key: 'en_mantenimiento', label: 'Taller' },
  { key: 'fuera_de_servicio', label: 'Crítico' },
];

const TIPOS = ['Todos los tipos', 'Camión de Carga Pesada', 'Cisterna Combustible', 'Tracto Camión V8', 'Transporte Especial', 'Distribución Urbana', 'Tractocamión', 'Camión de Volteo', 'Carga General'];

const PER_PAGE = 6;

export default function FlotaPage() {
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  const [tipoFiltro, setTipoFiltro] = useState('Todos los tipos');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch('/api/vehiculos')
      .then(res => res.json())
      .then(data => {
        setVehiculos(data);
        setLoading(false);
      });
  }, []);

  const filtered = vehiculos.filter(v => {
    const estadoOk = estadoFiltro === 'todos' || v.estado === estadoFiltro || (estadoFiltro === 'en_mantenimiento' && v.estado === 'en_mantenimiento') || (estadoFiltro === 'fuera_de_servicio' && v.estado === 'fuera_de_servicio');
    const tipoOk = tipoFiltro === 'Todos los tipos' || v.tipo_vehiculo === tipoFiltro;
    return estadoOk && tipoOk;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <AppLayout breadcrumb={[{ label: 'Flota', href: '/flota' }, { label: 'Listado General' }]}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
            Listado de Vehículos
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
            Supervisión en tiempo real de {vehiculos.length} unidades operativas.
          </p>
        </div>
        <Link href="/flota/nuevo" className="btn btn-primary" style={{ marginTop: 4 }}>
          <PlusCircle size={16} />
          Registrar Vehículo
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="label-caps" style={{ color: 'var(--on-surface-variant)' }}>Filtrar por estado:</span>
            <div style={{ display: 'flex', gap: '0.375rem' }}>
              {ESTADOS.map(e => (
                <button
                  key={e.key}
                  onClick={() => { setEstadoFiltro(e.key); setPage(1); }}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: 6,
                    border: estadoFiltro === e.key ? '2px solid var(--primary-container)' : '1.5px solid var(--surface-container-highest)',
                    background: estadoFiltro === e.key ? 'rgba(255,122,26,0.08)' : 'transparent',
                    color: estadoFiltro === e.key ? 'var(--primary-container)' : 'var(--on-surface)',
                    fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="label-caps" style={{ color: 'var(--on-surface-variant)' }}>Tipo:</span>
            <select
              className="form-select"
              value={tipoFiltro}
              onChange={e => { setTipoFiltro(e.target.value); setPage(1); }}
              style={{ width: 180 }}
            >
              {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
              Mostrando <strong>{paged.length}</strong> de <strong>{filtered.length}</strong> resultados
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Marca / Modelo</th>
              <th>Kilometraje</th>
              <th>Estado</th>
              <th>Últ. Mantenimiento</th>
              <th>Próx. Mantenimiento</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paged.map(v => (
              <tr key={v.id}>
                <td>
                  <span className="placa-chip">{v.placa}</span>
                </td>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{v.marca} {v.modelo}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{v.tipo_vehiculo}</div>
                </td>
                <td>
                  <span className="technical-data" style={{ color: v.estado === 'fuera_de_servicio' ? '#ef4444' : 'var(--on-surface)', fontWeight: 600 }}>
                    {v.kilometraje.toLocaleString()} KM
                  </span>
                </td>
                <td>
                  <StatusBadge estado={v.estado} />
                </td>
                <td style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
                  {v.ultimo_mantenimiento
                    ? new Date(v.ultimo_mantenimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—'}
                </td>
                <td>
                  {v.proximo_mantenimiento ? (
                    <>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--on-surface)' }}>
                        {new Date(v.proximo_mantenimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: new Date(v.proximo_mantenimiento) < new Date() ? '#ef4444' : 'var(--on-surface-variant)' }}>
                        {new Date(v.proximo_mantenimiento) < new Date()
                          ? 'Vencido'
                          : `En ${Math.ceil((new Date(v.proximo_mantenimiento).getTime() - Date.now()) / 86400000)} días`}
                      </div>
                    </>
                  ) : (
                    <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>—</span>
                  )}
                </td>
                <td>
                  <Link href={`/flota/${v.id}`} className="btn btn-ghost" title="Ver detalle">
                    <Eye size={16} color="var(--on-surface-variant)" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          borderTop: '1px solid var(--surface-container)',
          background: 'var(--surface-container-low)',
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
            Página <strong>{page}</strong> de <strong>{totalPages}</strong>
          </span>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary"
              style={{ padding: '0.375rem 0.625rem', opacity: page === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn btn-secondary"
              style={{ padding: '0.375rem 0.625rem', opacity: page === totalPages ? 0.4 : 1 }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
