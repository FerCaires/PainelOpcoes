import {
  MSG_ACOES_CADASTRADAS_VAZIAS,
  MSG_FALHA_ATUALIZAR_COTACOES,
  MSG_FALHA_CADASTRAR
} from './gestao-acoes-mensagens';

describe('gestao-acoes-mensagens', () => {
  it('expõe o texto de lista vazia de ações cadastradas', () => {
    expect(MSG_ACOES_CADASTRADAS_VAZIAS).toBe('Nenhuma ação cadastrada ainda.');
  });

  it('expõe o texto genérico de falha ao cadastrar', () => {
    expect(MSG_FALHA_CADASTRAR).toBe(
      'Não foi possível cadastrar a ação. Tente novamente.'
    );
  });

  it('expõe o texto genérico de falha ao atualizar cotações', () => {
    expect(MSG_FALHA_ATUALIZAR_COTACOES).toBe(
      'Não foi possível atualizar as cotações. Tente novamente.'
    );
  });
});
