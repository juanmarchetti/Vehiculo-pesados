import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const body = await request.json()
    
    // Update the work order
    const orden = await prisma.ordenTrabajo.update({
      where: { id },
      data: body,
      include: { vehiculo: true }
    });

    // If order is completed, update vehicle status to 'activo' if it was in maintenance
    if (body.estado === 'finalizado') {
      await prisma.vehiculo.update({
        where: { id: orden.vehiculo_id },
        data: { estado: 'activo' }
      });
      // also update the underlying preventivo or correctivo if needed, but keeping it simple for now
    }

    return NextResponse.json(orden)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
