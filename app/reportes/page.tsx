'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { FileDown, FileSpreadsheet, TrendingUp, AlertTriangle, Truck } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

const COLORS = ['#ff7a1a', '#2b638c', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function ReportesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch('/api/reportes')
      .then(res => res.json())
      .then(resData => {
        setData(resData);
        setLoading(false);
      });
  }, []);

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Fallas por Vehículo
    const fallasVehiculoWS = XLSX.utils.json_to_sheet(data.fallasPorVehiculo);
    XLSX.utils.book_append_sheet(wb, fallasVehiculoWS, "Fallas por Vehículo");

    // Hoja 2: Costos por Vehículo
    const costosWS = XLSX.utils.json_to_sheet(data.costosPorVehiculo);
    XLSX.utils.book_append_sheet(wb, costosWS, "Costos por Vehículo");

    // Hoja 3: Cumplimiento
    const cumplimientoWS = XLSX.utils.json_to_sheet(data.tendenciaMeses);
    XLSX.utils.book_append_sheet(wb, cumplimientoWS, "Cumplimiento Mensual");

    XLSX.writeFile(wb, `Reporte_Mantenimiento_SIGMANT_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF('p', 'pt', 'a4');
      doc.setFontSize(18);
      doc.text("Reporte de Mantenimiento - SIGMANT", 40, 40);
      doc.setFontSize(10);
      doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 40, 60);

      // Capture charts container
      const chartsEl = document.getElementById('charts-container');
      if (chartsEl) {
        const canvas = await html2canvas(chartsEl, { scale: 1.5, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = doc.internal.pageSize.getWidth() - 80;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        doc.addImage(imgData, 'PNG', 40, 80, pdfWidth, pdfHeight);
      }
      
      doc.save(`Reporte_Mantenimiento_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch(err) {
      alert("Error al generar PDF");
    } finally {
      setExporting(false);
    }
  };

  if (loading || !data) {
    return (
      <AppLayout breadcrumb={[{ label: 'Reportes y Estadísticas' }]}>
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
          Cargando reportes de la base de datos...
        </div>
      </AppLayout>
    );
  }

  const { fallasPorVehiculo, fallasPorTipo, costosPorVehiculo, tendenciaMeses, disponibilidad } = data;

  const totalFallas = fallasPorVehiculo.reduce((s: number, v: any) => s + v.fallas, 0);
  const costoTotal = costosPorVehiculo.reduce((s: number, v: any) => s + v.preventivo + v.correctivo, 0);
  const porcentajeActivos = disponibilidad.find((d: any) => d.name === 'Activos')?.value || 0;

  return (
    <AppLayout breadcrumb={[{ label: 'Reportes y Estadísticas' }]}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="headline-lg" style={{ color: 'var(--on-surface)', marginBottom: '0.25rem' }}>
            Reportes y Estadísticas
          </h1>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
            Indicadores de gestión de la flota — Datos en tiempo real de la Base de Datos.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={exportToExcel} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button onClick={exportToPDF} disabled={exporting} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', opacity: exporting ? 0.7 : 1 }}>
            <FileDown size={16} /> {exporting ? 'Generando...' : 'PDF'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,122,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle color="var(--primary-container)" size={24} />
          </div>
          <div>
            <div className="label-caps" style={{ color: 'var(--on-surface-variant)' }}>Fallas Totales</div>
            <div className="headline-lg" style={{ color: 'var(--on-surface)' }}>{totalFallas}</div>
          </div>
        </div>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp color="#10b981" size={24} />
          </div>
          <div>
            <div className="label-caps" style={{ color: 'var(--on-surface-variant)' }}>Costo Total</div>
            <div className="headline-lg" style={{ color: 'var(--on-surface)' }}>${costoTotal.toLocaleString()}</div>
          </div>
        </div>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(43,99,140,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck color="var(--tertiary)" size={24} />
          </div>
          <div>
            <div className="label-caps" style={{ color: 'var(--on-surface-variant)' }}>Flota Activa</div>
            <div className="headline-lg" style={{ color: 'var(--on-surface)' }}>{porcentajeActivos}%</div>
          </div>
        </div>
      </div>

      <div id="charts-container">
        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          {/* Fallas por vehículo */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 className="headline-md" style={{ fontSize: '0.9rem', color: 'var(--on-surface)', marginBottom: '1rem' }}>
              Fallas por Vehículo
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={fallasPorVehiculo} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container-high)" />
                <XAxis dataKey="placa" tick={{ fontSize: 11, fontFamily: 'IBM Plex Mono', fill: 'var(--on-surface-variant)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--on-surface-variant)' }} />
                <Tooltip
                  contentStyle={{ background: 'var(--nav-bg)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  cursor={{ fill: 'rgba(255,122,26,0.08)' }}
                />
                <Bar dataKey="fallas" fill="var(--primary-container)" radius={[4, 4, 0, 0]} name="Fallas" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fallas por tipo */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 className="headline-md" style={{ fontSize: '0.9rem', color: 'var(--on-surface)', marginBottom: '1rem' }}>
              Fallas por Tipo de Avería
            </h2>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={fallasPorTipo} dataKey="cantidad" nameKey="nombre" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                    {fallasPorTipo.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'var(--nav-bg)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {fallasPorTipo.map((f: any, i: number) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ fontSize: '0.78rem', color: 'var(--on-surface)' }}>{f.nombre}</span>
                    </div>
                    <span className="technical-data" style={{ fontWeight: 700, color: 'var(--on-surface)' }}>{f.cantidad}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          {/* Costos */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 className="headline-md" style={{ fontSize: '0.9rem', color: 'var(--on-surface)', marginBottom: '1rem' }}>
              Costos de Mantenimiento por Vehículo
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={costosPorVehiculo} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container-high)" />
                <XAxis dataKey="placa" tick={{ fontSize: 10, fontFamily: 'IBM Plex Mono', fill: 'var(--on-surface-variant)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--on-surface-variant)' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ background: 'var(--nav-bg)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }}
                  formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, '']}
                  cursor={{ fill: 'rgba(255,122,26,0.06)' }}
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="preventivo" stackId="a" fill="#10b981" name="Preventivo" radius={[0, 0, 0, 0]} />
                <Bar dataKey="correctivo" stackId="a" fill="var(--primary-container)" name="Correctivo" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Disponibilidad */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 className="headline-md" style={{ fontSize: '0.9rem', color: 'var(--on-surface)', marginBottom: '1rem' }}>
              Disponibilidad de Flota
            </h2>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={disponibilidad} dataKey="value" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {disponibilidad.map((d: any, i: number) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--nav-bg)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ marginTop: '0.5rem' }}>
              {disponibilidad.map((d: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--on-surface)' }}>{d.name}</span>
                  </div>
                  <span className="technical-data" style={{ fontWeight: 700 }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Cumplimiento */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <h2 className="headline-md" style={{ fontSize: '0.9rem', color: 'var(--on-surface)', marginBottom: '1rem' }}>
            Mantenimientos Realizados vs. Programados
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={tendenciaMeses}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--surface-container-high)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'var(--on-surface-variant)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--on-surface-variant)' }} />
              <Tooltip contentStyle={{ background: 'var(--nav-bg)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="programados" stroke="var(--tertiary)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--tertiary)' }} name="Programados" />
              <Line type="monotone" dataKey="realizados" stroke="var(--primary-container)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--primary-container)' }} name="Realizados" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppLayout>
  );
}
