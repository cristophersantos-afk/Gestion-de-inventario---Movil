
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReposicionesService } from '../../core/services/reposiciones';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonSpinner,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonBadge
} from '@ionic/angular';

import { ProductosService } from '../../core/services/productos';
import { Producto } from '../productos/models/producto';

@Component({
  selector: 'app-tablero',
  templateUrl: './tablero.page.html',
  styleUrls: ['./tablero.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonSpinner,
    IonText,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonBadge
  ]
})
export class TableroPage {

  private productosService = inject(ProductosService);
  private router = inject(Router);

  productos = signal<Producto[]>([]);
  cargando = signal(false);
  error = signal('');

  agotados = computed(() =>
    this.productos().filter(p => p.existencia === 0)
  );

  stockBajo = computed(() =>
    this.productos().filter(p =>
      p.existencia > 0 &&
      p.existencia <= p.stock_minimo
    )
  );

  stockSuficiente = computed(() =>
    this.productos().filter(p =>
      p.existencia > p.stock_minimo
    )
  );


  // Variables para reposicion
  private reposicionesService = inject(ReposicionesService);
  productosEnReposicion = signal<Set<string>>(new Set());

  // Funcion para ver si esta en reposicion

  estaEnReposicion(productoId: string): boolean {
    return this.productosEnReposicion().has(productoId);
  }

  async ionViewWillEnter() {
    await this.cargarTablero();
  }

  
  async cargarTablero() {
    this.cargando.set(true);
    this.error.set('');

    try {
      const [productos, reposiciones] = await Promise.all([
        this.productosService.obtenerProductos(),
        this.reposicionesService.obtenerPendientes()
      ]);

      this.productos.set(productos);

      const ids = new Set(
        reposiciones.map(r => r.producto_id)
      );

      this.productosEnReposicion.set(ids);

    } catch (error) {
      this.productos.set([]);
      this.productosEnReposicion.set(new Set());

      this.error.set(
        error instanceof Error
          ? error.message
          : 'No se pudo cargar el tablero.'
      );
    } finally {
      this.cargando.set(false);
    }
  }


  abrirProducto(id: string) {
    this.router.navigate(['/productos', id]);
  }

  abrirInventario() {
    this.router.navigateByUrl('/productos');
  }

  irInicio() {
    this.router.navigateByUrl('/home');
  }
}
