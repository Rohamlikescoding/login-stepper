export interface PersonalInfo {
  firstName: string;
  lastName: string;
  nationality: string;
}

export interface DocumentInfo {
  fileName: string;
  fileSize: number;
  hasUploaded: boolean;
}

export interface ContactInfo {
  province: string;
  city: string;
  address: string;
}

export interface StepperFormData {
  personal: PersonalInfo | null;
  document: DocumentInfo | null;
  contact: ContactInfo | null;
}
