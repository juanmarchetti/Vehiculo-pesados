'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import KPICard from '@/components/KPICard';
import AlertItem from '@/components/AlertItem';
import StatusBadge from '@/components/StatusBadge';
import { Truck, Wrench, AlertOctagon, Clock, Activity } from 'lucide-react';
import Link from 'next/link';

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function isToday(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  return d.toDateString() === today.toDateString();
}

function isVencido(iso: string) {
  return new Date(iso) < new Date();
}

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <AppLayout breadcrumb={[{ label: 'Dashboard' }]}>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
          Cargando métricas de la base de datos...
        </div>
      </AppLayout>
    );
  }

  const { kpis, proximosMantenimientos, alertasRecientes } = data;

  return (
    <AppLayout breadcrumb={[{ label: 'Dashboard' }]}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
          Resumen Operativo
        </h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
          Estado general de la flota en tiempo real.
        </p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <KPICard
          title="Vehículos Operativos"
          value={String(kpis.vehiculosOperativos).padStart(2, '0')}
          unit="UNIDADES"
          subtitle="En ruta activa"
          subtitleColor="var(--status-active-text)"
          icon={<Truck size={22} color="var(--status-active-text)" />}
          iconBg="var(--status-active-bg)"
          trend="up"
        />
        <KPICard
          title="En Mantenimiento"
          value={String(kpis.vehiculosTaller).padStart(2, '0')}
          unit="TALLER"
          subtitle="En reparación actual"
          subtitleColor="var(--status-taller-text)"
          icon={<Wrench size={22} color="var(--status-taller-text)" />}
          iconBg="var(--status-taller-bg)"
          trend="neutral"
        />
        <KPICard
          title="Fuera de Servicio"
          value={String(kpis.vehiculosCriticos).padStart(2, '0')}
          unit="CRÍTICO"
          subtitle="Requiere acción inmediata"
          subtitleColor="var(--status-critico-text)"
          icon={<AlertOctagon size={22} color="var(--status-critico-text)" />}
          iconBg="var(--status-critico-bg)"
          trend="down"
        />
        <KPICard
          title="Órdenes Pendientes"
          value={String(kpis.ordenesPendientes).padStart(2, '0')}
          unit="PENDIENTES"
          subtitle="Tareas por asignar"
          subtitleColor="var(--status-vencido-text)"
          icon={<Clock size={22} color="var(--status-vencido-text)" />}
          iconBg="var(--status-vencido-bg)"
          trend="down"
        />
      </div>

      {/* Bottom grid: Alertas + Próximos mantenimientos */}
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1rem' }}>

        {/* Alertas Recientes */}
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} color="#ef4444" />
              <h2 className="headline-md" style={{ color: 'var(--on-surface)', fontSize: '1rem' }}>
                Alertas LIVE
              </h2>
            </div>
            <span style={{
              background: '#ef4444', color: '#fff',
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.05em',
              padding: '0.2rem 0.5rem', borderRadius: 4,
            }}>
              {alertasRecientes.length} ACTIVAS
            </span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alertasRecientes.length > 0 ? alertasRecientes.map((a: any) => (
              <AlertItem key={a.id} nivel={a.nivel} placa={a.vehiculo?.placa || 'Sistema'} mensaje={a.mensaje} tiempo={new Date(a.fecha_generacion).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} />
            )) : (
              <div style={{ textAlign: 'center', color: 'var(--on-surface-variant)', fontSize: '0.875rem', marginTop: '1rem' }}>
                No hay alertas activas en el sistema.
              </div>
            )}
          </div>
          <Link href="/alertas" style={{
            display: 'block', textAlign: 'center', marginTop: '1.5rem',
            fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary-container)',
            textDecoration: 'none', letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            Ver Todo el Historial →
          </Link>
        </div>

        {/* Próximos Mantenimientos */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: '1rem', paddingBottom: '0.875rem',
            borderBottom: '1px solid var(--surface-container-high)',
            background: 'var(--nav-bg)',
            margin: '-1.25rem -1.25rem 1rem',
            padding: '1rem 1.25rem',
            borderRadius: '12px 12px 0 0',
          }}>
            <h2 className="font-display" style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, letterSpacing: '0.06em' }}>
              PRÓXIMOS MANTENIMIENTOS
            </h2>
            <Link href="/mantenimiento/preventivo" className="btn btn-primary" style={{ padding: '0.25rem 0.625rem', fontSize: '0.75rem' }}>
              VER TODOS
            </Link>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Placa / Unidad</th>
                <th>Tipo Servicio</th>
                <th>Fecha Programada</th>
                <th>KM Objetivo</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {proximosMantenimientos.length > 0 ? proximosMantenimientos.map((mp: any) => {
                const vencido = isVencido(mp.fecha_programada);
                const today = isToday(mp.fecha_programada);
                return (
                  <tr key={mp.id}>
                    <td>
                      <div>
                        <Link href={`/flota/${mp.vehiculo_id}`} style={{ textDecoration: 'none' }}>
                          <span className="placa-chip">{mp.vehiculo?.placa || 'N/A'}</span>
                        </Link>
                        {mp.vehiculo && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: 3 }}>
                            {mp.vehiculo.marca} {mp.vehiculo.modelo.split(' ')[0]}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--on-surface)' }}>
                      {mp.tipo_mantenimiento?.nombre || mp.tipo_mantenimiento_id}
                    </td>
                    <td className="technical-data" style={{ color: 'var(--on-surface)' }}>
                      {formatDate(mp.fecha_programada)}
                    </td>
                    <td className="technical-data" style={{ color: vencido ? '#ef4444' : 'var(--on-surface)' }}>
                      {mp.km_programado.toLocaleString()} KM
                    </td>
                    <td>
                      {vencido ? (
                        <span className="badge badge-vencido"><span className="badge-dot" />Vencido</span>
                      ) : today ? (
                        <span className="badge badge-taller"><span className="badge-dot" />Hoy</span>
                      ) : (
                        <span className="badge badge-pendiente"><span className="badge-dot" />Pendiente</span>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--on-surface-variant)' }}>
                    No hay mantenimientos preventivos pendientes en la base de datos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
