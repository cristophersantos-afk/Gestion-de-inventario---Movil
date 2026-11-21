
export type TipoMovimiento = 'ENTRADA' | 'SALIDA';

export interface SolicitudMovimiento {
  operacionId: string;
  productoId: string;
  tipo: TipoMovimiento;
  cantidad: number;
}

export interface ResultadoMovimiento {
  estado: 'CONFIRMADO' | 'YA_PROCESADO';
  operacion_id: string;
  existencia_resultante?: number;
}
