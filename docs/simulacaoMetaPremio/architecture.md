# Architecture: F-024 Tela de Simulação de Meta de Prêmio

## Overview

Tela Angular standalone na rota `/simulacao-meta-premio`, acessível pelo item de menu **Meta de Prêmio**. O Painel **não** calcula quantidade, notional, ROI nem moneyness e **não** persiste nada: coleta Ação, Meta de prêmio e Tipo, consome a API F-023 (`GET /acoes` e `GET /simulacao-meta-premio`) e formata o cabeçalho + tabela. Estado vive em **signals** no componente (`OnPush`); sair da rota destrói o componente e zera formulário, resultado e erro (BR-14 / BR-UI-22). HTML/SCSS desta tela serão refinados na implementação pela skill **frontend-design**.

## Knowledge base references

- Shared components reused: `HeaderMenuComponent`, `environment.apiBaseUrl`, `ApiError`, `Modalidade`, `provideHttpClient()`, Reactive Forms, Angular Material (`MatTable`, `MatSelect`, `MatSpinner`, form fields)
- Existing tables extended: none (N/A no frontend)
- Existing endpoints affected: none criados; **consumidos** `GET /acoes` e `GET /simulacao-meta-premio` (contrato F-023, sem redesenho)
- ADRs applied: ADR-001 (standalone), ADR-002 (Material), ADR-003 (Reactive Forms), ADR-004 (`HttpParams` em GET), ADR-005 (`inject()`), ADR-006 (`apiBaseUrl`)
- New project-level ADRs proposed: none (trade-offs desta feature cabem na tabela e nos ADRs de feature abaixo; próximo arquivo em `docs/adrs/` seria ADR-008, desnecessário aqui)

## Component diagram (text)

```
Navegador
  |
  |  menu "Meta de Prêmio"  →  /simulacao-meta-premio  (lazy loadComponent)
  v
AppComponent
  └── <router-outlet>
        └── SimulacaoMetaPremioComponent   (standalone, OnPush, signals)
              ├── HeaderMenuComponent      (compartilhado)
              ├── FormGroup (Ação, metaPremio, tipo)
              ├── AcaoApiService           GET {apiBaseUrl}/acoes
              └── SimulacaoMetaPremioApiService
                    GET {apiBaseUrl}/simulacao-meta-premio?nomeAcao=&metaPremio=&tipo=
                          |
                          v
                    API CarteiraOpcoes (F-023)   http://localhost:8080/api
                          |
                          x  sem banco no Painel
                          x  sem fila / Python / interceptor / localStorage
```

