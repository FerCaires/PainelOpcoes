# Project Knowledge Base — Painel de Opções

> Este arquivo é a fonte de verdade do Spec Writer no frontend.
> Captura regras de apresentação, conceitos de domínio usados na UI, convenções de nomenclatura e restrições transversais que toda spec de tela deve respeitar.
> Criado e mantido pelo Spec Writer. Atualizado sempre que uma feature introduzir regras de UI, rotas, rótulos ou decisões de apresentação que specs futuras precisam conhecer.

---

## Como usar este arquivo

- **Spec Writer**: leia este arquivo inteiro antes de escrever qualquer spec. Toda regra aqui é uma restrição na sua saída.
- **Orquestrador**: forneça este arquivo ao Spec Writer no início de cada ciclo de feature.
- **Time**: atualize este arquivo quando uma feature introduzir novos conceitos de domínio na UI, regras de apresentação ou decisões de nomenclatura não específicas de uma única tela.

---

## Visão geral do projeto

- **Nome**: Painel de Opções
- **Domínio**: Mercado financeiro brasileiro — opções (derivativos) negociadas na B3
- **Propósito**: Aplicação web para o investidor consultar rolagens, gerenciar carteiras e simular a meta de prêmio mensal a partir da API REST CarteiraOpcoes
- **Usuários primários**: Investidor/trader de opções (pessoa física) no navegador
- **Backend**: API REST aberta CarteiraOpcoes (`/api/...`). Cálculos de quantidade, notional, ROI e moneyness ocorrem no backend. O Painel coleta entradas, chama a API e exibe o resultado.
- **Idioma da interface**: Português (BR). Sem i18n nesta fase.

Regras de cálculo e persistência do backend (BR-01 a BR-27, inclusive BR-14 a BR-27 da simulação de meta de prêmio) **não são redefinidas aqui**. O Painel as consome por referência. Fonte canônica: knowledge do backend CarteiraOpcoes / spec F-023.

---

## Glossário de domínio

Os termos abaixo coincidem com o glossário do backend. Não inventar sinônimos.

| Termo | Definição | Não confundir com |
|-------|-----------|-------------------|
| **Ação** | Ativo subjacente negociado na B3, identificado por ticker de 5–6 caracteres (ex: PETR4, BBAS3) | Opção |
| **Opção** | Contrato derivativo negociado na B3, identificado por ticker de 6–8 caracteres (ex: PETRJ423). Possui tipo (CALL/PUT), modalidade (AMERICANA/EUROPEIA), strike, prêmio, vencimento e status | Ação |
| **Call** | Opção de compra. O vendedor coberto (covered call) já possui as ações e as entrega caso exercido | Put |
| **Put** | Opção de venda. O vendedor coberto (cash-secured put) mantém capital em caixa equivalente ao strike × quantidade e compra as ações caso exercido | Call |
| **Strike** | Preço de exercício da opção; sempre positivo; expresso em BRL | Prêmio |
| **Prêmio (valorPremio)** | Valor unitário pago por ação subjacente ao vender/comprar a opção, expresso em BRL. Campo canônico da API: `valorPremio` | Strike |
| **Vencimento** | Data na qual uma opção expira; classificado por tipo (MENSAL/SEMANAL) e status (ABERTA/FINALIZADA) | Data de expiração informal |
| **Carteira** | Agrupamento lógico de opções para gestão de portfólio. Possui nome único e status (ATIVA/INATIVA) | Simulação |
| **Tipo (CALL/PUT)** | Classificação da opção quanto ao direito que confere ao titular | Modalidade |
| **Modalidade (AMERICANA/EUROPEIA)** | Estilo de exercício: americana permite exercício antes do vencimento; europeia apenas no vencimento | Tipo |
| **Preço Spot (precoSpot)** | Preço de mercado atual da ação subjacente, mantido pelo backend; expresso em BRL; campo canônico: `precoSpot` | Strike |
| **Notional** | Capital necessário para cobrir a venda da opção. CALL coberta: ações × spot (BR-15). PUT cash-secured: ações × strike (BR-16) | Prêmio estimado |
| **TipoNotional** | Tipo do capital de cobertura: `ACOES` (CALL coberta) ou `CAIXA` (PUT cash-secured) | Notional (valor) |
| **Moneyness** | Relação entre strike e spot: ITM, ATM ou OTM (BR-21) | |
| **ROI da Operação** | `premioEstimado / notional` (razão decimal, ex: 0,0363 = 3,63%) | ROI anualizado |
| **ROI Anualizado Simples** | `roiOperacao × 12` (estimativa linear, sem composição) | ROI da Operação |
| **Meta de Prêmio (metaPremio)** | Objetivo mensal de receita em BRL via venda de opções sobre uma única ação | |
| **Garantia** | Capital de cobertura já disponível informado na simulação. CALL: valor das ações a spot. PUT: caixa no strike. Campo canônico da API: `garantia` | Notional (calculado) |
| **Modo de Simulação** | Entrada da simulação: `META_PREMIO`, `GARANTIA` ou `QUANTIDADE_ACOES` | |
| **Simulação** | Cálculo hipotético e stateless feito pelo backend; o Painel não persiste nem executa a operação (BR-14) | Carteira |
| **Rolagem** | Substituição de uma opção próxima do vencimento por outra com vencimento posterior | Simulação |
| **Landing** | Página inicial educativa do Painel (Home). Não concentra telas operacionais de simulação | Tela de simulação |
| **Atualização de cotações** | Processo do backend que busca opções/prêmios na API externa e grava `precoSpot`; na UI é disparo manual em `/acoes` | Simulação |

