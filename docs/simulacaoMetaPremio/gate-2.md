# Gate 2 Review — Architecture: F-024 — Tela de Simulação de Meta de Prêmio

## Verdict: PASS WITH NOTES

## Spec alignment matrix
| Spec element | Addressed in arch | Notes |
|---|---|---|
| AC-01 | ✅ | `header-menu.component.ts` (`menuItems` + rótulo **Meta de Prêmio**) e `app.routes.ts` (`path: 'simulacao-meta-premio'`, lazy `loadComponent`). Os três itens existentes permanecem; testes do header 3 → 4. |
| AC-02 | ✅ | Form Reactive: Ação → Meta de prêmio → Tipo; `tipo` sem default; `maiorQueZero` (rejeita 0); `podeSimular` exige form válido, lista de ações > 0, sem `erroAcoes`, sem `carregandoAcoes`/`carregandoSimulacao`. |
| AC-03 | ✅ | `AcaoApiService.listar()` 200; `mat-select` mostra `nomeAcao` + `nomeCompleto` (BR-UI-19). |
| AC-04 | ✅ | 200 `[]` → `acoes = []`, texto fixo de lista vazia, `podeSimular` false. Estado `[ACOES_VAZIAS]`. Slot de template para esta mensagem não está nomeado junto aos outros (ver W-01). |
| AC-05 | ✅ | `carregandoAcoes` + mesmo `mat-spinner`; falha 4xx/5xx/rede no `AcaoApiService` **sem** ler envelope; mensagem genérica; seletor vazio; sem botão de retry. |
| AC-06 | ✅ | `simular()` 200: cabeçalho do `resultado`; `mat-table` com `colunasTabela` na ordem da spec; formatadores; `isLinhaItm` + classe CSS; `avisoExercicio`; `formatarTipoNotional(ACOES)` → "Ações"; números inalterados. |
| AC-07 | ✅ | `formatarTipoNotional(CAIXA)` → `"Caixa"`. |
| AC-08 | ✅ | 200 `opcoes=[]` / `quantidadeOperacoes = 0`: mantém `resultado`, **não** seta `erroSimulacao`, texto de ausência de opções. |
| AC-09 | ✅ | 404 `ACAO_NAO_ENCONTRADA` → `SimulacaoMetaPremioError` com `mensagem`; sem tabela (`resultado` limpo antes); `carregandoSimulacao=false` reabilita via `podeSimular`. |
| AC-10 | ✅ | 422 `META_PREMIO_INVALIDA` → mesmo pipeline de `mensagem`. |
| AC-11 | ✅ | 422 `PRECO_SPOT_INDISPONIVEL` → `mensagem`. |
| AC-12 | ✅ | 422 `VENCIMENTO_MENSAL_NAO_ENCONTRADO` → `mensagem`. |
| AC-13 | ✅ | 500 / rede (`status === 0`) no `SimulacaoMetaPremioApiService` → texto genérico de simulação; 4xx sem `mensagem` útil também cai neste fallback. |
| AC-14 | ✅ | `simular()`: spinner; botão off; `resultado`/`erroSimulacao` zerados **antes** do GET; ao complete/error o spinner some. Mesmo `mat-spinner` da carga de ações. |
| AC-15 | ✅ | `formatacao.ts`: `formatarDataIso`, `formatarMonetario` (pt-BR, 2 casas), `formatarPercentual` (razão × 100 + `%`); `tipoNotional` via AC-06/07. Exemplo ASCII `-0,28%` vs glifo da spec `−0,28%` (ver W-03). |
| AC-16 | ✅ | `<app-header-menu>` no topo do template do componente (não no `AppComponent`). |
| AC-17 | ✅ | Estado só em signals/form do componente; serviços sem cache; rota sem `providers`; destroy padrão do Router; reentrada dispara `ngOnInit` → `carregarAcoes`. |
| AC-18 | ✅ | `.tabela-wrapper { overflow-x: auto; }`; colunas não omitidas por media query; `(ngSubmit)` + early-return; foco Material; `role="alert"`; contraste ≥ 4,5:1 via **frontend-design**. |
| Actor: investidor/trader | ✅ | Entrada: item de menu + URL `/simulacao-meta-premio` → `SimulacaoMetaPremioComponent`. |
| Actor: API CarteiraOpcoes (F-023) | ✅ | Consumo via `AcaoApiService` e `SimulacaoMetaPremioApiService`; Painel não escolhe vencimento. |
| Data field: Form.Ação (`nomeAcao`) | ✅ | Controle `nomeAcao`; origem `GET /acoes`; query da simulação. |
| Data field: Form.Meta de prêmio | ✅ | Controle `metaPremio`; `required` + `maiorQueZero`; serializado `toString()` sem locale. |
| Data field: Form.Tipo | ✅ | Controle `tipo`; enum `TipoOpcao` `CALL`/`PUT`; sem valor inicial. |
| Data field: Acao.nomeAcao | ✅ | Model `Acao`; valor do seletor e query. |
| Data field: Acao.nomeCompleto | ✅ | Model `Acao`; rótulo visível (BR-UI-19). |
| Data field: Acao.precoSpot | ✅ | `number \| null`; **não** filtra o seletor; spot da simulação vem do outro GET. |
| Data field: Query.nomeAcao | ✅ | `HttpParams` a partir da ação selecionada. |
| Data field: Query.metaPremio | ✅ | decimal > 0; `toString()` sem locale (`1000` / `1000.5`). |
| Data field: Query.tipo | ✅ | `CALL` \| `PUT` maiúsculas. |
| Data field: Header.nomeAcao | ✅ | Cabeçalho, texto. |
| Data field: Header.nomeCompleto | ✅ | Cabeçalho, texto. |
| Data field: Header.precoSpot | ✅ | Cabeçalho, monetário 2 casas. |
| Data field: Header.metaPremio | ✅ | Cabeçalho, monetário 2 casas. |
| Data field: Header.tipo | ✅ | Cabeçalho, `CALL`/`PUT` como recebido. |
| Data field: Header.dataVencimento | ✅ | Cabeçalho, `YYYY-MM-DD` → `DD/MM/YYYY`. |
| Data field: Header.diasAteVencimento | ✅ | Cabeçalho, inteiro. |
| Data field: Header.quantidadeOperacoes | ✅ | Cabeçalho, inteiro (0 na lista vazia). |
| Data field: Header.opcoes | ✅ | Fonte da `mat-table`; pode ser `[]`. |
| Data field: Item.nome | ✅ | Coluna; `trackBy` neste campo. |
| Data field: Item.tipo | ✅ | Coluna; `TipoOpcao`. |
| Data field: Item.modalidade | ✅ | Coluna; reusa enum `Modalidade`. |
| Data field: Item.strike | ✅ | Coluna; monetário 2 casas. |
| Data field: Item.valorPremio | ✅ | Coluna; monetário 2 casas; **não** reusa `Opcao.premio` da rolagem. |
| Data field: Item.percentualVsSpot | ✅ | Coluna; razão × 100, 2 casas, sufixo `%`. |
| Data field: Item.moneyness | ✅ | Coluna; enum ITM/ATM/OTM; destaque CSS se ITM. |
| Data field: Item.avisoExercicio | ✅ | Coluna; `string \| null`; nulo não mostra texto. |
| Data field: Item.dataVencimento | ✅ | Coluna; `DD/MM/YYYY`. |
| Data field: Item.diasAteVencimento | ✅ | Coluna; inteiro. |
| Data field: Item.quantidadeAcoes | ✅ | Coluna; inteiro. |
| Data field: Item.notional | ✅ | Coluna; monetário 2 casas. |
| Data field: Item.tipoNotional | ✅ | Coluna; `ACOES` → "Ações"; `CAIXA` → "Caixa". |
| Data field: Item.premioEstimado | ✅ | Coluna; monetário 2 casas. |
| Data field: Item.roiOperacao | ✅ | Coluna; percentual BR-UI-03. |
| Data field: Item.roiAnualizadoSimples | ✅ | Coluna; percentual BR-UI-03. |
| Data field: Envelope.timestamp | ✅ | Não exibido. |
| Data field: Envelope.status | ✅ | Não exibido. |
| Data field: Envelope.erro | ✅ | Não exibido; usado só para identificar casos nos testes (AC-09..12). |
| Data field: Envelope.mensagem | ✅ | Texto visível nas falhas 4xx da simulação; ausente/não-string/vazia → genérica AC-13. **Não** lida em `GET /acoes`. |
| Data field: Envelope.detalhes | ✅ | Não exibido. |
| Mensagem fixa: ações 200 `[]` | ✅ | `Nenhuma ação disponível para simulação.` |
| Mensagem fixa: falha GET ações | ✅ | `Não foi possível carregar as ações. Tente novamente.` |
| Mensagem fixa: `opcoes = []` | ✅ | `Nenhuma opção disponível para os parâmetros informados neste vencimento.` |
| Mensagem fixa: simulação 5xx/rede | ✅ | `Não foi possível concluir a simulação. Tente novamente.` |
| Edge case: formulário incompleto | ✅ | **Simular** desabilitado; `simular()` no-op se `!form.valid`. |
| Edge case: `metaPremio` 0 / negativo / não numérico | ✅ | Cliente: `maiorQueZero` + `required`. API 422: AC-10 / `mensagem`. |
| Edge case: GET ações 200 com itens | ✅ | Popular seletor (AC-03). |
| Edge case: GET ações 200 vazio | ✅ | Mensagem AC-04; **Simular** off. |
| Edge case: GET ações em andamento | ✅ | Spinner; **Simular** off; sem retry. |
| Edge case: GET ações 4xx / 5xx / rede | ✅ | Mensagem genérica; sem envelope; seletor vazio. |
| Edge case: ação com `precoSpot` nulo ou ≤ 0 | ✅ | Permanece no seletor; 422 `PRECO_SPOT_INDISPONIVEL` → `mensagem`. |
| Edge case: HTTP 200 com opções | ✅ | Cabeçalho + tabela na ordem da API (sem reordenar). |
| Edge case: HTTP 200 `opcoes = []` (BR-27) | ✅ | Cabeçalho + mensagem; não é erro. |
| Edge case: HTTP 404 `ACAO_NAO_ENCONTRADA` | ✅ | Exibir `mensagem` (AC-09). |
| Edge case: HTTP 422 `META_PREMIO_INVALIDA` | ✅ | Exibir `mensagem` (AC-10). |
| Edge case: HTTP 422 `PRECO_SPOT_INDISPONIVEL` | ✅ | Exibir `mensagem` (AC-11). |
| Edge case: HTTP 422 `VENCIMENTO_MENSAL_NAO_ENCONTRADO` | ✅ | Exibir `mensagem` (AC-12). |
| Edge case: HTTP 400 (`PARAMETRO_AUSENTE`, `PARAMETRO_TIPO_INVALIDO`, `TIPO_INVALIDO`) | ✅ | Tabela de error responses; exibir `mensagem`; catch-all 4xx com envelope. |
| Edge case: HTTP 500 ou rede na simulação | ✅ | Mensagem genérica (AC-13). |
| Edge case: nova simulação com resultado/erro anterior | ✅ | Limpa ambos ao disparar (AC-14). |
| Edge case: linha ITM | ✅ | Classe `linha-itm` + `avisoExercicio`. |
| Edge case: linha ATM ou OTM | ✅ | Sem destaque de exercício; nulo não mostra texto. |
| Edge case: sair da rota e voltar | ✅ | Destroy do componente; form inicial; recarrega ações (AC-17). |
| Edge case: viewport mobile com muitas colunas | ✅ | Scroll horizontal; nenhuma coluna omitida. |
| Edge case: teclado (Tab, foco, Enter) | ✅ | `ngSubmit`; Enter só efetiva se form válido; foco Material. |
| Out of scope: recálculo no cliente | ✅ | Explicitamente proibido; formatadores só apresentam. |
| Out of scope: persistência | ✅ | Sem tabela, IndexedDB, `localStorage`; N/A de schema justificado. |
| Out of scope: executar venda / carteira | ✅ | Sem endpoint nem ação de venda. |
| Out of scope: escolha de vencimento / SEMANAIS / vários tickers | ✅ | Query só `nomeAcao`, `metaPremio`, `tipo`. |
| Out of scope: autenticação | ✅ | Sem guard, interceptor, JWT. |
| Out of scope: landing educativa / job de cotações / paginação | ✅ | Não desenhados. |
| Out of scope: alterar Rolagens/Carteira | ✅ | Só o menu compartilhado. |

