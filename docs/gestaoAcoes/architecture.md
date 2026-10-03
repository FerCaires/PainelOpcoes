# Architecture: F-027 Tela de Gestão de Ações

## Overview

Tela Angular standalone na rota `/acoes`, acessível pelo item de menu **Ações**. O investidor lista ações cadastradas, inclui ticker + nome da empresa e dispara manualmente a atualização de cotações. O Painel **não** cria API nem exclui ação: consome `GET/POST /acoes` e `POST /atualizacao/executar`. Estado em **signals** (`OnPush`); sair da rota destrói o componente. Sem `DELETE` no cliente.

## Knowledge base references

- Reuso: `HeaderMenuComponent`, `environment.apiBaseUrl`, `ApiError`, `AcaoApiService.listar()`, `Acao`, `formatarMonetario`, `MSG_FALHA_CARREGAR_ACOES`, Material (`MatTable`, `MatSpinner`, form fields), Reactive Forms, `inject()`, lazy `loadComponent`
- Endpoints consumidos (já existem): `GET /acoes`, `POST /acoes`, `POST /atualizacao/executar`
- ADRs de projeto: ADR-001..006
- BR-UI-07, BR-UI-08, BR-UI-11, BR-UI-12, BR-UI-13, BR-UI-20, BR-UI-25 a BR-UI-28

## Component diagram

```
menu "Ações" → /acoes  (lazy loadComponent)
  GestaoAcoesComponent  (standalone, OnPush, signals)
    ├── HeaderMenuComponent
    ├── FormGroup (nomeAcao, nomeCompleto)
    ├── AcaoApiService
    │     GET  {apiBaseUrl}/acoes          → listar (erro genérico)
    │     POST {apiBaseUrl}/acoes          → criar  (4xx: mensagem)
    └── AtualizacaoApiService
          POST {apiBaseUrl}/atualizacao/executar  → executar (falha: genérico)
```

Não alterar `SimulacaoMetaPremioComponent` nem `PainelRolagemComponent`. AC-16 é efeito colateral do `GET /acoes` já existente na entrada da Meta de Prêmio.

## Technology decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tela | Nova, lazy `/acoes` | AC-01 / BR-UI-25; padrão carteira (não eager como rolagem) |
| Menu | Acrescentar **Ações** entre Meta de Prêmio e Carteira | BR-UI-08: não remover/renomear os quatro itens atuais |
| Estado | Signals + OnPush | Padrão de tela nova; sem `ChangeDetectorRef` |
| Persistência no cliente | Nenhuma | AC-17; cadastro vive no backend |
| `AcaoApiService` | Estender com `criar()`; `listar()` inalterado | Mesmo recurso; mapeamento de erro **oposto** entre GET e POST (ADR-01) |
| Atualização | `AtualizacaoApiService` novo | Path diferente; não misturar job de cotações com CRUD de ação |
| Exclusão | Não implementar `deletar` no service nem na UI | BR-UI-26 / AC-15 |
| Model `Acao` | Acrescentar `dataAtualizacao?: string` | Backend já envia; opcional para não quebrar mocks F-024 |
| Ticker | `Validators.pattern(/^[A-Za-z0-9]{5}$/)` + `toUpperCase()` no POST | AC-06 / AC-07; API exige 5 chars |
| Nome | `minLength(4)` `maxLength(50)` | Contrato `CriarAcaoRequest` |
| Spot nulo | Texto **—** | AC-03 |
| Data/hora | `formatarDataHora` → `DD/MM/YYYY HH:mm` | Gate 1 N-02; não redefinir BR-UI-01 (datas de vencimento) |
| Ordenação da lista | `localeCompare` por `nomeAcao` no cliente | `findAll()` do backend não garante ordem |
| Timeout HTTP | Nenhum extra | Gate 1 N-01; spinner até complete/error |
| Visual | Material + hierarquia da tela Meta de Prêmio | Sem skill do repositório; contraste ≥ 4,5:1 |
| Docker / env | Inalterados | ADR-006 |

