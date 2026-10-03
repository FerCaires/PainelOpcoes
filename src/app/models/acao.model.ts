export interface Acao {
  readonly nomeAcao: string;
  readonly nomeCompleto: string;
  readonly precoSpot: number | null;
  readonly dataAtualizacao?: string;
}
