'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/StatusBadge';
import Link from 'next/link';
import { PlusCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

const ESTADOS = ['todos', 'pendiente', 'en_proceso', 'completado', 'cancelado'];
const PER_PAGE = 8;

export default function MantenimientoPreventivoPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/mantenimiento/preventivo')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      });
  }, []);

  const filtered = data.filter(
    m => filtroEstado === 'todos' || m.estado === filtroEstado
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/mantenimiento/preventivo/${itemToDelete}`, { method: 'DELETE' });
      if (res.ok) {
        setData(data.filter(item => item.id !== itemToDelete));
      } else {
        alert('Error al eliminar');
      }
    } catch (error) {
      console.error(error);
      alert('Error al eliminar');
    } finally {
      setModalOpen(false);
      setItemToDelete(null);
    }
  };

  const isVencido = (iso: string) => {
    const fechaStr = iso.split('T')[0];
    const d = new Date();
    const localToday = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    return fechaStr < localToday;
  };

  return (
    <AppLayout breadcrumb={[{ label: 'Mantenimiento' }, { label: 'Preventivo' }]}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
            Mantenimiento Preventivo
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
            Programaciones activas: {data.filter(m => m.estado !== 'cancelado').length} intervenciones en la base de datos.
          </p>
        </div>
        <Link href="/mantenimiento/preventivo/nuevo" className="btn btn-primary">
          <PlusCircle size={16} />
          Programar Mantenimiento
        </Link>
      </div>

      {/* Estado tabs */}
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

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Placa / Vehículo</th>
              <th>Tipo de Mantenimiento</th>
              <th>Fecha Programada</th>
              <th>KM Objetivo</th>
              <th>Estado</th>
              <th>OT</th>
              <th style={{ textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem' }}>
                  <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto', color: 'var(--primary-container)' }} />
                </td>
              </tr>
            ) : paged.length > 0 ? (
              paged.map(mp => {
                const veh = mp.vehiculo;
                const vencido = isVencido(mp.fecha_programada) && mp.estado === 'pendiente';
                return (
                  <tr key={mp.id}>
                    <td><span className="technical-data" style={{ color: 'var(--tertiary)', fontWeight: 600 }}>{mp.codigo}</span></td>
                    <td>
                      <Link href={`/flota/${veh?.id}`} style={{ textDecoration: 'none' }}>
                        <span className="placa-chip" style={{ marginBottom: 4 }}>{veh?.placa || 'N/A'}</span>
                      </Link>
                      {veh && <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: 3 }}>{veh.marca} {veh.modelo}</div>}
                    </td>
                    <td style={{ fontWeight: 500, color: 'var(--on-surface)' }}>{mp.tipo_mantenimiento?.nombre || mp.tipo_mantenimiento_id}</td>
                    <td>
                      <span className="technical-data" style={{ color: vencido ? '#ef4444' : 'var(--on-surface)' }}>
                        {new Date(mp.fecha_programada).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      {vencido && <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 600 }}>VENCIDO</div>}
                    </td>
                    <td><span className="technical-data">{mp.km_programado.toLocaleString()} KM</span></td>
                    <td><StatusBadge estado={mp.estado} /></td>
                    <td>
                      {mp.orden_trabajo_id
                        ? <span className="technical-data" style={{ fontSize: '0.75rem', color: 'var(--tertiary)' }}>#{mp.orden_trabajo_id}</span>
                        : <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>Auto</span>}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {mp.estado === 'pendiente' && (
                        <>
                          <Link href={`/mantenimiento/preventivo/editar/${mp.id}`} className="btn btn-ghost" style={{ padding: '0.3rem 0.5rem', color: 'var(--primary-container)', fontSize: '0.75rem' }}>
                            Editar
                          </Link>
                          <button onClick={() => handleDeleteClick(mp.id)} className="btn btn-ghost" style={{ padding: '0.3rem 0.5rem', color: '#ef4444', fontSize: '0.75rem', marginLeft: '0.25rem' }}>
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
                  No hay mantenimientos preventivos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', borderTop: '1px solid var(--surface-container)', background: 'var(--surface-container-low)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-secondary" style={{ padding: '0.375rem 0.625rem', opacity: page === 1 ? 0.4 : 1 }}><ChevronLeft size={16} /></button>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn btn-secondary" style={{ padding: '0.375rem 0.625rem', opacity: page === totalPages ? 0.4 : 1 }}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      <ConfirmModal 
        isOpen={modalOpen}
        title="Eliminar Registro"
        message="¿Está seguro de que desea eliminar este mantenimiento preventivo? Esta acción no se puede deshacer."
        onConfirm={confirmDelete}
        onCancel={() => { setModalOpen(false); setItemToDelete(null); }}
        isDanger={true}
      />
    </AppLayout>
  );
}
