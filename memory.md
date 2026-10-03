# Project Memory — Painel de Opções

> Fonte de verdade do ciclo speckit neste repositório frontend.
> O Orchestrator lê e atualiza ao fim de cada estágio.

---

## Project overview

- **Name**: Painel de Opções
- **Stack**: TypeScript 5.x / Angular 17+ / RxJS 7+ / Angular Material / Karma + Jasmine (`ng test`) / Cypress (E2E) / Docker
- **Style**: SPA frontend que consome a API REST `CarteiraOpcoes` (`http://localhost:8080/api`)
- **Started**: 2024-06-01
- **Last updated**: 2026-10-02

---

## Features

| ID | Feature | Status | Spec | Arch | Tasks | Completed |
|----|---------|--------|------|------|-------|-----------|
| F-024 | Tela de Simulação de Meta de Prêmio | 🟡 in-progress | docs/simulacaoMetaPremio/spec.md | docs/simulacaoMetaPremio/architecture.md | docs/simulacaoMetaPremio/tasks.md | — |
| F-026 | Modos de Simulação na tela Meta de Prêmio | 🟡 in-progress | docs/modosSimulacaoPremio/spec.md | docs/modosSimulacaoPremio/architecture.md | docs/modosSimulacaoPremio/tasks.md | — |

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
- **Key files produced**:
  - `docs/simulacaoMetaPremio/spec.md`
  - `docs/simulacaoMetaPremio/architecture.md`
  - `docs/simulacaoMetaPremio/tasks.md`
  - `docs/simulacaoMetaPremio/gate-3.md`
  - `src/app/components/simulacao-meta-premio/`
  - `src/app/services/acao-api.service.ts`
  - `src/app/services/simulacao-meta-premio-api.service.ts`
- **Open issues / tech debt**:
  - Gate 3 W-01..W-05 endereçados na implementação (UI 422, spec do header, overflow-x, slots distintos)
  - Electron ainda falha 3 testes pré-existentes de alinhamento em `PainelRolagemComponent` (fora desta feature)
- **Backend dependency**: F-023 em `CarteiraOpcoesDevin` (spec + architecture + implementação)

---

### F-026 · Modos de Simulação na tela Meta de Prêmio

- **Status**: 🟡 in-progress
- **Summary**: Seletor de modo (meta / garantia / quantidade) na mesma rota `/simulacao-meta-premio`; consome F-025
- **Completed on**: —
- **Stack involved**: TypeScript / Angular
- **Current stage**: Implementation complete — awaiting REVIEW (sem commit/PR até pedido do usuário)
- **Key files produced**:
  - `docs/modosSimulacaoPremio/spec.md`
  - `docs/modosSimulacaoPremio/architecture.md`
  - `docs/modosSimulacaoPremio/tasks.md`
  - `modo-simulacao.enum.ts`, `simulacao-request.model.ts`, `multiplo-de-cem.validator.ts`
- **Backend dependency**: F-025 em `CarteiraOpcoesDevin`

---

## Tasks registry

| Task ID | Feature | Title | Lang | Complexity | Status | Reviewer verdict |
|---------|---------|-------|------|------------|--------|------------------|
| TASK-01..47 | F-024 | Tela de simulação de meta de prêmio | TypeScript | XS–M | ✅ done | — |
| TASK-01..07 | F-026 | Modos na tela Meta de Prêmio | TypeScript | S–M | ✅ done | — |

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
