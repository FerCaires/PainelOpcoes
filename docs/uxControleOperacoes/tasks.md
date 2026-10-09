# Task plan: F-030 UX do Controle de Operações

## Summary
Total tasks: 8 | Kotlin: 0 | Python: 0 | TypeScript: 8

Não alterar: backend, `carteira`, `painel-rolagem`, `simulacao-meta-premio`, `gestao-acoes`.

## Task list

### TypeScript

- [ ] TASK-01 · Função `montarBarrasResumo`
  - **Layer**: Utils
  - **Description**: Criar `src/app/utils/montar-barras-resumo.ts` com tipos `ItemBarraResumo` (`rotulo`, `valor`) e `BarraResumo` (posição SVG + `negativo`). Função pura recebe itens, largura e altura e devolve barras + `linhaZero`. Escala pelo maior valor absoluto. Positivo sobe a partir do zero; negativo desce. Lista vazia → barras vazias.
  - **BDD scenario**:
    - Given: itens `[{ rotulo: '2025-08', valor: 100 }, { rotulo: '2025-09', valor: -50 }]` e canvas 200×100
    - When:  `montarBarrasResumo` é chamado
    - Then:  existem duas barras, a de 100 não é negativa, a de −50 é negativa, e `linhaZero` está entre o topo e a base
  - **Depends on**: —
  - **Satisfies**: AC-11, AC-12, AC-13, AC-15
  - **Complexity**: S

- [ ] TASK-02 · Spec da função de barras
  - **Layer**: Test
  - **Description**: `montar-barras-resumo.spec.ts`. Cobrir série vazia, um ponto, zero, positivo+negativo.
  - **BDD scenario**:
    - Given: lista vazia
    - When:  `montarBarrasResumo([], 200, 100)`
    - Then:  `barras` é `[]`
  - **Depends on**: TASK-01
  - **Satisfies**: AC-14, AC-15
  - **Complexity**: XS

- [ ] TASK-03 · `GraficoBarrasResumoComponent`
  - **Layer**: Component
  - **Description**: Standalone OnPush em `src/app/components/grafico-barras-resumo/`. `input()` `titulo` e `itens`. SVG `role="img"` com `aria-label` incluindo o título. Barras usam classe positiva/negativa. Rótulos e valores formatados com `formatarMonetario`.
  - **BDD scenario**:
    - Given: `titulo = 'Lucro por mês'` e um item `{ rotulo: '2025-08', valor: 45.93 }`
    - When:  o componente renderiza
    - Then:  o SVG existe, o `aria-label` contém “Lucro por mês”, e o texto contém `2025-08`
  - **Depends on**: TASK-01
  - **Satisfies**: AC-11, AC-16
  - **Complexity**: S

- [ ] TASK-04 · Cadastro recolhido por padrão
  - **Layer**: Component
  - **Description**: Em `ControleOperacoesComponent`, signal `cadastroAberto` inicia `false`. Template: botão **Novo lançamento** com `aria-expanded`; `<form>` só com `*ngIf="cadastroAberto()"`. Importação fora do `*ngIf`. Botão **Fechar cadastro** quando aberto em inclusão.
  - **BDD scenario**:
    - Given: a tela Controle acabou de carregar
    - When:  o primeiro detectChanges ocorre
    - Then:  não existe `form` no DOM, existe o botão Novo lançamento, e o botão Importar permanece
  - **Depends on**: —
  - **Satisfies**: AC-01, AC-02, AC-06
  - **Complexity**: S

- [ ] TASK-05 · Abrir/fechar cadastro e edição
  - **Layer**: Component
  - **Description**: Abrir seta `cadastroAberto true`. Fechar em inclusão ou edição chama `limparFormulario` e recolhe (sem HTTP). `selecionarOperacao` abre o cadastro. `cancelarEdicao`, sucesso de salvar e sucesso de excluir recolhem.
  - **BDD scenario**:
    - Given: a tabela tem a operação id 1 e o cadastro está recolhido
    - When:  o usuário seleciona a linha
    - Then:  o form aparece, `idEdicao` é 1 e `nomeOpcao` é o ticker da linha
  - **Depends on**: TASK-04
  - **Satisfies**: AC-02, AC-03, AC-04, AC-05
  - **Complexity**: S

