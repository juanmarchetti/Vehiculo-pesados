import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    
    const preventivo = await prisma.mantenimientoPreventivo.findUnique({
      where: { id },
      include: {
        vehiculo: true,
        tipo_mantenimiento: true,
      }
    });
    
    if (!preventivo) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json(preventivo);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    const body = await request.json();
    const { vehiculo_id, tipo_mantenimiento_id, fecha_programada, km_programado, observaciones } = body;

    const [year, month, day] = fecha_programada.split('-');
    const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fecha < hoy) {
      return NextResponse.json({ error: 'No se puede reprogramar a una fecha en el pasado.' }, { status: 400 });
    }

    const actualizado = await prisma.mantenimientoPreventivo.update({
      where: { id },
      data: {
        vehiculo_id,
        tipo_mantenimiento_id,
        fecha_programada: fecha,
        km_programado: parseInt(km_programado),
        observaciones
      }
    });

    return NextResponse.json(actualizado);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Primero eliminar la orden de trabajo asociada
    await prisma.ordenTrabajo.deleteMany({
      where: { mantenimiento_preventivo_id: id }
    });

    // Luego eliminar el mantenimiento preventivo
    await prisma.mantenimientoPreventivo.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
