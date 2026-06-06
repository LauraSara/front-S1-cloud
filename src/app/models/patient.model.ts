export type PatientStatus = 'ESTABLE' | 'CRITICO' | 'OBSERVACION';

export interface Patient {
  id: number;
  nombre: string;
  apellido: string;
  rut: string;
  edad: number;
  habitacion: string;
  diagnostico: string;
  estado: PatientStatus;
  fechaIngreso?: string;
}

export interface PatientFormData {
  nombre: string;
  apellido: string;
  rut: string;
  edad: number;
  habitacion: string;
  diagnostico: string;
  estado: PatientStatus;
}

export function patientFullName(patient: Pick<Patient, 'nombre' | 'apellido'>): string {
  return `${patient.nombre} ${patient.apellido}`.trim();
}
