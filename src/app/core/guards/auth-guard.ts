
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = async () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  try {
    const autorizado = await authService.estaAutorizado();

    if (autorizado) {
      return true;
    }

  } catch (error) {
    console.error('Error verificando acceso:', error);
  }

  return router.createUrlTree(['/login']);
};
