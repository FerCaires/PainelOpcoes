# Spec: F-030 — UX do Controle de Operações

## Summary

O investidor usa `/controle-operacoes` (F-029) para lançar vendas, importar a planilha e acompanhar lucro. Hoje o cadastro ocupa a tela inteira, os resumos são só tabelas e os filtros ação/mês/ano ficam longe da tabela e dos painéis. Esta feature recolhe o cadastro sob demanda, coloca os mesmos filtros junto dos **resumos** e da **tabela de operações**, e desenha gráficos de barras a partir do `resumo` já devolvido pela API — sem recálculo no cliente e sem endpoint novo.

---

## Knowledge base references

- **Regras de apresentação aplicadas**: BR-UI-01, BR-UI-02, BR-UI-05, BR-UI-07, BR-UI-11, BR-UI-12, BR-UI-20, BR-UI-21
- **Regras desta feature**: BR-UI-29, BR-UI-30, BR-UI-31 (definidas nesta spec e gravadas no knowledge)
- **Termos de domínio utilizados**: Operação, Ação, Resumo de operações, Importação de planilha, Lucro líquido, Rendimento
- **Convenções aplicadas**: rota `/controle-operacoes` inalterada; campos JSON camelCase; datas `DD/MM/YYYY`; monetário 2 casas; rendimento mensal 3 casas; GET lista com query opcional `nomeAcao`, `ano`, `mes`; API aberta
- **Feature base**: F-029 (cadastro, importação, tabela, resumos, filtros no servidor). Esta feature **não** reabre o CRUD nem a importação.

---

## Goals

- [ ] Recolher e expandir o bloco de cadastro de lançamento para a tela começar limpa
- [ ] Exibir filtros **Ação**, **Mês** e **Ano** no painel de resumos e acima da tabela de operações, com o mesmo conjunto de valores
- [ ] Desenhar gráficos de barras (mês, ano, ativo) a partir de `resumo.porMes`, `resumo.porAno` e `resumo.porAtivo`, sem alterar números
- [ ] Preservar F-029: importação visível, formulário e importar usáveis com lista vazia/erro, GET filtrado no servidor, tabelas de resumo com os números

---

## Out of scope

- Novo endpoint ou recálculo de lucro/margem/IR/rendimento no cliente
- Filtros independentes (resumo filtrado de um jeito e tabela de outro)
- Biblioteca de gráficos de terceiros
- Cypress, autenticação, i18n
- Alterar Carteira, Rolagens, Meta de Prêmio ou Ações
- Paginação da tabela
- Gráfico de rendimento (só lucro nas barras; rendimento permanece na tabela mensal)

---

## Actors & context

**Ator principal**: investidor na tela Controle. Quer lançar só quando precisa, olhar lucro com gráfico e filtrar por ação/mês/ano tanto no acumulado quanto na lista.

**Sistema colaborador**: API F-028 já existente (`GET /api/operacoes` com query opcional). O Painel continua a mandar os mesmos query params; o `resumo` da resposta já vem recortado pelo filtro.

**Contexto**: a rota e o menu **Controle** não mudam. Sair da rota descarta se o cadastro estava aberto, os filtros e o rascunho do formulário (sem `localStorage`).

---

## Acceptance criteria

- [ ] **AC-01** — Dado que o usuário abre `/controle-operacoes`, quando a tela termina o primeiro paint, então o formulário de cadastro (Ticker, Corretora, datas, Tipo, Ativo, Strike, Prêmio, Quantidade, Custo, IR, checks e Salvar) **não** está visível. Existe um controle **Novo lançamento** (ou equivalente) para abrir o cadastro. Importar CSV permanece visível e usável.

- [ ] **AC-02** — Dado o cadastro recolhido, quando o usuário aciona o controle de abrir, então o formulário aparece completo (mesmas regras F-029 de validação e Salvar). O controle passa a permitir fechar (**Fechar cadastro** ou equivalente). Fechar sem estar em edição esconde o formulário e **não** dispara HTTP.

