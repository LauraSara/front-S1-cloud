import { Alert } from '../models/alert.model';

export interface DashboardSummary {
  pacientesCriticos: number;
  alertasActivas: number;
  medicionesUltimas24h: number;
  alertasRecientes: Alert[];
}
