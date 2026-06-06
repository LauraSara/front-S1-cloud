import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { Patient, PatientFormData, PatientStatus } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly api = inject(ApiService);

  getAll(): Observable<Patient[]> {
    return this.api.get<Patient[]>('/pacientes');
  }

  getById(id: number): Observable<Patient> {
    return this.api.get<Patient>(`/pacientes/${id}`);
  }

  getByEstado(estado: PatientStatus): Observable<Patient[]> {
    return this.api.get<Patient[]>(`/pacientes/estado/${estado}`);
  }

  create(data: PatientFormData): Observable<Patient> {
    return this.api.post<Patient>('/pacientes', data);
  }

  update(id: number, patient: Patient): Observable<Patient> {
    return this.api.put<Patient>(`/pacientes/${id}`, patient);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/pacientes/${id}`);
  }
}
