import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { PainelRolagemComponent } from './components/painel-rolagem/painel-rolagem.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
    data: { title: 'Home - Painel de Opções' }
  },
  {
    path: 'painel-rolagem',
    component: PainelRolagemComponent,
    data: { title: 'Busca de Rolagens' }
  },
  {
    path: 'carteira',
    loadComponent: () => import('./components/carteira/carteira.component')
      .then(m => m.CarteiraComponent),
    data: { title: 'Carteira' }
  },
  {
    path: 'carteira/criar',
    loadComponent: () => import('./components/criar-carteira/criar-carteira.component')
      .then(m => m.CriarCarteiraComponent),
    data: { title: 'Criar Carteira' }
  },
  {
    path: 'carteira/:id/adicionar-opcao',
    loadComponent: () => import('./components/adicionar-opcao/adicionar-opcao.component')
      .then(m => m.AdicionarOpcaoComponent),
    data: { title: 'Adicionar Opção à Carteira' }
  },
  {
    path: '**',
    redirectTo: ''
  }
];
