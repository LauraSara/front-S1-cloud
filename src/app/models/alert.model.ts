export type AlertSeverity = 'ALTA' | 'MEDIA' | 'BAJA';
export type AlertStatus = 'ACTIVA' | 'ATENDIDA';

export interface Alert {
  id: number;
  pacienteId: number;
  tipo: string;
  descripcion: string;
  severidad: AlertSeverity;
  estado: AlertStatus;
  fechaHora: string;
  pacienteNombre?: string;
}

export interface AlertFormData {
  pacienteId: number;
  tipo: string;
  severidad: AlertSeverity;
  descripcion: string;
  estado: AlertStatus;
}

export interface AlertAcknowledgeData {
  motivo: string;
  observaciones: string;
}

export interface AlertUpdatePayload {
  pacienteId: number;
  tipo: string;
  severidad: AlertSeverity;
  descripcion: string;
  estado: AlertStatus;
}
