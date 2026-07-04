// src/app/features/login-stepper/steps/document-upload/document-upload.component.ts
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { StepperStateService } from '../../../../core/services/stepper-state.service';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

@Component({
  selector: 'app-document-upload',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<form class="flex flex-col gap-4 p-4" (submit)="onSubmit($event)">
    @if (hasUploaded() && !selectedFile()) {
      <span
        class="inline-flex items-center gap-1 self-start bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded"
      >
        Document already uploaded
      </span>
    }
    <input
      type="file"
      accept="image/*"
      (change)="onFileSelected($event)"
      class="border rounded px-3 py-2 text-sm"
    />
    @if (errorMessage()) {
      <p class="text-red-500 text-sm">{{ errorMessage() }}</p>
    }
    @if (previewUrl()) {
      <img
        [src]="previewUrl()"
        alt="Document preview"
        class="max-w-full max-h-64 rounded border object-contain"
      />
    }
    <button type="submit" class="mt-2 bg-blue-500 text-white rounded px-4 py-2">Next</button>
  </form>`,
})
export class DocumentUploadComponent implements OnInit {
  private readonly stepperState = inject(StepperStateService);
  private readonly router = inject(Router);

  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);
  readonly hasUploaded = signal<boolean>(false);

  ngOnInit(): void {
    const document = this.stepperState.formData().document;
    if (document) {
      this.hasUploaded.set(document.hasUploaded);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Please select an image file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      this.errorMessage.set('File size must be 5MB or less.');
      return;
    }

    this.errorMessage.set(null);
    this.selectedFile.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    const file = this.selectedFile();

    if (!file && !this.hasUploaded()) {
      this.errorMessage.set('Please select a document to upload.');
      return;
    }

    this.errorMessage.set(null);

    this.stepperState.updateDocumentInfo({
      fileName: file ? file.name : this.stepperState.formData().document!.fileName,
      fileSize: file ? file.size : this.stepperState.formData().document!.fileSize,
      hasUploaded: true,
    });
    this.stepperState.nextStep();
    this.router.navigate(['/login-stepper', 'contact']);
  }
}
