# Architecture Knowledge Base — Painel de Opções

> Fonte de verdade do Architect no frontend.
> Captura padrões estabelecidos, componentes compartilhados, convenções de pastas, contrato de erro consumido e decisões transversais que todo `docs/{feature}/architecture.md` deve respeitar — não reinventar.
> Criado e mantido pelo Architect. Atualizado quando uma feature introduzir padrão, componente compartilhado ou decisão que specs futuras precisem conhecer.
>
> Fonte: código em `src/app/`, `src/environments/`, `docs/sdd.md`, ADRs em `docs/adrs/` e `AGENTS.md`. Projeto já existente — esta base foi extraída do código, sem entrevista.

---

## Como usar este arquivo

- **Architect**: leia este arquivo inteiro antes de desenhar qualquer feature. O design deve ser consistente com tudo registrado aqui.
- **Orquestrador**: forneça este arquivo ao Architect no início de cada ciclo.
- **Time**: atualize quando uma feature estabelecer padrão, componente compartilhado ou decisão não específica de uma única tela.

---

## Visão técnica do projeto

- **Aplicação**: `painel-opcoes` — SPA Angular **17.3.x**, TypeScript **~5.4.2**, RxJS **~7.8**, zone.js **~0.14.3**
- **UI**: Angular Material **17.3.x** (tema pré-construído `indigo-pink`), Angular CDK **17.3.x**, SCSS, fonte Roboto + Material Icons
- **HTTP**: `HttpClient` via `provideHttpClient()` em `app.config.ts`. Sem interceptor HTTP. Sem `fetch` / `axios`.
- **Roteamento**: `provideRouter(routes)` em `src/app/app.routes.ts`. Bootstrap: `AppComponent` só renderiza `<router-outlet>`.
- **Forms**: Reactive Forms (`FormBuilder` + `Validators`).
- **Estado**: sem NgRx. Sem feature modules. Sem `NgModule` de feature. Estado de tela no componente. `HeaderMenuComponent` já usa **signals**; telas antigas (painel-rolagem, carteira) ainda usam campos mutáveis — **não replicar esse débito** em telas novas (usar signals + `OnPush`).
- **Backend**: API REST aberta CarteiraOpcoes em `environment.apiBaseUrl` (`http://localhost:8080/api` em dev e prod atuais). O Painel **não** cria API nem banco.
- **Python**: **não existe** no frontend nem como microserviço deste repositório.
- **Auth**: nenhuma. Sem JWT, interceptor de auth, login ou API key (BR-UI-21).
- **Persistência no cliente**: nenhuma para simulação (BR-UI-22 / BR-14). Carteira persiste **no backend**. Sem `localStorage` / `sessionStorage` para estado de feature.
- **Testes**: Karma + Jasmine (`ng test`). Serviços: `provideHttpClient()` + `provideHttpClientTesting()` (equivalente moderno a `HttpClientTestingModule`, já usado em `rolagem-api.service.spec.ts` e `carteira-api.service.spec.ts`). Componentes: `TestBed` / `ComponentFixture`. Cypress existe no AGENTS.md para fluxos críticos, mas **não** é obrigatório por feature — só se a spec pedir.
- **Deploy**: Docker Compose (`painel-opcoes` na porta 4200, Nginx em produção). Sem variável de ambiente nova para a API: reusar `environment.apiBaseUrl` (ADR-006).
- **Idioma**: Português (BR) em código, commits, PRs e documentação. Sem i18n.

---

## Estrutura de pastas estabelecida

Não criar `src/app/features/`. Models ficam em `src/app/models/`. Serviços em `src/app/services/`. Telas em `src/app/components/{kebab-case}/`.

```
src/
├── app/
│   ├── components/
│   │   ├── header-menu/              # menu compartilhado (todas as telas de produto)
│   │   ├── landing-page/             # rota /
│   │   ├── painel-rolagem/           # rota /painel-rolagem (eager)
│   │   ├── carteira/                 # rota /carteira (lazy)
│   │   ├── criar-carteira/           # rota /carteira/criar (lazy)
│   │   ├── adicionar-opcao/          # rota /carteira/:id/adicionar-opcao (lazy)
│   │   ├── simulacao-meta-premio/    # rota /simulacao-meta-premio (lazy) — F-024
│   │   └── gestao-acoes/             # rota /acoes (lazy) — F-027
│   ├── models/                       # interfaces e enums (sem pasta features/)
│   ├── services/                     # HttpClient, providedIn: 'root'
│   ├── utils/                        # funções puras (formatação, validators) — F-024
│   ├── testing/                      # helpers de teste (ex.: mock-router)
│   ├── app.component.ts              # só <router-outlet>
│   ├── app.config.ts                 # provideRouter, provideHttpClient, provideAnimationsAsync
│   └── app.routes.ts
├── environments/
│   ├── environment.ts                # apiBaseUrl dev
│   └── environment.prod.ts           # apiBaseUrl prod (fileReplacements no angular.json)
├── main.ts
├── index.html
└── styles.scss
```

