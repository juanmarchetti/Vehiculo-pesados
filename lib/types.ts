// ============================================================
// SIGMANT — Interfaces TypeScript (SRS §3.4)
// TRANSNUPERSA S.A.
// ============================================================

// ── Roles ────────────────────────────────────────────────────
export type Rol =
  | 'administrador'
  | 'jefe_mantenimiento'
  | 'tecnico'
  | 'supervisor';

// ── Estado general ───────────────────────────────────────────
export type EstadoUsuario = 'activo' | 'inactivo';

export type EstadoVehiculo =
  | 'activo'
  | 'en_mantenimiento'
  | 'fuera_de_servicio'
  | 'inactivo';

export type EstadoMantenimiento =
  | 'pendiente'
  | 'en_proceso'
  | 'completado'
  | 'cancelado';

export type EstadoIncidencia =
  | 'reportado'
  | 'en_reparacion'
  | 'solucionado'
  | 'cancelado';

export type EstadoOrden = 'pendiente' | 'en_proceso' | 'finalizado';

export type OrigenOrden = 'preventivo' | 'correctivo';

export type NivelAlerta = 'informativo' | 'advertencia' | 'critico';

export type EstadoAlerta = 'no_leida' | 'atendida';

export type TipoAlerta =
  | 'mantenimiento_proximo'
  | 'mantenimiento_vencido'
  | 'falla_critica'
  | 'orden_trabajo'
  | 'operativa';

export type TipoCombustible = 'diesel' | 'gasolina' | 'otro';

// ── Entidades ─────────────────────────────────────────────────

/** SRS §3.4.1 */
export interface Usuario {
  id: string;
  nombre_completo: string;
  correo: string;
  rol: Rol;
  estado: EstadoUsuario;
  fecha_creacion: string;
}

/** SRS §3.4.2 */
export interface Vehiculo {
  id: string;
  codigo: string;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  chasis: string;
  motor: string;
  tipo_vehiculo: string;
  capacidad_carga: number; // toneladas
  combustible: TipoCombustible;
  kilometraje: number;
  fecha_adquisicion: string;
  estado: EstadoVehiculo;
  conductor?: string;
  observaciones?: string;
  ultimo_mantenimiento?: string;
  proximo_mantenimiento?: string;
}

/** SRS §3.4.3 */
export interface TipoMantenimiento {
  id: string;
  codigo: string; // MT001…
  nombre: string;
  descripcion: string;
  periodicidad_km: number;
  periodicidad_dias: number;
  estado: 'activo' | 'inactivo';
}

/** SRS §3.4.4 */
export interface MantenimientoPreventivo {
  id: string;
  codigo: string;
  vehiculo_id: string;
  vehiculo_placa: string;
  tipo_mantenimiento_id: string;
  tipo_mantenimiento_nombre: string;
  km_programado: number;
  fecha_programada: string;
  estado: EstadoMantenimiento;
  observaciones?: string;
  orden_trabajo_id?: string;
  fecha_creacion: string;
}

/** SRS §3.4.5 */
export interface TipoAveria {
  id: string;
  codigo: string; // AV001…
  nombre: string;
}

/** SRS §3.4.6 */
export interface Incidencia {
  id: string;
  codigo_incidencia: string;
  vehiculo_id: string;
  vehiculo_placa: string;
  fecha_reporte: string;
  kilometraje_actual: number;
  tipo_averia_id: string;
  tipo_averia_nombre: string;
  descripcion_falla: string;
  diagnostico_tecnico?: string;
  solucion_aplicada?: string;
  responsable_id?: string;
  responsable_nombre?: string;
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  costo_reparacion?: number;
  estado: EstadoIncidencia;
  observaciones?: string;
  orden_trabajo_id?: string;
}

/** SRS §3.4.7 */
export interface OrdenTrabajo {
  id: string;
  codigo: string;
  origen: OrigenOrden;
  referencia_origen_id: string;
  vehiculo_id: string;
  vehiculo_placa: string;
  vehiculo_marca_modelo: string;
  tecnico_asignado_id?: string;
  tecnico_asignado_nombre?: string;
  fecha_asignacion?: string;
  fecha_inicio?: string;
  fecha_finalizacion?: string;
  costo?: number;
  estado: EstadoOrden;
  descripcion: string;
}

/** SRS §3.4.8 */
export interface Alerta {
  id: string;
  tipo_alerta: TipoAlerta;
  vehiculo_id?: string;
  vehiculo_placa?: string;
  mensaje: string;
  fecha_generacion: string;
  nivel: NivelAlerta;
  estado: EstadoAlerta;
}

/** Registro de historial de mantenimiento */
export interface HistorialItem {
  id: string;
  vehiculo_id: string;
  vehiculo_placa: string;
  tipo: 'preventivo' | 'correctivo';
  fecha: string;
  descripcion: string;
  tecnico_nombre?: string;
  costo: number;
  estado: 'completado' | 'solucionado';
  km_en_intervencion: number;
}

/** Recomendación IA (SRS §3.2.10) */
export interface Recomendacion {
  id: string;
  vehiculo_id: string;
  descripcion: string;
  criterio: string; // "Basado en 5 incidencias previas"
  nivel_confianza: number; // 0-100
  tipo_averia_relacionada?: string;
  estado: 'pendiente' | 'aceptada' | 'descartada' | 'aplicada';
  fecha_generacion: string;
}
