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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { startWith } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ConfirmacaoDialogComponent } from '../confirmacao-dialog/confirmacao-dialog.component';
import { GraficoBarrasResumoComponent } from '../grafico-barras-resumo/grafico-barras-resumo.component';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';
import { FiltrosOperacao, ListaOperacoes, ResumoOperacoes } from '../../models/lista-operacoes.model';
import { ItemBarraResumo } from '../../utils/montar-barras-resumo';
import { Operacao } from '../../models/operacao.model';
import { OperacaoRequest } from '../../models/operacao-request.model';
import { ResultadoImportacao } from '../../models/resultado-importacao.model';
import { TipoOpcao } from '../../models/tipo-opcao.enum';
import { OperacaoApiService } from '../../services/operacao-api.service';
import { ativoValido } from '../../utils/ativo-valido.validator';
import {
  MSG_CONFIRMAR_EXCLUSAO,
  MSG_FALHA_CARREGAR_OPERACOES,
  MSG_FALHA_EXCLUIR_OPERACAO,
  MSG_FALHA_IMPORTAR_PLANILHA,
  MSG_FALHA_SALVAR_OPERACAO,
  MSG_LISTA_VAZIA,
  MSG_LISTA_VAZIA_FILTRO
} from '../../utils/controle-operacoes-mensagens';
import { dataFinalizacaoNaoAnterior } from '../../utils/data-finalizacao.validator';
import { formatarDataIso, formatarMonetario, formatarPercentual3 } from '../../utils/formatacao';
import { maiorQueZero } from '../../utils/maior-que-zero.validator';
import { naoNegativo } from '../../utils/nao-negativo.validator';
import { normalizarAtivo, normalizarTicker } from '../../utils/normalizar-ativo';

