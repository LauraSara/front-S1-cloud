import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Alert } from '../../../models/alert.model';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-alert-acknowledge-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './alert-acknowledge-dialog.component.html'
})
export class AlertAcknowledgeDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly alertService = inject(AlertService);
  private readonly snackBar = inject(MatSnackBar);
  readonly data = inject<Alert>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<AlertAcknowledgeDialogComponent>);

  saving = false;

  readonly form = this.fb.group({
    motivo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    observaciones: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formData = this.form.getRawValue();

    this.alertService.acknowledge(this.data.id, this.data, {
      motivo: formData.motivo!,
      observaciones: formData.observaciones!
    }).subscribe({
      next: () => {
        this.snackBar.open('Alerta atendida correctamente.', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Error al atender la alerta.', 'Cerrar', { duration: 5000 });
      }
    });
  }
}
