# Gate 3 Review — Task Plan: F-024 Tela de Simulação de Meta de Prêmio

## Verdict: PASS WITH NOTES

## Spec coverage matrix audit
| AC ID | Covered | Tasks | Notes |
|-------|---------|-------|-------|
| AC-01 | ✅ | TASK-46, TASK-47 | Rota lazy `simulacao-meta-premio` + item **Meta de Prêmio**. Home / Busca de Rolagens / Carteira permanecem na descrição da TASK-47; o Then do BDD só assere o rótulo novo. |
| AC-02 | ✅ | TASK-01, TASK-09, TASK-10, TASK-26, TASK-27 | Três campos na ordem; `tipo` vazio; `maiorQueZero` (não `min(0)`); `podeSimular` desliga o botão se form inválido, lista vazia/erro, `carregandoAcoes` ou `carregandoSimulacao`. |
| AC-03 | ✅ | TASK-04, TASK-17, TASK-29 | Model `Acao`, `GET /acoes` 200, `mat-option` com ticker + nome completo; `precoSpot` nulo não filtra. |
| AC-04 | ✅ | TASK-08, TASK-18, TASK-30 | 200 `[]` é sucesso no serviço; slot de texto distinto (`MSG_ACOES_VAZIAS`); `podeSimular` false. Fecha Gate 2 W-01. |
| AC-05 | ✅ | TASK-08, TASK-19, TASK-28, TASK-31 | Spinner compartilhado; falha 4xx/5xx/rede **sem** ler envelope; sem botão de retry; `role="alert"` no slot de `erroAcoes`. |
| AC-06 | ✅ | TASK-02, TASK-05, TASK-06, TASK-15, TASK-20, TASK-21, TASK-34, TASK-35, TASK-36, TASK-37 | Cabeçalho, `HttpParams`, tabela na ordem da API, ITM + `avisoExercicio`, `ACOES` → "Ações". Formatação monetária/data entra via TASK-11/12 (deps de TASK-34) e percentuais via TASK-13/14 (deps de TASK-35). |
| AC-07 | ✅ | TASK-03, TASK-16, TASK-38 | Enum + formatter + célula da tabela `"Caixa"`. |
| AC-08 | ✅ | TASK-08, TASK-22, TASK-39 | 200 `opcoes=[]` não lança erro; cabeçalho permanece; slot `MSG_OPCOES_VAZIAS` distinto. |
| AC-09 | ✅ | TASK-07, TASK-23, TASK-40 | `SimulacaoMetaPremioError`; envelope 4xx → `mensagem`; sem tabela. |
| AC-10 | ✅ | TASK-23 | Pipeline único de 4xx (sem `switch`). A UI que pinta `err.message` é a TASK-40, que só declara `Satisfies: AC-09`; matriz não lista a task de componente. Cobertura real existe; testes de componente para 422 `META_PREMIO_INVALIDA` podem ser omitidos. |
| AC-11 | ✅ | TASK-23 | Idem AC-10 (`PRECO_SPOT_INDISPONIVEL`). |
| AC-12 | ✅ | TASK-23 | Idem AC-10 (`VENCIMENTO_MENSAL_NAO_ENCONTRADO`). |
| AC-13 | ✅ | TASK-08, TASK-24, TASK-25, TASK-41 | 4xx sem `mensagem` útil, 500 e rede → `MSG_FALHA_SIMULACAO`. |
| AC-14 | ✅ | TASK-32, TASK-33 | Limpa `resultado`/`erroSimulacao` **antes** do GET; spinner + `carregandoSimulacao`; botão off via `podeSimular` (TASK-27). |
| AC-15 | ✅ | TASK-11, TASK-12, TASK-13, TASK-14 | Data, monetário pt-BR 2 casas, razão × 100 + `%`; sinal negativo ASCII (Gate 2 W-03). `tipoNotional` fica em AC-06/AC-07. Aplicação no template: TASK-34/35. |
| AC-16 | ✅ | TASK-42 | `<app-header-menu>` no topo do componente da tela (não no `AppComponent`). |
| AC-17 | ✅ | TASK-45, TASK-46 | Estado só no componente; serviços sem cache; rota sem `providers`; reentrada dispara `carregarAcoes`. Then do BDD só checa `tipo` vazio. |
| AC-18 | ✅ | TASK-43, TASK-44 | `.tabela-wrapper { overflow-x: auto }`; `ngSubmit` + `role="alert"` + `aria-*`; contraste via **frontend-design**. |

Nenhuma task órfã: TASK-01..TASK-47 declaram pelo menos um AC. Edge cases da spec (form incompleto, `metaPremio` ≤ 0, ação com spot nulo, 400 `PARAMETRO_*`/`TIPO_INVALIDO`, ATM/OTM, destroy da rota) estão na descrição das tasks de AC correspondentes; HTTP 400 cai no mesmo pipeline da TASK-23.

