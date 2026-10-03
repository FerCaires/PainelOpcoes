import {
  MSG_CONFIRMAR_EXCLUSAO,
  MSG_FALHA_CARREGAR_OPERACOES,
  MSG_FALHA_EXCLUIR_OPERACAO,
  MSG_FALHA_IMPORTAR_PLANILHA,
  MSG_FALHA_SALVAR_OPERACAO,
  MSG_LISTA_VAZIA,
  MSG_LISTA_VAZIA_FILTRO
} from './controle-operacoes-mensagens';

describe('controle-operacoes-mensagens', () => {
  it('expõe o texto de falha ao carregar', () => {
    expect(MSG_FALHA_CARREGAR_OPERACOES).toBe(
      'Não foi possível carregar as operações. Tente novamente.'
    );
  });

  it('expõe o texto de lista vazia sem filtro', () => {
    expect(MSG_LISTA_VAZIA).toBe(
      'Nenhuma operação lançada ainda. Importe a planilha ou cadastre um lançamento.'
    );
  });

  it('expõe o texto de lista vazia com filtro', () => {
    expect(MSG_LISTA_VAZIA_FILTRO).toBe('Nenhuma operação para os filtros selecionados.');
  });

  it('expõe o texto genérico de falha ao salvar', () => {
    expect(MSG_FALHA_SALVAR_OPERACAO).toBe(
      'Não foi possível salvar a operação. Tente novamente.'
    );
  });

  it('expõe o texto genérico de falha ao excluir', () => {
    expect(MSG_FALHA_EXCLUIR_OPERACAO).toBe(
      'Não foi possível excluir a operação. Tente novamente.'
    );
  });

  it('expõe o texto genérico de falha ao importar', () => {
    expect(MSG_FALHA_IMPORTAR_PLANILHA).toBe(
      'Não foi possível importar a planilha. Tente novamente.'
    );
  });

  it('expõe o texto de confirmação de exclusão', () => {
    expect(MSG_CONFIRMAR_EXCLUSAO).toBe('Excluir esta operação?');
  });
});
