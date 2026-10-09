# Spec: F-024 — Tela de Simulação de Meta de Prêmio

## Summary

Esta feature adiciona, no Painel de Opções, uma tela dedicada e um item no menu do header para o investidor simular quanto de cobertura (ações ou caixa) precisa para extrair uma meta de prêmio mensal vendendo opções cobertas de um único ticker. A pergunta de negócio é: "Quantas ações preciso ter (ou quanto capital em caixa) para extrair R$ X de prêmio neste mês vendendo opções cobertas de BBAS3?". O backend F-023 já calcula quantidade, notional, ROI e moneyness. O Painel apenas coleta Ação, Meta de prêmio e Tipo, chama `GET /api/simulacao-meta-premio` (e `GET /api/acoes` para o seletor) e exibe cabeçalho + tabela, sem persistir, sem recalcular e sem executar a venda.

---

## Knowledge base references

- **Regras de negócio aplicadas (backend, por referência)**: BR-14, BR-15, BR-16, BR-21, BR-22, BR-23, BR-27
- **Regras de apresentação aplicadas**: BR-UI-01, BR-UI-02, BR-UI-03, BR-UI-04, BR-UI-05, BR-UI-06, BR-UI-07, BR-UI-08, BR-UI-09, BR-UI-10, BR-UI-11, BR-UI-12, BR-UI-13, BR-UI-14, BR-UI-15, BR-UI-16, BR-UI-17, BR-UI-18, BR-UI-19, BR-UI-20, BR-UI-21, BR-UI-22
- **Termos de domínio utilizados**: Ação, Opção, Call, Put, Strike, Prêmio (valorPremio), Vencimento, Tipo (CALL/PUT), Modalidade, Preço Spot (precoSpot), Notional, TipoNotional, Moneyness (ITM/ATM/OTM), ROI da Operação, ROI Anualizado Simples, Meta de Prêmio, Simulação, Landing
- **Convenções aplicadas**: rota kebab-case `/simulacao-meta-premio`; item de menu "Meta de Prêmio"; campos JSON camelCase; códigos de erro SCREAMING_SNAKE_CASE; datas de API `YYYY-MM-DD` exibidas `DD/MM/YYYY`; corpo de erro `{ timestamp, status, erro, mensagem, detalhes[] }`; API e Painel abertos (sem autenticação)

---

## Goals

- [ ] Disponibilizar tela dedicada (não seção da landing) na rota `/simulacao-meta-premio`, com o header compartilhado
- [ ] Incluir o item de menu "Meta de Prêmio" sem remover nem alterar os itens existentes
- [ ] Permitir informar Ação (seletor alimentado por `GET /api/acoes`), Meta de prêmio (BRL > 0) e Tipo (CALL ou PUT, sem valor padrão) e disparar a simulação
- [ ] Exibir o cabeçalho da resposta e a tabela completa de opções na ordem recebida, apenas formatando valores (BR-UI-05, BR-UI-06)
- [ ] Tratar lista vazia de sucesso (BR-27), erros 4xx da simulação via `mensagem`, falha de rede/500 da simulação e qualquer falha de `GET /api/acoes` com texto genérico, loading (incluindo a carga inicial de ações) e ausência de persistência
- [ ] Atender layout responsivo e WCAG 2.1 AA; na implementação, invocar **frontend-design** para hierarquia visual, destaque de ITM, espaçamento e tabela

---

## Out of scope

- Recalcular no cliente quantidade, notional, prêmio estimado, ROI, moneyness ou percentual vs spot
- Persistência da meta ou do resultado (local ou remoto)
- Executar venda ou adicionar opções à Carteira a partir desta tela
- Escolher vencimento; incluir SEMANAIS; simular vários tickers de uma vez
- Autenticação / autorização
- Conteúdo educativo novo na landing
- Disparar ou exibir o job de cotações nesta tela
- Alterar comportamento das telas de Rolagens ou Carteira, exceto o item novo no menu compartilhado
- Paginação da lista de opções (a API devolve a lista completa)

---

## Actors & context

