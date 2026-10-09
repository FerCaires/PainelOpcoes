import { montarBarrasResumo } from './montar-barras-resumo';

describe('montarBarrasResumo', () => {
  it('devolve barras vazias para lista vazia', () => {
    const layout = montarBarrasResumo([], 200, 100);

    expect(layout.barras).toEqual([]);
    expect(layout.linhaZero).toBeGreaterThan(0);
  });

  it('marca negativo e positivo no mesmo eixo', () => {
    const layout = montarBarrasResumo(
      [
        { rotulo: '2025-08', valor: 100 },
        { rotulo: '2025-09', valor: -50 }
      ],
      200,
      100
    );

    expect(layout.barras.length).toBe(2);
    expect(layout.barras[0].negativo).toBeFalse();
    expect(layout.barras[1].negativo).toBeTrue();
    expect(layout.barras[0].y).toBeLessThan(layout.linhaZero);
    expect(layout.barras[1].y).toBe(layout.linhaZero);
    expect(layout.linhaZero).toBeGreaterThan(16);
    expect(layout.linhaZero).toBeLessThan(100);
  });

  it('aceita um único ponto positivo', () => {
    const layout = montarBarrasResumo([{ rotulo: 'BBAS3', valor: 45.93 }], 200, 100);

    expect(layout.barras.length).toBe(1);
    expect(layout.barras[0].negativo).toBeFalse();
    expect(layout.barras[0].altura).toBeGreaterThan(0);
  });

  it('barra de zero fica na linha do eixo', () => {
    const layout = montarBarrasResumo([{ rotulo: '2026-01', valor: 0 }], 200, 100);

    expect(layout.barras[0].altura).toBe(0);
    expect(layout.barras[0].y).toBe(layout.linhaZero);
    expect(layout.barras[0].negativo).toBeFalse();
  });
});
