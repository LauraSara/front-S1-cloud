import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Alert, AlertFormData, AlertSeverity, AlertStatus } from '../../../models/alert.model';
import { Patient, patientFullName } from '../../../models/patient.model';
import { AlertService } from '../../../services/alert.service';
import { PatientService } from '../../../services/patient.service';

export interface AlertFormDialogData {
  alertId?: number;
  pacienteId?: number;
}

@Component({
  selector: 'app-alert-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './alert-form-dialog.component.html'
})
export class AlertFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly alertService = inject(AlertService);
  private readonly patientService = inject(PatientService);
  private readonly snackBar = inject(MatSnackBar);
  readonly data = inject<AlertFormDialogData | null>(MAT_DIALOG_DATA) ?? {};
  readonly dialogRef = inject(MatDialogRef<AlertFormDialogComponent>);

  patients: Patient[] = [];
  saving = false;
  loading = false;

  readonly tipos = ['TAQUICARDIA', 'HIPOXIA', 'HIPERTENSION', 'HIPOTERMIA', 'OTRO'];
  readonly severidades: AlertSeverity[] = ['ALTA', 'MEDIA', 'BAJA'];
  readonly estados: AlertStatus[] = ['ACTIVA', 'ATENDIDA'];

  readonly form = this.fb.group({
    pacienteId: [null as number | null, Validators.required],
    tipo: ['', Validators.required],
    severidad: ['ALTA' as AlertSeverity, Validators.required],
    descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
    estado: ['ACTIVA' as AlertStatus, Validators.required]
  });

  get isEdit(): boolean {
    return !!this.data.alertId;
  }

  get lockPaciente(): boolean {
    return this.data.pacienteId != null;
  }

  ngOnInit(): void {
    if (this.data.pacienteId != null) {
      this.form.patchValue({ pacienteId: this.data.pacienteId });
    }

    this.patientService.getAll().subscribe({
      next: (patients) => {
        this.patients = patients;
      },
      error: () => {
        this.snackBar.open('Error al cargar pacientes.', 'Cerrar', { duration: 5000 });
      }
    });

    if (this.data.alertId) {
      this.loading = true;
      this.alertService.getById(this.data.alertId).subscribe({
        next: (alert) => this.patchForm(alert),
        error: () => {
          this.loading = false;
          this.snackBar.open('Error al cargar la alerta.', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }

  patientLabel(patient: Patient): string {
    return patientFullName(patient);
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formData = this.form.getRawValue() as AlertFormData;

    const request$ = this.isEdit
      ? this.alertService.update(this.data.alertId!, formData)
      : this.alertService.create(formData);

    request$.subscribe({
      next: (alert) => {
        this.snackBar.open(
          this.isEdit ? 'Alerta actualizada correctamente.' : 'Alerta creada correctamente.',
          'Cerrar',
          { duration: 3000 }
        );
        this.dialogRef.close(alert);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open(
          this.isEdit ? 'Error al actualizar la alerta.' : 'Error al crear la alerta.',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }

  private patchForm(alert: Alert): void {
    this.form.patchValue({
      pacienteId: alert.pacienteId,
      tipo: alert.tipo,
      severidad: alert.severidad,
      descripcion: alert.descripcion,
      estado: alert.estado
    });
    this.loading = false;
  }
}