**Ator principal**: investidor/trader no navegador, já usuário do Painel (Home, Busca de Rolagens, Carteira). Define meta mensal em BRL, escolhe a ação cadastrada e se a estratégia é venda coberta de CALL ou de PUT.

**Sistema colaborador**: API CarteiraOpcoes (F-023). Seleciona o próximo vencimento MENSAL ABERTO, calcula cobertura e devolve cabeçalho + lista. O Painel não escolhe vencimento (BR-23).

**Contexto de navegação**: a tela entra pelo menu "Meta de Prêmio" ou pela URL `/simulacao-meta-premio`. O header permanece visível. Sair da rota descarta resultado, erro e os três campos do formulário (BR-UI-22).

---

## Acceptance criteria

- [ ] **AC-01** — Dado que o usuário está em qualquer tela que exibe o header compartilhado, quando o menu é renderizado, então existe o item **Meta de Prêmio** além dos itens já existentes **Home**, **Busca de Rolagens** e **Carteira** (nenhum desses três é removido ou renomeado). Quando o usuário aciona **Meta de Prêmio**, então a aplicação navega para `/simulacao-meta-premio` e a tela de simulação é exibida.

- [ ] **AC-02** — Dado que o usuário abriu `/simulacao-meta-premio`, quando a tela carrega, então o formulário contém exatamente três campos de entrada: **Ação** (seletor), **Meta de prêmio** (valor em BRL) e **Tipo** (CALL ou PUT), nesta ordem funcional. O Tipo **não** inicia selecionado (BR-UI-18). O botão **Simular** permanece desabilitado enquanto Ação não estiver escolhida, ou `metaPremio` não for um número maior que zero, ou Tipo não estiver escolhido, ou `GET /api/acoes` estiver em andamento, ou uma requisição de simulação estiver em andamento (BR-UI-11).

- [ ] **AC-03** — Dado que `GET /api/acoes` responde 200 com ao menos uma ação (ex.: `nomeAcao = "BBAS3"`, `nomeCompleto = "Banco do Brasil S.A."`), quando a tela de simulação termina de carregar as ações, então o seletor lista cada ação mostrando ticker e nome completo (BR-UI-19) e o usuário consegue selecionar `BBAS3`.

- [ ] **AC-04** — Dado que `GET /api/acoes` responde 200 com lista vazia, quando a tela termina o carregamento das ações, então o seletor não oferece opções selecionáveis, é exibida a mensagem **"Nenhuma ação disponível para simulação."** e o botão **Simular** permanece desabilitado.

- [ ] **AC-05** — Dado que o usuário abriu `/simulacao-meta-premio` e `GET /api/acoes` ainda está em andamento, quando a tela é exibida, então aparece o mesmo tipo de indicador de carregamento da simulação (BR-UI-12), o botão **Simular** permanece desabilitado e **não** há botão extra de nova tentativa. Dado que `GET /api/acoes` falha por HTTP 4xx, HTTP 5xx **ou** rede, quando a carga termina, então é exibida somente a mensagem genérica **"Não foi possível carregar as ações. Tente novamente."** (a UI **não** usa o campo `mensagem` nem o envelope 4xx desta chamada), o seletor não fica em estado indefinido e **Simular** permanece desabilitado. O trecho "Tente novamente" é orientação para o usuário recarregar a rota; não há controle de retry na tela.

