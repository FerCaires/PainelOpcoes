# Feature: [Nome da Feature]

## Contexto e Objetivo
[Problema que motiva a feature + o que se espera alcançar — 1 parágrafo]

## Requisitos Funcionais
1. [RF01] - [Descrição clara do que o sistema deve fazer]
2. [RF02] - [Descrição]

## Requisitos Não-Funcionais
1. [RNF01] - [Performance, segurança, usabilidade, etc.]

## Critérios de Aceite
- [ ] [CA01] [Descrição do critério — o que o usuário/QA deve observar]
  - Cenário Gherkin (se envolver fluxo de usuário):
    ```gherkin
    Dado que [contexto inicial]
    Quando [ação do usuário ou evento]
    Então [resultado esperado]
    ```
- [ ] [CA02] [Descrição]

## Fora do Escopo
- [Item que NÃO faz parte desta entrega]

## Tarefas Atômicas
1. [ ] [TASK-01] [Título] — [O que fazer, arquivo(s) .ts, critério de done]
2. [ ] [TASK-02] [Título] — [O que fazer, arquivo(s) .ts, critério de done]

## Tarefas de Design (se aplicável)
- [ ] [DESIGN-01] [Descrição] — invocar `frontend-design`

## Riscos e Dependências
- [Risco identificado] -> [Mitigação proposta]
- [Dependência externa] -> [Como resolver se indisponível]

## Matriz de Rastreabilidade
| Requisito | Tasks | Arquivos | Testes |
|-----------|-------|----------|--------|
| RF01 | TASK-01 | `Component.ts`, `Service.ts` | `Component.spec.ts` |
| RF02 | TASK-02 | `Service.ts` | `Service.spec.ts` |

## Complexidade: {Média|Grande}