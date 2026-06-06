import { Severity } from './vital-sign.model';

export type AlertStatus = 'ACTIVA' | 'ATENDIDA';

export interface Alert {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  tipo: string;
  mensaje: string;
  severidad: Severity;
  estado: AlertStatus;
  fechaCreacion: string;
  fechaAtencion?: string;
}

export interface AlertAcknowledgeData {
  motivo: string;
  observaciones: string;
}
