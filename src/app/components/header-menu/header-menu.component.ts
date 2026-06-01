import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

interface MenuItem {
  readonly label: string;
  readonly route: string;
  readonly icon?: string;
}

@Component({
  selector: 'app-header-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-menu.component.html',
  styleUrls: ['./header-menu.component.scss']
})
export class HeaderMenuComponent {
  readonly menuItems: readonly MenuItem[] = [
    { label: 'Home', route: '/', icon: '🏠' },
    { label: 'Busca de Rolagens', route: '/painel-rolagem', icon: '🔍' },
    { label: 'Carteira', route: '/carteira', icon: '💼' }
  ];

  readonly isMenuOpen = signal(false);

  constructor(private readonly router: Router) {}

  toggleMenu(): void {
    this.isMenuOpen.update(open => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
    this.closeMenu();
  }
}