- [ ] TASK-06 · Filtros nos resumos e na tabela
  - **Layer**: Component
  - **Description**: Extrair o bloco de filtros para `ng-template`. Inserir na seção de resumos e acima da tabela (ou da mensagem vazia). `mat-select` `[disabled]="emOperacao()"`. Comportamento de GET inalterado.
  - **BDD scenario**:
    - Given: GET 200 com resumo e ao menos uma operação
    - When:  a tela renderiza
    - Then:  existem dois grupos `aria-label` de filtros (resumos e operações) e alterar Ação no grupo de resumos dispara `listar({ nomeAcao })`
  - **Depends on**: TASK-04
  - **Satisfies**: AC-07, AC-08, AC-09, AC-10, AC-17
  - **Complexity**: S

- [ ] TASK-07 · Ligar os três gráficos ao `resumo`
  - **Layer**: Component
  - **Description**: Importar `GraficoBarrasResumoComponent`. Mostrar gráfico mês/ano/ativo somente se a série correspondente tiver length > 0. Mapear `lucro` sem transformar o número. Manter as três tabelas de resumo.
  - **BDD scenario**:
    - Given: `resumo.porMes` tem um item `anoMes=2025-08` `lucro=45.93` e `porAno`/`porAtivo` vazios
    - When:  a tela renderiza
    - Then:  há um gráfico cujo título refere mês, não há gráfico de ano nem de ativo, e a tabela mensal ainda mostra 45,93
  - **Depends on**: TASK-03, TASK-06
  - **Satisfies**: AC-11, AC-12, AC-13, AC-14
  - **Complexity**: S

- [ ] TASK-08 · Specs do componente Controle para F-030
  - **Layer**: Test
  - **Description**: Estender `controle-operacoes.component.spec.ts`: form ausente no load; abrir/fechar; clique na linha abre; cancelar recolhe; dois conjuntos de filtro; GET PETR4/2026/4; gráfico ausente se série vazia; filtros disabled durante request. AC-18 já coberto pelo teste de recriar o componente — ajustar para assertir cadastro recolhido e filtros Todos.
  - **BDD scenario**:
    - Given: o componente é destruído e criado de novo
    - When:  detectChanges
    - Then:  `listar` é chamado sem query, `cadastroAberto` é false e os três filtros são `null`
  - **Depends on**: TASK-05, TASK-06, TASK-07
  - **Satisfies**: AC-01..AC-18
  - **Complexity**: M

## Spec coverage matrix
| AC ID | Covered by task(s) |
|-------|--------------------|
| AC-01 | TASK-04, TASK-08 |
| AC-02 | TASK-04, TASK-05, TASK-08 |
| AC-03 | TASK-05, TASK-08 |
| AC-04 | TASK-05, TASK-08 |
| AC-05 | TASK-05, TASK-08 |
| AC-06 | TASK-04, TASK-08 |
| AC-07 | TASK-06, TASK-08 |
| AC-08 | TASK-06, TASK-08 |
| AC-09 | TASK-06, TASK-08 |
| AC-10 | TASK-06, TASK-08 |
| AC-11 | TASK-01, TASK-03, TASK-07 |
| AC-12 | TASK-01, TASK-07 |
| AC-13 | TASK-01, TASK-07 |
| AC-14 | TASK-02, TASK-07, TASK-08 |
| AC-15 | TASK-01, TASK-02 |
| AC-16 | TASK-03 |
| AC-17 | TASK-06, TASK-08 |
| AC-18 | TASK-08 |
