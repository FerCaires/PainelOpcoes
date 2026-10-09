# Spec: F-027 — Tela de Gestão de Ações

## Summary

O universo de ações cadastradas na API (`GET/POST /api/acoes`) alimenta o seletor da **Meta de Prêmio** e o job/atualização de cotações que popula opções usadas na **Busca de Rolagens**. Hoje o investidor só vê as ações que já existiam na base (historicamente as que tinham opções cadastradas) e não consegue ampliar esse universo pelo Painel.

Esta feature adiciona uma **tela dedicada** para **incluir** ações (ticker + nome da empresa) e **disparar manualmente** a atualização de cotações. Não há exclusão de ação na interface. O Painel não cria endpoint novo: consome o CRUD e o `POST /api/atualizacao/executar` já existentes no backend.

**Decisão de produto**: tela própria no menu (não controles inline em Rolagem/Meta). Inclusão apenas — exclusão ficou fora de escopo de propósito, para não apagar opções em cascata (BR-08). Atualização de cotações é botão explícito, não automática no cadastro.

---

## Knowledge base references

- **Backend (referência)**: BR-08, BR-11, BR-26; contrato já existente de `GET/POST /api/acoes` e `POST /api/atualizacao/executar`
- **Apresentação**: BR-UI-01, BR-UI-02, BR-UI-07, BR-UI-08, BR-UI-11, BR-UI-12, BR-UI-13, BR-UI-20, BR-UI-21, BR-UI-25 a BR-UI-28
- **Termos**: Ação, Preço Spot, Atualização de cotações
- **Convenções**: rota `/acoes`; menu "Ações"; JSON camelCase; envelope 4xx `{ timestamp, status, erro, mensagem, detalhes[] }` no POST de cadastro

---

## Goals

- [ ] Permitir cadastrar uma ação nova (ticker de 5 caracteres + nome da empresa) pelo Painel
- [ ] Listar as ações já cadastradas (ticker, nome, preço spot, última atualização)
- [ ] Disparar a atualização de cotações de **todas** as ações cadastradas por um botão na mesma tela
- [ ] Fazer a ação nova aparecer no seletor da Meta de Prêmio na próxima visita a essa tela (mesmo `GET /api/acoes`)
- [ ] Não oferecer exclusão de ação na UI

---

## Out of scope

- Exclusão, edição de nome ou desativação de ação
- Ticker com 6 caracteres (ex.: SANB11) — a API atual exige exatamente 5
- Endpoint novo de atualização por uma única ação
- Disparo automático de cotações ao cadastrar
- Alterar formulários de Rolagem ou Meta de Prêmio (além do efeito colateral de `GET /acoes` mais completo)
- Cypress, autenticação, i18n
- Recálculo de simulação ou rolagem no cliente

---

## Actors & context

Investidor no Painel. Quer acompanhar um ticker que ainda não está na base (ex.: VALE3) para depois simular meta de prêmio e, após atualizar cotações, buscar rolagens das opções daquele papel.

Fluxo: abre **Ações** → cadastra ticker + nome → (opcional) clica **Atualizar cotações** → vai à Meta de Prêmio / Rolagens com o universo ampliado.

---

## Acceptance criteria

- [ ] **AC-01** — Dado o menu principal, quando a tela renderiza o header, então existe o item **Ações** apontando para `/acoes`; os itens Home, Busca de Rolagens, Meta de Prêmio e Carteira permanecem com os mesmos rótulos e rotas (BR-UI-08).

- [ ] **AC-02** — Dado que o usuário abre `/acoes`, quando a tela carrega, então dispara `GET /api/acoes` e exibe a lista com ticker, nome completo, preço spot e data/hora de atualização.

- [ ] **AC-03** — Dado `GET /api/acoes` com HTTP 200 e lista não vazia, quando a tabela é exibida, então cada linha mostra `nomeAcao`, `nomeCompleto`, `precoSpot` formatado em BRL com 2 casas se não nulo (BR-UI-02) ou um marcador de ausência se nulo, e a data de atualização em formato legível.

