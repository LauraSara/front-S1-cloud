import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function vitalRangeValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined || value === '') return null;

    const num = Number(value);
    if (isNaN(num) || num < min || num > max) {
      return { vitalRange: { min, max, actual: num } };
    }
    return null;
  };
}
