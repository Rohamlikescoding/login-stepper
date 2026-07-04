// src/app/features/login-stepper/login-stepper-shell/login-stepper-shell.component.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StepIndicator } from '../../../shared/ui/step-indicator/step-indicator';
import { StepperStateService } from '../../../core/services/stepper-state.service';

@Component({
  selector: 'app-login-stepper-shell',
  standalone: true,
  imports: [StepIndicator, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-2xl mx-auto p-4">
      <app-step-indicator
        [currentStep]="currentStep()"
        [highestCompletedStep]="highestCompletedStep()"
      />
      <router-outlet />
    </div>
  `,
})
export class LoginStepperShellComponent {
  private readonly stepperState = inject(StepperStateService);

  readonly currentStep = this.stepperState.currentStep;
  readonly highestCompletedStep = this.stepperState.highestCompletedStep;
}
