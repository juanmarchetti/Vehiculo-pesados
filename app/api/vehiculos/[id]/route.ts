import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vehiculo = await prisma.vehiculo.findUnique({
      where: { id },
      include: {
        mantenimientos_preventivos: {
          include: { tipo_mantenimiento: true },
          orderBy: { fecha_programada: 'desc' }
        },
        incidencias: {
          include: { tipo_averia: true },
          orderBy: { fecha_reporte: 'desc' }
        },
        ordenes_trabajo: {
          orderBy: { fecha_inicio: 'desc' }
        },
        alertas: {
          orderBy: { fecha_generacion: 'desc' }
        }
      }
    })
    
    if (!vehiculo) return NextResponse.json({ error: 'Vehículo no encontrado' }, { status: 404 })
      
    return NextResponse.json(vehiculo)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json()
    // RN-07: Validate mileage goes up
    if (body.kilometraje) {
      const current = await prisma.vehiculo.findUnique({ where: { id }, select: { kilometraje: true } })
      if (current && body.kilometraje < current.kilometraje) {
        return NextResponse.json({ error: 'El kilometraje no puede ser menor al actual' }, { status: 400 })
      }
    }

    const vehiculo = await prisma.vehiculo.update({
      where: { id },
      data: body
    })
    return NextResponse.json(vehiculo)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // RN-06: Logical delete
    const vehiculo = await prisma.vehiculo.update({
      where: { id },
      data: { estado: 'inactivo' }
    })
    return NextResponse.json(vehiculo)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
