'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import { PlusCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const ESTADOS = ['todos', 'reportado', 'en_reparacion', 'solucionado', 'cancelado'];
const PER_PAGE = 8;

export default function MantenimientoCorrectivoPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch('/api/mantenimiento/correctivo')
      .then(res => res.json())
      .then(resData => {
        setData(Array.isArray(resData) ? resData : []);
        setLoading(false);
      });
  }, []);

  const filtered = data.filter(i => filtroEstado === 'todos' || i.estado === filtroEstado);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <AppLayout breadcrumb={[{ label: 'Mantenimiento' }, { label: 'Correctivo' }]}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
            Mantenimiento Correctivo
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
            Registro de incidencias y averías — {data.length} casos totales en la base de datos.
          </p>
        </div>
        <Link href="/mantenimiento/correctivo/nuevo" className="btn btn-primary">
          <PlusCircle size={16} />
          Registrar Falla
        </Link>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '0.375rem', marginBottom: '1rem' }}>
        {ESTADOS.map(e => (
          <button
            key={e}
            onClick={() => { setFiltroEstado(e); setPage(1); }}
            style={{
              padding: '0.4rem 0.875rem', borderRadius: 6,
              border: filtroEstado === e ? '2px solid var(--primary-container)' : '1.5px solid var(--surface-container-highest)',
              background: filtroEstado === e ? 'rgba(255,122,26,0.08)' : 'transparent',
              color: filtroEstado === e ? 'var(--primary-container)' : 'var(--on-surface)',
              fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
              textTransform: 'capitalize', transition: 'all 0.15s',
            }}
          >
            {e === 'todos' ? 'Todos' : e.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Vehículo</th>
              <th>Fecha Reporte</th>
              <th>Tipo de Avería</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Costo</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                  <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto', color: 'var(--primary-container)' }} />
                </td>
              </tr>
            ) : paged.length > 0 ? (
              paged.map(inc => {
                const veh = inc.vehiculo;
                const tipoNombre = inc.tipo_averia?.nombre || inc.tipo_averia_id;
                return (
                  <tr key={inc.id}>
                    <td><span className="technical-data" style={{ color: 'var(--tertiary)', fontWeight: 600 }}>{inc.codigo_incidencia}</span></td>
                    <td>
                      <Link href={`/flota/${veh?.id}`} style={{ textDecoration: 'none' }}>
                        <span className="placa-chip" style={{ marginBottom: 3 }}>{veh?.placa || 'N/A'}</span>
                      </Link>
                      {veh && <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: 2 }}>{veh.marca} {veh.modelo}</div>}
                    </td>
                    <td className="technical-data" style={{ fontSize: '0.8rem' }}>
                      {new Date(inc.fecha_reporte).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: tipoNombre?.toLowerCase().includes('frenos') ? '#ef4444' : 'var(--on-surface)' }}>
                        {tipoNombre}
                      </span>
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {inc.descripcion_falla}
                      </span>
                    </td>
                    <td><StatusBadge estado={inc.estado} /></td>
                    <td className="technical-data" style={{ fontWeight: 600, color: inc.costo_reparacion ? 'var(--status-active-text)' : 'var(--on-surface-variant)' }}>
                      {inc.costo_reparacion ? `$${inc.costo_reparacion.toLocaleString()}` : '—'}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
                  No hay incidencias reportadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', borderTop: '1px solid var(--surface-container)', background: 'var(--surface-container-low)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary" style={{ padding: '0.375rem 0.625rem', opacity: page === 1 ? 0.4 : 1 }}><ChevronLeft size={16} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-secondary" style={{ padding: '0.375rem 0.625rem', opacity: page === totalPages ? 0.4 : 1 }}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
