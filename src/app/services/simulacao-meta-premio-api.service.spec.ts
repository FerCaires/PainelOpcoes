import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SimulacaoMetaPremioApiService } from './simulacao-meta-premio-api.service';
import { SimulacaoMetaPremioError } from '../models/api-errors.model';
import { Modalidade } from '../models/modalidade.enum';
import { Moneyness } from '../models/moneyness.enum';
import { TipoNotional } from '../models/tipo-notional.enum';
import { TipoOpcao } from '../models/tipo-opcao.enum';
import { ModoSimulacao } from '../models/modo-simulacao.enum';
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

  const requestMeta = {
    nomeAcao: 'BBAS3',
    tipo: TipoOpcao.CALL,
    modo: ModoSimulacao.META_PREMIO,
    metaPremio: 1000
  };

  it('envia query params sem locale', () => {
    service.simular(requestMeta).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === url &&
        r.params.get('nomeAcao') === 'BBAS3' &&
        r.params.get('metaPremio') === '1000' &&
        r.params.get('tipo') === 'CALL' &&
        r.params.get('modo') === 'META_PREMIO'
    );
    expect(req.request.method).toBe('GET');
    req.flush(respostaComItem);
  });

  it('envia garantia sem metaPremio no modo GARANTIA', () => {
    service
      .simular({
        nomeAcao: 'BBAS3',
        tipo: TipoOpcao.CALL,
        modo: ModoSimulacao.GARANTIA,
        garantia: 30000
      })
      .subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === url &&
        r.params.get('modo') === 'GARANTIA' &&
        r.params.get('garantia') === '30000' &&
        r.params.get('metaPremio') === null &&
        r.params.get('quantidadeAcoes') === null
    );
    expect(req.request.method).toBe('GET');
    req.flush({ ...respostaComItem, modo: ModoSimulacao.GARANTIA, metaPremio: null, garantia: 30000 });
  });

  it('envia quantidadeAcoes no modo QUANTIDADE_ACOES', () => {
    service
      .simular({
        nomeAcao: 'BBAS3',
        tipo: TipoOpcao.CALL,
        modo: ModoSimulacao.QUANTIDADE_ACOES,
        quantidadeAcoes: 700
      })
      .subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === url &&
        r.params.get('modo') === 'QUANTIDADE_ACOES' &&
        r.params.get('quantidadeAcoes') === '700' &&
        r.params.get('metaPremio') === null &&
        r.params.get('garantia') === null
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      ...respostaComItem,
      modo: ModoSimulacao.QUANTIDADE_ACOES,
      metaPremio: null,
      quantidadeAcoesInformada: 700
    });
  });

  it('emite o corpo 200 com a opção recebida', () => {
    service.simular(requestMeta).subscribe((res) => {
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

    service.simular(requestMeta).subscribe((res) => {
      expect(res.quantidadeOperacoes).toBe(0);
      expect(res.opcoes).toEqual([]);
    });

    httpMock.expectOne((r) => r.url === url).flush(vazia);
  });

  it('propaga mensagem do envelope em 404', () => {
    service.simular({ ...requestMeta, nomeAcao: 'XPTO9' }).subscribe({
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

  it('propaga mensagem do envelope em 422 GARANTIA_INVALIDA', () => {
    service
      .simular({
        nomeAcao: 'BBAS3',
        tipo: TipoOpcao.CALL,
        modo: ModoSimulacao.GARANTIA,
        garantia: 0
      })
      .subscribe({
        next: () => fail('deveria falhar'),
        error: (err: SimulacaoMetaPremioError) => {
          expect(err.message).toBe('garantia deve ser maior que zero');
          expect(err.code).toBe('GARANTIA_INVALIDA');
          expect(err.status).toBe(422);
        }
      });

    httpMock.expectOne((r) => r.url === url).flush(
      {
        erro: 'GARANTIA_INVALIDA',
        mensagem: 'garantia deve ser maior que zero'
      },
      { status: 422, statusText: 'Unprocessable Entity' }
    );
  });

  it('propaga mensagem do envelope em 422 META_PREMIO_INVALIDA', () => {
    service.simular({ ...requestMeta, metaPremio: -1 }).subscribe({
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
    service.simular(requestMeta).subscribe({
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
    service.simular(requestMeta).subscribe({
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
    service.simular(requestMeta).subscribe({
      next: () => fail('deveria falhar'),
      error: (err: Error) => {
        expect(err.message).toBe(MSG_FALHA_SIMULACAO);
      }
    });

    httpMock.expectOne((r) => r.url === url).error(new ProgressEvent('error'));
  });
});
