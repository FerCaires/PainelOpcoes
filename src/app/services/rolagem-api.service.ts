import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BuscaRolagemRequest } from '../models/busca-rolagem-request.model';
import { BuscaRolagemResponse } from '../models/busca-rolagem-response.model';

@Injectable({
  providedIn: 'root'
})
export class RolagemApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  buscarRolagens(request: BuscaRolagemRequest): Observable<BuscaRolagemResponse> {
    const params = new HttpParams()
      .set('opcao', request.opcao)
      .set('quantidadeVencimentos', request.quantidadeVencimentos.toString())
      .set('tipoRolagem', request.tipoRolagem);

    return this.http.get<BuscaRolagemResponse>(`${this.baseUrl}/rolagem/por-tipo`, { params });
  }
}
