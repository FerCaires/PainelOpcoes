import { SimulacaoOpcaoItem } from './simulacao-opcao-item.model';
import { TipoOpcao } from './tipo-opcao.enum';

export interface SimulacaoMetaPremioResponse {
  readonly nomeAcao: string;
  readonly nomeCompleto: string;
  readonly precoSpot: number;
  readonly metaPremio: number;
  readonly tipo: TipoOpcao;
  readonly dataVencimento: string;
  readonly diasAteVencimento: number;
  readonly quantidadeOperacoes: number;
  readonly opcoes: readonly SimulacaoOpcaoItem[];
}
