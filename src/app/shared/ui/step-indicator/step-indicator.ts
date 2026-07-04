import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { StepId } from '../../../core/models/step.enum';

interface StepDefinition {
  id: StepId;
  label: string;
}

@Component({
  selector: 'app-step-indicator',
  standalone: true,
  templateUrl: './step-indicator.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepIndicator {
  readonly currentStep = input.required<StepId>();
  readonly highestCompletedStep = input.required<StepId>();

  readonly steps: readonly StepDefinition[] = [
    { id: StepId.Personal, label: 'Personal' },
    { id: StepId.Document, label: 'Document' },
    { id: StepId.Contact, label: 'Contact' },
    { id: StepId.Review, label: 'Review' },
  ];
}
