import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { TipoRolagem } from '../../models/tipo-rolagem.enum';
import { BuscaRolagemRequest } from '../../models/busca-rolagem-request.model';
import { BuscaRolagemResponse } from '../../models/busca-rolagem-response.model';
import { RolagemVencimento } from '../../models/rolagem-vencimento.model';
import { Opcao } from '../../models/opcao.model';
import { RolagemApiService } from '../../services/rolagem-api.service';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';

@Component({
  selector: 'app-painel-rolagem',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    HeaderMenuComponent
  ],
  templateUrl: './painel-rolagem.component.html',
  styleUrls: ['./painel-rolagem.component.scss']
})
export class PainelRolagemComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(RolagemApiService);
  form: FormGroup;
  tiposRolagem = Object.values(TipoRolagem);
  vencimentos = [1, 2, 3];
  resultado?: BuscaRolagemResponse;
  carregando = false;
  erro?: string;

  colunasTabela = ['nome', 'vencimento', 'strike', 'premio', 'delta'];

  constructor() {
    this.form = this.fb.group({
      opcao: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(8)]],
      quantidadeVencimentos: [2, Validators.required],
      tipoRolagem: [TipoRolagem.POSITIVA_AUMENTO_STRIKE, Validators.required]
    });
  }

  get opcaoControl() {
    return this.form.get('opcao')!;
  }

  get opcaoInvalida(): boolean {
    const ctrl = this.opcaoControl;
    return ctrl.touched && ctrl.dirty && (ctrl.hasError('minlength') || ctrl.hasError('maxlength'));
  }

  get podeBuscar(): boolean {
    return this.form.valid && !this.carregando;
  }

  buscar(): void {
    if (this.form.invalid) return;

    const request: BuscaRolagemRequest = this.form.value;
    this.carregando = true;
    this.erro = undefined;
    this.resultado = undefined;

    this.api.buscarRolagens(request).subscribe({
      next: (res) => {
        this.resultado = res;
        this.carregando = false;
      },
      error: (err) => {
        this.erro = err.message || 'Erro ao buscar rolagens.';
        this.carregando = false;
      }
    });
  }

  formatarData(data: string): string {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  formatarValor(valor: number): string {
    return valor.toFixed(2);
  }

  opcoesParaVencimento(v: RolagemVencimento): Opcao[] {
    return v.opcoes;
  }
}