Convenções de arquivo de componente: `{nome}.component.ts` + `.html` + `.scss` + `.spec.ts`.

---

## Componentes e serviços compartilhados

| Componente | Local | Propósito | Notas |
|------------|-------|-----------|-------|
| `HeaderMenuComponent` | `components/header-menu/` | Navegação compartilhada | Importar no template de **toda** tela de produto. Não remover nem renomear itens existentes ao incluir um novo (BR-UI-08). Já usa `inject()` e signals. |
| `AppComponent` | `app.component.ts` | Bootstrap | Apenas `RouterOutlet`. Não colocar header aqui. |
| `environment.apiBaseUrl` | `src/environments/` | Base HTTP | Sempre concatenar paths a partir daqui. Sem URL hardcoded nova. Sem env var extra. |
| `ApiError` | `models/api-errors.model.ts` | Classe base de erro de API | Estender para erros de domínio com `mensagem` (ex.: `CarteiraDuplicadaError`, `SimulacaoMetaPremioError`). |
| `provideHttpClient()` | `app.config.ts` | HTTP global | Sem interceptor. Não adicionar `HTTP_INTERCEPTORS` sem spec. |
| `Modalidade` | `models/modalidade.enum.ts` | `AMERICANA` / `EUROPEIA` | Reusar; não duplicar enum. |

### Serviços HTTP existentes

| Service | Endpoints | Observação |
|---------|-----------|------------|
| `RolagemApiService` | `GET /rolagem/por-tipo` | `HttpParams`; `inject(HttpClient)`; `environment.apiBaseUrl` |
| `CarteiraApiService` | `POST/GET /carteiras`, opções da carteira | `catchError` mapeia 409/404 para subclasses de `ApiError`; mapping de payload legado em `listarOpcoesCarteira` (ADR-007) |
| `AcaoApiService` | `GET /acoes`, `POST /acoes` | F-024 `listar`: falha → genérico, **sem** ler `mensagem`. F-027 `criar`: 4xx → `mensagem` (BR-UI-28); 5xx/rede → genérico de cadastro |
| `SimulacaoMetaPremioApiService` | `GET /simulacao-meta-premio` | F-024. 4xx com envelope → `SimulacaoMetaPremioError` com `mensagem`; 5xx/rede → mensagem genérica da spec |
| `AtualizacaoApiService` | `POST /atualizacao/executar` | F-027. Qualquer falha → mensagem genérica de cotações |

Padrão de serviço novo:

- `@Injectable({ providedIn: 'root' })`
- `private readonly http = inject(HttpClient)`
- `private readonly baseUrl = environment.apiBaseUrl`
- Sem lógica de negócio/cálculo além de HTTP + mapeamento de erro (+ parse JSON se necessário)
- Sem guardar resultado de tela em singleton (estado da tela morre com o componente)

---

## Contrato de erro (consumido da API)

Corpo plano (nunca `{ "error": { "code", "message" } }`):

```json
{
  "timestamp": "<ISO-8601>",
  "status": 422,
  "erro": "SCREAMING_SNAKE_CASE",
  "mensagem": "Descrição legível",
  "detalhes": []
}
```

No cliente Angular, o JSON vive em `HttpErrorResponse.error`. Tipar com type guard (`unknown` → objeto com `mensagem?: string` e `erro?: string`). **Nunca `any`.**

| Situação | Tratamento no Painel |
|----------|----------------------|
| 4xx de fluxos que a spec manda exibir `mensagem` (simulação, carteira duplicada, etc.) | Ler `error.error.mensagem`; se ausente/vazia, fallback genérico da spec |
| 5xx ou rede (`status === 0` ou falha sem envelope) | Mensagem genérica da spec; não exibir stack nem corpo técnico |
| `GET /acoes` qualquer falha (4xx, 5xx ou rede) | Sempre mensagem genérica; **não** ler o envelope (BR-UI-13 / AC-05) |
| `POST /acoes` 4xx | Exibir `mensagem`; fallback genérico de cadastro se ausente (BR-UI-28) |
| `POST /atualizacao/executar` qualquer falha | Mensagem genérica de atualização (F-027) |
| HTTP 200 com lista vazia quando a spec define sucesso vazio | Não é erro (ex.: simulação BR-27; lista de ações cadastradas vazia na F-027) |

Códigos de erro da simulação (F-023, só para identificar casos de teste; a UI **não** exibe o campo `erro`):

