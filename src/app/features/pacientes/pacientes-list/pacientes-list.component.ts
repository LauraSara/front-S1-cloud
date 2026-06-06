import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
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
import { Patient, PatientStatus, patientFullName } from '../../../models/patient.model';
import { PatientService } from '../../../services/patient.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PatientFormDialogComponent } from '../patient-form-dialog/patient-form-dialog.component';

@Component({
  selector: 'app-pacientes-list',
  standalone: true,
  imports: [
    DatePipe,
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

  allPatients: Patient[] = [];
  filteredPatients: Patient[] = [];
  paginatedPatients: Patient[] = [];
  loading = true;
  pageIndex = 0;
  readonly pageSize = 4;

  readonly searchControl = new FormControl('', { nonNullable: true });
  readonly estadoControl = new FormControl<PatientStatus | ''>('');
  readonly habitacionControl = new FormControl('');

  readonly displayedColumns = [
    'indicator',
    'id',
    'paciente',
    'edad',
    'ubicacion',
    'estado',
    'actualizacion',
    'accion'
  ];

  ngOnInit(): void {
    this.loadPatients();
  }

  get salas(): string[] {
    return [...new Set(this.allPatients.map((patient) => patient.habitacion))].sort();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPatients.length / this.pageSize));
  }

  get rangeStart(): number {
    return this.filteredPatients.length === 0 ? 0 : this.pageIndex * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min((this.pageIndex + 1) * this.pageSize, this.filteredPatients.length);
  }

  loadPatients(): void {
    this.loading = true;

    this.patientService.getAll().subscribe({
      next: (data) => {
        this.allPatients = data;
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
    const search = this.searchControl.value.trim().toLowerCase();
    const estado = this.estadoControl.value;
    const habitacion = this.habitacionControl.value;

    this.filteredPatients = this.allPatients.filter((patient) => {
      const fullName = patientFullName(patient).toLowerCase();
      const patientCode = this.patientCode(patient).toLowerCase();
      const matchesSearch =
        !search ||
        fullName.includes(search) ||
        patient.rut.toLowerCase().includes(search) ||
        patient.habitacion.toLowerCase().includes(search) ||
        patientCode.includes(search);

      const matchesEstado = !estado || patient.estado === estado;
      const matchesHabitacion = !habitacion || patient.habitacion === habitacion;

      return matchesSearch && matchesEstado && matchesHabitacion;
    });

    this.pageIndex = 0;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = this.pageIndex * this.pageSize;
    this.paginatedPatients = this.filteredPatients.slice(start, start + this.pageSize);
  }

  goToPage(index: number): void {
    if (index < 0 || index >= this.totalPages) {
      return;
    }
    this.pageIndex = index;
    this.updatePagination();
  }

  fullName(patient: Patient): string {
    return patientFullName(patient);
  }

  patientCode(patient: Patient): string {
    return `PT-${String(patient.id).padStart(4, '0')}`;
  }

  initials(patient: Patient): string {
    const first = patient.nombre.trim()[0] ?? '';
    const last = patient.apellido.trim()[0] ?? '';
    return `${first}${last}`.toUpperCase() || 'P';
  }

  estadoLabel(estado: PatientStatus): string {
    const labels: Record<PatientStatus, string> = {
      CRITICO: 'Crítico',
      ESTABLE: 'Estable',
      OBSERVACION: 'Observación'
    };
    return labels[estado];
  }

  estadoClass(estado: PatientStatus): string {
    return `estado-badge estado-badge--${estado.toLowerCase()}`;
  }

  rowClass(estado: PatientStatus): string {
    return `patient-row patient-row--${estado.toLowerCase()}`;
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
        message: `¿Está seguro de eliminar a ${patientFullName(patient)}?`,
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
