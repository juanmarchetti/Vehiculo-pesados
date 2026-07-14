import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    // Solo mostramos historial de ordenes finalizadas
    const ordenes = await prisma.ordenTrabajo.findMany({
      where: { estado: 'finalizado' },
      include: {
        vehiculo: true,
      },
      orderBy: { fecha_asignacion: 'desc' }
    });

    const historialItems = ordenes.map(ot => ({
      id: ot.id,
      vehiculo_id: ot.vehiculo_id,
      vehiculo_placa: ot.vehiculo?.placa,
      tipo: ot.origen, // 'preventivo' o 'correctivo'
      fecha: ot.fecha_finalizacion || ot.fecha_asignacion || new Date().toISOString(),
      km_en_intervencion: ot.vehiculo?.kilometraje || 0, // Should ideally be a snapshot, but using current for simplicity
      costo: ot.costo || 0,
      descripcion: ot.descripcion,
      tecnico_asignado_id: ot.tecnico_asignado_id,
      tecnico_nombre: 'Técnico Externo' // Resolved in frontend instead
    }));

    return NextResponse.json(historialItems)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