- [ ] **AC-06** — Dado que o seletor contém `BBAS3`, o usuário informou meta `1000`, tipo `CALL` e a API responde HTTP 200 para `GET /api/simulacao-meta-premio?nomeAcao=BBAS3&metaPremio=1000&tipo=CALL` com cabeçalho `nomeAcao = "BBAS3"`, `nomeCompleto = "Banco do Brasil S.A."`, `precoSpot = 42.13`, `metaPremio = 1000`, `tipo = "CALL"`, `dataVencimento` (YYYY-MM-DD), `diasAteVencimento` inteiro e `quantidadeOperacoes ≥ 1`, e a lista inclui a opção `BBAS3J423` com `quantidadeAcoes = 700`, `notional = 29491.00`, `tipoNotional = "ACOES"`, `moneyness = "ITM"` e `avisoExercicio = "No strike ITM, o prêmio é maior, porém há maior chance de exercício."`, quando o usuário aciona **Simular**, então: (a) o cabeçalho do resultado exibe nomeAcao, nomeCompleto, precoSpot, metaPremio, tipo, dataVencimento em `DD/MM/YYYY`, diasAteVencimento e quantidadeOperacoes; (b) a tabela contém todas as colunas do item da API, na ordem recebida; (c) a linha de `BBAS3J423` mostra quantidade 700, notional com 2 casas, tipo de notional **"Ações"**; (d) a linha ITM está visualmente destacada e o texto de `avisoExercicio` é exibido (BR-UI-14). O cliente não altera os números recebidos (BR-UI-05).

- [ ] **AC-07** — Dado que a API responde HTTP 200 a uma simulação `tipo=PUT` com ao menos uma opção cuja `tipoNotional = "CAIXA"`, quando o resultado é exibido, então essa linha mostra o rótulo **"Caixa"** (não o código `CAIXA`) (BR-UI-04 / BR-16).

- [ ] **AC-08** — Dado que a API responde HTTP 200 com cabeçalho preenchido, `quantidadeOperacoes = 0` e `opcoes = []` (BR-27), quando a simulação termina, então o cabeçalho do resultado permanece visível, **não** é tratado como erro (sem a mensagem genérica de falha) e é exibido o texto **"Nenhuma opção disponível para os parâmetros informados neste vencimento."**

- [ ] **AC-09** — Dado que a API responde HTTP 404 com `erro = "ACAO_NAO_ENCONTRADA"` e um campo `mensagem` preenchido, quando a simulação termina, então a tela exibe exatamente o valor de `mensagem`, não exibe tabela de resultado e reabilita **Simular**.

- [ ] **AC-10** — Dado que a API responde HTTP 422 com `erro = "META_PREMIO_INVALIDA"` e `mensagem` preenchida, quando a simulação termina, então a tela exibe exatamente `mensagem` (BR-UI-13).

- [ ] **AC-11** — Dado que a API responde HTTP 422 com `erro = "PRECO_SPOT_INDISPONIVEL"` e `mensagem` preenchida, quando a simulação termina, então a tela exibe exatamente `mensagem`.

- [ ] **AC-12** — Dado que a API responde HTTP 422 com `erro = "VENCIMENTO_MENSAL_NAO_ENCONTRADO"` e `mensagem` preenchida, quando a simulação termina, então a tela exibe exatamente `mensagem`.

- [ ] **AC-13** — Dado que a simulação falha por indisponibilidade de rede **ou** HTTP 500, quando a tentativa termina, então a tela exibe **"Não foi possível concluir a simulação. Tente novamente."** e não depende do corpo técnico da resposta.

- [ ] **AC-14** — Dado que o formulário está válido, quando o usuário aciona **Simular**, então: (a) um indicador de carregamento fica visível; (b) **Simular** permanece desabilitado durante a requisição; (c) resultado e erro anteriores são limpos **antes** de pintar o novo resultado ou o novo erro (BR-UI-12, BR-UI-16); (d) ao concluir (sucesso ou falha), o indicador some e o botão volta a seguir a regra de validade do formulário. O mesmo tipo de indicador (BR-UI-12) é o usado na carga inicial de `GET /api/acoes` (AC-05).

- [ ] **AC-15** — Dado um resultado 200 com `dataVencimento = "2026-10-16"`, `precoSpot = 42.13`, `percentualVsSpot = -0.0028`, `roiOperacao = 0.0363` e `roiAnualizadoSimples = 0.4356`, quando os valores são apresentados, então a data aparece como **16/10/2026**, campos monetários com 2 casas decimais, `percentualVsSpot` como **−0,28%**, `roiOperacao` como **3,63%** e `roiAnualizadoSimples` como **43,56%** (BR-UI-01, BR-UI-02, BR-UI-03). `tipoNotional` segue AC-06/AC-07.

