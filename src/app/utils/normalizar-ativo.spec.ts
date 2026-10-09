import { normalizarAtivo, normalizarTicker } from './normalizar-ativo';

describe('normalizarAtivo', () => {
  it('remove o prefixo BVMF e devolve o ticker em maiúsculas', () => {
    expect(normalizarAtivo('bvmf:bbas3')).toBe('BBAS3');
  });

  it('remove BVMF em maiúsculas', () => {
    expect(normalizarAtivo('BVMF:petr4')).toBe('PETR4');
  });

  it('só aplica trim e maiúsculas quando não há prefixo', () => {
    expect(normalizarAtivo(' vale3 ')).toBe('VALE3');
  });
});

describe('normalizarTicker', () => {
  it('devolve o ticker da opção em maiúsculas', () => {
    expect(normalizarTicker('itubp415w1')).toBe('ITUBP415W1');
  });
});
