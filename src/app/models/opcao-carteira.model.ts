import { SituacaoOpcao } from './situacao-opcao.enum';

export interface OpcaoCarteira {
  readonly nomeOpcao: string;
  readonly vencimento: string;
  readonly strike: number;
  readonly premio: number;
  readonly situacao: SituacaoOpcao;
}
