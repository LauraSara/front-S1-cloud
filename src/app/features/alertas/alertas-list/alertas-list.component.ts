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
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { SeverityBadgeComponent } from '../../../shared/components/severity-badge/severity-badge.component';
import { AlertAcknowledgeDialogComponent } from '../alert-acknowledge-dialog/alert-acknowledge-dialog.component';
import { AlertFormDialogComponent } from '../alert-form-dialog/alert-form-dialog.component';

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
  loading = true;

  readonly estadoControl = new FormControl<AlertStatus | ''>('');
  readonly displayedColumns = ['paciente', 'tipo', 'descripcion', 'severidad', 'estado', 'fecha', 'acciones'];

  ngOnInit(): void {
    this.loadAlerts();

    this.estadoControl.valueChanges.pipe(startWith('')).subscribe(() => {
      this.loadAlerts();
    });
  }

  loadAlerts(): void {
    this.loading = true;
    const estado = this.estadoControl.value;
    const request$ = estado
      ? this.alertService.getByEstado(estado)
      : this.alertService.getAll();

    request$.subscribe({
      next: (data) => {
        this.alerts = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar alertas.', 'Cerrar', { duration: 5000 });
      }
    });
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
