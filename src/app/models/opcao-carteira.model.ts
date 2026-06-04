export interface OpcaoCarteira {
  readonly nome: string;
  readonly vencimento: string;
  readonly strike: number;
  readonly premio: number;
  readonly situacao: string;
}