import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface OpcaoCard {
  readonly titulo: string;
  readonly descricao: string;
  readonly icone: string;
}

@Component({
  selector: 'app-opcoes-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './opcoes-section.component.html',
  styleUrls: ['./opcoes-section.component.scss']
})
export class OpcoesSectionComponent {
  readonly cards: readonly OpcaoCard[] = [
    {
      titulo: 'Opção CALL',
      descricao: 'Uma opção CALL é um contrato que dá ao comprador o direito (mas não a obrigação) de comprar um ativo subjacente a um preço pré-determinado (strike) até uma data específica. É utilizada quando você acredita que o preço do ativo vai subir.',
      icone: '📈'
    },
    {
      titulo: 'Opção PUT',
      descricao: 'Uma opção PUT é um contrato que dá ao comprador o direito (mas não a obrigação) de vender um ativo subjacente a um preço pré-determinado (strike) até uma data específica. É utilizada quando você acredita que o preço do ativo vai cair.',
      icone: '📉'
    },
    {
      titulo: 'Racionais (Moneyness)',
      descricao: 'Os racionais descrevem a relação entre o preço atual do ativo e o strike da opção: ITM (In The Money) - opção tem valor intrínseco; ATM (At The Money) - preço próximo ao strike; OTM (Out of The Money) - opção sem valor intrínseco.',
      icone: '⚖️'
    },
    {
      titulo: 'Cenários de Uso',
      descricao: 'As opções podem ser usadas para proteção de posições (hedge), especulação sobre movimentos de preço, geração de renda através de prêmios, ou estratégias mais complexas combinando múltiplas opções.',
      icone: '🎯'
    }
  ];
}
