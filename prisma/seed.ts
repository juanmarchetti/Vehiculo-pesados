import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding data...')

  // 1. Tipos de Mantenimiento Preventivo
  const mantenimientos = [
    { codigo: 'MT001', nombre: 'Mantenimiento de 15,000 km', descripcion: 'Cambio de aceite, filtros y revisión de frenos básicos.', periodicidad_km: 15000, periodicidad_dias: 90 },
    { codigo: 'MT002', nombre: 'Mantenimiento de 30,000 km', descripcion: 'MT001 + cambio de líquido de frenos y revisión de sistema eléctrico.', periodicidad_km: 30000, periodicidad_dias: 180 },
    { codigo: 'MT003', nombre: 'Mantenimiento de 60,000 km', descripcion: 'Mantenimiento mayor, revisión de transmisión y suspensión.', periodicidad_km: 60000, periodicidad_dias: 360 },
  ]

  for (const mt of mantenimientos) {
    await prisma.tipoMantenimiento.upsert({
      where: { codigo: mt.codigo },
      update: {},
      create: mt,
    })
  }

  // 2. Tipos de Avería (Correctivo)
  const averias = [
    { codigo: 'AV001', nombre: 'Sistema de frenos' },
    { codigo: 'AV002', nombre: 'Falla de motor' },
    { codigo: 'AV003', nombre: 'Sistema eléctrico' },
    { codigo: 'AV004', nombre: 'Suspensión y dirección' },
    { codigo: 'AV005', nombre: 'Neumáticos' },
  ]

  for (const av of averias) {
    await prisma.tipoAveria.upsert({
      where: { codigo: av.codigo },
      update: {},
      create: av,
    })
  }

  console.log('Seed completo.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
