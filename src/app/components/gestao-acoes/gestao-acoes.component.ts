import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { startWith } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';
import { Acao } from '../../models/acao.model';
import { CriarAcaoRequest } from '../../models/criar-acao-request.model';
import { RelatorioAtualizacao } from '../../models/relatorio-atualizacao.model';
import { AcaoApiService } from '../../services/acao-api.service';
import { AtualizacaoApiService } from '../../services/atualizacao-api.service';
import { formatarDataHora, formatarMonetario } from '../../utils/formatacao';
import {
  MSG_ACOES_CADASTRADAS_VAZIAS,
  MSG_FALHA_ATUALIZAR_COTACOES,
  MSG_FALHA_CADASTRAR
} from '../../utils/gestao-acoes-mensagens';
import { MSG_FALHA_CARREGAR_ACOES } from '../../utils/simulacao-meta-premio-mensagens';

@Component({
  selector: 'app-gestao-acoes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderMenuComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './gestao-acoes.component.html',
  styleUrls: ['./gestao-acoes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GestaoAcoesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly acaoApi = inject(AcaoApiService);
  private readonly atualizacaoApi = inject(AtualizacaoApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    nomeAcao: this.fb.control('', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{5}$/)]),
    nomeCompleto: this.fb.control('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(50)
    ])
  });

  readonly msgListaVazia = MSG_ACOES_CADASTRADAS_VAZIAS;
  readonly colunasTabela: string[] = ['nomeAcao', 'nomeCompleto', 'precoSpot', 'dataAtualizacao'];

  readonly acoes = signal<readonly Acao[]>([]);
  readonly carregandoAcoes = signal(false);
  readonly erroAcoes = signal<string | undefined>(undefined);
  readonly erroCadastro = signal<string | undefined>(undefined);
  readonly carregandoCadastro = signal(false);
  readonly relatorio = signal<RelatorioAtualizacao | undefined>(undefined);
  readonly erroAtualizacao = signal<string | undefined>(undefined);
  readonly carregandoAtualizacao = signal(false);

  private readonly formStatus = toSignal(this.form.statusChanges.pipe(startWith(this.form.status)), {
    initialValue: this.form.status
  });

  readonly emOperacao = computed(
    () => this.carregandoAcoes() || this.carregandoCadastro() || this.carregandoAtualizacao()
  );

  readonly podeAdicionar = computed(() => {
    this.formStatus();
    return this.form.valid && !this.emOperacao();
  });

  readonly podeAtualizar = computed(() => !this.emOperacao());

  readonly listaVazia = computed(
    () => this.acoes().length === 0 && !this.carregandoAcoes() && !this.erroAcoes()
  );

  ngOnInit(): void {
    this.carregarAcoes();
  }

  carregarAcoes(): void {
    this.carregandoAcoes.set(true);
    this.erroAcoes.set(undefined);
    this.acaoApi
      .listar()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.carregandoAcoes.set(false))
      )
      .subscribe({
        next: (acoes) => this.aplicarLista(acoes),
        error: (err: unknown) => this.tratarErroLista(err)
      });
  }

  adicionar(): void {
    if (!this.podeAdicionar()) {
      return;
    }
    const request = this.montarPedidoCadastro();
    if (!request) {
      return;
    }
    this.enviarCadastro(request);
  }

  atualizarCotacoes(): void {
    if (this.emOperacao()) {
      return;
    }
    this.erroAtualizacao.set(undefined);
    this.relatorio.set(undefined);
    this.carregandoAtualizacao.set(true);
    this.atualizacaoApi
      .executar()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.carregandoAtualizacao.set(false))
      )
      .subscribe({
        next: (relatorio) => this.aplicarRelatorio(relatorio),
        error: (err: unknown) => this.tratarErroAtualizacao(err)
      });
  }

  trackByNomeAcao(_index: number, acao: Acao): string {
    return acao.nomeAcao;
  }

  formatarSpot(preco: number | null): string {
    return preco == null ? '—' : formatarMonetario(preco);
  }

  formatarAtualizacao(iso: string | undefined): string {
    return iso ? formatarDataHora(iso) : '—';
  }

  private montarPedidoCadastro(): CriarAcaoRequest | undefined {
    const nomeAcao = this.form.controls.nomeAcao.value?.trim().toUpperCase();
    const nomeCompleto = this.form.controls.nomeCompleto.value?.trim();
    if (!nomeAcao || !nomeCompleto) {
      return undefined;
    }
    return { nomeAcao, nomeCompleto };
  }

  private enviarCadastro(request: CriarAcaoRequest): void {
    this.carregandoCadastro.set(true);
    this.erroCadastro.set(undefined);
    this.acaoApi
      .criar(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.carregandoCadastro.set(false))
      )
      .subscribe({
        next: (acao) => this.aplicarCadastro(acao),
        error: (err: unknown) => this.tratarErroCadastro(err)
      });
  }

  private aplicarCadastro(acao: Acao): void {
    this.acoes.update((atuais) => this.ordenarAcoes([...atuais, acao]));
    this.form.reset();
    this.erroCadastro.set(undefined);
  }

  private aplicarLista(acoes: readonly Acao[]): void {
    this.acoes.set(this.ordenarAcoes(acoes));
    this.erroAcoes.set(undefined);
  }

  private aplicarRelatorio(relatorio: RelatorioAtualizacao): void {
    this.relatorio.set(relatorio);
    this.carregarAcoes();
  }

  private ordenarAcoes(acoes: readonly Acao[]): Acao[] {
    return [...acoes].sort((a, b) => a.nomeAcao.localeCompare(b.nomeAcao));
  }

  private tratarErroLista(err: unknown): void {
    this.acoes.set([]);
    this.erroAcoes.set(err instanceof Error ? err.message : MSG_FALHA_CARREGAR_ACOES);
  }

  private tratarErroCadastro(err: unknown): void {
    this.erroCadastro.set(err instanceof Error ? err.message : MSG_FALHA_CADASTRAR);
  }

  private tratarErroAtualizacao(err: unknown): void {
    this.erroAtualizacao.set(err instanceof Error ? err.message : MSG_FALHA_ATUALIZAR_COTACOES);
  }
}
