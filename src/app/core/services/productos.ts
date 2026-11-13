
import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase';

import {
  Producto,
  NuevoProducto
} from '../../features/productos/models/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private supabase = inject(SupabaseService);

  async obtenerProductos(): Promise<Producto[]> {

    const { data, error } = await this.supabase.client
      .from('productos')
      .select('*')
      .order('nombre', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as Producto[];
  }

    async obtenerProducto(id: string): Promise<Producto> {

        const { data, error } = await this.supabase.client
            .from('productos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data as Producto;
    }

  async buscarProductos(
    nombre: string
  ): Promise<Producto[]> {

    const texto = nombre.trim();

    if (!texto) {
      return this.obtenerProductos();
    }

    const patron = `%${texto.replace(/[%_\\]/g, '\\$&')}%`;

    const { data, error } = await this.supabase.client
      .from('productos')
      .select('*')
      .ilike('nombre', patron)
      .order('nombre', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as Producto[];
  }

  async registrarProducto(
    producto: NuevoProducto
  ): Promise<string> {

    const { data, error } = await this.supabase.client
      .rpc('registrar_producto', {
        p_nombre: producto.nombre,
        p_precio_venta: producto.precio_venta,
        p_existencia_inicial: producto.existencia_inicial,
        p_stock_minimo: producto.stock_minimo,
        p_marca: producto.marca || null,
        p_descripcion: producto.descripcion || null,
        p_categoria: producto.categoria || null
      });

    if (error) {
      throw new Error(error.message);
    }

    if (!data || typeof data !== 'string') {
      throw new Error(
        'No se pudo confirmar el identificador del producto.'
      );
    }

    return data;
  }
}
