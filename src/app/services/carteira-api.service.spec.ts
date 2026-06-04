import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CarteiraApiService } from './carteira-api.service';
import { Carteira } from '../models/carteira.model';
import { OpcaoCarteira } from '../models/opcao-carteira.model';
import { StatusCarteira } from '../models/status-carteira.enum';

describe('CarteiraApiService', () => {
  let service: CarteiraApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CarteiraApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(CarteiraApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('criarCarteira', () => {
    it('should call POST /api/carteiras with correct body', () => {
      const nome = 'MinhaCarteira';
      const mockResponse: Carteira = {
        id: '1',
        nome,
        status: StatusCarteira.ATIVA,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      };

      service.criarCarteira(nome).subscribe((res: Carteira) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/carteiras');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ nome });
      req.flush(mockResponse);
    });

    it('should handle error 409 when carteira duplicada', () => {
      const nome = 'CarteiraExistente';
      const errorResponse = { status: 409, statusText: 'Conflict' };

      service.criarCarteira(nome).subscribe({
        next: () => fail('should have failed'),
        error: (error: { status: number }) => {
          expect(error.status).toBe(409);
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/carteiras');
      req.flush('CARTEIRA_DUPLICADA', errorResponse);
    });
  });

  describe('listarCarteirasAtivas', () => {
    it('should call GET /api/carteiras with status=ATIVA', () => {
      const mockResponse: Carteira[] = [
        {
          id: '1',
          nome: 'Carteira1',
          status: StatusCarteira.ATIVA,
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        }
      ];

      service.listarCarteirasAtivas().subscribe((res: Carteira[]) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne((r) =>
        r.url === 'http://localhost:8080/api/carteiras' &&
        r.params.get('status') === 'ATIVA'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('adicionarOpcao', () => {
    it('should call POST /api/carteiras/{id}/opcoes/{nome}', () => {
      const carteiraId = '1';
      const nomeOpcao = 'PETR4123';

      service.adicionarOpcao(carteiraId, nomeOpcao).subscribe();

      const req = httpMock.expectOne(
        `http://localhost:8080/api/carteiras/${carteiraId}/opcoes/${nomeOpcao}`
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });

    it('should handle error 404 when opcao not found', () => {
      const carteiraId = '1';
      const nomeOpcao = 'OPCAO999';
      const errorResponse = { status: 404, statusText: 'Not Found' };

      service.adicionarOpcao(carteiraId, nomeOpcao).subscribe({
        next: () => fail('should have failed'),
        error: (error: { status: number }) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(
        `http://localhost:8080/api/carteiras/${carteiraId}/opcoes/${nomeOpcao}`
      );
      req.flush('OPCAO_NAO_ENCONTRADA', errorResponse);
    });

    it('should handle error 409 when opcao ja existe na carteira', () => {
      const carteiraId = '1';
      const nomeOpcao = 'PETR4123';
      const errorResponse = { status: 409, statusText: 'Conflict' };

      service.adicionarOpcao(carteiraId, nomeOpcao).subscribe({
        next: () => fail('should have failed'),
        error: (error: { status: number }) => {
          expect(error.status).toBe(409);
        }
      });

      const req = httpMock.expectOne(
        `http://localhost:8080/api/carteiras/${carteiraId}/opcoes/${nomeOpcao}`
      );
      req.flush('OPCAO_JA_EXISTE', errorResponse);
    });
  });

  describe('listarOpcoesCarteira', () => {
    it('should call GET /api/carteiras/{id}/opcoes', () => {
      const carteiraId = '1';
      const mockResponse: OpcaoCarteira[] = [
        {
          nome: 'PETR4123',
          vencimento: '2024-06-19',
          strike: 33.29,
          premio: 1.74,
          situacao: 'ABERTA'
        }
      ];

      service.listarOpcoesCarteira(carteiraId).subscribe((res: OpcaoCarteira[]) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        `http://localhost:8080/api/carteiras/${carteiraId}/opcoes`
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});