## API contract

`apiBaseUrl` = `environment.apiBaseUrl`. Auth: nenhuma.

### GET `{apiBaseUrl}/acoes`

Igual F-024 no **erro**: 4xx/5xx/rede → `MSG_FALHA_CARREGAR_ACOES`; **não** ler `mensagem`.

200: array. Campos usados na tabela: `nomeAcao`, `nomeCompleto`, `precoSpot` (`number \| null`), `dataAtualizacao` (string ISO-8601, ex. `2026-10-02T22:18:00`). `dataCriacao` ignorado.

200 `[]` → estado vazio distinto (não erro); formulário permanece (AC-04).

### POST `{apiBaseUrl}/acoes`

Corpo:

```json
{ "nomeAcao": "VALE3", "nomeCompleto": "Vale S.A." }
```

`nomeAcao` sempre 5 caracteres **maiúsculos** (AC-07).

| Status | `erro` | UI |
|--------|--------|-----|
| 201 | — | Inserir o corpo na lista, ordenar, limpar form e `erroCadastro` (AC-08) |
| 409 | `ACAO_DUPLICADA` | Exibir `mensagem`; lista intacta (AC-09) |
| 400 / 422 | validação | `mensagem` se string não vazia; senão genérica de cadastro (AC-10) |
| 5xx / rede | — | genérica de cadastro (AC-11) |

Não exibir `erro`, `status`, `detalhes`.

### POST `{apiBaseUrl}/atualizacao/executar`

Sem corpo. Sem query.

200: ler `totalRecuperadas`, `totalAtualizadas`, `totalCadastradas`, `totalNaoAtualizadas`. Depois **novo** `GET /acoes` (AC-13). `detalhesNaoAtualizadas` e `dataExecucao` não são exibidos.

Qualquer falha (4xx, 5xx, rede) → mensagem genérica de atualização (AC-14). Lista permanece a última bem-sucedida.

## TypeScript design

### Models

```typescript
// acao.model.ts — estender
export interface Acao {
  readonly nomeAcao: string;
  readonly nomeCompleto: string;
  readonly precoSpot: number | null;
  readonly dataAtualizacao?: string;
}

export interface CriarAcaoRequest {
  readonly nomeAcao: string;
  readonly nomeCompleto: string;
}

export interface RelatorioAtualizacao {
  readonly totalRecuperadas: number;
  readonly totalAtualizadas: number;
  readonly totalCadastradas: number;
  readonly totalNaoAtualizadas: number;
}
```

`AcaoCadastroError extends ApiError` — 4xx de `criar` com `message` = `mensagem` do envelope.

### Serviços

`AcaoApiService.listar()`: **não mudar** o `catchError` (regressão F-024 / BR-UI-13).

`AcaoApiService.criar(request)`: `http.post<Acao>(...)`. Type guard do envelope (nunca `any`). 4xx → `AcaoCadastroError(mensagem | MSG_FALHA_CADASTRAR, status, erro?)`. 5xx/rede → `AcaoCadastroError(MSG_FALHA_CADASTRAR, status)`.

`AtualizacaoApiService.executar()`: `http.post<RelatorioAtualizacao>(`${baseUrl}/atualizacao/executar`, {})`. Qualquer `catchError` → `ApiError(MSG_FALHA_ATUALIZAR_COTACOES, status)`.

### Mensagens (`utils/gestao-acoes-mensagens.ts`)

| Constante | Texto |
|-----------|--------|
| Reuso `MSG_FALHA_CARREGAR_ACOES` | já existente na Meta de Prêmio |
| `MSG_ACOES_CADASTRADAS_VAZIAS` | `Nenhuma ação cadastrada ainda.` |
| `MSG_FALHA_CADASTRAR` | `Não foi possível cadastrar a ação. Tente novamente.` |
| `MSG_FALHA_ATUALIZAR_COTACOES` | `Não foi possível atualizar as cotações. Tente novamente.` |
| Spot nulo | `—` |