---

## Regras de negócio do backend (referência — não redefinir)

Cálculo, filtros e códigos de erro da simulação de meta de prêmio vivem no backend F-023. O Painel **exibe** o que a API devolve e **não recalcula**.

| ID | Uso no Painel |
|----|----------------|
| BR-14 | Simulação stateless: o Painel não persiste meta, parâmetros nem resultado |
| BR-15 | CALL: `tipoNotional = ACOES`; exibir rótulo "Ações" |
| BR-16 | PUT: `tipoNotional = CAIXA`; exibir rótulo "Caixa" |
| BR-17 a BR-20 | Quantidade, prêmio estimado e ROI já vêm calculados; só formatar na tela |
| BR-21 | `moneyness` (ITM/ATM/OTM) e `percentualVsSpot` já vêm na resposta |
| BR-22 | Se `moneyness = ITM`, exibir `avisoExercicio`; caso contrário o campo é nulo |
| BR-23 | Usuário **não** escolhe vencimento; a API usa o próximo MENSAL ABERTO |
| BR-24 / BR-25 | Filtro de opções ABERTAS e prêmio > 0 é responsabilidade da API |
| BR-27 | HTTP 200 com `opcoes = []` e `quantidadeOperacoes = 0` é sucesso vazio, não erro |

Demais regras backend (BR-01 a BR-13, BR-26) não são reimplementadas na UI.

---

## Regras de apresentação (UI)

