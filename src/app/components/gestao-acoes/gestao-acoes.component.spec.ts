import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NEVER, of, Subject, throwError } from 'rxjs';
import { GestaoAcoesComponent } from './gestao-acoes.component';
import { Acao } from '../../models/acao.model';
import { AcaoCadastroError, ApiError } from '../../models/api-errors.model';
import { RelatorioAtualizacao } from '../../models/relatorio-atualizacao.model';
import { AcaoApiService } from '../../services/acao-api.service';
import { AtualizacaoApiService } from '../../services/atualizacao-api.service';
import {
  MSG_ACOES_CADASTRADAS_VAZIAS,
  MSG_FALHA_ATUALIZAR_COTACOES,
  MSG_FALHA_CADASTRAR
} from '../../utils/gestao-acoes-mensagens';
import { MSG_FALHA_CARREGAR_ACOES } from '../../utils/simulacao-meta-premio-mensagens';

describe('GestaoAcoesComponent', () => {
  let component: GestaoAcoesComponent;
  let fixture: ComponentFixture<GestaoAcoesComponent>;
  let acaoApi: jasmine.SpyObj<AcaoApiService>;
  let atualizacaoApi: jasmine.SpyObj<AtualizacaoApiService>;

  const bbas3: Acao = {
    nomeAcao: 'BBAS3',
    nomeCompleto: 'Banco do Brasil S.A.',
    precoSpot: 42.13,
    dataAtualizacao: '2026-10-02T22:18:00'
  };

  const petr4: Acao = {
    nomeAcao: 'PETR4',
    nomeCompleto: 'Petróleo Brasileiro S.A.',
    precoSpot: null
  };

  const vale3: Acao = {
    nomeAcao: 'VALE3',
    nomeCompleto: 'Vale S.A.',
    precoSpot: null
  };

  const relatorio: RelatorioAtualizacao = {
    totalRecuperadas: 20,
    totalAtualizadas: 10,
    totalCadastradas: 8,
    totalNaoAtualizadas: 2
  };

  async function configurar(
    listar: ReturnType<AcaoApiService['listar']> = of([petr4, bbas3])
  ): Promise<void> {
    acaoApi = jasmine.createSpyObj('AcaoApiService', ['listar', 'criar']);
    atualizacaoApi = jasmine.createSpyObj('AtualizacaoApiService', ['executar']);
    acaoApi.listar.and.returnValue(listar);
    acaoApi.criar.and.returnValue(of(vale3));
    atualizacaoApi.executar.and.returnValue(of(relatorio));

    await TestBed.configureTestingModule({
      imports: [GestaoAcoesComponent, NoopAnimationsModule, RouterTestingModule],
      providers: [
        { provide: AcaoApiService, useValue: acaoApi },
        { provide: AtualizacaoApiService, useValue: atualizacaoApi }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GestaoAcoesComponent);
    component = fixture.componentInstance;
  }

  function textoDaPagina(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  function botaoAdicionar(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
  }

  function botaoAtualizar(): HTMLButtonElement {
    const botoes = Array.from(
      fixture.nativeElement.querySelectorAll('button[type="button"]') as NodeListOf<HTMLButtonElement>
    );
    return botoes.find((botao) => botao.textContent?.includes('Atualizar cotações')) as HTMLButtonElement;
  }

  function preencherFormulario(ticker: string, nome: string): void {
    component.form.patchValue({ nomeAcao: ticker, nomeCompleto: nome });
    component.form.updateValueAndValidity();
    fixture.detectChanges();
  }

  it('cria o componente com OnPush e form inválido', async () => {
    await configurar();
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.form.controls.nomeAcao.value).toBe('');
    expect(component.form.controls.nomeCompleto.value).toBe('');
    expect(component.form.invalid).toBeTrue();
  });

  it('mostra spinner enquanto o GET de ações não completa', async () => {
    await configurar(NEVER);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeTruthy();
    expect(botaoAdicionar().disabled).toBeTrue();
    expect(botaoAtualizar().disabled).toBeTrue();
  });

  it('ordena a lista por ticker após o GET 200', async () => {
    await configurar();
    fixture.detectChanges();

    expect(component.acoes().map((acao) => acao.nomeAcao)).toEqual(['BBAS3', 'PETR4']);
    expect(textoDaPagina()).toContain('BBAS3');
    expect(textoDaPagina()).toContain('PETR4');
  });

  it('formata spot e data na tabela e usa marcador quando o spot é nulo', async () => {
    await configurar();
    fixture.detectChanges();

    expect(textoDaPagina()).toContain('42,13');
    expect(textoDaPagina()).toContain('02/10/2026 22:18');
    expect(textoDaPagina()).toContain('—');
  });

  it('mostra estado vazio distinto e mantém o formulário', async () => {
    await configurar(of([]));
    fixture.detectChanges();

    expect(textoDaPagina()).toContain(MSG_ACOES_CADASTRADAS_VAZIAS);
    expect(fixture.nativeElement.querySelector('form')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.erro-acoes')).toBeNull();
  });

  it('exibe mensagem genérica quando o GET falha', async () => {
    await configurar(throwError(() => new ApiError(MSG_FALHA_CARREGAR_ACOES, 400)));
    fixture.detectChanges();

    const alerta = fixture.nativeElement.querySelector('.erro-acoes') as HTMLElement;
    expect(alerta.getAttribute('role')).toBe('alert');
    expect(alerta.textContent?.trim()).toBe(MSG_FALHA_CARREGAR_ACOES);
    expect(textoDaPagina()).not.toContain('segredo');
  });

  it('habilita Adicionar só com ticker de 5 caracteres e nome válido', async () => {
    await configurar();
    fixture.detectChanges();

    preencherFormulario('VALE', 'Vale S.A.');
    expect(component.podeAdicionar()).toBeFalse();
    expect(botaoAdicionar().disabled).toBeTrue();

    preencherFormulario('vale3', 'Vale S.A.');
    expect(component.podeAdicionar()).toBeTrue();
    expect(botaoAdicionar().disabled).toBeFalse();
  });

  it('não dispara POST com ticker de 4 ou 6 caracteres', async () => {
    await configurar();
    fixture.detectChanges();

    preencherFormulario('SANB11', 'Santander Brasil');
    expect(component.podeAdicionar()).toBeFalse();
    component.adicionar();
    expect(acaoApi.criar).not.toHaveBeenCalled();

    preencherFormulario('VALE', 'Vale S.A.');
    component.adicionar();
    expect(acaoApi.criar).not.toHaveBeenCalled();
  });

  it('envia o ticker em maiúsculas e inclui a linha após 201', async () => {
    await configurar(of([bbas3]));
    fixture.detectChanges();

    preencherFormulario('vale3', 'Vale S.A.');
    component.adicionar();
    fixture.detectChanges();

    expect(acaoApi.criar).toHaveBeenCalledWith({ nomeAcao: 'VALE3', nomeCompleto: 'Vale S.A.' });
    expect(component.acoes().map((acao) => acao.nomeAcao)).toEqual(['BBAS3', 'VALE3']);
    expect(component.form.controls.nomeAcao.value).toBeNull();
    expect(component.form.controls.nomeCompleto.value).toBeNull();
    expect(component.erroCadastro()).toBeUndefined();
    expect(textoDaPagina()).toContain('VALE3');
  });

  it('mostra a mensagem do 409 e preserva a lista', async () => {
    const mensagem = "Acao 'VALE3' ja esta cadastrada";
    await configurar(of([bbas3]));
    acaoApi.criar.and.returnValue(throwError(() => new AcaoCadastroError(mensagem, 409, 'ACAO_DUPLICADA')));
    fixture.detectChanges();

    preencherFormulario('VALE3', 'Vale S.A.');
    component.adicionar();
    fixture.detectChanges();

    expect(textoDaPagina()).toContain(mensagem);
    expect(component.acoes().map((acao) => acao.nomeAcao)).toEqual(['BBAS3']);
  });

  it('mostra mensagem genérica de cadastro em 500', async () => {
    await configurar(of([bbas3]));
    acaoApi.criar.and.returnValue(throwError(() => new AcaoCadastroError(MSG_FALHA_CADASTRAR, 500)));
    fixture.detectChanges();

    preencherFormulario('VALE3', 'Vale S.A.');
    component.adicionar();
    fixture.detectChanges();

    expect(textoDaPagina()).toContain(MSG_FALHA_CADASTRAR);
    expect(component.acoes()[0].nomeAcao).toBe('BBAS3');
  });

  it('desabilita os botões durante o cadastro', async () => {
    const pending = new Subject<Acao>();
    await configurar(of([bbas3]));
    acaoApi.criar.and.returnValue(pending.asObservable());
    fixture.detectChanges();

    preencherFormulario('VALE3', 'Vale S.A.');
    component.adicionar();
    fixture.detectChanges();

    expect(botaoAdicionar().disabled).toBeTrue();
    expect(botaoAtualizar().disabled).toBeTrue();
  });

  it('mostra os totais e relista após atualizar cotações', async () => {
    await configurar(of([bbas3]));
    fixture.detectChanges();
    acaoApi.listar.calls.reset();
    acaoApi.listar.and.returnValue(of([{ ...bbas3, precoSpot: 43.1 }]));

    botaoAtualizar().click();
    fixture.detectChanges();

    expect(atualizacaoApi.executar).toHaveBeenCalled();
    expect(textoDaPagina()).toContain('20');
    expect(textoDaPagina()).toContain('10');
    expect(textoDaPagina()).toContain('8');
    expect(textoDaPagina()).toContain('2');
    expect(acaoApi.listar).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.relatorio').getAttribute('role')).toBe('status');
  });

  it('mostra falha genérica da atualização e preserva a lista', async () => {
    await configurar(of([petr4]));
    atualizacaoApi.executar.and.returnValue(
      throwError(() => new ApiError(MSG_FALHA_ATUALIZAR_COTACOES, 500))
    );
    fixture.detectChanges();

    component.atualizarCotacoes();
    fixture.detectChanges();

    expect(textoDaPagina()).toContain(MSG_FALHA_ATUALIZAR_COTACOES);
    expect(component.acoes()[0].nomeAcao).toBe('PETR4');
    expect(textoDaPagina()).toContain('PETR4');
  });

  it('não possui controle de exclusão', async () => {
    await configurar();
    fixture.detectChanges();

    const botoes = Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
    const exclusao = botoes.some((botao) => /excluir|remover|deletar/i.test(botao.textContent ?? ''));
    const aria = Array.from(
      fixture.nativeElement.querySelectorAll('[aria-label]') as NodeListOf<HTMLElement>
    ).some((el) => /excluir|remover|deletar/i.test(el.getAttribute('aria-label') ?? ''));

    expect(exclusao).toBeFalse();
    expect(aria).toBeFalse();
    expect('deletar' in acaoApi).toBeFalse();
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
    expect(acaoApi.listar).toHaveBeenCalledTimes(1);

    fixture.destroy();
    fixture = TestBed.createComponent(GestaoAcoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(acaoApi.listar).toHaveBeenCalledTimes(2);
  });
});
