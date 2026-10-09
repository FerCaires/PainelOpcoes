# Task plan: F-024 Tela de Simulação de Meta de Prêmio

## Summary
Total tasks: 47 | Kotlin: 0 | Python: 0 | TypeScript: 47 | Shared/Infra: 0

## Task list

### Infrastructure & shared
Não aplicável. Sem alteração de Docker, `environment`, interceptor ou `app.config.ts`.

### TypeScript / Angular
- [ ] TASK-01 · Criar enum TipoOpcao
  - **Layer**: Model
  - **Description**: Criar `src/app/models/tipo-opcao.enum.ts` com `export enum TipoOpcao { CALL = 'CALL', PUT = 'PUT' }`.
  - **BDD scenario**:
    - Given: o enum `TipoOpcao` existe
    - When:  `TipoOpcao.CALL` é lido
    - Then:  o valor é `'CALL'`
  - **Depends on**: —
  - **Satisfies**: AC-02
  - **Complexity**: XS

- [ ] TASK-02 · Criar enum Moneyness
  - **Layer**: Model
  - **Description**: Criar `src/app/models/moneyness.enum.ts` com `export enum Moneyness { ITM = 'ITM', ATM = 'ATM', OTM = 'OTM' }`.
  - **BDD scenario**:
    - Given: o enum `Moneyness` existe
    - When:  `Moneyness.ITM` é lido
    - Then:  o valor é `'ITM'`
  - **Depends on**: —
  - **Satisfies**: AC-06
  - **Complexity**: XS

- [ ] TASK-03 · Criar enum TipoNotional
  - **Layer**: Model
  - **Description**: Criar `src/app/models/tipo-notional.enum.ts` com `export enum TipoNotional { ACOES = 'ACOES', CAIXA = 'CAIXA' }`.
  - **BDD scenario**:
    - Given: o enum `TipoNotional` existe
    - When:  `TipoNotional.CAIXA` é lido
    - Then:  o valor é `'CAIXA'`
  - **Depends on**: —
  - **Satisfies**: AC-07
  - **Complexity**: XS

- [ ] TASK-04 · Criar interface Acao
  - **Layer**: Model
  - **Description**: Criar `src/app/models/acao.model.ts` com `export interface Acao { readonly nomeAcao: string; readonly nomeCompleto: string; readonly precoSpot: number | null; }`. Não filtrar o seletor por `precoSpot` (ação com spot nulo permanece listável).
  - **BDD scenario**:
    - Given: o contrato de `GET /acoes` precisa ser tipado no Painel
    - When:  a interface `Acao` é definida
    - Then:  `precoSpot` aceita `number | null`
  - **Depends on**: —
  - **Satisfies**: AC-03
  - **Complexity**: XS

- [ ] TASK-05 · Criar interface SimulacaoOpcaoItem
  - **Layer**: Model
  - **Description**: Criar `src/app/models/simulacao-opcao-item.model.ts` com os campos da architecture (`nome`, `tipo: TipoOpcao`, `modalidade: Modalidade` reusando `src/app/models/modalidade.enum.ts`, `strike`, `valorPremio`, `percentualVsSpot`, `moneyness: Moneyness`, `avisoExercicio: string | null`, `dataVencimento`, `diasAteVencimento`, `quantidadeAcoes`, `notional`, `tipoNotional: TipoNotional`, `premioEstimado`, `roiOperacao`, `roiAnualizadoSimples`), todos `readonly`. Não reusar `Opcao` da rolagem (`premio` ≠ `valorPremio`).
  - **BDD scenario**:
    - Given: a linha da tabela de simulação precisa ser tipada
    - When:  a interface `SimulacaoOpcaoItem` é definida
    - Then:  `avisoExercicio` é `string | null`
  - **Depends on**: TASK-01, TASK-02, TASK-03
  - **Satisfies**: AC-06
  - **Complexity**: XS

- [ ] TASK-06 · Criar interface SimulacaoMetaPremioResponse
  - **Layer**: Model
  - **Description**: Criar `src/app/models/simulacao-meta-premio-response.model.ts` com `readonly nomeAcao`, `nomeCompleto`, `precoSpot`, `metaPremio`, `tipo: TipoOpcao`, `dataVencimento`, `diasAteVencimento`, `quantidadeOperacoes` e `opcoes: readonly SimulacaoOpcaoItem[]`.
  - **BDD scenario**:
    - Given: o cabeçalho da simulação precisa ser tipado
    - When:  a interface `SimulacaoMetaPremioResponse` é definida
    - Then:  o campo `opcoes` é `readonly SimulacaoOpcaoItem[]`
  - **Depends on**: TASK-01, TASK-05
  - **Satisfies**: AC-06
  - **Complexity**: XS

