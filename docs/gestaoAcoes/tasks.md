# Task plan: F-027 Tela de Gestão de Ações

## Summary
Total tasks: 28 | Kotlin: 0 | Python: 0 | TypeScript: 28 | Shared/Infra: 0

Não iniciar implementação até o usuário pedir explicitamente.

## Infrastructure & shared
Não aplicável. Sem Docker, `environment`, interceptor, `app.config.ts`, backend ou `DELETE`.

Não alterar: `simulacao-meta-premio.component.*`, `painel-rolagem.component.*`. AC-16 é o `GET /acoes` já existente na entrada da Meta de Prêmio.

## Task list

### TypeScript / Angular

- [x] TASK-01 · Estender `Acao` com `dataAtualizacao`
  - **Layer**: Model
  - **Description**: Em `src/app/models/acao.model.ts`, acrescentar `readonly dataAtualizacao?: string` sem remover `nomeAcao`, `nomeCompleto`, `precoSpot: number | null`. Campo opcional para não quebrar mocks F-024.
  - **BDD scenario**:
    - Given: a interface `Acao` existe
    - When:  um objeto é criado só com `nomeAcao`, `nomeCompleto` e `precoSpot: null`
    - Then:  o TypeScript aceita o objeto (campo `dataAtualizacao` opcional)
  - **Depends on**: —
  - **Satisfies**: AC-03
  - **Complexity**: XS

- [x] TASK-02 · Criar `CriarAcaoRequest`
  - **Layer**: Model
  - **Description**: Criar `src/app/models/criar-acao-request.model.ts` com `export interface CriarAcaoRequest { readonly nomeAcao: string; readonly nomeCompleto: string; }`.
  - **BDD scenario**:
    - Given: o corpo do POST `/acoes` precisa ser tipado
    - When:  a interface é definida
    - Then:  os dois campos são `readonly string`
  - **Depends on**: —
  - **Satisfies**: AC-07
  - **Complexity**: XS

- [x] TASK-03 · Criar `RelatorioAtualizacao`
  - **Layer**: Model
  - **Description**: Criar `src/app/models/relatorio-atualizacao.model.ts` com `readonly totalRecuperadas`, `totalAtualizadas`, `totalCadastradas`, `totalNaoAtualizadas` (number). Não incluir `detalhesNaoAtualizadas` nem `dataExecucao`.
  - **BDD scenario**:
    - Given: o resumo 200 de `/atualizacao/executar` precisa ser tipado
    - When:  a interface é definida
    - Then:  os quatro totais existem e são `number`
  - **Depends on**: —
  - **Satisfies**: AC-13
  - **Complexity**: XS

- [x] TASK-04 · Criar `AcaoCadastroError`
  - **Layer**: Model
  - **Description**: Em `src/app/models/api-errors.model.ts`, adicionar `export class AcaoCadastroError extends ApiError { constructor(message: string, status: number, code?: string) }` com `this.name = 'AcaoCadastroError'`. Não alterar subclasses existentes.
  - **BDD scenario**:
    - Given: o POST `/acoes` 4xx precisa de erro de domínio
    - When:  `new AcaoCadastroError('Acao ja cadastrada', 409, 'ACAO_DUPLICADA')`
    - Then:  `message` é o texto, `status` é 409, `code` é `'ACAO_DUPLICADA'`
  - **Depends on**: —
  - **Satisfies**: AC-09
  - **Complexity**: XS

- [x] TASK-05 · Constantes de mensagem da gestão de ações
  - **Layer**: Utils
  - **Description**: Criar `src/app/utils/gestao-acoes-mensagens.ts` exportando exatamente: `MSG_ACOES_CADASTRADAS_VAZIAS = 'Nenhuma ação cadastrada ainda.'`; `MSG_FALHA_CADASTRAR = 'Não foi possível cadastrar a ação. Tente novamente.'`; `MSG_FALHA_ATUALIZAR_COTACOES = 'Não foi possível atualizar as cotações. Tente novamente.'`. Reusar `MSG_FALHA_CARREGAR_ACOES` de `simulacao-meta-premio-mensagens.ts` (não duplicar). Spec do arquivo novo.
  - **BDD scenario**:
    - Given: as mensagens da spec F-027
    - When:  as constantes são lidas
    - Then:  os três textos batem com a architecture
  - **Depends on**: —
  - **Satisfies**: AC-04, AC-11, AC-14
  - **Complexity**: XS

