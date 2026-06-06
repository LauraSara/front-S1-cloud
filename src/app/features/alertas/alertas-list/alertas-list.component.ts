import { DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { startWith } from 'rxjs/operators';
import { Alert, AlertStatus } from '../../../models/alert.model';
import { AlertService } from '../../../services/alert.service';
import { SeverityBadgeComponent } from '../../../shared/components/severity-badge/severity-badge.component';
import { AlertAcknowledgeDialogComponent } from '../alert-acknowledge-dialog/alert-acknowledge-dialog.component';

@Component({
  selector: 'app-alertas-list',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    SeverityBadgeComponent
  ],
  templateUrl: './alertas-list.component.html',
  styleUrl: './alertas-list.component.scss'
})
export class AlertasListComponent implements OnInit {
  private readonly alertService = inject(AlertService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  alerts: Alert[] = [];
  filteredAlerts: Alert[] = [];
  loading = true;

  readonly estadoControl = new FormControl<AlertStatus | ''>('');
  readonly displayedColumns = ['paciente', 'tipo', 'mensaje', 'severidad', 'estado', 'fecha', 'acciones'];

  ngOnInit(): void {
    this.loadAlerts();

    this.estadoControl.valueChanges.pipe(startWith('')).subscribe(() => {
      this.applyFilter();
    });
  }

  loadAlerts(): void {
    this.loading = true;
    this.alertService.getAll().subscribe({
      next: (data) => {
        this.alerts = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar alertas.', 'Cerrar', { duration: 5000 });
      }
    });
  }

  applyFilter(): void {
    const estado = this.estadoControl.value;
    this.filteredAlerts = estado
      ? this.alerts.filter((a) => a.estado === estado)
      : [...this.alerts];
  }

  openAcknowledge(alert: Alert): void {
    const ref = this.dialog.open(AlertAcknowledgeDialogComponent, {
      width: '500px',
      data: alert
    });

    ref.afterClosed().subscribe((result) => {
      if (result) this.loadAlerts();
    });
  }
}