### Formatação

`formatarDataHora(iso: string): string` em `formatacao.ts`. Entrada ISO-8601 com data e hora. Saída `DD/MM/YYYY HH:mm` (hora 24h, minutos com 2 dígitos). String ilegível → devolver a original. Não usar `formatarDataIso` (só `YYYY-MM-DD`).

### Componente

```typescript
selector: 'app-gestao-acoes'
ChangeDetectionStrategy.OnPush

form: nomeAcao (required + pattern 5 alfanuméricos),
      nomeCompleto (required + min 4 + max 50)

acoes, carregandoAcoes, erroAcoes
erroCadastro, carregandoCadastro
relatorio, erroAtualizacao, carregandoAtualizacao

emOperacao = carregandoAcoes || carregandoCadastro || carregandoAtualizacao
podeAdicionar = form.valid && !emOperacao
podeAtualizar = !emOperacao
```

Fluxos:

- `ngOnInit` → `carregarAcoes()`
- `adicionar()`: no-op se `!podeAdicionar`. `nomeAcao.trim().toUpperCase()`, `nomeCompleto.trim()`. POST. 201 → `acoes.update` concat + sort; `form.reset()`; limpar `erroCadastro`.
- `atualizarCotacoes()`: no-op se `emOperacao`. Limpar `erroAtualizacao` e `relatorio` **antes** do POST. 200 → set `relatorio` + `carregarAcoes()`.
- `trackByNomeAcao` → `acao.nomeAcao`
- Sem método/botão de exclusão

Colunas da tabela (ordem): `nomeAcao`, `nomeCompleto`, `precoSpot`, `dataAtualizacao`.

Resumo da atualização: quatro totais visíveis quando `relatorio()` estiver definido; `role="status"`. Erros: `role="alert"`.

### Rota

Inserir **antes** de `path: '**'`:

```typescript
{
  path: 'acoes',
  loadComponent: () =>
    import('./components/gestao-acoes/gestao-acoes.component')
      .then(m => m.GestaoAcoesComponent),
  data: { title: 'Ações' }
}
```

Sem guard. Sem `providers` na rota (AC-17).

### Menu

```typescript
{ label: 'Home', route: '/', icon: '🏠' },
{ label: 'Busca de Rolagens', route: '/painel-rolagem', icon: '🔍' },
{ label: 'Meta de Prêmio', route: '/simulacao-meta-premio', icon: '🎯' },
{ label: 'Ações', route: '/acoes', icon: '📈' },
{ label: 'Carteira', route: '/carteira', icon: '💼' }
```

Specs do header: 4 → **5** itens; asserir rótulo **Ações**; Home / Busca / Meta / Carteira permanecem.

### Template / CSS

- `<app-header-menu>` no topo (BR-UI-07)
- Card de inclusão + botão **Adicionar**
- Botão **Atualizar cotações** (fora do submit do form, para não cadastrar ao atualizar)
- `mat-spinner` quando `emOperacao`
- `.tabela-wrapper { overflow-x: auto; }` (AC-18)
- Sem ícone de lixeira / ação de remover (AC-15)

## Files

Criar:

- `src/app/components/gestao-acoes/gestao-acoes.component.ts|html|scss|spec.ts`
- `src/app/models/criar-acao-request.model.ts`
- `src/app/models/relatorio-atualizacao.model.ts`
- `src/app/services/atualizacao-api.service.ts` + spec
- `src/app/utils/gestao-acoes-mensagens.ts` + spec

Alterar:

- `acao.model.ts` (`dataAtualizacao?`)
- `api-errors.model.ts` (`AcaoCadastroError`)
- `acao-api.service.ts` + spec (`criar`)
- `formatacao.ts` + spec (`formatarDataHora`)
- `app.routes.ts`
- `header-menu.component.ts` + spec

