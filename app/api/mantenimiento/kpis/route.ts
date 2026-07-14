import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const proximos = await prisma.mantenimientoPreventivo.count({
      where: { estado: 'pendiente' }
    });

    const ordenesActivas = await prisma.ordenTrabajo.count({
      where: { estado: { in: ['pendiente', 'en_proceso'] } }
    });

    const totalMP = await prisma.mantenimientoPreventivo.count();
    const completadosMP = await prisma.mantenimientoPreventivo.count({
      where: { estado: 'finalizado' }
    });
    
    const cumplimiento = totalMP === 0 ? 100 : Math.round((completadosMP / totalMP) * 100);

    return NextResponse.json({
      proximo_vencimiento: proximos,
      ordenes_activas: ordenesActivas,
      cumplimiento_mp: cumplimiento
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
