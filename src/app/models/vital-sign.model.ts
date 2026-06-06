export type Severity = 'NORMAL' | 'ADVERTENCIA' | 'CRITICO';

export interface VitalSign {
  id: number;
  pacienteId: number;
  frecuenciaCardiaca: number;
  saturacionOxigeno: number;
  presionSistolica: number;
  presionDiastolica: number;
  temperatura: number;
  fechaRegistro: string;
  severidad: Severity;
}

export interface VitalSignFormData {
  frecuenciaCardiaca: number;
  saturacionOxigeno: number;
  presionSistolica: number;
  presionDiastolica: number;
  temperatura: number;
}
