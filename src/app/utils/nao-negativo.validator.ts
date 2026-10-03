import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function naoNegativo(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }
    const numero = typeof valor === 'number' ? valor : Number(valor);
    if (Number.isNaN(numero) || numero < 0) {
      return { naoNegativo: true };
    }
    return null;
  };
}