- [x] TASK-06 · `formatarDataHora`
  - **Layer**: Utils
  - **Description**: Em `src/app/utils/formatacao.ts`, adicionar `formatarDataHora(iso: string): string`. Parsear ISO-8601 com data e hora; saída `DD/MM/YYYY HH:mm` (24h, minutos 2 dígitos). String ilegível → devolver a original. Não alterar `formatarDataIso`. Spec em `formatacao.spec.ts`: `'2026-10-02T22:18:00'` → contém `02/10/2026` e `22:18`; `'lixo'` → `'lixo'`.
  - **BDD scenario**:
    - Given: `dataAtualizacao = '2026-10-02T22:18:00'`
    - When:  `formatarDataHora` é chamada
    - Then:  o resultado é `02/10/2026 22:18`
  - **Depends on**: —
  - **Satisfies**: AC-03
  - **Complexity**: S

- [x] TASK-07 · `AcaoApiService.criar` HTTP 201
  - **Layer**: Service
  - **Description**: Em `src/app/services/acao-api.service.ts`, adicionar `criar(request: CriarAcaoRequest): Observable<Acao>` com `POST ${baseUrl}/acoes` e o corpo recebido (sem `toUpperCase` no service — o componente normaliza). `inject()` / `apiBaseUrl` já existentes. Spec: POST para `http://localhost:8080/api/acoes` com `{ nomeAcao: 'VALE3', nomeCompleto: 'Vale S.A.' }` emite o `Acao` 201. **Não** alterar `listar()`.
  - **BDD scenario**:
    - Given: o backend responde 201 com VALE3
    - When:  `criar({ nomeAcao: 'VALE3', nomeCompleto: 'Vale S.A.' })`
    - Then:  o POST vai para `/acoes` e emite `nomeAcao === 'VALE3'`
  - **Depends on**: TASK-01, TASK-02
  - **Satisfies**: AC-07, AC-08
  - **Complexity**: S

- [x] TASK-08 · `criar` 409 lê `mensagem`
  - **Layer**: Service
  - **Description**: No `catchError` de `criar`, se `HttpErrorResponse` 4xx, type guard do envelope (`unknown`, nunca `any`). Se `mensagem` string não vazia, `throwError(() => new AcaoCadastroError(mensagem, status, erro?))`. Spec: 409 `{ erro: 'ACAO_DUPLICADA', mensagem: "Acao 'VALE3' ja esta cadastrada" }` → `message` igual à `mensagem`, `status` 409.
  - **BDD scenario**:
    - Given: POST `/acoes` retorna 409 com envelope
    - When:  `criar` falha
    - Then:  o erro é `AcaoCadastroError` com a `mensagem` da API
  - **Depends on**: TASK-04, TASK-07
  - **Satisfies**: AC-09
  - **Complexity**: S

- [x] TASK-09 · `criar` 400/422 sem `mensagem` e 5xx/rede
  - **Layer**: Service
  - **Description**: 4xx com `mensagem` ausente/vazia → `AcaoCadastroError(MSG_FALHA_CADASTRAR, status)`. 5xx ou `status === 0` → mesmo genérico, **sem** ler envelope. Specs: 400 corpo `{}`; 500; `error()` de rede.
  - **BDD scenario**:
    - Given: POST `/acoes` retorna 500
    - When:  `criar` falha
    - Then:  `message === MSG_FALHA_CADASTRAR`
  - **Depends on**: TASK-05, TASK-08
  - **Satisfies**: AC-10, AC-11
  - **Complexity**: S

