import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiError, OperacaoErro } from '../models/api-errors.model';
import { FiltrosOperacao, ListaOperacoes } from '../models/lista-operacoes.model';
import { Operacao } from '../models/operacao.model';
import { OperacaoRequest } from '../models/operacao-request.model';
import { ResultadoImportacao } from '../models/resultado-importacao.model';
import {
  MSG_FALHA_CARREGAR_OPERACOES,
  MSG_FALHA_EXCLUIR_OPERACAO,
  MSG_FALHA_IMPORTAR_PLANILHA,
  MSG_FALHA_SALVAR_OPERACAO
} from '../utils/controle-operacoes-mensagens';

@Injectable({ providedIn: 'root' })
export class OperacaoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  listar(filtros?: FiltrosOperacao): Observable<ListaOperacoes> {
    return this.http
      .get<ListaOperacoes>(`${this.baseUrl}/operacoes`, { params: this.montarParams(filtros) })
      .pipe(
        catchError((error: { status?: number }) =>
          throwError(() => new ApiError(MSG_FALHA_CARREGAR_OPERACOES, error.status ?? 0))
        )
      );
  }

  criar(request: OperacaoRequest): Observable<Operacao> {
    return this.http
      .post<Operacao>(`${this.baseUrl}/operacoes`, request)
      .pipe(catchError((error: unknown) => this.mapearErroEscrita(error, MSG_FALHA_SALVAR_OPERACAO)));
  }

  atualizar(id: number, request: OperacaoRequest): Observable<Operacao> {
    return this.http
      .put<Operacao>(`${this.baseUrl}/operacoes/${id}`, request)
      .pipe(catchError((error: unknown) => this.mapearErroEscrita(error, MSG_FALHA_SALVAR_OPERACAO)));
  }

  excluir(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/operacoes/${id}`)
      .pipe(catchError((error: unknown) => this.mapearErroEscrita(error, MSG_FALHA_EXCLUIR_OPERACAO)));
  }

  importar(arquivo: File): Observable<ResultadoImportacao> {
    const formData = new FormData();
    formData.append('file', arquivo);
    return this.http
      .post<ResultadoImportacao>(`${this.baseUrl}/operacoes/importar`, formData)
      .pipe(
        catchError((error: unknown) => this.mapearErroEscrita(error, MSG_FALHA_IMPORTAR_PLANILHA))
      );
  }

  private montarParams(filtros?: FiltrosOperacao): HttpParams {
    let params = new HttpParams();
    if (filtros?.nomeAcao) {
      params = params.set('nomeAcao', filtros.nomeAcao);
    }
    if (filtros?.ano != null) {
      params = params.set('ano', String(filtros.ano));
    }
    if (filtros?.mes != null) {
      params = params.set('mes', String(filtros.mes));
    }
    return params;
  }

  private mapearErroEscrita(error: unknown, generica: string): Observable<never> {
    if (error instanceof HttpErrorResponse && error.status >= 400 && error.status < 500) {
      return this.mapearErro4xx(error, generica);
    }
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    return throwError(() => new OperacaoErro(generica, status));
  }

  private mapearErro4xx(error: HttpErrorResponse, generica: string): Observable<never> {
    const envelope = this.extrairEnvelope(error);
    const mensagem = envelope?.mensagem?.trim() ? envelope.mensagem : generica;
    return throwError(() => new OperacaoErro(mensagem, error.status, envelope?.erro));
  }

  private extrairEnvelope(error: unknown): { mensagem?: string; erro?: string } | undefined {
    if (!(error instanceof HttpErrorResponse) || error.error === null || typeof error.error !== 'object') {
      return undefined;
    }
    const body = error.error as Record<string, unknown>;
    return {
      mensagem: typeof body['mensagem'] === 'string' ? body['mensagem'] : undefined,
      erro: typeof body['erro'] === 'string' ? body['erro'] : undefined
    };
  }
}
