# Workflow: header-menu-ausente

## Status Geral
- **Fase Atual**: ANALISE
- **Complexidade**: Simples
- **Inicio**: 2025-01-20

## Fases

### 1. Análise (Bug Fixer TS)
- **Status**: CONCLUIDO
- **Entregas**: Causa raiz identificada, plano de correção
- **Observações**:

### 2. Implementação (Bug Fixer TS)
- **Status**: EM_ANDAMENTO
- **Entregas**: Código corrigido, testes atualizados
- **Observações**:

### 3. Review (QA Engineer TS)
- **Status**: PENDENTE
- **Entregas**: PR criada e aprovada, CI verde
- **Observações**:

## Causa Raiz
- **Arquivos**: `src/app/components/adicionar-opcao/adicionar-opcao.component.html`, `src/app/components/criar-carteira/criar-carteira.component.html`
- **Linha**: 1 (primeira linha)
- **Problema**: Os templates não incluem o componente `<app-header-menu></app-header-menu>`
- **Por que acontece**: O header-menu foi esquecido durante a implementação desses componentes

## Historico de Transicoes
| Data | De | Para | Nota |