- [x] TASK-10 · Regressão: `listar` não lê envelope
  - **Layer**: Service
  - **Description**: Em `acao-api.service.spec.ts`, manter/reforçar: GET 4xx com `{ mensagem: 'segredo' }` propaga `MSG_FALHA_CARREGAR_ACOES` e **não** `'segredo'`. Garantir que o mapper de `criar` não foi reutilizado em `listar`.
  - **BDD scenario**:
    - Given: GET `/acoes` retorna 400 com `mensagem: 'segredo'`
    - When:  `listar` falha
    - Then:  `message === MSG_FALHA_CARREGAR_ACOES`
  - **Depends on**: TASK-07
  - **Satisfies**: AC-05
  - **Complexity**: XS

- [x] TASK-11 · `AtualizacaoApiService.executar` 200
  - **Layer**: Service
  - **Description**: Criar `src/app/services/atualizacao-api.service.ts`: `@Injectable({ providedIn: 'root' })`, `inject(HttpClient)`, `environment.apiBaseUrl`, `executar(): Observable<RelatorioAtualizacao>` = `POST ${baseUrl}/atualizacao/executar` com corpo `{}`. Spec 200 com os quatro totais. Sem cache.
  - **BDD scenario**:
    - Given: o backend responde 200 com totais
    - When:  `executar()`
    - Then:  POST `/atualizacao/executar` e emite `totalAtualizadas` do corpo
  - **Depends on**: TASK-03
  - **Satisfies**: AC-12, AC-13
  - **Complexity**: S

- [x] TASK-12 · `executar` falha genérica
  - **Layer**: Service
  - **Description**: `catchError` de qualquer 4xx/5xx/rede → `throwError(() => new ApiError(MSG_FALHA_ATUALIZAR_COTACOES, status))`. Não ler `mensagem`. Specs: 500 e rede.
  - **BDD scenario**:
    - Given: POST `/atualizacao/executar` retorna 500
    - When:  `executar` falha
    - Then:  `message === MSG_FALHA_ATUALIZAR_COTACOES`
  - **Depends on**: TASK-05, TASK-11
  - **Satisfies**: AC-14
  - **Complexity**: S

- [x] TASK-13 · Shell `GestaoAcoesComponent`
  - **Layer**: Component
  - **Description**: Criar `src/app/components/gestao-acoes/gestao-acoes.component.ts|html|scss|spec.ts`. Standalone, `ChangeDetectionStrategy.OnPush`, `inject(FormBuilder)`, `inject(AcaoApiService)`, `inject(AtualizacaoApiService)`, `inject(DestroyRef)`. Form: `nomeAcao` required + `Validators.pattern(/^[A-Za-z0-9]{5}$/)`; `nomeCompleto` required + minLength 4 + maxLength 50. Signals: `acoes`, `carregandoAcoes`, `erroAcoes`, `erroCadastro`, `carregandoCadastro`, `relatorio`, `erroAtualizacao`, `carregandoAtualizacao`. Importar `HeaderMenuComponent` e Material (form field, input, button, table, spinner, card). Spec: componente cria; form inicia inválido.
  - **BDD scenario**:
    - Given: a tela `/acoes` é instanciada
    - When:  o componente inicia
    - Then:  `OnPush` está ativo e o form tem `nomeAcao` e `nomeCompleto` vazios
  - **Depends on**: TASK-01, TASK-07, TASK-11
  - **Satisfies**: AC-02, AC-06
  - **Complexity**: M

- [x] TASK-14 · Carga inicial da lista
  - **Layer**: Component
  - **Description**: `ngOnInit` chama `carregarAcoes()`. `carregandoAcoes.set(true)` antes do GET; `finalize` zera. 200: ordenar por `nomeAcao.localeCompare`, `acoes.set`, limpar `erroAcoes`. `takeUntilDestroyed`. Spec: spinner enquanto o GET não completa; 200 duas ações → tabela/signal com tickers ordenados.
  - **BDD scenario**:
    - Given: GET `/acoes` retorna PETR4 e BBAS3
    - When:  a tela carrega
    - Then:  `acoes()` contém BBAS3 depois PETR4 em ordem alfabética
  - **Depends on**: TASK-13
  - **Satisfies**: AC-02, AC-17
  - **Complexity**: S

