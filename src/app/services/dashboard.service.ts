import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { DashboardSummary } from '../models/dashboard.model';
import { Alert } from '../models/alert.model';
import { VitalSign } from '../models/vital-sign.model';
import { AlertService } from './alert.service';
import { PatientService } from './patient.service';
import { VitalSignService } from './vital-sign.service';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly patientService = inject(PatientService);
  private readonly alertService = inject(AlertService);
  private readonly vitalSignService = inject(VitalSignService);

  getSummary(): Observable<DashboardSummary> {
    return forkJoin({
      pacientesCriticos: this.patientService.getByEstado('CRITICO'),
      alertasActivas: this.alertService.getActive(),
      signosVitales: this.vitalSignService.getAll()
    }).pipe(
      map(({ pacientesCriticos, alertasActivas, signosVitales }) => ({
        pacientesCriticos: pacientesCriticos.length,
        alertasActivas: alertasActivas.length,
        medicionesUltimas24h: this.countLast24Hours(signosVitales),
        alertasRecientes: this.sortRecentAlerts(alertasActivas)
      }))
    );
  }

  private countLast24Hours(signosVitales: VitalSign[]): number {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return signosVitales.filter((vital) => new Date(vital.fechaHora).getTime() >= cutoff).length;
  }

  private sortRecentAlerts(alerts: Alert[]): Alert[] {
    return [...alerts]
      .sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime())
      .slice(0, 5);
  }
}
