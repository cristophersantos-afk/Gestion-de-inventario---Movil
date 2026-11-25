
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ReposicionesService } from '../../../core/services/reposiciones';

import {
  IonHeader, IonToolbar, IonTitle,
  IonContent, IonButton, IonButtons, IonBackButton,
  IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonSpinner, IonText
} from '@ionic/angular';

import { ProductosService } from '../../../core/services/productos';
import { Producto } from '../models/producto';

@Component({
  selector: 'app-detalle',
  templateUrl: './detalle.page.html',
  styleUrls: ['./detalle.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle,
    IonContent, IonButton, IonButtons, IonBackButton,
    IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonSpinner, IonText
  ]
})
export class DetallePage {

  private route = inject(ActivatedRoute);
  private productosService = inject(ProductosService);
  private router = inject(Router);

  producto = signal<Producto | null>(null);
  cargando = signal(true);
  error = signal('');

  // Variables de reposicion
  private reposicionesService = inject(ReposicionesService);
  reposicionPendiente = signal(false);
  solicitando = signal(false);
  errorReposicion = signal('');
  mensajeReposicion = signal('');

  async ionViewWillEnter() {
    await this.cargarProducto();
    await this.consultarEstadoReposicion();
  }

  async cargarProducto() {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set('Identificador de producto no válido.');
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    try {
      const resultado =
        await this.productosService.obtenerProducto(id);

      this.producto.set(resultado);

    } catch (error) {

      this.error.set(
        error instanceof Error
          ? error.message
          : 'No se pudo consultar el producto.'
      );

    } finally {
      this.cargando.set(false);
    }
  }

  editarProducto() {
    const p = this.producto();

    if (!p) return;

    this.router.navigateByUrl(
      `/productos/${p.id}/editar`
    );
  }


  registrarMovimiento() {
    const p = this.producto();

    if (!p) return;

    this.router.navigateByUrl(
      `/productos/${p.id}/movimiento`
    );
  }

  // Metodos para reposiciones
  
  async consultarEstadoReposicion() {

    const p = this.producto();
    if (!p) return;

    this.errorReposicion.set('');
    this.mensajeReposicion.set('');

    try {
      const pendiente =
        await this.reposicionesService
          .obtenerPendienteDeProducto(p.id);

      this.reposicionPendiente.set(pendiente !== null);

    } catch (error) {
      this.errorReposicion.set(
        error instanceof Error
          ? error.message
          : 'No se pudo consultar el estado de reposición.'
      );
    }
  }

  async solicitarReposicion() {

    const p = this.producto();

    if (!p || this.solicitando() || this.reposicionPendiente()) {
      return;
    }

    this.solicitando.set(true);
    this.errorReposicion.set('');
    this.mensajeReposicion.set('');

    try {

      await this.reposicionesService.solicitarReposicion(p.id);

      this.reposicionPendiente.set(true);

      this.mensajeReposicion.set(
        'Producto marcado como Solicitado.'
      );

    } catch (error) {

      // Si se perdió la respuesta, consultar
      // el estado real antes de permitir otra acción.
      try {
        const pendiente =
          await this.reposicionesService
            .obtenerPendienteDeProducto(p.id);

        this.reposicionPendiente.set(pendiente !== null);

        if (pendiente) {
          this.mensajeReposicion.set(
            'El producto tiene una reposición pendiente.'
          );
          return;
        }
      } catch {
        // No conocemos el estado final.
      }

      this.errorReposicion.set(
        'No se pudo confirmar la solicitud. ' +
        'Actualiza la consulta antes de reintentar.'
      );

    } finally {
      this.solicitando.set(false);
    }
  }

  abrirReposiciones() {
    this.router.navigateByUrl('/reposiciones');
  }


}
