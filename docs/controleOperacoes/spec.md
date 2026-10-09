# Spec: F-029 — Tela de Controle de Operações

## Summary

O investidor lança e acompanha vendas de opções numa planilha. Esta feature adiciona a tela **Controle** (`/controle-operacoes`): listar, cadastrar e editar à mão, excluir, ver resumos, e **importar o CSV da planilha** (carga inicial e versões atualizadas). Consome F-028. Sem recálculo no cliente (incluindo IR). Sem misturar com a tela Carteira.

---

## Knowledge base references

- Backend F-028
- BR-UI-01, BR-UI-02, BR-UI-07, BR-UI-08, BR-UI-11, BR-UI-12, BR-UI-13, BR-UI-20, BR-UI-21
- Termos: Operação, IR informado, Importação de planilha
- Rota `/controle-operacoes`; menu **Controle**; 4xx de escrita → `mensagem`; GET lista → genérico; importação 422 `PLANILHA_INVALIDA` → `mensagem`

---

## Goals

- [ ] Item de menu **Controle** e tela dedicada com header compartilhado
- [ ] Listar operações na ordem da API, com filtro por ação, mês e ano
- [ ] Cadastrar e editar à mão (ticker da opção obrigatório; Valor IR editável com default 0)
- [ ] Excluir com confirmação
- [ ] Importar CSV; reimportar versão nova; depois disso ainda permitir input manual
- [ ] Exibir resumos: acumulado, mês, ano, ativo
- [ ] Loading, vazio, erro; controles desabilitados durante request

---

## Out of scope

- Calcular IR no cliente
- Apagar ou fundir a tela Carteira
- Cadastro de corretora como entidade
- Gráficos
- Cypress, autenticação, i18n
- Recalcular margem/lucro no Angular
- Ampliar cadastro de ações para ticker de 6 caracteres
- Enviar XLSX (só CSV)

---

## Actors & context

Investidor: menu Controle → importa o CSV (primeira vez ou arquivo atualizado com IR/custo corrigidos) **e/ou** preenche o formulário → tabela e painéis atualizam. Lançamentos só manuais não são apagados por uma importação.

---

## Acceptance criteria

- [ ] **AC-01** — Dado o header, quando renderiza, então existe **Controle** apontando para `/controle-operacoes` após **Carteira**. Home, Busca de Rolagens, Meta de Prêmio, Ações e Carteira permanecem (BR-UI-08).

- [ ] **AC-02** — Dado `/controle-operacoes`, quando a tela carrega, então dispara `GET /api/operacoes` **sem** query de filtro, com indicador de loading (BR-UI-12).

- [ ] **AC-03** — Dado HTTP 200 com ao menos uma operação, quando a tabela aparece, então as colunas visíveis são: Ticker, Corretora, Data aplicação, Tipo, Ativo, Strike, Preço atual, Prêmio, Quantidade, Data finalização, Margem, Data pag. IR, Custo, Valor IR, IR pago, Lucro líquido, Exercido, Rendimento, Total. Datas `DD/MM/YYYY`. Monetários 2 casas. Rendimento % com 3 casas (0,024072 → `2,407%`). `precoAtual` nulo → **—**. IR pago / Exercido → Sim/Não. Lucro líquido negativo aparece (não é erro).

- [ ] **AC-04** — Dado HTTP 200 `operacoes=[]`, quando termina o load, então estado vazio distinto, formulário **e** controle de importar disponíveis.

- [ ] **AC-05** — Dado falha de GET (4xx, 5xx ou rede), então mensagem genérica de falha ao carregar; **não** lê `mensagem`. Importar e formulário permanecem usáveis.

- [ ] **AC-06** — Dado o formulário de inclusão, **Salvar** só habilita com: **ticker da opção** 4–12 alfanuméricos, tipo CALL ou PUT (sem default), `nomeAcao` 5–6 alfanuméricos, datas preenchidas, finalização ≥ aplicação, strike > 0, **prêmio > 0**, quantidade > 0, custo ≥ 0. Valor IR: numérico ≥ 0; vazio conta como 0. Corretora, data pag. IR, IR pago e exercido opcionais. Request (salvar, excluir, importar ou filtrar) desabilita Salvar, Excluir e Importar (BR-UI-11).

- [ ] **AC-07** — Dado ticker `itubp415w1` e ativo `bvmf:bbas3`, quando salva inclusão, então POST envia `nomeOpcao=ITUBP415W1` e `nomeAcao=BBAS3`.

- [ ] **AC-08** — Dado HTTP 201, então novo `GET /api/operacoes` **com os filtros atuais**, limpa o formulário (IR volta a 0, ticker vazio) e some o erro de cadastro.

- [ ] **AC-09** — Dado POST/PUT 400/422/409 com `mensagem`, a tela exibe exatamente `mensagem`. 5xx/rede: genérica de salvar.

- [ ] **AC-10** — Dado clique numa linha, o formulário preenche os persistidos **incluindo valor IR**. PUT envia esse IR (editável). Sucesso: GET lista e volta à inclusão.

