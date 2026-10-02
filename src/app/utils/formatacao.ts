import { TipoNotional } from '../models/tipo-notional.enum';

const FORMATADOR_PT_BR = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function formatarDataIso(data: string): string {
  const [ano, mes, dia] = data.split('-');
  if (!ano || !mes || !dia) {
    return data;
  }
  return `${dia}/${mes}/${ano}`;
}

export function formatarMonetario(valor: number): string {
  return FORMATADOR_PT_BR.format(valor);
}

export function formatarPercentual(razao: number): string {
  const formatado = FORMATADOR_PT_BR.format(razao * 100).replace(/\u2212/g, '-');
  return `${formatado}%`;
}

export function formatarTipoNotional(tipo: TipoNotional): string {
  return tipo === TipoNotional.ACOES ? 'Ações' : 'Caixa';
}
