import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const vehiculos = await prisma.vehiculo.findMany();
    const vehiculosCriticos = vehiculos.filter(v => v.estado === 'fuera_de_servicio').length;
    const vehiculosTaller = vehiculos.filter(v => v.estado === 'en_mantenimiento').length;
    const vehiculosOperativos = vehiculos.filter(v => v.estado === 'activo').length;

    const ordenesPendientes = await prisma.ordenTrabajo.count({
      where: { estado: 'pendiente' }
    });

    const preventivosProximos = await prisma.mantenimientoPreventivo.findMany({
      where: { estado: 'pendiente' },
      include: {
        vehiculo: true,
        tipo_mantenimiento: true,
      },
      orderBy: { fecha_programada: 'asc' },
      take: 5
    });

    const alertasActivas = await prisma.alerta.findMany({
      where: { estado: 'no_leida' },
      include: { vehiculo: true },
      orderBy: { fecha_generacion: 'desc' },
      take: 4
    });

    return NextResponse.json({
      kpis: {
        vehiculosCriticos,
        vehiculosTaller,
        vehiculosOperativos,
        ordenesPendientes,
      },
      proximosMantenimientos: preventivosProximos,
      alertasRecientes: alertasActivas,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
