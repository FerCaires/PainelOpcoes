import { Modalidade } from './modalidade.enum';

export interface Opcao {
  nome: string;
  premio: number;
  strike: number;
  delta: number;
  modalidade: Modalidade;
}
