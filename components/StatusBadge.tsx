interface StatusBadgeProps {
  estado: string;
  showDot?: boolean;
}

export default function StatusBadge({ estado, showDot = true }: StatusBadgeProps) {
  const key = estado.toLowerCase().replace(/\s+/g, '_');
  
  // Format state nicely
  let label = estado;
  if (key === 'en_ruta') label = 'En Ruta';
  else if (key === 'en_mantenimiento') label = 'En Taller';
  else if (key === 'activo') label = 'Activo';
  else if (key === 'inactivo') label = 'Inactivo';
  else if (key === 'pendiente') label = 'Pendiente';
  else if (key === 'en_proceso') label = 'En Proceso';
  else if (key === 'finalizado') label = 'Finalizado';
  else if (key === 'reportado') label = 'Reportado';
  else if (key === 'en_reparacion') label = 'En Reparación';
  else if (key === 'solucionado') label = 'Solucionado';
  else if (key === 'cancelado') label = 'Cancelado';
  else label = estado.charAt(0).toUpperCase() + estado.slice(1).replace(/_/g, ' ');

  return (
    <span className={`badge badge-${key}`}>
      {showDot && <span className="badge-dot" />}
      {label}
    </span>
  );
}
