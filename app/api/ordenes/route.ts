import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const ordenes = await prisma.ordenTrabajo.findMany({
      include: {
        vehiculo: true,
      }
    });
    return NextResponse.json(ordenes)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
