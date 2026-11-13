
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle,
  IonContent, IonButton, IonSearchbar,
  IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonText,
  IonSpinner, IonButtons
} from '@ionic/angular';

import { ProductosService } from '../../../core/services/productos';
import { Producto } from '../models/producto';

@Component({
  selector: 'app-listado',
  templateUrl: './listado.page.html',
  styleUrls: ['./listado.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle,
    IonContent, IonButton, IonSearchbar,
    IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonText,
    IonSpinner, IonButtons
  ]
})
export class ListadoPage {

  private productosService = inject(ProductosService);
  private router = inject(Router);

  productos = signal<Producto[]>([]);
  busqueda = signal('');
  cargando = signal(false);
  error = signal('');

  private numeroSolicitud = 0;

  async ionViewWillEnter() {
    await this.cargarProductos();
  }

  async cargarProductos() {

    const solicitudActual = ++this.numeroSolicitud;

    this.cargando.set(true);
    this.error.set('');

    try {

      const resultado =
        await this.productosService.buscarProductos(
          this.busqueda()
        );

      if (solicitudActual === this.numeroSolicitud) {
        this.productos.set(resultado);
      }

    } catch (error) {

      if (solicitudActual === this.numeroSolicitud) {
        this.productos.set([]);

        this.error.set(
          error instanceof Error
            ? error.message
            : 'Error consultando productos.'
        );
      }

    } finally {

      if (solicitudActual === this.numeroSolicitud) {
        this.cargando.set(false);
      }
    }
  }

  async buscar(event: CustomEvent) {

    this.busqueda.set(
      String(event.detail.value ?? '')
    );

    await this.cargarProductos();
  }

  nuevoProducto() {
    this.router.navigateByUrl('/productos/nuevo');
  }

  consultarProducto(producto: Producto) {
    this.router.navigate(['/productos', producto.id]);
  }
}
