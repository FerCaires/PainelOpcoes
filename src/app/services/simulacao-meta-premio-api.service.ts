import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { SimulacaoMetaPremioError } from '../models/api-errors.model';
import { SimulacaoMetaPremioResponse } from '../models/simulacao-meta-premio-response.model';
import { TipoOpcao } from '../models/tipo-opcao.enum';
import { MSG_FALHA_SIMULACAO } from '../utils/simulacao-meta-premio-mensagens';

@Injectable({ providedIn: 'root' })
export class SimulacaoMetaPremioApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  simular(
    nomeAcao: string,
    metaPremio: number,
    tipo: TipoOpcao
  ): Observable<SimulacaoMetaPremioResponse> {
    const params = new HttpParams()
      .set('nomeAcao', nomeAcao)
      .set('metaPremio', metaPremio.toString())
      .set('tipo', tipo);

    return this.http
      .get<SimulacaoMetaPremioResponse>(`${this.baseUrl}/simulacao-meta-premio`, { params })
      .pipe(catchError((error: unknown) => this.mapearErro(error)));
  }

  private mapearErro(error: unknown): Observable<never> {
    if (error instanceof HttpErrorResponse && error.status >= 400 && error.status < 500) {
      return this.mapearErro4xx(error);
    }
    const status = error instanceof HttpErrorResponse ? error.status : 0;
    return throwError(() => new SimulacaoMetaPremioError(MSG_FALHA_SIMULACAO, status));
  }

  private mapearErro4xx(error: HttpErrorResponse): Observable<never> {
    const envelope = this.extrairEnvelope(error);
    const mensagem = envelope?.mensagem?.trim() ? envelope.mensagem : MSG_FALHA_SIMULACAO;
    return throwError(
      () => new SimulacaoMetaPremioError(mensagem, error.status, envelope?.erro)
    );
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
