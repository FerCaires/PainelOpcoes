import { SimulacaoOpcaoItem } from './simulacao-opcao-item.model';
import { TipoOpcao } from './tipo-opcao.enum';
import { ModoSimulacao } from './modo-simulacao.enum';

export interface SimulacaoMetaPremioResponse {
  readonly nomeAcao: string;
  readonly nomeCompleto: string;
  readonly precoSpot: number;
  readonly metaPremio: number | null;
  readonly tipo: TipoOpcao;
  readonly dataVencimento: string;
  readonly diasAteVencimento: number;
  readonly quantidadeOperacoes: number;
  readonly opcoes: readonly SimulacaoOpcaoItem[];
  readonly modo?: ModoSimulacao;
  readonly garantia?: number | null;
  readonly quantidadeAcoesInformada?: number | null;
}