- [ ] **AC-16** — Dado que o usuário está em `/simulacao-meta-premio`, quando a tela é exibida, então o header compartilhado está visível no topo (mesma navegação das demais features) (BR-UI-07).

- [ ] **AC-17** — Dado que o usuário preencheu Ação, Meta de prêmio e Tipo e obteve um resultado (ou um erro) na simulação, quando navega para outra rota (ex.: Home ou Busca de Rolagens) e depois volta a `/simulacao-meta-premio`, então resultado e erro anteriores **não** reaparecem **e** os três campos do formulário voltam ao estado inicial: Ação sem seleção, Meta de prêmio vazia e Tipo sem seleção (tela stateless, BR-UI-22 / BR-14). `GET /api/acoes` é disparado de novo ao entrar (BR-UI-17).

- [ ] **AC-18** — Dado que o usuário acessa a tela em viewport estreita (ex.: largura 375px) e depois em desktop, quando há tabela de resultado, então no mobile a tabela é utilizável via **scroll horizontal** (sem perder colunas) e no desktop as colunas permanecem visíveis. O formulário e o menu são usáveis por teclado (Tab percorre campos, botão e links; foco visível; Enter dispara **Simular** somente se o formulário estiver válido). Contraste de textos atende WCAG 2.1 AA (mínimo 4,5:1) (BR-UI-20).

---

## Data model

A tela **não** possui modelo persistido. Os dados abaixo são apenas contrato de entrada do usuário, contrato da API consumida e mapeamento de exibição.

### Input

#### Formulário (entrada do usuário)

| Campo | Tipo | Obrigatório | Regras de validação na tela |
|-------|------|-------------|-----------------------------|
| Ação | escolha em lista (`nomeAcao`) | Sim | Deve ser uma ação retornada por `GET /api/acoes` |
| Meta de prêmio | decimal (BRL) | Sim | Número maior que 0 |
| Tipo | enumeração | Sim | `CALL` ou `PUT`; sem valor inicial |

#### `GET /api/acoes` (carga ao entrar na tela)

Sem parâmetros. Cada item usado pelo seletor:

| Campo | Tipo | Obrigatório | Uso na UI |
|-------|------|-------------|-----------|
| `nomeAcao` | string | Sim | Valor enviado depois como `nomeAcao`; parte visível do seletor |
| `nomeCompleto` | string | Sim | Parte visível do seletor (BR-UI-19) |
| `precoSpot` | decimal \| nulo | Não | Não é critério de filtro do seletor; o spot da simulação vem da resposta de simulação |

#### `GET /api/simulacao-meta-premio` (disparo do botão Simular)

| Query | Tipo | Obrigatório | Origem |
|-------|------|-------------|--------|
| `nomeAcao` | string | Sim | Ação selecionada |
| `metaPremio` | decimal > 0 | Sim | Campo Meta de prêmio |
| `tipo` | `CALL` \| `PUT` (maiúsculas) | Sim | Campo Tipo |

Exemplo: `GET /api/simulacao-meta-premio?nomeAcao=BBAS3&metaPremio=1000&tipo=CALL`

A tela só dispara esta chamada com os três campos válidos (AC-02).

### Output

#### Cabeçalho da simulação (exibir todos)

| Campo API | Tipo | Apresentação |
|-----------|------|--------------|
| `nomeAcao` | string | Ticker |
| `nomeCompleto` | string | Nome da empresa |
| `precoSpot` | decimal | Monetário, 2 casas (BR-UI-02) |
| `metaPremio` | decimal | Monetário, 2 casas |
| `tipo` | string | `CALL` ou `PUT` como recebido |
| `dataVencimento` | string (`YYYY-MM-DD`) | `DD/MM/YYYY` (BR-UI-01) |
| `diasAteVencimento` | inteiro | Número inteiro |
| `quantidadeOperacoes` | inteiro | Número inteiro (0 na lista vazia) |
| `opcoes` | array | Fonte da tabela; pode ser `[]` |

#### Colunas da tabela (todas, nesta ordem — ordem da API)