## Technology decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Padrão | Monolithic standalone components; sem NgRx; sem feature module | Espelha o Painel (ADR-001). Uma tela, estado local, sem store global. |
| Rota | `path: 'simulacao-meta-premio'` + `loadComponent` lazy | Padrão carteira. `painel-rolagem` eager é débito da landing; tela operacional nova não precisa no bundle inicial. |
| Injeção / CD | `inject()` (ADR-005); `ChangeDetectionStrategy.OnPush` | Convenção AGENTS.md. Signals disparam CD no OnPush sem `ChangeDetectorRef`. |
| Estado da tela | Signals (`acoes`, `erroAcoes`, `carregandoAcoes`, `resultado`, `erroSimulacao`, `carregandoSimulacao`) + `toSignal(form.statusChanges)` para `podeSimular` | painel-rolagem/carteira mutam campos — débito. Signals + OnPush são o padrão correto para esta feature. |
| Persistência | Nenhuma. Sem service singleton guardando resultado | BR-14 / BR-UI-22 / AC-17: destruir a rota zera tudo. Serviços `providedIn: 'root'` só fazem HTTP. |
| Forms | Reactive Forms; `FormBuilder` via `inject()`; Tipo sem default; `metaPremio`: `Validators.required` + validator exclusivo `maiorQueZero` (rejeita 0) | `Validators.min(0)` aceita 0 e falharia AC-02. Tipo vazio força escolha explícita (BR-UI-18). |
| Serviços | Dois: `AcaoApiService` e `SimulacaoMetaPremioApiService` | Mapeamento de erro é **oposto** (ações: nunca ler `mensagem`; simulação 4xx: exibir `mensagem`). Um serviço misturaria contratos. Nenhum service lista ações hoje. |
| Models | `src/app/models/` (não `features/`) | Padrão atual do repositório. |
| Enums | Novos `TipoOpcao`, `Moneyness`, `TipoNotional`; reusar `Modalidade` | `Opcao` da rolagem não serve como linha da simulação (`premio` vs `valorPremio`, sem notional/ROI). |
| Formatação | Funções puras em `src/app/utils/formatacao.ts` + validator em `src/app/utils/maior-que-zero.validator.ts` | AC-15 testável sem TestBed de componente. Cliente **não** recalcula quantidade/notional/ROI. |
| Tabela | `mat-table` + `trackBy` no ticker (`nome`); wrapper com `overflow-x: auto` | AC-06/AC-18. Todas as colunas na ordem da spec; classe CSS na linha ITM. |
| Visual | Skill **frontend-design** na implementação HTML/SCSS | Spec exige hierarquia, destaque ITM, espaçamento e tabela; não prescreve cor. Contraste ≥ 4,5:1. |
| HTTP | Sem interceptor novo; sem auth; `HttpParams` no GET de simulação | ADR-004/006; API aberta. |
| Environment | Reusar `environment.apiBaseUrl`; sem env var nova | Já aponta para `http://localhost:8080/api`. |
| Testes | Karma + Jasmine (`ng test`); HTTP testing no padrão existente (`provideHttpClient` + `provideHttpClientTesting`); TestBed no componente | Sem Cypress nesta feature (fora do escopo da spec). |
| Docker | Inalterado | Sem persistência nem URL nova. |

## API contract

Contrato **consumido** (F-023). O Painel não redefine fórmulas, ordenação nem códigos de erro. `apiBaseUrl` = `environment.apiBaseUrl`.

### Endpoint: GET `{apiBaseUrl}/acoes`

- **Auth**: nenhuma
- **Request body**: nenhum
- **Query**: nenhuma
- **Uso na UI**: carga ao entrar na rota (`ngOnInit` → `carregarAcoes`). Alimenta o seletor (BR-UI-17 / AC-03). `precoSpot` **não** filtra o seletor (ação com spot nulo permanece listada).

- **Response 200**: array JSON (sem wrapper). Campos usados:

```json
[
  {
    "nomeAcao": "string // valor do seletor e query da simulação",
    "nomeCompleto": "string // rótulo visível junto ao ticker (BR-UI-19)",
    "precoSpot": "number|null // ignorado no seletor; spot da simulação vem do outro GET"
  }
]
```

Campos extras do backend (`dataCriacao`, `dataAtualizacao`) são ignorados pelo model do Painel.

- **Mapeamento UI**:

  | Resposta | UI |
  |----------|-----|
  | 200 com ≥ 1 item | `mat-select`: cada opção mostra `nomeAcao` + `nomeCompleto`; usuário seleciona o ticker |
  | 200 `[]` | seletor sem opções; texto **"Nenhuma ação disponível para simulação."**; **Simular** desabilitado (AC-04) |
  | 4xx, 5xx ou rede | **não** ler `mensagem`; texto **"Não foi possível carregar as ações. Tente novamente."**; seletor vazio (não indefinido); **Simular** desabilitado (AC-05) |

- **Error responses** (backend; o cliente trata todas as falhas como genéricas):

  | Status | Code | Condition | UI |
  |--------|------|-----------|-----|
  | 4xx | qualquer | envelope possível | mensagem genérica de ações |
  | 5xx | `ERRO_INTERNO` | catch-all | mensagem genérica de ações |
  | rede | — | `status === 0` / falha de conexão | mensagem genérica de ações |

### Endpoint: GET `{apiBaseUrl}/simulacao-meta-premio`

