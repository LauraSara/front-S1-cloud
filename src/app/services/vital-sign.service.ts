import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { VitalSign, VitalSignFormData } from '../models/vital-sign.model';

@Injectable({ providedIn: 'root' })
export class VitalSignService {
  private readonly api = inject(ApiService);

  getAll(): Observable<VitalSign[]> {
    return this.api.get<VitalSign[]>('/signos-vitales');
  }

  getById(id: number): Observable<VitalSign> {
    return this.api.get<VitalSign>(`/signos-vitales/${id}`);
  }

  getHistory(pacienteId: number): Observable<VitalSign[]> {
    return this.api.get<VitalSign[]>(`/signos-vitales/paciente/${pacienteId}`);
  }

  getLatest(pacienteId: number): Observable<VitalSign | null> {
    return this.api.get<VitalSign[]>(`/signos-vitales/paciente/${pacienteId}/ultimos`).pipe(
      map((vitals) => vitals[0] ?? null)
    );
  }

  create(pacienteId: number, data: VitalSignFormData): Observable<VitalSign> {
    return this.api.post<VitalSign>('/signos-vitales', {
      pacienteId,
      ...data
    });
  }

  update(id: number, pacienteId: number, data: VitalSignFormData): Observable<VitalSign> {
    return this.api.put<VitalSign>(`/signos-vitales/${id}`, {
      pacienteId,
      ...data
    });
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/signos-vitales/${id}`);
  }
}