- [ ] TASK-07 · Criar SimulacaoMetaPremioError
  - **Layer**: Model
  - **Description**: Em `src/app/models/api-errors.model.ts`, adicionar `export class SimulacaoMetaPremioError extends ApiError { constructor(message: string, status: number, code?: string) }` atribuindo `this.name = 'SimulacaoMetaPremioError'`. Não alterar as subclasses já existentes.
  - **BDD scenario**:
    - Given: a simulação devolve HTTP 404 com envelope
    - When:  `new SimulacaoMetaPremioError('Ação não encontrada', 404, 'ACAO_NAO_ENCONTRADA')` é instanciado
    - Then:  `status` é `404`
  - **Depends on**: —
  - **Satisfies**: AC-09
  - **Complexity**: XS

- [ ] TASK-08 · Centralizar constantes de mensagem da simulação
  - **Layer**: Utils
  - **Description**: Gate 2 W-02. Criar `src/app/utils/simulacao-meta-premio-mensagens.ts` exportando exatamente: `MSG_ACOES_VAZIAS = 'Nenhuma ação disponível para simulação.'`; `MSG_FALHA_CARREGAR_ACOES = 'Não foi possível carregar as ações. Tente novamente.'`; `MSG_OPCOES_VAZIAS = 'Nenhuma opção disponível para os parâmetros informados neste vencimento.'`; `MSG_FALHA_SIMULACAO = 'Não foi possível concluir a simulação. Tente novamente.'`. Única fonte desses textos; serviços e componente importam daqui.
  - **BDD scenario**:
    - Given: as mensagens fixas da spec precisam de um único módulo
    - When:  `MSG_ACOES_VAZIAS` é lida
    - Then:  o valor é `'Nenhuma ação disponível para simulação.'`
  - **Depends on**: —
  - **Satisfies**: AC-04, AC-05, AC-08, AC-13
  - **Complexity**: XS

- [ ] TASK-09 · Rejeitar metaPremio igual a zero no validator
  - **Layer**: Utils
  - **Description**: Criar `src/app/utils/maior-que-zero.validator.ts` com `export function maiorQueZero(): ValidatorFn`. Para valor numérico `NaN` ou `≤ 0`, retornar `{ maiorQueZero: true }`. Não usar `Validators.min(0)` (aceitaria 0 e falharia AC-02).
  - **BDD scenario**:
    - Given: o controle `metaPremio` possui valor `0`
    - When:  `maiorQueZero()` é aplicado
    - Then:  o retorno é `{ maiorQueZero: true }`
  - **Depends on**: —
  - **Satisfies**: AC-02
  - **Complexity**: XS

- [ ] TASK-10 · Deixar valor vazio a cargo do required
  - **Layer**: Utils
  - **Description**: No mesmo `maiorQueZero()`, se o valor for `null`, `undefined` ou string vazia, retornar `null` para não conflitar com `Validators.required`.
  - **BDD scenario**:
    - Given: o controle `metaPremio` está vazio (`null`)
    - When:  `maiorQueZero()` é aplicado
    - Then:  o retorno é `null`
  - **Depends on**: TASK-09
  - **Satisfies**: AC-02
  - **Complexity**: XS

- [ ] TASK-11 · Formatar data ISO para DD/MM/YYYY
  - **Layer**: Utils
  - **Description**: Criar `src/app/utils/formatacao.ts` com `export function formatarDataIso(data: string): string` convertendo `'YYYY-MM-DD'` em `'DD/MM/YYYY'`. Não recalcular vencimento.
  - **BDD scenario**:
    - Given: `dataVencimento` da API é `'2026-10-16'`
    - When:  `formatarDataIso` é chamado
    - Then:  o retorno é `'16/10/2026'`
  - **Depends on**: —
  - **Satisfies**: AC-15
  - **Complexity**: XS

- [ ] TASK-12 · Formatar monetário pt-BR com 2 casas
  - **Layer**: Utils
  - **Description**: Em `formatacao.ts`, adicionar `export function formatarMonetario(valor: number): string` via `Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })`. Não recalcular `notional` nem `premioEstimado`.
  - **BDD scenario**:
    - Given: `precoSpot` da API é `42.13`
    - When:  `formatarMonetario` é chamado
    - Then:  o retorno contém `'42,13'`
  - **Depends on**: TASK-11
  - **Satisfies**: AC-15
  - **Complexity**: XS

