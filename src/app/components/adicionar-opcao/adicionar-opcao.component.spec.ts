import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AdicionarOpcaoComponent } from './adicionar-opcao.component';
import { CarteiraApiService } from '../../services/carteira-api.service';
import { Carteira } from '../../models/carteira.model';
import { OpcaoCarteira } from '../../models/opcao-carteira.model';
import { StatusCarteira } from '../../models/status-carteira.enum';
import { SituacaoOpcao } from '../../models/situacao-opcao.enum';
import { OpcaoNaoEncontradaError, OpcaoJaExisteNaCarteiraError } from '../../models/api-errors.model';

describe('AdicionarOpcaoComponent', () => {
  let component: AdicionarOpcaoComponent;
  let fixture: ComponentFixture<AdicionarOpcaoComponent>;
  let apiService: jasmine.SpyObj<CarteiraApiService>;
  let consoleSpy: jasmine.Spy;

  const mockCarteiras: Carteira[] = [
    {
      id: '1',
      nome: 'Carteira1',
      status: StatusCarteira.ATIVA,
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00'
    }
  ];

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('CarteiraApiService', [
      'listarCarteirasAtivas',
      'adicionarOpcao',
      'listarOpcoesCarteira',
      'atualizarSituacaoOpcao'
    ]);
    apiSpy.listarCarteirasAtivas.and.returnValue(of(mockCarteiras));
    apiSpy.adicionarOpcao.and.returnValue(of(void 0));
    apiSpy.listarOpcoesCarteira.and.returnValue(of([]));

    consoleSpy = spyOn(console, 'error');

    await TestBed.configureTestingModule({
      imports: [
        AdicionarOpcaoComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCardModule,
        MatTableModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: CarteiraApiService, useValue: apiSpy },
        { provide: ActivatedRoute, useValue: {} },
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdicionarOpcaoComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(CarteiraApiService) as jasmine.SpyObj<CarteiraApiService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form with nomeOpcao and carteiraId controls', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('nomeOpcao')).toBeDefined();
    expect(component.form.get('carteiraId')).toBeDefined();
  });

  it('should load carteiras on init', () => {
    expect(apiService.listarCarteirasAtivas).toHaveBeenCalled();
    expect(component.carteiras.length).toBeGreaterThan(0);
  });

  it('should disable button when form is invalid', () => {
    expect(component.podeAdicionar).toBeFalse();
  });

  it('should enable button when form is valid', () => {
    component.form.get('nomeOpcao')?.setValue('PETR4123');
    component.form.get('carteiraId')?.setValue('1');
    fixture.detectChanges();
    expect(component.podeAdicionar).toBeTrue();
  });

  it('should validate required field for nomeOpcao', () => {
    const control = component.form.get('nomeOpcao');
    control?.setValue('');
    expect(control?.hasError('required')).toBeTrue();
  });

  it('should validate minlength for nomeOpcao', () => {
    const control = component.form.get('nomeOpcao');
    control?.setValue('PETR');
    expect(control?.hasError('minlength')).toBeTrue();
  });

  it('should validate maxlength for nomeOpcao', () => {
    const control = component.form.get('nomeOpcao');
    control?.setValue('PETR412345');
    expect(control?.hasError('maxlength')).toBeTrue();
  });

  it('should validate pattern for nomeOpcao', () => {
    const control = component.form.get('nomeOpcao');
    control?.setValue('PETR@123');
    expect(control?.hasError('pattern')).toBeTrue();
  });

  it('should call apiService.adicionarOpcao when form is valid', () => {
    component.form.get('nomeOpcao')?.setValue('PETR4123');
    component.form.get('carteiraId')?.setValue('1');
    component.adicionarOpcao();

    expect(apiService.adicionarOpcao).toHaveBeenCalledWith('1', 'PETR4123');
  });

  it('should clear nomeOpcao field after successful addition', () => {
    component.form.get('nomeOpcao')?.setValue('PETR4123');
    component.form.get('carteiraId')?.setValue('1');
    component.adicionarOpcao();

    expect(component.form.get('nomeOpcao')?.value).toBe('');
  });

  it('should call carregarOpcoesCarteira after successful addition', () => {
    component.form.get('nomeOpcao')?.setValue('PETR4123');
    component.form.get('carteiraId')?.setValue('1');
    component.adicionarOpcao();

    expect(apiService.listarOpcoesCarteira).toHaveBeenCalledWith('1');
  });

  it('should display error message on 404 (opcao not found)', () => {
    const error = new OpcaoNaoEncontradaError();
    apiService.adicionarOpcao.and.returnValue(throwError(() => error));

    component.form.get('nomeOpcao')?.setValue('OPCAO999');
    component.form.get('carteiraId')?.setValue('1');
    component.adicionarOpcao();
    fixture.detectChanges();

    expect(component.erro).toBe('Opção não encontrada no sistema');
  });

  it('should display error message on 409 (opcao ja existe)', () => {
    const error = new OpcaoJaExisteNaCarteiraError();
    apiService.adicionarOpcao.and.returnValue(throwError(() => error));

    component.form.get('nomeOpcao')?.setValue('PETR4123');
    component.form.get('carteiraId')?.setValue('1');
    component.adicionarOpcao();
    fixture.detectChanges();

    expect(component.erro).toBe('Opção já existe na carteira');
  });

  it('should display generic error message on other errors', () => {
    const error = { status: 500 };
    apiService.adicionarOpcao.and.returnValue(throwError(() => error));

    component.form.get('nomeOpcao')?.setValue('PETR4123');
    component.form.get('carteiraId')?.setValue('1');
    component.adicionarOpcao();
    fixture.detectChanges();

    expect(component.erro).toBe('Erro ao adicionar opção. Tente novamente.');
  });

  it('should not call api when form is invalid', () => {
    component.form.get('nomeOpcao')?.setValue('PETR');
    component.form.get('carteiraId')?.setValue('1');
    component.adicionarOpcao();

    expect(apiService.adicionarOpcao).not.toHaveBeenCalled();
  });

  it('should call listarOpcoesCarteira when carteira is selected', () => {
    component.form.get('carteiraId')?.setValue('1');
    component.carregarOpcoesCarteira();

    expect(apiService.listarOpcoesCarteira).toHaveBeenCalledWith('1');
  });

  it('should not call listarOpcoesCarteira when carteiraId is empty', () => {
    component.form.get('carteiraId')?.setValue('');
    component.carregarOpcoesCarteira();

    expect(apiService.listarOpcoesCarteira).not.toHaveBeenCalled();
  });

  it('should update opcoesCarteira when listing succeeds', () => {
    const mockOpcoes: OpcaoCarteira[] = [
      {
        nomeOpcao: 'PETR4123',
        vencimento: '2024-06-19',
        strike: 33.29,
        premio: 1.74,
        situacao: SituacaoOpcao.ABERTA
      }
    ];
    apiService.listarOpcoesCarteira.and.returnValue(of(mockOpcoes));

    component.form.get('carteiraId')?.setValue('1');
    component.carregarOpcoesCarteira();

    expect(component.opcoesCarteira).toEqual(mockOpcoes);
  });

  it('should display error message when listing opcoes fails', () => {
    const error = { status: 500 };
    apiService.listarOpcoesCarteira.and.returnValue(throwError(() => error));

    component.form.get('carteiraId')?.setValue('1');
    component.carregarOpcoesCarteira();
    fixture.detectChanges();

    expect(component.erro).toBe('Erro ao carregar opções da carteira. Tente novamente.');
  });

  it('should track by nomeOpcao in trackByNome', () => {
    const opcao: OpcaoCarteira = {
      nomeOpcao: 'PETR4123',
      vencimento: '2024-06-19',
      strike: 33.29,
      premio: 1.74,
      situacao: SituacaoOpcao.ABERTA
    };

    expect(component.trackByNome(0, opcao)).toBe('PETR4123');
  });

  describe('atualizacao em massa', () => {
    const mockOpcoes: OpcaoCarteira[] = [
      {
        nomeOpcao: 'BBASG223',
        vencimento: '2026-07-17',
        strike: 21.89,
        premio: 0.14,
        situacao: SituacaoOpcao.ABERTA
      },
      {
        nomeOpcao: 'PETR4123',
        vencimento: '2026-08-20',
        strike: 33.29,
        premio: 1.74,
        situacao: SituacaoOpcao.EXERCIDA
      }
    ];

    beforeEach(() => {
      apiService.listarOpcoesCarteira.and.returnValue(of(mockOpcoes));
      component.form.get('carteiraId')?.setValue('1');
      component.carregarOpcoesCarteira();
    });

    it('should initialize combo with current situacao for each option', () => {
      expect(component.situacoesSelecionadas.size).toBe(2);
      expect(component.situacoesSelecionadas.get('BBASG223')?.value).toBe(SituacaoOpcao.ABERTA);
      expect(component.situacoesSelecionadas.get('PETR4123')?.value).toBe(SituacaoOpcao.EXERCIDA);
    });

    it('should have podeAtualizarEmMassa true when lista is loaded', () => {
      expect(component.podeAtualizarEmMassa).toBeTrue();
    });

    it('should have podeAtualizarEmMassa false when lista is empty', () => {
      component.opcoesCarteira = [];
      expect(component.podeAtualizarEmMassa).toBeFalse();
    });

    it('should call PUT for each option when button is clicked', () => {
      apiService.atualizarSituacaoOpcao.and.returnValue(of(mockOpcoes[0]));

      component.atualizarSituacoesEmMassa();

      expect(apiService.atualizarSituacaoOpcao).toHaveBeenCalledWith(
        '1', 'BBASG223', SituacaoOpcao.ABERTA
      );
      expect(apiService.atualizarSituacaoOpcao).toHaveBeenCalledWith(
        '1', 'PETR4123', SituacaoOpcao.EXERCIDA
      );
    });

    it('should log error and continue when one PUT fails', () => {
      const mockOpcaoAtualizada: OpcaoCarteira = {
        nomeOpcao: 'BBASG223',
        vencimento: '2026-07-17',
        strike: 21.89,
        premio: 0.14,
        situacao: SituacaoOpcao.FINALIZADA
      };

      apiService.atualizarSituacaoOpcao.and.callFake(
        (carteiraId: string, nomeOpcao: string, situacao: SituacaoOpcao) => {
          if (nomeOpcao === 'PETR4123') {
            return throwError(() => ({ status: 500 }));
          }
          return of(mockOpcaoAtualizada);
        }
      );

      component.atualizarSituacoesEmMassa();

      expect(apiService.atualizarSituacaoOpcao).toHaveBeenCalledWith(
        '1', 'BBASG223', SituacaoOpcao.ABERTA
      );
      expect(apiService.atualizarSituacaoOpcao).toHaveBeenCalledWith(
        '1', 'PETR4123', SituacaoOpcao.EXERCIDA
      );
      expect(consoleSpy).toHaveBeenCalledWith('Erro ao atualizar situacao da opcao', {
        carteiraId: '1',
        nomeOpcao: 'PETR4123',
        status: 500
      });
    });

    it('should call carregarOpcoesCarteira after all PUTs complete', () => {
      apiService.atualizarSituacaoOpcao.and.returnValue(of(mockOpcoes[0]));
      apiService.listarOpcoesCarteira.calls.reset();

      component.atualizarSituacoesEmMassa();

      expect(apiService.listarOpcoesCarteira).toHaveBeenCalledWith('1');
    });

    it('should disable button during iteration', () => {
      apiService.atualizarSituacaoOpcao.and.returnValue(of(mockOpcoes[0]));

      component.atualizarSituacoesEmMassa();

      expect(component.atualizandoEmMassa).toBeFalse();
      expect(component.podeAtualizarEmMassa).toBeTrue();
    });
  });
});