Não alterar: Docker, environments, telas de Rolagem e Meta de Prêmio, `DELETE` de ações.

## Testes

| Alvo | Casos mínimos |
|------|----------------|
| `AcaoApiService.criar` | POST corpo maiúsculo; 201; 409 lê `mensagem`; 400 sem `mensagem` → genérica; 500/rede → genérica |
| `AcaoApiService.listar` | regressão: 4xx ainda **não** lê envelope |
| `AtualizacaoApiService` | POST sem corpo; 200 totais; falha → genérica |
| `formatarDataHora` | ISO → `DD/MM/YYYY HH:mm`; inválida → original |
| Componente | carga lista; vazia; erro GET genérico; Adicionar off se ticker ≠ 5; POST VALE3; 201 na lista; 409 `mensagem`; sem controle excluir; Atualizar desabilita botões; 200 mostra totais e relista |
| Header | 5 itens; rótulo Ações; demais intactos |

Sem Cypress. `ng test`.

## Mapeamento AC-01 .. AC-18 → implementação

| AC | Caminho |
|----|---------|
| **AC-01** | `menuItems` + rota `acoes`; testes 5 itens |
| **AC-02** | `ngOnInit` → `listar()`; `mat-table` |
| **AC-03** | colunas + `formatarMonetario` / `—` / `formatarDataHora` |
| **AC-04** | `MSG_ACOES_CADASTRADAS_VAZIAS`; form visível |
| **AC-05** | `listar()` genérico (inalterado) |
| **AC-06** | validators; `podeAdicionar` |
| **AC-07** | `toUpperCase()` no payload |
| **AC-08** | concat + sort + `reset` |
| **AC-09** | `AcaoCadastroError.message` |
| **AC-10** | fallback genérico se `mensagem` vazia |
| **AC-11** | 5xx/rede → `MSG_FALHA_CADASTRAR` |
| **AC-12** | `emOperacao`; spinner; POST vazio |
| **AC-13** | `relatorio` + `carregarAcoes()` |
| **AC-14** | genérica; não limpar `acoes` |
| **AC-15** | ausência de delete no template e no service |
| **AC-16** | sem mudança na simulação; coberto por F-024 `carregarAcoes` |
| **AC-17** | destroy da rota; reentrada relista |
| **AC-18** | overflow-x; form usável |

## Risks

- Atualização pode durar dezenas de segundos (todas as ações × vencimentos). Spinner sem timeout; usuário não dispara outro POST (`emOperacao`).
- `dataAtualizacao` pode vir como array Jackson se o backend mudar `WRITE_DATES_AS_TIMESTAMPS`. Hoje é string ISO; `formatarDataHora` só trata string.
- Não refatorar telas antigas nem extrair interceptor.

## ADRs

### ADR-01: Estender `AcaoApiService` em vez de um terceiro serviço de cadastro

- **Status**: Accepted
- **Context**: GET lista nunca lê `mensagem`; POST cadastro lê. São o mesmo recurso `/acoes`.
- **Decision**: `listar()` e `criar()` no mesmo service, `catchError` **por método**.
- **Consequences**: Um arquivo; testes de `listar` devem continuar falhando se alguém reutilizar o mapper do POST. `AtualizacaoApiService` fica separado porque o path é outro.

### ADR-02: Sem `DELETE` no cliente

- **Status**: Accepted
- **Context**: A API tem `DELETE /acoes` com cascade (BR-08). Produto: inclusão-only.
- **Decision**: Não expor exclusão na UI nem método `deletar` no service desta feature.
- **Consequences**: Endpoint de delete permanece na API para uso fora do Painel.

### ADR-03: Lazy `/acoes` e item de menu novo

- **Status**: Accepted
- **Context**: Spec rejeitou controles inline em Rolagem/Meta.
- **Decision**: Tela dedicada lazy + quinto item **Ações**.
- **Consequences**: Bundle inicial inalterado; primeiro acesso paga o chunk. Header specs 4 → 5.
