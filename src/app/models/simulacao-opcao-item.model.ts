import { Modalidade } from './modalidade.enum';
import { Moneyness } from './moneyness.enum';
import { TipoNotional } from './tipo-notional.enum';
import { TipoOpcao } from './tipo-opcao.enum';

export interface SimulacaoOpcaoItem {
  readonly nome: string;
  readonly tipo: TipoOpcao;
  readonly modalidade: Modalidade;
  readonly strike: number;
  readonly valorPremio: number;
  readonly percentualVsSpot: number;
  readonly moneyness: Moneyness;
  readonly avisoExercicio: string | null;
  readonly dataVencimento: string;
  readonly diasAteVencimento: number;
  readonly quantidadeAcoes: number;
  readonly notional: number;
  readonly tipoNotional: TipoNotional;
  readonly premioEstimado: number;
  readonly roiOperacao: number;
  readonly roiAnualizadoSimples: number;
}
