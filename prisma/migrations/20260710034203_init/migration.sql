-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre_completo" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehiculo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "placa" TEXT NOT NULL,
    "marca" TEXT NOT NULL,
    "modelo" TEXT NOT NULL,
    "anio" INTEGER NOT NULL,
    "chasis" TEXT NOT NULL,
    "motor" TEXT NOT NULL,
    "tipo_vehiculo" TEXT NOT NULL,
    "capacidad_carga" DOUBLE PRECISION NOT NULL,
    "combustible" TEXT NOT NULL,
    "kilometraje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fecha_adquisicion" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "conductor" TEXT,
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehiculo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoMantenimiento" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "periodicidad_km" INTEGER NOT NULL,
    "periodicidad_dias" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activo',

    CONSTRAINT "TipoMantenimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MantenimientoPreventivo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "vehiculo_id" TEXT NOT NULL,
    "tipo_mantenimiento_id" TEXT NOT NULL,
    "km_programado" DOUBLE PRECISION NOT NULL,
    "fecha_programada" TIMESTAMP(3) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "observaciones" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MantenimientoPreventivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoAveria" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "TipoAveria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incidencia" (
    "id" TEXT NOT NULL,
    "codigo_incidencia" TEXT NOT NULL,
    "vehiculo_id" TEXT NOT NULL,
    "fecha_reporte" TIMESTAMP(3) NOT NULL,
    "kilometraje_actual" DOUBLE PRECISION NOT NULL,
    "tipo_averia_id" TEXT NOT NULL,
    "descripcion_falla" TEXT NOT NULL,
    "diagnostico_tecnico" TEXT,
    "solucion_aplicada" TEXT,
    "responsable_id" TEXT,
    "fecha_inicio" TIMESTAMP(3),
    "fecha_finalizacion" TIMESTAMP(3),
    "costo_reparacion" DOUBLE PRECISION,
    "estado" TEXT NOT NULL DEFAULT 'reportado',
    "observaciones" TEXT,

    CONSTRAINT "Incidencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdenTrabajo" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "origen" TEXT NOT NULL,
    "vehiculo_id" TEXT NOT NULL,
    "mantenimiento_preventivo_id" TEXT,
    "incidencia_id" TEXT,
    "tecnico_asignado_id" TEXT,
    "fecha_asignacion" TIMESTAMP(3),
    "fecha_inicio" TIMESTAMP(3),
    "fecha_finalizacion" TIMESTAMP(3),
    "costo" DOUBLE PRECISION,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "OrdenTrabajo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alerta" (
    "id" TEXT NOT NULL,
    "tipo_alerta" TEXT NOT NULL,
    "vehiculo_id" TEXT,
    "mensaje" TEXT NOT NULL,
    "fecha_generacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nivel" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'no_leida',

    CONSTRAINT "Alerta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_codigo_key" ON "Vehiculo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Vehiculo_placa_key" ON "Vehiculo"("placa");

-- CreateIndex
CREATE UNIQUE INDEX "TipoMantenimiento_codigo_key" ON "TipoMantenimiento"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "MantenimientoPreventivo_codigo_key" ON "MantenimientoPreventivo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "TipoAveria_codigo_key" ON "TipoAveria"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Incidencia_codigo_incidencia_key" ON "Incidencia"("codigo_incidencia");

-- CreateIndex
CREATE UNIQUE INDEX "OrdenTrabajo_codigo_key" ON "OrdenTrabajo"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "OrdenTrabajo_mantenimiento_preventivo_id_key" ON "OrdenTrabajo"("mantenimiento_preventivo_id");

-- CreateIndex
CREATE UNIQUE INDEX "OrdenTrabajo_incidencia_id_key" ON "OrdenTrabajo"("incidencia_id");

-- AddForeignKey
ALTER TABLE "MantenimientoPreventivo" ADD CONSTRAINT "MantenimientoPreventivo_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MantenimientoPreventivo" ADD CONSTRAINT "MantenimientoPreventivo_tipo_mantenimiento_id_fkey" FOREIGN KEY ("tipo_mantenimiento_id") REFERENCES "TipoMantenimiento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidencia" ADD CONSTRAINT "Incidencia_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidencia" ADD CONSTRAINT "Incidencia_tipo_averia_id_fkey" FOREIGN KEY ("tipo_averia_id") REFERENCES "TipoAveria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "Vehiculo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_mantenimiento_preventivo_id_fkey" FOREIGN KEY ("mantenimiento_preventivo_id") REFERENCES "MantenimientoPreventivo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrdenTrabajo" ADD CONSTRAINT "OrdenTrabajo_incidencia_id_fkey" FOREIGN KEY ("incidencia_id") REFERENCES "Incidencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alerta" ADD CONSTRAINT "Alerta_vehiculo_id_fkey" FOREIGN KEY ("vehiculo_id") REFERENCES "Vehiculo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
