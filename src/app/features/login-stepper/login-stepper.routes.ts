// src/app/features/login-stepper/login-stepper.routes.ts
import { Routes } from '@angular/router';
import { canMatchStepOrder } from '../../core/guards/step-order.guard';

export const LOGIN_STEPPER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./login-stepper-shell/login-stepper-shell.component').then(
        (m) => m.LoginStepperShellComponent,
      ),
    children: [
      { path: '', redirectTo: 'personal', pathMatch: 'full' },
      {
        path: 'personal',
        data: { step: 0 },
        title: 'Personal Information | Login Stepper',
        loadComponent: () =>
          import('./steps/personal-info/personal-info.component').then(
            (m) => m.PersonalInfoComponent,
          ),
      },
      {
        path: 'document',
        data: { step: 1 },
        canMatch: [canMatchStepOrder],
        title: 'Document Upload | Login Stepper',
        loadComponent: () =>
          import('./steps/document-upload/document-upload.component').then(
            (m) => m.DocumentUploadComponent,
          ),
      },
      {
        path: 'contact',
        data: { step: 2 },
        canMatch: [canMatchStepOrder],
        title: 'Contact Information | Login Stepper',
        loadComponent: () =>
          import('./steps/contact-info/contact-info.component').then((m) => m.ContactInfoComponent),
      },
      {
        path: 'review',
        data: { step: 3 },
        canMatch: [canMatchStepOrder],
        title: 'Review & Submit | Login Stepper',
        loadComponent: () =>
          import('./steps/review/review.component').then((m) => m.ReviewComponent),
      },
    ],
  },
];
