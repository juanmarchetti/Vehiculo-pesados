import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const alertas = await prisma.alerta.findMany({
      include: {
        vehiculo: true,
      },
      orderBy: { fecha_generacion: 'desc' }
    });
    return NextResponse.json(alertas)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// Endpoint to mark alert as read
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, estado } = body;
    
    if (id) {
      const alerta = await prisma.alerta.update({
        where: { id },
        data: { estado }
      });
      return NextResponse.json(alerta);
    } else {
      // Mark all as read
      await prisma.alerta.updateMany({
        where: { estado: 'no_leida' },
        data: { estado: 'leida' }
      });
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