- [ ] TASK-13 · Formatar percentual positivo a partir da razão
  - **Layer**: Utils
  - **Description**: Em `formatacao.ts`, adicionar `export function formatarPercentual(razao: number): string`: multiplicar por 100, 2 casas pt-BR, sufixo `'%'`. Ex.: `0.0363` → `'3,63%'`; o mesmo caminho cobre `0.4356` → `'43,56%'`. Não recalcular ROI.
  - **BDD scenario**:
    - Given: `roiOperacao` da API é `0.0363`
    - When:  `formatarPercentual` é chamado
    - Then:  o retorno é `'3,63%'`
  - **Depends on**: TASK-12
  - **Satisfies**: AC-15
  - **Complexity**: XS

- [ ] TASK-14 · Formatar percentual negativo com hífen ASCII
  - **Layer**: Utils
  - **Description**: Gate 2 W-03. Em `formatarPercentual`, o assert de AC-15 para `percentualVsSpot = -0.0028` deve ser a string ASCII `'-0,28%'` (hífen U+002D produzido por `Intl.NumberFormat('pt-BR')`), nunca o minus Unicode U+2212 (`−`) do texto da spec.
  - **BDD scenario**:
    - Given: `percentualVsSpot` da API é `-0.0028`
    - When:  `formatarPercentual` é chamado
    - Then:  o retorno é `'-0,28%'` (hífen ASCII)
  - **Depends on**: TASK-13
  - **Satisfies**: AC-15
  - **Complexity**: XS

- [ ] TASK-15 · Mapear tipoNotional ACOES para Ações
  - **Layer**: Utils
  - **Description**: Em `formatacao.ts`, adicionar `export function formatarTipoNotional(tipo: TipoNotional): string` devolvendo `'Ações'` quando `tipo === TipoNotional.ACOES`.
  - **BDD scenario**:
    - Given: o item da API tem `tipoNotional = ACOES`
    - When:  `formatarTipoNotional` é chamado
    - Then:  o retorno é `'Ações'`
  - **Depends on**: TASK-03
  - **Satisfies**: AC-06
  - **Complexity**: XS

- [ ] TASK-16 · Mapear tipoNotional CAIXA para Caixa
  - **Layer**: Utils
  - **Description**: Completar `formatarTipoNotional` devolvendo `'Caixa'` quando `tipo === TipoNotional.CAIXA`.
  - **BDD scenario**:
    - Given: o item da API tem `tipoNotional = CAIXA`
    - When:  `formatarTipoNotional` é chamado
    - Then:  o retorno é `'Caixa'`
  - **Depends on**: TASK-15
  - **Satisfies**: AC-07
  - **Complexity**: XS

- [ ] TASK-17 · Listar ações com GET /acoes
  - **Layer**: Service
  - **Description**: Criar `src/app/services/acao-api.service.ts` `@Injectable({ providedIn: 'root' })` com `inject(HttpClient)`, `environment.apiBaseUrl`, e `listar(): Observable<Acao[]>` fazendo `GET ${baseUrl}/acoes`. Sem cache. Sem filtrar por `precoSpot`.
  - **BDD scenario**:
    - Given: a API responde HTTP 200 com ao menos `BBAS3`
    - When:  `listar()` é chamado
    - Then:  o observable emite um array contendo `nomeAcao = 'BBAS3'`
  - **Depends on**: TASK-04
  - **Satisfies**: AC-03
  - **Complexity**: S

- [ ] TASK-18 · Propagar lista vazia de ações como sucesso
  - **Layer**: Service
  - **Description**: Em `AcaoApiService.listar()`, HTTP 200 com `[]` é sucesso: emitir array vazio. Não lançar erro e não usar `MSG_ACOES_VAZIAS` neste serviço (texto é do componente, TASK-30).
  - **BDD scenario**:
    - Given: a API responde HTTP 200 com `[]`
    - When:  `listar()` é chamado
    - Then:  o observable emite `[]`
  - **Depends on**: TASK-17
  - **Satisfies**: AC-04
  - **Complexity**: XS

- [ ] TASK-19 · Falhar GET /acoes sem ler o envelope
  - **Layer**: Service
  - **Description**: Gate 2 W-02. Em `AcaoApiService.listar()`, `catchError` para 4xx, 5xx ou rede (`status === 0`) faz `throwError` com `Error` ou `ApiError` cuja `message` é `MSG_FALHA_CARREGAR_ACOES`. **Nunca** ler `error.error.mensagem` nem qualquer campo do envelope 4xx.
  - **BDD scenario**:
    - Given: `GET /acoes` responde 4xx cujo corpo contém `mensagem` preenchida
    - When:  `listar()` é chamado
    - Then:  o erro propagado tem `message` igual a `MSG_FALHA_CARREGAR_ACOES`
  - **Depends on**: TASK-08, TASK-17
  - **Satisfies**: AC-05
  - **Complexity**: S

