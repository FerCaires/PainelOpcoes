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
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { startWith } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';
import { Acao } from '../../models/acao.model';
import { Moneyness } from '../../models/moneyness.enum';
import { SimulacaoMetaPremioResponse } from '../../models/simulacao-meta-premio-response.model';
import { SimulacaoOpcaoItem } from '../../models/simulacao-opcao-item.model';
import { TipoNotional } from '../../models/tipo-notional.enum';
import { TipoOpcao } from '../../models/tipo-opcao.enum';
import { AcaoApiService } from '../../services/acao-api.service';
import { SimulacaoMetaPremioApiService } from '../../services/simulacao-meta-premio-api.service';
import {
  formatarDataIso,
  formatarMonetario,
  formatarPercentual,
  formatarTipoNotional
} from '../../utils/formatacao';
import { maiorQueZero } from '../../utils/maior-que-zero.validator';
import {
  MSG_ACOES_VAZIAS,
  MSG_FALHA_CARREGAR_ACOES,
  MSG_FALHA_SIMULACAO,
  MSG_OPCOES_VAZIAS
} from '../../utils/simulacao-meta-premio-mensagens';

@Component({
  selector: 'app-simulacao-meta-premio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderMenuComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './simulacao-meta-premio.component.html',
  styleUrls: ['./simulacao-meta-premio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimulacaoMetaPremioComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly acaoApi = inject(AcaoApiService);
  private readonly simulacaoApi = inject(SimulacaoMetaPremioApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly form = this.fb.group({
    nomeAcao: this.fb.control<string | null>(null, Validators.required),
    metaPremio: this.fb.control<number | null>(null, [Validators.required, maiorQueZero()]),
    tipo: this.fb.control<TipoOpcao | null>(null, Validators.required)
  });

  readonly tiposOpcao = Object.values(TipoOpcao);
  readonly msgAcoesVazias = MSG_ACOES_VAZIAS;
  readonly msgOpcoesVazias = MSG_OPCOES_VAZIAS;

  readonly acoes = signal<readonly Acao[]>([]);
  readonly carregandoAcoes = signal(false);
  readonly erroAcoes = signal<string | undefined>(undefined);

  readonly resultado = signal<SimulacaoMetaPremioResponse | undefined>(undefined);
  readonly carregandoSimulacao = signal(false);
  readonly erroSimulacao = signal<string | undefined>(undefined);

  readonly colunasTabela: string[] = [
    'nome',
    'tipo',
    'modalidade',
    'strike',
    'valorPremio',
    'percentualVsSpot',
    'moneyness',
    'avisoExercicio',
    'dataVencimento',
    'diasAteVencimento',
    'quantidadeAcoes',
    'notional',
    'tipoNotional',
    'premioEstimado',
    'roiOperacao',
    'roiAnualizadoSimples'
  ];

  private readonly formStatus = toSignal(
    this.form.statusChanges.pipe(startWith(this.form.status)),
    { initialValue: this.form.status }
  );

  readonly podeSimular = computed(() => {
    this.formStatus();
    return (
      this.form.valid &&
      this.acoes().length > 0 &&
      !this.erroAcoes() &&
      !this.carregandoAcoes() &&
      !this.carregandoSimulacao()
    );
  });

  readonly listaAcoesVazia = computed(
    () => this.acoes().length === 0 && !this.carregandoAcoes() && !this.erroAcoes()
  );

  readonly opcoesAnalise = computed(() =>
    (this.resultado()?.opcoes ?? []).filter((item) => this.isAtmOuOtm(item))
  );

  readonly opcoesVazias = computed(
    () => this.resultado() !== undefined && this.opcoesAnalise().length === 0
  );

  readonly opcaoSugerida = computed(() => this.opcoesAnalise()[0]);

  readonly carregando = computed(
    () => this.carregandoAcoes() || this.carregandoSimulacao()
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
        next: (acoes) => this.acoes.set(acoes),
        error: (err: unknown) => this.tratarErroAcoes(err)
      });
  }

  simular(): void {
    if (!this.form.valid) {
      return;
    }
    const params = this.paramsSimulacao();
    if (!params) {
      return;
    }
    this.dispararSimulacao(params.nomeAcao, params.metaPremio, params.tipo);
  }

  trackByNomeOpcao(_index: number, item: SimulacaoOpcaoItem): string {
    return item.nome;
  }

  formatarData(data: string): string {
    return formatarDataIso(data);
  }

  formatarMonetario(valor: number): string {
    return formatarMonetario(valor);
  }

  formatarPercentual(razao: number): string {
    return formatarPercentual(razao);
  }

  formatarTipoNotional(tipo: TipoNotional): string {
    return formatarTipoNotional(tipo);
  }

  isLinhaItm(item: SimulacaoOpcaoItem): boolean {
    return item.moneyness === Moneyness.ITM;
  }

  isAtmOuOtm(item: SimulacaoOpcaoItem): boolean {
    return item.moneyness === Moneyness.ATM || item.moneyness === Moneyness.OTM;
  }

  isOpcaoSugerida(item: SimulacaoOpcaoItem): boolean {
    return this.opcaoSugerida()?.nome === item.nome;
  }

  private paramsSimulacao(): { nomeAcao: string; metaPremio: number; tipo: TipoOpcao } | undefined {
    const nomeAcao = this.form.controls.nomeAcao.value;
    const metaPremio = this.form.controls.metaPremio.value;
    const tipo = this.form.controls.tipo.value;
    if (nomeAcao == null || metaPremio == null || tipo == null) {
      return undefined;
    }
    return { nomeAcao, metaPremio: Number(metaPremio), tipo };
  }

  private dispararSimulacao(nomeAcao: string, metaPremio: number, tipo: TipoOpcao): void {
    this.resultado.set(undefined);
    this.erroSimulacao.set(undefined);
    this.carregandoSimulacao.set(true);
    this.simulacaoApi
      .simular(nomeAcao, metaPremio, tipo)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.carregandoSimulacao.set(false))
      )
      .subscribe({
        next: (response) => this.resultado.set(response),
        error: (err: unknown) => this.tratarErroSimulacao(err)
      });
  }

  private tratarErroAcoes(err: unknown): void {
    this.acoes.set([]);
    this.erroAcoes.set(err instanceof Error ? err.message : MSG_FALHA_CARREGAR_ACOES);
  }

  private tratarErroSimulacao(err: unknown): void {
    this.erroSimulacao.set(err instanceof Error ? err.message : MSG_FALHA_SIMULACAO);
  }
}