- [x] TASK-15 · Tabela: spot, data e estado vazio
  - **Layer**: Component
  - **Description**: `mat-table` colunas `nomeAcao`, `nomeCompleto`, `precoSpot`, `dataAtualizacao`; `trackByNomeAcao`. Spot não nulo → `formatarMonetario`; nulo → `—`. Data → `formatarDataHora` se presente, senão `—`. Wrapper `.tabela-wrapper { overflow-x: auto; }`. 200 `[]` → slot distinto com `MSG_ACOES_CADASTRADAS_VAZIAS` (não erro); form visível. Specs: linha com spot 42.13; linha com `precoSpot: null` mostra `—`; lista vazia mostra a mensagem de vazia.
  - **BDD scenario**:
    - Given: GET `/acoes` retorna `[]`
    - When:  a tela termina de carregar
    - Then:  o texto `Nenhuma ação cadastrada ainda.` aparece e o form de inclusão segue no DOM
  - **Depends on**: TASK-05, TASK-06, TASK-14
  - **Satisfies**: AC-03, AC-04, AC-18
  - **Complexity**: S

- [x] TASK-16 · Erro genérico ao carregar lista
  - **Layer**: Component
  - **Description**: Falha de `listar` → `erroAcoes.set(MSG_FALHA_CARREGAR_ACOES)` (ou `err.message` se for essa constante); `acoes.set([])`. Slot `role="alert"` distinto do vazio. Sem botão retry. Spec: `throwError` no listar → alerta com a mensagem genérica; **não** o texto do envelope.
  - **BDD scenario**:
    - Given: GET `/acoes` falha
    - When:  a tela carrega
    - Then:  o alerta exibe `MSG_FALHA_CARREGAR_ACOES`
  - **Depends on**: TASK-05, TASK-14
  - **Satisfies**: AC-05
  - **Complexity**: S

- [x] TASK-17 · `podeAdicionar` / `emOperacao` / `podeAtualizar`
  - **Layer**: Component
  - **Description**: Computed/signals: `emOperacao` = qualquer `carregando*`. `podeAdicionar` = `form.valid && !emOperacao` (usar `toSignal(form.statusChanges.pipe(startWith(form.status)))`). `podeAtualizar` = `!emOperacao`. Botão Adicionar `[disabled]="!podeAdicionar()"`. Spec: ticker `VALE` (4 chars) → Adicionar off; `VALE3` + nome 4+ chars → on; `carregandoCadastro` true → off.
  - **BDD scenario**:
    - Given: ticker `vale3` e nome `Vale S.A.`
    - When:  o form é preenchido
    - Then:  `podeAdicionar()` é true
  - **Depends on**: TASK-13
  - **Satisfies**: AC-06, AC-11, AC-12
  - **Complexity**: S

- [x] TASK-18 · `adicionar()` envia ticker maiúsculo e trata 201
  - **Layer**: Component
  - **Description**: `adicionar()` no-op se `!podeAdicionar()`. Payload: `nomeAcao: value.trim().toUpperCase()`, `nomeCompleto: value.trim()`. `carregandoCadastro` + `finalize`. 201: `acoes.update` concat + `localeCompare`; `form.reset()`; `erroCadastro.set(undefined)`. Spec: input `vale3` → POST `{ nomeAcao: 'VALE3', ... }`; 201 → VALE3 na lista; inputs vazios após reset.
  - **BDD scenario**:
    - Given: formulário `vale3` + `Vale S.A.`
    - When:  o usuário confirma Adicionar e a API retorna 201
    - Then:  o POST usa `VALE3` e a linha aparece na lista
  - **Depends on**: TASK-07, TASK-17
  - **Satisfies**: AC-07, AC-08
  - **Complexity**: S

