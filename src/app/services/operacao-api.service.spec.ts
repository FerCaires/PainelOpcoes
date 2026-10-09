import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OperacaoApiService } from './operacao-api.service';
import { OperacaoErro } from '../models/api-errors.model';
import { ListaOperacoes } from '../models/lista-operacoes.model';
import { Operacao } from '../models/operacao.model';
import { OperacaoRequest } from '../models/operacao-request.model';
import { ResultadoImportacao } from '../models/resultado-importacao.model';
import { TipoOpcao } from '../models/tipo-opcao.enum';
import {
  MSG_FALHA_CARREGAR_OPERACOES,
  MSG_FALHA_EXCLUIR_OPERACAO,
  MSG_FALHA_IMPORTAR_PLANILHA,
  MSG_FALHA_SALVAR_OPERACAO
} from '../utils/controle-operacoes-mensagens';
import { environment } from '../../environments/environment';

describe('OperacaoApiService', () => {
  let service: OperacaoApiService;
  let httpMock: HttpTestingController;

  const operacao: Operacao = {
    id: 1,
    nomeOpcao: 'BBAST194',
    corretora: null,
    dataAplicacao: '2025-08-12',
    tipo: TipoOpcao.PUT,
    nomeAcao: 'BBAS3',
    strike: 19.08,
    precoAtual: 42.13,
    valorPremio: 0.59,
    quantidade: 100,
    dataFinalizacao: '2025-10-17',
    margemNecessaria: 1908,
    dataPagamentoIr: '2025-09-30',
    custo: 4.96,
    valorIr: 8.11,
    irPago: false,
    lucroLiquido: 45.93,
    exercido: false,
    rendimento: 0.024072,
    totalAcumulado: 45.93
  };

  const lista: ListaOperacoes = {
    operacoes: [operacao],
    resumo: { acumulado: 45.93, porMes: [], porAno: [], porAtivo: [] }
  };

  const request: OperacaoRequest = {
    nomeOpcao: 'BBAST194',
    dataAplicacao: '2025-08-12',
    tipo: TipoOpcao.PUT,
    nomeAcao: 'BBAS3',
    strike: 19.08,
    valorPremio: 0.59,
    quantidade: 100,
    dataFinalizacao: '2025-10-17',
    custo: 4.96,
    valorIr: 0,
    irPago: false,
    exercido: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OperacaoApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(OperacaoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('emite a lista quando GET /operacoes retorna 200', () => {
    service.listar().subscribe((resposta) => {
      expect(resposta.operacoes[0].nomeOpcao).toBe('BBAST194');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/operacoes`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);
    req.flush(lista);
  });

  it('monta query só com filtros definidos', () => {
    service.listar({ nomeAcao: 'PETR4', ano: 2026, mes: 4 }).subscribe();

    const req = httpMock.expectOne(
      (pedido) => pedido.url === `${environment.apiBaseUrl}/operacoes`
    );
    expect(req.request.params.get('nomeAcao')).toBe('PETR4');
    expect(req.request.params.get('ano')).toBe('2026');
    expect(req.request.params.get('mes')).toBe('4');
    req.flush({ operacoes: [], resumo: { acumulado: 0, porMes: [], porAno: [], porAtivo: [] } });
  });

  it('não inclui query quando os filtros estão vazios', () => {
    service.listar({}).subscribe();

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/operacoes`);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ operacoes: [], resumo: { acumulado: 0, porMes: [], porAno: [], porAtivo: [] } });
  });

  it('não lê o envelope quando GET /operacoes retorna 400 com mensagem', () => {
    service.listar().subscribe({
      next: () => fail('deveria falhar'),
      error: (err: Error) => {
        expect(err.message).toBe(MSG_FALHA_CARREGAR_OPERACOES);
        expect(err.message).not.toBe('segredo');
      }
    });

    httpMock.expectOne(`${environment.apiBaseUrl}/operacoes`).flush(
      { mensagem: 'segredo', erro: 'DADOS_INVALIDOS' },
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it('usa mensagem genérica de lista em 500 e na rede', () => {
    service.listar().subscribe({
      next: () => fail('deveria falhar'),
      error: (err: Error) => expect(err.message).toBe(MSG_FALHA_CARREGAR_OPERACOES)
    });
    httpMock.expectOne(`${environment.apiBaseUrl}/operacoes`).error(new ProgressEvent('error'));
  });

  it('emite a operação quando POST /operacoes retorna 201', () => {
    service.criar(request).subscribe((criada) => {
      expect(criada.nomeOpcao).toBe('BBAST194');
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/operacoes`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(request);
    req.flush(operacao, { status: 201, statusText: 'Created' });
  });

  it('lê a mensagem do envelope em POST 409', () => {
    const mensagem = 'Operacao duplicada';
    service.criar(request).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: OperacaoErro) => {
        expect(err).toBeInstanceOf(OperacaoErro);
        expect(err.message).toBe(mensagem);
        expect(err.status).toBe(409);
        expect(err.code).toBe('OPERACAO_DUPLICADA');
      }
    });

    httpMock.expectOne(`${environment.apiBaseUrl}/operacoes`).flush(
      { erro: 'OPERACAO_DUPLICADA', mensagem },
      { status: 409, statusText: 'Conflict' }
    );
  });

  it('usa mensagem genérica de salvar em POST 500', () => {
    service.criar(request).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: OperacaoErro) => {
        expect(err.message).toBe(MSG_FALHA_SALVAR_OPERACAO);
        expect(err.status).toBe(500);
      }
    });

    httpMock.expectOne(`${environment.apiBaseUrl}/operacoes`).flush(
      { mensagem: 'stacktrace' },
      { status: 500, statusText: 'Server Error' }
    );
  });

  it('envia PUT /operacoes/{id} e lê mensagem 4xx', () => {
    const mensagem = 'Dados invalidos';
    service.atualizar(8, request).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: OperacaoErro) => {
        expect(err.message).toBe(mensagem);
        expect(err.status).toBe(422);
      }
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/operacoes/8`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(request);
    req.flush({ mensagem, erro: 'DADOS_INVALIDOS' }, { status: 422, statusText: 'Unprocessable' });
  });

  it('envia DELETE /operacoes/{id} e lê mensagem 404', () => {
    const mensagem = "Operacao '9' nao encontrada";
    service.excluir(9).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: OperacaoErro) => {
        expect(err.message).toBe(mensagem);
        expect(err.status).toBe(404);
      }
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/operacoes/9`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ mensagem, erro: 'OPERACAO_NAO_ENCONTRADA' }, { status: 404, statusText: 'Not Found' });
  });

  it('usa mensagem genérica de excluir em 500', () => {
    service.excluir(9).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: OperacaoErro) => expect(err.message).toBe(MSG_FALHA_EXCLUIR_OPERACAO)
    });

    httpMock
      .expectOne(`${environment.apiBaseUrl}/operacoes/9`)
      .flush({ mensagem: 'stacktrace' }, { status: 500, statusText: 'Server Error' });
  });

  it('POST importar envia FormData com campo file sem Content-Type manual', () => {
    const arquivo = new File(['ticker;tipo'], 'planilha.csv', { type: 'text/csv' });
    const resultado: ResultadoImportacao = {
      totalLidas: 1,
      totalIgnoradas: 0,
      totalCriadas: 1,
      totalAtualizadas: 0,
      erros: []
    };

    service.importar(arquivo).subscribe((resposta) => {
      expect(resposta.totalCriadas).toBe(1);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/operacoes/importar`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    expect((req.request.body as FormData).get('file')).toBe(arquivo);
    expect(req.request.headers.get('Content-Type')).toBeNull();
    req.flush(resultado);
  });

  it('lê mensagem do envelope em importar 422 PLANILHA_INVALIDA', () => {
    const arquivo = new File(['x'], 'ruim.csv', { type: 'text/csv' });
    const mensagem = 'Cabecalho invalido';

    service.importar(arquivo).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: OperacaoErro) => {
        expect(err.message).toBe(mensagem);
        expect(err.status).toBe(422);
        expect(err.code).toBe('PLANILHA_INVALIDA');
      }
    });

    httpMock.expectOne(`${environment.apiBaseUrl}/operacoes/importar`).flush(
      { erro: 'PLANILHA_INVALIDA', mensagem },
      { status: 422, statusText: 'Unprocessable' }
    );
  });

  it('usa mensagem genérica de importar em falha de rede', () => {
    const arquivo = new File(['x'], 'planilha.csv', { type: 'text/csv' });
    service.importar(arquivo).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: OperacaoErro) => expect(err.message).toBe(MSG_FALHA_IMPORTAR_PLANILHA)
    });

    httpMock.expectOne(`${environment.apiBaseUrl}/operacoes/importar`).error(new ProgressEvent('error'));
  });
});
