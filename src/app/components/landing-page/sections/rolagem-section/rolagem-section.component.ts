import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface RolagemCard {
  readonly titulo: string;
  readonly descricao: string;
  readonly icone: string;
}

@Component({
  selector: 'app-rolagem-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rolagem-section.component.html',
  styleUrls: ['./rolagem-section.component.scss']
})
export class RolagemSectionComponent {
  readonly cards: readonly RolagemCard[] = [
    {
      titulo: 'Conceito de Rolagem',
      descricao: 'Rolagem é a estratégia de fechar uma posição de opção e abrir uma nova posição com características diferentes (vencimento, strike ou tipo). É utilizada para ajustar posições, capturar ganhos ou reduzir perdas.',
      icone: '🔄'
    },
    {
      titulo: 'Rolagem Vertical',
      descricao: 'Envolve fechar uma opção e abrir outra do mesmo tipo (CALL ou PUT) com o mesmo vencimento, mas com strike diferente. Permite ajustar o nível de proteção ou ganho da posição.',
      icone: '⬆️'
    },
    {
      titulo: 'Rolagem Horizontal',
      descricao: 'Envolve fechar uma opção e abrir outra do mesmo tipo com o mesmo strike, mas com vencimento diferente. Estende o tempo da posição ou captura mais prêmio.',
      icone: '⬅️'
    },
    {
      titulo: 'Rolagem Diagonal',
      descricao: 'Combina rolagem vertical e horizontal, alterando tanto o strike quanto o vencimento. Oferece maior flexibilidade para ajustar posições complexas.',
      icone: '↗️'
    },
    {
      titulo: 'Benefícios da Rolagem',
      descricao: 'Permite capturar ganhos adicionais, reduzir perdas, estender posições lucrativas, adaptar-se a mudanças de mercado e otimizar o retorno sobre o capital investido.',
      icone: '💰'
    },
    {
      titulo: 'Riscos da Rolagem',
      descricao: 'Custos de transação podem reduzir lucros, timing incorreto pode aumentar perdas, mercado pode se mover contra a nova posição, e requer monitoramento constante.',
      icone: '⚠️'
    }
  ];
}
