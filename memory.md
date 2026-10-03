# Project Memory — Painel de Opções

> Fonte de verdade do ciclo speckit neste repositório frontend.
> O Orchestrator lê e atualiza ao fim de cada estágio.

---

## Project overview

- **Name**: Painel de Opções
- **Stack**: TypeScript 5.x / Angular 17+ / RxJS 7+ / Angular Material / Karma + Jasmine (`ng test`) / Cypress (E2E) / Docker
- **Style**: SPA frontend que consome a API REST `CarteiraOpcoes` (`http://localhost:8080/api`)
- **Started**: 2024-06-01
- **Last updated**: 2026-10-03

---

## Features

| ID | Feature | Status | Spec | Arch | Tasks | Completed |
|----|---------|--------|------|------|-------|-----------|
| F-024 | Tela de Simulação de Meta de Prêmio | 🟡 in-progress | docs/simulacaoMetaPremio/spec.md | docs/simulacaoMetaPremio/architecture.md | docs/simulacaoMetaPremio/tasks.md | — |
| F-026 | Modos de Simulação na tela Meta de Prêmio | 🟡 in-progress | docs/modosSimulacaoPremio/spec.md | docs/modosSimulacaoPremio/architecture.md | docs/modosSimulacaoPremio/tasks.md | — |
| F-029 | Tela de Controle de Operações | 🟡 in-progress | docs/controleOperacoes/spec.md | docs/controleOperacoes/architecture.md | docs/controleOperacoes/tasks.md | — |
| F-030 | UX do Controle de Operações | 🟡 in-progress | docs/uxControleOperacoes/spec.md | docs/uxControleOperacoes/architecture.md | docs/uxControleOperacoes/tasks.md | — |

---

## Feature details

### F-024 · Tela de Simulação de Meta de Prêmio

- **Status**: 🟡 in-progress
- **Summary**: Expor no frontend (tela + item de menu) a simulação stateless de meta de prêmio mensal já entregue pelo backend F-023 (`GET /api/simulacao-meta-premio`)
- **Completed on**: —
- **Stack involved**: TypeScript / Angular
- **Current stage**: Implementation complete — awaiting REVIEW
- **Gate results**:
  - Gate 1 (Spec): PASS WITH NOTES — 2026-10-01 (W-01..W-04 fechados na spec após aprovação)
  - Gate 2 (Arch): PASS WITH NOTES — 2026-10-01
  - Gate 3 (Tasks): PASS WITH NOTES — 2026-10-01
- **Backend dependency**: F-023 em `CarteiraOpcoesDevin`

---

### F-026 · Modos de Simulação na tela Meta de Prêmio

- **Status**: 🟡 in-progress
- **Summary**: Seletor de modo (meta / garantia / quantidade) na mesma rota `/simulacao-meta-premio`; consome F-025
- **Current stage**: Implementation complete — awaiting REVIEW (sem commit/PR até pedido do usuário)
- **Backend dependency**: F-025 em `CarteiraOpcoesDevin`

---

### F-029 · Tela de Controle de Operações

- **Status**: 🟡 in-progress
- **Summary**: Tela `/controle-operacoes` com CRUD, importação CSV, resumos e filtros no servidor
- **Current stage**: Implementation complete — awaiting REVIEW
- **Backend dependency**: F-028 em `CarteiraOpcoesDevin`

---

### F-030 · UX do Controle de Operações

- **Status**: 🟡 in-progress
- **Summary**: Cadastro recolhível, filtros junto dos resumos e da tabela, gráficos SVG de lucro (mês/ano/ativo) sem recálculo
- **Completed on**: —
- **Stack involved**: TypeScript / Angular
- **Current stage**: Implementation complete — awaiting REVIEW (sem commit/PR até pedido do usuário)
- **Gate results**:
  - Gate 1 (Spec): PASS — 2026-10-03
  - Gate 2 (Arch): PASS — 2026-10-03
  - Gate 3 (Tasks): PASS WITH NOTES — 2026-10-03 (W-01 testes agrupados; W-02 SCSS no componente)
- **Key files produced**:
  - `docs/uxControleOperacoes/spec.md`
  - `docs/uxControleOperacoes/architecture.md`
  - `docs/uxControleOperacoes/tasks.md`
- **Open issues / tech debt**:
  - Gate 3 W-01: um `it` por AC na spec do componente
  - Gate 3 W-02: media query dos gráficos no SCSS
- **Backend dependency**: nenhuma (GET F-028 já existente)

---

## Tasks registry

| Task ID | Feature | Title | Lang | Complexity | Status | Reviewer verdict |
|---------|---------|-------|------|------------|--------|------------------|
| TASK-01..47 | F-024 | Tela de simulação de meta de prêmio | TypeScript | XS–M | ✅ done | — |
| TASK-01..07 | F-026 | Modos na tela Meta de Prêmio | TypeScript | S–M | ✅ done | — |
| TASK-01 | F-030 | Função `montarBarrasResumo` | TypeScript | S | ✅ done | — |
| TASK-02 | F-030 | Spec da função de barras | TypeScript | XS | ✅ done | — |
| TASK-03 | F-030 | `GraficoBarrasResumoComponent` | TypeScript | S | ✅ done | — |
| TASK-04 | F-030 | Cadastro recolhido por padrão | TypeScript | S | ✅ done | — |
| TASK-05 | F-030 | Abrir/fechar cadastro e edição | TypeScript | S | ✅ done | — |
| TASK-06 | F-030 | Filtros nos resumos e na tabela | TypeScript | S | ✅ done | — |
| TASK-07 | F-030 | Ligar os três gráficos ao `resumo` | TypeScript | S | ✅ done | — |
| TASK-08 | F-030 | Specs do componente Controle para F-030 | TypeScript | M | ✅ done | — |

---

## Changelog

| Date | Event |
|------|--------|
| 2026-10-01 | F-024 iniciada — tela/menu de simulação de meta de prêmio no Painel de Opções |
| 2026-10-01 | Gate 1 PASS WITH NOTES — spec F-024 pronta para revisão do usuário |
| 2026-10-01 | Spec aprovada; W-01..W-04 da spec fechados |
| 2026-10-01 | Gate 2 PASS WITH NOTES — SDD F-024 pronto para revisão do usuário |
| 2026-10-01 | Gate 3 PASS WITH NOTES — 47 tasks TypeScript |
| 2026-10-01 | F-024 implementada (rota `/simulacao-meta-premio`, menu, serviços HTTP, testes) |
| 2026-10-02 | F-026 — modos meta/garantia/quantidade na mesma tela |
| 2026-10-02 | F-026 implementada (toggle, HttpParams por modo, validator múltiplo de 100); testes da feature verdes; aguardando REVIEW |
| 2026-10-03 | F-030 iniciada — UX do Controle (cadastro recolhido, gráficos, filtros) |
| 2026-10-03 | Gate 1 PASS — spec F-030 |
| 2026-10-03 | Gate 2 PASS — architecture F-030 (SVG, *ngIf, filtros duplicados) |
| 2026-10-03 | Gate 3 PASS WITH NOTES — 8 tasks TypeScript |
| 2026-10-03 | F-030 implementada — cadastro recolhível, gráficos SVG, filtros em resumos e tabela |
