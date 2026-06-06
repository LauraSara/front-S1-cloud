import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { interval, startWith, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardSummary } from '../../models/dashboard.model';
import { DashboardService } from '../../services/dashboard.service';
import {
  ALERT_FREQUENCY_CHART_OPTIONS,
  buildAlertFrequencyChart,
  severityClass,
  severityLabel
} from '../../shared/utils/alert-chart.util';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    BaseChartDirective
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
  lastUpdated: Date | null = null;
  readonly severityLabel = severityLabel;
  readonly severityClass = severityClass;

  chartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  chartOptions = ALERT_FREQUENCY_CHART_OPTIONS;

  readonly displayedColumns = ['fecha', 'severidad', 'tipo', 'paciente', 'habitacion'];

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
          this.chartData = buildAlertFrequencyChart(data.alertasRecientes);
          this.lastUpdated = new Date();
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
