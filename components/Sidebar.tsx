'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Truck, Wrench, ClipboardList, History,
  BarChart3, Bell, Settings, LogOut, PlusCircle, BookOpen,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Panel Control' },
  { href: '/flota', icon: Truck, label: 'Flota' },
  { href: '/mantenimiento/preventivo', icon: Wrench, label: 'Mantenimiento' },
  { href: '/ordenes', icon: ClipboardList, label: 'Órdenes de Trabajo' },
  { href: '/historial', icon: History, label: 'Historial' },
  { href: '/reportes', icon: BarChart3, label: 'Reportes' },
  { href: '/alertas', icon: Bell, label: 'Alertas' },
];

const settingsItems = [
  { href: '/configuracion/usuarios', icon: Settings, label: 'Configuración' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setUserRole(data.rol);
      })
      .catch(() => {});
  }, []);

  const isActive = (href: string) => {
    if (href === '/mantenimiento/preventivo') {
      return pathname.startsWith('/mantenimiento');
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ padding: '1.25rem 1.25rem 0.75rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
          <div style={{
            width: 40, height: 40,
            background: 'var(--primary-container)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <Truck size={20} color="#fff" />
          </div>
          <div>
            <div className="font-display" style={{ color: 'var(--nav-text-active)', fontSize: '1.25rem', fontWeight: 800, lineHeight: 1, letterSpacing: '0.06em' }}>
              SIGMANT
            </div>
            <div style={{ color: '#8a9098', fontSize: '0.65rem', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 2 }}>
              Gestión Vehicular
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, paddingTop: '0.5rem' }}>
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`nav-item ${isActive(href) ? 'active' : ''}`}
          >
            <Icon size={18} strokeWidth={1.75} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      {/* New Report Button */}
      <div style={{ padding: '0.75rem 1rem' }}>
        <Link
          href="/mantenimiento/correctivo/nuevo"
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center', borderRadius: 8 }}
        >
          <PlusCircle size={16} />
          Nuevo Reporte
        </Link>
      </div>

      {/* Bottom items */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}>
        {userRole === 'administrador' && settingsItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} className={`nav-item ${isActive(href) ? 'active' : ''}`}>
            <Icon size={18} strokeWidth={1.75} />
            <span>{label}</span>
          </Link>
        ))}
        <button 
          onClick={async () => {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            await supabase.auth.signOut();
            window.location.href = '/login';
          }}
          className="nav-item" 
          style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
        >
          <LogOut size={18} strokeWidth={1.75} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
