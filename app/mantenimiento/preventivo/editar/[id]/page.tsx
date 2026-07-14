'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useRouter, useParams } from 'next/navigation';
import { Save, X, Zap, Search, Loader2, Truck, Settings, CalendarDays } from 'lucide-react';

export default function EditarMantenimientoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [tiposMantenimiento, setTiposMantenimiento] = useState<any[]>([]);
  
  const [placaBusqueda, setPlacaBusqueda] = useState('');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<any | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [fechaSugerida, setFechaSugerida] = useState('');
  const [kmObjetivo, setKmObjetivo] = useState('');
  const [solicitudId, setSolicitudId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [kpis, setKpis] = useState({ proximo_vencimiento: 0, ordenes_activas: 0, cumplimiento_mp: 100 });

  useEffect(() => {
    Promise.all([
      fetch('/api/vehiculos').then(res => res.json()),
      fetch('/api/catalogos').then(res => res.json()),
      fetch('/api/mantenimiento/kpis').then(res => res.ok ? res.json() : null),
      fetch(`/api/mantenimiento/preventivo/${id}`).then(res => res.json())
    ]).then(([vData, cData, kpiData, mpData]) => {
      setVehiculos(vData);
      setTiposMantenimiento(cData.tiposMantenimiento || []);
      if (kpiData) setKpis(kpiData);
      
      if (mpData && !mpData.error) {
        // Populate existing data
        setSolicitudId(mpData.codigo);
        setTipoSeleccionado(mpData.tipo_mantenimiento_id);
        setFechaSugerida(mpData.fecha_programada.split('T')[0]);
        setKmObjetivo(mpData.km_programado);
        setObservaciones(mpData.observaciones || '');
        setVehiculoSeleccionado(mpData.vehiculo);
        setPlacaBusqueda(mpData.vehiculo?.placa || '');
      } else {
        alert(mpData?.error || 'Error al cargar los datos del mantenimiento.');
      }
      
      setLoadingData(false);
    });
  }, [id]);

  const tipoBuscado = tiposMantenimiento.find(t => t.id === tipoSeleccionado);

  const buscarVehiculo = () => {
    const veh = vehiculos.find(v => v.placa.toLowerCase() === placaBusqueda.toLowerCase());
    setVehiculoSeleccionado(veh || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehiculoSeleccionado || !tipoSeleccionado) {
      alert('Debe seleccionar un vehículo y un tipo de mantenimiento.');
      return;
    }

    setSaving(true);
    
    try {
      const res = await fetch(`/api/mantenimiento/preventivo/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehiculo_id: vehiculoSeleccionado.id,
          tipo_mantenimiento_id: tipoSeleccionado,
          fecha_programada: fechaSugerida,
          km_programado: kmObjetivo || (vehiculoSeleccionado.kilometraje + (tipoBuscado?.periodicidad_km || 0)),
          observaciones
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Error al actualizar mantenimiento');
      }
      router.push('/mantenimiento/preventivo');
    } catch (err: any) {
      alert(err.message);
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <AppLayout breadcrumb={[{ label: 'Mantenimiento' }, { label: 'Preventivo', href: '/mantenimiento/preventivo' }, { label: 'Cargando...' }]}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Loader2 className="animate-spin" size={32} color="var(--primary-container)" />
        </div>
      </AppLayout>
    );
  }

  // Calculate minimum date (today) for date input using local time instead of UTC
  const d = new Date();
  const localToday = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

  return (
    <AppLayout breadcrumb={[{ label: 'Mantenimiento' }, { label: 'Preventivo', href: '/mantenimiento/preventivo' }, { label: 'Editar' }]}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 className="headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
              Editar Mantenimiento Preventivo
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
              Modifique los detalles de la intervención técnica programada.
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.875rem',
            border: '1.5px solid var(--primary-container)',
            borderRadius: 8, color: 'var(--primary-container)',
            fontSize: '0.8rem', fontWeight: 600,
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>ID DE SOLICITUD:</span>
            <span className="technical-data" style={{ color: 'var(--primary-container)' }}>{solicitudId}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>

            {/* Left: Identificación + Configuración Técnica */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-container-high)' }}>
                  <Truck size={16} color="var(--primary-container)" />
                  <h2 className="headline-md" style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Identificación de Activo</h2>
                </div>

                <label className="form-label">Selección de Vehículo (Placa)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.875rem' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Escriba la placa (ej. ABC-1234)..."
                      style={{ paddingLeft: '2rem' }}
                      value={placaBusqueda}
                      onChange={e => setPlacaBusqueda(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); buscarVehiculo(); } }}
                    />
                  </div>
                  <button type="button" onClick={buscarVehiculo} className="btn btn-secondary" style={{ padding: '0.5rem 0.875rem', flexShrink: 0 }}>
                    Buscar
                  </button>
                </div>

                {vehiculoSeleccionado ? (
                  <div style={{ background: 'var(--surface-container-low)', borderRadius: 8, padding: '0.875rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 36, height: 36, background: 'var(--nav-bg)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Truck size={20} color="#ff7a1a" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Modelo / Año</div>
                          <div className="technical-data" style={{ fontWeight: 700 }}>{vehiculoSeleccionado.modelo} / {vehiculoSeleccionado.anio}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Kilometraje Actual</div>
                          <div className="technical-data" style={{ color: 'var(--primary-container)', fontWeight: 700 }}>{vehiculoSeleccionado.kilometraje?.toLocaleString()} KM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'var(--surface-container-low)', borderRadius: 8, padding: '0.875rem', textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.8rem' }}>
                    Ingrese la placa para cargar los datos del vehículo.
                  </div>
                )}
              </div>

              {/* Configuración Técnica */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-container-high)' }}>
                  <Settings size={16} color="var(--tertiary)" />
                  <h2 className="headline-md" style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Configuración Técnica</h2>
                </div>
                <label className="form-label">Tipo de Mantenimiento (Catálogo)</label>
                <select
                  className="form-select"
                  value={tipoSeleccionado}
                  onChange={e => setTipoSeleccionado(e.target.value)}
                  required
                >
                  <option value="">Seleccione intervención...</option>
                  {tiposMantenimiento.filter(t => t.estado === 'activo').map(t => (
                    <option key={t.id} value={t.id}>{t.codigo} — {t.nombre}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: Cronograma + Periodicidad */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-container-high)' }}>
                  <CalendarDays size={16} color="var(--primary-container)" />
                  <h2 className="headline-md" style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>Cronograma y Metas</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label className="form-label">Fecha Sugerida</label>
                    <input type="date" className="form-input" min={localToday} required value={fechaSugerida} onChange={e => setFechaSugerida(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Kilometraje Objetivo</label>
                    <div style={{ position: 'relative' }}>
                      <input type="number" className="form-input" 
                        value={kmObjetivo} 
                        onChange={e => setKmObjetivo(e.target.value)}
                        placeholder={tipoBuscado && vehiculoSeleccionado ? String((vehiculoSeleccionado?.kilometraje ?? 0) + tipoBuscado.periodicidad_km) : '150000'} style={{ paddingRight: '2.5rem' }} />
                      <span className="technical-data" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)', fontSize: '0.75rem' }}>KM</span>
                    </div>
                  </div>
                </div>

                {/* Periodicidad automática */}
                <div style={{
                  background: 'rgba(43,99,140,0.06)', border: '1.5px solid rgba(43,99,140,0.2)',
                  borderRadius: 8, padding: '0.875rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.625rem' }}>
                    <span className="label-caps" style={{ color: 'var(--tertiary)', fontSize: '0.65rem' }}>Periodicidad Automática</span>
                    <Zap size={13} color="var(--tertiary)" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
                    <div>
                      <div className="label-caps" style={{ color: 'var(--on-surface-variant)', fontSize: '0.6rem', marginBottom: '0.25rem' }}>Intervalo (días)</div>
                      <div className="technical-data" style={{ fontWeight: 700, color: 'var(--tertiary)', fontSize: '1.1rem' }}>
                        {tipoBuscado ? tipoBuscado.periodicidad_dias : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="label-caps" style={{ color: 'var(--on-surface-variant)', fontSize: '0.6rem', marginBottom: '0.25rem' }}>Intervalo (km)</div>
                      <div className="technical-data" style={{ fontWeight: 700, color: 'var(--tertiary)', fontSize: '1.1rem' }}>
                        {tipoBuscado ? tipoBuscado.periodicidad_km.toLocaleString() : '—'}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontStyle: 'italic', margin: 0 }}>
                    Basado en historial operacional y recomendaciones del fabricante.
                  </p>
                </div>

                {/* Observaciones */}
                <div style={{ marginTop: '1rem' }}>
                  <label className="form-label">Observaciones Técnicas</label>
                  <textarea className="form-textarea" rows={3} value={observaciones} onChange={e => setObservaciones(e.target.value)} placeholder="Detalles adicionales sobre el estado del vehículo o requisitos especiales..." />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--surface-container-high)', margin: '0.5rem 0 1rem' }} />

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" onClick={() => router.push('/mantenimiento/preventivo')} className="btn btn-ghost" style={{ color: 'var(--on-surface-variant)' }}>
              <X size={16} /> Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '0.75rem 2rem' }}>
              {saving ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> : <Save size={16} />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
}
