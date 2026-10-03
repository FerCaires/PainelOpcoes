import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AcaoApiService } from './acao-api.service';
import { Acao } from '../models/acao.model';
import { AcaoCadastroError } from '../models/api-errors.model';
import { MSG_FALHA_CADASTRAR } from '../utils/gestao-acoes-mensagens';
import { MSG_FALHA_CARREGAR_ACOES } from '../utils/simulacao-meta-premio-mensagens';

describe('AcaoApiService', () => {
  let service: AcaoApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AcaoApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AcaoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('emite a lista quando GET /acoes retorna 200', () => {
    const mock: Acao[] = [
      { nomeAcao: 'BBAS3', nomeCompleto: 'Banco do Brasil S.A.', precoSpot: 42.13 }
    ];

    service.listar().subscribe((acoes) => {
      expect(acoes[0].nomeAcao).toBe('BBAS3');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/acoes');
    expect(req.request.method).toBe('GET');
    req.flush(mock);
  });

  it('emite array vazio quando GET /acoes retorna 200 com []', () => {
    service.listar().subscribe((acoes) => {
      expect(acoes).toEqual([]);
    });

    httpMock.expectOne('http://localhost:8080/api/acoes').flush([]);
  });

  it('não lê o envelope quando GET /acoes retorna 400 com mensagem', () => {
    service.listar().subscribe({
      next: () => fail('deveria falhar'),
      error: (err: Error) => {
        expect(err.message).toBe(MSG_FALHA_CARREGAR_ACOES);
        expect(err.message).not.toBe('segredo');
      }
    });

    httpMock.expectOne('http://localhost:8080/api/acoes').flush(
      { mensagem: 'segredo', erro: 'ACAO_NAO_ENCONTRADA' },
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it('não expõe mensagem do envelope em falha 4xx', () => {
    service.listar().subscribe({
      next: () => fail('deveria falhar'),
      error: (err: Error) => {
        expect(err.message).toBe(MSG_FALHA_CARREGAR_ACOES);
      }
    });

    httpMock.expectOne('http://localhost:8080/api/acoes').flush(
      { mensagem: 'Segredo do envelope', erro: 'ACAO_NAO_ENCONTRADA' },
      { status: 404, statusText: 'Not Found' }
    );
  });

  it('usa mensagem genérica em 500', () => {
    service.listar().subscribe({
      next: () => fail('deveria falhar'),
      error: (err: Error) => {
        expect(err.message).toBe(MSG_FALHA_CARREGAR_ACOES);
      }
    });

    httpMock.expectOne('http://localhost:8080/api/acoes').flush(
      { mensagem: 'stacktrace' },
      { status: 500, statusText: 'Server Error' }
    );
  });

  it('usa mensagem genérica em falha de rede', () => {
    service.listar().subscribe({
      next: () => fail('deveria falhar'),
      error: (err: Error) => {
        expect(err.message).toBe(MSG_FALHA_CARREGAR_ACOES);
      }
    });

    httpMock.expectOne('http://localhost:8080/api/acoes').error(new ProgressEvent('error'));
  });

  it('não expõe método deletar', () => {
    expect('deletar' in service).toBeFalse();
  });

  it('emite a ação quando POST /acoes retorna 201', () => {
    const criada: Acao = {
      nomeAcao: 'VALE3',
      nomeCompleto: 'Vale S.A.',
      precoSpot: null
    };

    service.criar({ nomeAcao: 'VALE3', nomeCompleto: 'Vale S.A.' }).subscribe((acao) => {
      expect(acao.nomeAcao).toBe('VALE3');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/acoes');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ nomeAcao: 'VALE3', nomeCompleto: 'Vale S.A.' });
    req.flush(criada, { status: 201, statusText: 'Created' });
  });

  it('lê a mensagem do envelope em 409 ACAO_DUPLICADA', () => {
    const mensagem = "Acao 'VALE3' ja esta cadastrada";

    service.criar({ nomeAcao: 'VALE3', nomeCompleto: 'Vale S.A.' }).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: AcaoCadastroError) => {
        expect(err).toBeInstanceOf(AcaoCadastroError);
        expect(err.message).toBe(mensagem);
        expect(err.status).toBe(409);
        expect(err.code).toBe('ACAO_DUPLICADA');
      }
    });

    httpMock.expectOne('http://localhost:8080/api/acoes').flush(
      { erro: 'ACAO_DUPLICADA', mensagem },
      { status: 409, statusText: 'Conflict' }
    );
  });

  it('usa mensagem genérica de cadastro em 400 sem mensagem', () => {
    service.criar({ nomeAcao: 'VALE3', nomeCompleto: 'Vale S.A.' }).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: AcaoCadastroError) => {
        expect(err).toBeInstanceOf(AcaoCadastroError);
        expect(err.message).toBe(MSG_FALHA_CADASTRAR);
        expect(err.status).toBe(400);
      }
    });

    httpMock.expectOne('http://localhost:8080/api/acoes').flush(
      {},
      { status: 400, statusText: 'Bad Request' }
    );
  });

  it('usa mensagem genérica de cadastro em 500', () => {
    service.criar({ nomeAcao: 'VALE3', nomeCompleto: 'Vale S.A.' }).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: AcaoCadastroError) => {
        expect(err.message).toBe(MSG_FALHA_CADASTRAR);
        expect(err.status).toBe(500);
      }
    });

    httpMock.expectOne('http://localhost:8080/api/acoes').flush(
      { mensagem: 'stacktrace' },
      { status: 500, statusText: 'Server Error' }
    );
  });

  it('usa mensagem genérica de cadastro em falha de rede', () => {
    service.criar({ nomeAcao: 'VALE3', nomeCompleto: 'Vale S.A.' }).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: AcaoCadastroError) => {
        expect(err.message).toBe(MSG_FALHA_CADASTRAR);
      }
    });

    httpMock.expectOne('http://localhost:8080/api/acoes').error(new ProgressEvent('error'));
  });
});