- **Auth**: nenhuma
- **Request body**: nenhum
- **Query parameters** (obrigatórios; só dispara com form válido — AC-02):

  | Param | Tipo | Obrigatório | Origem na UI |
  |-------|------|-------------|--------------|
  | `nomeAcao` | string | sim | Ação selecionada (`Acao.nomeAcao`) |
  | `metaPremio` | decimal > 0 | sim | campo Meta de prêmio; serializar com `toString()` **sem** locale (`1000` ou `1000.5`, nunca `1.000,50`) |
  | `tipo` | `CALL` \| `PUT` | sim | enum `TipoOpcao` em maiúsculas |

- **Request example**:
  ```
  GET {apiBaseUrl}/simulacao-meta-premio?nomeAcao=BBAS3&metaPremio=1000&tipo=CALL
  ```

- **Response 200**:

```json
{
  "nomeAcao": "string",
  "nomeCompleto": "string",
  "precoSpot": "number",
  "metaPremio": "number",
  "tipo": "string // CALL | PUT",
  "dataVencimento": "string // YYYY-MM-DD",
  "diasAteVencimento": "integer",
  "quantidadeOperacoes": "integer",
  "opcoes": [
    {
      "nome": "string",
      "tipo": "string // CALL | PUT",
      "modalidade": "string // AMERICANA | EUROPEIA",
      "strike": "number",
      "valorPremio": "number",
      "percentualVsSpot": "number // razão",
      "moneyness": "string // ITM | ATM | OTM",
      "avisoExercicio": "string|null",
      "dataVencimento": "string // YYYY-MM-DD",
      "diasAteVencimento": "integer",
      "quantidadeAcoes": "integer",
      "notional": "number",
      "tipoNotional": "string // ACOES | CAIXA",
      "premioEstimado": "number",
      "roiOperacao": "number // razão",
      "roiAnualizadoSimples": "number // razão"
    }
  ]
}
```

- **Response 200 — lista vazia (BR-27 / AC-08)**: cabeçalho preenchido; `"quantidadeOperacoes": 0`; `"opcoes": []`. **Não** é erro: exibir cabeçalho + **"Nenhuma opção disponível para os parâmetros informados neste vencimento."**

- **Ordenação de `opcoes`**: a da API. Cliente **não** reordena (BR-UI-06).

- **Mapeamento UI do 200**:

  | Campo API | Onde | Formatação |
  |-----------|------|------------|
  | `nomeAcao`, `nomeCompleto`, `tipo` | cabeçalho | texto |
  | `precoSpot`, `metaPremio` | cabeçalho | monetário 2 casas pt-BR |
  | `dataVencimento` | cabeçalho | `DD/MM/YYYY` |
  | `diasAteVencimento`, `quantidadeOperacoes` | cabeçalho | inteiro |
  | colunas da tabela (ordem abaixo) | `mat-table` | ver TypeScript design / AC-06–AC-07 / AC-15 |

- **Error responses** (simulação):

  | Status | Code (`erro`) | Condition | UI |
  |--------|------|-----------|-----|
  | 400 | `PARAMETRO_AUSENTE` | query incompleta | exibir `mensagem` (não esperado após validação de cliente) |
  | 400 | `PARAMETRO_TIPO_INVALIDO` | `metaPremio` não numérico | exibir `mensagem` |
  | 400 | `TIPO_INVALIDO` | tipo ∉ {CALL, PUT} | exibir `mensagem` |
  | 404 | `ACAO_NAO_ENCONTRADA` | ticker inexistente | exibir `mensagem` (AC-09) |
  | 422 | `META_PREMIO_INVALIDA` | `metaPremio` ≤ 0 | exibir `mensagem` (AC-10) |
  | 422 | `PRECO_SPOT_INDISPONIVEL` | spot nulo ou ≤ 0 | exibir `mensagem` (AC-11) |
  | 422 | `VENCIMENTO_MENSAL_NAO_ENCONTRADO` | sem MENSAL ABERTA futura | exibir `mensagem` (AC-12) |
  | 500 | `ERRO_INTERNO` | catch-all | **"Não foi possível concluir a simulação. Tente novamente."** (AC-13) |
  | rede | — | `status === 0` | mesma mensagem genérica de AC-13 |

Corpo 4xx (sempre `ErroResponse`):

