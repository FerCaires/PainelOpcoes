import { Operacao } from './operacao.model';

export interface ResumoPorMes {
  readonly anoMes: string;
  readonly lucro: number;
  readonly rendimento: number | null;
}

export interface ResumoPorAno {
  readonly ano: number;
  readonly lucro: number;
}

export interface ResumoPorAtivo {
  readonly nomeAcao: string;
  readonly lucro: number;
}

export interface ResumoOperacoes {
  readonly acumulado: number;
  readonly porMes: readonly ResumoPorMes[];
  readonly porAno: readonly ResumoPorAno[];
  readonly porAtivo: readonly ResumoPorAtivo[];
}

export interface ListaOperacoes {
  readonly operacoes: Operacao[];
  readonly resumo: ResumoOperacoes;
}

export interface FiltrosOperacao {
  readonly nomeAcao?: string;
  readonly ano?: number;
  readonly mes?: number;
}