- [x] TASK-19 · UI de erro de cadastro (409, 400, 5xx)
  - **Layer**: Component
  - **Description**: Falha de `criar` → `erroCadastro.set(err.message)` em slot `role="alert"`. Não limpar `acoes()`. Specs: 409 com `mensagem` da API visível; 500 mostra `MSG_FALHA_CADASTRAR`; lista prévia permanece.
  - **BDD scenario**:
    - Given: a lista já tem BBAS3 e o POST retorna 409 com `mensagem`
    - When:  Adicionar falha
    - Then:  o alerta mostra a `mensagem` e BBAS3 continua na lista
  - **Depends on**: TASK-08, TASK-09, TASK-18
  - **Satisfies**: AC-09, AC-10, AC-11
  - **Complexity**: S

- [x] TASK-20 · `atualizarCotacoes()` loading e 200
  - **Layer**: Component
  - **Description**: Botão **Atualizar cotações** `type="button"` (não submit do form). No-op se `emOperacao()`. Antes do POST: `erroAtualizacao` e `relatorio` limpos; `carregandoAtualizacao.set(true)`. 200: `relatorio.set` com os quatro totais visíveis (`role="status"`) e chamar `carregarAcoes()`. Spec: botões Adicionar e Atualizar disabled durante o POST; 200 mostra os totais e dispara novo GET `/acoes`.
  - **BDD scenario**:
    - Given: POST atualização 200 com `totalAtualizadas = 10`
    - When:  o usuário clica Atualizar cotações
    - Then:  o resumo mostra 10 e um novo GET `/acoes` ocorre
  - **Depends on**: TASK-11, TASK-14, TASK-17
  - **Satisfies**: AC-12, AC-13
  - **Complexity**: S

- [x] TASK-21 · Falha da atualização de cotações
  - **Layer**: Component
  - **Description**: Erro de `executar` → `erroAtualizacao.set(MSG_FALHA_ATUALIZAR_COTACOES)` (ou `err.message`); **não** `acoes.set([])`. Spec: lista com PETR4 + throwError → alerta genérico e PETR4 permanece.
  - **BDD scenario**:
    - Given: a lista tem PETR4 e o POST de atualização falha
    - When:  Atualizar cotações termina em erro
    - Then:  o alerta genérico aparece e PETR4 segue na tabela
  - **Depends on**: TASK-12, TASK-20
  - **Satisfies**: AC-14
  - **Complexity**: S

- [x] TASK-22 · Ausência de exclusão
  - **Layer**: Component
  - **Description**: Template sem botão/ícone/aria de excluir, remover ou deletar ação. Spec negativo: `nativeElement` não contém botão cujo texto/aria case `/excluir|remover|deletar/i`. `AcaoApiService` sem método `deletar`.
  - **BDD scenario**:
    - Given: a tela de Ações renderizada
    - When:  o DOM é inspecionado
    - Then:  não existe controle de exclusão de ação
  - **Depends on**: TASK-13
  - **Satisfies**: AC-15
  - **Complexity**: XS

- [x] TASK-23 · Header no topo + a11y do form
  - **Layer**: Component
  - **Description**: `<app-header-menu>` primeiro filho do template. `(ngSubmit)="adicionar()"`. `role="alert"` nos erros; spinner com `aria-live`. Spec: `app-header-menu` presente.
  - **BDD scenario**:
    - Given: a tela `/acoes`
    - When:  o template renderiza
    - Then:  `app-header-menu` está no DOM
  - **Depends on**: TASK-13
  - **Satisfies**: AC-01
  - **Complexity**: XS

- [x] TASK-24 · Rota lazy `/acoes`
  - **Layer**: Routing
  - **Description**: Em `src/app/app.routes.ts`, inserir **antes** de `**`: `path: 'acoes'`, `loadComponent` de `GestaoAcoesComponent`, `data: { title: 'Ações' }`. Sem `canActivate`, sem `providers`. Não alterar as rotas existentes.
  - **BDD scenario**:
    - Given: `app.routes.ts`
    - When:  as rotas são lidas
    - Then:  existe `path: 'acoes'` com `loadComponent` e `painel-rolagem` / `simulacao-meta-premio` / `carteira` permanecem
  - **Depends on**: TASK-13
  - **Satisfies**: AC-01, AC-17
  - **Complexity**: XS

