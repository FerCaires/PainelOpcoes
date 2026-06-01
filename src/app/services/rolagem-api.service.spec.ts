import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RolagemApiService } from './rolagem-api.service';
import { TipoRolagem } from '../models/tipo-rolagem.enum';
import { BuscaRolagemRequest } from '../models/busca-rolagem-request.model';
import { BuscaRolagemResponse } from '../models/busca-rolagem-response.model';

describe('RolagemApiService', () => {
  let service: RolagemApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RolagemApiService, provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(RolagemApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call GET /api/rolagem/por-tipo with correct params', () => {
    const request: BuscaRolagemRequest = {
      opcao: 'BBSEF358',
      quantidadeVencimentos: 3,
      tipoRolagem: TipoRolagem.POSITIVA_AUMENTO_STRIKE
    };

    const mockResponse: BuscaRolagemResponse = {
      opcao: 'BBSEF358',
      vencimento: '2026-06-19',
      strike: 33.29,
      premio: 1.74,
      rolagens: []
    };

    service.buscarRolagens(request).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne((r) =>
      r.url === 'http://localhost:8080/api/rolagem/por-tipo' &&
      r.params.get('opcao') === 'BBSEF358' &&
      r.params.get('quantidadeVencimentos') === '3' &&
      r.params.get('tipoRolagem') === 'POSITIVA_AUMENTO_STRIKE'
    );

    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
