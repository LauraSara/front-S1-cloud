import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { forkJoin } from 'rxjs';
import { Alert } from '../../../models/alert.model';
import { ClinicalSeverity } from '../../../models/vital-sign.model';
import { Patient, patientFullName } from '../../../models/patient.model';
import { VitalSign } from '../../../models/vital-sign.model';
import { AlertService } from '../../../services/alert.service';
import { PatientService } from '../../../services/patient.service';
import { VitalSignService } from '../../../services/vital-sign.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SeverityBadgeComponent } from '../../../shared/components/severity-badge/severity-badge.component';
import { computeVitalSeverity } from '../../../shared/utils/vital-severity.util';
import { AlertFormDialogComponent } from '../../alertas/alert-form-dialog/alert-form-dialog.component';
import { VitalFormDialogComponent } from '../../vitals/vital-form-dialog/vital-form-dialog.component';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    BaseChartDirective,
    SeverityBadgeComponent
  ],
  templateUrl: './patient-detail.component.html',
  styleUrl: './patient-detail.component.scss'
})
export class PatientDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly patientService = inject(PatientService);
  private readonly vitalService = inject(VitalSignService);
  private readonly alertService = inject(AlertService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  patient: Patient | null = null;
  latestVital: VitalSign | null = null;
  latestVitalSeverity: ClinicalSeverity | null = null;
  vitalsHistory: VitalSign[] = [];
  patientAlerts: Alert[] = [];
  loading = true;

  readonly vitalColumns = ['fecha', 'fc', 'spo2', 'pa', 'temp', 'severidad', 'acciones'];
  readonly alertColumns = ['tipo', 'descripcion', 'severidad', 'estado', 'fecha', 'acciones'];

  chartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: false } }
  };

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = Number(params.get('id'));
        if (id) this.loadData(id);
      });
  }

  fullName(patient: Patient): string {
    return patientFullName(patient);
  }

  vitalSeverity(vital: VitalSign): ClinicalSeverity {
    return computeVitalSeverity(vital);
  }

  loadData(id: number): void {
    this.loading = true;
    forkJoin({
      patient: this.patientService.getById(id),
      vitals: this.vitalService.getHistory(id),
      latest: this.vitalService.getLatest(id),
      alerts: this.alertService.getByPaciente(id)
    }).subscribe({
      next: ({ patient, vitals, latest, alerts }) => {
        this.patient = patient;
        this.vitalsHistory = vitals;
        this.latestVital = latest;
        this.latestVitalSeverity = latest ? computeVitalSeverity(latest) : null;
        this.patientAlerts = alerts;
        this.buildChart(vitals);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar datos del paciente.', 'Cerrar', { duration: 5000 });
      }
    });
  }

  buildChart(vitals: VitalSign[]): void {
    const sorted = [...vitals].sort(
      (a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime()
    );

    this.chartData = {
      labels: sorted.map((v) =>
        new Date(v.fechaHora).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
      ),
      datasets: [
        {
          label: 'FC (lpm)',
          data: sorted.map((v) => v.frecuenciaCardiaca),
          borderColor: '#0B5ED7',
          backgroundColor: 'rgba(11, 94, 215, 0.1)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'SpO₂ (%)',
          data: sorted.map((v) => v.saturacionOxigeno),
          borderColor: '#198754',
          backgroundColor: 'rgba(25, 135, 84, 0.1)',
          tension: 0.3,
          fill: true
        }
      ]
    };
  }

  openVitalForm(): void {
    if (!this.patient) return;

    const ref = this.dialog.open(VitalFormDialogComponent, {
      width: '480px',
      data: { pacienteId: this.patient.id, pacienteNombre: patientFullName(this.patient) }
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData(this.patient!.id);
    });
  }

  openVitalEdit(vital: VitalSign): void {
    if (!this.patient) return;

    const ref = this.dialog.open(VitalFormDialogComponent, {
      width: '480px',
      data: {
        pacienteId: this.patient.id,
        pacienteNombre: patientFullName(this.patient),
        vitalId: vital.id
      }
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData(this.patient!.id);
    });
  }

  confirmDeleteVital(vital: VitalSign): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar signo vital',
        message: '¿Está seguro de eliminar este registro de signos vitales?',
        confirmText: 'Eliminar'
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.vitalService.delete(vital.id).subscribe({
          next: () => {
            this.snackBar.open('Signo vital eliminado.', 'Cerrar', { duration: 3000 });
            this.loadData(this.patient!.id);
          },
          error: () => {
            this.snackBar.open('Error al eliminar signo vital.', 'Cerrar', { duration: 5000 });
          }
        });
      }
    });
  }

  openAlertForm(): void {
    if (!this.patient) return;

    const ref = this.dialog.open(AlertFormDialogComponent, {
      width: '500px',
      data: { pacienteId: this.patient.id }
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData(this.patient!.id);
    });
  }

  openAlertEdit(alert: Alert): void {
    const ref = this.dialog.open(AlertFormDialogComponent, {
      width: '500px',
      data: { alertId: alert.id, pacienteId: alert.pacienteId }
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData(this.patient!.id);
    });
  }

  confirmDeleteAlert(alert: Alert): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar alerta',
        message: `¿Está seguro de eliminar la alerta "${alert.tipo}"?`,
        confirmText: 'Eliminar'
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.alertService.delete(alert.id).subscribe({
          next: () => {
            this.snackBar.open('Alerta eliminada.', 'Cerrar', { duration: 3000 });
            this.loadData(this.patient!.id);
          },
          error: () => {
            this.snackBar.open('Error al eliminar la alerta.', 'Cerrar', { duration: 5000 });
          }
        });
      }
    });
  }
}
