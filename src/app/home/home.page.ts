
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton
} from '@ionic/angular';

import { AuthService } from '../core/services/auth';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton
  ]
})
export class HomePage {

  private authService = inject(AuthService);
  private router = inject(Router);

  async cerrarSesion() {

    try {

      await this.authService.cerrarSesion();

      await this.router.navigateByUrl(
        '/login',
        { replaceUrl: true }
      );

    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
