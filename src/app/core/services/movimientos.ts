
import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase';

import {
  SolicitudMovimiento,
  ResultadoMovimiento
} from '../../features/inventario/models/movimiento';

@Injectable({
  providedIn: 'root'
})
export class MovimientosService {

  private supabase = inject(SupabaseService);

  async registrarMovimiento(
    solicitud: SolicitudMovimiento
  ): Promise<ResultadoMovimiento> {

    const { data, error } = await this.supabase.client
      .rpc('registrar_movimiento', {
        p_operacion_id: solicitud.operacionId,
        p_producto_id: solicitud.productoId,
        p_tipo: solicitud.tipo,
        p_cantidad: solicitud.cantidad
      });

    if (error) {
      throw error;
    }

    if (
      !data ||
      !['CONFIRMADO', 'YA_PROCESADO'].includes(data.estado) ||
      data.operacion_id !== solicitud.operacionId
    ) {
      throw new Error(
        'No se pudo verificar la respuesta del servidor.'
      );
    }

    return data as ResultadoMovimiento;
  }
}
