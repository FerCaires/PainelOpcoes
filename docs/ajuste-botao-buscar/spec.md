# Feature: Ajuste de Tamanho do Botão "Buscar Rolagens"

## Contexto e Objetivo
O botão "Buscar Rolagens" no componente `PainelRolagemComponent` possui altura diferente dos campos de entrada (opção) e dos comboboxes (quantidade de vencimentos e tipo de rolagem). O objetivo é ajustar o botão para ter o mesmo tamanho dos campos de formulário, mantendo a altura atual dos campos de opção e combobox, alterando apenas o botão de rolagem para melhorar a consistência visual e a experiência do usuário.

## Requisitos Funcionais
1. [RF01] - O botão "Buscar Rolagens" deve ter a mesma altura dos campos `mat-form-field` (opção, quantidade de vencimentos, tipo de rolagem)
2. [RF02] - O botão deve manter seu visual, gradiente e efeitos de hover/active
3. [RF03] - O botão deve permanecer alinhado verticalmente com os campos de formulário

## Requisitos Não-Funcionais
1. [RNF01] - A alteração deve ser apenas visual (SCSS), sem modificar a lógica do componente
2. [RNF02] - Deve ser compatível com todos os navegadores modernos (Chrome, Firefox, Safari, Edge)
3. [RNF03] - Não deve impactar a responsividade do layout em dispositivos móveis

## Critérios de Aceite
- [ ] O botão "Buscar Rolagens" tem a mesma altura dos campos de formulário
- [ ] O botão está perfeitamente alinhado verticalmente com os campos
- [ ] Os efeitos visuais (gradiente, hover, active) continuam funcionando
- [ ] O layout responsivo continua funcionando em mobile
- [ ] Não há quebra de layout em diferentes resoluções
- [ ] Testes unitários passam (ng test)
- [ ] Build produção passa (ng build)

## Fora do Escopo
- Alteração de cores ou gradientes do botão
- Alteração de padding/margin dos campos de formulário
- Alteração de outros componentes ou páginas
- Mudança de comportamento funcional do botão

## Tarefas Atômicas
1. [ ] [TASK-01] Ajustar altura do botão no SCSS — Modificar `painel-rolagem.component.scss` para que o botão tenha `height: auto` ou `min-height` equivalente à altura dos `mat-form-field`. Critério de done: botão visualmente alinhado com campos, sem quebra de layout.
2. [ ] [TASK-02] Validar responsividade — Testar em diferentes resoluções (desktop, tablet, mobile) para garantir que o ajuste não quebra o layout. Critério de done: layout funciona em todas as resoluções.
3. [ ] [TASK-03] Atualizar testes unitários — Adicionar/atualizar testes em `painel-rolagem.component.spec.ts` para validar a altura do botão. Critério de done: testes passam com `npm test`.

## Riscos e Dependências
- Risco: Diferentes navegadores podem renderizar `mat-form-field` com alturas ligeiramente diferentes -> Mitigação: Testar em Chrome, Firefox, Safari e Edge; usar valores relativos (em, %) em vez de px fixos
- Dependência: Nenhuma dependência externa; alteração isolada ao componente

## Matriz de Rastreabilidade
| Requisito | Tasks | Arquivos | Testes |
|-----------|-------|----------|--------|
| RF01 | TASK-01, TASK-02 | `painel-rolagem.component.scss` | `painel-rolagem.component.spec.ts` |
| RF02 | TASK-01 | `painel-rolagem.component.scss` | Validação visual |
| RF03 | TASK-01, TASK-02 | `painel-rolagem.component.scss` | Validação visual |
| RNF01 | TASK-01 | `painel-rolagem.component.scss` | N/A |
| RNF02 | TASK-02 | `painel-rolagem.component.scss` | Testes manuais em navegadores |
| RNF03 | TASK-02 | `painel-rolagem.component.scss` | Testes responsivos |

## Complexidade: Pequena
## Próximo: orquestrador (via skill())
