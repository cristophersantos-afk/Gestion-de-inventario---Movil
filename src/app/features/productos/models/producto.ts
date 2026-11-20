
export interface Producto {
  id: string;
  nombre: string;
  marca: string | null;
  descripcion: string | null;
  categoria: string | null;
  precio_venta: number;
  existencia: number;
  stock_minimo: number;
  foto_path: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface NuevoProducto {
  nombre: string;
  precio_venta: number;
  existencia_inicial: number;
  stock_minimo: number;
  marca?: string;
  descripcion?: string;
  categoria?: string;
}


export interface EdicionProducto {
  nombre: string;
  marca: string | null;
  descripcion: string | null;
  categoria: string | null;
  precio_venta: number;
  stock_minimo: number;
}