## Score
| Category | Status | Findings |
|----------|--------|----------|
| Spec alignment | ✅ | AC-01..AC-18, campos do data model, atores, edge cases e exclusões têm caminho de implementação (componente, serviço, rota, CSS, formatter). W-01 e W-03 são precisão de template/formatação, não AC sem endereço. |
| API contract completeness | ✅ | Contratos **consumidos**: `GET {apiBaseUrl}/acoes` e `GET {apiBaseUrl}/simulacao-meta-premio`. Método, path, auth (nenhuma), query, 200 (incluindo `opcoes=[]`), mapeamento UI e error responses (400×3, 404, 422×3, 500, rede, fallback 4xx sem `mensagem`) estão completos. Nenhum endpoint criado. |
| DB schema completeness | N/A | Ausência de persistência justificada (BR-14 / BR-UI-22 / AC-17): sem tabela, migration, IndexedDB ou `localStorage`. Estado vive só no componente montado. |
| TypeScript / Angular design | ✅ | Pastas alinhadas ao knowledge (`components/`, `services/`, `models/`, `utils/`); `inject()`; `OnPush` + signals; dois serviços `providedIn: 'root'` só HTTP; `HttpParams`; `SimulacaoMetaPremioError` estende `ApiError`; Reactive Forms; lazy `loadComponent` no padrão carteira. Python N/A. |
| Python design | N/A | Painel é Angular/TypeScript; knowledge confirma ausência de Python. |
| Cross-cutting concerns | ✅ | Auth nenhuma; erros via `catchError` sem interceptor; `environment.apiBaseUrl` único ponto de integração; logging mínimo (não dump de payload); a11y/WCAG e **frontend-design** na implementação HTML/SCSS. |
| ADR completeness | ✅ | ADR-01..03 de feature: Status Accepted, context, decision, consequences. Nenhum Proposed. ADRs de projeto 001–006 aplicados; ADR-008 de projeto corretamente não criado. |
| Task planner readiness | ⚠️ | Fronteiras de arquivo, assinaturas, ordem de colunas, testes mínimos e dependências (models → utils → services → componente → rota/menu) bastam para tasks atômicas. Ambiguidades residuais: slot de template AC-04 (W-01) e local das constantes de mensagem (W-02). Sem migration. Stream único TypeScript. |

