import {
  MSG_ACOES_VAZIAS,
  MSG_FALHA_CARREGAR_ACOES,
  MSG_FALHA_SIMULACAO,
  MSG_OPCOES_VAZIAS
} from './simulacao-meta-premio-mensagens';

describe('simulacao-meta-premio-mensagens', () => {
  it('expõe o texto de lista vazia de ações', () => {
    expect(MSG_ACOES_VAZIAS).toBe('Nenhuma ação disponível para simulação.');
  });

  it('expõe o texto genérico de falha ao carregar ações', () => {
    expect(MSG_FALHA_CARREGAR_ACOES).toBe('Não foi possível carregar as ações. Tente novamente.');
  });

  it('expõe o texto de opções vazias', () => {
    expect(MSG_OPCOES_VAZIAS).toBe(
      'Nenhuma opção disponível para os parâmetros informados neste vencimento.'
    );
  });

  it('expõe o texto genérico de falha da simulação', () => {
    expect(MSG_FALHA_SIMULACAO).toBe('Não foi possível concluir a simulação. Tente novamente.');
  });
});
