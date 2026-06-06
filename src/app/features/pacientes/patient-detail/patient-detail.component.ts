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
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { forkJoin } from 'rxjs';
import { Patient } from '../../../models/patient.model';
import { VitalSign } from '../../../models/vital-sign.model';
import { PatientService } from '../../../services/patient.service';
import { VitalSignService } from '../../../services/vital-sign.service';
import { SeverityBadgeComponent } from '../../../shared/components/severity-badge/severity-badge.component';
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
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  patient: Patient | null = null;
  latestVital: VitalSign | null = null;
  vitalsHistory: VitalSign[] = [];
  loading = true;

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

  loadData(id: number): void {
    this.loading = true;
    forkJoin({
      patient: this.patientService.getById(id),
      vitals: this.vitalService.getHistory(id),
      latest: this.vitalService.getLatest(id)
    }).subscribe({
      next: ({ patient, vitals, latest }) => {
        this.patient = patient;
        this.vitalsHistory = vitals;
        this.latestVital = latest;
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
      (a, b) => new Date(a.fechaRegistro).getTime() - new Date(b.fechaRegistro).getTime()
    );

    this.chartData = {
      labels: sorted.map((v) =>
        new Date(v.fechaRegistro).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
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
      data: { pacienteId: this.patient.id, pacienteNombre: this.patient.nombre }
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.loadData(this.patient!.id);
    });
  }
}