```json
{
  "timestamp": "2026-10-01T14:00:00",
  "status": 422,
  "erro": "META_PREMIO_INVALIDA",
  "mensagem": "metaPremio deve ser maior que zero",
  "detalhes": []
}
```

A UI **não** exibe `timestamp`, `status`, `erro` nem `detalhes`. Texto visível = `mensagem`. Se `mensagem` ausente/não-string/vazia → fallback da mensagem genérica de simulação (AC-13).

Mapeamento no `SimulacaoMetaPremioApiService`:

1. `status >= 400 && status < 500` e envelope parseável → `throwError(() => new SimulacaoMetaPremioError(mensagem, status, codigo?))`
2. 5xx, rede, ou 4xx sem envelope útil → `throwError` com a mensagem genérica de simulação (classe `SimulacaoMetaPremioError` ou `Error`; o componente exibe `err.message`)

O componente **não** faz switch por código `erro`: AC-09 a AC-12 diferem só pelo payload mockado nos testes.

## Database schema

N/A. Esta feature não cria tabela, migration, IndexedDB nem `localStorage`. A simulação é stateless no backend (BR-14) e no cliente (BR-UI-22): o resultado, o erro e os três campos do formulário existem só enquanto `SimulacaoMetaPremioComponent` está montado. Sair da rota destrói o componente (comportamento padrão do Router, sem `providers` no `Route`) e a reentrada dispara de novo `GET /acoes` com form no estado inicial. Não há schema para documentar.

## TypeScript / Angular-specific design

### Estrutura de arquivos

**Criar**

```
src/app/components/simulacao-meta-premio/
  simulacao-meta-premio.component.ts
  simulacao-meta-premio.component.html
  simulacao-meta-premio.component.scss
  simulacao-meta-premio.component.spec.ts
src/app/services/acao-api.service.ts
src/app/services/acao-api.service.spec.ts
src/app/services/simulacao-meta-premio-api.service.ts
src/app/services/simulacao-meta-premio-api.service.spec.ts
src/app/models/acao.model.ts
src/app/models/simulacao-meta-premio-response.model.ts
src/app/models/simulacao-opcao-item.model.ts
src/app/models/tipo-opcao.enum.ts
src/app/models/moneyness.enum.ts
src/app/models/tipo-notional.enum.ts
src/app/utils/formatacao.ts
src/app/utils/formatacao.spec.ts
src/app/utils/maior-que-zero.validator.ts
src/app/utils/maior-que-zero.validator.spec.ts
```

**Alterar**

```
src/app/app.routes.ts                                      # rota lazy
src/app/components/header-menu/header-menu.component.ts    # item "Meta de Prêmio"
src/app/components/header-menu/header-menu.component.spec.ts  # 3 → 4 itens
src/app/models/api-errors.model.ts                         # SimulacaoMetaPremioError
```

**Não alterar**: `docs/sdd.md` (global), `app.config.ts`, environments, Docker, interceptor, telas de Rolagem/Carteira (exceto o menu compartilhado), repositório `CarteiraOpcoesDevin`.

### Models e enums (assinaturas)

```typescript
// tipo-opcao.enum.ts
export enum TipoOpcao {
  CALL = 'CALL',
  PUT = 'PUT'
}

// moneyness.enum.ts
export enum Moneyness {
  ITM = 'ITM',
  ATM = 'ATM',
  OTM = 'OTM'
}

// tipo-notional.enum.ts
export enum TipoNotional {
  ACOES = 'ACOES',
  CAIXA = 'CAIXA'
}

// acao.model.ts
export interface Acao {
  readonly nomeAcao: string;
  readonly nomeCompleto: string;
  readonly precoSpot: number | null;
}

// simulacao-opcao-item.model.ts
export interface SimulacaoOpcaoItem {
  readonly nome: string;
  readonly tipo: TipoOpcao;
  readonly modalidade: Modalidade;
  readonly strike: number;
  readonly valorPremio: number;
  readonly percentualVsSpot: number;
  readonly moneyness: Moneyness;
  readonly avisoExercicio: string | null;
  readonly dataVencimento: string;
  readonly diasAteVencimento: number;
  readonly quantidadeAcoes: number;
  readonly notional: number;
  readonly tipoNotional: TipoNotional;
  readonly premioEstimado: number;
  readonly roiOperacao: number;
  readonly roiAnualizadoSimples: number;
}

// simulacao-meta-premio-response.model.ts
export interface SimulacaoMetaPremioResponse {
  readonly nomeAcao: string;
  readonly nomeCompleto: string;
  readonly precoSpot: number;
  readonly metaPremio: number;
  readonly tipo: TipoOpcao;
  readonly dataVencimento: string;
  readonly diasAteVencimento: number;
  readonly quantidadeOperacoes: number;
  readonly opcoes: readonly SimulacaoOpcaoItem[];
}
```