- [ ] TASK-20 · Enviar query da simulação via HttpParams
  - **Layer**: Service
  - **Description**: Criar `src/app/services/simulacao-meta-premio-api.service.ts` `@Injectable({ providedIn: 'root' })` com `simular(nomeAcao: string, metaPremio: number, tipo: TipoOpcao): Observable<SimulacaoMetaPremioResponse>` em `GET ${baseUrl}/simulacao-meta-premio` usando `HttpParams`. Serializar `metaPremio` com `toString()` **sem** locale (`1000` ou `1000.5`, nunca `1.000,50`). Sem cache.
  - **BDD scenario**:
    - Given: o formulário válido pede `BBAS3`, `1000` e `CALL`
    - When:  `simular('BBAS3', 1000, TipoOpcao.CALL)` é chamado
    - Then:  a requisição GET inclui `nomeAcao=BBAS3`, `metaPremio=1000` e `tipo=CALL`
  - **Depends on**: TASK-01, TASK-06
  - **Satisfies**: AC-06
  - **Complexity**: S

- [ ] TASK-21 · Devolver o corpo 200 da simulação
  - **Layer**: Service
  - **Description**: Em `simular()`, HTTP 200 com `opcoes.length ≥ 1` emite o JSON tipado como `SimulacaoMetaPremioResponse`, na ordem recebida, sem reordenar nem recalcular campos.
  - **BDD scenario**:
    - Given: a API responde 200 com a opção `BBAS3J423`
    - When:  `simular` completa
    - Then:  o observable emite `opcoes[0].nome` igual a `'BBAS3J423'`
  - **Depends on**: TASK-20
  - **Satisfies**: AC-06
  - **Complexity**: S

- [ ] TASK-22 · Tratar 200 com opcoes vazias como sucesso
  - **Layer**: Service
  - **Description**: Em `simular()`, HTTP 200 com `quantidadeOperacoes = 0` e `opcoes = []` emite o cabeçalho. Não lançar `SimulacaoMetaPremioError`.
  - **BDD scenario**:
    - Given: a API responde 200 com `opcoes = []`
    - When:  `simular` completa
    - Then:  o observable emite `quantidadeOperacoes = 0`
  - **Depends on**: TASK-21
  - **Satisfies**: AC-08
  - **Complexity**: XS

- [ ] TASK-23 · Mapear 4xx da simulação para mensagem do envelope
  - **Layer**: Service
  - **Description**: Em `SimulacaoMetaPremioApiService`, helper privado `extrairEnvelope(error: unknown)` (type guard, sem `any`). Se `status >= 400 && status < 500` e `mensagem` for string não vazia, `throwError(() => new SimulacaoMetaPremioError(mensagem, status, erro?))`. Sem `switch` por código: o mesmo pipeline cobre `ACAO_NAO_ENCONTRADA`, `META_PREMIO_INVALIDA`, `PRECO_SPOT_INDISPONIVEL` e `VENCIMENTO_MENSAL_NAO_ENCONTRADO` (e 400 `PARAMETRO_*` / `TIPO_INVALIDO`).
  - **BDD scenario**:
    - Given: a API responde 404 com `erro = 'ACAO_NAO_ENCONTRADA'` e `mensagem` preenchida
    - When:  `simular` é chamado
    - Then:  o erro é `SimulacaoMetaPremioError` com `message` igual ao campo `mensagem`
  - **Depends on**: TASK-07, TASK-20
  - **Satisfies**: AC-09, AC-10, AC-11, AC-12
  - **Complexity**: S

- [ ] TASK-24 · Usar mensagem genérica quando o 4xx não tem mensagem
  - **Layer**: Service
  - **Description**: Se o 4xx não tiver envelope útil (`mensagem` ausente, não-string ou vazia), `throwError` com `MSG_FALHA_SIMULACAO`.
  - **BDD scenario**:
    - Given: a API responde 422 sem campo `mensagem` utilizável
    - When:  `simular` é chamado
    - Then:  o erro tem `message` igual a `MSG_FALHA_SIMULACAO`
  - **Depends on**: TASK-08, TASK-23
  - **Satisfies**: AC-13
  - **Complexity**: S

- [ ] TASK-25 · Usar mensagem genérica em 500 ou rede na simulação
  - **Layer**: Service
  - **Description**: Em `simular()`, HTTP 500 ou falha de rede (`status === 0`) propaga `MSG_FALHA_SIMULACAO`, sem depender do corpo técnico.
  - **BDD scenario**:
    - Given: a simulação falha com HTTP 500
    - When:  `simular` é chamado
    - Then:  o erro tem `message` igual a `MSG_FALHA_SIMULACAO`
  - **Depends on**: TASK-08, TASK-20
  - **Satisfies**: AC-13
  - **Complexity**: S

