
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle,
  IonContent, IonButtons, IonBackButton,
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
    IonContent, IonButtons, IonBackButton,
    IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonSpinner, IonText
  ]
})
export class DetallePage implements OnInit {

  private route = inject(ActivatedRoute);
  private productosService = inject(ProductosService);

  producto = signal<Producto | null>(null);
  cargando = signal(true);
  error = signal('');

  async ngOnInit() {
    await this.cargarProducto();
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
}
