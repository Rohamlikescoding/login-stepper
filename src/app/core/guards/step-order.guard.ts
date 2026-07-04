import { inject } from '@angular/core';
import { CanMatchFn, Route, Router, UrlSegment, UrlTree } from '@angular/router';
import { StepId } from '../models/step.enum';
import { StepperStateService } from '../services/stepper-state.service';

const STEP_PATHS: Record<StepId, string> = {
  [StepId.Personal]: 'personal',
  [StepId.Document]: 'document',
  [StepId.Contact]: 'contact',
  [StepId.Review]: 'review',
};

export const canMatchStepOrder: CanMatchFn = (
  route: Route,
  _segments: UrlSegment[],
): boolean | UrlTree => {
  const router = inject(Router);
  const stepperState = inject(StepperStateService);

  const requestedStep = route.data?.['step'] as StepId;
  const highestCompletedStep = stepperState.highestCompletedStep();

  if (requestedStep <= highestCompletedStep + 1) {
    return true;
  }

  return router.createUrlTree(['/', STEP_PATHS[highestCompletedStep]]);
};
