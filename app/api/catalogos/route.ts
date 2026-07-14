import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const tiposMantenimiento = await prisma.tipoMantenimiento.findMany();
    const tiposAveria = await prisma.tipoAveria.findMany();

    return NextResponse.json({
      tiposMantenimiento,
      tiposAveria
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
