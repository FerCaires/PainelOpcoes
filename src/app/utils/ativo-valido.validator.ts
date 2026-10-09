import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { normalizarAtivo } from './normalizar-ativo';

export function ativoValido(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = control.value;
    if (valor === null || valor === undefined || valor === '') {
      return null;
    }
    const normalizado = normalizarAtivo(String(valor));
    return /^[A-Z0-9]{5,6}$/.test(normalizado) ? null : { ativoInvalido: true };
  };
}
