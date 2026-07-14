import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const preventivos = await prisma.mantenimientoPreventivo.findMany({
      include: {
        vehiculo: true,
        tipo_mantenimiento: true,
      },
      orderBy: { fecha_programada: 'asc' }
    });
    return NextResponse.json(preventivos)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehiculo_id, tipo_mantenimiento_id, fecha_programada, km_programado, codigo } = body;

    const [year, month, day] = fecha_programada.split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fecha < hoy) {
      return NextResponse.json({ error: 'No se puede programar mantenimientos en el pasado.' }, { status: 400 });
    }

    // Crear el mantenimiento preventivo
    const nuevoPreventivo = await prisma.mantenimientoPreventivo.create({
      data: {
        codigo,
        vehiculo_id,
        tipo_mantenimiento_id,
        fecha_programada: new Date(fecha_programada),
        km_programado: parseInt(km_programado),
        estado: 'pendiente'
      }
    });

    // RN-01: Generar orden de trabajo automáticamente para mantenimientos preventivos pendientes o activos
    await prisma.ordenTrabajo.create({
      data: {
        codigo: `OT-${codigo.split('-')[2] || Date.now().toString().slice(-4)}`,
        vehiculo_id,
        origen: 'preventivo',
        estado: 'pendiente',
        mantenimiento_preventivo_id: nuevoPreventivo.id,
        descripcion: `Orden automática generada para el Mantenimiento Preventivo ${codigo}`,
      }
    });

    return NextResponse.json(nuevoPreventivo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
