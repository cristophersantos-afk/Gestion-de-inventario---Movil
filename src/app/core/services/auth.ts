
import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private supabase: SupabaseService
  ) {}

  async iniciarSesion(
    email: string,
    password: string
  ): Promise<void> {

    const { error } =
      await this.supabase.client.auth.signInWithPassword({
        email,
        password
      });

    if (error) {
      throw new Error('Correo o contraseña incorrectos.');
    }

    try {
      const autorizado = await this.estaAutorizado();

      if (!autorizado) {
        await this.cerrarSesion();
        throw new Error(
          'Tu cuenta no tiene acceso a Punto Escolar.'
        );
      }
    } catch (error) {
      await this.cerrarSesion();
      throw error;
    }
  }

  async estaAutorizado(): Promise<boolean> {

    const { data: usuario, error: authError } =
      await this.supabase.client.auth.getUser();

    if (authError || !usuario.user) {
      return false;
    }

    const { data, error } = await this.supabase.client
      .from('usuarios_autorizados')
      .select('id')
      .eq('id', usuario.user.id)
      .maybeSingle();

    if (error) {
      throw new Error(
        'No se pudo verificar la autorización. ' +
        'Comprueba tu conexión.'
      );
    }

    return data !== null;
  }

  async cerrarSesion(): Promise<void> {

    const { error } =
      await this.supabase.client.auth.signOut();

    if (error) {
      throw new Error('No se pudo cerrar la sesión.');
    }
  }

}
