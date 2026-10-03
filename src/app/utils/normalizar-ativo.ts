export function normalizarAtivo(valor: string): string {
  return valor.replace(/^bvmf:/i, '').trim().toUpperCase();
}

export function normalizarTicker(valor: string): string {
  return valor.trim().toUpperCase();
}
