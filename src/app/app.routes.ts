import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'login-stepper', pathMatch: 'full' },
  {
    path: 'login-stepper',
    loadChildren: () =>
      import('./features/login-stepper/login-stepper.routes').then((m) => m.LOGIN_STEPPER_ROUTES),
  },
];