| ID | Regra | Fonte / Racional |
|----|-------|-----------------|
| BR-UI-01 | Datas recebidas em `YYYY-MM-DD` são exibidas como `DD/MM/YYYY` | SDD RN-07; F-024 |
| BR-UI-02 | Valores monetários (`precoSpot`, `metaPremio`, `strike`, `valorPremio`, `notional`, `premioEstimado`) são exibidos com 2 casas decimais | SDD RN-08; F-024 |
| BR-UI-03 | `roiOperacao`, `roiAnualizadoSimples` e `percentualVsSpot` chegam como razão decimal e são exibidos em percentual com 2 casas e vírgula decimal (0.0363 → 3,63%; −0.0028 → −0,28%) | F-024 |
| BR-UI-04 | `tipoNotional`: `ACOES` → "Ações"; `CAIXA` → "Caixa" | F-024 / BR-15 / BR-16 |
| BR-UI-05 | O Painel não recalcula quantidade, notional, ROI, moneyness nem percentual vs spot; apenas coleta inputs, chama a API e exibe o resultado | F-024 |
| BR-UI-06 | A lista `opcoes` da simulação **não** é reordenada no cliente; a ordem da API é a ordem da tabela | F-024 |
| BR-UI-07 | Header de navegação compartilhado está presente em todas as telas de feature (Home, Rolagens, Carteira, Simulação e demais rotas de produto) | landing-page; F-024 |
| BR-UI-08 | Inclusão de item no menu **não** remove nem renomeia itens existentes | F-024 |
| BR-UI-09 | Simulação de meta de prêmio é **tela dedicada**, não seção da landing | F-024 |
| BR-UI-10 | Rótulo do menu da simulação: "Meta de Prêmio". Rota: `/simulacao-meta-premio` | F-024 |
| BR-UI-11 | Botão de submissão desabilitado enquanto o formulário estiver inválido ou uma requisição estiver em andamento | SDD RN-04/RN-05; F-024 |
| BR-UI-12 | Durante requisição, exibir indicador de carregamento | SDD RN-05; F-024 |
| BR-UI-13 | Erros HTTP 4xx de **simulação** (e demais fluxos que a spec mandar exibir `mensagem`): exibir o campo `mensagem` do envelope `{ timestamp, status, erro, mensagem, detalhes[] }`. Falha de rede e HTTP 500 nesses fluxos: mensagem genérica (não exibir stack nem corpo técnico). **Exceção — `GET /api/acoes`**: qualquer falha (4xx, 5xx ou rede) usa mensagem genérica; a UI não lê o envelope | SDD RN-06; F-024 Gate 1 W-02 |
| BR-UI-14 | Linha ITM deve ser destacada visualmente e o texto de `avisoExercicio` deve aparecer (BR-22) | F-024 |
| BR-UI-15 | HTTP 200 com lista vazia (BR-27): manter o cabeçalho da simulação e exibir mensagem de ausência de opções — não tratar como erro | F-024 |
| BR-UI-16 | Ao iniciar nova simulação, limpar resultado e erro anteriores | F-024 |
| BR-UI-17 | Ao entrar na tela de simulação, carregar `GET /api/acoes`. Lista vazia e falha de carga são estados tratados (não deixar o seletor “quebrado”) | F-024 |
| BR-UI-18 | No formulário de simulação, Tipo (CALL/PUT) **não** tem valor padrão; o usuário deve escolher explicitamente | F-024 |
| BR-UI-19 | Seletor de ação exibe ticker (`nomeAcao`) e nome completo (`nomeCompleto`) | F-024 |
| BR-UI-20 | Layout responsivo. Em viewport estreita, tabela com scroll horizontal. Acessibilidade WCAG 2.1 AA (contraste mínimo 4.5:1, foco visível, navegação por teclado) | landing-page RNF; F-024 |
| BR-UI-21 | A aplicação não exige autenticação | SDD; API aberta |
| BR-UI-22 | Sem persistência local da simulação (espelha BR-14 no cliente): sair da rota descarta resultado, erro e estado de formulário da simulação | F-024 |
| BR-UI-23 | A simulação por garantia ou quantidade de ações ocorre na mesma tela e rota da Meta de Prêmio; não há item de menu extra | F-026 |
| BR-UI-24 | O seletor de modo inicia em Meta de prêmio. Trocar o modo limpa resultado, erro e o campo numérico inativo | F-026 |
| BR-UI-25 | Gestão de ações é **tela dedicada**. Rota: `/acoes`. Rótulo do menu: "Ações". Ordem do menu: Home, Busca de Rolagens, Meta de Prêmio, Ações, Carteira | F-027 |
| BR-UI-26 | A UI **não** oferece exclusão nem desativação de ação, mesmo existindo `DELETE /api/acoes` na API | F-027 |
| BR-UI-27 | Atualização de cotações na tela de Ações é disparo **manual** via `POST /api/atualizacao/executar` (todas as ações). Não dispara sozinha no cadastro | F-027 |
| BR-UI-28 | `POST /api/acoes` 4xx com envelope: exibir `mensagem`. `GET /api/acoes` permanece genérico (BR-UI-13). 5xx/rede de cadastro ou atualização: mensagem genérica do fluxo | F-027 |

