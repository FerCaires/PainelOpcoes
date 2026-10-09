import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function dataFinalizacaoNaoAnterior(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const aplicacao = group.get('dataAplicacao')?.value;
    const finalizacao = group.get('dataFinalizacao')?.value;
    if (!aplicacao || !finalizacao) {
      return null;
    }
    return String(finalizacao) >= String(aplicacao) ? null : { dataFinalizacaoAnterior: true };
  };
}