## Architecture coverage audit
| Arch element | Covered | Task(s) | Notes |
|---|---|---|---|
| Endpoint: GET `{apiBaseUrl}/acoes` | ✅ | TASK-17, TASK-18, TASK-19 | 200 lista, 200 `[]`, 4xx/5xx/rede sem envelope. Sem cache. Sem filtro por `precoSpot`. |
| Endpoint: GET `{apiBaseUrl}/simulacao-meta-premio` | ✅ | TASK-20, TASK-21, TASK-22, TASK-23, TASK-24, TASK-25 | `HttpParams`; `metaPremio.toString()` sem locale; 200 com itens; 200 `opcoes=[]`; 4xx `mensagem`; fallback genérico. |
| DB / migration / IndexedDB / localStorage | ✅ N/A | — | Infra explícita “Não aplicável”. Alinhado à architecture (stateless, BR-14 / BR-UI-22). |
| Models: `TipoOpcao`, `Moneyness`, `TipoNotional`, `Acao`, `SimulacaoOpcaoItem`, `SimulacaoMetaPremioResponse` | ✅ | TASK-01 .. TASK-06 | Campos `readonly`; reusa `Modalidade`; não reusa `Opcao` da rolagem. |
| `SimulacaoMetaPremioError` (`api-errors.model.ts`) | ✅ | TASK-07 | Extende `ApiError`; não altera subclasses existentes. |
| Utils: constantes de mensagem | ✅ | TASK-08 | Arquivo extra `simulacao-meta-premio-mensagens.ts` (Gate 2 W-02). |
| Utils: `maiorQueZero` | ✅ | TASK-09, TASK-10 | Rejeita 0/NaN; vazio fica com `required`. |
| Utils: `formatacao.ts` | ✅ | TASK-11 .. TASK-16 | Data, monetário, percentual +/-, `tipoNotional`. Sem recálculo. |
| Service: `AcaoApiService` | ✅ | TASK-17, TASK-18, TASK-19 | `providedIn: 'root'`; `inject(HttpClient)`; `environment.apiBaseUrl`. |
| Service: `SimulacaoMetaPremioApiService` | ✅ | TASK-20 .. TASK-25 | Dois serviços (ADR-02). Helper `extrairEnvelope` sem `any`. |
| Component: `SimulacaoMetaPremioComponent` | ✅ | TASK-26 .. TASK-45 | Standalone, OnPush, signals, Reactive Forms (ADR-03). HTML/SCSS via **frontend-design**. |
| Route: `path: 'simulacao-meta-premio'` lazy `loadComponent` | ✅ | TASK-46 | Antes de `**`; sem `canActivate`; sem `providers` (ADR-01). |
| Header: `HeaderMenuComponent.menuItems` | ✅ | TASK-47 | Acrescenta **Meta de Prêmio** sem remover os três itens. Architecture também pede alterar `header-menu.component.spec.ts` (3 → 4); a task não cita o `.spec.ts`. |
| Gate 2 W-01 (quarto slot AC-04) | ✅ | TASK-30 | Slot distinto de `erroAcoes` / `erroSimulacao` / `MSG_OPCOES_VAZIAS`. |
| Gate 2 W-02 (constantes em utils + `/acoes` genérico) | ✅ | TASK-08, TASK-19 | Service lança `MSG_FALHA_CARREGAR_ACOES`; nunca lê `mensagem`. |
| Gate 2 W-03 (hífen ASCII em percentual) | ✅ | TASK-14 | Assert `'-0,28%'` (U+002D), não o minus da spec. |
| ADR-01 lazy vs eager | ✅ | TASK-46 | |
| ADR-02 dois serviços | ✅ | TASK-17 vs TASK-20 | |
| ADR-03 signals vs campos mutáveis | ✅ | TASK-26 | |
| Cross-cutting: auth / interceptor / Docker / env | ✅ N/A | — | Sem guard, sem interceptor novo, Docker inalterado, reusa `apiBaseUrl`. |
| Cross-cutting: a11y / WCAG | ✅ | TASK-43, TASK-44 | Detalhe visual na skill **frontend-design**. |
| Arquivos `*.spec.ts` listados na architecture | ⚠️ | BDD de cada task | Não há task só de arquivo de teste; TDD fica implícito no Given/When/Then. Header `.spec.ts` é o único “Alterar” sem menção explícita. |

