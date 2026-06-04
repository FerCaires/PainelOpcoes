import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Carteira } from '../models/carteira.model';
import { OpcaoCarteira } from '../models/opcao-carteira.model';
import {
  CarteiraDuplicadaError,
  OpcaoNaoEncontradaError,
  OpcaoJaExisteNaCarteiraError
} from '../models/api-errors.model';

@Injectable({ providedIn: 'root' })
export class CarteiraApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  criarCarteira(nome: string): Observable<Carteira> {
    return this.http.post<Carteira>(`${this.baseUrl}/carteiras`, { nome }).pipe(
      catchError((error) => {
        if (error.status === 409) {
          return throwError(() => new CarteiraDuplicadaError());
        }
        return throwError(() => error);
      })
    );
  }

  listarCarteirasAtivas(): Observable<Carteira[]> {
    return this.http.get<Carteira[]>(`${this.baseUrl}/carteiras`, {
      params: { status: 'ATIVA' }
    }).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  adicionarOpcao(carteiraId: string, nomeOpcao: string): Observable<void> {
    return this.http.post<void>(
      `${this.baseUrl}/carteiras/${carteiraId}/opcoes/${nomeOpcao}`,
      {}
    ).pipe(
      catchError((error) => {
        if (error.status === 404) {
          return throwError(() => new OpcaoNaoEncontradaError());
        }
        if (error.status === 409) {
          return throwError(() => new OpcaoJaExisteNaCarteiraError());
        }
        return throwError(() => error);
      })
    );
  }

  listarOpcoesCarteira(carteiraId: string): Observable<OpcaoCarteira[]> {
    return this.http.get<OpcaoCarteira[]>(
      `${this.baseUrl}/carteiras/${carteiraId}/opcoes`
    ).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}