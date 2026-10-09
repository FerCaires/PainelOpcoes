import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemBarraResumo, montarBarrasResumo } from '../../utils/montar-barras-resumo';
import { formatarMonetario } from '../../utils/formatacao';

const LARGURA = 640;
const ALTURA = 240;

@Component({
  selector: 'app-grafico-barras-resumo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grafico-barras-resumo.component.html',
  styleUrls: ['./grafico-barras-resumo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraficoBarrasResumoComponent {
  readonly titulo = input.required<string>();
  readonly itens = input.required<readonly ItemBarraResumo[]>();

  readonly largura = LARGURA;
  readonly altura = ALTURA;

  readonly layout = computed(() => montarBarrasResumo(this.itens(), LARGURA, ALTURA));

  readonly ariaLabel = computed(() => this.titulo());
  readonly ocultarValores = computed(() => this.itens().length > 8);

  formatarValor(valor: number): string {
    return formatarMonetario(valor);
  }

  formatarRotulo(rotulo: string): string {
    return /^\d{4}-\d{2}$/.test(rotulo) ? `${rotulo.slice(5)}/${rotulo.slice(2, 4)}` : rotulo;
  }

  trackRotulo(_index: number, barra: { rotulo: string }): string {
    return barra.rotulo;
  }
}
