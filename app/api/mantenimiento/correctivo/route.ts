import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const incidencias = await prisma.incidencia.findMany({
      include: {
        vehiculo: true,
        tipo_averia: true,
      },
      orderBy: { fecha_reporte: 'desc' }
    });
    return NextResponse.json(incidencias)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { codigo_incidencia, vehiculo_id, tipo_averia_id, fecha_reporte, kilometraje_actual, descripcion_falla, nivel_gravedad } = body;

    // Crear la incidencia (correctivo)
    const nuevaIncidencia = await prisma.incidencia.create({
      data: {
        codigo_incidencia,
        vehiculo_id,
        tipo_averia_id,
        fecha_reporte: new Date(fecha_reporte),
        kilometraje_actual: parseFloat(kilometraje_actual),
        descripcion_falla,
        estado: 'reportado'
      }
    });

    // RN-02: Generar orden de trabajo automáticamente para el correctivo
    await prisma.ordenTrabajo.create({
      data: {
        codigo: `OT-${codigo_incidencia.split('-')[2] || Date.now().toString().slice(-4)}`,
        vehiculo_id,
        origen: 'correctivo',
        estado: 'pendiente',
        descripcion: `Orden automática generada para la Avería ${codigo_incidencia}: ${descripcion_falla}`,
        incidencia_id: nuevaIncidencia.id
      }
    });

    // RN-05: Si la avería es crítica o el usuario marca inmovilización, cambiar estado del vehículo
    if (nivel_gravedad === 'alta') {
      await prisma.vehiculo.update({
        where: { id: vehiculo_id },
        data: { estado: 'en_mantenimiento' }
      });
    }

    return NextResponse.json(nuevaIncidencia, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
