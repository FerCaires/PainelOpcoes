import { TipoOpcao } from './tipo-opcao.enum';

export interface OperacaoRequest {
  readonly nomeOpcao: string;
  readonly corretora?: string;
  readonly dataAplicacao: string;
  readonly tipo: TipoOpcao;
  readonly nomeAcao: string;
  readonly strike: number;
  readonly valorPremio: number;
  readonly quantidade: number;
  readonly dataFinalizacao: string;
  readonly custo: number;
  readonly valorIr?: number;
  readonly dataPagamentoIr?: string;
  readonly irPago?: boolean;
  readonly exercido?: boolean;
}
