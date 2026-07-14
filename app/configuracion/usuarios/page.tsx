'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/StatusBadge';
import { PlusCircle, Edit2, Power, Loader2 } from 'lucide-react';
import Link from 'next/link';

const ROL_LABELS: Record<string, string> = {
  administrador: 'Administrador',
  jefe_mantenimiento: 'Jefe de Mantenimiento',
  tecnico: 'Técnico / Mecánico',
  supervisor: 'Supervisor / Gerente',
};

export default function UsuariosPage() {
  const [listaUsuarios, setListaUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/usuarios')
      .then(res => res.json())
      .then(data => {
        setListaUsuarios(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  const toggleEstado = async (id: string, currentEstado: string) => {
    const newEstado = currentEstado === 'activo' ? 'inactivo' : 'activo';
    try {
      await fetch('/api/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: newEstado })
      });
      setListaUsuarios(prev => prev.map(u =>
        u.id === id ? { ...u, estado: newEstado } : u
      ));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout breadcrumb={[{ label: 'Configuración' }, { label: 'Gestión de Usuarios' }]}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
            Gestión de Usuarios
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
            Administración de cuentas y roles — {listaUsuarios.filter(u => u.estado === 'activo').length} activos.
          </p>
        </div>
        <Link href="/configuracion/usuarios/nuevo" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          <PlusCircle size={16} />
          Nuevo Usuario
        </Link>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                  <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto', color: 'var(--primary-container)' }} />
                </td>
              </tr>
            ) : listaUsuarios.length > 0 ? (
              listaUsuarios.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: u.rol === 'administrador' ? 'var(--primary-container)' : u.rol === 'jefe_mantenimiento' ? 'var(--tertiary)' : u.rol === 'supervisor' ? '#8b5cf6' : 'var(--secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: '0.75rem',
                      }}>
                        {u.nombre_completo?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'US'}
                      </div>
                      <span style={{ fontWeight: 600, color: 'var(--on-surface)' }}>{u.nombre_completo}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>{u.correo}</td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.625rem', borderRadius: 4,
                      background: 'var(--surface-container)',
                      color: u.rol === 'administrador' ? 'var(--primary-container)' : u.rol === 'supervisor' ? '#8b5cf6' : 'var(--on-surface)',
                    }}>
                      {ROL_LABELS[u.rol] || u.rol}
                    </span>
                  </td>
                  <td><StatusBadge estado={u.estado} /></td>
                  <td className="technical-data" style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                    {new Date(u.fecha_creacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                      <Link href={`/configuracion/usuarios/${u.id}/editar`} className="btn btn-ghost" title="Editar" style={{ padding: '0.375rem', textDecoration: 'none' }}>
                        <Edit2 size={15} color="var(--tertiary)" />
                      </Link>
                      <button
                        onClick={() => toggleEstado(u.id, u.estado)}
                        className="btn btn-ghost"
                        title={u.estado === 'activo' ? 'Inhabilitar' : 'Activar'}
                        style={{ padding: '0.375rem' }}
                      >
                        <Power size={15} color={u.estado === 'activo' ? '#ef4444' : '#10b981'} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
                  No hay usuarios registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AppLayout>
  );
}
