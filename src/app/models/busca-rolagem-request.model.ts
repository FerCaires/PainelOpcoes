import { TipoRolagem } from './tipo-rolagem.enum';
import { Modalidade } from './modalidade.enum';

export interface BuscaRolagemRequest {
  opcao: string;
  quantidadeVencimentos: number;
  tipoRolagem: TipoRolagem;
  modalidade: Modalidade;
}
