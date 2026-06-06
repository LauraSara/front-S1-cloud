import { Injectable, inject } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import {
  Alert,
  AlertAcknowledgeData,
  AlertFormData,
  AlertStatus,
  AlertUpdatePayload
} from '../models/alert.model';
import { Patient, patientFullName } from '../models/patient.model';
import { PatientService } from './patient.service';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly api = inject(ApiService);
  private readonly patientService = inject(PatientService);

  getAll(): Observable<Alert[]> {
    return this.enrichAlerts(this.api.get<Alert[]>('/alertas'));
  }

  getById(id: number): Observable<Alert> {
    return this.enrichAlert(this.api.get<Alert>(`/alertas/${id}`));
  }

  getByPaciente(pacienteId: number): Observable<Alert[]> {
    return this.enrichAlerts(this.api.get<Alert[]>(`/alertas/paciente/${pacienteId}`));
  }

  getByEstado(estado: AlertStatus): Observable<Alert[]> {
    return this.enrichAlerts(this.api.get<Alert[]>(`/alertas/estado/${estado}`));
  }

  getActive(): Observable<Alert[]> {
    return this.getByEstado('ACTIVA');
  }

  create(data: AlertFormData): Observable<Alert> {
    return this.api.post<Alert>('/alertas', data);
  }

  update(id: number, data: AlertUpdatePayload): Observable<Alert> {
    return this.api.put<Alert>(`/alertas/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`/alertas/${id}`);
  }

  acknowledge(id: number, alert: Alert, data: AlertAcknowledgeData): Observable<Alert> {
    const payload: AlertUpdatePayload = {
      pacienteId: alert.pacienteId,
      tipo: alert.tipo,
      severidad: alert.severidad,
      estado: 'ATENDIDA',
      descripcion: `${alert.descripcion}\n[Atención] ${data.motivo}: ${data.observaciones}`
    };

    return this.update(id, payload);
  }

  private enrichAlerts(source$: Observable<Alert[]>): Observable<Alert[]> {
    return source$.pipe(
      switchMap((alerts) =>
        this.patientService.getAll().pipe(
          map((patients) => this.attachPatientNames(alerts, patients))
        )
      )
    );
  }

  private enrichAlert(source$: Observable<Alert>): Observable<Alert> {
    return source$.pipe(
      switchMap((alert) =>
        this.patientService.getAll().pipe(
          map((patients) => ({
            ...alert,
            pacienteNombre: this.resolvePatientName(alert.pacienteId, patients),
            pacienteHabitacion: patients.find((p) => p.id === alert.pacienteId)?.habitacion
          }))
        )
      )
    );
  }

  private attachPatientNames(alerts: Alert[], patients: Patient[]): Alert[] {
    return alerts.map((alert) => {
      const patient = patients.find((p) => p.id === alert.pacienteId);
      return {
        ...alert,
        pacienteNombre: patient ? patientFullName(patient) : `Paciente #${alert.pacienteId}`,
        pacienteHabitacion: patient?.habitacion
      };
    });
  }

  private resolvePatientName(pacienteId: number, patients: Patient[]): string {
    const patient = patients.find((p) => p.id === pacienteId);
    return patient ? patientFullName(patient) : `Paciente #${pacienteId}`;
  }
}
