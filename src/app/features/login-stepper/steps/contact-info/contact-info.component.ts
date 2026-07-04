// src/app/features/login-stepper/steps/contact-info/contact-info.component.ts
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StepperStateService } from '../../../../core/services/stepper-state.service';
import { MockApiService } from '../../../../core/services/mock-api.service';

@Component({
  selector: 'app-contact-info',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="flex flex-col gap-4 p-4" [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label for="province" class="text-sm font-medium text-gray-700">Province</label>
          <input
            id="province"
            type="text"
            formControlName="province"
            class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            [class.border-red-500]="
              form.controls.province.touched && form.controls.province.invalid
            "
          />
          @if (form.controls.province.touched && form.controls.province.invalid) {
            <span class="text-red-500 text-xs">
              @if (form.controls.province.hasError('required')) {
                Province is required.
              } @else if (form.controls.province.hasError('minlength')) {
                Province must be at least 3 characters.
              }
            </span>
          }
        </div>

        <div class="flex flex-col gap-1">
          <label for="city" class="text-sm font-medium text-gray-700">City</label>
          <input
            id="city"
            type="text"
            formControlName="city"
            class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            [class.border-red-500]="form.controls.city.touched && form.controls.city.invalid"
          />
          @if (form.controls.city.touched && form.controls.city.invalid) {
            <span class="text-red-500 text-xs">
              @if (form.controls.city.hasError('required')) {
                City is required.
              } @else if (form.controls.city.hasError('minlength')) {
                City must be at least 3 characters.
              }
            </span>
          }
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="address" class="text-sm font-medium text-gray-700">Address</label>
        <input
          id="address"
          type="text"
          formControlName="address"
          class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          [class.border-red-500]="form.controls.address.touched && form.controls.address.invalid"
        />
        @if (form.controls.address.touched && form.controls.address.invalid) {
          <span class="text-red-500 text-xs">
            @if (form.controls.address.hasError('required')) {
              Address is required.
            } @else if (form.controls.address.hasError('minlength')) {
              Address must be at least 3 characters.
            }
          </span>
        }
      </div>

      @if (submitError()) {
        <p class="text-red-500 text-sm">{{ submitError() }}</p>
      }

      <button
        type="submit"
        [disabled]="form.invalid"
        class="mt-2 bg-blue-500 text-white rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </form>
  `,
})
export class ContactInfoComponent implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly stepperState = inject(StepperStateService);
  private readonly mockApi = inject(MockApiService);
  private readonly router = inject(Router);

  readonly submitError = signal<string | null>(null);

  readonly form = this.fb.group({
    province: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    city: this.fb.control('', [Validators.required, Validators.minLength(3)]),
    address: this.fb.control('', [Validators.required, Validators.minLength(3)]),
  });

  ngOnInit(): void {
    const contact = this.stepperState.formData().contact;
    if (contact) {
      this.form.patchValue(contact);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError.set(null);

    this.mockApi
      .submitContactInfo(this.form.getRawValue())
      .then(() => {
        this.stepperState.updateContactInfo(this.form.getRawValue());
        this.stepperState.nextStep();
        this.router.navigate(['/login-stepper', 'review']);
      })
      .catch(() => {
        this.submitError.set('Something went wrong. Please try again.');
      });
  }
}