### Regras históricas da tela de Rolagens (permanecem)

Aplicam-se **somente** ao formulário de busca de rolagens, não à simulação de meta de prêmio.

| ID | Regra |
|----|-------|
| RN-01 | Campo Opção obrigatório, 5 a 8 caracteres |
| RN-02 | Quantidade de vencimentos: 1, 2 ou 3 (default 2) |
| RN-03 | Tipo de rolagem obrigatório; default `POSITIVA_AUMENTO_STRIKE` |
| RN-04 | Busca só dispara se o formulário for válido |
| RN-05 | Durante a busca, indicador de carregamento e botão desabilitado |
| RN-06 | Erro de API: mensagem amigável |
| RN-07 | Datas em `DD/MM/YYYY` (generalizado em BR-UI-01) |
| RN-08 | Strike, prêmio e delta com 2 casas decimais (generalizado em BR-UI-02) |

---

## Convenções de nomenclatura

### Rotas (kebab-case)

| Rota | Tela | Item de menu |
|------|------|--------------|
| `/` | Landing (Home) | Home |
| `/painel-rolagem` | Busca de rolagens | Busca de Rolagens |
| `/carteira` | Listagem de carteiras | Carteira |
| `/carteira/criar` | Criação de carteira | (fluxo de Carteira) |
| `/carteira/:id/adicionar-opcao` | Adição de opções à carteira | (fluxo de Carteira) |
| `/simulacao-meta-premio` | Simulação de meta de prêmio | Meta de Prêmio |
| `/acoes` | Gestão de ações (inclusão + atualizar cotações) | Ações |

### Campos JSON da API

- Formato: camelCase (`nomeAcao`, `valorPremio`, `dataVencimento`, `precoSpot`, `tipoNotional`, `avisoExercicio`)
- Caminhos de API: kebab-case português (`/api/acoes`, `/api/simulacao-meta-premio`, `/api/rolagem/por-tipo`)
- Códigos de erro: SCREAMING_SNAKE_CASE (`ACAO_NAO_ENCONTRADA`, `META_PREMIO_INVALIDA`)

### Corpo de erro da API

```json
{
  "timestamp": "<ISO-8601>",
  "status": 422,
  "erro": "SCREAMING_SNAKE_CASE",
  "mensagem": "Descrição legível",
  "detalhes": []
}
```

Na UI, o texto visível nas falhas 4xx da simulação é `mensagem` (BR-UI-13). A carga `GET /api/acoes` não usa o envelope: qualquer falha mostra mensagem genérica. O cadastro `POST /api/acoes` 4xx exibe `mensagem` (BR-UI-28).

### Datas e números na tela

- API envia data em `YYYY-MM-DD`; tela mostra `DD/MM/YYYY` (BR-UI-01)
- Monetário: 2 casas decimais (BR-UI-02)
- Razão decimal de ROI / percentual vs spot: converter × 100 e mostrar com 2 casas e `%` (BR-UI-03)

---

## Restrições transversais

### Autenticação
- Nenhuma tela exige login (BR-UI-21)

### Persistência no cliente
- Sem armazenamento da simulação (BR-UI-22 / BR-14)
- Carteira, opções e **ações cadastradas** são persistidas **no backend**, não no navegador