- [ ] **AC-03** — Dado o cadastro aberto em inclusão (não edição), quando o usuário fecha o cadastro, então o rascunho do formulário é descartado (IR volta a 0, ticker vazio, tipo vazio) e o painel fica recolhido, sem HTTP.

- [ ] **AC-04** — Dado ao menos uma linha na tabela, quando o usuário aciona uma linha, então o cadastro abre (mesmo que estivesse recolhido), o formulário preenche os persistidos incluindo Valor IR, e o modo é edição (Cancelar e Excluir visíveis, como F-029).

- [ ] **AC-05** — Dado o modo edição, quando o usuário aciona **Cancelar** ou quando um salvar/excluir conclui com sucesso, então a tela volta à inclusão **e** o cadastro fica recolhido.

- [ ] **AC-06** — Dado cadastro recolhido, quando a lista está vazia (sem filtro) ou o GET falhou, então o controle de abrir cadastro e o de importar permanecem visíveis e usáveis (F-029 AC-04 e AC-05).

- [ ] **AC-07** — Dado o painel de resumos visível (`resumo` na resposta), quando o usuário olha essa seção, então existem os filtros **Ação**, **Mês** e **Ano**, cada um com opção **Todos**, sem valor inicial obrigatório. Ação lista os `nomeAcao` distintos já vistos; filtrar não esvazia o seletor.

- [ ] **AC-08** — Dado a tabela de operações visível (ou o estado vazio da lista), quando o usuário olha essa seção, então existem os mesmos três filtros (Ação, Mês, Ano, opção Todos) acima da tabela ou da mensagem de lista vazia.

- [ ] **AC-09** — Dado um filtro alterado **em qualquer um dos dois conjuntos** (resumos ou tabela), quando a seleção muda, então os dois conjuntos mostram o mesmo valor, e a tela dispara `GET /api/operacoes` com `nomeAcao`, `ano` e `mes` só para os que não são Todos. Tabela **e** painéis de resumo (tabelas + gráficos) mostram só o conjunto da API.

- [ ] **AC-10** — Dado ação `PETR4`, ano `2026` e mês `4` escolhidos, então a chamada é `GET /api/operacoes?nomeAcao=PETR4&ano=2026&mes=4`. Dado os três em Todos, então `GET /api/operacoes` sem esses query params.

- [ ] **AC-11** — Dado `resumo.porMes` com ao menos um item, quando o resumo aparece, então há um gráfico de barras de **lucro por mês** na ordem da API, rótulos iguais a `anoMes`, valores iguais a `lucro` (sem recálculo). A tabela mensal (Mês, Lucro, Rendimento) permanece.

- [ ] **AC-12** — Dado `resumo.porAno` com ao menos um item, então há gráfico de barras de lucro por ano (rótulo = `ano`, valor = `lucro`) e a tabela anual permanece.

- [ ] **AC-13** — Dado `resumo.porAtivo` com ao menos um item, então há gráfico de barras de lucro por ativo (rótulo = `nomeAcao`, valor = `lucro`) e a tabela por ativo permanece.

- [ ] **AC-14** — Dado uma série vazia (`porMes`, `porAno` ou `porAtivo` = `[]`), então **não** há gráfico daquela série. Ausência de gráfico não é erro. Acumulado continua visível se `resumo` veio na resposta.

- [ ] **AC-15** — Dado um `lucro` negativo na série (ex.: mês com −935), quando o gráfico dessa série aparece, então a barra correspondente é distinguível das positivas (direção e/ou cor) e o valor negativo permanece visível (não é tratado como erro).

- [ ] **AC-16** — Dado os gráficos, quando um leitor de tela ou teclado percorre a seção, então cada gráfico tem nome acessível (título visível ou `aria-label`) descrevendo a série (mês, ano ou ativo). Contraste das barras e rótulos atende WCAG 2.1 AA. Viewport estreita: gráficos e tabelas com scroll horizontal se necessário (BR-UI-20).

- [ ] **AC-17** — Dado request em andamento (lista, salvar, excluir ou importar), então Salvar, Excluir, Importar e os filtros ficam desabilitados (BR-UI-11).

