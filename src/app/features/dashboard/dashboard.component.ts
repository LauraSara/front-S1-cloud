import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { interval, startWith, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardSummary } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import { SeverityBadgeComponent } from '../../shared/components/severity-badge/severity-badge.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    SeverityBadgeComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  summary: DashboardSummary | null = null;
  loading = true;
  error = false;

  readonly displayedColumns = ['paciente', 'tipo', 'descripcion', 'severidad', 'fecha'];

  ngOnInit(): void {
    interval(environment.pollingIntervalDashboard)
      .pipe(
        startWith(0),
        switchMap(() => this.dashboardService.getSummary()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (data) => {
          this.summary = data;
          this.loading = false;
          this.error = false;
        },
        error: () => {
          this.loading = false;
          this.error = true;
        }
      });
  }
}
