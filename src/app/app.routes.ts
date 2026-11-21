import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'home',
    canActivate: [authGuard],
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'productos',
    canActivate: [authGuard],
    loadComponent: () => import('./features/productos/listado/listado.page').then((m) => m.ListadoPage),
  },
  {
    path: 'productos/nuevo',
    canActivate: [authGuard],
    loadComponent: () => import('./features/productos/registro/registro.page').then((m) => m.RegistroPage),
  },
  {
    path: 'productos/:id/editar',
    canActivate: [authGuard],
    loadComponent: () => import('./features/productos/editar/editar.page').then((m) => m.EditarPage),
  },
  {
    path: 'productos/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/productos/detalle/detalle.page').then((m) => m.DetallePage),
  },
  {
    path: 'productos/:id/movimiento',
    canActivate: [authGuard],
    loadComponent: () => import('./features/inventario/movimiento/movimiento.page').then((m) => m.MovimientoPage),
  },
  {
    path: 'tablero',
    //canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tablero/tablero.page')
        .then(m => m.TableroPage)
  },
  {
    path: '**',
    redirectTo: 'home',
  },
];
