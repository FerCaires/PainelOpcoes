# Workflow: criacao-carteira

## Status Geral
- **Fase Atual**: IMPLEMENTACAO
- **Modo**: CONTINUO
- **Inicio**: 2026-06-04

## Fases

### 1. Planejamento (PM Analyst TS)
- **Status**: CONCLUIDO
- **Entregas**: `docs/criacao-carteira/spec.md`, `docs/memoria-tasks.md`
- **Observacoes**: Spec criada com 17 RFs, 7 RNFs, 6 cenários Gherkin e 19 tasks atômicas. Ajustado: RF12 e RF15 - validação de existência da opção é responsabilidade do backend (removido GET /api/opcoes/{nome} para validação prévia).

### 2. Design (Tech Lead TS)
- **Status**: CONCLUIDO
- **Entregas**: ADRs (se houver), `docs/sdd.md` atualizado
- **Observacoes**: ADR-005 (migrar para inject()) e ADR-006 (environment configuration) criados. SDD atualizado com novos modelos, componentes, serviços e endpoints. Tasks refinadas de 19 para 25 (adicionadas 4 tasks técnicas). Arquitetura definida como Feature-based Standalone Components.

### 3. Implementacao (Senior Dev TS)
- **Status**: CONCLUIDO
- **Inicio**: 2026-06-04
- **Conclusao**: 2026-06-04
- **Entregas**:
  - [x] TASK-01: Criar enum StatusCarteira
  - [x] TASK-02: Criar model Carteira
  - [x] TASK-03: Criar model OpcaoCarteira
  - [x] TASK-04: Criar DTO CriarCarteiraRequest
  - [x] TASK-05: Criar CarteiraApiService
  - [x] TASK-06: Criar testes unitários para CarteiraApiService
  - [x] TASK-07: Criar componente CriarCarteiraComponent (estrutura)
  - [x] TASK-08: Implementar lógica de criação de carteira no componente
  - [x] TASK-09: Invocar frontend-design para CriarCarteiraComponent
  - [x] TASK-10: Criar testes unitários para CriarCarteiraComponent
  - [x] TASK-11: Criar componente AdicionarOpcaoComponent (estrutura)
  - [x] TASK-12: Implementar lógica de carregamento de carteiras ativas
  - [x] TASK-13: Implementar lógica de adição de opção
  - [x] TASK-14: Implementar listagem de opções da carteira
  - [x] TASK-15: Invocar frontend-design para AdicionarOpcaoComponent
  - [x] TASK-16: Criar testes unitários para AdicionarOpcaoComponent
  - [x] TASK-17: Configurar rotas para novas páginas
  - [x] TASK-18: Atualizar menu de navegação
  - [x] TASK-19: Atualizar CarteiraComponent para redirecionar
  - [x] TASK-20: Executar testes e validações finais
  - [x] TASK-21: Atualizar Docker (validado, sem mudanças necessárias)
  - [x] TASK-22: Configurar environment files
  - [x] TASK-23: Atualizar services para usar environment
  - [x] TASK-24: Refatorar RolagemApiService para usar inject()
  - [x] TASK-25: Refatorar componentes existentes para usar inject()
- **Observacoes**: Todas as 25 tasks implementadas com sucesso. 117 testes unitários passando. Build validado.

### 4. Review (QA Engineer TS)
- **Status**: PENDENTE
- **Entregas**: PR criada e aprovada, CI verde
- **Observacoes**:

## Historico de Transicoes
| Data | De | Para | Nota |
|------|-----|------|------|
| 2026-06-04 | - | PLANEJAMENTO | Início do workflow |
| 2026-06-04 | PLANEJAMENTO | CONCLUIDO | Spec criada com 19 tasks atômicas |
| 2026-06-04 | PLANEJAMENTO | CONCLUIDO | Ajustado RF12 e RF15 - validação de opção é responsabilidade do backend |
| 2026-06-04 | PLANEJAMENTO | DESIGN | Spec aprovada pelo usuário |
| 2026-06-04 | DESIGN | CONCLUIDO | Design técnico concluído com ADRs e SDD atualizados |
| 2026-06-04 | DESIGN | IMPLEMENTACAO | Design aprovado, iniciando implementação |
| 2026-06-04 | DESIGN | IMPLEMENTACAO | Design aprovado pelo usuário |
