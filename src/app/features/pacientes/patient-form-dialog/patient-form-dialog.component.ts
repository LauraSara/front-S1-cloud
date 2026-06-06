import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Patient, PatientFormData, PatientStatus } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service';
import { rutValidator } from '../../../shared/validators/rut.validator';

export interface PatientFormDialogData {
  patient?: Patient;
}

@Component({
  selector: 'app-patient-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  templateUrl: './patient-form-dialog.component.html'
})
export class PatientFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly patientService = inject(PatientService);
  private readonly snackBar = inject(MatSnackBar);
  readonly data = inject<PatientFormDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<PatientFormDialogComponent>);

  readonly estados: PatientStatus[] = ['ESTABLE', 'CRITICO', 'OBSERVACION'];
  saving = false;

  readonly form = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    apellido: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    rut: ['', [Validators.required, rutValidator()]],
    edad: [null as number | null, [Validators.required, Validators.min(0), Validators.max(150)]],
    habitacion: ['', [Validators.required, Validators.pattern(/^[A-Z]?\d{3,4}$/i)]],
    diagnostico: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
    estado: ['ESTABLE' as PatientStatus, Validators.required]
  });

  get isEdit(): boolean {
    return !!this.data.patient;
  }

  ngOnInit(): void {
    if (this.data.patient) {
      this.form.patchValue(this.data.patient);
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formData = this.form.getRawValue() as PatientFormData;
    const request$ = this.isEdit
      ? this.patientService.update(this.data.patient!.id, {
          ...this.data.patient!,
          ...formData
        })
      : this.patientService.create(formData);

    request$.subscribe({
      next: (patient) => {
        this.snackBar.open(
          this.isEdit ? 'Paciente actualizado correctamente.' : 'Paciente creado correctamente.',
          'Cerrar',
          { duration: 3000 }
        );
        this.dialogRef.close(patient);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Error al guardar el paciente.', 'Cerrar', { duration: 5000 });
      }
    });
  }
}
