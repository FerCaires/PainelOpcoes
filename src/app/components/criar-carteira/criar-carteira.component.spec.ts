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
import { CriarCarteiraComponent } from './criar-carteira.component';
import { CarteiraApiService } from '../../services/carteira-api.service';

describe('CriarCarteiraComponent', () => {
  let component: CriarCarteiraComponent;
  let fixture: ComponentFixture<CriarCarteiraComponent>;

  beforeEach(async () => {
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
      providers: [CarteiraApiService, provideHttpClient()]
    }).compileComponents();

    fixture = TestBed.createComponent(CriarCarteiraComponent);
    component = fixture.componentInstance;
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
});