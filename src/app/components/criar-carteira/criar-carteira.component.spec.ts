import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CriarCarteiraComponent } from './criar-carteira.component';
import { CarteiraApiService } from '../../services/carteira-api.service';
import { Carteira } from '../../models/carteira.model';
import { StatusCarteira } from '../../models/status-carteira.enum';

describe('CriarCarteiraComponent', () => {
  let component: CriarCarteiraComponent;
  let fixture: ComponentFixture<CriarCarteiraComponent>;
  let apiService: jasmine.SpyObj<CarteiraApiService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const apiSpy = jasmine.createSpyObj('CarteiraApiService', ['criarCarteira']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        CriarCarteiraComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
        RouterTestingModule
      ],
      providers: [
        { provide: CarteiraApiService, useValue: apiSpy },
        { provide: Router, useValue: routerSpy },
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CriarCarteiraComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(CarteiraApiService) as jasmine.SpyObj<CarteiraApiService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have form with nome control', () => {
    expect(component.form).toBeDefined();
    expect(component.form.get('nome')).toBeDefined();
  });

  it('should disable button when form is invalid', () => {
    expect(component.podeCriar).toBeFalse();
  });

  it('should enable button when form is valid', () => {
    component.form.get('nome')?.setValue('MinhaCarteira123');
    fixture.detectChanges();
    expect(component.podeCriar).toBeTrue();
  });

  it('should validate required field', () => {
    const control = component.form.get('nome');
    control?.setValue('');
    expect(control?.hasError('required')).toBeTrue();
  });

  it('should validate minlength', () => {
    const control = component.form.get('nome');
    control?.setValue('ABC');
    expect(control?.hasError('minlength')).toBeTrue();
  });

  it('should validate maxlength', () => {
    const control = component.form.get('nome');
    control?.setValue('A'.repeat(21));
    expect(control?.hasError('maxlength')).toBeTrue();
  });

  it('should validate pattern (only alphanumeric)', () => {
    const control = component.form.get('nome');
    control?.setValue('Minha@Carteira');
    expect(control?.hasError('pattern')).toBeTrue();
  });

  it('should call apiService.criarCarteira when form is valid', () => {
    const mockCarteira: Carteira = {
      id: '1',
      nome: 'MinhaCarteira123',
      status: StatusCarteira.ATIVA,
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00'
    };

    apiService.criarCarteira.and.returnValue(of(mockCarteira));

    component.form.get('nome')?.setValue('MinhaCarteira123');
    component.criar();

    expect(apiService.criarCarteira).toHaveBeenCalledWith('MinhaCarteira123');
  });

  it('should redirect to carteira page on success', () => {
    const mockCarteira: Carteira = {
      id: '1',
      nome: 'MinhaCarteira123',
      status: StatusCarteira.ATIVA,
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00'
    };

    apiService.criarCarteira.and.returnValue(of(mockCarteira));

    component.form.get('nome')?.setValue('MinhaCarteira123');
    component.criar();

    expect(router.navigate).toHaveBeenCalledWith(['/carteira', '1']);
  });

  it('should display error message on 409 conflict', () => {
    const error = { status: 409 };
    apiService.criarCarteira.and.returnValue(throwError(() => error));

    component.form.get('nome')?.setValue('CarteiraExistente');
    component.criar();
    fixture.detectChanges();

    expect(component.erro).toBe('Nome de carteira já existe');
  });

  it('should display generic error message on other errors', () => {
    const error = { status: 500 };
    apiService.criarCarteira.and.returnValue(throwError(() => error));

    component.form.get('nome')?.setValue('MinhaCarteira123');
    component.criar();
    fixture.detectChanges();

    expect(component.erro).toBe('Erro ao criar carteira. Tente novamente.');
  });

  it('should not call api when form is invalid', () => {
    component.form.get('nome')?.setValue('ABC');
    component.criar();

    expect(apiService.criarCarteira).not.toHaveBeenCalled();
  });

  it('should clear loading state after success', () => {
    const mockCarteira: Carteira = {
      id: '1',
      nome: 'MinhaCarteira123',
      status: StatusCarteira.ATIVA,
      createdAt: '2024-01-01T00:00:00',
      updatedAt: '2024-01-01T00:00:00'
    };

    apiService.criarCarteira.and.returnValue(of(mockCarteira));

    component.form.get('nome')?.setValue('MinhaCarteira123');
    component.criar();

    expect(component.carregando).toBeFalse();
  });

  it('should clear loading state after error', () => {
    const error = { status: 500 };
    apiService.criarCarteira.and.returnValue(throwError(() => error));

    component.form.get('nome')?.setValue('MinhaCarteira123');
    component.criar();

    expect(component.carregando).toBeFalse();
  });
});