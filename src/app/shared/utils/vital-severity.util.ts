import { ClinicalSeverity, VitalSign } from '../../models/vital-sign.model';

export function computeVitalSeverity(vital: Pick<
  VitalSign,
  'frecuenciaCardiaca' | 'saturacionOxigeno' | 'presionSistolica' | 'presionDiastolica' | 'temperatura'
>): ClinicalSeverity {
  const critical =
    vital.frecuenciaCardiaca > 120 ||
    vital.frecuenciaCardiaca < 50 ||
    vital.saturacionOxigeno < 90 ||
    vital.presionSistolica > 180 ||
    vital.presionSistolica < 90 ||
    vital.presionDiastolica > 110 ||
    vital.temperatura > 39 ||
    vital.temperatura < 35;

  if (critical) {
    return 'CRITICO';
  }

  const warning =
    vital.frecuenciaCardiaca > 100 ||
    vital.frecuenciaCardiaca < 60 ||
    vital.saturacionOxigeno < 92 ||
    vital.presionSistolica > 140 ||
    vital.presionDiastolica > 90 ||
    vital.temperatura > 38 ||
    vital.temperatura < 36;

  if (warning) {
    return 'ADVERTENCIA';
  }

  return 'NORMAL';
}