Reusar `Modalidade` existente. Não reusar `Opcao` da rolagem.

### Erro (estender `ApiError`)

```typescript
// em api-errors.model.ts
export class SimulacaoMetaPremioError extends ApiError {
  constructor(message: string, status: number, code?: string)
}
```

`AcaoApiService` **não** precisa de classe específica: qualquer falha propaga com a mensagem genérica de ações (ou o componente substitui `err.message` por essa constante). Preferência: o service já lança `Error`/`ApiError` com o texto fixo, para a UI só pintar `err.message`.

Constantes de mensagem (componente ou `utils`; textos literais da spec):

| Constante | Texto |
|-----------|--------|
| lista vazia de ações | `Nenhuma ação disponível para simulação.` |
| falha GET acoes | `Não foi possível carregar as ações. Tente novamente.` |
| `opcoes = []` | `Nenhuma opção disponível para os parâmetros informados neste vencimento.` |
| 5xx/rede simulação (e fallback 4xx sem `mensagem`) | `Não foi possível concluir a simulação. Tente novamente.` |

### Serviços (assinaturas, não implementação)

```typescript
@Injectable({ providedIn: 'root' })
export class AcaoApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  listar(): Observable<Acao[]>;
  // GET `${baseUrl}/acoes`
  // catchError: 4xx/5xx/rede → throwError com mensagem genérica de ações
  // NÃO ler error.error.mensagem
}

@Injectable({ providedIn: 'root' })
export class SimulacaoMetaPremioApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  simular(nomeAcao: string, metaPremio: number, tipo: TipoOpcao): Observable<SimulacaoMetaPremioResponse>;
  // GET `${baseUrl}/simulacao-meta-premio` + HttpParams
  // 4xx + envelope → SimulacaoMetaPremioError(mensagem || genérica, status, erro?)
  // 5xx/rede → mensagem genérica de simulação
}
```

Helper interno (private no service de simulação, sem `any`):

```typescript
private extrairEnvelope(error: unknown): { mensagem?: string; erro?: string } | undefined;
```

Type guard sobre `HttpErrorResponse.error` quando for objeto. Sem interceptor.

### Validator e formatação (funções puras)

```typescript
// maior-que-zero.validator.ts
export function maiorQueZero(): ValidatorFn;
// vazio → null (Validators.required cobre); NaN, ≤ 0 → { maiorQueZero: true }

// formatacao.ts
export function formatarDataIso(data: string): string;
// "2026-10-16" → "16/10/2026"

export function formatarMonetario(valor: number): string;
// Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function formatarPercentual(razao: number): string;
// razão × 100, 2 casas pt-BR, sufixo "%". Ex.: 0.0363 → "3,63%"; -0.0028 → "-0,28%"

export function formatarTipoNotional(tipo: TipoNotional): string;
// ACOES → "Ações"; CAIXA → "Caixa"
```

Não recalcular `quantidadeAcoes`, `notional`, `premioEstimado`, ROI, moneyness nem `percentualVsSpot`.

### Componente (assinaturas)

