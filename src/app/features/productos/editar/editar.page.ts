
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle,
  IonContent, IonItem, IonInput,
  IonTextarea, IonButton, IonText,
  IonSpinner, IonButtons, IonBackButton
} from '@ionic/angular';

import { ProductosService } from '../../../core/services/productos';
import {
  EdicionProducto,
  Producto
} from '../models/producto';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.page.html',
  styleUrls: ['./editar.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader, IonToolbar, IonTitle,
    IonContent, IonItem, IonInput,
    IonTextarea, IonButton, IonText,
    IonSpinner, IonButtons, IonBackButton
  ]
})
export class EditarPage {

  private productosService = inject(ProductosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productoId = '';
  producto = signal<Producto | null>(null);

  cargando = signal(true);
  guardando = signal(false);
  error = signal('');

  formulario: EdicionProducto = {
    nombre: '',
    marca: null,
    descripcion: null,
    categoria: null,
    precio_venta: 0,
    stock_minimo: 0
  };

  async ionViewWillEnter() {
    await this.cargarProducto();
  }

  async cargarProducto() {

    this.productoId =
      this.route.snapshot.paramMap.get('id') ?? '';

    if (!this.productoId) {
      this.error.set('Identificador de producto inválido.');
      this.cargando.set(false);
      return;
    }

    this.cargando.set(true);
    this.error.set('');
    this.producto.set(null);

    try {

      const producto =
        await this.productosService.obtenerProducto(
          this.productoId
        );

      this.producto.set(producto);

      this.formulario = {
        nombre: producto.nombre,
        marca: producto.marca,
        descripcion: producto.descripcion,
        categoria: producto.categoria,
        precio_venta: producto.precio_venta,
        stock_minimo: producto.stock_minimo
      };

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

  async guardarCambios() {

    if (this.guardando() || this.cargando()) return;
    if (!this.producto()) return;

    this.error.set('');

    const f = this.formulario;

    if (!f.nombre?.trim()) {
      this.error.set('El nombre es obligatorio.');
      return;
    }

    if (
      !Number.isFinite(f.precio_venta) ||
      f.precio_venta < 0 ||
      f.precio_venta > 9999999999.99 ||
      !/^\d+(\.\d{1,2})?$/.test(String(f.precio_venta))
    ) {
      this.error.set(
        'El precio debe ser no negativo y tener máximo dos decimales.'
      );
      return;
    }

    if (
      !Number.isInteger(f.stock_minimo) ||
      f.stock_minimo < 0
    ) {
      this.error.set(
        'La cantidad mínima debe ser un entero no negativo.'
      );
      return;
    }

    this.guardando.set(true);

    try {

      await this.productosService.actualizarProducto(
        this.productoId,
        this.formulario
      );

      await this.router.navigateByUrl(
        `/productos/${this.productoId}`,
        { replaceUrl: true }
      );

    } catch (error) {

      this.error.set(
        error instanceof Error
          ? error.message
          : 'No fue posible guardar los cambios.'
      );

    } finally {
      this.guardando.set(false);
    }
  }
}
