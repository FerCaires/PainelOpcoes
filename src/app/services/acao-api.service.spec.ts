import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AcaoApiService } from './acao-api.service';
import { Acao } from '../models/acao.model';
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
});
