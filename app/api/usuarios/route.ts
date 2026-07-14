import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { nombre_completo: 'asc' }
    });
    return NextResponse.json(usuarios)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nombre_completo, correo, rol, contrasena } = body;

    // Create user in Supabase Auth first
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: correo,
      password: contrasena,
      email_confirm: true,
    });

    if (authError) {
      throw new Error(authError.message);
    }

    // Create user in Prisma DB with the same ID as Supabase Auth
    const usuario = await prisma.usuario.create({
      data: {
        id: authData.user.id,
        nombre_completo,
        correo,
        rol,
        estado: 'activo'
      }
    });
    
    return NextResponse.json(usuario, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, estado } = body;
    const usuario = await prisma.usuario.update({
      where: { id },
      data: { estado }
    });
    return NextResponse.json(usuario);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
