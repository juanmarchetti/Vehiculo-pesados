'use client';
import { useState, useEffect, use } from 'react';
import AppLayout from '@/components/AppLayout';
import { useRouter } from 'next/navigation';
import { Save, X, User, Loader2 } from 'lucide-react';

export default function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/usuarios/${unwrappedParams.id}`)
      .then(res => res.json())
      .then(data => {
        setUserData(data);
        setLoading(false);
      });
  }, [unwrappedParams.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`/api/usuarios/${unwrappedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error al actualizar usuario');
      router.push('/configuracion/usuarios');
    } catch (err) {
      alert('Hubo un problema al actualizar el usuario.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout breadcrumb={[{ label: 'Configuración' }, { label: 'Usuarios', href: '/configuracion/usuarios' }, { label: 'Editar Usuario' }]}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 className="animate-spin" size={32} color="var(--primary-container)" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout breadcrumb={[{ label: 'Configuración' }, { label: 'Usuarios', href: '/configuracion/usuarios' }, { label: 'Editar Usuario' }]}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <h1 className="headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
              Editar Usuario
            </h1>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
              Modifique el nombre o el rol del usuario en el sistema.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--surface-container-high)' }}>
              <User size={16} color="var(--tertiary)" />
              <h2 className="headline-md" style={{ fontSize: '0.9rem', color: 'var(--on-surface)' }}>Datos del Usuario</h2>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label" htmlFor="nombre_completo">Nombre Completo</label>
                <input 
                  type="text" 
                  id="nombre_completo" 
                  name="nombre_completo" 
                  className="form-input" 
                  defaultValue={userData?.nombre_completo}
                  required 
                />
              </div>
              <div>
                <label className="form-label" htmlFor="correo">Correo Electrónico (No editable)</label>
                <input 
                  type="email" 
                  id="correo" 
                  name="correo" 
                  className="form-input" 
                  defaultValue={userData?.correo}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label" htmlFor="contrasena">Nueva Contraseña (Opcional)</label>
                <input 
                  type="password" 
                  id="contrasena" 
                  name="contrasena" 
                  className="form-input" 
                  placeholder="Dejar en blanco para no cambiar" 
                  minLength={6}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="rol">Rol en el Sistema</label>
                <select id="rol" name="rol" className="form-select" required defaultValue={userData?.rol}>
                  <option value="administrador">Administrador</option>
                  <option value="jefe_mantenimiento">Jefe de Mantenimiento</option>
                  <option value="tecnico">Técnico / Mecánico</option>
                  <option value="supervisor">Supervisor / Gerente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => router.push('/configuracion/usuarios')} className="btn btn-secondary">
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
