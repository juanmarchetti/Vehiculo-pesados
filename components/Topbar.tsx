'use client';
import { useState, useEffect } from 'react';
import { Bell, HelpCircle, Search } from 'lucide-react';
import Link from 'next/link';

interface TopbarProps {
  title?: string;
  breadcrumb?: { label: string; href?: string }[];
}

export default function Topbar({ title = 'PORTAL DE GESTIÓN', breadcrumb }: TopbarProps) {
  const [alertasNoLeidas, setAlertasNoLeidas] = useState(0);
  const [perfil, setPerfil] = useState<{ nombre_completo: string, rol: string } | null>(null);

  useEffect(() => {
    const fetchAlerts = () => {
      fetch('/api/alertas')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setAlertasNoLeidas(data.filter(a => a.estado === 'no_leida').length);
          }
        })
        .catch(() => {});
    };

    fetchAlerts(); // Initial fetch
    const interval = setInterval(fetchAlerts, 15000); // Poll every 15s

    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setPerfil(data);
      })
      .catch(() => {});

    return () => clearInterval(interval);
  }, []);

  const formatRol = (rol: string) => {
    switch(rol) {
      case 'administrador': return 'Administrador';
      case 'jefe_mantenimiento': return 'Jefe de Mantenimiento';
      case 'tecnico': return 'Técnico';
      case 'supervisor': return 'Supervisor';
      default: return rol;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="topbar">
      {/* Left: Title / Breadcrumb */}
      <div style={{ flex: 1 }}>
        {breadcrumb ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
            {breadcrumb.map((item, i) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                {i > 0 && <span>/</span>}
                {item.href
                  ? <Link href={item.href} style={{ color: 'var(--on-surface-variant)', textDecoration: 'none' }} className="label-caps">{item.label}</Link>
                  : <span className="label-caps" style={{ color: 'var(--on-surface)' }}>{item.label}</span>
                }
              </span>
            ))}
          </div>
        ) : (
          <span className="font-display" style={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--on-surface)' }}>
            {title}
          </span>
        )}
      </div>

      {/* Center: Search */}
      <div style={{ position: 'relative', maxWidth: 320, flex: 1 }}>
        <Search
          size={15}
          style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--on-surface-variant)' }}
        />
        <input
          type="search"
          placeholder="Buscar vehículo, placa o reporte..."
          className="form-input"
          style={{ paddingLeft: '2rem', fontSize: '0.8rem', height: 36 }}
        />
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link href="/alertas" style={{ position: 'relative', textDecoration: 'none' }}>
          <button className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: 8 }} title="Alertas">
            <Bell size={20} color="var(--on-surface)" strokeWidth={1.75} />
            {alertasNoLeidas > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4,
                background: 'var(--primary-container)',
                color: '#fff',
                fontSize: '0.6rem', fontWeight: 700,
                borderRadius: '50%',
                width: 16, height: 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {alertasNoLeidas}
              </span>
            )}
          </button>
        </Link>

        <button className="btn btn-ghost" style={{ padding: '0.5rem', borderRadius: 8 }} title="Ayuda">
          <HelpCircle size={20} color="var(--on-surface)" strokeWidth={1.75} />
        </button>

        <div style={{ width: 1, height: 28, background: 'var(--surface-container-high)', margin: '0 0.25rem' }} />

        {perfil && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>{formatRol(perfil.rol)}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--on-surface)', fontWeight: 600 }}>{perfil.nombre_completo}</div>
            </div>
            <div style={{
              width: 34, height: 34,
              background: 'var(--surface-container-high)',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'IBM Plex Sans', sans-serif",
              fontWeight: 700, fontSize: '0.875rem',
              color: 'var(--on-surface-variant)',
              border: '2px solid var(--surface-container-highest)',
            }}>
              {getInitials(perfil.nombre_completo)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
