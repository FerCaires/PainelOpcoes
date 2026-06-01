# Feature: Adicionar Campo Premio na Interface BuscaRolagemResponse

## Contexto e Objetivo
O painel de rolagem de opções precisa exibir o prêmio da opção informada pelo usuário, além dos dados já apresentados (nome, vencimento, strike). Atualmente o campo `premio` não existe na interface `BuscaRolagemResponse` e o template exibe "Em breve" como placeholder. O objetivo é alinhar o modelo de dados com a resposta real da API.

## Requisitos Funcionais
1. **RF01** — A interface `BuscaRolagemResponse` deve conter o campo `premio: number` representando o prêmio da opção buscada.
2. **RF02** — Todos os mocks de teste que instanciam `BuscaRolagemResponse` devem incluir o campo `premio`.
3. **RF03** — O template do painel deve renderizar o valor do prêmio da opção informada usando o formatador existente.

## Requisitos Não-Funcionais
1. **RNF01** — Sem quebra de compatibilidade de tipos TypeScript (campo adicional obrigatório).
2. **RNF02** — Todos os testes unitários devem passar após a alteração.
3. **RNF03** — Build (`ng build`) deve concluir sem erros.

## Critérios de Aceite
- [ ] A interface `BuscaRolagemResponse` possui `premio: number`.
- [ ] Os mocks em `rolagem-api.service.spec.ts` e `painel-rolagem.component.spec.ts` incluem `premio`.
- [ ] O template `painel-rolagem.component.html` exibe `{{ formatarValor(resultado.premio) }}` no card "Dados da Opção Informada".
- [ ] `npm test` executa 26/26 com sucesso.
- [ ] `ng build` conclui sem erros.

## Fora do Escopo
- Alteração da API backend (assume-se que o backend já retorna o campo).
- Criação de novos componentes ou serviços.
- Alteração de estilos visuais.

## Tarefas Atômicas
1. [x] **TASK-01** Atualizar interface `BuscaRolagemResponse` — adicionar `premio: number` em `src/app/models/busca-rolagem-response.model.ts`.
2. [x] **TASK-02** Atualizar mocks de teste — incluir `premio` nos objetos mock de `rolagem-api.service.spec.ts` e `painel-rolagem.component.spec.ts`.
3. [x] **TASK-03** Atualizar template HTML — substituir placeholder "Em breve" por `{{ formatarValor(resultado.premio) }}` em `painel-rolagem.component.html`.

## Riscos e Dependências
- Nenhum. Trata-se de adição de campo simples sem impacto em outras features.

## Matriz de Rastreabilidade
| Requisito | Tasks | Arquivos | Testes |
|-----------|-------|----------|--------|
| RF01 | TASK-01 | `busca-rolagem-response.model.ts` | — |
| RF02 | TASK-02 | `rolagem-api.service.spec.ts`, `painel-rolagem.component.spec.ts` | `npm test` |
| RF03 | TASK-03 | `painel-rolagem.component.html` | Teste de componente (visual) |

## Complexidade: Pequena
## Próximo: orquestrador (via skill())