| Campo API | Rótulo sugerido | Apresentação |
|-----------|-----------------|--------------|
| `nome` | Opção | Texto |
| `tipo` | Tipo | `CALL` / `PUT` |
| `modalidade` | Modalidade | `AMERICANA` / `EUROPEIA` |
| `strike` | Strike | Monetário, 2 casas |
| `valorPremio` | Prêmio | Monetário, 2 casas |
| `percentualVsSpot` | % vs spot | Razão × 100, 2 casas, sufixo `%` (BR-UI-03) |
| `moneyness` | Moneyness | `ITM` / `ATM` / `OTM`; ITM com destaque (BR-UI-14) |
| `avisoExercicio` | Aviso | Texto BR-22 se ITM; vazio se nulo |
| `dataVencimento` | Vencimento | `DD/MM/YYYY` |
| `diasAteVencimento` | Dias até vencimento | Inteiro |
| `quantidadeAcoes` | Quantidade de ações | Inteiro |
| `notional` | Notional | Monetário, 2 casas |
| `tipoNotional` | Tipo de notional | `ACOES` → "Ações"; `CAIXA` → "Caixa" |
| `premioEstimado` | Prêmio estimado | Monetário, 2 casas |
| `roiOperacao` | ROI da operação | Percentual BR-UI-03 |
| `roiAnualizadoSimples` | ROI anualizado | Percentual BR-UI-03 |

Rótulos visuais finais (tamanho, abreviação, tooltip) são refinados por **frontend-design** na implementação, sem omitir coluna nem reordenar.

#### Envelope 4xx da API (somente simulação)

Corpo padrão `{ timestamp, status, erro, mensagem, detalhes[] }` nas falhas 4xx de `GET /api/simulacao-meta-premio`. A UI **não** consome este envelope em `GET /api/acoes` (AC-05).

| Campo | Tipo | Uso na UI |
|-------|------|-----------|
| `timestamp` | string | Não exibido |
| `status` | inteiro HTTP | Não exibido |
| `erro` | string (`SCREAMING_SNAKE_CASE`) | Não exibido ao usuário; identifica o caso nos ACs (AC-09 a AC-12) |
| `mensagem` | string | Texto visível nas falhas 4xx da simulação (BR-UI-13). Se ausente, usar a mensagem genérica de simulação |
| `detalhes` | array | Não exibido |

#### Mensagens fixas da UI

| Situação | Texto |
|----------|--------|
| `GET /api/acoes` lista vazia | Nenhuma ação disponível para simulação. |
| `GET /api/acoes` qualquer falha (4xx, 5xx ou rede) | Não foi possível carregar as ações. Tente novamente. |
| Simulação 200 com `opcoes = []` | Nenhuma opção disponível para os parâmetros informados neste vencimento. |
| Simulação rede/500 | Não foi possível concluir a simulação. Tente novamente. |
| Simulação 4xx com corpo padrão | Campo `mensagem` da API (se ausente, usar a mensagem genérica de simulação) |

---

## Edge cases & error scenarios