## Blockers
Nenhum.

## Warnings
### W-01 · Quarto estado de texto (AC-04) omitido na lista de slots do template
**Section**: TypeScript / Angular design — Template e CSS
**Issue**: O contrato de template cita três slots (`erroAcoes`, `erroSimulacao`, mensagem de `opcoes = []`) “para não misturar AC-04/AC-05/AC-08/AC-09”, mas AC-04 (“Nenhuma ação disponível para simulação.”) é um quarto estado (`[ACOES_VAZIAS]`), distinto de `erroAcoes` (AC-05). O mapeamento AC e a tabela de constantes cobrem o texto; o inventário de slots não.
**Suggested fix**: Nomear explicitamente o slot de lista vazia de **ações** (ex. `acoes().length === 0 && !carregandoAcoes() && !erroAcoes()`) separado de `erroAcoes`, para o Task Planner não reutilizar o signal de erro no 200 `[]`.

### W-02 · Local das constantes de mensagem e caminho duplo de erro em `AcaoApiService`
**Section**: TypeScript / Angular design — Serviços / constantes
**Issue**: Constantes de mensagem ficam “componente ou `utils`”. `AcaoApiService` “não precisa de classe específica” e admite o componente substituir `err.message`, com preferência de o service já lançar o texto fixo. Duas decisions em aberto aumentam risco de tasks divergentes (constante duplicada, teste de service vs componente).
**Suggested fix**: Fixar constantes em `utils` (ou arquivo de constantes da feature) e mandar `AcaoApiService.listar()` sempre lançar `Error`/`ApiError` com o texto genérico de ações — alinhado à preferência já escrita.

