import { Injectable, signal, computed } from '@angular/core';
import { StepId } from '../models/step.enum';
import {
  StepperFormData,
  PersonalInfo,
  DocumentInfo,
  ContactInfo,
} from '../models/stepper-data.model';

interface StepperState {
  currentStep: StepId;
  formData: StepperFormData;
}

@Injectable({ providedIn: 'root' })
export class StepperStateService {
  private readonly STORAGE_KEY = 'login-stepper-state';

  private readonly initialState = this.loadFromStorage();

  readonly currentStep = signal<StepId>(this.initialState.currentStep);
  readonly formData = signal<StepperFormData>(this.initialState.formData);

  readonly highestCompletedStep = computed<StepId>(() => {
    const data = this.formData();
    if (data.contact !== null) {
      return StepId.Contact;
    }
    if (data.document !== null) {
      return StepId.Document;
    }
    if (data.personal !== null) {
      return StepId.Personal;
    }
    return StepId.Personal;
  });

  private loadFromStorage(): StepperState {
    const defaultState: StepperState = {
      currentStep: StepId.Personal,
      formData: { personal: null, document: null, contact: null },
    };

    if (typeof window === 'undefined') {
      return defaultState;
    }

    try {
      const raw = window.localStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        return defaultState;
      }
      return JSON.parse(raw) as StepperState;
    } catch {
      return defaultState;
    }
  }

  private saveToStorage(state: StepperState): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }

  goToStep(step: StepId): void {
    this.currentStep.set(step);
    this.saveToStorage({ currentStep: step, formData: this.formData() });
  }

  nextStep(): void {
    const next = Math.min(this.currentStep() + 1, StepId.Review);
    this.goToStep(next);
  }

  previousStep(): void {
    const prev = Math.max(this.currentStep() - 1, StepId.Personal);
    this.goToStep(prev);
  }

  resetAll(): void {
    const defaultState: StepperState = {
      currentStep: StepId.Personal,
      formData: { personal: null, document: null, contact: null },
    };

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(this.STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
    }

    this.currentStep.set(defaultState.currentStep);
    this.formData.set(defaultState.formData);
  }

  updatePersonalInfo(data: PersonalInfo): void {
    const newFormData: StepperFormData = { ...this.formData(), personal: data };
    this.formData.set(newFormData);
    this.saveToStorage({ currentStep: this.currentStep(), formData: newFormData });
  }

  updateDocumentInfo(data: DocumentInfo): void {
    const newFormData: StepperFormData = { ...this.formData(), document: data };
    this.formData.set(newFormData);
    this.saveToStorage({ currentStep: this.currentStep(), formData: newFormData });
  }

  updateContactInfo(data: ContactInfo): void {
    const newFormData: StepperFormData = { ...this.formData(), contact: data };
    this.formData.set(newFormData);
    this.saveToStorage({ currentStep: this.currentStep(), formData: newFormData });
  }
}
