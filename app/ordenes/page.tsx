'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/StatusBadge';
import { Loader2, AlertCircle, Check } from 'lucide-react';

const ESTADOS = ['todos', 'pendiente', 'en_proceso', 'finalizado'];
const PER_PAGE = 8;

export default function OrdenesPage() {
  const [data, setData] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [page, setPage] = useState(1);

  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [ordenToComplete, setOrdenToComplete] = useState<string | null>(null);
  const [costoFinal, setCostoFinal] = useState('');
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/ordenes').then(res => res.json()),
      fetch('/api/usuarios').then(res => res.json())
    ]).then(([ordenesData, usuariosData]) => {
      setData(Array.isArray(ordenesData) ? ordenesData : []);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);
      setLoading(false);
    });
  }, []);

  const handleAssignTecnico = async (ordenId: string, tecnicoId: string) => {
    try {
      const res = await fetch(`/api/ordenes/${ordenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tecnico_asignado_id: tecnicoId,
          estado: 'en_proceso',
          fecha_asignacion: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error();
      const updatedOrden = await res.json();
      
      setData(prev => prev.map(o => o.id === ordenId ? { ...o, ...updatedOrden, tecnico: usuarios.find(u => u.id === tecnicoId) } : o));
    } catch (e) {
      alert('Error al asignar técnico');
    }
  };

  const handleCompleteOrden = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ordenToComplete) return;
    setCompleting(true);
    try {
      const res = await fetch(`/api/ordenes/${ordenToComplete}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: 'finalizado',
          costo: parseFloat(costoFinal)
        })
      });
      if (!res.ok) throw new Error();
      const updatedOrden = await res.json();
      setData(prev => prev.map(o => o.id === ordenToComplete ? { ...o, ...updatedOrden } : o));
      setCompleteModalOpen(false);
      setOrdenToComplete(null);
      setCostoFinal('');
    } catch (e) {
      alert('Error al completar la orden');
    } finally {
      setCompleting(false);
    }
  };

  const filtered = data.filter(o => filtroEstado === 'todos' || o.estado === filtroEstado);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const tecnicos = usuarios.filter(u => u.rol && u.rol.toLowerCase().trim() === 'tecnico' && u.estado === 'activo');

  return (
    <AppLayout breadcrumb={[{ label: 'Órdenes de Trabajo' }]}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
            Órdenes de Trabajo
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
            {data.length} órdenes generadas — {data.filter(o => o.estado === 'pendiente').length} pendientes de asignación.
          </p>
        </div>
      </div>

      {/* Estado Filters */}
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
              <th>Código OT</th>
              <th>Origen</th>
              <th>Vehículo</th>
              <th>Descripción</th>
              <th>Técnico Asignado</th>
              <th>Fecha Asignación</th>
              <th>Costo</th>
              <th>Estado</th>
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
              paged.map(ot => {
                const veh = ot.vehiculo;
                const tec = usuarios.find(u => u.id === ot.tecnico_asignado_id);
                
                return (
                  <tr key={ot.id}>
                    <td><span className="technical-data" style={{ color: 'var(--tertiary)', fontWeight: 700 }}>{ot.codigo}</span></td>
                    <td>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                        padding: '0.2rem 0.5rem', borderRadius: 4,
                        background: ot.origen === 'preventivo' ? 'var(--status-active-bg)' : 'var(--status-taller-bg)',
                        color: ot.origen === 'preventivo' ? 'var(--status-active-text)' : 'var(--status-taller-text)',
                      }}>{ot.origen}</span>
                    </td>
                    <td>
                      <span className="placa-chip">{veh?.placa}</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: 3 }}>{veh?.marca} {veh?.modelo}</div>
                    </td>
                    <td style={{ maxWidth: 200 }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--on-surface)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {ot.descripcion}
                      </span>
                    </td>
                    <td>
                      {tec ? (
                        <span style={{ fontSize: '0.875rem', color: 'var(--on-surface)', fontWeight: 500 }}>{tec.nombre_completo}</span>
                      ) : (
                        <select 
                          className="form-select" 
                          style={{ width: 160, padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                          onChange={(e) => {
                            if (e.target.value) handleAssignTecnico(ot.id, e.target.value);
                          }}
                          defaultValue=""
                        >
                          <option value="" disabled>Asignar técnico...</option>
                          {tecnicos.map(t => <option key={t.id} value={t.id}>{t.nombre_completo}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="technical-data" style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                      {ot.fecha_asignacion ? new Date(ot.fecha_asignacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                    <td className="technical-data" style={{ fontWeight: 600, color: ot.costo ? 'var(--status-active-text)' : 'var(--on-surface-variant)' }}>
                      {ot.costo ? `$${ot.costo.toLocaleString()}` : ot.estado === 'en_proceso' ? (
                        <button 
                          onClick={() => { setOrdenToComplete(ot.id); setCompleteModalOpen(true); }}
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--primary-container)', color: '#fff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.2s' }}
                          onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                        >
                          <Check size={14}/> Finalizar
                        </button>
                      ) : ot.estado === 'pendiente' ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.75rem' }}><AlertCircle size={14}/> Requerido</span>
                      ) : '—'}
                    </td>
                    <td><StatusBadge estado={ot.estado} /></td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
                  No hay órdenes de trabajo generadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.875rem 1.25rem', borderTop: '1px solid var(--surface-container)', background: 'var(--surface-container-low)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>Página <strong>{page}</strong> de <strong>{totalPages}</strong></span>
        </div>
      </div>

      {/* Modal Completar */}
      {completeModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: 400, padding: '2rem' }}>
            <h2 className="headline-md" style={{ marginBottom: '1rem' }}>Finalizar Orden</h2>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Por favor, ingresa el costo total del mantenimiento o reparación para dar por terminada la orden.
            </p>
            <form onSubmit={handleCompleteOrden}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Costo Total ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0"
                  className="form-input" 
                  required 
                  value={costoFinal}
                  onChange={e => setCostoFinal(e.target.value)}
                  placeholder="Ej. 150.00"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setCompleteModalOpen(false); setCostoFinal(''); }} disabled={completing}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={completing}>
                  {completing ? 'Guardando...' : 'Finalizar Orden'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
