'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import { useRouter } from 'next/navigation';
import { Save, X, AlertTriangle, Truck, Settings, ClipboardList } from 'lucide-react';

const Field = ({ label, id, type = 'text', placeholder = '', required = true, children, ...props }: any) => (
  <div>
    <label htmlFor={id} className="form-label">{label}</label>
    {children ?? (
      <input id={id} name={id} type={type} className="form-input" placeholder={placeholder} required={required} {...props} />
    )}
  </div>
);

export default function NuevoVehiculoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // States for dynamic validation
  const [origenMatricula, setOrigenMatricula] = useState('Nacional');
  const [tipoVehiculo, setTipoVehiculo] = useState('');
  const [kilometraje, setKilometraje] = useState('');

  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 1;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    // Soft validation for kilometraje
    const kmValue = parseInt(data.kilometraje as string || '0', 10);
    if (kmValue > 3000000) {
      const confirmKms = window.confirm(`Has ingresado un kilometraje extremadamente alto (${kmValue.toLocaleString()} km). ¿Estás seguro de que el dato es correcto?`);
      if (!confirmKms) return;
    }

    setSaving(true);
    
    try {
      const res = await fetch('/api/vehiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al guardar vehículo');
      }
      
      router.push('/flota');
    } catch (err: any) {
      setErrorMsg(err.message);
      setSaving(false);
    }
  };

  return (
    <AppLayout breadcrumb={[{ label: 'Flota', href: '/flota' }, { label: 'Registrar Vehículo' }]}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 className="headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
            Registrar Vehículo
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
            Complete la información técnica y operativa de la unidad.
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: '1rem', background: '#ffebee', color: '#c62828', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Sección: Identificación */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-container-high)' }}>
              <h2 className="headline-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--on-surface)' }}>
                <Truck size={18} color="var(--primary-container)" /> Identificación del Vehículo
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <Field label="Código Interno" id="codigo" placeholder="TN-011" />
              
              <Field label="Origen Matrícula" id="origen_matricula">
                <select 
                  id="origen_matricula" 
                  name="origen_matricula" 
                  className="form-select" 
                  value={origenMatricula} 
                  onChange={e => setOrigenMatricula(e.target.value)}
                  required
                >
                  <option value="Nacional">Nacional (Ecuador)</option>
                  <option value="Importado/Extranjero">Importado / Extranjero</option>
                </select>
              </Field>

              <Field label="Placa" id="placa" 
                     placeholder={origenMatricula === 'Nacional' ? "ABC-1234" : "Ej. XYZ-987"} 
                     pattern={origenMatricula === 'Nacional' ? "^[A-Za-z]{3}-\\d{3,4}$" : "^[A-Za-z0-9 -]{4,15}$"}
                     title={origenMatricula === 'Nacional' ? "Formato válido: 3 letras, guion y 3 a 4 números (Ej. ABC-1234 o XYZ-123)" : "Placa extranjera: entre 4 y 15 caracteres alfanuméricos"} 
                     style={{ textTransform: 'uppercase' }} />
                     
              {origenMatricula === 'Importado/Extranjero' && (
                <Field label="País de Origen" id="pais_origen" placeholder="Ej. Colombia" />
              )}

              <Field label="Marca" id="marca" placeholder="Mercedes-Benz" />
              <Field label="Modelo" id="modelo" placeholder="Actros 2651" />
              <Field label="Año de Fabricación" id="anio" type="number" 
                     placeholder={currentYear.toString()} 
                     min={1980} max={maxYear}
                     title={`El año debe estar entre 1980 y ${maxYear}`} />
              <Field label="Número de Chasis" id="chasis" placeholder="WDB9634031N..." />
              <Field label="Número de Motor" id="motor" placeholder="OM926-010" />
            </div>
          </div>

          {/* Sección: Info Técnica */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-container-high)' }}>
              <h2 className="headline-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--on-surface)' }}>
                <Settings size={18} color="var(--tertiary)" /> Información Técnica
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <Field label="Tipo de Vehículo" id="tipo_vehiculo">
                <select 
                  id="tipo_vehiculo" 
                  name="tipo_vehiculo" 
                  className="form-select" 
                  value={tipoVehiculo}
                  onChange={e => setTipoVehiculo(e.target.value)}
                  required
                >
                  <option value="">Seleccione tipo...</option>
                  {[
                    'Camión de Carga Pesada',
                    'Cisterna Combustible',
                    'Tracto Camión V8',
                    'Transporte Especial',
                    'Distribución Urbana',
                    'Tractocamión',
                    'Camión de Volteo',
                    'Carga General',
                    'Cama baja',
                    'Plataforma extra pesada'
                  ].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </Field>
              
              <Field 
                label="Capacidad de Carga (ton)" 
                id="capacidad_carga" 
                type="number" 
                placeholder="30" 
                min={0.1} 
                max={tipoVehiculo === 'Cama baja' || tipoVehiculo === 'Plataforma extra pesada' ? 80 : 60} 
                step={0.1}
                title={`Máximo permitido: ${tipoVehiculo === 'Cama baja' || tipoVehiculo === 'Plataforma extra pesada' ? '80' : '60'} toneladas`}
              />
              
              <Field label="Tipo de Combustible" id="combustible">
                <select id="combustible" name="combustible" className="form-select" required>
                  <option value="diesel">Diésel</option>
                  <option value="gasolina">Gasolina</option>
                  <option value="otro">Otro</option>
                </select>
              </Field>
            </div>
          </div>

          {/* Sección: Info Operativa */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-container-high)' }}>
              <h2 className="headline-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--on-surface)' }}>
                <ClipboardList size={18} color="#059669" /> Información Operativa
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <Field 
                label="Kilometraje Actual (km)" 
                id="kilometraje" 
                type="number" 
                placeholder="0" 
                min={0}
                step={1}
                value={kilometraje}
                onChange={(e: any) => setKilometraje(e.target.value)}
              />
              
              <Field label="Fecha de Adquisición" id="fecha_adquisicion" type="date" />
              
              <Field label="Estado" id="estado">
                <select id="estado" name="estado" className="form-select" required>
                  <option value="activo">Activo</option>
                  <option value="en_mantenimiento">En Mantenimiento</option>
                  <option value="fuera_de_servicio">Fuera de Servicio</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </Field>
              
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="Conductor Asignado" id="conductor" placeholder="Nombre del conductor" required={false} />
              </div>
              
              <div style={{ gridColumn: 'span 3' }}>
                <label htmlFor="observaciones" className="form-label">Observaciones</label>
                <textarea id="observaciones" name="observaciones" className="form-textarea" placeholder="Notas adicionales sobre el vehículo..." rows={3} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem' }}>
            <button type="button" onClick={() => router.push('/flota')} className="btn btn-secondary">
              <X size={16} /> Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> : <Save size={16} />}
              Guardar Vehículo
            </button>
          </div>
        </form>
      </div>
      <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
}
