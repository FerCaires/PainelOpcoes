import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SimulacaoMetaPremioApiService } from './simulacao-meta-premio-api.service';
import { SimulacaoMetaPremioError } from '../models/api-errors.model';
import { Modalidade } from '../models/modalidade.enum';
import { Moneyness } from '../models/moneyness.enum';
import { TipoNotional } from '../models/tipo-notional.enum';
import { TipoOpcao } from '../models/tipo-opcao.enum';
import { SimulacaoMetaPremioResponse } from '../models/simulacao-meta-premio-response.model';
import { MSG_FALHA_SIMULACAO } from '../utils/simulacao-meta-premio-mensagens';

describe('SimulacaoMetaPremioApiService', () => {
  let service: SimulacaoMetaPremioApiService;
  let httpMock: HttpTestingController;

  const url = 'http://localhost:8080/api/simulacao-meta-premio';

  const respostaComItem: SimulacaoMetaPremioResponse = {
    nomeAcao: 'BBAS3',
    nomeCompleto: 'Banco do Brasil S.A.',
    precoSpot: 42.13,
    metaPremio: 1000,
    tipo: TipoOpcao.CALL,
    dataVencimento: '2026-10-16',
    diasAteVencimento: 15,
    quantidadeOperacoes: 1,
    opcoes: [
      {
        nome: 'BBAS3J423',
        tipo: TipoOpcao.CALL,
        modalidade: Modalidade.EUROPEIA,
        strike: 42.01,
        valorPremio: 1.53,
        percentualVsSpot: -0.0028,
        moneyness: Moneyness.ITM,
        avisoExercicio: 'No strike ITM, o prêmio é maior, porém há maior chance de exercício.',
        dataVencimento: '2026-10-16',
        diasAteVencimento: 15,
        quantidadeAcoes: 700,
        notional: 29491.0,
        tipoNotional: TipoNotional.ACOES,
        premioEstimado: 1071.0,
        roiOperacao: 0.0363,
        roiAnualizadoSimples: 0.4356
      }
    ]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SimulacaoMetaPremioApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(SimulacaoMetaPremioApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('envia query params sem locale', () => {
    service.simular('BBAS3', 1000, TipoOpcao.CALL).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === url &&
        r.params.get('nomeAcao') === 'BBAS3' &&
        r.params.get('metaPremio') === '1000' &&
        r.params.get('tipo') === 'CALL'
    );
    expect(req.request.method).toBe('GET');
    req.flush(respostaComItem);
  });

  it('emite o corpo 200 com a opção recebida', () => {
    service.simular('BBAS3', 1000, TipoOpcao.CALL).subscribe((res) => {
      expect(res.opcoes[0].nome).toBe('BBAS3J423');
    });

    httpMock.expectOne((r) => r.url === url).flush(respostaComItem);
  });

  it('trata 200 com opcoes vazias como sucesso', () => {
    const vazia: SimulacaoMetaPremioResponse = {
      ...respostaComItem,
      quantidadeOperacoes: 0,
      opcoes: []
    };

    service.simular('BBAS3', 1000, TipoOpcao.CALL).subscribe((res) => {
      expect(res.quantidadeOperacoes).toBe(0);
      expect(res.opcoes).toEqual([]);
    });

    httpMock.expectOne((r) => r.url === url).flush(vazia);
  });

  it('propaga mensagem do envelope em 404', () => {
    service.simular('XPTO9', 1000, TipoOpcao.CALL).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: SimulacaoMetaPremioError) => {
        expect(err).toBeInstanceOf(SimulacaoMetaPremioError);
        expect(err.message).toBe('Ação XPTO9 não encontrada');
        expect(err.status).toBe(404);
        expect(err.code).toBe('ACAO_NAO_ENCONTRADA');
      }
    });

    httpMock.expectOne((r) => r.url === url).flush(
      {
        timestamp: '2026-10-01T14:00:00',
        status: 404,
        erro: 'ACAO_NAO_ENCONTRADA',
        mensagem: 'Ação XPTO9 não encontrada',
        detalhes: []
      },
      { status: 404, statusText: 'Not Found' }
    );
  });

  it('propaga mensagem do envelope em 422 META_PREMIO_INVALIDA', () => {
    service.simular('BBAS3', -1, TipoOpcao.CALL).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: SimulacaoMetaPremioError) => {
        expect(err.message).toBe('metaPremio deve ser maior que zero');
        expect(err.code).toBe('META_PREMIO_INVALIDA');
      }
    });

    httpMock.expectOne((r) => r.url === url).flush(
      {
        erro: 'META_PREMIO_INVALIDA',
        mensagem: 'metaPremio deve ser maior que zero'
      },
      { status: 422, statusText: 'Unprocessable Entity' }
    );
  });

  it('usa mensagem genérica quando 4xx não tem mensagem', () => {
    service.simular('BBAS3', 1000, TipoOpcao.CALL).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: Error) => {
        expect(err.message).toBe(MSG_FALHA_SIMULACAO);
      }
    });

    httpMock.expectOne((r) => r.url === url).flush(
      { erro: 'META_PREMIO_INVALIDA' },
      { status: 422, statusText: 'Unprocessable Entity' }
    );
  });

  it('usa mensagem genérica em HTTP 500', () => {
    service.simular('BBAS3', 1000, TipoOpcao.CALL).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: Error) => {
        expect(err.message).toBe(MSG_FALHA_SIMULACAO);
      }
    });

    httpMock.expectOne((r) => r.url === url).flush(
      { erro: 'ERRO_INTERNO', mensagem: 'stack' },
      { status: 500, statusText: 'Server Error' }
    );
  });

  it('usa mensagem genérica em falha de rede', () => {
    service.simular('BBAS3', 1000, TipoOpcao.CALL).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: Error) => {
        expect(err.message).toBe(MSG_FALHA_SIMULACAO);
      }
    });

    httpMock.expectOne((r) => r.url === url).error(new ProgressEvent('error'));
  });
});