| HTTP | `erro` |
|------|--------|
| 400 | `PARAMETRO_AUSENTE`, `PARAMETRO_TIPO_INVALIDO`, `TIPO_INVALIDO` |
| 404 | `ACAO_NAO_ENCONTRADA` |
| 422 | `META_PREMIO_INVALIDA`, `PRECO_SPOT_INDISPONIVEL`, `VENCIMENTO_MENSAL_NAO_ENCONTRADO` |
| 500 | `ERRO_INTERNO` |

---

## Autenticação

- Nenhuma. Todas as rotas e todas as chamadas HTTP são públicas.
- Não propor login, guard, interceptor de token ou cookie de sessão a menos que a spec exija.

---

## Persistência e banco

O Painel **não** possui schema, migration, IndexedDB nem cache de simulação. Dados de carteira, opções e **ações cadastradas** vivem no backend. Tela de simulação é stateless: destruir o componente ao sair da rota zera form, resultado e erro (BR-14 / BR-UI-22). Tela de gestão de ações relista no `ngOnInit` ao reentrar (F-027 AC-17).

---

## Convenções de API consumida

- Paths kebab-case português sob `{apiBaseUrl}` (`/acoes`, `/simulacao-meta-premio`, `/rolagem/por-tipo`, `/carteiras`, `/atualizacao/executar`).
- JSON camelCase.
- Datas de API `YYYY-MM-DD`; tela `DD/MM/YYYY` (BR-UI-01).
- Query de leitura via `HttpParams` em GET (não POST de busca).
- Sem paginação padronizada; não inventar envelope `{ data, pagination }`.
- Sem prefixo `/v1/`.

### Endpoints já consumidos pelo Painel

| Método | Path relativo a `apiBaseUrl` | Tela / serviço |
|--------|------------------------------|----------------|
| GET | `/rolagem/por-tipo` | `RolagemApiService` |
| GET | `/carteiras?status=ATIVA` | `CarteiraApiService` |
| POST | `/carteiras` | `CarteiraApiService` |
| GET | `/carteiras/{id}/opcoes` | `CarteiraApiService` |
| POST | `/carteiras/{id}/opcoes/{nomeOpcao}` | `CarteiraApiService` |
| PUT | `/carteiras/{id}/opcoes/{nomeOpcao}` | `CarteiraApiService` |
| GET | `/acoes` | `AcaoApiService` (F-024 / F-027) |
| POST | `/acoes` | `AcaoApiService.criar` (F-027) |
| POST | `/atualizacao/executar` | `AtualizacaoApiService` (F-027) |
| GET | `/simulacao-meta-premio` | `SimulacaoMetaPremioApiService` (F-024 / F-026) |

Não consumir `GET /acoes/{nomeAcao}` nesta feature: o seletor usa a listagem.

---

## Rotas estabelecidas

| Path | Carga | Componente | Menu |
|------|-------|------------|------|
| `''` | eager | `LandingPageComponent` | Home |
| `painel-rolagem` | eager | `PainelRolagemComponent` | Busca de Rolagens |
| `simulacao-meta-premio` | **lazy** `loadComponent` | `SimulacaoMetaPremioComponent` | Meta de Prêmio |
| `acoes` | **lazy** `loadComponent` | `GestaoAcoesComponent` | Ações |
| `carteira` | lazy | `CarteiraComponent` | Carteira |
| `carteira/criar` | lazy | `CriarCarteiraComponent` | (fluxo Carteira) |
| `carteira/:id/adicionar-opcao` | lazy | `AdicionarOpcaoComponent` | (fluxo Carteira) |
| `**` | redirect `''` | — | — |

Telas novas de produto: **lazy `loadComponent`**, no padrão carteira — não eager como `painel-rolagem` (débito histórico da landing).

Ordem do menu (F-027): Home, Busca de Rolagens, Meta de Prêmio, Ações, Carteira.

---

## Padrões TypeScript / Angular (obrigatórios)

Alinhados a `AGENTS.md` e ADRs aceitos:

| Padrão | Regra |
|--------|-------|
| Injeção | `inject()`, nunca constructor injection (ADR-005). Dependências `private readonly`. |
| `any` | Proibido. Usar `unknown`, generics, type guards. |
| DTOs | Propriedades `readonly` nas interfaces novas. |
| Funções | ≤ 20 linhas; decompor com `private` methods ou funções puras em `utils/`. |
| CD | `ChangeDetectionStrategy.OnPush` em componentes novos. |
| Listas | `trackBy` em `*ngFor` / `mat-table`. |
| Negócio | Sem recálculo de quantidade/notional/ROI/moneyness no cliente (BR-UI-05). HTTP só em services. |
| HTTP | Somente `HttpClient`. Erros com `catchError` no pipe. |
| Forms | Reactive Forms; botão desabilitado se inválido ou request em voo (BR-UI-11). |
| Loading | `mat-spinner` (BR-UI-12). |
| Visual | Invocar skill **frontend-design** na implementação de HTML/SCSS de tela nova. WCAG 2.1 AA, contraste ≥ 4,5:1, foco visível, teclado (BR-UI-20). |

