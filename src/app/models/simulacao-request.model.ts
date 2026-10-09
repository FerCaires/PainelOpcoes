import { TipoOpcao } from './tipo-opcao.enum';
import { ModoSimulacao } from './modo-simulacao.enum';

export interface SimulacaoRequest {
  readonly nomeAcao: string;
  readonly tipo: TipoOpcao;
  readonly modo: ModoSimulacao;
  readonly metaPremio?: number;
  readonly garantia?: number;
  readonly quantidadeAcoes?: number;
}
