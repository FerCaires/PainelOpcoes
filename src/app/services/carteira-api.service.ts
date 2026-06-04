import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Carteira } from '../models/carteira.model';
import { OpcaoCarteira } from '../models/opcao-carteira.model';

@Injectable({ providedIn: 'root' })
export class CarteiraApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api';

  criarCarteira(nome: string): Observable<Carteira> {
    return this.http.post<Carteira>(`${this.baseUrl}/carteiras`, { nome }).pipe(
      catchError((error) => {
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