### Débito conhecido — não copiar

- `PainelRolagemComponent` **não** usa `OnPush` e muta `resultado` / `carregando` / `erro` como campos.
- `CarteiraComponent` usa `OnPush` mas campos mutáveis + `ChangeDetectorRef.markForCheck()`.
- Alguns serviços/componentes antigos ainda têm `constructor()` vazio além de `inject()` — telas novas não precisam disso.

Telas novas: **signals** para estado (`acoes`, `resultado`, `erro*`, `carregando*`) + `OnPush`. `signal.set()` dispara CD; não usar `ChangeDetectorRef` para este fluxo.

---

## Models e enums existentes (reusar)

| Arquivo | Conteúdo |
|---------|----------|
| `modalidade.enum.ts` | `AMERICANA`, `EUROPEIA` |
| `tipo-rolagem.enum.ts` | tipos de rolagem |
| `status-carteira.enum.ts` | `ATIVA`, `INATIVA` |
| `situacao-opcao.enum.ts` | `ABERTA`, `EXERCIDA`, `ROLADA`, `FINALIZADA` |
| `api-errors.model.ts` | `ApiError` + erros de carteira + `SimulacaoMetaPremioError` (F-024) + `AcaoCadastroError` (F-027) |
| `opcao.model.ts` | opção da busca de rolagem (`nome`, `premio`, `strike`, `delta`, `modalidade`) — **não** é o item da simulação |
| `acao.model.ts` | F-024/F-027: `nomeAcao`, `nomeCompleto`, `precoSpot: number \| null`, `dataAtualizacao?: string` |
| `tipo-opcao.enum.ts` | F-024: `CALL`, `PUT` |
| `moneyness.enum.ts` | F-024: `ITM`, `ATM`, `OTM` |
| `tipo-notional.enum.ts` | F-024: `ACOES`, `CAIXA` |
| `simulacao-opcao-item.model.ts` | F-024 |
| `simulacao-meta-premio-response.model.ts` | F-024 |

Não reusar `Opcao` da rolagem como linha da tabela de simulação: campos e contrato são diferentes (`valorPremio` vs `premio`, notional, ROI, moneyness).

---

## Docker e environment

- `environment.apiBaseUrl` já é `http://localhost:8080/api` (dev e prod atuais).
- `angular.json` já faz `fileReplacements` de `environment.ts` → `environment.prod.ts`.
- F-024 **não** adiciona env var, não altera Dockerfile nem `docker-compose.yml`.

---

## ADRs de projeto (não contradizer)

| ADR | Decisão |
|-----|---------|
| ADR-001 (SDD global) | Standalone components, sem NgModule de feature |
| ADR-002 (SDD global) | Angular Material, tema `indigo-pink` |
| ADR-003 (SDD global) | Reactive Forms |
| ADR-004 (SDD global) | GET + `HttpParams` para leitura |
| ADR-005 | `inject()` em vez de constructor injection |
| ADR-006 | `environment.apiBaseUrl` para a API |
| ADR-007 | `OpcaoCarteira.nomeOpcao`; mapping no `CarteiraApiService`; sem interceptor global |

ADRs de feature vivem no `architecture.md` da feature quando o trade-off for pequeno. Só criar `docs/adrs/ADR-00N-*.md` se o trade-off for de projeto (afeta várias features ou contradiz ADR aceito).

---

## Changelog

- 2026-10-01 · Knowledge base de arquitetura do frontend criada a partir do código (`src/app`, environments, rotas, serviços, `api-errors`), `docs/sdd.md`, ADR-005/006/007 e `AGENTS.md`.
- 2026-10-01 · F-024: rota lazy `/simulacao-meta-premio`; item de menu "Meta de Prêmio"; `AcaoApiService` + `SimulacaoMetaPremioApiService`; models/enums de simulação; `SimulacaoMetaPremioError`; `src/app/utils/` para formatação e validator `maiorQueZero`; padrão signals + OnPush para tela nova; sem persistência, sem interceptor, sem env var nova.
- 2026-10-02 · F-026: seletor de modo na mesma tela; `SimulacaoRequest`; validators `multiploDeCem`; sem rota nova.
- 2026-10-02 · F-027: rota lazy `/acoes`; item de menu "Ações"; `AcaoApiService.criar`; `AtualizacaoApiService`; `AcaoCadastroError`; `dataAtualizacao` opcional em `Acao`; sem DELETE no cliente.
