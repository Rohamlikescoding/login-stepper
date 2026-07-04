// src/app/features/login-stepper/steps/personal-info/personal-info.component.ts
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StepperStateService } from '../../../../core/services/stepper-state.service';
import { MockApiService } from '../../../../core/services/mock-api.service';

const NAME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/;

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="flex flex-col gap-4 p-4" [formGroup]="form" (ngSubmit)="onSubmit()">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1">
          <label for="firstName" class="text-sm font-medium text-gray-700">First name</label>
          <input
            id="firstName"
            type="text"
            formControlName="firstName"
            class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            [class.border-red-500]="
              form.controls.firstName.touched && form.controls.firstName.invalid
            "
          />
          @if (form.controls.firstName.touched && form.controls.firstName.invalid) {
            <span class="text-red-500 text-xs">
              @if (form.controls.firstName.hasError('required')) {
                First name is required.
              } @else if (form.controls.firstName.hasError('minlength')) {
                First name must be at least 2 characters.
              } @else if (form.controls.firstName.hasError('pattern')) {
                First name may only contain letters.
              }
            </span>
          }
        </div>

        <div class="flex flex-col gap-1">
          <label for="lastName" class="text-sm font-medium text-gray-700">Last name</label>
          <input
            id="lastName"
            type="text"
            formControlName="lastName"
            class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            [class.border-red-500]="
              form.controls.lastName.touched && form.controls.lastName.invalid
            "
          />
          @if (form.controls.lastName.touched && form.controls.lastName.invalid) {
            <span class="text-red-500 text-xs">
              @if (form.controls.lastName.hasError('required')) {
                Last name is required.
              } @else if (form.controls.lastName.hasError('minlength')) {
                Last name must be at least 2 characters.
              } @else if (form.controls.lastName.hasError('pattern')) {
                Last name may only contain letters.
              }
            </span>
          }
        </div>
      </div>

      <div class="flex flex-col gap-1">
        <label for="nationality" class="text-sm font-medium text-gray-700">Nationality</label>
        <select
          id="nationality"
          formControlName="nationality"
          class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          [class.border-red-500]="
            form.controls.nationality.touched && form.controls.nationality.invalid
          "
        >
          <option value="" disabled>Select a nationality</option>
          @for (nationality of nationalities; track nationality) {
            <option [value]="nationality">{{ nationality }}</option>
          }
        </select>
        @if (form.controls.nationality.touched && form.controls.nationality.invalid) {
          <span class="text-red-500 text-xs">
            @if (form.controls.nationality.hasError('required')) {
              Nationality is required.
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
export class PersonalInfoComponent implements OnInit {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly stepperState = inject(StepperStateService);
  private readonly mockApi = inject(MockApiService);
  private readonly router = inject(Router);

  readonly nationalities = ['Iran', 'Germany', 'USA', 'France', 'Other'];
  readonly submitError = signal<string | null>(null);

  readonly form = this.fb.group({
    firstName: this.fb.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(NAME_PATTERN),
    ]),
    lastName: this.fb.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(NAME_PATTERN),
    ]),
    nationality: this.fb.control('', [Validators.required]),
  });

  ngOnInit(): void {
    const personal = this.stepperState.formData().personal;
    if (personal) {
      this.form.patchValue(personal);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitError.set(null);

    this.mockApi
      .submitPersonalInfo(this.form.getRawValue())
      .then(() => {
        this.stepperState.updatePersonalInfo(this.form.getRawValue());
        this.stepperState.nextStep();
        this.router.navigate(['/login-stepper', 'document']);
      })
      .catch(() => {
        this.submitError.set('Something went wrong. Please try again.');
      });
  }
}