- [ ] TASK-26 · Criar componente standalone OnPush com os três campos
  - **Layer**: Component
  - **Description**: Criar `src/app/components/simulacao-meta-premio/simulacao-meta-premio.component.ts|.html|.scss`. `standalone`, `ChangeDetectionStrategy.OnPush`, `inject()` de `FormBuilder`, `AcaoApiService` e `SimulacaoMetaPremioApiService`. `FormGroup` com `nomeAcao`, `metaPremio` (`required` + `maiorQueZero()`), `tipo` (`required`, valor inicial `null`). Ordem no template: Ação (`mat-select`) → Meta de prêmio (`input` numérico) → Tipo (`mat-select` CALL/PUT via `Object.values(TipoOpcao)`) → botão Simular. `(ngSubmit)="simular()"`. Signals: `acoes`, `erroAcoes`, `carregandoAcoes`, `resultado`, `erroSimulacao`, `carregandoSimulacao`. HTML/SCSS via skill **frontend-design** (hierarquia, espaçamento).
  - **BDD scenario**:
    - Given: o usuário abriu `SimulacaoMetaPremioComponent`
    - When:  o formulário é inicializado
    - Then:  o controle `tipo` está vazio
  - **Depends on**: TASK-01, TASK-10, TASK-17, TASK-20
  - **Satisfies**: AC-02
  - **Complexity**: M

- [ ] TASK-27 · Desabilitar Simular via podeSimular
  - **Layer**: Component
  - **Description**: Expor `podeSimular` como `Signal<boolean>` lendo `toSignal(form.statusChanges)` e os signals `acoes`, `erroAcoes`, `carregandoAcoes`, `carregandoSimulacao`. Verdadeiro só se form válido **e** `acoes().length > 0` **e** `!erroAcoes()` **e** `!carregandoAcoes()` **e** `!carregandoSimulacao()`. Botão `[disabled]="!podeSimular()"`. `simular()` faz early-return se `!form.valid`.
  - **BDD scenario**:
    - Given: o Tipo ainda não foi escolhido
    - When:  `podeSimular` é avaliado
    - Then:  o botão Simular está desabilitado
  - **Depends on**: TASK-26
  - **Satisfies**: AC-02
  - **Complexity**: S

- [ ] TASK-28 · Carregar ações no ngOnInit com o spinner compartilhado
  - **Layer**: Component
  - **Description**: `ngOnInit` chama `carregarAcoes()`. Ligar `carregandoAcoes` em torno de `acaoApi.listar()` com `takeUntilDestroyed()`. Um único `mat-spinner` visível quando `carregandoAcoes() || carregandoSimulacao()` (BR-UI-12). Sem botão de retry. Enquanto `carregandoAcoes` for true, `podeSimular` permanece false.
  - **BDD scenario**:
    - Given: `GET /acoes` ainda está em andamento
    - When:  a tela é exibida
    - Then:  o `mat-spinner` está visível
  - **Depends on**: TASK-17, TASK-26, TASK-27
  - **Satisfies**: AC-05
  - **Complexity**: S

- [ ] TASK-29 · Exibir ticker e nome completo no seletor
  - **Layer**: Component
  - **Description**: No `mat-select` de Ação, cada `mat-option` mostra `nomeAcao` e `nomeCompleto` (BR-UI-19); o valor do controle é `nomeAcao`. Não omitir ação com `precoSpot` nulo ou `≤ 0`.
  - **BDD scenario**:
    - Given: `GET /acoes` 200 inclui `nomeAcao = 'BBAS3'` e `nomeCompleto = 'Banco do Brasil S.A.'`
    - When:  `carregarAcoes` termina
    - Then:  o seletor exibe `BBAS3` e `Banco do Brasil S.A.`
  - **Depends on**: TASK-28
  - **Satisfies**: AC-03
  - **Complexity**: S

- [ ] TASK-30 · Reservar slot distinto para lista vazia de ações
  - **Layer**: Component
  - **Description**: Gate 2 W-01. Quarto estado de texto, separado de `erroAcoes`, `erroSimulacao` e `MSG_OPCOES_VAZIAS`. Exibir `MSG_ACOES_VAZIAS` quando `acoes().length === 0 && !carregandoAcoes() && !erroAcoes()`. Não gravar esse texto em `erroAcoes`. Seletor sem opções selecionáveis; `podeSimular` false.
  - **BDD scenario**:
    - Given: `GET /acoes` responde 200 com `[]`
    - When:  o carregamento termina
    - Then:  é exibido `'Nenhuma ação disponível para simulação.'`
  - **Depends on**: TASK-08, TASK-18, TASK-28
  - **Satisfies**: AC-04
  - **Complexity**: S