- [x] TASK-25 · Item de menu **Ações**
  - **Layer**: Shared UI
  - **Description**: Em `header-menu.component.ts`, inserir `{ label: 'Ações', route: '/acoes', icon: '📈' }` **entre** Meta de Prêmio e Carteira. Não remover/renomear Home, Busca de Rolagens, Meta de Prêmio, Carteira. Em `header-menu.component.spec.ts`: `menuItems.length === 5`; `links.length === 5`; asserir rótulo Ações **e** os quatro rótulos antigos.
  - **BDD scenario**:
    - Given: o header renderiza
    - When:  os links são listados
    - Then:  existem 5 itens e os rótulos incluem Ações, Home, Busca de Rolagens, Meta de Prêmio e Carteira
  - **Depends on**: TASK-24
  - **Satisfies**: AC-01
  - **Complexity**: S

- [x] TASK-26 · Spec: Adicionar desabilitado com ticker inválido (não dispara HTTP)
  - **Layer**: Test
  - **Description**: Em `gestao-acoes.component.spec.ts`: preencher `VALE` (4) ou `SANB11` (6) + nome válido; `podeAdicionar()` false; spy de `criar` **não** chamado se `adicionar()` for invocado. Cobre edge case da spec (4 ou 6 chars).
  - **BDD scenario**:
    - Given: ticker `SANB11`
    - When:  o form é validado
    - Then:  Adicionar permanece desabilitado e nenhum POST ocorre
  - **Depends on**: TASK-17, TASK-18
  - **Satisfies**: AC-06
  - **Complexity**: XS

- [x] TASK-27 · Spec: operações em voo desabilitam os dois botões
  - **Layer**: Test
  - **Description**: Com GET de lista pendente (`NEVER` ou Subject) ou POST cadastro pendente, Adicionar e Atualizar cotações disabled. Ao completar, reabilitam se o form for válido.
  - **BDD scenario**:
    - Given: `carregarAcoes` ainda não completou
    - When:  a tela está em loading
    - Then:  os dois botões estão desabilitados
  - **Depends on**: TASK-17, TASK-20
  - **Satisfies**: AC-12
  - **Complexity**: XS

- [x] TASK-28 · Spec: reentrada dispara novo GET
  - **Layer**: Test
  - **Description**: Instância nova do componente (simula sair/voltar) chama `listar` outra vez. Serviços sem guardar lista. Documentar na spec que não há `providers` na rota (TASK-24).
  - **BDD scenario**:
    - Given: o componente é destruído e recriado
    - When:  `ngOnInit` roda de novo
    - Then:  `listar` é chamado novamente
  - **Depends on**: TASK-14, TASK-24
  - **Satisfies**: AC-17
  - **Complexity**: XS

## Mapeamento AC → tasks

| AC | Tasks |
|----|-------|
| AC-01 | TASK-23, TASK-24, TASK-25 |
| AC-02 | TASK-13, TASK-14 |
| AC-03 | TASK-01, TASK-06, TASK-15 |
| AC-04 | TASK-05, TASK-15 |
| AC-05 | TASK-10, TASK-16 |
| AC-06 | TASK-13, TASK-17, TASK-26 |
| AC-07 | TASK-02, TASK-07, TASK-18 |
| AC-08 | TASK-07, TASK-18 |
| AC-09 | TASK-04, TASK-08, TASK-19 |
| AC-10 | TASK-09, TASK-19 |
| AC-11 | TASK-05, TASK-09, TASK-19 |
| AC-12 | TASK-11, TASK-17, TASK-20, TASK-27 |
| AC-13 | TASK-03, TASK-11, TASK-20 |
| AC-14 | TASK-05, TASK-12, TASK-21 |
| AC-15 | TASK-22 |
| AC-16 | N/A código novo — F-024 `carregarAcoes` na Meta de Prêmio; não alterar essa tela |
| AC-17 | TASK-14, TASK-24, TASK-28 |
| AC-18 | TASK-15 |

## Ordem sugerida de execução
TASK-01..06 (models/utils) → TASK-07..12 (HTTP) → TASK-13..23 (tela) → TASK-24..25 (rota/menu) → TASK-26..28 (specs de borda).
