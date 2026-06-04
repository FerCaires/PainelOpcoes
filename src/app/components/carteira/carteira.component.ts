import { Component, inject, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';
import { CarteiraApiService } from '../../services/carteira-api.service';
import { Carteira } from '../../models/carteira.model';

@Component({
  selector: 'app-carteira',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatProgressSpinnerModule,
    HeaderMenuComponent
  ],
  templateUrl: './carteira.component.html',
  styleUrls: ['./carteira.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CarteiraComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly api = inject(CarteiraApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  carteiras: Carteira[] = [];
  carregando = false;
  erro?: string;

  colunasTabela = ['nome', 'status', 'acoes'];

  ngOnInit(): void {
    this.carregarCarteirasAtivas();
  }

  private carregarCarteirasAtivas(): void {
    this.carregando = true;
    this.erro = undefined;

    this.api.listarCarteirasAtivas().subscribe({
      next: (carteiras) => {
        this.carteiras = carteiras;
        this.carregando = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.erro = 'Erro ao carregar carteiras. Tente novamente.';
        this.carregando = false;
        this.cdr.markForCheck();
      }
    });
  }

  criarNovaCarteira(): void {
    this.router.navigate(['/carteira/criar']);
  }

  adicionarOpcoes(carteiraId: string): void {
    this.router.navigate(['/carteira', carteiraId, 'adicionar-opcao']);
  }
}
