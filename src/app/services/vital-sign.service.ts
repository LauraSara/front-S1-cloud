import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { VitalSign, VitalSignFormData } from '../models/vital-sign.model';

@Injectable({ providedIn: 'root' })
export class VitalSignService {
  private readonly api = inject(ApiService);

  getHistory(pacienteId: number): Observable<VitalSign[]> {
    return this.api.get<VitalSign[]>(`/pacientes/${pacienteId}/vitals`);
  }

  getLatest(pacienteId: number): Observable<VitalSign> {
    return this.api.get<VitalSign>(`/pacientes/${pacienteId}/vitals/latest`);
  }

  create(pacienteId: number, data: VitalSignFormData): Observable<VitalSign> {
    return this.api.post<VitalSign>(`/pacientes/${pacienteId}/vitals`, data);
  }
}