### Acessibilidade e responsividade
- WCAG 2.1 AA (BR-UI-20)
- Menu adaptativo em viewport estreita (já existente na landing)
- Tabelas largas: scroll horizontal no mobile

### Design visual
- Toda nova tela operacional deve invocar **frontend-design** na implementação (layout, hierarquia, destaque, espaçamento). A spec descreve o quê; o visual do como fica para essa skill + Architect.

### Fora do Painel
- Job diário de cotação (o Painel só dispara o POST existente sob demanda), autenticação, i18n, PWA
- Recálculo de fórmulas de simulação no cliente

---

## Contratos consumidos (API)

| Tela / fluxo | Método e caminho | Notas |
|--------------|------------------|-------|
| Rolagens | `GET /api/rolagem/por-tipo` | Query: `opcao`, `quantidadeVencimentos`, `tipoRolagem` |
| Carteiras | `GET/POST /api/carteiras` e sub-recursos de opções | Persistência no backend |
| Seletor de ação (simulação) | `GET /api/acoes` | Campos usados na UI: `nomeAcao`, `nomeCompleto` (também vem `precoSpot`, possivelmente nulo) |
| Gestão de ações | `GET /api/acoes`, `POST /api/acoes`, `POST /api/atualizacao/executar` | Inclusão (ticker 5 chars + nome); sem DELETE na UI; atualização manual de cotações |
| Simulação de meta de prêmio | `GET /api/simulacao-meta-premio` | Query: `nomeAcao`, `tipo`, `modo` (`META_PREMIO` \| `GARANTIA` \| `QUANTIDADE_ACOES`) e o parâmetro do modo (`metaPremio`, `garantia` ou `quantidadeAcoes`) |

Base URL e mecanismo HTTP são decisão de arquitetura (já existentes nas demais telas).

---

## Features entregues (resumo)

| Feature | Resumo | Conceitos-chave na UI |
|---------|--------|------------------------|
| painel-rolagem | Busca de rolagens por ticker, quantidade de vencimentos e tipo | Rolagem, Delta, RN-01 a RN-08 |
| landing-page | Home educativa + header/menu compartilhado + rotas | Landing, menu Home / Busca de Rolagens / Carteira |
| criacao-carteira | Criar carteira e adicionar opções | Carteira |
| adicionar-campo-premio | Exibir prêmio da opção informada na busca de rolagem | valorPremio / prêmio |
| ajuste-botao-buscar | Alinhamento visual do botão de busca de rolagens | — |
| atualizar-situacao-opcao | Edição em massa da situação das opções na carteira | Situação |
| F-024 — simulacaoMetaPremio | Tela e item de menu para simular meta de prêmio mensal (consome F-023) | Meta de Prêmio, Simulação, Notional, TipoNotional, Moneyness, ROI |
| F-026 — modosSimulacaoPremio | Seletor de modo (meta / garantia / quantidade) na mesma tela (consome F-025) | Modo de Simulação, Garantia |
| F-027 — gestaoAcoes | Tela e item de menu para incluir ações e atualizar cotações | Ação (cadastro), Atualização de cotações |

---

## Change log

- 2026-10-01 · Knowledge base do frontend inicializada a partir do SDD do Painel, rotas/menu existentes, glossário e BR-14 a BR-27 do backend (por referência). Regras BR-UI-01 a BR-UI-22 introduzidas pela F-024 (Tela de Simulação de Meta de Prêmio) e pela generalização das convenções de data, dinheiro, header e erros já usadas no Painel.
- 2026-10-01 · Gate 1 W-02: BR-UI-13 restrita — envelope `mensagem` só na simulação; `GET /api/acoes` sempre mensagem genérica.
- 2026-10-02 · F-026: modos de simulação na tela Meta de Prêmio; BR-UI-23 e BR-UI-24.
- 2026-10-02 · F-027: tela `/acoes` para incluir ações e disparar atualização de cotações; BR-UI-25 a BR-UI-28; sem exclusão na UI.
