import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Carteira } from '../models/carteira.model';
import { OpcaoCarteira } from '../models/opcao-carteira.model';
import { SituacaoOpcao } from '../models/situacao-opcao.enum';
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

  atualizarSituacaoOpcao(
    carteiraId: string,
    nomeOpcao: string,
    situacao: SituacaoOpcao
  ): Observable<OpcaoCarteira> {
    return this.http.put<OpcaoCarteira>(
      `${this.baseUrl}/carteiras/${carteiraId}/opcoes/${nomeOpcao}`,
      { situacao }
    ).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  listarOpcoesCarteira(carteiraId: string): Observable<OpcaoCarteira[]> {
    return this.http.get<Record<string, unknown>[]>(
      `${this.baseUrl}/carteiras/${carteiraId}/opcoes`
    ).pipe(
      map((itens) => itens.map((raw) => this.normalizarOpcaoCarteira(raw))),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  private normalizarOpcaoCarteira(raw: Record<string, unknown>): OpcaoCarteira {
    const nomeOpcao =
      typeof raw['nomeOpcao'] === 'string'
        ? raw['nomeOpcao']
        : typeof raw['nome'] === 'string'
          ? raw['nome']
          : '';

    return {
      nomeOpcao,
      vencimento: typeof raw['vencimento'] === 'string' ? raw['vencimento'] : '',
      strike: typeof raw['strike'] === 'number' ? raw['strike'] : 0,
      premio: typeof raw['premio'] === 'number' ? raw['premio'] : 0,
      situacao: this.castSituacao(raw['situacao'])
    };
  }

  private castSituacao(valor: unknown): SituacaoOpcao {
    if (typeof valor === 'string' && Object.values(SituacaoOpcao).includes(valor as SituacaoOpcao)) {
      return valor as SituacaoOpcao;
    }
    return SituacaoOpcao.ABERTA;
  }
}