```typescript
@Component({
  selector: 'app-simulacao-meta-premio',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, HeaderMenuComponent,
    MatFormFieldModule, MatSelectModule, MatInputModule, MatButtonModule,
    MatCardModule, MatTableModule, MatProgressSpinnerModule
  ],
  templateUrl: './simulacao-meta-premio.component.html',
  styleUrls: ['./simulacao-meta-premio.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimulacaoMetaPremioComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly acaoApi = inject(AcaoApiService);
  private readonly simulacaoApi = inject(SimulacaoMetaPremioApiService);
  // takeUntilDestroyed() nas subscriptions HTTP

  readonly form: FormGroup; // controles: nomeAcao, metaPremio, tipo — todos required; tipo inicial null/''; metaPremio + maiorQueZero()
  readonly tiposOpcao = Object.values(TipoOpcao); // sem default selecionado

  readonly acoes = signal<readonly Acao[]>([]);
  readonly carregandoAcoes = signal(false);
  readonly erroAcoes = signal<string | undefined>(undefined);

  readonly resultado = signal<SimulacaoMetaPremioResponse | undefined>(undefined);
  readonly carregandoSimulacao = signal(false);
  readonly erroSimulacao = signal<string | undefined>(undefined);

  readonly colunasTabela: readonly string[];
  // ordem: nome, tipo, modalidade, strike, valorPremio, percentualVsSpot,
  //        moneyness, avisoExercicio, dataVencimento, diasAteVencimento,
  //        quantidadeAcoes, notional, tipoNotional, premioEstimado,
  //        roiOperacao, roiAnualizadoSimples

  readonly podeSimular: Signal<boolean>;
  // form válido AND acoes.length > 0 AND !erroAcoes AND !carregandoAcoes AND !carregandoSimulacao

  ngOnInit(): void;           // carregarAcoes()
  carregarAcoes(): void;
  simular(): void;            // no-op se !form.valid; limpa resultado+erroSimulacao ANTES do GET (AC-14)
  trackByNomeOpcao(index: number, item: SimulacaoOpcaoItem): string; // item.nome
  formatarData(data: string): string;
  formatarMonetario(valor: number): string;
  formatarPercentual(razao: number): string;
  formatarTipoNotional(tipo: TipoNotional): string;
  isLinhaItm(item: SimulacaoOpcaoItem): boolean;
}
```

Formulário (ordem funcional AC-02): **Ação** (`mat-select`) → **Meta de prêmio** (`input` numérico) → **Tipo** (`mat-select` CALL/PUT sem valor inicial) → botão **Simular**. `(ngSubmit)="simular()"`. Enter só efetiva se o botão estiver habilitado / `form.valid` (early-return em `simular`).

`podeSimular` deve **ler** um signal derivado de `form.statusChanges` (`toSignal`) para permanecer reativo no OnPush.

Estados visuais (mesmo `mat-spinner` para carga de ações e simulação — BR-UI-12 / AC-05 / AC-14):

```
[INIT] --carregarAcoes--> [LOADING_ACOES] --200 itens--> [FORM_PRONTO]
                                          --200 []----> [ACOES_VAZIAS]   (Simular off)
                                          --falha-----> [ERRO_ACOES]     (genérico; Simular off)
[FORM_PRONTO] --simular--> [LOADING_SIM] --200 itens--> [RESULTADO]
                                        --200 []----> [VAZIO_BR27]     (cabeçalho + msg; não é erro)
                                        --4xx-------> [ERRO_SIM]       (mensagem da API)
                                        --5xx/rede--> [ERRO_SIM]       (genérico)
```

Ao disparar `simular`: `resultado.set(undefined)`; `erroSimulacao.set(undefined)` **antes** da resposta (AC-14).

### Rota

```typescript
{
  path: 'simulacao-meta-premio',
  loadComponent: () =>
    import('./components/simulacao-meta-premio/simulacao-meta-premio.component')
      .then(m => m.SimulacaoMetaPremioComponent),
  data: { title: 'Meta de Prêmio' }
}
```

Inserir **antes** do `path: '**'`. Sem `canActivate`. Sem `providers` na rota (garante destroy completo ao sair — AC-17).

### Menu

Em `HeaderMenuComponent.menuItems`, **acrescentar** sem remover os três existentes:

```typescript
{ label: 'Home', route: '/', icon: '🏠' },
{ label: 'Busca de Rolagens', route: '/painel-rolagem', icon: '🔍' },
{ label: 'Meta de Prêmio', route: '/simulacao-meta-premio', icon: /* frontend-design */ },
{ label: 'Carteira', route: '/carteira', icon: '💼' }
```