- [ ] TASK-31 · Exibir erro genérico de ações sem retry
  - **Layer**: Component
  - **Description**: No `catchError` de `carregarAcoes`, `erroAcoes.set(err.message)` (já genérico via TASK-19). Seletor vazio (não indefinido). Sem botão de nova tentativa. Slot de `erroAcoes` distinto do slot da TASK-30. `role="alert"` neste slot.
  - **BDD scenario**:
    - Given: `GET /acoes` falha por 4xx, 5xx ou rede
    - When:  a carga termina
    - Then:  é exibido `'Não foi possível carregar as ações. Tente novamente.'`
  - **Depends on**: TASK-19, TASK-28
  - **Satisfies**: AC-05
  - **Complexity**: S

- [ ] TASK-32 · Limpar resultado e erro antes de simular
  - **Layer**: Component
  - **Description**: Em `simular()`, se o form for válido: `resultado.set(undefined)` e `erroSimulacao.set(undefined)` **antes** de assinar `simulacaoApi.simular(...)`. Subscription com `takeUntilDestroyed()`.
  - **BDD scenario**:
    - Given: um resultado ou erro de simulação anterior está visível
    - When:  o usuário aciona Simular
    - Then:  `resultado` e `erroSimulacao` ficam `undefined` antes da resposta HTTP
  - **Depends on**: TASK-20, TASK-27
  - **Satisfies**: AC-14
  - **Complexity**: S

- [ ] TASK-33 · Mostrar spinner e desabilitar Simular durante a requisição
  - **Layer**: Component
  - **Description**: Em `simular()`, `carregandoSimulacao.set(true)` ao disparar e `false` no `finalize` (sucesso ou falha). Reutilizar o mesmo `mat-spinner` da TASK-28. `podeSimular` fica false enquanto `carregandoSimulacao` é true; ao concluir, o botão volta a seguir a validade do form.
  - **BDD scenario**:
    - Given: o formulário está válido e a requisição de simulação está em andamento
    - When:  a tela é observada
    - Then:  o `mat-spinner` está visível
  - **Depends on**: TASK-28, TASK-32
  - **Satisfies**: AC-14
  - **Complexity**: S

- [ ] TASK-34 · Exibir o cabeçalho da simulação 200
  - **Layer**: Component
  - **Description**: No next de `simular()`, `resultado.set(response)`. Template do cabeçalho: `nomeAcao`, `nomeCompleto`, `precoSpot` e `metaPremio` via `formatarMonetario`, `tipo` como recebido, `dataVencimento` via `formatarDataIso`, `diasAteVencimento` e `quantidadeOperacoes` como inteiros. Delegar aos utils; não alterar números.
  - **BDD scenario**:
    - Given: a API 200 devolve `nomeAcao = 'BBAS3'` e `dataVencimento = '2026-10-16'`
    - When:  `simular` completa
    - Then:  o cabeçalho exibe a data `'16/10/2026'`
  - **Depends on**: TASK-11, TASK-12, TASK-21, TASK-32
  - **Satisfies**: AC-06
  - **Complexity**: S

- [ ] TASK-35 · Renderizar a tabela na ordem da API
  - **Layer**: Component
  - **Description**: `mat-table` com `colunasTabela` nesta ordem: `nome`, `tipo`, `modalidade`, `strike`, `valorPremio`, `percentualVsSpot`, `moneyness`, `avisoExercicio`, `dataVencimento`, `diasAteVencimento`, `quantidadeAcoes`, `notional`, `tipoNotional`, `premioEstimado`, `roiOperacao`, `roiAnualizadoSimples`. `trackByNomeOpcao` usa `item.nome`. Monetários/percentuais/datas via formatadores. Nenhuma coluna omitida por media query. Não reordenar `opcoes`.
  - **BDD scenario**:
    - Given: a API 200 inclui `BBAS3J423` com `quantidadeAcoes = 700`
    - When:  a tabela é renderizada
    - Then:  a linha de `BBAS3J423` exibe quantidade `700`
  - **Depends on**: TASK-13, TASK-14, TASK-34
  - **Satisfies**: AC-06
  - **Complexity**: M

- [ ] TASK-36 · Destacar linha ITM e exibir avisoExercicio
  - **Layer**: Component
  - **Description**: `isLinhaItm(item)` quando `item.moneyness === Moneyness.ITM`. Classe CSS `linha-itm` no `mat-row`. Exibir o texto de `avisoExercicio` quando não nulo. ATM/OTM sem destaque de exercício; nulo não mostra texto. Cor/contraste do destaque via **frontend-design** (mínimo 4,5:1).
  - **BDD scenario**:
    - Given: a linha `BBAS3J423` tem `moneyness = ITM` e `avisoExercicio` preenchido
    - When:  a tabela é renderizada
    - Then:  a linha possui a classe `linha-itm`
  - **Depends on**: TASK-02, TASK-35
  - **Satisfies**: AC-06
  - **Complexity**: S

