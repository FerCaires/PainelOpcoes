import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AtualizacaoApiService } from './atualizacao-api.service';
import { RelatorioAtualizacao } from '../models/relatorio-atualizacao.model';
import { MSG_FALHA_ATUALIZAR_COTACOES } from '../utils/gestao-acoes-mensagens';

describe('AtualizacaoApiService', () => {
  let service: AtualizacaoApiService;
  let httpMock: HttpTestingController;

  const url = 'http://localhost:8080/api/atualizacao/executar';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AtualizacaoApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AtualizacaoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('emite os totais quando POST /atualizacao/executar retorna 200', () => {
    const relatorio: RelatorioAtualizacao = {
      totalRecuperadas: 20,
      totalAtualizadas: 10,
      totalCadastradas: 8,
      totalNaoAtualizadas: 2
    };

    service.executar().subscribe((resposta) => {
      expect(resposta.totalAtualizadas).toBe(10);
      expect(resposta.totalRecuperadas).toBe(20);
      expect(resposta.totalCadastradas).toBe(8);
      expect(resposta.totalNaoAtualizadas).toBe(2);
    });

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush(relatorio);
  });

  it('usa mensagem genérica em 500', () => {
    service.executar().subscribe({
      next: () => fail('deveria falhar'),
      error: (err: Error) => {
        expect(err.message).toBe(MSG_FALHA_ATUALIZAR_COTACOES);
      }
    });

    httpMock.expectOne(url).flush({ mensagem: 'stacktrace' }, { status: 500, statusText: 'Server Error' });
  });

  it('usa mensagem genérica em falha de rede', () => {
    service.executar().subscribe({
      next: () => fail('deveria falhar'),
      error: (err: Error) => {
        expect(err.message).toBe(MSG_FALHA_ATUALIZAR_COTACOES);
      }
    });

    httpMock.expectOne(url).error(new ProgressEvent('error'));
  });
});
