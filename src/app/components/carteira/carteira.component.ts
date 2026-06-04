import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';

@Component({
  selector: 'app-carteira',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, HeaderMenuComponent],
  templateUrl: './carteira.component.html',
  styleUrls: ['./carteira.component.scss']
})
export class CarteiraComponent {
  private readonly router = inject(Router);

  criarNovaCarteira(): void {
    this.router.navigate(['/carteira/criar']);
  }
}
