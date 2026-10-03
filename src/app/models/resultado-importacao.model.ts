export interface ResultadoImportacao {
  readonly totalLidas: number;
  readonly totalIgnoradas: number;
  readonly totalCriadas: number;
  readonly totalAtualizadas: number;
  readonly erros: readonly { readonly linha: number; readonly mensagem: string }[];
}
