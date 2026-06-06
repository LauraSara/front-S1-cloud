import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
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
import { debounceTime, startWith } from 'rxjs/operators';
import { Patient, PatientStatus } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PatientFormDialogComponent } from '../patient-form-dialog/patient-form-dialog.component';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './pacientes-list.component.html',
  styleUrl: './pacientes-list.component.scss'
})
export class PacientesListComponent implements OnInit {
  private readonly patientService = inject(PatientService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  loading = true;

  readonly searchControl = new FormControl('');
  readonly estadoControl = new FormControl<PatientStatus | ''>('');
  readonly displayedColumns = ['nombre', 'rut', 'habitacion', 'estado', 'acciones'];

  ngOnInit(): void {
    this.loadPatients();

    this.searchControl.valueChanges.pipe(debounceTime(300), startWith('')).subscribe(() => {
      this.applyFilters();
    });

    this.estadoControl.valueChanges.pipe(startWith('')).subscribe(() => {
      this.applyFilters();
    });
  }

  loadPatients(): void {
    this.loading = true;
    this.patientService.getAll().subscribe({
      next: (data) => {
        this.patients = data;
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Error al cargar pacientes.', 'Cerrar', { duration: 5000 });
      }
    });
  }

  applyFilters(): void {
    const search = (this.searchControl.value || '').toLowerCase();
    const estado = this.estadoControl.value;

    this.filteredPatients = this.patients.filter((p) => {
      const matchesSearch =
        p.nombre.toLowerCase().includes(search) ||
        p.rut.toLowerCase().includes(search) ||
        p.habitacion.toLowerCase().includes(search);
      const matchesEstado = !estado || p.estado === estado;
      return matchesSearch && matchesEstado;
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(PatientFormDialogComponent, { width: '500px' });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadPatients();
    });
  }

  openEditDialog(patient: Patient): void {
    const ref = this.dialog.open(PatientFormDialogComponent, {
      width: '500px',
      data: { patient }
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadPatients();
    });
  }

  confirmDelete(patient: Patient): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Eliminar paciente',
        message: `¿Está seguro de eliminar a ${patient.nombre}?`,
        confirmText: 'Eliminar'
      }
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.patientService.delete(patient.id).subscribe({
          next: () => {
            this.snackBar.open('Paciente eliminado.', 'Cerrar', { duration: 3000 });
            this.loadPatients();
          },
          error: () => {
            this.snackBar.open('Error al eliminar paciente.', 'Cerrar', { duration: 5000 });
          }
        });
      }
    });
  }
}
