import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const usuario = await prisma.usuario.findUnique({
      where: { id }
    });
    if (!usuario) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(usuario)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nombre_completo, rol, contrasena } = body;

    // Optional: update password in Supabase Auth if provided and user has a valid UUID
    if (contrasena && contrasena.trim() !== '') {
      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SECRET_KEY!
        );
        await supabaseAdmin.auth.admin.updateUserById(id, { password: contrasena });
      } catch (e) {
        console.warn('Could not update password in Supabase auth (maybe old mock user without UUID)', e);
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id },
      data: {
        nombre_completo,
        rol,
      }
    });
    return NextResponse.json(usuario);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
