export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class CarteiraDuplicadaError extends ApiError {
  constructor(message: string = 'Nome de carteira já existe') {
    super(message, 409, 'CARTEIRA_DUPLICADA');
    this.name = 'CarteiraDuplicadaError';
  }
}

export class OpcaoNaoEncontradaError extends ApiError {
  constructor(message: string = 'Opção não encontrada no sistema') {
    super(message, 404, 'OPCAO_NAO_ENCONTRADA');
    this.name = 'OpcaoNaoEncontradaError';
  }
}

export class OpcaoJaExisteNaCarteiraError extends ApiError {
  constructor(message: string = 'Opção já existe na carteira') {
    super(message, 409, 'OPCAO_JA_EXISTE_NA_CARTEIRA');
    this.name = 'OpcaoJaExisteNaCarteiraError';
  }
}