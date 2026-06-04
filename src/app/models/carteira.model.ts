import { StatusCarteira } from './status-carteira.enum';

export interface Carteira {
  readonly id: string;
  readonly nome: string;
  readonly status: StatusCarteira;
  readonly createdAt: string;
  readonly updatedAt: string;
}