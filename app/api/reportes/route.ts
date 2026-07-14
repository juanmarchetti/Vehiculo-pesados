import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const vehiculos = await prisma.vehiculo.findMany();
    const incidencias = await prisma.incidencia.findMany({ include: { tipo_averia: true } });
    const ordenes = await prisma.ordenTrabajo.findMany({ include: { vehiculo: true } });

    // 1. fallasPorVehiculo
    const fallasPorVehiculo = vehiculos.slice(0, 6).map(v => ({
      placa: v.placa,
      fallas: incidencias.filter(i => i.vehiculo_id === v.id).length,
    }));

    // 2. fallasPorTipo
    const tipos = await prisma.tipoAveria.findMany();
    const fallasPorTipo = tipos.slice(0, 6).map(t => {
      let count = incidencias.filter(i => i.tipo_averia_id === t.id).length;
      return { nombre: t.nombre, cantidad: count };
    });

    // 3. costosPorVehiculo
    const costosPorVehiculo = vehiculos.slice(0, 6).map(v => {
      const prev = ordenes.filter(o => o.vehiculo_id === v.id && o.origen === 'preventivo').reduce((s, o) => s + (o.costo || 0), 0);
      const corr = ordenes.filter(o => o.vehiculo_id === v.id && o.origen === 'correctivo').reduce((s, o) => s + (o.costo || 0), 0);
      return {
        placa: v.placa,
        preventivo: prev,
        correctivo: corr,
      };
    });

    // 4. tendenciaMeses
    // (Ideally grouping real orders by month, but setting to 0 for now as requested instead of mock)
    const tendenciaMeses = ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene'].map((mes) => ({
      mes,
      programados: 0,
      realizados: 0,
    }));

    // 5. disponibilidad
    const activos = vehiculos.filter(v => v.estado === 'activo').length;
    const taller = vehiculos.filter(v => v.estado === 'en_mantenimiento').length;
    const critico = vehiculos.filter(v => v.estado === 'fuera_de_servicio').length;
    
    const disponibilidad = vehiculos.length > 0 ? [
      { name: 'Activos', value: activos, color: '#10b981' },
      { name: 'En Mantenimiento', value: taller, color: '#f59e0b' },
      { name: 'Fuera de Servicio', value: critico, color: '#ef4444' },
    ] : [];

    return NextResponse.json({
      fallasPorVehiculo,
      fallasPorTipo,
      costosPorVehiculo,
      tendenciaMeses,
      disponibilidad
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
