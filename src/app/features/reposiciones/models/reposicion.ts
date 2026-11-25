
export type EstadoReposicion =
  'SOLICITADO' | 'FINALIZADO';

export interface Reposicion {
  id: string;
  producto_id: string;
  usuario_id: string;
  estado: EstadoReposicion;
  solicitado_en: string;
  finalizado_en: string | null;
}

export interface ReposicionPendiente extends Reposicion {
  producto: {
    id: string;
    nombre: string;
    existencia: number;
    stock_minimo: number;
  };
}
