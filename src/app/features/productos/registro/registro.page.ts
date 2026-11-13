
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonHeader, IonToolbar, IonTitle,
  IonContent, IonItem, IonInput,
  IonTextarea, IonButton, IonText,
  IonSpinner, IonButtons, IonBackButton
} from '@ionic/angular';

import { ProductosService } from '../../../core/services/productos';
import { NuevoProducto } from '../models/producto';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle,
    IonContent, IonItem, IonInput,
    IonTextarea, IonButton, IonText,
    IonSpinner, IonButtons, IonBackButton
  ]
})
export class RegistroPage {

  private productosService = inject(ProductosService);
  private router = inject(Router);

  producto: NuevoProducto = {
    nombre: '',
    precio_venta: 0,
    existencia_inicial: 0,
    stock_minimo: 0,
    marca: '',
    descripcion: '',
    categoria: ''
  };

  guardando = false;
  error = '';

  async guardarProducto() {

    if (this.guardando) return;

    this.error = '';

    const p = this.producto;

    if (!p.nombre.trim()) {
      this.error = 'El nombre es obligatorio.';
      return;
    }

    if (
      !Number.isFinite(p.precio_venta) ||
      p.precio_venta < 0 ||
      !Number.isInteger(p.precio_venta * 100) ||
      p.precio_venta > 9999999999.99
    ) {
      this.error = 'Introduce un precio válido con máximo dos decimales.';
      return;
    }

    if (
      !Number.isInteger(p.existencia_inicial) ||
      p.existencia_inicial < 0
    ) {
      this.error = 'La cantidad inicial debe ser un entero no negativo.';
      return;
    }

    if (
      !Number.isInteger(p.stock_minimo) ||
      p.stock_minimo < 0
    ) {
      this.error = 'La cantidad mínima debe ser un entero no negativo.';
      return;
    }

    this.guardando = true;

    try {
      await this.productosService.registrarProducto(p);

      await this.router.navigateByUrl(
        '/productos',
        { replaceUrl: true }
      );

    } catch (error) {
      this.error = error instanceof Error
        ? error.message
        : 'No se pudo registrar el producto.';
    } finally {
      this.guardando = false;
    }
  }
}