Ícone do item novo é decisão de **frontend-design**. Specs do header: atualizar `deve ter 3 itens` / `links.length === 3` para **4** e asserir o rótulo **Meta de Prêmio**.

### Template e CSS (contrato; visual via frontend-design)

- `<app-header-menu>` no topo (AC-16).
- Região de loading única (`mat-spinner`) quando `carregandoAcoes() || carregandoSimulacao()`.
- Slot `erroAcoes` vs `erroSimulacao` vs mensagem de lista vazia de opções: **três textos distintos**, para não misturar AC-04/AC-05/AC-08/AC-09.
- Wrapper da tabela: classe tipo `.tabela-wrapper { overflow-x: auto; }` (AC-18). Nenhuma coluna omitida por media query.
- Linha ITM: classe CSS no `mat-row` (ex. `linha-itm`) quando `moneyness === ITM`; exibir `avisoExercicio` (AC-06 / BR-UI-14). ATM/OTM: sem destaque de exercício; nulo não mostra texto.
- Foco visível nos controles Material; `aria-*` no spinner e nas mensagens de erro (`role="alert"`). Contraste ≥ 4,5:1.

Na implementação do HTML/SCSS, invocar a skill **frontend-design** (hierarquia do cabeçalho, densidade da tabela, destaque ITM, espaçamento, menu estreito já existente no header). Não prescrever paleta neste SDD além de WCAG.

### Testes

| Alvo | Casos mínimos (amarrados aos ACs) |
|------|-----------------------------------|
| `AcaoApiService` | GET `/acoes`; 200 lista; 200 `[]`; 4xx/5xx/rede **não** expõem `mensagem` do envelope |
| `SimulacaoMetaPremioApiService` | query params; 200 com item; 200 `opcoes=[]`; 404/422 expõem `mensagem`; 4xx sem `mensagem` → genérica; 500/rede → genérica |
| `formatacao` + `maiorQueZero` | AC-15; 0 inválido; vazio não conflita com `required` |
| Componente | form inicial (tipo vazio, Simular off); loading ações; seletor; vazia; erro genérico ações; simular 200; ITM; Caixa; BR-27; 4xx mensagem; 5xx genérica; limpa resultado antes; botão off durante request |
| Header | 4 itens; rótulo Meta de Prêmio; Home / Busca / Carteira permanecem |

Sem Cypress. `ng test` (nunca `npm test` como comando canônico do projeto).

## Python-specific design

N/A. O Painel é Angular/TypeScript. Não há serviço Python neste repositório.

## Cross-cutting concerns

- **Auth**: nenhuma. Rota e GETs públicos (BR-UI-21). Sem guard.
- **Logging**: nenhum campo extra. Não logar payload completo no console em produção; erros vão para a UI.
- **Error handling**: `SimulacaoMetaPremioError` estende `ApiError`. Sem interceptor. Sem novos códigos HTTP inventados no cliente.
- **Observability**: sem metrics/tracing nesta feature.
- **A11y / responsivo**: WCAG 2.1 AA, teclado, scroll horizontal da tabela (AC-18); detalhe visual na implementação com **frontend-design**.

## Mapeamento AC-01 .. AC-18 → implementação

