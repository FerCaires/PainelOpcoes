import { FormControl } from '@angular/forms';
import { multiploDeCem } from './multiplo-de-cem.validator';

describe('multiploDeCem', () => {
  const validator = multiploDeCem();

  it('rejeita 250', () => {
    expect(validator(new FormControl(250))).toEqual({ multiploDeCem: true });
  });

  it('aceita 700', () => {
    expect(validator(new FormControl(700))).toBeNull();
  });

  it('aceita 100', () => {
    expect(validator(new FormControl(100))).toBeNull();
  });

  it('deixa vazio a cargo do required', () => {
    expect(validator(new FormControl(null))).toBeNull();
    expect(validator(new FormControl(''))).toBeNull();
  });
});
