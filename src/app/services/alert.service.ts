import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { Alert, AlertAcknowledgeData } from '../models/alert.model';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly api = inject(ApiService);

  getAll(estado?: string): Observable<Alert[]> {
    const params = estado ? { estado } : undefined;
    return this.api.get<Alert[]>('/alertas', params);
  }

  getActive(): Observable<Alert[]> {
    return this.api.get<Alert[]>('/alertas', { estado: 'activa' });
  }

  acknowledge(id: number, data: AlertAcknowledgeData): Observable<Alert> {
    return this.api.put<Alert>(`/alertas/${id}/acknowledge`, data);
  }
}
