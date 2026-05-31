import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { of, throwError } from 'rxjs';

import { PainelRolagemComponent } from './painel-rolagem.component';
import { RolagemApiService } from '../../services/rolagem-api.service';
import { TipoRolagem } from '../../models/tipo-rolagem.enum';
import { BuscaRolagemResponse } from '../../models/busca-rolagem-response.model';

class MockRolagemApiService {
  buscarRolagens = jasmine.createSpy('buscarRolagens');
}

describe('PainelRolagemComponent', () => {
  let component: PainelRolagemComponent;
  let fixture: ComponentFixture<PainelRolagemComponent>;
  let apiService: MockRolagemApiService;

  beforeEach(async () => {
    apiService = new MockRolagemApiService();

    await TestBed.configureTestingModule({
      imports: [
        PainelRolagemComponent,
        NoopAnimationsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
        MatCardModule,
        MatTableModule,
        MatProgressSpinnerModule
      ],
      providers: [{ provide: RolagemApiService, useValue: apiService }]
    }).compileComponents();

    fixture = TestBed.createComponent(PainelRolagemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default form values', () => {
    expect(component.form.value.quantidadeVencimentos).toBe(2);
    expect(component.form.value.tipoRolagem).toBe(TipoRolagem.POSITIVA_AUMENTO_STRIKE);
    expect(component.form.value.opcao).toBe('');
  });

  it('should disable search button when opcao is empty', () => {
    expect(component.podeBuscar).toBe(false);
  });

  it('should disable search button when opcao has less than 5 chars', () => {
    component.form.patchValue({ opcao: 'ABC' });
    expect(component.podeBuscar).toBe(false);
  });

  it('should enable search button when opcao has 5 chars', () => {
    component.form.patchValue({ opcao: 'ABCDE' });
    expect(component.podeBuscar).toBe(true);
  });

  it('should enable search button when opcao has 8 chars', () => {
    component.form.patchValue({ opcao: 'ABCDEFGH' });
    expect(component.podeBuscar).toBe(true);
  });

  it('should disable search button when opcao has more than 8 chars', () => {
    component.form.patchValue({ opcao: 'ABCDEFGHI' });
    expect(component.podeBuscar).toBe(false);
  });

  it('should show error when opcao is touched, dirty and invalid', () => {
    const input = component.form.get('opcao')!;
    input.setValue('ABC');
    input.markAsTouched();
    input.markAsDirty();
    expect(component.opcaoInvalida).toBe(true);
  });

  it('should call API and set resultado on successful search', fakeAsync(() => {
    const mockResponse: BuscaRolagemResponse = {
      opcao: 'BBSEF358',
      vencimento: '2026-06-19',
      strike: 33.29,
      rolagens: [
        { data: '2026-07-17', opcoes: [{ nome: 'BBSEG334', premio: 2.24, strike: 33.43, delta: 0.5 }] }
      ]
    };

    apiService.buscarRolagens.and.returnValue(of(mockResponse));

    component.form.patchValue({ opcao: 'BBSEF358' });
    component.buscar();
    tick();

    expect(apiService.buscarRolagens).toHaveBeenCalled();
    expect(component.resultado).toEqual(mockResponse);
    expect(component.carregando).toBe(false);
  }));

  it('should set erro on API error', fakeAsync(() => {
    apiService.buscarRolagens.and.returnValue(throwError(() => new Error('Network error')));

    component.form.patchValue({ opcao: 'BBSEF358' });
    component.buscar();
    tick();

    expect(component.erro).toBeDefined();
    expect(component.carregando).toBe(false);
  }));

  it('should format date correctly', () => {
    expect(component.formatarData('2026-06-19')).toBe('19/06/2026');
  });

  it('should format value with 2 decimals', () => {
    expect(component.formatarValor(33.29)).toBe('33.29');
    expect(component.formatarValor(2)).toBe('2.00');
  });
});
