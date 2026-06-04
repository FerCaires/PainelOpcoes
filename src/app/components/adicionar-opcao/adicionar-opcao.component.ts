import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CarteiraApiService } from '../../services/carteira-api.service';
import { Carteira } from '../../models/carteira.model';
import { OpcaoCarteira } from '../../models/opcao-carteira.model';
import { OpcaoNaoEncontradaError, OpcaoJaExisteNaCarteiraError } from '../../models/api-errors.model';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';

@Component({
  selector: 'app-adicionar-opcao',
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
  templateUrl: './adicionar-opcao.component.html',
  styleUrls: ['./adicionar-opcao.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdicionarOpcaoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CarteiraApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  carteiras: Carteira[] = [];
  opcoesCarteira: OpcaoCarteira[] = [];
  dataSource = new MatTableDataSource<OpcaoCarteira>([]);
  carregando = false;
  erro?: string;

  colunasTabela = ['nome', 'vencimento', 'strike', 'premio', 'situacao'];

  ngOnInit(): void {
    this.form = this.fb.group({
      nomeOpcao: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(8),
        Validators.pattern(/^[a-zA-Z0-9]+$/)
      ]],
      carteiraId: ['', Validators.required]
    });
    this.carregarCarteirasAtivas();
  }

  private carregarCarteirasAtivas(): void {
    this.carregando = true;
    this.cdr.markForCheck();
    this.api.listarCarteirasAtivas().subscribe({
      next: (carteiras) => {
        this.carteiras = carteiras;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.erro = 'Erro ao carregar carteiras. Tente novamente.';
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }

  get nomeOpcaoControl() {
    return this.form.get('nomeOpcao')!;
  }

  get nomeOpcaoInvalido(): boolean {
    const ctrl = this.nomeOpcaoControl;
    return ctrl.touched && ctrl.dirty && (ctrl.hasError('required') || ctrl.hasError('minlength') || ctrl.hasError('maxlength') || ctrl.hasError('pattern'));
  }

  get carteiraIdControl() {
    return this.form.get('carteiraId')!;
  }

  get podeAdicionar(): boolean {
    return this.form.valid && !this.carregando;
  }

  adicionarOpcao(): void {
    if (this.form.invalid) return;

    const carteiraId = this.form.value.carteiraId;
    const nomeOpcao = this.form.value.nomeOpcao;

    this.carregando = true;
    this.erro = undefined;
    this.cdr.markForCheck();

    this.api.adicionarOpcao(carteiraId, nomeOpcao).subscribe({
      next: () => {
        this.carregando = false;
        this.form.get('nomeOpcao')?.setValue('');
        this.carregarOpcoesCarteira();
      },
      error: (err) => {
        this.carregando = false;
        if (err instanceof OpcaoNaoEncontradaError) {
          this.erro = err.message;
        } else if (err instanceof OpcaoJaExisteNaCarteiraError) {
          this.erro = err.message;
        } else {
          this.erro = 'Erro ao adicionar opção. Tente novamente.';
        }
        this.cdr.markForCheck();
      }
    });
  }

  carregarOpcoesCarteira(): void {
    const carteiraId = this.form.value.carteiraId;
    if (!carteiraId) return;

    this.carregando = true;
    this.cdr.markForCheck();
    this.api.listarOpcoesCarteira(carteiraId).subscribe({
      next: (opcoes) => {
        this.opcoesCarteira = opcoes;
        this.dataSource.data = opcoes;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.erro = 'Erro ao carregar opções da carteira. Tente novamente.';
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }

  trackByNome(index: number, opcao: OpcaoCarteira): string {
    return opcao.nome;
  }
}