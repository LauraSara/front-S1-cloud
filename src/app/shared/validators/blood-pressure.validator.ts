import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function bloodPressureValidator(
  systolicKey = 'presionSistolica',
  diastolicKey = 'presionDiastolica'
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const systolic = Number(group.get(systolicKey)?.value);
    const diastolic = Number(group.get(diastolicKey)?.value);

    if (isNaN(systolic) || isNaN(diastolic)) return null;

    return systolic > diastolic ? null : { bloodPressure: true };
  };
}