### W-03 · Sinal negativo de percentual (AC-15) vs exemplo da spec
**Section**: Spec alignment / formatters
**Issue**: AC-15 exemplifica `percentualVsSpot` como **−0,28%** (glifo minus). A architecture especifica `formatarPercentual(-0.0028) → "-0,28%"` (hífen ASCII) via `Intl.NumberFormat('pt-BR')`. O assumption 6 da spec fecha o mapeamento 0.0363 → 3,63%, não o code point do sinal. Um teste literal contra o glifo da spec falharia.
**Suggested fix**: No tasks.md, amarrar o assert de AC-15 ao output de `Intl` pt-BR (hífen ou minus, de forma explícita), sem copiar o glifo da spec cegamente.

## Summary
A architecture F-024 está completa para uma tela Angular: rota lazy, menu compartilhado, dois contratos HTTP consumidos com mapeamento UI e error responses, models/enums, formatters puros, OnPush + signals, ausência justificada de persistência e ADRs Accepted. Todos os AC-01..AC-18 e os campos do data model têm caminho de implementação; nenhum edge case documentado ficou sem tratamento de erro. Os avisos são de precisão para o Task Planner (slot AC-04, local das constantes, assert do sinal percentual), não de cobertura faltante.

## Recommendation
Proceed to Task Planner. Architect should address warnings in the next iteration.