- [ ] TASK-37 · Exibir tipoNotional ACOES como Ações na tabela
  - **Layer**: Component
  - **Description**: Na coluna `tipoNotional`, chamar `formatarTipoNotional(item.tipoNotional)` (wrapper do componente delegando ao utils).
  - **BDD scenario**:
    - Given: a linha 200 CALL tem `tipoNotional = ACOES`
    - When:  a tabela é renderizada
    - Then:  a célula exibe `'Ações'`
  - **Depends on**: TASK-15, TASK-35
  - **Satisfies**: AC-06
  - **Complexity**: XS

- [ ] TASK-38 · Exibir tipoNotional CAIXA como Caixa na tabela
  - **Layer**: Component
  - **Description**: O mesmo binding da TASK-37 cobre PUT com `tipoNotional = CAIXA`.
  - **BDD scenario**:
    - Given: a API 200 PUT inclui uma opção com `tipoNotional = CAIXA`
    - When:  a tabela é renderizada
    - Then:  a célula exibe `'Caixa'`
  - **Depends on**: TASK-16, TASK-37
  - **Satisfies**: AC-07
  - **Complexity**: XS

- [ ] TASK-39 · Exibir cabeçalho e mensagem quando opcoes está vazia
  - **Layer**: Component
  - **Description**: Se `resultado()` existe e `resultado()!.opcoes.length === 0`, manter o cabeçalho, **não** setar `erroSimulacao`, e exibir `MSG_OPCOES_VAZIAS` num slot distinto dos slots das TASK-30, TASK-31 e TASK-40.
  - **BDD scenario**:
    - Given: a API responde 200 com `quantidadeOperacoes = 0` e `opcoes = []`
    - When:  `simular` completa
    - Then:  é exibido `'Nenhuma opção disponível para os parâmetros informados neste vencimento.'`
  - **Depends on**: TASK-08, TASK-22, TASK-34
  - **Satisfies**: AC-08
  - **Complexity**: S

- [ ] TASK-40 · Exibir mensagem 4xx da simulação sem tabela
  - **Layer**: Component
  - **Description**: No error de `simular()`, `erroSimulacao.set(err.message)` e não preencher `resultado`. Sem tabela. `carregandoSimulacao = false` reabilita Simular via `podeSimular`. Slot `erroSimulacao` com `role="alert"`, distinto dos outros três slots de texto. O mesmo caminho cobre AC-10..AC-12 (payloads 422 diferentes; sem switch no componente).
  - **BDD scenario**:
    - Given: a API responde 404 com `mensagem` preenchida
    - When:  `simular` termina
    - Then:  a tela exibe exatamente o valor de `mensagem`
  - **Depends on**: TASK-23, TASK-32
  - **Satisfies**: AC-09
  - **Complexity**: S

- [ ] TASK-41 · Exibir mensagem genérica de falha da simulação
  - **Layer**: Component
  - **Description**: O mesmo `erroSimulacao.set(err.message)` da TASK-40 pinta `MSG_FALHA_SIMULACAO` quando o serviço propaga 500/rede (TASK-25) ou 4xx sem envelope (TASK-24).
  - **BDD scenario**:
    - Given: a simulação falha por HTTP 500 ou rede
    - When:  a tentativa termina
    - Then:  a tela exibe `'Não foi possível concluir a simulação. Tente novamente.'`
  - **Depends on**: TASK-25, TASK-40
  - **Satisfies**: AC-13
  - **Complexity**: XS

- [ ] TASK-42 · Incluir o header compartilhado no topo da tela
  - **Layer**: Component
  - **Description**: No template do componente, renderizar `<app-header-menu>` como primeiro filho visível (não no `AppComponent`). Importar `HeaderMenuComponent`.
  - **BDD scenario**:
    - Given: o usuário está em `/simulacao-meta-premio`
    - When:  o template é renderizado
    - Then:  `app-header-menu` está presente no topo
  - **Depends on**: TASK-26
  - **Satisfies**: AC-16
  - **Complexity**: XS

- [ ] TASK-43 · Permitir scroll horizontal da tabela
  - **Layer**: Component
  - **Description**: No SCSS, wrapper `.tabela-wrapper { overflow-x: auto; }` em volta da `mat-table`. Nenhuma coluna omitida por media query (viewport 375px inclusive). Contraste e densidade via **frontend-design**.
  - **BDD scenario**:
    - Given: o resultado 200 possui tabela com todas as colunas
    - When:  o wrapper da tabela é estilizado
    - Then:  `.tabela-wrapper` define `overflow-x: auto`
  - **Depends on**: TASK-35
  - **Satisfies**: AC-18
  - **Complexity**: XS

