import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiError } from '../models/api-errors.model';
import { RelatorioAtualizacao } from '../models/relatorio-atualizacao.model';
import { MSG_FALHA_ATUALIZAR_COTACOES } from '../utils/gestao-acoes-mensagens';

@Injectable({ providedIn: 'root' })
export class AtualizacaoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  executar(): Observable<RelatorioAtualizacao> {
    return this.http
      .post<RelatorioAtualizacao>(`${this.baseUrl}/atualizacao/executar`, {})
      .pipe(catchError((error: unknown) => this.mapearErro(error)));
  }

  private mapearErro(error: unknown): Observable<never> {
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    return throwError(() => new ApiError(MSG_FALHA_ATUALIZAR_COTACOES, status));
  }
}
