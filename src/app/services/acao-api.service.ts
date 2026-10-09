import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Acao } from '../models/acao.model';
import { AcaoCadastroError, ApiError } from '../models/api-errors.model';
import { CriarAcaoRequest } from '../models/criar-acao-request.model';
import { MSG_FALHA_CADASTRAR } from '../utils/gestao-acoes-mensagens';
import { MSG_FALHA_CARREGAR_ACOES } from '../utils/simulacao-meta-premio-mensagens';

@Injectable({ providedIn: 'root' })
export class AcaoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  listar(): Observable<Acao[]> {
    return this.http.get<Acao[]>(`${this.baseUrl}/acoes`).pipe(
      catchError((error: { status?: number }) =>
        throwError(() => new ApiError(MSG_FALHA_CARREGAR_ACOES, error.status ?? 0))
      )
    );
  }

  criar(request: CriarAcaoRequest): Observable<Acao> {
    return this.http
      .post<Acao>(`${this.baseUrl}/acoes`, request)
      .pipe(catchError((error: unknown) => this.mapearErroCadastro(error)));
  }

  private mapearErroCadastro(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse && error.status >= 400 && error.status < 500) {
      return this.mapearErro4xx(error);
    }
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    return throwError(() => new AcaoCadastroError(MSG_FALHA_CADASTRAR, status));
  }

  private mapearErro4xx(error: HttpErrorResponse): Observable<never> {
    const envelope = this.extrairEnvelope(error);
    const mensagem = envelope?.mensagem?.trim() ? envelope.mensagem : MSG_FALHA_CADASTRAR;
    return throwError(() => new AcaoCadastroError(mensagem, error.status, envelope?.erro));
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