| AC | Caminho de implementação |
|----|--------------------------|
| **AC-01** | `header-menu.component.ts` (`menuItems`) + `app.routes.ts` (`simulacao-meta-premio`). Teste do header atualizado para 4 itens. |
| **AC-02** | `SimulacaoMetaPremioComponent` form (3 campos nessa ordem); `tipo` sem default; `podeSimular` desliga o botão se inválido, loading de ações, loading de simulação ou lista de ações vazia/erro. |
| **AC-03** | `AcaoApiService.listar()` 200; template do `mat-select` mostra `nomeAcao` e `nomeCompleto`. |
| **AC-04** | 200 `[]` → signal `acoes = []` + mensagem fixa de lista vazia; `podeSimular` false. |
| **AC-05** | `carregandoAcoes` + mesmo `mat-spinner`; falha → `erroAcoes` genérico no `AcaoApiService` (sem envelope); sem botão de retry. |
| **AC-06** | `simular()` 200: cabeçalho do `resultado`; `mat-table` com todas as colunas na ordem; formatadores; `isLinhaItm` + `avisoExercicio`; números inalterados. |
| **AC-07** | `formatarTipoNotional(CAIXA)` → `"Caixa"`. |
| **AC-08** | 200 com `opcoes=[]`: manter `resultado`; **não** setar `erroSimulacao`; texto de ausência de opções. |
| **AC-09** | 404 + envelope → `SimulacaoMetaPremioError.mensagem`; sem tabela; `carregandoSimulacao=false` reabilita o botão via `podeSimular`. |
| **AC-10** | 422 `META_PREMIO_INVALIDA` → mesmo pipeline de `mensagem`. |
| **AC-11** | 422 `PRECO_SPOT_INDISPONIVEL` → `mensagem`. |
| **AC-12** | 422 `VENCIMENTO_MENSAL_NAO_ENCONTRADO` → `mensagem`. |
| **AC-13** | 500 ou rede no `SimulacaoMetaPremioApiService` → texto genérico de simulação. |
| **AC-14** | `simular()`: spinner; botão off; `resultado`/`erroSimulacao` limpos **antes** do subscribe; ao complete/error, spinner some. |
| **AC-15** | `formatacao.ts` (data, money pt-BR 2 casas, razões ×100 + `%`); `tipoNotional` via AC-06/07. |
| **AC-16** | `<app-header-menu>` no template do componente. |
| **AC-17** | Estado só em signals/form do componente; serviços sem cache; rota sem `providers`; reentrada → `ngOnInit` chama `carregarAcoes` de novo. |
| **AC-18** | `.tabela-wrapper { overflow-x: auto; }` no SCSS; colunas completas; form `ngSubmit`; foco Material; contraste na passagem **frontend-design**. |

## Risks & open items

- **HttpErrorResponse.error** pode ser objeto, string ou `ProgressEvent`. O type guard deve recair na mensagem genérica se não houver `mensagem` string — coberto por AC-13 / fallback 4xx.
- **`Validators.min(0)` é armadilha**: aceitaria 0. O validator `maiorQueZero` é obrigatório.
- **Débito OnPush em telas antigas**: não refatorar painel-rolagem/carteira nesta feature.
- Gate 1 W-01..W-04 estão fechados na spec (reset de form, 4xx de `/acoes` genérico, loading inicial, envelope no data model). Sem pergunta em aberto.

## Architecture Decision Records (feature-level)

### ADR-01: Lazy `loadComponent` vs eager (como painel-rolagem)

- **Status**: Accepted
- **Context**: Landing e painel-rolagem são eager; carteira já é lazy. A tela nova não é a rota raiz.
- **Decision**: Lazy `loadComponent` em `/simulacao-meta-premio`, padrão carteira.
- **Consequences**: Bundle inicial menor; primeiro acesso paga o chunk. Inconsistência pontual com painel-rolagem aceita (não migrar rolagem agora).

### ADR-02: Dois serviços HTTP vs um serviço de simulação

- **Status**: Accepted
- **Context**: Nenhum serviço lista ações. O tratamento de erro de `/acoes` (nunca `mensagem`) é o inverso do de `/simulacao-meta-premio` (sempre `mensagem` no 4xx).
- **Decision**: `AcaoApiService` + `SimulacaoMetaPremioApiService`.
- **Consequences**: Um arquivo a mais; contratos de erro isolados e testáveis. Um serviço único misturaria regras BR-UI-13 e aumentaria risco de regressão.

### ADR-03: Signals vs campos mutáveis (painel-rolagem)

- **Status**: Accepted
- **Context**: OnPush exige notificação de CD. Carteira usa `markForCheck()` após mutar campos — ruído. Header já usa signals.
- **Decision**: Estado da tela em signals; não guardar resultado no service singleton.
- **Consequences**: Alinha OnPush sem `ChangeDetectorRef`; AC-17 sai de graça com o destroy da rota. Não unifica o débito das telas antigas nesta PR.
