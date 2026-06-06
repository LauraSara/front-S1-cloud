import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VitalSignService } from '../../../services/vital-sign.service';
import { bloodPressureValidator } from '../../../shared/validators/blood-pressure.validator';
import { vitalRangeValidator } from '../../../shared/validators/vital-range.validator';

export interface VitalFormDialogData {
  pacienteId: number;
  pacienteNombre: string;
}

@Component({
  selector: 'app-vital-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './vital-form-dialog.component.html'
})
export class VitalFormDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly vitalService = inject(VitalSignService);
  private readonly snackBar = inject(MatSnackBar);
  readonly data = inject<VitalFormDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<VitalFormDialogComponent>);

  saving = false;

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

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formData = this.form.getRawValue();

    this.vitalService.create(this.data.pacienteId, {
      frecuenciaCardiaca: formData.frecuenciaCardiaca!,
      saturacionOxigeno: formData.saturacionOxigeno!,
      presionSistolica: formData.presionSistolica!,
      presionDiastolica: formData.presionDiastolica!,
      temperatura: formData.temperatura!
    }).subscribe({
      next: (vital) => {
        this.snackBar.open('Signos vitales registrados correctamente.', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(vital);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Error al registrar signos vitales.', 'Cerrar', { duration: 5000 });
      }
    });
  }
}
