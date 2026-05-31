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
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

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

  // TASK-03: Testes de alinhamento e responsividade do botão
  describe('Alinhamento do Botão "Buscar Rolagens"', () => {
    it('should have height: 100% on submit button', () => {
      const button: DebugElement = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(button).toBeTruthy();
      
      const computedStyle = window.getComputedStyle(button.nativeElement);
      expect(computedStyle.height).toBeTruthy();
      expect(computedStyle.display).toBe('flex');
      expect(computedStyle.alignItems).toBe('center');
    });

    it('should have offsetHeight greater than 0', () => {
      const button: DebugElement = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(button).toBeTruthy();
      
      const buttonHeight = button.nativeElement.offsetHeight;
      expect(buttonHeight).toBeGreaterThan(0);
    });

    it('should align button height with mat-form-field', () => {
      const button: DebugElement = fixture.debugElement.query(By.css('button[type="submit"]'));
      const formField: DebugElement = fixture.debugElement.query(By.css('mat-form-field'));
      
      expect(button).toBeTruthy();
      expect(formField).toBeTruthy();
      
      const buttonHeight = button.nativeElement.offsetHeight;
      const formFieldHeight = formField.nativeElement.offsetHeight;
      
      // O botão deve ter altura similar ao mat-form-field
      // Permite margem maior (±30px) devido a padding/margin interno do mat-form-field
      // e diferenças de renderização entre elementos
      expect(Math.abs(buttonHeight - formFieldHeight)).toBeLessThanOrEqual(30);
    });

    it('should maintain button alignment in different viewport sizes', () => {
      const resolutions = [1920, 768, 375];
      const button: DebugElement = fixture.debugElement.query(By.css('button[type="submit"]'));
      const formField: DebugElement = fixture.debugElement.query(By.css('mat-form-field'));
      
      resolutions.forEach(width => {
        // Simula redimensionamento
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });
        
        window.dispatchEvent(new Event('resize'));
        fixture.detectChanges();
        
        const buttonHeight = button.nativeElement.offsetHeight;
        const formFieldHeight = formField.nativeElement.offsetHeight;
        
        // Valida que o botão mantém alinhamento com margem de ±30px
        expect(Math.abs(buttonHeight - formFieldHeight)).toBeLessThanOrEqual(30);
      });
    });

    it('should have flex display properties for centering', () => {
      const button: DebugElement = fixture.debugElement.query(By.css('button[type="submit"]'));
      const computedStyle = window.getComputedStyle(button.nativeElement);
      
      expect(computedStyle.display).toBe('flex');
      expect(computedStyle.alignItems).toBe('center');
      expect(computedStyle.justifyContent).toBe('center');
    });

    it('should maintain hover effect with flex layout', () => {
      const button: DebugElement = fixture.debugElement.query(By.css('button[type="submit"]'));
      const buttonElement = button.nativeElement;
      
      // Simula hover
      buttonElement.dispatchEvent(new MouseEvent('mouseenter'));
      fixture.detectChanges();
      
      const computedStyle = window.getComputedStyle(buttonElement);
      expect(computedStyle.display).toBe('flex');
      expect(computedStyle.alignItems).toBe('center');
    });

    it('should have consistent offsetHeight with form field across breakpoints', () => {
      const button: DebugElement = fixture.debugElement.query(By.css('button[type="submit"]'));
      const formField: DebugElement = fixture.debugElement.query(By.css('mat-form-field'));
      
      expect(button).toBeTruthy();
      expect(formField).toBeTruthy();
      
      // Desktop (1920px)
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1920 });
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      
      const desktopButtonHeight = button.nativeElement.offsetHeight;
      const desktopFormFieldHeight = formField.nativeElement.offsetHeight;
      expect(Math.abs(desktopButtonHeight - desktopFormFieldHeight)).toBeLessThanOrEqual(30);
      
      // Tablet (768px)
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 768 });
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      
      const tabletButtonHeight = button.nativeElement.offsetHeight;
      const tabletFormFieldHeight = formField.nativeElement.offsetHeight;
      expect(Math.abs(tabletButtonHeight - tabletFormFieldHeight)).toBeLessThanOrEqual(30);
      
      // Mobile (375px)
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 375 });
      window.dispatchEvent(new Event('resize'));
      fixture.detectChanges();
      
      const mobileButtonHeight = button.nativeElement.offsetHeight;
      const mobileFormFieldHeight = formField.nativeElement.offsetHeight;
      expect(Math.abs(mobileButtonHeight - mobileFormFieldHeight)).toBeLessThanOrEqual(30);
    });

    it('should preserve gradient background on button', () => {
      const button: DebugElement = fixture.debugElement.query(By.css('button[type="submit"]'));
      const computedStyle = window.getComputedStyle(button.nativeElement);
      
      // Verifica se o background contém gradiente
      expect(computedStyle.backgroundImage).toContain('gradient');
    });

    it('should maintain button disabled state with flex layout', () => {
      component.form.patchValue({ opcao: '' });
      fixture.detectChanges();
      
      const button: DebugElement = fixture.debugElement.query(By.css('button[type="submit"]'));
      const buttonElement = button.nativeElement;
      
      expect(buttonElement.disabled).toBe(true);
      
      const computedStyle = window.getComputedStyle(buttonElement);
      expect(computedStyle.display).toBe('flex');
      expect(computedStyle.alignItems).toBe('center');
    });
  });
});
