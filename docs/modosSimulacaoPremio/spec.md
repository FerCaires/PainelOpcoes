# Spec: F-026 — Modos de Simulação na tela Meta de Prêmio

## Summary

Estende a tela **Meta de Prêmio** (`/simulacao-meta-premio`) para o investidor escolher **como** simular: meta de prêmio (fluxo F-024), valor de **garantia** em BRL, ou **quantidade de ações**. Não há item de menu novo nem rota nova: as três perguntas compartilham seletor de ação, tipo CALL/PUT, tabela e cabeçalho. O Painel **não** calcula; consome F-025 (`GET /api/simulacao-meta-premio` com `modo`). Sair da rota continua descartando formulário, resultado e erro (BR-UI-22).

**Decisão de produto**: **não criar tela nova**. O fluxo inverso usa o mesmo universo (ticker, tipo, vencimento mensal, ATM/OTM). Uma rota extra duplicaria 90% da UI e quebraria a pergunta única do menu.

---

## Knowledge base references

- **Backend (referência)**: BR-14 a BR-31; contrato F-025
- **Apresentação**: BR-UI-01 a BR-UI-22, BR-UI-23, BR-UI-24
- **Termos**: Meta de Prêmio, Garantia, Quantidade de ações, Modo de Simulação, Notional, TipoNotional
- **Convenções**: rota `/simulacao-meta-premio`; menu "Meta de Prêmio"; camelCase; envelope 4xx só na simulação

---

## Goals

- [ ] Seletor de modo na tela existente: Meta de prêmio | Garantia | Quantidade de ações
- [ ] Exibir **apenas** o campo numérico do modo ativo; Ação e Tipo permanecem
- [ ] Disparar a API com `modo` e o parâmetro correspondente; não recalcular no cliente
- [ ] Cabeçalho do resultado ecoa Meta, Garantia ou Quantidade conforme o modo
- [ ] Manter loading, erros 4xx via `mensagem`, lista vazia, ATM/OTM, stateless e menu inalterado

---

## Out of scope

- Nova rota / novo item de menu
- Recálculo de quantidade, notional, ROI ou moneyness
- Persistência, venda, escolha de vencimento
- Cypress / autenticação
- Alterar Rolagens ou Carteira

---

## Actors & context

Investidor na tela Meta de Prêmio. Padrão ao entrar: modo **Meta de prêmio** (compatível com F-024). Troca de modo limpa resultado/erro e o campo numérico inativo.

---

## Acceptance criteria

- [ ] **AC-01** — Dado que o usuário abre `/simulacao-meta-premio`, quando a tela carrega, então existem três opções de modo: **Meta de prêmio**, **Garantia**, **Quantidade de ações**; **Meta de prêmio** inicia selecionada; os campos visíveis de entrada são Ação, Meta de prêmio e Tipo (F-024).

- [ ] **AC-02** — Dado o modo Garantia, quando o usuário seleciona esse modo, então o campo Meta some, aparece **Garantia** (BRL > 0), Tipo e Ação permanecem, **Simular** fica desabilitado até Ação + Garantia válida + Tipo.

- [ ] **AC-03** — Dado o modo Quantidade de ações, quando selecionado, então aparece **Quantidade de ações** (inteiro ≥ 100, múltiplo de 100); Meta e Garantia não aparecem.

- [ ] **AC-04** — Dado modo Meta, ação BBAS3, meta 1000, tipo CALL, quando Simular, então a chamada é `GET .../simulacao-meta-premio` com `nomeAcao=BBAS3`, `metaPremio=1000`, `tipo=CALL` e `modo=META_PREMIO`.

- [ ] **AC-05** — Dado modo Garantia com valor 30000 e CALL, quando Simular, então a query inclui `modo=GARANTIA`, `garantia=30000`, `tipo=CALL`, `nomeAcao`; **não** envia `metaPremio` nem `quantidadeAcoes`.

- [ ] **AC-06** — Dado modo Quantidade com 700, quando Simular, então a query inclui `modo=QUANTIDADE_ACOES`, `quantidadeAcoes=700`; não envia `metaPremio` nem `garantia`.

- [ ] **AC-07** — Dado HTTP 200 em modo Garantia com `garantia` no cabeçalho e `premioEstimado` nas linhas, quando o resultado é exibido, então o cabeçalho mostra **Garantia** formatada em BRL (não Meta) e a tabela permanece na ordem da API, sem recálculo.

- [ ] **AC-08** — Dado HTTP 200 em modo Quantidade com `quantidadeAcoesInformada = 700`, quando exibido, então o cabeçalho mostra **Quantidade** 700 (não Meta).

- [ ] **AC-09** — Dado HTTP 422 `GARANTIA_INVALIDA` ou `QUANTIDADE_ACOES_INVALIDA` ou 400 `MODO_INVALIDO` com `mensagem`, quando a simulação falha, então a tela exibe exatamente `mensagem` (BR-UI-13).

- [ ] **AC-10** — Dado quantidade 250 no formulário, quando o campo é preenchido, então **Simular** permanece desabilitado (validação de cliente de múltiplo de 100). Não dispara HTTP.

- [ ] **AC-11** — Dado um resultado visível, quando o usuário troca o modo, então resultado e erro são limpos (BR-UI-16).

- [ ] **AC-12** — Dado F-024 AC-01 a AC-18 no modo Meta, quando o modo é Meta de prêmio, então o comportamento anterior permanece (loading ações, erros, ATM/OTM, header, reset ao sair, scroll horizontal).

- [ ] **AC-13** — Menu e rota **não** mudam: item "Meta de Prêmio", `/simulacao-meta-premio`. Nenhum quarto item.

---

## Data model

### Formulário

| Campo | Visível | Obrigatório | Validação na tela |
|-------|---------|-------------|-------------------|
| Modo | Sempre | Sim | `META_PREMIO` \| `GARANTIA` \| `QUANTIDADE_ACOES`; default Meta |
| Ação | Sempre | Sim | Lista de `GET /api/acoes` |
| Meta de prêmio | Só modo Meta | Sim nesse modo | Número > 0 |
| Garantia | Só modo Garantia | Sim nesse modo | Número > 0 |
| Quantidade de ações | Só modo Quantidade | Sim nesse modo | Inteiro ≥ 100, múltiplo de 100 |
| Tipo | Sempre | Sim | CALL/PUT, sem default |

### Query (Simular)

Igual F-025. Serializar números com `toString()` sem locale.

### Cabeçalho exibido

| Modo | Campo em destaque no lugar de "Meta" |
|------|--------------------------------------|
| META_PREMIO | `metaPremio` monetário |
| GARANTIA | `garantia` monetário |
| QUANTIDADE_ACOES | `quantidadeAcoesInformada` inteiro |

Tabela: mesmas colunas F-024.

---

## Edge cases

| Cenário | Comportamento |
|---------|----------------|
| Troca de modo com campo preenchido | Campo inativo limpo; não enviado |
| 200 com quantidade 0 em alguma linha | Exibir 0; não é erro |
| 4xx simulação | `mensagem`; sem tabela |
| GET /acoes falha | Inalterado F-024 (genérico) |
| Viewport estreita | Seletor de modo usável; tabela com scroll |

---

## Open questions

_Nenhuma._

---

## Assumptions

1. Backend F-025 já define fórmulas e códigos novos; o Painel só formata.
2. Default Meta evita regressão da F-024.
3. Rótulos do seletor: "Meta de prêmio", "Garantia", "Quantidade de ações".
4. Subtítulo da tela passa a cobrir as três perguntas, sem novo menu.