- [ ] **AC-11** — Dado edição, **Cancelar** descarta o rascunho e volta à inclusão sem HTTP.

- [ ] **AC-12** — Dado confirmação de exclusão, `DELETE` + GET. Sem confirmar, não chama DELETE. Falha: genérica de excluir; 404 usa `mensagem` se houver.

- [ ] **AC-13** — Dado `resumo` na lista, mostra acumulado, mês, ano, ativo. Sem reordenar. Rendimento mensal nulo → **—**.

- [ ] **AC-14** — Viewport estreita: scroll horizontal nas tabelas; formulário e importar usáveis.

- [ ] **AC-15** — Sair e voltar na rota: novo GET; sem `localStorage`.

- [ ] **AC-16** — Dado valor IR vazio e data pag. IR vazia, o POST envia `valorIr=0` (ou omite o campo — a API defaulta 0) e omite `dataPagamentoIr`. Sempre envia `nomeOpcao`. Checkboxes enviam boolean.

- [ ] **AC-17** — Dado o usuário escolhe um arquivo `.csv` e confirma importar, então `POST /api/operacoes/importar` multipart campo `file`. Loading visível.

- [ ] **AC-18** — Dado HTTP 200 de importação, então a tela mostra `totalCriadas`, `totalAtualizadas`, `totalIgnoradas` e, se houver, a lista `erros` (linha + mensagem), e dispara `GET /api/operacoes` com os filtros atuais.

- [ ] **AC-19** — Dado HTTP 422 `PLANILHA_INVALIDA` (ou 4xx com `mensagem`), então exibe `mensagem`. 5xx/rede: genérica de importar. A lista anterior permanece.

- [ ] **AC-20** — Dado importação concluída, o formulário de inclusão continua disponível (input manual depois do CSV).

- [ ] **AC-21** — Dado a tela carregada, existem filtros **Ação**, **Mês** e **Ano** (todos com opção “Todos”, sem valor inicial obrigatório). Ação lista os `nomeAcao` distintos já retornados **ou** os da última lista completa; se a lista atual estiver filtrada, o seletor de ação não some. Mudar qualquer filtro dispara `GET /api/operacoes` com query `nomeAcao`, `ano` e `mes` só para os que não são “Todos”.

- [ ] **AC-22** — Dado filtro ação `PETR4`, ano `2026` e mês `4`, então a chamada é `GET /api/operacoes?nomeAcao=PETR4&ano=2026&mes=4`. Tabela e painéis de resumo mostram só o conjunto da API (não filtrar de novo no cliente).

- [ ] **AC-23** — Dado os três filtros em “Todos”, então `GET /api/operacoes` sem esses query params.

- [ ] **AC-24** — Dado GET filtrado 200 com `operacoes=[]`, então estado vazio de filtro (não o de “nunca lançou”), distinto de erro; formulário e importar permanecem.

---

## Data model

Espelha F-028. Extra na UI: arquivo CSV (não persistido no cliente).

Mensagens fixas:

| Situação | Texto |
|----------|--------|
| GET falhou | Não foi possível carregar as operações. Tente novamente. |
| Lista vazia (sem filtro) | Nenhuma operação lançada ainda. Importe a planilha ou cadastre um lançamento. |
| Lista vazia (com filtro) | Nenhuma operação para os filtros selecionados. |
| Salvar 5xx/rede | Não foi possível salvar a operação. Tente novamente. |
| Excluir 5xx/rede | Não foi possível excluir a operação. Tente novamente. |
| Importar 5xx/rede | Não foi possível importar a planilha. Tente novamente. |
| Confirmar exclusão | Excluir esta operação? |

---

## Edge cases

| Cenário | Comportamento |
|---------|----------------|
| GET ok, POST falha | Lista permanece; erro de formulário |
| IR vazio | Tratado como 0 |
| Prêmio ≤ 0 | Formulário inválido; não dispara HTTP |
| Ticker da opção vazio | Formulário inválido |
| Importar CSV com ticker vazio na 1ª linha | Backend devolve erro de linha; UI lista em `erros` (preencher BBAST194 na planilha) |
| Importar sem arquivo escolhido | Não dispara HTTP; Importar desabilitado |
| CSV + depois edição manual do IR | PUT; reimportar o mesmo CSV **sem** a correção de IR **sobrescreve** o IR pela coluna do arquivo (chave de identidade) — comportamento F-028 AC-26 |

---

## Open questions

Nenhuma.

---

## Assumptions

1. Menu **Controle** depois de Carteira.
2. Um formulário para create/edit + botão de importar na mesma tela.
3. Cliente não calcula lucro/margem/IR.
4. CSV no v1; upsert no backend; UI só envia o arquivo e mostra o relatório.
5. Exclusão: dialog Material.
6. Reimportar atualiza a chave; lançamentos só manuais (fora do arquivo) permanecem.
7. Ticker da opção obrigatório; linha histórica sem ticker = **BBAST194**.
8. Filtros no servidor (query); resumo acompanha o filtro.
