# Workflow: criar-carteira-testes

## Status Geral
- **Fase Atual**: DONE
- **Complexidade**: Medio
- **Inicio**: 2026-06-04

## Fases

### 1. Analise (Bug Fixer TS)
- **Status**: CONCLUIDO
- **Entregas**: Causa raiz identificada, plano de correcao
- **Observacoes**: Ver secao Causa Raiz abaixo

### 2. Implementacao (Bug Fixer TS)
- **Status**: CONCLUIDO
- **Entregas**: Codigo corrigido, testes atualizados
- **Observacoes**: Duas correcoes aplicadas no arquivo spec.ts

### 3. Review (QA Engineer TS)
- **Status**: CONCLUIDO
- **Entregas**: Validacao automatica (ng test, ng lint, ng build)
- **Observacoes**: 133 testes passando, lint limpo, build sem erros

## Causa Raiz

### Problema 1: Conflito de providers do Router (14 testes)
- **Arquivo**: `src/app/components/criar-carteira/criar-carteira.component.spec.ts`
- **Linha**: 42 (provider manual do Router)
- **Problema**: O teste fornecia `{ provide: Router, useValue: routerSpy }` manualmente enquanto tambem importava `RouterTestingModule`. O `CriarCarteiraComponent` (standalone) importa `HeaderMenuComponent`, que por sua vez importa `RouterModule`. O `RouterModule` depende de um `Router` real configurado pelo `RouterTestingModule`, mas encontrava o spy manual que nao possuia a propriedade `routerState.root`, causando `TypeError: Cannot read properties of undefined (reading 'root')`.
- **Correcao**: Removido o provider manual do Router e o `routerSpy`. Passado a usar `TestBed.inject(Router)` e `spyOn(router, 'navigate')` nos testes individuais, seguindo o mesmo padrao do `CarteiraComponent` spec.

### Problema 2: Tipo de erro incorreto no teste de conflito 409 (1 teste)
- **Arquivo**: `src/app/components/criar-carteira/criar-carteira.component.spec.ts`
- **Linha**: 133 (teste "should display error message on 409 conflict")
- **Problema**: O teste enviava `{ status: 409 }` como erro, mas o componente verifica `err instanceof CarteiraDuplicadaError`. Um objeto literal nao e instancia da classe, entao o teste sempre caia no branch generico.
- **Correcao**: Substituido `{ status: 409 }` por `new CarteiraDuplicadaError()`, que e a classe de erro esperada pelo componente.

## Arquivos Modificados
- `src/app/components/criar-carteira/criar-carteira.component.spec.ts`

## Historico de Transicoes
| Data | De | Para | Nota |
|------|-----|------|------|
| 2026-06-04 | - | ANALISE | 15 testes falhando identificados |
| 2026-06-04 | ANALISE | IMPLEMENTACAO | Causa raiz: conflito Router + tipo erro incorreto |
| 2026-06-04 | IMPLEMENTACAO | REVIEW | 133 testes passando, lint e build OK |
| 2026-06-04 | REVIEW | DONE | Bug corrigido e validado |