| Cenário | Comportamento esperado |
|---------|------------------------|
| Formulário incompleto (falta ação, meta ou tipo) | **Simular** desabilitado; nenhuma chamada à simulação |
| `metaPremio` = 0, negativo ou não numérico | **Simular** desabilitado (validação de cliente). Se a API mesmo assim devolver 422 `META_PREMIO_INVALIDA`, exibir `mensagem` (AC-10) |
| `GET /api/acoes` 200 com itens | Popular seletor (AC-03) |
| `GET /api/acoes` 200 vazio | Mensagem de lista vazia; **Simular** desabilitado (AC-04) |
| `GET /api/acoes` em andamento | Indicador de carregamento (mesmo tipo da simulação, BR-UI-12); **Simular** desabilitado; sem botão de retry (AC-05) |
| `GET /api/acoes` 4xx, 5xx ou rede | Mensagem genérica de AC-05; a UI **não** usa `mensagem` nem o envelope 4xx; **Simular** desabilitado; "Tente novamente" é só orientação para recarregar a rota (AC-05) |
| Ação listada com `precoSpot` nulo ou ≤ 0 | Ação permanece no seletor; a simulação pode retornar 422 `PRECO_SPOT_INDISPONIVEL` → exibir `mensagem` |
| HTTP 200 com opções | Cabeçalho + tabela na ordem da API |
| HTTP 200 com `opcoes = []` (BR-27) | Cabeçalho + mensagem de ausência; não é erro (AC-08) |
| HTTP 404 `ACAO_NAO_ENCONTRADA` | Exibir `mensagem` (AC-09) |
| HTTP 422 `META_PREMIO_INVALIDA` | Exibir `mensagem` (AC-10) |
| HTTP 422 `PRECO_SPOT_INDISPONIVEL` | Exibir `mensagem` (AC-11) |
| HTTP 422 `VENCIMENTO_MENSAL_NAO_ENCONTRADO` | Exibir `mensagem` (AC-12) |
| HTTP 400 (`PARAMETRO_AUSENTE`, `PARAMETRO_TIPO_INVALIDO`, `TIPO_INVALIDO`) | Não esperado após validação de cliente; se ocorrer, exibir `mensagem` |
| HTTP 500 ou falha de rede na simulação | Mensagem genérica (AC-13) |
| Nova simulação com resultado/erro anterior visível | Limpar ambos ao disparar (AC-14) |
| Linha ITM | Destaque + `avisoExercicio` (AC-06) |
| Linha ATM ou OTM | Sem aviso; `avisoExercicio` nulo não mostra texto de exercício |
| Navegação para outra rota e retorno | Resultado, erro e os três campos do formulário (Ação, Meta de prêmio, Tipo) voltam ao estado inicial; recarregar ações (AC-17) |
| Viewport mobile com muitas colunas | Scroll horizontal; nenhuma coluna omitida por padrão (AC-18) |
| Teclado | Tab, foco visível, Enter só submete se válido (AC-18) |

---

## Open questions

_Nenhuma. As decisões de produto desta tela (menu, rota, campos, formatação, erros, lista vazia, ausência de persistência e de escolha de vencimento) foram fechadas antes desta spec. W-01 a W-04 do Gate 1 estão fechados._

---

## Assumptions

1. **Backend F-023 disponível**: `GET /api/simulacao-meta-premio` e `GET /api/acoes` (com `precoSpot`, `nomeAcao`, `nomeCompleto`) já seguem o contrato descrito. Esta spec não redefine fórmulas nem códigos de erro.
2. **Frontend não calcula**: qualquer divergência numérica entre tela e API é defeito de formatação ou de mapeamento, não de regra de negócio local (BR-UI-05).
3. **frontend-design na implementação**: layout, hierarquia tipográfica, forma do destaque ITM, densidade da tabela, menu em viewport estreita desta tela e tokens visuais são definidos pela skill **frontend-design** (e detalhados pelo Architect). A spec exige que ITM seja distinguível e que o aviso seja lido, sem prescrever cor ou componente.
4. **Menu compartilhado**: o novo item é acrescentado ao header já usado em Home, Rolagens e Carteira. A ordem visual entre os itens é decisão de apresentação (frontend-design), desde que AC-01 seja atendido.
5. **Tipo enviado em maiúsculas**: a UI envia `CALL` ou `PUT` exatamente assim.
6. **Separador decimal monetário**: 2 casas são obrigatórias. O detalhe de milhar (`29.491,00` vs `29491.00`) é decisão de apresentação, desde que percentual siga o exemplo 0.0363 → 3,63%.
7. **Sem escolha de vencimento**: a data exibida é a devolvida pela API (próximo MENSAL ABERTO, BR-23).
8. **Sem autenticação**, alinhado ao restante do Painel e à API aberta (BR-UI-21).
9. **Idioma único pt-BR**; sem i18n.
10. **Integração HTTP** (cliente, URLs de ambiente, tratamento de Observable) é detalhe de arquitetura; a spec só exige os caminhos, query params e o comportamento visível acima.
11. **Testes**: critérios acima são binários e automatizáveis com a API simulada (não dependem do cálculo real do backend além dos payloads de exemplo).
