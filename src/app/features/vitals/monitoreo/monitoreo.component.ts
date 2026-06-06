import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, interval, of, startWith, switchMap } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ClinicalSeverity, VitalSign } from '../../../models/vital-sign.model';
import { Patient, patientFullName } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service';
import { VitalSignService } from '../../../services/vital-sign.service';
import {
  buildSparklinePoints,
  getFcLevel,
  getSpo2Level,
  VitalLevel
} from '../../../shared/utils/sparkline.util';
import { computeVitalSeverity } from '../../../shared/utils/vital-severity.util';

interface MonitoringCard {
  patient: Patient;
  vital: VitalSign | null;
  severity: ClinicalSeverity | null;
  fcTrend: number[];
  spo2Trend: number[];
  roomLabel: string;
  bedLabel: string | null;
}

type SeverityFilter = 'all' | ClinicalSeverity;

@Component({
  selector: 'app-monitoreo',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './monitoreo.component.html',
  styleUrl: './monitoreo.component.scss'
})
export class MonitoreoComponent implements OnInit {
  private readonly patientService = inject(PatientService);
  private readonly vitalService = inject(VitalSignService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  cards: MonitoringCard[] = [];
  loading = true;
  severityFilter: SeverityFilter = 'all';

  readonly buildSparklinePoints = buildSparklinePoints;
  readonly getFcLevel = getFcLevel;
  readonly getSpo2Level = getSpo2Level;

  ngOnInit(): void {
    interval(environment.pollingIntervalVitals)
      .pipe(
        startWith(0),
        switchMap(() => this.loadMonitoringData()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (cards) => {
          this.cards = cards;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Error al cargar monitoreo.', 'Cerrar', { duration: 5000 });
        }
      });
  }

  get visibleCards(): MonitoringCard[] {
    if (this.severityFilter === 'all') {
      return this.cards;
    }
    return this.cards.filter((card) => card.severity === this.severityFilter);
  }

  get alertsRequiringAttention(): number {
    return this.cards.filter(
      (card) => card.severity === 'CRITICO' || card.severity === 'ADVERTENCIA'
    ).length;
  }

  patientName(patient: Patient): string {
    return patientFullName(patient);
  }

  cardStatus(card: MonitoringCard): 'normal' | 'critical' | 'attention' {
    if (card.severity === 'CRITICO') {
      return 'critical';
    }
    if (card.severity === 'ADVERTENCIA') {
      return 'attention';
    }
    return 'normal';
  }

  statusLabel(card: MonitoringCard): string | null {
    if (card.severity === 'CRITICO') {
      return 'Crítico';
    }
    if (card.severity === 'ADVERTENCIA') {
      return 'Atención';
    }
    return null;
  }

  fcLevel(card: MonitoringCard): VitalLevel {
    if (!card.vital) {
      return 'normal';
    }
    return getFcLevel(card.vital.frecuenciaCardiaca);
  }

  spo2Level(card: MonitoringCard): VitalLevel {
    if (!card.vital) {
      return 'normal';
    }
    return getSpo2Level(card.vital.saturacionOxigeno);
  }

  setFilter(filter: SeverityFilter): void {
    this.severityFilter = filter;
  }

  filterLabel(): string {
    const labels: Record<SeverityFilter, string> = {
      all: 'Todos',
      CRITICO: 'Críticos',
      ADVERTENCIA: 'Atención',
      NORMAL: 'Estables'
    };
    return labels[this.severityFilter];
  }

  private loadMonitoringData() {
    return this.patientService.getAll().pipe(
      switchMap((patients) => {
        if (patients.length === 0) {
          return of([] as MonitoringCard[]);
        }

        const requests = patients.map((patient) =>
          forkJoin({
            vital: this.vitalService.getLatest(patient.id).pipe(catchError(() => of(null))),
            history: this.vitalService.getHistory(patient.id).pipe(catchError(() => of([] as VitalSign[])))
          }).pipe(
            map(({ vital, history }) => this.buildCard(patient, vital, history))
          )
        );

        return forkJoin(requests);
      })
    );
  }

  private buildCard(patient: Patient, vital: VitalSign | null, history: VitalSign[]): MonitoringCard {
    const sortedHistory = [...history]
      .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
      .slice(-8);

    let fcTrend = sortedHistory.map((item) => item.frecuenciaCardiaca);
    let spo2Trend = sortedHistory.map((item) => item.saturacionOxigeno);

    if (vital) {
      if (fcTrend.length === 0) {
        fcTrend = [vital.frecuenciaCardiaca];
      }
      if (spo2Trend.length === 0) {
        spo2Trend = [vital.saturacionOxigeno];
      }
    }

    const { roomLabel, bedLabel } = this.parseLocation(patient.habitacion);

    return {
      patient,
      vital,
      severity: vital ? computeVitalSeverity(vital) : null,
      fcTrend,
      spo2Trend,
      roomLabel,
      bedLabel
    };
  }

  private parseLocation(habitacion: string): { roomLabel: string; bedLabel: string | null } {
    const parts = habitacion.split('-').map((part) => part.trim());
    if (parts.length >= 2) {
      return {
        roomLabel: parts[0],
        bedLabel: parts.slice(1).join(' - ')
      };
    }
    return {
      roomLabel: habitacion,
      bedLabel: null
    };
  }
}
