import { FormControl } from '@angular/forms';
import { maiorQueZero } from './maior-que-zero.validator';

describe('maiorQueZero', () => {
  const validator = maiorQueZero();

  it('rejeita zero', () => {
    expect(validator(new FormControl(0))).toEqual({ maiorQueZero: true });
  });

  it('rejeita valor negativo', () => {
    expect(validator(new FormControl(-100))).toEqual({ maiorQueZero: true });
  });

  it('rejeita NaN', () => {
    expect(validator(new FormControl(Number.NaN))).toEqual({ maiorQueZero: true });
  });

  it('aceita valor maior que zero', () => {
    expect(validator(new FormControl(1000))).toBeNull();
  });

  it('deixa vazio a cargo do required', () => {
    expect(validator(new FormControl(null))).toBeNull();
    expect(validator(new FormControl(undefined))).toBeNull();
    expect(validator(new FormControl(''))).toBeNull();
  });
});
