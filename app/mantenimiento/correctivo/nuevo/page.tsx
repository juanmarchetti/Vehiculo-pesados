'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useRouter } from 'next/navigation';
import { Save, X, Search, AlertTriangle, Loader2, Truck } from 'lucide-react';

export default function RegistrarFallaPage() {
  const router = useRouter();
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [tiposAveria, setTiposAveria] = useState<any[]>([]);
  
  const [placaBusqueda, setPlacaBusqueda] = useState('');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState<any | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);

  const [solicitudId] = useState('INC-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000));

  useEffect(() => {
    Promise.all([
      fetch('/api/vehiculos').then(res => res.json()),
      fetch('/api/catalogos').then(res => res.json())
    ]).then(([vData, cData]) => {
      setVehiculos(vData);
      setTiposAveria(cData.tiposAveria || []);
      setLoadingData(false);
    });
  }, []);

  const buscarVehiculo = () => {
    const veh = vehiculos.find(v => v.placa.toLowerCase() === placaBusqueda.toLowerCase());
    setVehiculoSeleccionado(veh || null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!vehiculoSeleccionado) {
      alert('Debe seleccionar un vehículo primero.');
      return;
    }

    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/mantenimiento/correctivo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_incidencia: solicitudId,
          vehiculo_id: vehiculoSeleccionado.id,
          tipo_averia_id: data.tipo_averia_id,
          fecha_reporte: data.fecha_reporte,
          kilometraje_actual: vehiculoSeleccionado.kilometraje,
          descripcion_falla: data.descripcion_falla,
          nivel_gravedad: data.nivel_gravedad
        }),
      });

      if (!res.ok) throw new Error('Error al guardar incidencia');
      router.push('/mantenimiento/correctivo');
    } catch (err) {
      alert('Hubo un problema al reportar la falla.');
      setSaving(false);
    }
  };

  if (loadingData) {
    return (
      <AppLayout breadcrumb={[{ label: 'Mantenimiento' }, { label: 'Correctivo', href: '/mantenimiento/correctivo' }, { label: 'Cargando...' }]}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <Loader2 className="animate-spin" size={32} color="var(--primary-container)" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumb={[{ label: 'Mantenimiento' }, { label: 'Correctivo', href: '/mantenimiento/correctivo' }, { label: 'Reportar Falla' }]}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 className="headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
              Reportar Falla o Avería
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
              Registre un mantenimiento correctivo no programado. Se generará una OT automáticamente.
            </p>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 0.875rem',
            border: '1px solid var(--surface-container-high)',
            borderRadius: 8, background: 'var(--surface-container-lowest)'
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>ID INCIDENCIA:</span>
            <span className="technical-data" style={{ color: 'var(--tertiary)' }}>{solicitudId}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Identificación del Activo */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-container-high)' }}>
              <Truck size={18} color="var(--primary-container)" />
              <h2 className="headline-md" style={{ fontSize: '0.9rem', color: 'var(--on-surface)' }}>Vehículo Afectado</h2>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Placa del Vehículo</label>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }} />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Escriba la placa (ej. PBA-5510)..."
                    style={{ paddingLeft: '2rem' }}
                    value={placaBusqueda}
                    onChange={e => setPlacaBusqueda(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); buscarVehiculo(); } }}
                  />
                </div>
              </div>
              <button type="button" onClick={buscarVehiculo} className="btn btn-secondary" style={{ padding: '0.625rem 1.5rem' }}>
                Buscar Activo
              </button>
            </div>

            {vehiculoSeleccionado && (
              <div style={{ marginTop: '1rem', background: 'var(--surface-container-low)', borderRadius: 8, padding: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem', border: '1px solid var(--surface-container-high)' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Vehículo</div>
                  <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{vehiculoSeleccionado.marca} {vehiculoSeleccionado.modelo}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Conductor Asignado</div>
                  <div style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{vehiculoSeleccionado.conductor || 'N/A'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Kilometraje Actual</div>
                  <div className="technical-data" style={{ color: 'var(--primary-container)', fontWeight: 700 }}>{vehiculoSeleccionado.kilometraje?.toLocaleString()} KM</div>
                </div>
              </div>
            )}
          </div>

          {/* Detalles de la Falla */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-container-high)' }}>
              <AlertTriangle size={16} color="#ef4444" />
              <h2 className="headline-md" style={{ fontSize: '0.9rem', color: 'var(--on-surface)' }}>Detalles de la Avería</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label" htmlFor="tipo_averia_id">Sistema Afectado (Catálogo)</label>
                <select id="tipo_averia_id" name="tipo_averia_id" className="form-select" required>
                  <option value="">Seleccione sistema...</option>
                  {tiposAveria.map(t => (
                    <option key={t.id} value={t.id}>{t.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="fecha_reporte">Fecha de Reporte</label>
                <input type="datetime-local" id="fecha_reporte" name="fecha_reporte" className="form-input" required defaultValue={new Date().toISOString().slice(0, 16)} />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="descripcion_falla">Descripción del Problema</label>
              <textarea 
                id="descripcion_falla"
                name="descripcion_falla"
                className="form-textarea" 
                rows={4} 
                required
                placeholder="Describa los síntomas reportados por el conductor o hallados durante la operación..."
              />
            </div>

            <div>
              <label className="form-label" htmlFor="nivel_gravedad">Nivel de Gravedad e Impacto Operativo</label>
              <select id="nivel_gravedad" name="nivel_gravedad" className="form-select" required>
                <option value="baja">Baja - Puede seguir operando con precaución</option>
                <option value="media">Media - Requiere revisión pronta, afecta rendimiento</option>
                <option value="alta">Alta (Crítica) - Vehículo Inmovilizado / Peligro de seguridad</option>
              </select>
              <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.5rem' }}>
                Nota: Seleccionar "Alta" cambiará automáticamente el estado del vehículo a "En Mantenimiento" y generará una Orden de Trabajo prioritaria.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => router.push('/mantenimiento/correctivo')} className="btn btn-secondary">
              <X size={16} /> Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving || !vehiculoSeleccionado} style={{ padding: '0.75rem 2rem' }}>
              {saving ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> : <Save size={16} />}
              Reportar Falla y Generar OT
            </button>
          </div>
        </form>
      </div>
      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
}
