
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import {
  AlertController,
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

import { ReposicionesService } from '../../../core/services/reposiciones';

import {
  ReposicionPendiente
} from '../models/reposicion';

@Component({
  selector: 'app-listado-reposiciones',
  templateUrl: './listado.page.html',
  styleUrls: ['./listado.page.scss'],
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
export class ListadoPage {

  private reposicionesService = inject(ReposicionesService);
  private router = inject(Router);
  private alertController = inject(AlertController);

  reposiciones = signal<ReposicionPendiente[]>([]);

  cargando = signal(false);
  procesandoId = signal<string | null>(null);
  error = signal('');
  mensaje = signal('');

  async ionViewWillEnter() {
    await this.cargarReposiciones();
  }

  async cargarReposiciones() {

    if (this.procesandoId()) return;

    this.cargando.set(true);
    this.error.set('');
    this.mensaje.set('');

    try {
      const resultado =
        await this.reposicionesService.obtenerPendientes();

      this.reposiciones.set(resultado);

    } catch (error) {
      this.error.set(
        error instanceof Error
          ? error.message
          : 'No se pudieron consultar las reposiciones.'
      );
    } finally {
      this.cargando.set(false);
    }
  }

  async confirmarFinalizacion(
    reposicion: ReposicionPendiente
  ) {

    if (this.procesandoId()) return;

    const alerta = await this.alertController.create({
      header: 'Finalizar reposición',
      message:
        `¿Deseas finalizar la reposición de "${reposicion.producto.nombre}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Finalizar',
          role: 'confirm'
        }
      ]
    });

    await alerta.present();

    const { role } = await alerta.onDidDismiss();

    if (role !== 'confirm') return;

    await this.finalizar(reposicion.id);
  }

  async finalizar(id: string) {

    if (this.procesandoId()) return;

    this.procesandoId.set(id);
    this.error.set('');
    this.mensaje.set('');

    try {
      await this.reposicionesService.finalizarReposicion(id);

      // Retirar la reposición de la lista local.
      this.reposiciones.update(actuales =>
        actuales.filter(r => r.id !== id)
      );

      this.mensaje.set(
        'Reposición finalizada correctamente.'
      );

    } catch (error) {

      this.error.set(
        error instanceof Error
          ? error.message
          : 'No se pudo finalizar la reposición.'
      );

      // Volver a consultar el estado real.
      try {
        const actualizadas =
          await this.reposicionesService.obtenerPendientes();

        this.reposiciones.set(actualizadas);
      } catch {
        // Conservamos el error original.
      }

    } finally {
      this.procesandoId.set(null);
    }
  }

  abrirProducto(id: string) {
    this.router.navigate(['/productos', id]);
  }

  irInicio() {
    this.router.navigateByUrl('/home');
  }
}
