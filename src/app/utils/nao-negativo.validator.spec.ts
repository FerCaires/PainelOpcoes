import { FormControl } from '@angular/forms';
import { naoNegativo } from './nao-negativo.validator';

describe('naoNegativo', () => {
  const validator = naoNegativo();

  it('aceita zero', () => {
    expect(validator(new FormControl(0))).toBeNull();
  });

  it('rejeita valor negativo', () => {
    expect(validator(new FormControl(-1))).toEqual({ naoNegativo: true });
  });

  it('aceita valor positivo', () => {
    expect(validator(new FormControl(8.11))).toBeNull();
  });

  it('deixa vazio a cargo do required', () => {
    expect(validator(new FormControl(null))).toBeNull();
    expect(validator(new FormControl(''))).toBeNull();
  });
});
