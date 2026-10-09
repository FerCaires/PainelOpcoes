# Task plan: F-029 Tela de Controle de Operações

## Summary
Total: 15 | TypeScript: 15

Implementado em 2026-10-03 após pedido explícito do usuário. Contrato F-028 travado.

Não alterar: `carteira`, `painel-rolagem`, `simulacao-meta-premio`, `gestao-acoes` (exceto header).

## Task list

- [x] TASK-01 · Models
  - **Layer**: Model
  - **Description**: `operacao.model.ts` (`nomeOpcao: string`), lista, request (`nomeOpcao` obrigatório, `valorIr` opcional), `resultado-importacao.model.ts`, `OperacaoErro`.
  - **Depends on**: —
  - **Satisfies**: AC-03, AC-09, AC-18
  - **Complexity**: S

- [x] TASK-02 · Mensagens
  - **Layer**: Utils
  - **Description**: Textos da spec (inclui vazio com importar, falha importar, confirmar exclusão). Spec do arquivo.
  - **Depends on**: —
  - **Satisfies**: AC-04, AC-05, AC-12, AC-19
  - **Complexity**: XS

- [x] TASK-03 · `formatarPercentual3`
  - **Layer**: Utils
  - **Description**: 3 casas; não alterar `formatarPercentual`. Spec `0.024072` → `2,407%`.
  - **Depends on**: —
  - **Satisfies**: AC-03
  - **Complexity**: XS

- [x] TASK-04 · Normalizar ativo
  - **Layer**: Utils
  - **Description**: `BVMF:bbas3` → `BBAS3`. Spec.
  - **Depends on**: —
  - **Satisfies**: AC-07
  - **Complexity**: XS

- [x] TASK-05 · `OperacaoApiService`
  - **Layer**: Service
  - **Description**: `listar(filtros?)`, `criar`, `atualizar`, `excluir`, `importar(file: File)` multipart. GET com HttpParams opcionais. GET genérico; demais 4xx `OperacaoErro`. Spec HTTP incluindo `FormData` e query.
  - **Depends on**: TASK-01, TASK-02
  - **Satisfies**: AC-02, AC-05, AC-09, AC-17, AC-19
  - **Complexity**: M

- [x] TASK-06 · Item de menu
  - **Layer**: Component
  - **Description**: `{ label: 'Controle', route: '/controle-operacoes' }` depois de Carteira. Spec do header.
  - **Depends on**: —
  - **Satisfies**: AC-01
  - **Complexity**: S

- [x] TASK-07 · Rota lazy
  - **Layer**: Routing
  - **Description**: `controle-operacoes` antes do `**`. Title `Controle de Operações`.
  - **Depends on**: TASK-08
  - **Satisfies**: AC-01
  - **Complexity**: XS

- [x] TASK-08 · Componente — carga, tabela, resumos
  - **Layer**: Component
  - **Description**: Standalone OnPush. GET inicial sem query, tabela AC-03, vazio AC-04, erro GET AC-05, resumos AC-13, **filtros AC-21..24**, `trackBy` id, scroll-x.
  - **Depends on**: TASK-05, TASK-03
  - **Satisfies**: AC-02..AC-05, AC-13, AC-14, AC-15, AC-21..AC-24
  - **Complexity**: L

- [x] TASK-09 · Componente — formulário inclusão/edição
  - **Layer**: Component
  - **Description**: Ticker required; IR default 0; prêmio > 0. POST/PUT com AC-07 e AC-16. 201/200 → GET com filtros atuais. Cancelar.
  - **Depends on**: TASK-08, TASK-04
  - **Satisfies**: AC-06..AC-11, AC-16, AC-20
  - **Complexity**: L

- [x] TASK-10 · Componente — exclusão
  - **Layer**: Component
  - **Description**: `MatDialog` → DELETE → listar.
  - **Depends on**: TASK-08
  - **Satisfies**: AC-12
  - **Complexity**: S

- [x] TASK-11 · Componente — importar CSV
  - **Layer**: Component
  - **Description**: `input type=file` accept csv; Importar disabled sem arquivo ou busy; POST importar; AC-18 resumo; AC-19 erro; GET após sucesso.
  - **Depends on**: TASK-08, TASK-05
  - **Satisfies**: AC-17, AC-18, AC-19, AC-20
  - **Complexity**: M

- [x] TASK-12 · Specs do componente
  - **Layer**: Test
  - **Description**: Salvar disabled sem ticker ou prêmio ≤ 0; POST inclui nomeOpcao e valorIr 0 se vazio; GET após 201 com filtros; mudar filtro dispara query; import FormData; 422 import mostra mensagem; dialog delete cancelado não chama DELETE.
  - **Depends on**: TASK-09, TASK-10, TASK-11
  - **Satisfies**: ACs de UI
  - **Complexity**: M