## Score
| Category | Status | Findings |
|----------|--------|----------|
| Spec coverage | ✅ | AC-01..AC-18 na matriz e com task real. AC-10..AC-12 cobertos pelo pipeline da TASK-23 + UI da TASK-40; a matriz subdeclara a task de tela. |
| Architecture coverage | ✅ | Os dois GETs, models, utils, dois serviços, erro, componente, rota, menu, N/A de DB e os W-01..W-03 do Gate 2 estão endereçados. |
| Task atomicity | ✅ | 47 tasks, uma camada cada, nenhuma L. TASK-26 e TASK-35 são M (esqueleto do componente e `mat-table` completa) — aceitável. TASK-38/TASK-41 são XS finas, não bloqueiam. |
| Dependency ordering | ✅ | Todos os `Depends on` apontam para IDs anteriores; sem ciclo. TASK-41 omite TASK-24 na lista (ordem numérica ainda correta). |
| Language separation | ✅ | TypeScript 47; Kotlin 0; Python N/A; infra N/A. Stream único. |
| Complexity calibration | ✅ | XS/S coerentes com enums, formatters e handlers HTTP; M só no shell do componente e na tabela de 16 colunas. |
| Developer handoff readiness | ⚠️ | Paths e assinaturas estão no nível da architecture. Fricção: matriz/Satisfies de AC-10..12; spec do header não citada; alguns Then compostos; BDD da TASK-45/46 mais estreito que a descrição. |

## Blockers
Nenhum.

## Warnings
### W-01 · Matriz e `Satisfies` subdeclaram a UI de AC-10..AC-12
**Task(s) affected**: TASK-23, TASK-40
**Issue**: AC-10, AC-11 e AC-12 (“a tela exibe exatamente `mensagem`”) aparecem só em TASK-23 (serviço). TASK-40 implementa o slot `erroSimulacao` e diz no texto que o mesmo caminho cobre AC-10..12, mas `Satisfies` lista apenas AC-09. Um desenvolvedor TDD no componente pode mockar só 404 e não os três 422.
**Suggested fix**: Incluir TASK-40 (e payloads 422) na matriz de AC-10..AC-12, ou acrescentar Thens/casos de teste explícitos no componente para cada código.

### W-02 · `header-menu.component.spec.ts` não está na TASK-47
**Task(s) affected**: TASK-47
**Issue**: A architecture em **Alterar** exige atualizar o spec do header (`3` → `4` itens e rótulo **Meta de Prêmio**). A task só edita `header-menu.component.ts`. O Then não garante que Home, Busca de Rolagens e Carteira continuam nos testes.
**Suggested fix**: Citar o `.spec.ts` na descrição e asserir quatro itens + os três rótulos existentes.

### W-03 · `Depends on` incompleto na TASK-41
**Task(s) affected**: TASK-41
**Issue**: A descrição cita TASK-24 (4xx sem envelope) e TASK-25 (500/rede), mas `Depends on` lista só TASK-25 e TASK-40. Não é dependência para frente (TASK-24 é anterior), só risco de implementar a UI genérica sem o fallback 4xx do serviço.
**Suggested fix**: Adicionar TASK-24 em `Depends on`.

### W-04 · Then compostos e BDD mais estreito que o AC
**Task(s) affected**: TASK-20, TASK-29, TASK-32, TASK-45, TASK-46
**Issue**: TASK-20 e TASK-29 usam “e” no Then (três query params; ticker **e** nome). TASK-32 Then zera dois signals. TASK-45 Then só checa `tipo` vazio (não resultado/erro/`GET /acoes` de novo). TASK-46 Then só checa o `path` (não ausência de `providers`/`canActivate`).
**Suggested fix**: Manter um Then por task e empilhar asserts extras na descrição de teste, ou splitar o que for contrato HTTP vs rótulo do seletor.

### W-05 · **frontend-design** no esqueleto e de novo no acabamento
**Task(s) affected**: TASK-26, TASK-36, TASK-43, TASK-44, TASK-47
**Issue**: TASK-26 já manda HTML/SCSS pela skill; ITM, wrapper da tabela, a11y e ícone do menu voltam a invocá-la. Risco de retrabalho visual, não de cobertura.
**Suggested fix**: Tratar TASK-26 como estrutura/tokens mínimos e concentrar a passagem visual nas tasks 36/43/44/47.

## Summary
O plano F-024 cobre os 18 ACs, os dois endpoints consumidos, a ausência justificada de persistência, models/utils, os dois serviços, `SimulacaoMetaPremioError`, o componente OnPush, a rota lazy, o item de menu e os três avisos do Gate 2 (slot AC-04, constantes + erro genérico de `/acoes`, hífen ASCII). Não há task L, dependência invertida nem AC sem dono. A fricção restante é de handoff: matriz de AC-10..12, spec do header, um `Depends on` incompleto e BDDs um pouco estreitos ou compostos — não impedem o desenvolvimento.

## Recommendation
Proceed to development. Task Planner should address warnings in the next iteration.
