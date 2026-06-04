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
import { AdicionarOpcaoComponent } from './adicionar-opcao.component';
import { CarteiraApiService } from '../../services/carteira-api.service';

describe('AdicionarOpcaoComponent', () => {
  let component: AdicionarOpcaoComponent;
  let fixture: ComponentFixture<AdicionarOpcaoComponent>;

  beforeEach(async () => {
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
      providers: [CarteiraApiService, provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(AdicionarOpcaoComponent);
    component = fixture.componentInstance;
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

  it('should disable button when form is invalid', () => {
    expect(component.podeAdicionar).toBeFalse();
  });

  it('should enable button when form is valid', () => {
    component.form.get('nomeOpcao')?.setValue('PETR4123');
    component.form.get('carteiraId')?.setValue('1');
    fixture.detectChanges();
    expect(component.podeAdicionar).toBeTrue();
  });
});