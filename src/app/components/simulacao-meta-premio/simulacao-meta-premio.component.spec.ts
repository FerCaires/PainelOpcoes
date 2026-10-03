import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';
import { SimulacaoMetaPremioComponent } from './simulacao-meta-premio.component';
import { AcaoApiService } from '../../services/acao-api.service';
import { SimulacaoMetaPremioApiService } from '../../services/simulacao-meta-premio-api.service';
import { Acao } from '../../models/acao.model';
import { Modalidade } from '../../models/modalidade.enum';
import { Moneyness } from '../../models/moneyness.enum';
import { TipoNotional } from '../../models/tipo-notional.enum';
import { TipoOpcao } from '../../models/tipo-opcao.enum';
import { ModoSimulacao } from '../../models/modo-simulacao.enum';
import { SimulacaoMetaPremioResponse } from '../../models/simulacao-meta-premio-response.model';
import { SimulacaoMetaPremioError } from '../../models/api-errors.model';
import {
  MSG_ACOES_VAZIAS,
  MSG_FALHA_CARREGAR_ACOES,
  MSG_FALHA_SIMULACAO,
  MSG_OPCOES_VAZIAS
} from '../../utils/simulacao-meta-premio-mensagens';

describe('SimulacaoMetaPremioComponent', () => {
  let component: SimulacaoMetaPremioComponent;
  let fixture: ComponentFixture<SimulacaoMetaPremioComponent>;
  let acaoApi: jasmine.SpyObj<AcaoApiService>;
  let simulacaoApi: jasmine.SpyObj<SimulacaoMetaPremioApiService>;

  const acaoBbas3: Acao = {
    nomeAcao: 'BBAS3',
    nomeCompleto: 'Banco do Brasil S.A.',
    precoSpot: 42.13
  };

  const respostaCall: SimulacaoMetaPremioResponse = {
    nomeAcao: 'BBAS3',
    nomeCompleto: 'Banco do Brasil S.A.',
    precoSpot: 42.13,
    metaPremio: 1000,
    tipo: TipoOpcao.CALL,
    dataVencimento: '2026-10-16',
    diasAteVencimento: 15,
    quantidadeOperacoes: 1,
    opcoes: [
      {
        nome: 'BBAS3J423',
        tipo: TipoOpcao.CALL,
        modalidade: Modalidade.EUROPEIA,
        strike: 42.25,
        valorPremio: 1.53,
        percentualVsSpot: 0.0028,
        moneyness: Moneyness.OTM,
        avisoExercicio: null,
        dataVencimento: '2026-10-16',
        diasAteVencimento: 15,
        quantidadeAcoes: 700,
        notional: 29491.0,
        tipoNotional: TipoNotional.ACOES,
        premioEstimado: 1071.0,
        roiOperacao: 0.0363,
        roiAnualizadoSimples: 0.4356
      }
    ]
  };

  const respostaPut: SimulacaoMetaPremioResponse = {
    ...respostaCall,
    tipo: TipoOpcao.PUT,
    opcoes: [
      {
        ...respostaCall.opcoes[0],
        tipo: TipoOpcao.PUT,
        strike: 41.0,
        percentualVsSpot: -0.0268,
        moneyness: Moneyness.OTM,
        tipoNotional: TipoNotional.CAIXA
      }
    ]
  };

  async function configurar(
    listar: ReturnType<AcaoApiService['listar']> = of([acaoBbas3])
  ): Promise<void> {
    acaoApi = jasmine.createSpyObj('AcaoApiService', ['listar']);
    simulacaoApi = jasmine.createSpyObj('SimulacaoMetaPremioApiService', ['simular']);
    acaoApi.listar.and.returnValue(listar);
    simulacaoApi.simular.and.returnValue(of(respostaCall));

    await TestBed.configureTestingModule({
      imports: [SimulacaoMetaPremioComponent, NoopAnimationsModule, RouterTestingModule],
      providers: [
        { provide: AcaoApiService, useValue: acaoApi },
        { provide: SimulacaoMetaPremioApiService, useValue: simulacaoApi }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SimulacaoMetaPremioComponent);
    component = fixture.componentInstance;
  }

  function preencherFormularioValido(): void {
    component.form.patchValue({
      nomeAcao: 'BBAS3',
      metaPremio: 1000,
      tipo: TipoOpcao.CALL
    });
    fixture.detectChanges();
  }

  function textoDaPagina(): string {
    return (fixture.nativeElement as HTMLElement).textContent ?? '';
  }

  it('inicia com tipo vazio, modo Meta de prêmio e Simular desabilitado', async () => {
    await configurar();
    fixture.detectChanges();

    expect(component.form.controls.tipo.value).toBeNull();
    expect(component.form.controls.modo.value).toBe(ModoSimulacao.META_PREMIO);
    expect(component.modoAtual()).toBe(ModoSimulacao.META_PREMIO);
    expect(component.podeSimular()).toBeFalse();
    const botao = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(botao.disabled).toBeTrue();
    expect(textoDaPagina()).toContain('Meta de prêmio');
    expect(textoDaPagina()).toContain('Garantia');
    expect(textoDaPagina()).toContain('Quantidade de ações');
  });

  it('mostra spinner enquanto carrega ações', async () => {
    const pending = new Subject<Acao[]>();
    await configurar(pending.asObservable());
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('mat-spinner')).toBeTruthy();
    expect(component.podeSimular()).toBeFalse();
  });

  it('lista ticker e nome completo no seletor', async () => {
    await configurar();
    fixture.detectChanges();

    expect(component.acoes()[0].nomeAcao).toBe('BBAS3');
    expect(component.acoes()[0].nomeCompleto).toBe('Banco do Brasil S.A.');
    expect(fixture.nativeElement.querySelector('mat-select')).toBeTruthy();
  });

  it('exibe mensagem distinta quando não há ações', async () => {
    await configurar(of([]));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.msg-acoes-vazias')?.textContent.trim()).toBe(
      MSG_ACOES_VAZIAS
    );
    expect(component.podeSimular()).toBeFalse();
  });

  it('exibe erro genérico de ações sem botão de retry', async () => {
    await configurar(throwError(() => new Error(MSG_FALHA_CARREGAR_ACOES)));
    fixture.detectChanges();

    const alerta = fixture.nativeElement.querySelector('.erro-acoes');
    expect(alerta?.textContent.trim()).toBe(MSG_FALHA_CARREGAR_ACOES);
    expect(alerta.getAttribute('role')).toBe('alert');
    expect(fixture.nativeElement.querySelector('.retry')).toBeFalsy();
    expect(component.podeSimular()).toBeFalse();
  });

  it('exibe cabeçalho, sugestão ATM/OTM e tipo Ações no sucesso CALL', async () => {
    await configurar();
    fixture.detectChanges();
    preencherFormularioValido();
    component.simular();
    fixture.detectChanges();

    expect(textoDaPagina()).toContain('16/10/2026');
    expect(textoDaPagina()).toContain('BBAS3J423');
    expect(textoDaPagina()).toContain('700');
    expect(textoDaPagina()).toContain('Ações');
    expect(textoDaPagina()).toContain('ATM ou OTM mais próxima do spot');
    expect(fixture.nativeElement.querySelector('.linha-itm')).toBeFalsy();
    expect(component.colunasTabela.length).toBe(16);
    expect(fixture.nativeElement.querySelector('.sugestao')).toBeTruthy();
    expect(component.opcaoSugerida()?.nome).toBe('BBAS3J423');
    expect(component.opcaoSugerida()?.quantidadeAcoes).toBe(700);
    expect(component.opcaoSugerida()?.notional).toBe(29491.0);
    expect(component.opcoesAnalise().every((item) => item.moneyness !== Moneyness.ITM)).toBeTrue();
  });

  it('ignora ITM na sugestão e na tabela quando a API mistura ITM e OTM', async () => {
    await configurar();
    simulacaoApi.simular.and.returnValue(
      of({
        ...respostaCall,
        quantidadeOperacoes: 2,
        opcoes: [
          {
            ...respostaCall.opcoes[0],
            nome: 'BBAS3J420',
            strike: 42.01,
            percentualVsSpot: -0.0028,
            moneyness: Moneyness.ITM,
            avisoExercicio: 'No strike ITM, o prêmio é maior, porém há maior chance de exercício.'
          },
          respostaCall.opcoes[0]
        ]
      })
    );
    fixture.detectChanges();
    preencherFormularioValido();
    component.simular();
    fixture.detectChanges();

    expect(component.opcaoSugerida()?.nome).toBe('BBAS3J423');
    expect(component.opcoesAnalise().map((item) => item.nome)).toEqual(['BBAS3J423']);
    expect(textoDaPagina()).not.toContain('BBAS3J420');
    expect(fixture.nativeElement.querySelector('.linha-itm')).toBeFalsy();
  });

  it('exibe Caixa para tipoNotional CAIXA', async () => {
    await configurar();
    simulacaoApi.simular.and.returnValue(of(respostaPut));
    fixture.detectChanges();
    preencherFormularioValido();
    component.form.controls.tipo.setValue(TipoOpcao.PUT);
    component.simular();
    fixture.detectChanges();

    expect(textoDaPagina()).toContain('Caixa');
    expect(fixture.nativeElement.querySelector('.sugestao')?.textContent).toContain('Caixa');
  });

  it('trata 200 com opcoes vazias como sucesso com cabeçalho', async () => {
    await configurar();
    simulacaoApi.simular.and.returnValue(
      of({ ...respostaCall, quantidadeOperacoes: 0, opcoes: [] })
    );
    fixture.detectChanges();
    preencherFormularioValido();
    component.simular();
    fixture.detectChanges();

    expect(component.erroSimulacao()).toBeUndefined();
    expect(textoDaPagina()).toContain('BBAS3');
    expect(fixture.nativeElement.querySelector('.msg-opcoes-vazias')?.textContent.trim()).toBe(
      MSG_OPCOES_VAZIAS
    );
    expect(fixture.nativeElement.querySelector('table')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('.sugestao')).toBeFalsy();
  });

  it('exibe mensagem de 404 da API', async () => {
    await configurar();
    simulacaoApi.simular.and.returnValue(
      throwError(() => new SimulacaoMetaPremioError('Ação XPTO9 não encontrada', 404, 'ACAO_NAO_ENCONTRADA'))
    );
    fixture.detectChanges();
    preencherFormularioValido();
    component.simular();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.erro-simulacao')?.textContent.trim()).toBe(
      'Ação XPTO9 não encontrada'
    );
    expect(fixture.nativeElement.querySelector('table')).toBeFalsy();
  });

  it('exibe mensagem de 422 META_PREMIO_INVALIDA', async () => {
    await configurar();
    simulacaoApi.simular.and.returnValue(
      throwError(
        () => new SimulacaoMetaPremioError('metaPremio deve ser maior que zero', 422, 'META_PREMIO_INVALIDA')
      )
    );
    fixture.detectChanges();
    preencherFormularioValido();
    component.simular();
    fixture.detectChanges();

    expect(textoDaPagina()).toContain('metaPremio deve ser maior que zero');
  });

  it('exibe mensagem de 422 PRECO_SPOT_INDISPONIVEL', async () => {
    await configurar();
    simulacaoApi.simular.and.returnValue(
      throwError(
        () =>
          new SimulacaoMetaPremioError(
            "Preço spot indisponível para a ação 'PETR4'. Execute a atualização de cotações.",
            422,
            'PRECO_SPOT_INDISPONIVEL'
          )
      )
    );
    fixture.detectChanges();
    preencherFormularioValido();
    component.simular();
    fixture.detectChanges();

    expect(textoDaPagina()).toContain('Preço spot indisponível');
  });

  it('exibe mensagem de 422 VENCIMENTO_MENSAL_NAO_ENCONTRADO', async () => {
    await configurar();
    simulacaoApi.simular.and.returnValue(
      throwError(
        () =>
          new SimulacaoMetaPremioError(
            'Nenhum vencimento MENSAL com status ABERTA e data futura foi encontrado',
            422,
            'VENCIMENTO_MENSAL_NAO_ENCONTRADO'
          )
      )
    );
    fixture.detectChanges();
    preencherFormularioValido();
    component.simular();
    fixture.detectChanges();

    expect(textoDaPagina()).toContain('Nenhum vencimento MENSAL');
  });

  it('exibe mensagem genérica em falha 500', async () => {
    await configurar();
    simulacaoApi.simular.and.returnValue(
      throwError(() => new SimulacaoMetaPremioError(MSG_FALHA_SIMULACAO, 500))
    );
    fixture.detectChanges();
    preencherFormularioValido();
    component.simular();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.erro-simulacao')?.textContent.trim()).toBe(
      MSG_FALHA_SIMULACAO
    );
    expect(fixture.nativeElement.querySelector('.erro-simulacao').getAttribute('role')).toBe('alert');
  });

  it('limpa resultado e erro antes da nova requisição', async () => {
    await configurar();
    const pending = new Subject<SimulacaoMetaPremioResponse>();
    fixture.detectChanges();
    preencherFormularioValido();
    component.resultado.set(respostaCall);
    component.erroSimulacao.set('erro anterior');
    simulacaoApi.simular.and.returnValue(pending.asObservable());

    component.simular();

    expect(component.resultado()).toBeUndefined();
    expect(component.erroSimulacao()).toBeUndefined();
    expect(component.carregandoSimulacao()).toBeTrue();
    expect(component.podeSimular()).toBeFalse();
  });

  it('renderiza o header compartilhado no topo', async () => {
    await configurar();
    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('app-header-menu');
    expect(header).toBeTruthy();
  });

  it('define overflow-x auto no wrapper da tabela', async () => {
    await configurar();
    fixture.detectChanges();
    preencherFormularioValido();
    component.simular();
    fixture.detectChanges();

    const wrapper = fixture.nativeElement.querySelector('.tabela-wrapper') as HTMLElement;
    expect(getComputedStyle(wrapper).overflowX).toBe('auto');
  });

  it('nova instância volta o formulário ao estado inicial', async () => {
    await configurar();
    fixture.detectChanges();
    preencherFormularioValido();
    component.simular();
    fixture.detectChanges();

    const nova = TestBed.createComponent(SimulacaoMetaPremioComponent);
    nova.detectChanges();

    expect(nova.componentInstance.form.controls.tipo.value).toBeNull();
    expect(nova.componentInstance.form.controls.nomeAcao.value).toBeNull();
    expect(nova.componentInstance.form.controls.modo.value).toBe(ModoSimulacao.META_PREMIO);
    expect(nova.componentInstance.resultado()).toBeUndefined();
    expect(acaoApi.listar.calls.count()).toBe(2);
  });

  it('mostra campo Garantia e envia modo GARANTIA ao simular', async () => {
    await configurar();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[formControlName="metaPremio"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input[formControlName="garantia"]')).toBeFalsy();

    component.form.controls.modo.setValue(ModoSimulacao.GARANTIA);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[formControlName="metaPremio"]')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('input[formControlName="garantia"]')).toBeTruthy();
    expect(component.podeSimular()).toBeFalse();

    component.form.patchValue({
      nomeAcao: 'BBAS3',
      garantia: 30000,
      tipo: TipoOpcao.CALL
    });
    fixture.detectChanges();

    expect(textoDaPagina()).toContain('Garantia');
    expect(component.podeSimular()).toBeTrue();
    component.simular();

    expect(simulacaoApi.simular).toHaveBeenCalledWith({
      nomeAcao: 'BBAS3',
      tipo: TipoOpcao.CALL,
      modo: ModoSimulacao.GARANTIA,
      garantia: 30000
    });
  });

  it('mostra cabeçalho Garantia no resultado do modo GARANTIA', async () => {
    await configurar();
    simulacaoApi.simular.and.returnValue(
      of({
        ...respostaCall,
        modo: ModoSimulacao.GARANTIA,
        metaPremio: null,
        garantia: 30000
      })
    );
    fixture.detectChanges();
    component.form.controls.modo.setValue(ModoSimulacao.GARANTIA);
    fixture.detectChanges();
    component.form.patchValue({
      nomeAcao: 'BBAS3',
      garantia: 30000,
      tipo: TipoOpcao.CALL
    });
    component.simular();
    fixture.detectChanges();

    const stats = fixture.nativeElement.querySelector('.stats')?.textContent ?? '';
    expect(stats).toContain('Garantia');
    expect(stats).not.toContain('Meta');
  });

  it('envia quantidadeAcoes e mostra Quantidade no cabeçalho', async () => {
    await configurar();
    simulacaoApi.simular.and.returnValue(
      of({
        ...respostaCall,
        modo: ModoSimulacao.QUANTIDADE_ACOES,
        metaPremio: null,
        quantidadeAcoesInformada: 700
      })
    );
    fixture.detectChanges();
    component.form.controls.modo.setValue(ModoSimulacao.QUANTIDADE_ACOES);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input[formControlName="metaPremio"]')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('input[formControlName="garantia"]')).toBeFalsy();
    expect(fixture.nativeElement.querySelector('input[formControlName="quantidadeAcoes"]')).toBeTruthy();
    component.form.patchValue({
      nomeAcao: 'BBAS3',
      quantidadeAcoes: 700,
      tipo: TipoOpcao.CALL
    });
    fixture.detectChanges();
    component.simular();
    fixture.detectChanges();

    expect(simulacaoApi.simular).toHaveBeenCalledWith({
      nomeAcao: 'BBAS3',
      tipo: TipoOpcao.CALL,
      modo: ModoSimulacao.QUANTIDADE_ACOES,
      quantidadeAcoes: 700
    });
    expect(textoDaPagina()).toContain('Quantidade');
  });

  it('desabilita Simular quando quantidade não é múltiplo de 100', async () => {
    await configurar();
    fixture.detectChanges();
    component.form.controls.modo.setValue(ModoSimulacao.QUANTIDADE_ACOES);
    fixture.detectChanges();
    component.form.patchValue({
      nomeAcao: 'BBAS3',
      quantidadeAcoes: 250,
      tipo: TipoOpcao.CALL
    });
    fixture.detectChanges();

    expect(component.podeSimular()).toBeFalse();
    expect(simulacaoApi.simular).not.toHaveBeenCalled();
  });

  it('limpa resultado ao trocar o modo', async () => {
    await configurar();
    fixture.detectChanges();
    preencherFormularioValido();
    component.simular();
    fixture.detectChanges();
    expect(component.resultado()).toBeTruthy();

    component.form.controls.modo.setValue(ModoSimulacao.GARANTIA);
    fixture.detectChanges();

    expect(component.resultado()).toBeUndefined();
    expect(component.erroSimulacao()).toBeUndefined();
  });

  it('exibe mensagem de 422 GARANTIA_INVALIDA', async () => {
    await configurar();
    simulacaoApi.simular.and.returnValue(
      throwError(
        () => new SimulacaoMetaPremioError('garantia deve ser maior que zero', 422, 'GARANTIA_INVALIDA')
      )
    );
    fixture.detectChanges();
    component.form.controls.modo.setValue(ModoSimulacao.GARANTIA);
    fixture.detectChanges();
    component.form.patchValue({
      nomeAcao: 'BBAS3',
      garantia: 30000,
      tipo: TipoOpcao.CALL
    });
    component.simular();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.erro-simulacao')?.textContent.trim()).toBe(
      'garantia deve ser maior que zero'
    );
    expect(fixture.nativeElement.querySelector('table')).toBeFalsy();
  });

  it('envia modo META_PREMIO na simulação padrão', async () => {
    await configurar();
    fixture.detectChanges();
    preencherFormularioValido();
    component.simular();

    expect(simulacaoApi.simular).toHaveBeenCalledWith({
      nomeAcao: 'BBAS3',
      tipo: TipoOpcao.CALL,
      modo: ModoSimulacao.META_PREMIO,
      metaPremio: 1000
    });
  });
});
