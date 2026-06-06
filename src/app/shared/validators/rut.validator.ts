import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

function cleanRut(rut: string): string {
  return rut.replace(/\./g, '').replace(/-/g, '').toUpperCase();
}

function validateRutDigit(rut: string): boolean {
  const cleaned = cleanRut(rut);
  if (cleaned.length < 2) return false;

  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);

  if (!/^\d+$/.test(body)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expected = 11 - (sum % 11);
  const expectedDv = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected);

  return dv === expectedDv;
}

export function rutValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.toString().trim();
    if (!value) return null;

    const pattern = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/;
    if (!pattern.test(value) && !/^\d{7,8}-[\dkK]$/i.test(value)) {
      return { rutFormat: true };
    }

    return validateRutDigit(value) ? null : { rutInvalid: true };
  };
}
