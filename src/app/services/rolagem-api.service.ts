import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BuscaRolagemRequest } from '../models/busca-rolagem-request.model';
import { BuscaRolagemResponse } from '../models/busca-rolagem-response.model';
import { Modalidade } from '../models/modalidade.enum';

@Injectable({
  providedIn: 'root'
})
export class RolagemApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  buscarRolagens(request: BuscaRolagemRequest): Observable<BuscaRolagemResponse> {
    const params = new HttpParams()
      .set('opcao', request.opcao)
      .set('quantidadeVencimentos', request.quantidadeVencimentos.toString())
      .set('tipoRolagem', request.tipoRolagem)
      .set('modalidade', request.modalidade);

    return this.http.get<BuscaRolagemResponse>(`${this.baseUrl}/rolagem/por-tipo`, { params });
  }
}
