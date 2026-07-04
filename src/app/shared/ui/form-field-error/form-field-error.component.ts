// src/app/shared/ui/form-field-error/form-field-error.component.ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-field-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (message()) {
      <span class="text-red-500 text-xs">{{ message() }}</span>
    }
  `,
})
export class FormFieldErrorComponent {
  readonly control = input<AbstractControl | null>(null);
  readonly messages = input<Record<string, string>>({});

  readonly message = computed<string | null>(() => {
    const control = this.control();
    if (!control || !control.touched || !control.errors) {
      return null;
    }
    const errorKey = Object.keys(control.errors)[0];
    return this.messages()[errorKey] ?? 'This field is invalid.';
  });
}
