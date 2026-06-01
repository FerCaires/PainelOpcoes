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
    path: '**',
    redirectTo: ''
  }
];