@Component({
  selector: 'app-controle-operacoes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HeaderMenuComponent,
    GraficoBarrasResumoComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './controle-operacoes.component.html',
  styleUrls: ['./controle-operacoes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControleOperacoesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly operacaoApi = inject(OperacaoApiService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  readonly tiposOpcao = [TipoOpcao.CALL, TipoOpcao.PUT];
  readonly meses = [
    { valor: 1, nome: 'Janeiro' },
    { valor: 2, nome: 'Fevereiro' },
    { valor: 3, nome: 'Março' },
    { valor: 4, nome: 'Abril' },
    { valor: 5, nome: 'Maio' },
    { valor: 6, nome: 'Junho' },
    { valor: 7, nome: 'Julho' },
    { valor: 8, nome: 'Agosto' },
    { valor: 9, nome: 'Setembro' },
    { valor: 10, nome: 'Outubro' },
    { valor: 11, nome: 'Novembro' },
    { valor: 12, nome: 'Dezembro' }
  ];
  readonly colunasTabela: string[] = [
    'nomeOpcao',
    'corretora',
    'dataAplicacao',
    'tipo',
    'nomeAcao',
    'strike',
    'precoAtual',
    'valorPremio',
    'quantidade',
    'dataFinalizacao',
    'margemNecessaria',
    'dataPagamentoIr',
    'custo',
    'valorIr',
    'irPago',
    'lucroLiquido',
    'exercido',
    'rendimento',
    'totalAcumulado'
  ];

  readonly form = this.fb.group(
    {
      nomeOpcao: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^[A-Za-z0-9]{4,12}$/)
      ]),
      corretora: this.fb.control(''),
      dataAplicacao: this.fb.control('', Validators.required),
      tipo: this.fb.control<TipoOpcao | null>(null, Validators.required),
      nomeAcao: this.fb.control('', [Validators.required, ativoValido()]),
      strike: this.fb.control<number | null>(null, [Validators.required, maiorQueZero()]),
      valorPremio: this.fb.control<number | null>(null, [Validators.required, maiorQueZero()]),
      quantidade: this.fb.control<number | null>(null, [Validators.required, maiorQueZero()]),
      dataFinalizacao: this.fb.control('', Validators.required),
      custo: this.fb.control<number | null>(null, [Validators.required, naoNegativo()]),
      valorIr: this.fb.control<number | null>(0, naoNegativo()),
      dataPagamentoIr: this.fb.control(''),
      irPago: this.fb.control(false),
      exercido: this.fb.control(false)
    },
    { validators: dataFinalizacaoNaoAnterior() }
  );

  readonly operacoes = signal<readonly Operacao[]>([]);
  readonly resumo = signal<ResumoOperacoes | undefined>(undefined);
  readonly acoesVistas = signal<readonly string[]>([]);
  readonly anosVistos = signal<readonly number[]>([]);
  readonly filtroAcao = signal<string | null>(null);
  readonly filtroMes = signal<number | null>(null);
  readonly filtroAno = signal<number | null>(null);
  readonly cadastroAberto = signal(false);
  readonly idEdicao = signal<number | undefined>(undefined);
  readonly arquivoCsv = signal<File | undefined>(undefined);
  readonly resultadoImportacao = signal<ResultadoImportacao | undefined>(undefined);
  readonly carregandoLista = signal(false);
  readonly carregandoCadastro = signal(false);
  readonly carregandoExclusao = signal(false);
  readonly carregandoImportacao = signal(false);
  readonly erroLista = signal<string | undefined>(undefined);
  readonly erroCadastro = signal<string | undefined>(undefined);
  readonly erroExclusao = signal<string | undefined>(undefined);
  readonly erroImportacao = signal<string | undefined>(undefined);

  private readonly formStatus = toSignal(this.form.statusChanges.pipe(startWith(this.form.status)), {
    initialValue: this.form.status
  });

  readonly emOperacao = computed(
    () =>
      this.carregandoLista() ||
      this.carregandoCadastro() ||
      this.carregandoExclusao() ||
      this.carregandoImportacao()
  );

  readonly podeSalvar = computed(() => {
    this.formStatus();
    return this.form.valid && !this.emOperacao();
  });

  readonly podeExcluir = computed(() => this.idEdicao() != null && !this.emOperacao());
  readonly podeImportar = computed(() => this.arquivoCsv() != null && !this.emOperacao());
  readonly emEdicao = computed(() => this.idEdicao() != null);
  readonly temFiltro = computed(
    () => this.filtroAcao() != null || this.filtroMes() != null || this.filtroAno() != null
  );
  readonly listaVazia = computed(
    () => this.operacoes().length === 0 && !this.carregandoLista() && !this.erroLista()
  );
  readonly msgListaVazia = computed(() =>
    this.temFiltro() ? MSG_LISTA_VAZIA_FILTRO : MSG_LISTA_VAZIA
  );
  readonly barrasMes = computed(() => this.mapearBarrasMes(this.resumo()));
  readonly barrasAno = computed(() => this.mapearBarrasAno(this.resumo()));
  readonly barrasAtivo = computed(() => this.mapearBarrasAtivo(this.resumo()));

  ngOnInit(): void {
    this.carregarOperacoes();
  }

  carregarOperacoes(): void {
    this.carregandoLista.set(true);
    this.erroLista.set(undefined);
    this.operacaoApi
      .listar(this.montarFiltros())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.carregandoLista.set(false))
      )
      .subscribe({
        next: (lista) => this.aplicarLista(lista),
        error: (err: unknown) => this.tratarErroLista(err)
      });
  }

  alterarFiltroAcao(valor: string | null): void {
    this.filtroAcao.set(valor);
    this.carregarOperacoes();
  }

  alterarFiltroMes(valor: number | null): void {
    this.filtroMes.set(valor);
    this.carregarOperacoes();
  }

  alterarFiltroAno(valor: number | null): void {
    this.filtroAno.set(valor);
    this.carregarOperacoes();
  }

  abrirCadastro(): void {
    this.cadastroAberto.set(true);
  }

  fecharCadastro(): void {
    this.erroCadastro.set(undefined);
    this.limparFormulario();
  }

  salvar(): void {
    if (!this.podeSalvar()) {
      return;
    }
    const request = this.montarPedido();
    if (!request) {
      return;
    }
    const id = this.idEdicao();
    if (id == null) {
      this.enviarCriacao(request);
      return;
    }
    this.enviarAtualizacao(id, request);
  }

  selecionarOperacao(operacao: Operacao): void {
    this.idEdicao.set(operacao.id);
    this.erroCadastro.set(undefined);
    this.cadastroAberto.set(true);
    this.form.patchValue(this.valoresDaOperacao(operacao));
  }

  cancelarEdicao(): void {
    this.erroCadastro.set(undefined);
    this.limparFormulario();
  }

  confirmarExclusao(): void {
    const id = this.idEdicao();
    if (id == null || this.emOperacao()) {
      return;
    }
    this.dialog
      .open(ConfirmacaoDialogComponent, { data: { mensagem: MSG_CONFIRMAR_EXCLUSAO } })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmou: unknown) => {
        if (confirmou === true) {
          this.enviarExclusao(id);
        }
      });
  }

  selecionarArquivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.arquivoCsv.set(input.files?.[0]);
  }

  importar(): void {
    const arquivo = this.arquivoCsv();
    if (!arquivo || this.emOperacao()) {
      return;
    }
    this.erroImportacao.set(undefined);
    this.resultadoImportacao.set(undefined);
    this.carregandoImportacao.set(true);
    this.operacaoApi
      .importar(arquivo)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.carregandoImportacao.set(false))
      )
      .subscribe({
        next: (resultado) => this.aplicarImportacao(resultado),
        error: (err: unknown) => this.tratarErroImportacao(err)
      });
  }

  trackById(_index: number, operacao: Operacao): number {
    return operacao.id;
  }

  formatarData(valor: string | null): string {
    return valor ? formatarDataIso(valor) : '—';
  }

  formatarDinheiro(valor: number | null): string {
    return valor == null ? '—' : formatarMonetario(valor);
  }

  formatarRendimento(valor: number | null): string {
    return valor == null ? '—' : formatarPercentual3(valor);
  }

  formatarSimNao(valor: boolean): string {
    return valor ? 'Sim' : 'Não';
  }

  private montarFiltros(): FiltrosOperacao | undefined {
    const filtros: { nomeAcao?: string; ano?: number; mes?: number } = {};
    const acao = this.filtroAcao();
    const ano = this.filtroAno();
    const mes = this.filtroMes();
    if (acao) {
      filtros.nomeAcao = acao;
    }
    if (ano != null) {
      filtros.ano = ano;
    }
    if (mes != null) {
      filtros.mes = mes;
    }
    return Object.keys(filtros).length > 0 ? filtros : undefined;
  }

  private montarPedido(): OperacaoRequest | undefined {
    const base = this.lerCamposBase();
    return base ? this.completarPedido(base) : undefined;
  }

  private lerCamposBase(): OperacaoRequest | undefined {
    const nomeOpcao = normalizarTicker(this.form.controls.nomeOpcao.value ?? '');
    const nomeAcao = normalizarAtivo(this.form.controls.nomeAcao.value ?? '');
    const tipo = this.form.controls.tipo.value;
    const dataAplicacao = this.form.controls.dataAplicacao.value;
    const dataFinalizacao = this.form.controls.dataFinalizacao.value;
    if (!nomeOpcao || !nomeAcao || !tipo || !dataAplicacao || !dataFinalizacao) {
      return undefined;
    }
    return this.montarNumeros(nomeOpcao, nomeAcao, tipo, dataAplicacao, dataFinalizacao);
  }

  private montarNumeros(
    nomeOpcao: string,
    nomeAcao: string,
    tipo: TipoOpcao,
    dataAplicacao: string,
    dataFinalizacao: string
  ): OperacaoRequest | undefined {
    const strike = this.numeroOuNulo(this.form.controls.strike.value);
    const valorPremio = this.numeroOuNulo(this.form.controls.valorPremio.value);
    const quantidade = this.numeroOuNulo(this.form.controls.quantidade.value);
    const custo = this.numeroOuNulo(this.form.controls.custo.value);
    if (strike == null || valorPremio == null || quantidade == null || custo == null) {
      return undefined;
    }
    return {
      nomeOpcao,
      nomeAcao,
      tipo,
      dataAplicacao,
      dataFinalizacao,
      strike,
      valorPremio,
      quantidade,
      custo,
      valorIr: this.numeroOuNulo(this.form.controls.valorIr.value, true) ?? 0,
      irPago: Boolean(this.form.controls.irPago.value),
      exercido: Boolean(this.form.controls.exercido.value)
    };
  }

  private completarPedido(base: OperacaoRequest): OperacaoRequest {
    const corretora = this.form.controls.corretora.value?.trim();
    const dataPagamentoIr = this.form.controls.dataPagamentoIr.value?.trim();
    return {
      ...base,
      ...(corretora ? { corretora } : {}),
      ...(dataPagamentoIr ? { dataPagamentoIr } : {})
    };
  }

  private numeroOuNulo(
    valor: number | string | null | undefined,
    vazioComoZero = false
  ): number | undefined {
    if (valor === null || valor === undefined || valor === '') {
      return vazioComoZero ? 0 : undefined;
    }
    const numero = Number(valor);
    return Number.isNaN(numero) ? undefined : numero;
  }

  private enviarCriacao(request: OperacaoRequest): void {
    this.carregandoCadastro.set(true);
    this.erroCadastro.set(undefined);
    this.operacaoApi
      .criar(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.carregandoCadastro.set(false))
      )
      .subscribe({
        next: () => this.aplicarSucessoEscrita(),
        error: (err: unknown) => this.tratarErroCadastro(err)
      });
  }

  private enviarAtualizacao(id: number, request: OperacaoRequest): void {
    this.carregandoCadastro.set(true);
    this.erroCadastro.set(undefined);
    this.operacaoApi
      .atualizar(id, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.carregandoCadastro.set(false))
      )
      .subscribe({
        next: () => this.aplicarSucessoEscrita(),
        error: (err: unknown) => this.tratarErroCadastro(err)
      });
  }

  private enviarExclusao(id: number): void {
    this.carregandoExclusao.set(true);
    this.erroExclusao.set(undefined);
    this.operacaoApi
      .excluir(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.carregandoExclusao.set(false))
      )
      .subscribe({
        next: () => this.aplicarSucessoExclusao(),
        error: (err: unknown) => this.tratarErroExclusao(err)
      });
  }

  private aplicarLista(lista: ListaOperacoes): void {
    this.operacoes.set(lista.operacoes);
    this.resumo.set(lista.resumo);
    this.erroLista.set(undefined);
    this.incorporarFiltrosVistos(lista.operacoes);
  }

  private incorporarFiltrosVistos(operacoes: readonly Operacao[]): void {
    const acoes = new Set(this.acoesVistas());
    const anos = new Set(this.anosVistos());
    for (const operacao of operacoes) {
      acoes.add(operacao.nomeAcao);
      const ano = Number(operacao.dataAplicacao.slice(0, 4));
      if (!Number.isNaN(ano)) {
        anos.add(ano);
      }
    }
    this.acoesVistas.set([...acoes].sort());
    this.anosVistos.set([...anos].sort((a, b) => b - a));
  }

  private aplicarSucessoEscrita(): void {
    this.erroCadastro.set(undefined);
    this.limparFormulario();
    this.carregarOperacoes();
  }

  private aplicarSucessoExclusao(): void {
    this.erroExclusao.set(undefined);
    this.limparFormulario();
    this.carregarOperacoes();
  }

  private aplicarImportacao(resultado: ResultadoImportacao): void {
    this.resultadoImportacao.set(resultado);
    this.erroImportacao.set(undefined);
    this.carregarOperacoes();
  }

  private valoresDaOperacao(operacao: Operacao): Record<string, string | number | boolean | null> {
    return {
      nomeOpcao: operacao.nomeOpcao,
      corretora: operacao.corretora ?? '',
      dataAplicacao: operacao.dataAplicacao,
      tipo: operacao.tipo,
      nomeAcao: operacao.nomeAcao,
      strike: operacao.strike,
      valorPremio: operacao.valorPremio,
      quantidade: operacao.quantidade,
      dataFinalizacao: operacao.dataFinalizacao,
      custo: operacao.custo,
      valorIr: operacao.valorIr,
      dataPagamentoIr: operacao.dataPagamentoIr ?? '',
      irPago: operacao.irPago,
      exercido: operacao.exercido
    };
  }

  private mapearBarrasMes(resumo: ResumoOperacoes | undefined): ItemBarraResumo[] {
    return (resumo?.porMes ?? []).map((item) => ({ rotulo: item.anoMes, valor: item.lucro }));
  }

  private mapearBarrasAno(resumo: ResumoOperacoes | undefined): ItemBarraResumo[] {
    return (resumo?.porAno ?? []).map((item) => ({ rotulo: String(item.ano), valor: item.lucro }));
  }

  private mapearBarrasAtivo(resumo: ResumoOperacoes | undefined): ItemBarraResumo[] {
    return (resumo?.porAtivo ?? []).map((item) => ({ rotulo: item.nomeAcao, valor: item.lucro }));
  }

  private limparFormulario(): void {
    this.idEdicao.set(undefined);
    this.cadastroAberto.set(false);
    this.form.reset({
      nomeOpcao: '',
      corretora: '',
      dataAplicacao: '',
      tipo: null,
      nomeAcao: '',
      strike: null,
      valorPremio: null,
      quantidade: null,
      dataFinalizacao: '',
      custo: null,
      valorIr: 0,
      dataPagamentoIr: '',
      irPago: false,
      exercido: false
    });
  }

  private tratarErroLista(err: unknown): void {
    this.erroLista.set(err instanceof Error ? err.message : MSG_FALHA_CARREGAR_OPERACOES);
  }

  private tratarErroCadastro(err: unknown): void {
    this.erroCadastro.set(err instanceof Error ? err.message : MSG_FALHA_SALVAR_OPERACAO);
  }

  private tratarErroExclusao(err: unknown): void {
    this.erroExclusao.set(err instanceof Error ? err.message : MSG_FALHA_EXCLUIR_OPERACAO);
  }

  private tratarErroImportacao(err: unknown): void {
    this.erroImportacao.set(err instanceof Error ? err.message : MSG_FALHA_IMPORTAR_PLANILHA);
  }
}
