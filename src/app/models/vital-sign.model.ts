export type ClinicalSeverity = 'NORMAL' | 'ADVERTENCIA' | 'CRITICO';

export interface VitalSign {
  id: number;
  pacienteId: number;
  frecuenciaCardiaca: number;
  saturacionOxigeno: number;
  presionSistolica: number;
  presionDiastolica: number;
  temperatura: number;
  fechaHora: string;
}

export interface VitalSignFormData {
  frecuenciaCardiaca: number;
  saturacionOxigeno: number;
  presionSistolica: number;
  presionDiastolica: number;
  temperatura: number;
}