- [ ] TASK-44 · Marcar alertas e submissão por teclado
  - **Layer**: Component
  - **Description**: `role="alert"` nos slots de `erroAcoes` e `erroSimulacao`; `aria-*` no spinner. Form com `(ngSubmit)="simular()"` para Enter só efetivar se o botão estiver habilitado / form válido (early-return já na TASK-27). Foco visível nos controles Material. Contraste de textos ≥ 4,5:1 na passagem **frontend-design**.
  - **BDD scenario**:
    - Given: `erroSimulacao` ou `erroAcoes` está preenchido
    - When:  a mensagem é renderizada
    - Then:  o elemento da mensagem possui `role="alert"`
  - **Depends on**: TASK-31, TASK-40
  - **Satisfies**: AC-18
  - **Complexity**: S

- [ ] TASK-45 · Manter a tela stateless ao destruir o componente
  - **Layer**: Component
  - **Description**: Estado só em signals/form do componente. Serviços sem cache. Sem `localStorage`. Nova instância (sair da rota e voltar) inicia Ação sem seleção, Meta vazia, Tipo sem seleção, `resultado`/`erroSimulacao` indefinidos, e `ngOnInit` dispara `carregarAcoes` de novo.
  - **BDD scenario**:
    - Given: o formulário foi preenchido e um resultado está visível
    - When:  o componente é destruído e uma nova instância é criada
    - Then:  o controle `tipo` está vazio
  - **Depends on**: TASK-26, TASK-28, TASK-34
  - **Satisfies**: AC-17
  - **Complexity**: S

- [ ] TASK-46 · Registrar a rota lazy simulacao-meta-premio
  - **Layer**: Route
  - **Description**: Em `src/app/app.routes.ts`, inserir **antes** de `path: '**'` o objeto `{ path: 'simulacao-meta-premio', loadComponent: () => import('./components/simulacao-meta-premio/simulacao-meta-premio.component').then(m => m.SimulacaoMetaPremioComponent), data: { title: 'Meta de Prêmio' } }`. Sem `canActivate`. Sem `providers` na rota (destroy completo ao sair — AC-17). Não alterar as rotas existentes.
  - **BDD scenario**:
    - Given: as rotas da aplicação já incluem Home, Rolagens e Carteira
    - When:  `routes` é lido
    - Then:  existe `path: 'simulacao-meta-premio'`
  - **Depends on**: TASK-26
  - **Satisfies**: AC-01, AC-17
  - **Complexity**: XS

- [ ] TASK-47 · Acrescentar Meta de Prêmio no menu compartilhado
  - **Layer**: Shared
  - **Description**: Em `src/app/components/header-menu/header-menu.component.ts`, acrescentar `{ label: 'Meta de Prêmio', route: '/simulacao-meta-premio', icon: /* frontend-design */ }` em `menuItems` **sem** remover nem renomear Home (`/`), Busca de Rolagens (`/painel-rolagem`) e Carteira (`/carteira`). Ordem de apresentação da architecture: Home, Busca de Rolagens, Meta de Prêmio, Carteira. Ícone definido pela skill **frontend-design**.
  - **BDD scenario**:
    - Given: o header compartilhado é renderizado
    - When:  `menuItems` é lido
    - Then:  existe o item com rótulo `'Meta de Prêmio'`
  - **Depends on**: TASK-46
  - **Satisfies**: AC-01
  - **Complexity**: XS

### Python
Não aplicável.

## Spec coverage matrix
| AC ID | Covered by task(s) |
|-------|--------------------|
| AC-01 | TASK-46, TASK-47 |
| AC-02 | TASK-01, TASK-09, TASK-10, TASK-26, TASK-27 |
| AC-03 | TASK-04, TASK-17, TASK-29 |
| AC-04 | TASK-08, TASK-18, TASK-30 |
| AC-05 | TASK-08, TASK-19, TASK-28, TASK-31 |
| AC-06 | TASK-02, TASK-05, TASK-06, TASK-15, TASK-20, TASK-21, TASK-34, TASK-35, TASK-36, TASK-37 |
| AC-07 | TASK-03, TASK-16, TASK-38 |
| AC-08 | TASK-08, TASK-22, TASK-39 |
| AC-09 | TASK-07, TASK-23, TASK-40 |
| AC-10 | TASK-23 |
| AC-11 | TASK-23 |
| AC-12 | TASK-23 |
| AC-13 | TASK-08, TASK-24, TASK-25, TASK-41 |
| AC-14 | TASK-32, TASK-33 |
| AC-15 | TASK-11, TASK-12, TASK-13, TASK-14 |
| AC-16 | TASK-42 |
| AC-17 | TASK-45, TASK-46 |
| AC-18 | TASK-43, TASK-44 |