- [ ] **AC-18** — Dado sair e voltar na rota, então novo GET sem query; cadastro recolhido; filtros em Todos; sem `localStorage`.

---

## Data model

Nenhum campo novo na API. Espelha F-029 / F-028.

### Input (UI)

| Campo | Tipo | Obrigatório | Description |
|-------|------|-------------|-------------|
| cadastroAberto | boolean | sim (estado de tela) | Se o formulário de lançamento está visível. Inicia `false`. |
| filtroAcao | string ou Todos | não | `nomeAcao`; omitido no GET se Todos |
| filtroMes | 1–12 ou Todos | não | omitido no GET se Todos |
| filtroAno | inteiro ou Todos | não | omitido no GET se Todos |

Os dois conjuntos de filtros (resumos e tabela) são **a mesma tríade** — não há campos duplicados no estado.

### Output (já existente — usado pelos gráficos)

| Campo | Tipo | Description |
|-------|------|-------------|
| resumo.acumulado | number | Total filtrado; só formatar |
| resumo.porMes[].anoMes | string | Rótulo do gráfico mensal (`YYYY-MM`) |
| resumo.porMes[].lucro | number | Altura da barra mensal |
| resumo.porMes[].rendimento | number \| null | Só na tabela; nulo → **—** |
| resumo.porAno[].ano | number | Rótulo do gráfico anual |
| resumo.porAno[].lucro | number | Altura da barra anual |
| resumo.porAtivo[].nomeAcao | string | Rótulo do gráfico por ativo |
| resumo.porAtivo[].lucro | number | Altura da barra por ativo |
| operacoes[] | lista | Tabela F-029 inalterada |

Mensagens fixas: as mesmas de F-029 (GET falhou, lista vazia com/sem filtro, salvar/excluir/importar, confirmar exclusão). Nenhuma mensagem nova obrigatória.

---

## Edge cases & error scenarios

| Scenario | Expected behavior |
|----------|-------------------|
| Cadastro recolhido + GET ok com linhas | Tabela e resumos visíveis; formulário oculto; Importar visível |
| Cadastro recolhido + lista vazia sem filtro | Mensagem de “nunca lançou”; controle de abrir cadastro e Importar visíveis |
| Cadastro recolhido + GET falhou | Mensagem genérica de carga; abrir cadastro e Importar usáveis |
| Fechar cadastro em edição | Equivale a Cancelar: descarta rascunho, sai da edição, recolhe, sem HTTP |
| Alterar filtro nos resumos com cadastro aberto em edição | GET novo; rascunho de edição **permanece** (não fecha o cadastro) |
| Série com um único ponto | Um gráfico com uma barra |
| Série com lucro zero | Barra de altura zero ou mínima visível; valor 0 formatado |
| Filtro que devolve `operacoes=[]` e `resumo` zerado | Mensagem de filtro vazio; sem gráficos das séries vazias; filtros e cadastro (recolhido) disponíveis |
| Importar com cadastro recolhido | Fluxo F-029 intacto; cadastro continua recolhido após sucesso, a menos que o usuário o abra |
| Lucro positivo e negativo na mesma série | Eixo zero compartilhado; positivos e negativos distinguíveis |

---

## Open questions

Nenhuma.

---

## Assumptions

1. Um único trio de filtros (não dois estados independentes). Os controles aparecem duas vezes (resumos e tabela) e permanecem sincronizados.
2. Cadastro inicia recolhido para a tela nascer limpa.
3. Clicar na linha abre o cadastro em edição (senão o investidor não consegue editar com o painel fechado).
4. Gráficos **complementam** as tabelas de resumo; não as substituem.
5. Só lucro nas barras; rendimento fica na tabela mensal.
6. Sem biblioteca de gráfico; desenho vetorial no próprio Painel.
7. Sem mudança de contrato F-028: o GET filtrado já devolve `resumo` recortado.
8. Importação fica fora do bloco colapsável — carga da planilha não depende de abrir o cadastro.
9. F-029 permanece a fonte das regras de CRUD, importação, colunas da tabela e textos de erro.
