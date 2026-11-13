
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonSpinner
} from '@ionic/angular';

import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonItem,
    IonInput,
    IonButton,
    IonText,
    IonSpinner
  ]
})
export class LoginPage {

  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';

  cargando = false;
  mensajeError = '';

  async iniciarSesion() {

    if (this.cargando) return;

    this.mensajeError = '';
    this.cargando = true;

    try {

      await this.authService.iniciarSesion(
        this.email.trim(),
        this.password
      );

      await this.router.navigateByUrl(
        '/home',
        { replaceUrl: true }
      );

    } catch (error) {

      this.mensajeError =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado.';

    } finally {
      this.cargando = false;
    }
  }
}
