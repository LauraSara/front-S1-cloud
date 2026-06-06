import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, interval, of, startWith, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Patient } from '../../../models/patient.model';
import { VitalSign } from '../../../models/vital-sign.model';
import { PatientService } from '../../../services/patient.service';
import { VitalSignService } from '../../../services/vital-sign.service';
import { SeverityBadgeComponent } from '../../../shared/components/severity-badge/severity-badge.component';

interface MonitoringCard {
  patient: Patient;
  vital: VitalSign | null;
}

@Component({
  selector: 'app-monitoreo',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    SeverityBadgeComponent
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

  private loadMonitoringData() {
    return this.patientService.getAll().pipe(
      switchMap((patients) => {
        const critical = patients.filter((p) => p.estado === 'CRITICO' || p.estado === 'OBSERVACION');
        if (critical.length === 0) {
          return of([] as MonitoringCard[]);
        }

        const requests = critical.map((patient) =>
          this.vitalService.getLatest(patient.id).pipe(
            catchError(() => of(null)),
            switchMap((vital) => of({ patient, vital } as MonitoringCard))
          )
        );

        return forkJoin(requests);
      })
    );
  }
}
