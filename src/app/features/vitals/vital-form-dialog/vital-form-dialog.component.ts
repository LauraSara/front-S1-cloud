import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VitalSign } from '../../../models/vital-sign.model';
import { VitalSignService } from '../../../services/vital-sign.service';
import { bloodPressureValidator } from '../../../shared/validators/blood-pressure.validator';
import { vitalRangeValidator } from '../../../shared/validators/vital-range.validator';

export interface VitalFormDialogData {
  pacienteId: number;
  pacienteNombre: string;
  vitalId?: number;
}

@Component({
  selector: 'app-vital-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './vital-form-dialog.component.html'
})
export class VitalFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly vitalService = inject(VitalSignService);
  private readonly snackBar = inject(MatSnackBar);
  readonly data = inject<VitalFormDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<VitalFormDialogComponent>);

  saving = false;
  loading = false;

  readonly form = this.fb.group(
    {
      frecuenciaCardiaca: [null as number | null, [Validators.required, vitalRangeValidator(40, 200)]],
      saturacionOxigeno: [null as number | null, [Validators.required, vitalRangeValidator(0, 100)]],
      presionSistolica: [null as number | null, [Validators.required, vitalRangeValidator(60, 250)]],
      presionDiastolica: [null as number | null, [Validators.required, vitalRangeValidator(40, 150)]],
      temperatura: [null as number | null, [Validators.required, vitalRangeValidator(35, 42)]]
    },
    { validators: bloodPressureValidator() }
  );

  get isEdit(): boolean {
    return !!this.data.vitalId;
  }

  ngOnInit(): void {
    if (this.data.vitalId) {
      this.loading = true;
      this.vitalService.getById(this.data.vitalId).subscribe({
        next: (vital) => this.patchForm(vital),
        error: () => {
          this.loading = false;
          this.snackBar.open('Error al cargar el signo vital.', 'Cerrar', { duration: 5000 });
        }
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formData = this.form.getRawValue();
    const payload = {
      frecuenciaCardiaca: formData.frecuenciaCardiaca!,
      saturacionOxigeno: formData.saturacionOxigeno!,
      presionSistolica: formData.presionSistolica!,
      presionDiastolica: formData.presionDiastolica!,
      temperatura: formData.temperatura!
    };

    const request$ = this.isEdit
      ? this.vitalService.update(this.data.vitalId!, this.data.pacienteId, payload)
      : this.vitalService.create(this.data.pacienteId, payload);

    request$.subscribe({
      next: (vital) => {
        this.snackBar.open(
          this.isEdit ? 'Signos vitales actualizados correctamente.' : 'Signos vitales registrados correctamente.',
          'Cerrar',
          { duration: 3000 }
        );
        this.dialogRef.close(vital);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open(
          this.isEdit ? 'Error al actualizar signos vitales.' : 'Error al registrar signos vitales.',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }

  private patchForm(vital: VitalSign): void {
    this.form.patchValue({
      frecuenciaCardiaca: vital.frecuenciaCardiaca,
      saturacionOxigeno: vital.saturacionOxigeno,
      presionSistolica: vital.presionSistolica,
      presionDiastolica: vital.presionDiastolica,
      temperatura: vital.temperatura
    });
    this.loading = false;
  }
}
