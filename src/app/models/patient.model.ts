export type PatientStatus = 'ESTABLE' | 'CRITICO' | 'OBSERVACION';

export interface Patient {
  id: number;
  nombre: string;
  rut: string;
  habitacion: string;
  diagnostico: string;
  estado: PatientStatus;
}

export interface PatientFormData {
  nombre: string;
  rut: string;
  habitacion: string;
  diagnostico: string;
  estado: PatientStatus;
}
