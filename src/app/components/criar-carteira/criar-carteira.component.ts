import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { CarteiraApiService } from '../../services/carteira-api.service';

@Component({
  selector: 'app-criar-carteira',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './criar-carteira.component.html',
  styleUrls: ['./criar-carteira.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CriarCarteiraComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(CarteiraApiService);
  private readonly router = inject(Router);

  form: FormGroup;
  carregando = false;
  erro?: string;

  constructor() {
    this.form = this.fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9]+$/)
      ]]
    });
  }

  get nomeControl() {
    return this.form.get('nome')!;
  }

  get nomeInvalido(): boolean {
    const ctrl = this.nomeControl;
    return ctrl.touched && ctrl.dirty && (ctrl.hasError('required') || ctrl.hasError('minlength') || ctrl.hasError('maxlength') || ctrl.hasError('pattern'));
  }

  get podeCriar(): boolean {
    return this.form.valid && !this.carregando;
  }

  criar(): void {
    // Implementação será feita na TASK-08
  }
}