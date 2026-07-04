// src/app/features/login-stepper/steps/review/review.component.ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StepId } from '../../../../core/models/step.enum';
import { StepperStateService } from '../../../../core/services/stepper-state.service';
import { MockApiService } from '../../../../core/services/mock-api.service';

const STEP_PATHS: Record<StepId, string> = {
  [StepId.Personal]: 'personal',
  [StepId.Document]: 'document',
  [StepId.Contact]: 'contact',
  [StepId.Review]: 'review',
};

@Component({
  selector: 'app-review',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-6 p-4">
      <section class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-800">Personal</h3>
          <button
            type="button"
            class="text-blue-500 text-sm underline"
            (click)="editStep(StepId.Personal)"
          >
            Edit
          </button>
        </div>
        @if (formData().personal; as personal) {
          <dl class="grid grid-cols-2 gap-1 text-sm">
            <dt class="text-gray-500">First name</dt>
            <dd>{{ personal.firstName }}</dd>
            <dt class="text-gray-500">Last name</dt>
            <dd>{{ personal.lastName }}</dd>
            <dt class="text-gray-500">Nationality</dt>
            <dd>{{ personal.nationality }}</dd>
          </dl>
        }
      </section>

      <section class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-800">Document</h3>
          <button
            type="button"
            class="text-blue-500 text-sm underline"
            (click)="editStep(StepId.Document)"
          >
            Edit
          </button>
        </div>
        @if (formData().document; as document) {
          <dl class="grid grid-cols-2 gap-1 text-sm">
            <dt class="text-gray-500">File name</dt>
            <dd>{{ document.fileName }}</dd>
            <dt class="text-gray-500">File size</dt>
            <dd>{{ document.fileSize }} bytes</dd>
            <dt class="text-gray-500">Uploaded</dt>
            <dd>{{ document.hasUploaded ? 'Yes' : 'No' }}</dd>
          </dl>
        }
      </section>

      <section class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold text-gray-800">Contact</h3>
          <button
            type="button"
            class="text-blue-500 text-sm underline"
            (click)="editStep(StepId.Contact)"
          >
            Edit
          </button>
        </div>
        @if (formData().contact; as contact) {
          <dl class="grid grid-cols-2 gap-1 text-sm">
            <dt class="text-gray-500">Province</dt>
            <dd>{{ contact.province }}</dd>
            <dt class="text-gray-500">City</dt>
            <dd>{{ contact.city }}</dd>
            <dt class="text-gray-500">Address</dt>
            <dd>{{ contact.address }}</dd>
          </dl>
        }
      </section>

      @if (!submitted()) {
        <button
          type="button"
          class="bg-blue-500 text-white rounded px-4 py-2"
          (click)="onConfirm()"
        >
          Confirm & Submit
        </button>
        @if (submitError()) {
          <p class="text-red-500 text-sm">{{ submitError() }}</p>
        }
      } @else {
        <p class="text-green-600 font-medium">Your submission was successful!</p>
        <button
          type="button"
          class="bg-gray-200 text-gray-800 rounded px-4 py-2"
          (click)="onStartOver()"
        >
          Start Over
        </button>
      }
    </div>
  `,
})
export class ReviewComponent {
  private readonly stepperState = inject(StepperStateService);
  private readonly mockApi = inject(MockApiService);
  private readonly router = inject(Router);

  readonly StepId = StepId;
  readonly formData = this.stepperState.formData;
  readonly submitted = signal(false);
  readonly submitError = signal<string | null>(null);

  onConfirm(): void {
    this.submitError.set(null);

    this.mockApi
      .submitAll()
      .then(() => {
        this.submitted.set(true);
      })
      .catch(() => {
        this.submitError.set('Something went wrong. Please try again.');
      });
  }

  editStep(step: StepId): void {
    this.stepperState.goToStep(step);
    this.router.navigate(['/login-stepper', STEP_PATHS[step]]);
  }

  onStartOver(): void {
    this.stepperState.resetAll();
    this.router.navigate(['/login-stepper', STEP_PATHS[StepId.Personal]]);
  }
}