- [ ] **AC-04** — Dado `GET /api/acoes` com HTTP 200 e `[]`, quando a tela termina de carregar, então aparece um estado vazio distinto (não erro) e o formulário de inclusão permanece disponível.

- [ ] **AC-05** — Dado qualquer falha em `GET /api/acoes` (4xx, 5xx ou rede), quando a carga falha, então a tela exibe a mensagem genérica de falha ao carregar ações e **não** lê o campo `mensagem` do envelope (BR-UI-13).

- [ ] **AC-06** — Dado o formulário de inclusão, quando o usuário preenche ticker e nome da empresa, então **Adicionar** só habilita se o ticker tiver exatamente 5 caracteres alfanuméricos e o nome tiver entre 4 e 50 caracteres (BR-UI-11).

- [ ] **AC-07** — Dado ticker digitado em minúsculas (ex.: `vale3`) e nome válido, quando o usuário confirma a inclusão, então a chamada é `POST /api/acoes` com corpo `{ "nomeAcao": "VALE3", "nomeCompleto": "<nome informado>" }` (ticker em maiúsculas).

- [ ] **AC-08** — Dado HTTP 201 no cadastro, quando a resposta chega, então a nova ação aparece na lista sem recarregar a rota, o formulário é limpo e não permanece mensagem de erro de cadastro.

- [ ] **AC-09** — Dado HTTP 409 `ACAO_DUPLICADA` com envelope padrão, quando o cadastro falha, então a tela exibe exatamente o campo `mensagem` (BR-UI-28). A lista existente não é apagada.

- [ ] **AC-10** — Dado HTTP 400 ou 422 no `POST /api/acoes` com `mensagem` no envelope, quando o cadastro falha, então a tela exibe exatamente `mensagem`. Se `mensagem` estiver ausente, usa mensagem genérica de falha ao cadastrar.

- [ ] **AC-11** — Dado falha de rede ou HTTP 500 no `POST /api/acoes`, quando o cadastro falha, então a tela exibe mensagem genérica de falha ao cadastrar (não stack, não corpo técnico).

- [ ] **AC-12** — Dado a tela de Ações, quando o usuário aciona **Atualizar cotações**, então dispara `POST /api/atualizacao/executar` **sem** corpo; há indicador de carregamento e os botões Adicionar e Atualizar ficam desabilitados enquanto a requisição estiver em andamento (BR-UI-11, BR-UI-12, BR-UI-27).

- [ ] **AC-13** — Dado HTTP 200 no `POST /api/atualizacao/executar` com totais, quando a atualização conclui, então a tela exibe um resumo com `totalRecuperadas`, `totalAtualizadas`, `totalCadastradas` e `totalNaoAtualizadas`, e dispara novamente `GET /api/acoes` para refletir `precoSpot` e data de atualização.

- [ ] **AC-14** — Dado falha de rede ou HTTP 5xx no `POST /api/atualizacao/executar`, quando a atualização falha, então a tela exibe mensagem genérica de falha ao atualizar cotações; a lista de ações permanece a última carregada com sucesso.

- [ ] **AC-15** — Dado a tela de Ações, quando o usuário procura um controle de excluir/remover ação, então **não** existe botão, ícone nem ação de exclusão (BR-UI-26).

- [ ] **AC-16** — Dado que uma ação recém-cadastrada já está na API, quando o usuário navega para `/simulacao-meta-premio`, então o seletor de ação inclui o novo ticker (comportamento F-024 AC de carga `GET /acoes`; esta feature não altera o formulário da simulação).

- [ ] **AC-17** — Dado a rota `/acoes`, quando o usuário sai e volta, então a lista é recarregada via `GET /api/acoes`; não há persistência no navegador.

- [ ] **AC-18** — Dado viewport estreita, quando a lista tem várias colunas, então a tabela permite scroll horizontal e o formulário permanece usável (BR-UI-20).

---

## Data model

### Formulário de inclusão

| Campo | Visível | Obrigatório | Validação na tela |
|-------|---------|-------------|-------------------|
| Ticker (`nomeAcao`) | Sim | Sim | Exatamente 5 caracteres alfanuméricos; enviado em maiúsculas |
| Nome da empresa (`nomeCompleto`) | Sim | Sim | 4 a 50 caracteres |

