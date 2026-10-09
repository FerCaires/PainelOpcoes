import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NEVER, of, Subject, throwError } from 'rxjs';
import { ControleOperacoesComponent } from './controle-operacoes.component';
import { ApiError, OperacaoErro } from '../../models/api-errors.model';
import { ListaOperacoes } from '../../models/lista-operacoes.model';
import { Operacao } from '../../models/operacao.model';
import { ResultadoImportacao } from '../../models/resultado-importacao.model';
import { TipoOpcao } from '../../models/tipo-opcao.enum';
import { OperacaoApiService } from '../../services/operacao-api.service';
import {
  MSG_FALHA_CARREGAR_OPERACOES,
  MSG_FALHA_IMPORTAR_PLANILHA,
  MSG_LISTA_VAZIA,
  MSG_LISTA_VAZIA_FILTRO
} from '../../utils/controle-operacoes-mensagens';

describe('ControleOperacoesComponent', () => {
  let component: ControleOperacoesComponent;
  let fixture: ComponentFixture<ControleOperacoesComponent>;
  let operacaoApi: jasmine.SpyObj<OperacaoApiService>;
  let dialog: jasmine.SpyObj<MatDialog>;

  const operacao: Operacao = {
    id: 1,
    nomeOpcao: 'BBAST194',
    corretora: 'XP',
    dataAplicacao: '2025-08-12',
    tipo: TipoOpcao.PUT,
    nomeAcao: 'BBAS3',
    strike: 19.08,
    precoAtual: 42.13,
    valorPremio: 0.59,
    quantidade: 100,
    dataFinalizacao: '2025-10-17',
    margemNecessaria: 1908,
    dataPagamentoIr: '2025-09-30',
    custo: 4.96,
    valorIr: 8.11,
    irPago: false,
    lucroLiquido: 45.93,
    exercido: false,
    rendimento: 0.024072,
    totalAcumulado: 45.93
  };

  const lista: ListaOperacoes = {
    operacoes: [operacao],
    resumo: {
      acumulado: 45.93,
      porMes: [{ anoMes: '2025-08', lucro: 45.93, rendimento: 0.024072 }],
      porAno: [{ ano: 2025, lucro: 45.93 }],
      porAtivo: [{ nomeAcao: 'BBAS3', lucro: 45.93 }]
    }
  };

  const listaVazia: ListaOperacoes = {
    operacoes: [],
    resumo: { acumulado: 0, porMes: [], porAno: [], porAtivo: [] }
  };

  const resultadoImportacao: ResultadoImportacao = {
    totalLidas: 3,
    totalIgnoradas: 1,
    totalCriadas: 1,
    totalAtualizadas: 1,
    erros: [{ linha: 2, mensagem: 'Ticker vazio' }]
  };

  async function configurar(
    listar: ReturnType<OperacaoApiService['listar']> = of(lista)
  ): Promise<void> {
    operacaoApi = jasmine.createSpyObj('OperacaoApiService', [
      'listar',
      'criar',
      'atualizar',
      'excluir',
      'importar'
    ]);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    operacaoApi.listar.and.returnValue(listar);
    operacaoApi.criar.and.returnValue(of(operacao));
    operacaoApi.atualizar.and.returnValue(of(operacao));
    operacaoApi.excluir.and.returnValue(of(undefined));
    operacaoApi.importar.and.returnValue(of(resultadoImportacao));
    dialog.open.and.returnValue({ afterClosed: () => of(false) } as never);

    await TestBed.configureTestingModule({
      imports: [ControleOperacoesComponent, NoopAnimationsModule, RouterTestingModule],
      providers: [
        { provide: OperacaoApiService, useValue: operacaoApi },
        { provide: MatDialog, useValue: dialog }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ControleOperacoesComponent);
    component = fixture.componentInstance;
  }

  function textoDaPagina(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function botaoSalvar(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
  }

  function abrirCadastro(): void {
    component.abrirCadastro();
    fixture.detectChanges();
  }

  function gruposFiltro(): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll('.filtros');
  }

  function preencherFormularioValido(overrides: Record<string, unknown> = {}): void {
    component.form.patchValue({
      nomeOpcao: 'BBAST194',
      dataAplicacao: '2025-08-12',
      tipo: TipoOpcao.PUT,
      nomeAcao: 'BBAS3',
      strike: 19.08,
      valorPremio: 0.59,
      quantidade: 100,
      dataFinalizacao: '2025-10-17',
      custo: 4.96,
      valorIr: 0,
      irPago: false,
      exercido: false,
      ...overrides
    });
    component.form.updateValueAndValidity();
    fixture.detectChanges();
  }

  it('cria o componente com OnPush e form inválido', async () => {
    await configurar();
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.form.controls.nomeOpcao.value).toBe('');
    expect(component.form.controls.valorIr.value).toBe(0);
    expect(component.form.controls.tipo.value).toBeNull();
    expect(component.form.invalid).toBeTrue();
  });

  it('dispara GET inicial sem query e mostra loading', async () => {
    await configurar(NEVER);
    fixture.detectChanges();

    expect(operacaoApi.listar).toHaveBeenCalledWith(undefined);
    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('mostra colunas, datas, monetário, rendimento e nulos', async () => {
    await configurar();
    fixture.detectChanges();

    expect(textoDaPagina()).toContain('BBAST194');
    expect(textoDaPagina()).toContain('12/08/2025');
    expect(textoDaPagina()).toContain('17/10/2025');
    expect(textoDaPagina()).toContain('2,407%');
    expect(textoDaPagina()).toContain('Não');
  });

  it('mostra — quando precoAtual e rendimento mensal são nulos', async () => {
    const semSpot: ListaOperacoes = {
      operacoes: [{ ...operacao, precoAtual: null, rendimento: null }],
      resumo: {
        acumulado: 45.93,
        porMes: [{ anoMes: '2025-08', lucro: 45.93, rendimento: null }],
        porAno: [],
        porAtivo: []
      }
    };
    await configurar(of(semSpot));
    fixture.detectChanges();

    expect(textoDaPagina()).toContain('—');
  });

  it('mostra estado vazio sem filtro e mantém cadastro recolhido e importar', async () => {
    await configurar(of(listaVazia));
    fixture.detectChanges();

    expect(textoDaPagina()).toContain(MSG_LISTA_VAZIA);
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(textoDaPagina()).toContain('Novo lançamento');
    expect(fixture.nativeElement.querySelector('.botao-importar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.erro-lista')).toBeNull();
  });

  it('mostra estado vazio de filtro distinto do vazio sem filtro', async () => {
    await configurar(of(listaVazia));
    fixture.detectChanges();
    operacaoApi.listar.and.returnValue(of(listaVazia));

    component.alterarFiltroAcao('PETR4');
    fixture.detectChanges();

    expect(textoDaPagina()).toContain(MSG_LISTA_VAZIA_FILTRO);
    expect(textoDaPagina()).not.toContain('Nenhuma operação lançada ainda');
  });

  it('exibe mensagem genérica quando o GET falha e mantém cadastro e importar', async () => {
    await configurar(throwError(() => new ApiError(MSG_FALHA_CARREGAR_OPERACOES, 500)));
    fixture.detectChanges();

    const alerta = fixture.nativeElement.querySelector('.erro-lista') as HTMLElement;
    expect(alerta.getAttribute('role')).toBe('alert');
    expect(alerta.textContent?.trim()).toBe(MSG_FALHA_CARREGAR_OPERACOES);
    expect(textoDaPagina()).toContain('Novo lançamento');
    expect(fixture.nativeElement.querySelector('.botao-importar')).toBeTruthy();
  });

  it('desabilita Salvar sem ticker ou com prêmio ≤ 0', async () => {
    await configurar();
    fixture.detectChanges();
    abrirCadastro();

    preencherFormularioValido({ nomeOpcao: '' });
    expect(component.podeSalvar()).toBeFalse();
    expect(botaoSalvar().disabled).toBeTrue();

    preencherFormularioValido({ valorPremio: 0 });
    expect(component.podeSalvar()).toBeFalse();
    expect(botaoSalvar().disabled).toBeTrue();

    preencherFormularioValido({ valorPremio: -1 });
    expect(component.podeSalvar()).toBeFalse();
  });

  it('POST inclui nomeOpcao e valorIr 0 se vazio e normaliza ticker/ativo', async () => {
    await configurar();
    fixture.detectChanges();

    preencherFormularioValido({
      nomeOpcao: 'itubp415w1',
      nomeAcao: 'bvmf:bbas3',
      valorIr: null
    });
    component.salvar();

    const enviado = operacaoApi.criar.calls.mostRecent().args[0];
    expect(enviado.nomeOpcao).toBe('ITUBP415W1');
    expect(enviado.nomeAcao).toBe('BBAS3');
    expect(enviado.valorIr).toBe(0);
    expect(enviado.dataPagamentoIr).toBeUndefined();
  });

  it('GET após 201 preserva os filtros atuais', async () => {
    await configurar();
    fixture.detectChanges();
    operacaoApi.listar.and.returnValue(of(lista));
    component.alterarFiltroAcao('PETR4');
    component.alterarFiltroAno(2026);
    component.alterarFiltroMes(4);
    operacaoApi.listar.calls.reset();

    preencherFormularioValido();
    component.salvar();
    fixture.detectChanges();

    expect(operacaoApi.criar).toHaveBeenCalled();
    expect(operacaoApi.listar).toHaveBeenCalledWith({ nomeAcao: 'PETR4', ano: 2026, mes: 4 });
    expect(component.form.controls.nomeOpcao.value).toBe('');
    expect(component.form.controls.valorIr.value).toBe(0);
    expect(component.erroCadastro()).toBeUndefined();
    expect(component.idEdicao()).toBeUndefined();
    expect(component.cadastroAberto()).toBeFalse();
  });

  it('mudar filtro dispara GET com query', async () => {
    await configurar();
    fixture.detectChanges();
    operacaoApi.listar.calls.reset();
    operacaoApi.listar.and.returnValue(of(listaVazia));

    component.alterarFiltroAcao('PETR4');
    expect(operacaoApi.listar).toHaveBeenCalledWith({ nomeAcao: 'PETR4' });

    component.alterarFiltroAno(2026);
    expect(operacaoApi.listar).toHaveBeenCalledWith({ nomeAcao: 'PETR4', ano: 2026 });

    component.alterarFiltroMes(4);
    expect(operacaoApi.listar).toHaveBeenCalledWith({ nomeAcao: 'PETR4', ano: 2026, mes: 4 });
  });

  it('três filtros em Todos disparam GET sem query', async () => {
    await configurar();
    fixture.detectChanges();
    component.alterarFiltroAcao('PETR4');
    operacaoApi.listar.calls.reset();
    operacaoApi.listar.and.returnValue(of(listaVazia));

    component.alterarFiltroAcao(null);
    expect(operacaoApi.listar).toHaveBeenCalledWith(undefined);
  });

  it('import envia o arquivo escolhido', async () => {
    await configurar();
    fixture.detectChanges();
    const arquivo = new File(['a;b'], 'planilha.csv', { type: 'text/csv' });
    component.arquivoCsv.set(arquivo);

    component.importar();

    expect(operacaoApi.importar).toHaveBeenCalledWith(arquivo);
  });

  it('mostra totais e erros após import 200 e relista com filtros', async () => {
    await configurar();
    fixture.detectChanges();
    component.alterarFiltroAcao('BBAS3');
    operacaoApi.listar.calls.reset();
    const arquivo = new File(['a'], 'planilha.csv', { type: 'text/csv' });
    component.arquivoCsv.set(arquivo);

    component.importar();
    fixture.detectChanges();

    expect(textoDaPagina()).toContain('1');
    expect(textoDaPagina()).toContain('Linha 2: Ticker vazio');
    expect(operacaoApi.listar).toHaveBeenCalledWith({ nomeAcao: 'BBAS3' });
    expect(textoDaPagina()).toContain('Novo lançamento');
  });

  it('422 de import mostra mensagem e preserva a lista', async () => {
    await configurar();
    operacaoApi.importar.and.returnValue(
      throwError(() => new OperacaoErro('Cabecalho invalido', 422, 'PLANILHA_INVALIDA'))
    );
    fixture.detectChanges();
    component.arquivoCsv.set(new File(['x'], 'ruim.csv', { type: 'text/csv' }));

    component.importar();
    fixture.detectChanges();

    expect(textoDaPagina()).toContain('Cabecalho invalido');
    expect(component.operacoes()[0].nomeOpcao).toBe('BBAST194');
  });

  it('mostra mensagem genérica de importar em 5xx', async () => {
    await configurar();
    operacaoApi.importar.and.returnValue(
      throwError(() => new OperacaoErro(MSG_FALHA_IMPORTAR_PLANILHA, 500))
    );
    fixture.detectChanges();
    component.arquivoCsv.set(new File(['x'], 'planilha.csv', { type: 'text/csv' }));

    component.importar();
    fixture.detectChanges();

    expect(textoDaPagina()).toContain(MSG_FALHA_IMPORTAR_PLANILHA);
  });

  it('não chama DELETE quando o dialog é cancelado', async () => {
    await configurar();
    fixture.detectChanges();
    component.selecionarOperacao(operacao);
    fixture.detectChanges();

    component.confirmarExclusao();

    expect(dialog.open).toHaveBeenCalled();
    expect(operacaoApi.excluir).not.toHaveBeenCalled();
  });

  it('DELETE + GET após confirmar exclusão', async () => {
    await configurar();
    dialog.open.and.returnValue({ afterClosed: () => of(true) } as never);
    fixture.detectChanges();
    component.selecionarOperacao(operacao);
    operacaoApi.listar.calls.reset();

    component.confirmarExclusao();
    fixture.detectChanges();

    expect(operacaoApi.excluir).toHaveBeenCalledWith(1);
    expect(operacaoApi.listar).toHaveBeenCalled();
  });

  it('preenche o formulário no clique da linha incluindo valor IR', async () => {
    await configurar();
    fixture.detectChanges();

    component.selecionarOperacao(operacao);

    expect(component.idEdicao()).toBe(1);
    expect(component.form.controls.nomeOpcao.value).toBe('BBAST194');
    expect(component.form.controls.valorIr.value).toBe(8.11);
    expect(component.cadastroAberto()).toBeTrue();
  });

  it('PUT envia o custo editado e relista', async () => {
    await configurar();
    fixture.detectChanges();
    component.selecionarOperacao(operacao);
    component.form.patchValue({ custo: 132 });
    component.form.updateValueAndValidity();
    operacaoApi.listar.calls.reset();
    operacaoApi.criar.calls.reset();

    component.salvar();
    fixture.detectChanges();

    expect(operacaoApi.criar).not.toHaveBeenCalled();
    expect(operacaoApi.atualizar).toHaveBeenCalledWith(
      1,
      jasmine.objectContaining({ custo: 132, valorIr: 8.11, nomeOpcao: 'BBAST194' })
    );
    expect(operacaoApi.listar).toHaveBeenCalled();
    expect(component.idEdicao()).toBeUndefined();
    expect(component.erroCadastro()).toBeUndefined();
  });

  it('mostra a mensagem do PUT 4xx', async () => {
    await configurar();
    operacaoApi.atualizar.and.returnValue(
      throwError(() => new OperacaoErro('Operacao com a mesma identidade ja cadastrada', 409, 'OPERACAO_DUPLICADA'))
    );
    fixture.detectChanges();
    component.selecionarOperacao(operacao);
    component.form.patchValue({ custo: 132 });
    component.form.updateValueAndValidity();

    component.salvar();
    fixture.detectChanges();

    expect(textoDaPagina()).toContain('Operacao com a mesma identidade ja cadastrada');
    expect(component.idEdicao()).toBe(1);
  });

  it('Cancelar descarta o rascunho sem HTTP', async () => {
    await configurar();
    fixture.detectChanges();
    component.selecionarOperacao(operacao);
    operacaoApi.atualizar.calls.reset();
    operacaoApi.listar.calls.reset();

    component.cancelarEdicao();

    expect(component.idEdicao()).toBeUndefined();
    expect(component.form.controls.nomeOpcao.value).toBe('');
    expect(component.cadastroAberto()).toBeFalse();
    expect(operacaoApi.atualizar).not.toHaveBeenCalled();
    expect(operacaoApi.listar).not.toHaveBeenCalled();
  });

  it('desabilita Salvar e Importar durante request', async () => {
    const pending = new Subject<Operacao>();
    await configurar();
    operacaoApi.criar.and.returnValue(pending.asObservable());
    fixture.detectChanges();
    preencherFormularioValido();
    abrirCadastro();
    component.arquivoCsv.set(new File(['x'], 'planilha.csv', { type: 'text/csv' }));

    component.salvar();
    fixture.detectChanges();

    expect(botaoSalvar().disabled).toBeTrue();
    expect(component.podeImportar()).toBeFalse();
  });

  it('renderiza o header no topo', async () => {
    await configurar();
    fixture.detectChanges();

    const raiz = fixture.nativeElement as HTMLElement;
    expect(raiz.firstElementChild?.tagName.toLowerCase()).toBe('app-header-menu');
  });

  it('chama listar de novo ao recriar o componente', async () => {
    await configurar();
    fixture.detectChanges();
    expect(operacaoApi.listar).toHaveBeenCalledTimes(1);

    fixture.destroy();
    fixture = TestBed.createComponent(ControleOperacoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(operacaoApi.listar).toHaveBeenCalledTimes(2);
    expect(component.cadastroAberto()).toBeFalse();
    expect(component.filtroAcao()).toBeNull();
    expect(component.filtroMes()).toBeNull();
    expect(component.filtroAno()).toBeNull();
  });

  it('não esvazia o seletor de ação ao filtrar', async () => {
    await configurar();
    fixture.detectChanges();
    expect(component.acoesVistas()).toContain('BBAS3');

    operacaoApi.listar.and.returnValue(of(listaVazia));
    component.alterarFiltroAcao('BBAS3');
    fixture.detectChanges();

    expect(component.acoesVistas()).toContain('BBAS3');
  });

  it('inicia com cadastro recolhido e botão Novo lançamento', async () => {
    await configurar();
    fixture.detectChanges();

    expect(component.cadastroAberto()).toBeFalse();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(textoDaPagina()).toContain('Novo lançamento');
    expect(fixture.nativeElement.querySelector('.botao-importar')).toBeTruthy();
  });

  it('abre e fecha o cadastro sem HTTP', async () => {
    await configurar();
    fixture.detectChanges();
    operacaoApi.listar.calls.reset();
    abrirCadastro();

    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
    expect(textoDaPagina()).toContain('Fechar cadastro');

    component.fecharCadastro();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('form')).toBeNull();
    expect(component.form.controls.nomeOpcao.value).toBe('');
    expect(operacaoApi.listar).not.toHaveBeenCalled();
    expect(operacaoApi.criar).not.toHaveBeenCalled();
  });

  it('clique na linha abre o cadastro em edição', async () => {
    await configurar();
    fixture.detectChanges();

    const linha = fixture.nativeElement.querySelector('tr[mat-row]') as HTMLElement;
    linha.click();
    fixture.detectChanges();

    expect(component.cadastroAberto()).toBeTrue();
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
    expect(component.idEdicao()).toBe(1);
    expect(textoDaPagina()).toContain('Cancelar');
  });

  it('renderiza filtros nos resumos e na tabela', async () => {
    await configurar();
    fixture.detectChanges();

    const grupos = gruposFiltro();
    expect(grupos.length).toBe(2);
    expect(grupos[0].getAttribute('aria-label')).toBe('Filtros do resumo');
    expect(grupos[1].getAttribute('aria-label')).toBe('Filtros da tabela');
  });

  it('alterar filtro nos resumos dispara GET com query', async () => {
    await configurar();
    fixture.detectChanges();
    operacaoApi.listar.calls.reset();
    operacaoApi.listar.and.returnValue(of(listaVazia));

    component.alterarFiltroAcao('PETR4');
    component.alterarFiltroAno(2026);
    component.alterarFiltroMes(4);

    expect(operacaoApi.listar).toHaveBeenCalledWith({ nomeAcao: 'PETR4', ano: 2026, mes: 4 });
  });

  it('mostra gráfico mensal e oculta série vazia', async () => {
    await configurar();
    fixture.detectChanges();

    const graficos = fixture.nativeElement.querySelectorAll('app-grafico-barras-resumo');
    expect(graficos.length).toBe(3);
    expect(textoDaPagina()).toContain('Lucro por mês');
    expect(textoDaPagina()).toContain('2025-08');
  });

  it('não mostra gráfico quando a série do resumo está vazia', async () => {
    const soAcumulado: ListaOperacoes = {
      operacoes: [operacao],
      resumo: { acumulado: 45.93, porMes: [], porAno: [], porAtivo: [] }
    };
    await configurar(of(soAcumulado));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-grafico-barras-resumo')).toBeNull();
    expect(textoDaPagina()).toContain('Acumulado');
  });

  it('desabilita filtros durante request', async () => {
    await configurar(NEVER);
    fixture.detectChanges();

    const selects = fixture.nativeElement.querySelectorAll('mat-select');
    expect(selects.length).toBeGreaterThan(0);
    selects.forEach((select: HTMLElement) => {
      expect(select.getAttribute('aria-disabled') === 'true' || select.classList.contains('mat-mdc-select-disabled')).toBeTrue();
    });
  });
});
