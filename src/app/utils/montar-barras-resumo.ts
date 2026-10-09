export interface ItemBarraResumo {
  readonly rotulo: string;
  readonly valor: number;
}

export interface BarraResumo {
  readonly rotulo: string;
  readonly valor: number;
  readonly x: number;
  readonly y: number;
  readonly largura: number;
  readonly altura: number;
  readonly negativo: boolean;
}

export interface LayoutBarrasResumo {
  readonly barras: readonly BarraResumo[];
  readonly linhaZero: number;
}

const MARGEM_SUP = 16;
const MARGEM_LAT = 12;
const FRACAO_BARRA = 0.62;

export function montarBarrasResumo(
  itens: readonly ItemBarraResumo[],
  largura: number,
  altura: number
): LayoutBarrasResumo {
  const margemInf = Math.max(28, Math.round(altura * 0.28));
  const plotAltura = altura - MARGEM_SUP - margemInf;
  const plotLargura = largura - MARGEM_LAT * 2;
  if (itens.length === 0 || plotAltura <= 0 || plotLargura <= 0) {
    return { barras: [], linhaZero: MARGEM_SUP + Math.max(plotAltura, 0) / 2 };
  }
  const limites = limitesDaSerie(itens);
  const linhaZero = MARGEM_SUP + (limites.max / limites.amplitude) * plotAltura;
  return {
    barras: itens.map((item, i) =>
      montarBarra(item, i, itens.length, plotLargura, plotAltura, linhaZero, limites.amplitude)
    ),
    linhaZero
  };
}

function limitesDaSerie(itens: readonly ItemBarraResumo[]): { max: number; amplitude: number } {
  const valores = itens.map((item) => item.valor);
  const max = Math.max(...valores, 0);
  const min = Math.min(...valores, 0);
  return { max, amplitude: max - min || 1 };
}

function montarBarra(
  item: ItemBarraResumo,
  indice: number,
  quantidade: number,
  plotLargura: number,
  plotAltura: number,
  linhaZero: number,
  amplitude: number
): BarraResumo {
  const coluna = plotLargura / quantidade;
  const largura = coluna * FRACAO_BARRA;
  const altura = (Math.abs(item.valor) / amplitude) * plotAltura;
  const x = MARGEM_LAT + indice * coluna + (coluna - largura) / 2;
  const y = item.valor >= 0 ? linhaZero - altura : linhaZero;
  return { rotulo: item.rotulo, valor: item.valor, x, y, largura, altura, negativo: item.valor < 0 };
}