### Lista (origem `GET /api/acoes`)

| Campo API | Exibido | Notas |
|-----------|---------|-------|
| `nomeAcao` | Sim | Ticker |
| `nomeCompleto` | Sim | Nome da empresa |
| `precoSpot` | Sim | `number \| null`; nulo → marcador de ausência |
| `dataAtualizacao` | Sim | Timestamp da API; formatar de forma legível |
| `dataCriacao` | Não | Fora da tabela desta feature |

### Corpo do POST `/api/acoes`

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| `nomeAcao` | string (5 chars, maiúsculas) | Sim |
| `nomeCompleto` | string (4–50) | Sim |

Resposta 201: mesmo formato da listagem (`nomeAcao`, `nomeCompleto`, `precoSpot`, `dataCriacao`, `dataAtualizacao`).

### Resposta 200 do POST `/api/atualizacao/executar`

| Campo | Tipo | Uso na UI |
|-------|------|-----------|
| `totalRecuperadas` | number | Resumo |
| `totalAtualizadas` | number | Resumo |
| `totalCadastradas` | number | Resumo |
| `totalNaoAtualizadas` | number | Resumo |
| `detalhesNaoAtualizadas` | lista | Não obrigatório exibir nesta feature |
| `dataExecucao` | timestamp | Não obrigatório exibir nesta feature |

### Envelope 4xx (cadastro)

| Campo | Tipo | Uso na UI |
|-------|------|-----------|
| `mensagem` | string | Texto exibido em 409/400/422 |
| `erro` | string | Identificar casos de teste (`ACAO_DUPLICADA`); **não** exibir |
| `status` | number | Não exibir |
| `detalhes` | string[] | Não exibir |
| `timestamp` | string | Não exibir |

### Mensagens fixas (UI)

| Situação | Texto |
|----------|--------|
| Falha ao carregar lista | Reusar a mensagem genérica já usada em `GET /acoes` na Meta de Prêmio |
| Lista vazia | Mensagem distinta, não de erro (ex.: nenhuma ação cadastrada ainda) |
| Falha ao cadastrar (5xx/rede ou `mensagem` ausente) | Mensagem genérica de cadastro |
| Falha ao atualizar cotações (5xx/rede) | Mensagem genérica de atualização |

---

## Edge cases

| Cenário | Comportamento |
|---------|----------------|
| Cadastro em andamento | Adicionar e Atualizar desabilitados |
| Atualização em andamento | Adicionar e Atualizar desabilitados; indicador visível (pode demorar: atualiza **todas** as ações) |
| Ticker com espaços ou acentos | Formulário inválido; não dispara HTTP |
| Ticker com 4 ou 6 caracteres | Formulário inválido; não dispara HTTP |
| Nome com 3 caracteres | Formulário inválido; não dispara HTTP |
| `precoSpot` nulo na lista | Marcador de ausência; não é erro |
| 409 duplicada | `mensagem`; lista permanece |
| GET lista falha após cadastro 201 | Cadastro já refletido se a linha 201 foi inserida localmente; se o refresh pós-atualização falhar, AC-05 |
| Header em todas as telas | Header presente em `/acoes` (BR-UI-07) |

---

## Open questions

_Nenhuma._ Decisões fechadas com o usuário: tela dedicada; inclusão apenas; ticker + nome da empresa; atualização manual pelo POST existente (todas as ações).

---

## Assumptions

1. Backend já expõe `GET/POST /api/acoes` (201, 409 `ACAO_DUPLICADA`) e `POST /api/atualizacao/executar`; esta feature **não** altera a API.
2. O job diário das 8h continua existindo; o botão é disparo sob demanda do mesmo processo.
3. Menu: **Ações** entre Meta de Prêmio e Carteira. Rota `/acoes`.
4. Rolagem continua pedindo ticker da **opção**; cadastrar a ação + atualizar cotações é o que torna essas opções disponíveis.
5. Não há exclusão na UI mesmo que `DELETE /api/acoes` exista na API.
6. Sem Cypress nesta feature.
