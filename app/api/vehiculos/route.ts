import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const vehiculos = await prisma.vehiculo.findMany({
      orderBy: { creado_en: 'desc' },
      include: {
        _count: {
          select: {
            mantenimientos_preventivos: true,
            incidencias: true,
            ordenes_trabajo: true,
          }
        }
      }
    })
    return NextResponse.json(vehiculos)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { codigo, placa, marca, modelo, anio, chasis, motor, tipo_vehiculo, capacidad_carga, combustible, fecha_adquisicion, kilometraje, origen_matricula, pais_origen, estado, conductor, observaciones } = body

    // 1. Normalizar Placa y validar Origen
    const placaNormalizada = placa.toString().trim().toUpperCase()
    const origen = origen_matricula === 'Importado/Extranjero' ? 'Importado/Extranjero' : 'Nacional'
    
    if (origen === 'Nacional') {
      if (!/^[A-Z]{3}-\d{3,4}$/.test(placaNormalizada)) {
        return NextResponse.json({ error: 'La placa nacional debe tener formato ABC-123 o ABC-1234' }, { status: 400 })
      }
    } else {
      if (!/^[A-Z0-9 -]{4,15}$/.test(placaNormalizada)) {
        return NextResponse.json({ error: 'La placa extranjera debe ser alfanumérica entre 4 y 15 caracteres sin símbolos especiales' }, { status: 400 })
      }
    }

    // 2. Validar Año
    const anioNum = parseInt(anio)
    const maxAnio = new Date().getFullYear() + 1
    if (isNaN(anioNum) || anioNum < 1980 || anioNum > maxAnio) {
      return NextResponse.json({ error: `El año debe estar entre 1980 y ${maxAnio}` }, { status: 400 })
    }

    // 3. Validar Kilometraje
    const kmNum = Math.floor(parseFloat(kilometraje || '0'))
    if (isNaN(kmNum) || kmNum < 0) {
      return NextResponse.json({ error: 'El kilometraje debe ser un número entero mayor o igual a cero' }, { status: 400 })
    }

    // 4. Validar Capacidad de Carga
    const cargaNum = parseFloat(capacidad_carga)
    const maxCarga = (tipo_vehiculo === 'Cama baja' || tipo_vehiculo === 'Plataforma extra pesada') ? 80 : 60
    if (isNaN(cargaNum) || cargaNum < 0.1 || cargaNum > maxCarga) {
      return NextResponse.json({ error: `La capacidad de carga debe estar entre 0.1 y ${maxCarga} toneladas para este tipo de vehículo` }, { status: 400 })
    }

    // 5. Validar Duplicados
    const existente = await prisma.vehiculo.findFirst({
      where: { OR: [{ placa: placaNormalizada }, { codigo }] }
    })
    if (existente) {
      return NextResponse.json({ error: 'Ya existe un vehículo con esta placa o código interno' }, { status: 400 })
    }

    const nuevoVehiculo = await prisma.vehiculo.create({
      data: {
        codigo,
        placa: placaNormalizada,
        marca,
        modelo,
        anio: anioNum,
        chasis,
        motor,
        tipo_vehiculo,
        capacidad_carga: cargaNum,
        combustible,
        kilometraje: kmNum,
        fecha_adquisicion: new Date(fecha_adquisicion),
        origen_matricula: origen,
        pais_origen: origen === 'Importado/Extranjero' ? pais_origen : null,
        estado: estado || 'activo',
        conductor,
        observaciones
      }
    })

    return NextResponse.json(nuevoVehiculo, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
