import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Acao } from '../models/acao.model';
import { ApiError } from '../models/api-errors.model';
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
}
