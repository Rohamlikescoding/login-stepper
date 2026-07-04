import { Injectable } from '@angular/core';
import { PersonalInfo, ContactInfo } from '../models/stepper-data.model';

interface MockApiResponse {
  success: true;
}

@Injectable({ providedIn: 'root' })
export class MockApiService {
  private simulate(): Promise<MockApiResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1) {
          reject(new Error('Mock API error'));
        } else {
          resolve({ success: true });
        }
      }, 400);
    });
  }

  submitPersonalInfo(data: PersonalInfo): Promise<MockApiResponse> {
    return this.simulate();
  }

  uploadDocument(file: File): Promise<MockApiResponse> {
    return this.simulate();
  }

  submitContactInfo(data: ContactInfo): Promise<MockApiResponse> {
    return this.simulate();
  }

  submitAll(): Promise<MockApiResponse> {
    return this.simulate();
  }
}
