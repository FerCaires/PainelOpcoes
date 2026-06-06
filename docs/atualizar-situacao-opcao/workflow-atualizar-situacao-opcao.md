# Workflow: atualizar-situacao-opcao

## Status Geral
- **Fase Atual**: REVIEW
- **Modo**: CONTINUO
- **Inicio**: 2026-06-04

## Fases

### 1. Planejamento (PM Analyst TS)
- **Status**: CONCLUIDO
- **Entregas**: `docs/specs/atualizar-situacao-opcao.md`, `docs/memoria-tasks.md`
- **Observacoes**: Aprovado pelo usuario. Decisoes: (1) padronizar `nomeOpcao`; (2) manter `<mat-select>` para carteiraId; (3) forkJoin paralelo; (4) migrar `situacao` para enum; (5) UX padrao simples.

### 2. Design (Tech Lead TS)
- **Status**: CONCLUIDO
- **Entregas**: `docs/adrs/ADR-007-padronizacao-nome-opcao.md`, tasks refinadas em `docs/memoria-tasks.md`
- **Observacoes**: Feature Pequena dispensa SDD formal (`docs/atualizar-situacao-opcao/sdd.md` NAO criado, conforme AGENTS.md). ADR-007 criado para registrar a decisao de padronizacao `nome` -> `nomeOpcao` e a estrategia de mapping retrocompativel (pipe(map) no service, sem interceptor global). Tasks TASK-01..TASK-05 refinadas com arquivos exatos e mensagens de commit. Migrations tecnicas (modelo, mocks, trackByNome) incorporadas nas tasks existentes. `inject()`/`OnPush`/`cdr.markForCheck()` ja em uso no component e no service (sem refator extra necessaria).

### 3. Implementacao (Senior Dev TS)
- **Status**: CONCLUIDO
- **Inicio**: 2026-06-04
- **Conclusao**: 2026-06-04
- **Entregas**: Codigo `.ts`, testes, Docker
- **Observacoes**: 5/5 tasks implementadas com TDD. 133/133 testes passando. ng lint limpo. ng build ok.
  - TASK-01: enum SituacaoOpcao + padronizacao OpcaoCarteira (nome->nomeOpcao, situacao->SituacaoOpcao)
  - TASK-02: PUT atualizarSituacaoOpcao + mapping retrocompativel (pipe(map) com Record<string,unknown>)
  - TASK-03: testes do service (PUT + mapping com payload legado/canonico)
  - TASK-04: UI de edicao em massa (mat-select por linha, botao "Atualizar Situacoes", forkJoin + catchError)
  - TASK-05: testes do componente (combo pre-selecionado, PUT por opcao, erro parcial, recarga)

### 4. Review (QA Engineer TS)
- **Status**: EM_ANDAMENTO
- **Entregas**: PR revisada, CI verde
- **Observacoes**:

## Historico de Transicoes
| Data | De | Para | Nota |
|------|-----|------|------|
| 2026-06-04 | - | PLANEJAMENTO | Inicio do workflow |
| 2026-06-04 | - | PLANEJAMENTO | Spec criada em docs/specs/atualizar-situacao-opcao.md |
| 2026-06-04 | PLANEJAMENTO | DESIGN | Spec aprovada; 5 decisoes registradas |
| 2026-06-04 | DESIGN | DESIGN | SDD dispensado (feature Pequena); ADR-007 criado (padronizacao `nomeOpcao` + mapping retrocompativel); 5 tasks refinadas com arquivos e commits |
| 2026-06-04 | DESIGN | IMPLEMENTACAO | 5 tasks implementadas; 118/133 testes verdes (15 pre-existing CriarCarteiraComponent Router failures); build valido |
| 2026-06-05 | IMPLEMENTACAO | REVIEW | Validacao final: 133/133 testes passando, lint limpo, build ok. Tasks TASK-01..TASK-05 concluidas. Avancando para REVIEW. |
