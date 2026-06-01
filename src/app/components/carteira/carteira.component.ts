import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderMenuComponent } from '../header-menu/header-menu.component';

@Component({
  selector: 'app-carteira',
  standalone: true,
  imports: [CommonModule, HeaderMenuComponent],
  templateUrl: './carteira.component.html',
  styleUrls: ['./carteira.component.scss']
})
export class CarteiraComponent {}
