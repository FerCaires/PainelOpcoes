import { TipoNotional } from '../models/tipo-notional.enum';
import {
  formatarDataHora,
  formatarDataIso,
  formatarMonetario,
  formatarPercentual,
  formatarPercentual3,
  formatarTipoNotional
} from './formatacao';

describe('formatacao', () => {
  it('converte data ISO para DD/MM/YYYY', () => {
    expect(formatarDataIso('2026-10-16')).toBe('16/10/2026');
  });

  it('converte data e hora ISO para DD/MM/YYYY HH:mm', () => {
    const formatado = formatarDataHora('2026-10-02T22:18:00');
    expect(formatado).toContain('02/10/2026');
    expect(formatado).toContain('22:18');
    expect(formatado).toBe('02/10/2026 22:18');
  });

  it('devolve a string original quando a data/hora é ilegível', () => {
    expect(formatarDataHora('lixo')).toBe('lixo');
  });

  it('formata monetário pt-BR com 2 casas', () => {
    expect(formatarMonetario(42.13)).toContain('42,13');
  });

  it('formata percentual positivo a partir da razão', () => {
    expect(formatarPercentual(0.0363)).toBe('3,63%');
    expect(formatarPercentual(0.4356)).toBe('43,56%');
  });

  it('formata percentual negativo com hífen ASCII', () => {
    expect(formatarPercentual(-0.0028)).toBe('-0,28%');
    expect(formatarPercentual(-0.0028).charCodeAt(0)).toBe(45);
  });

  it('formata percentual com 3 casas a partir da razão', () => {
    expect(formatarPercentual3(0.024072)).toBe('2,407%');
  });

  it('formata percentual de 3 casas negativo com hífen ASCII', () => {
    expect(formatarPercentual3(-0.024072)).toBe('-2,407%');
    expect(formatarPercentual3(-0.024072).charCodeAt(0)).toBe(45);
  });

  it('mapeia tipoNotional ACOES para Ações', () => {
    expect(formatarTipoNotional(TipoNotional.ACOES)).toBe('Ações');
  });

  it('mapeia tipoNotional CAIXA para Caixa', () => {
    expect(formatarTipoNotional(TipoNotional.CAIXA)).toBe('Caixa');
  });
});
