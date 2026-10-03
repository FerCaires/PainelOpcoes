import { TipoOpcao } from './tipo-opcao.enum';

export interface Operacao {
  readonly id: number;
  readonly nomeOpcao: string;
  readonly corretora: string | null;
  readonly dataAplicacao: string;
  readonly tipo: TipoOpcao;
  readonly nomeAcao: string;
  readonly strike: number;
  readonly precoAtual: number | null;
  readonly valorPremio: number;
  readonly quantidade: number;
  readonly dataFinalizacao: string;
  readonly margemNecessaria: number;
  readonly dataPagamentoIr: string | null;
  readonly custo: number;
  readonly valorIr: number;
  readonly irPago: boolean;
  readonly lucroLiquido: number;
  readonly exercido: boolean;
  readonly rendimento: number | null;
  readonly totalAcumulado: number;
  readonly dataCriacao?: string;
  readonly dataAtualizacao?: string;
}
