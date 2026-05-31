import { TipoRolagem } from './tipo-rolagem.enum';

export interface BuscaRolagemRequest {
  opcao: string;
  quantidadeVencimentos: number;
  tipoRolagem: TipoRolagem;
}
