import { RolagemVencimento } from './rolagem-vencimento.model';

export interface BuscaRolagemResponse {
  opcao: string;
  vencimento: string;
  strike: number;
  premio: number;
  rolagens: RolagemVencimento[];
}
