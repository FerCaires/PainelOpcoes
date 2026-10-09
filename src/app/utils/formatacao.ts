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

const ISO_DATA_HORA = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/;

export function formatarDataHora(iso: string): string {
  const match = ISO_DATA_HORA.exec(iso);
  if (!match) {
    return iso;
  }
  const [, ano, mes, dia, hora, minuto] = match;
  return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

export function formatarMonetario(valor: number): string {
  return FORMATADOR_PT_BR.format(valor);
}

export function formatarPercentual(razao: number): string {
  const formatado = FORMATADOR_PT_BR.format(razao * 100).replace(/\u2212/g, '-');
  return `${formatado}%`;
}

const FORMATADOR_PERCENTUAL_3 = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3
});

export function formatarPercentual3(razao: number): string {
  const formatado = FORMATADOR_PERCENTUAL_3.format(razao * 100).replace(/\u2212/g, '-');
  return `${formatado}%`;
}

export function formatarTipoNotional(tipo: TipoNotional): string {
  return tipo === TipoNotional.ACOES ? 'Ações' : 'Caixa';
}
