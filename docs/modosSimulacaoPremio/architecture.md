# Architecture: F-026 Modos de Simulação na tela Meta de Prêmio

## Overview

A rota `/simulacao-meta-premio` permanece. `SimulacaoMetaPremioComponent` ganha controle `modo` (default `META_PREMIO`) e campos `garantia` / `quantidadeAcoes` habilitados só no modo ativo. `SimulacaoMetaPremioApiService.simular` passa a receber um objeto de request e monta `HttpParams` conforme o modo. Sem store, sem nova rota, sem novo item de menu.

## Knowledge base references

- Reuso: componente F-024, `AcaoApiService`, formatadores, `maiorQueZero`, `HeaderMenuComponent`, Material
- Endpoint: `GET {apiBaseUrl}/simulacao-meta-premio` (F-025)
- ADR-001..006; feature ADR-01: mesma tela

## Component diagram

```
Header "Meta de Prêmio" → /simulacao-meta-premio
  SimulacaoMetaPremioComponent
    FormGroup: modo, nomeAcao, metaPremio, garantia, quantidadeAcoes, tipo
    mat-button-toggle-group (modo)
    SimulacaoMetaPremioApiService.simular(request)
```

## Technology decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tela | Estender existente | Spec AC-13 |
| Modo UI | `mat-button-toggle-group` | Três opções exclusivas, teclado |
| Campos inativos | `disable()` | Não entram em `form.value` / validação |
| API service | Um método com objeto `SimulacaoRequest` | Evita 3 assinaturas; testes atualizam calls |
| Quantidade | validator `multiploDeCem` + `maiorQueZero` | AC-10 sem HTTP |
| `modo` ausente na resposta | Tratar como META_PREMIO | Mocks F-024 |

## TypeScript design

```typescript
export enum ModoSimulacao {
  META_PREMIO = 'META_PREMIO',
  GARANTIA = 'GARANTIA',
  QUANTIDADE_ACOES = 'QUANTIDADE_ACOES'
}

export interface SimulacaoRequest {
  readonly nomeAcao: string;
  readonly tipo: TipoOpcao;
  readonly modo: ModoSimulacao;
  readonly metaPremio?: number;
  readonly garantia?: number;
  readonly quantidadeAcoes?: number;
}
```

Response: `modo?`, `metaPremio: number | null`, `garantia?: number | null`, `quantidadeAcoesInformada?: number | null`.

`simular(request)`: sempre envia `nomeAcao`, `tipo`, `modo`; acrescenta só o param do modo. Números via `toString()`.

Componente: `valueChanges` de `modo` → `aplicarModo()` (enable/disable + limpa resultado/erro). `podeSimular` inalterado (form.valid + ações).

Cabeçalho: `ngSwitch` no modo efetivo (`resultado.modo ?? META_PREMIO`).

## Files

Criar: `modo-simulacao.enum.ts`, `simulacao-request.model.ts`, `multiplo-de-cem.validator.ts` + spec.

Alterar: response model, api service + spec, component ts/html/scss + spec.

Não alterar: rotas, header-menu, Docker, environments.

## ADRs

### ADR-01: Estender a tela Meta de Prêmio

- **Status**: Accepted
- **Decision**: Sem rota `/simulacao-garantia`. Seletor de modo no card atual.
- **Consequences**: Subtítulo e grid do formulário mudam; menu F-024 permanece.
