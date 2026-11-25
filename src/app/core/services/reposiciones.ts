
import { Injectable, inject } from '@angular/core';

import { SupabaseService } from './supabase';

import {
  ReposicionPendiente
} from '../../features/reposiciones/models/reposicion';

@Injectable({
  providedIn: 'root'
})
export class ReposicionesService {

  private supabase = inject(SupabaseService);

  async obtenerPendientes():
    Promise<ReposicionPendiente[]> {

    const { data, error } = await this.supabase.client
      .from('reposiciones')
      .select(`
        id,
        producto_id,
        usuario_id,
        estado,
        solicitado_en,
        finalizado_en,
        producto:productos!reposiciones_producto_id_fkey (
          id,
          nombre,
          existencia,
          stock_minimo
        )
      `)
      .eq('estado', 'SOLICITADO')
      .order('solicitado_en', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    // temporal
    console.log('Reposiciones recibidas:', data);
    return (data ?? []) as unknown as ReposicionPendiente[];
  }

  async obtenerPendienteDeProducto(
    productoId: string
  ): Promise<ReposicionPendiente | null> {

    const { data, error } = await this.supabase.client
      .from('reposiciones')
      .select(`
        id,
        producto_id,
        usuario_id,
        estado,
        solicitado_en,
        finalizado_en,
        producto:productos!reposiciones_producto_id_fkey (
          id,
          nombre,
          existencia,
          stock_minimo
        )
      `)
      .eq('producto_id', productoId)
      .eq('estado', 'SOLICITADO')
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }
    console.log('Reposicion recibida: ',data);
    return data as ReposicionPendiente | null;
  }

  async solicitarReposicion(
    productoId: string
  ): Promise<string> {

    const { data, error } = await this.supabase.client
      .rpc('solicitar_reposicion', {
        p_producto_id: productoId
      });

    if (error) {
      throw new Error(error.message);
    }

    if (!data || typeof data !== 'string') {
      throw new Error(
        'No se pudo confirmar la solicitud de reposición.'
      );
    }

    return data;
  }

  async finalizarReposicion(
    reposicionId: string
  ): Promise<void> {

    const { data, error } = await this.supabase.client
      .rpc('finalizar_reposicion', {
        p_reposicion_id: reposicionId
      });

    if (error) {
      throw new Error(error.message);
    }

    if (data !== true) {
      throw new Error(
        'La reposición ya estaba finalizada o no existe.'
      );
    }
  }
}
