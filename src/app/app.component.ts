import { Component } from '@angular/core';
import { PainelRolagemComponent } from './components/painel-rolagem/painel-rolagem.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PainelRolagemComponent],
  template: `<app-painel-rolagem></app-painel-rolagem>`,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'painel-opcoes';
}
