'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/StatusBadge';
import { Truck, BrainCircuit, History, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function FichaVehiculoPage() {
  const params = useParams();
  const router = useRouter();
  const [v, setVehiculo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/vehiculos/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => {
        setVehiculo(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout breadcrumb={[{ label: 'Flota', href: '/flota' }, { label: 'Cargando...' }]}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Loader2 className="animate-spin" size={32} color="var(--primary-container)" />
        </div>
      </AppLayout>
    );
  }

  if (error || !v) {
    return (
      <AppLayout breadcrumb={[{ label: 'Flota', href: '/flota' }, { label: 'Error' }]}>
        <div style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--on-surface-variant)' }}>
          <h2 className="headline-lg">Vehículo no encontrado</h2>
          <button onClick={() => router.push('/flota')} className="btn btn-primary" style={{ marginTop: '1rem' }}>Volver a la Flota</button>
        </div>
      </AppLayout>
    );
  }

  // Combine preventivos and correctivos to form a unified history
  const historial = [
    ...(v.mantenimientos_preventivos || []).map((m: any) => ({
      id: m.id,
      tipo: 'preventivo',
      fecha: m.fecha_programada,
      descripcion: m.tipo_mantenimiento?.nombre || 'Mantenimiento Preventivo',
      costo: 0, // Should come from joined orden_trabajo in a real full app
    })),
    ...(v.incidencias || []).map((i: any) => ({
      id: i.id,
      tipo: 'correctivo',
      fecha: i.fecha_reporte,
      descripcion: i.tipo_averia?.nombre || 'Reparación Correctiva',
      costo: 0, 
    }))
  ].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const costoTotal = (v.ordenes_trabajo || []).reduce((sum: number, ot: any) => sum + (ot.costo || 0), 0);

  // Recommendations can be fetched or calculated. 
  // Keeping the array empty since there's no real AI endpoint yet, or we can mock 1 rule.
  const recomendaciones = v.kilometraje > 100000 && v.estado === 'activo' 
    ? [{ id: '1', descripcion: 'Sugerencia de revisión mayor de motor por superar los 100,000 km.', criterio: 'Regla de negocio: KM > 100k', nivel_confianza: 90 }] 
    : [];

  return (
    <AppLayout breadcrumb={[{ label: 'Flota', href: '/flota' }, { label: v.placa }]}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Back */}
        <Link href="/flota" className="btn btn-ghost" style={{ marginBottom: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.875rem', gap: '0.375rem' }}>
          <ArrowLeft size={16} /> Volver a Flota
        </Link>

        {/* Vehicle Header */}
        <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
            {/* Placa big */}
            <div style={{
              background: 'var(--nav-bg)', borderRadius: 12,
              padding: '1rem 1.5rem',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              minWidth: 120,
            }}>
              <Truck size={28} color="#ff7a1a" />
              <div className="technical-data" style={{ color: '#fff', fontSize: '1.1rem', marginTop: '0.5rem', letterSpacing: '0.04em' }}>
                {v.placa}
              </div>
            </div>

            {/* Main info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h1 className="headline-md" style={{ color: 'var(--on-surface)', fontSize: '1.5rem' }}>
                  {v.marca} {v.modelo}
                </h1>
                <StatusBadge estado={v.estado} />
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>
                {v.tipo_vehiculo} · Año {v.anio} · {v.combustible?.charAt(0).toUpperCase() + v.combustible?.slice(1)} · {v.capacidad_carga} ton
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                  <div className="label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: 4 }}>Kilometraje</div>
                  <div className="technical-data" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--on-surface)' }}>{v.kilometraje?.toLocaleString()} KM</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                  <div className="label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: 4 }}>Conductor</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>{v.conductor || '—'}</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                  <div className="label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: 4 }}>Últ. Mantenimiento</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--on-surface)' }}>
                    {v.ultimo_mantenimiento ? new Date(v.ultimo_mantenimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </div>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--surface-container-low)', borderRadius: 8 }}>
                  <div className="label-caps" style={{ color: 'var(--on-surface-variant)', marginBottom: 4 }}>Costo Total</div>
                  <div className="technical-data" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--status-active-text)' }}>${costoTotal.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1rem' }}>
          {/* Historial */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <History size={18} color="var(--primary-container)" />
              <h2 className="headline-md" style={{ fontSize: '1rem', color: 'var(--on-surface)' }}>Historial de Intervenciones</h2>
            </div>
            {historial.length === 0 ? (
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem', textAlign: 'center', padding: '2rem' }}>Sin registros de historial.</p>
            ) : (
              <div style={{ position: 'relative' }}>
                {/* Timeline line */}
                <div style={{ position: 'absolute', left: 11, top: 24, bottom: 0, width: 2, background: 'var(--surface-container-high)' }} />
                {historial.map((h, i) => (
                  <div key={h.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', position: 'relative' }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      background: h.tipo === 'preventivo' ? 'var(--status-active-bg)' : 'var(--status-taller-bg)',
                      border: `2px solid ${h.tipo === 'preventivo' ? 'var(--status-active-dot)' : '#f59e0b'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 1,
                    }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.tipo === 'preventivo' ? 'var(--status-active-dot)' : '#f59e0b' }} />
                    </div>
                    <div style={{ flex: 1, background: 'var(--surface-container-low)', borderRadius: 8, padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: h.tipo === 'preventivo' ? 'var(--status-active-text)' : 'var(--status-taller-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          {h.tipo}
                        </span>
                        <span className="technical-data" style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                          {new Date(h.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div style={{ fontWeight: 600, color: 'var(--on-surface)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{h.descripcion}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recomendaciones IA */}
          <div className="card" style={{ padding: '1.25rem', height: 'fit-content' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <BrainCircuit size={18} color="var(--tertiary)" />
              <h2 className="headline-md" style={{ fontSize: '1rem', color: 'var(--on-surface)' }}>Recomendaciones IA</h2>
            </div>
            {recomendaciones.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
                <BrainCircuit size={32} color="var(--surface-container-highest)" style={{ marginBottom: '0.5rem' }} />
                <p>Sin datos suficientes para generar recomendaciones.</p>
              </div>
            ) : (
              recomendaciones.map(r => (
                <div key={r.id} style={{
                  background: 'var(--surface-container-low)',
                  border: '1px solid var(--surface-container-high)',
                  borderRadius: 8, padding: '0.875rem', marginBottom: '0.75rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span className="label-caps" style={{ color: 'var(--tertiary)', fontSize: '0.65rem' }}>IA</span>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700,
                      color: r.nivel_confianza >= 80 ? 'var(--status-active-text)' : r.nivel_confianza >= 60 ? 'var(--status-taller-text)' : 'var(--on-surface-variant)',
                    }}>
                      {r.nivel_confianza}% confianza
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--on-surface)', fontWeight: 500, marginBottom: '0.375rem', lineHeight: 1.4 }}>
                    {r.descripcion}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                    {r.criterio}
                  </p>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <button className="btn btn-primary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.625rem' }}>Aceptar</button>
                    <button className="btn btn-secondary" style={{ fontSize: '0.7rem', padding: '0.25rem 0.625rem' }}>Descartar</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
