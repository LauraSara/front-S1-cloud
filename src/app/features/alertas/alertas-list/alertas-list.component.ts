import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { combineLatest, startWith } from 'rxjs';
import { Alert, AlertSeverity } from '../../../models/alert.model';
import { AlertService } from '../../../services/alert.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  ALERT_FREQUENCY_CHART_OPTIONS,
  buildAlertFrequencyChart,
  formatAlertDateTime,
  severityClass,
  severityLabel
} from '../../../shared/utils/alert-chart.util';
import { AlertAcknowledgeDialogComponent } from '../alert-acknowledge-dialog/alert-acknowledge-dialog.component';
import { AlertFormDialogComponent } from '../alert-form-dialog/alert-form-dialog.component';

type PaginationItem = number | 'ellipsis';

@Component({
  selector: 'app-alertas-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    BaseChartDirective
  ],
  templateUrl: './alertas-list.component.html',
  styleUrl: './alertas-list.component.scss'
})
export class AlertasListComponent implements OnInit {
  private readonly alertService = inject(AlertService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  allAlerts: Alert[] = [];
  filteredAlerts: Alert[] = [];
  paginatedAlerts: Alert[] = [];
  loading = true;
  pageIndex = 0;
  readonly pageSize = 5;
  readonly severityLabel = severityLabel;
  readonly severityClass = severityClass;
  readonly formatAlertDateTime = formatAlertDateTime;

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly fechaInicioControl = new FormControl('');
  readonly fechaFinControl = new FormControl('');
  readonly severidadControl = new FormControl<AlertSeverity | ''>('');
  readonly tipoControl = new FormControl('');

  readonly displayedColumns = [
    'fecha',
    'severidad',
    'tipo',
    'paciente',
    'habitacion',
    'estado',
    'acciones'
  ];

  chartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  chartOptions = ALERT_FREQUENCY_CHART_OPTIONS;

  ngOnInit(): void {
    this.loadAlerts();

    combineLatest([
      this.searchControl.valueChanges.pipe(startWith('')),
      this.fechaInicioControl.valueChanges.pipe(startWith('')),
      this.fechaFinControl.valueChanges.pipe(startWith('')),
      this.severidadControl.valueChanges.pipe(startWith('' as AlertSeverity | '')),
      this.tipoControl.valueChanges.pipe(startWith(''))
    ]).subscribe(() => {
      this.applyFilters();
    });
  }

  get tipos(): string[] {
    return [...new Set(this.allAlerts.map((alert) => alert.tipo))].sort();
  }

  get criticalCount(): number {
    return this.filteredAlerts.filter((alert) => alert.severidad === 'ALTA').length;
  }

  get warningCount(): number {
    return this.filteredAlerts.filter((alert) => alert.severidad === 'MEDIA').length;
  }

  get infoCount(): number {
    return this.filteredAlerts.filter((alert) => alert.severidad === 'BAJA').length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAlerts.length / this.pageSize));
  }

  get paginationItems(): PaginationItem[] {
    const total = this.totalPages;
    const current = this.pageIndex + 1;

    if (total <= 5) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const items: PaginationItem[] = [1];

    if (current > 3) {
      items.push('ellipsis');
    }

    for (let page = Math.max(2, current - 1); page <= Math.min(total - 1, current + 1); page++) {
      items.push(page);
    }

    if (current < total - 2) {
      items.push('ellipsis');
    }

    items.push(total);
    return items;
  }

  get rangeStart(): number {
    return this.filteredAlerts.length === 0 ? 0 : this.pageIndex * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min((this.pageIndex + 1) * this.pageSize, this.filteredAlerts.length);
  }

  loadAlerts(): void {
    this.loading = true;

    this.alertService.getAll().subscribe({
      next: (data) => {
        this.allAlerts = [...data].sort(
          (a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()
        );
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar alertas.', 'Cerrar', { duration: 5000 });
      }
    });
  }

  applyFilters(): void {
    const search = this.searchControl.value.trim().toLowerCase();
    const fechaInicio = this.fechaInicioControl.value;
    const fechaFin = this.fechaFinControl.value;
    const severidad = this.severidadControl.value;
    const tipo = this.tipoControl.value;

    this.filteredAlerts = this.allAlerts.filter((alert) => {
      const alertDate = new Date(alert.fechaHora);
      const alertCode = `AL-${String(alert.id).padStart(4, '0')}`.toLowerCase();
      const matchesSearch =
        !search ||
        alert.pacienteNombre?.toLowerCase().includes(search) ||
        alertCode.includes(search) ||
        String(alert.id).includes(search) ||
        alert.tipo.toLowerCase().includes(search);

      const matchesStart = !fechaInicio || alertDate >= new Date(`${fechaInicio}T00:00:00`);
      const matchesEnd = !fechaFin || alertDate <= new Date(`${fechaFin}T23:59:59`);
      const matchesSeverity = !severidad || alert.severidad === severidad;
      const matchesTipo = !tipo || alert.tipo === tipo;

      return matchesSearch && matchesStart && matchesEnd && matchesSeverity && matchesTipo;
    });

    this.chartData = buildAlertFrequencyChart(this.filteredAlerts);
    this.pageIndex = 0;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = this.pageIndex * this.pageSize;
    this.paginatedAlerts = this.filteredAlerts.slice(start, start + this.pageSize);
  }

  goToPage(index: number): void {
    if (index < 0 || index >= this.totalPages) {
      return;
    }
    this.pageIndex = index;
    this.updatePagination();
  }

  openCreate(): void {
    const ref = this.dialog.open(AlertFormDialogComponent, { width: '500px' });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadAlerts();
    });
  }

  openEdit(alert: Alert): void {
    const ref = this.dialog.open(AlertFormDialogComponent, {
      width: '500px',
      data: { alertId: alert.id }
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadAlerts();
    });
  }

  openAcknowledge(alert: Alert): void {
    this.alertService.getById(alert.id).subscribe({
      next: (freshAlert) => {
        const ref = this.dialog.open(AlertAcknowledgeDialogComponent, {
          width: '500px',
          data: freshAlert
        });

        ref.afterClosed().subscribe((result) => {
          if (result) this.loadAlerts();
        });
      },
      error: () => {
        this.snackBar.open('Error al cargar la alerta.', 'Cerrar', { duration: 5000 });
      }
    });
  }

  confirmDelete(alert: Alert): void {
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
            this.loadAlerts();
          },
          error: () => {
            this.snackBar.open('Error al eliminar la alerta.', 'Cerrar', { duration: 5000 });
          }
        });
      }
    });
  }
}
