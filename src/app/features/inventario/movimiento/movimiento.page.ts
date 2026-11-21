
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle,
  IonContent, IonButtons, IonBackButton,
  IonItem, IonInput, IonSelect, IonSelectOption,
  IonButton, IonSpinner, IonText
} from '@ionic/angular';

import { ProductosService } from '../../../core/services/productos';
import { MovimientosService } from '../../../core/services/movimientos';
import { SupabaseService } from '../../../core/services/supabase';

import { Producto } from '../../productos/models/producto';

import {
  TipoMovimiento,
  SolicitudMovimiento
} from '../models/movimiento';

@Component({
  selector: 'app-movimiento',
  templateUrl: './movimiento.page.html',
  styleUrls: ['./movimiento.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle,
    IonContent, IonButtons, IonBackButton,
    IonItem, IonInput, IonSelect, IonSelectOption,
    IonButton, IonSpinner, IonText
  ]
})
export class MovimientoPage {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productosService = inject(ProductosService);
  private movimientosService = inject(MovimientosService);
  private supabase = inject(SupabaseService);

  producto = signal<Producto | null>(null);

  cargando = signal(true);
  procesando = signal(false);
  error = signal('');
  mensaje = signal('');

  pendiente = signal<SolicitudMovimiento | null>(null);

  tipo: TipoMovimiento = 'SALIDA';
  cantidad: number | null = 1;

  private clavePendiente = '';

  async ionViewWillEnter() {
    await this.inicializar();
  }

  async inicializar() {
    this.cargando.set(true);
    this.error.set('');
    this.mensaje.set('');

    const productoId =
      this.route.snapshot.paramMap.get('id');

    if (!productoId) {
      this.error.set('Producto no válido.');
      this.cargando.set(false);
      return;
    }

    try {
      const { data, error } =
        await this.supabase.client.auth.getUser();

      if (error || !data.user) {
        throw new Error('Debes iniciar sesión.');
      }

      // Cada usuario conserva sus propias
      // operaciones pendientes.
      this.clavePendiente =
        `punto-escolar:movimiento:${data.user.id}:${productoId}`;

      const guardada = localStorage.getItem(
        this.clavePendiente
      );

      if (guardada) {
        const solicitud =
          JSON.parse(guardada) as SolicitudMovimiento;

        if (
          solicitud.productoId !== productoId ||
          !solicitud.operacionId ||
          !['ENTRADA', 'SALIDA'].includes(solicitud.tipo) ||
          !Number.isInteger(solicitud.cantidad) ||
          solicitud.cantidad <= 0
        ) {
          throw new Error(
            'La operación pendiente guardada no es válida.'
          );
        }

        this.pendiente.set(solicitud);
        this.tipo = solicitud.tipo;
        this.cantidad = solicitud.cantidad;

        this.mensaje.set(
          'Existe una operación pendiente de verificar. ' +
          'Puedes reenviar la misma solicitud sin duplicarla.'
        );
      } else {
        this.pendiente.set(null);
      }

      const producto =
        await this.productosService.obtenerProducto(
          productoId
        );

      this.producto.set(producto);

    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el producto.'
      );
    } finally {
      this.cargando.set(false);
    }
  }

  async registrar() {
    if (this.procesando() || this.cargando()) return;

    // No crear otra solicitud mientras
    // exista una pendiente sin resolver.
    if (this.pendiente()) {
      await this.enviarPendiente();
      return;
    }

    const producto = this.producto();
    const cantidad = Number(this.cantidad);

    if (!producto) return;

    if (
      !Number.isSafeInteger(cantidad) ||
      cantidad <= 0 ||
      cantidad > 2147483647
    ) {
      this.error.set(
        'Introduce una cantidad entera mayor que cero.'
      );
      return;
    }

    if (this.tipo !== 'ENTRADA' &&
        this.tipo !== 'SALIDA') {
      this.error.set('Tipo de movimiento no válido.');
      return;
    }

    // La validación del stock en el cliente
    // es informativa. PostgreSQL decide.
    if (
      this.tipo === 'SALIDA' &&
      cantidad > producto.existencia
    ) {
      this.error.set(
        `Solo hay ${producto.existencia} unidades disponibles.`
      );
      return;
    }

    const solicitud: SolicitudMovimiento = {
      operacionId: crypto.randomUUID(),
      productoId: producto.id,
      tipo: this.tipo,
      cantidad
    };

    // Guardar ANTES de enviar a Supabase.
    try {
      localStorage.setItem(
        this.clavePendiente,
        JSON.stringify(solicitud)
      );
    } catch {
      this.error.set(
        'No se pudo conservar la solicitud. ' +
        'No se enviará el movimiento.'
      );
      return;
    }

    this.pendiente.set(solicitud);
    await this.enviarPendiente();
  }

  async enviarPendiente() {
    if (this.procesando()) return;

    const solicitud = this.pendiente();
    if (!solicitud) return;

    this.procesando.set(true);
    this.error.set('');
    this.mensaje.set('');

    try {
      const resultado =
        await this.movimientosService.registrarMovimiento(
          solicitud
        );

      // La respuesta confirma que la operación
      // se aplicó o ya se había aplicado.
      this.pendiente.set(null);
      localStorage.removeItem(this.clavePendiente);

      this.mensaje.set(
        resultado.estado === 'CONFIRMADO'
          ? 'Movimiento registrado correctamente.'
          : 'El movimiento ya estaba registrado. No se duplicó.'
      );

      this.cantidad = 1;

      // Refrescar las existencias, sin alterar
      // el resultado ya confirmado.
      try {
        const actualizado =
          await this.productosService.obtenerProducto(
            solicitud.productoId
          );

        this.producto.set(actualizado);
      } catch {
        this.mensaje.update(texto =>
          texto + ' No se pudieron actualizar las existencias mostradas.'
        );
      }

    } catch (error) {

      const detalle =
        error instanceof Error
          ? error.message
          : String(error);

      // Son rechazos explícitos de la función SQL.
      // No aplicaron el movimiento.
      const rechazoDefinitivo =
        detalle.includes('Existencias insuficientes') ||
        detalle.includes('Producto no encontrado') ||
        detalle.includes('cantidad fuera de limite') ||
        detalle.includes('Identificador utilizado para otra operacion') ||
        detalle.includes('La cantidad debe ser mayor que cero') ||
        detalle.includes('Tipo de movimiento no valido');

      if (rechazoDefinitivo) {
        this.pendiente.set(null);
        localStorage.removeItem(this.clavePendiente);

        this.error.set(
          `Operación rechazada: ${detalle}`
        );
      } else {
        // La operación podría haberse guardado
        // aunque la respuesta no haya llegado.
        this.error.set(
          'No se pudo confirmar el resultado. ' +
          'No realices otra operación equivalente. ' +
          'Utiliza "Verificar / reintentar" para ' +
          'reenviar exactamente la misma solicitud.'
        );
      }

    } finally {
      this.procesando.set(false);
    }
  }

  volverDetalle() {
    const producto = this.producto();

    if (!producto) return;

    this.router.navigateByUrl(
      `/productos/${producto.id}`
    );
  }
}
