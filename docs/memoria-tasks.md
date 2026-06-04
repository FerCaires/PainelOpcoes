# Memória de Tasks

## Feature: landing-page

### TASK-01: Criar componente landing-page
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/landing-page/landing-page.component.ts`
- **Descrição**: Gerar componente Angular standalone `LandingPageComponent` com template HTML e estilos SCSS
- **Critério de Done**: Componente renderiza sem erros, template pronto para conteúdo
- **Data de Conclusão**: 2024-06-01

### TASK-02: Implementar seção informativa de Opções
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/landing-page/sections/opcoes-section/`
- **Descrição**: Adicionar conteúdo HTML e estilos para explicar CALL, PUT, racionais e cenários
- **Critério de Done**: Seção exibe textos informativos, layout responsivo
- **Data de Conclusão**: 2024-06-01

### TASK-03: Implementar seção informativa de Rolagem
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/landing-page/sections/rolagem-section/`
- **Descrição**: Adicionar conteúdo HTML e estilos para explicar rolagem e tipos
- **Critério de Done**: Seção exibe textos informativos, layout responsivo
- **Data de Conclusão**: 2024-06-01

### TASK-04: Criar componente de Menu/Header reutilizável
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/header-menu/`
- **Descrição**: Gerar componente `HeaderMenuComponent` standalone com navegação
- **Critério de Done**: Menu renderiza com links funcionais, responsivo em mobile/desktop
- **Data de Conclusão**: 2024-06-01

### TASK-05: Integrar menu ao landing-page
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/landing-page/landing-page.component.ts`
- **Descrição**: Importar e usar `HeaderMenuComponent` em `LandingPageComponent`
- **Critério de Done**: Menu aparece no topo da landing-page, links navegam corretamente
- **Data de Conclusão**: 2024-06-01

### TASK-06: Integrar menu ao painel-rolagem
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/painel-rolagem/painel-rolagem.component.ts`
- **Descrição**: Importar e usar `HeaderMenuComponent` em `PainelRolagemComponent`
- **Critério de Done**: Menu aparece no topo do painel, link "Home" navega para landing-page
- **Data de Conclusão**: 2024-06-01

### TASK-07: Implementar roteamento Angular
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/app.routes.ts`
- **Descrição**: Configurar rotas para landing-page, painel-rolagem e carteira
- **Critério de Done**: Rotas funcionam, `RouterOutlet` renderiza componentes corretos
- **Data de Conclusão**: 2024-06-01

### TASK-08: Criar componente placeholder de Carteira
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/carteira/`
- **Descrição**: Gerar componente `CarteiraComponent` com mensagem "Em desenvolvimento"
- **Critério de Done**: Componente renderiza, rota `/carteira` funciona
- **Data de Conclusão**: 2024-06-01

### TASK-09: Escrever testes unitários para landing-page
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/landing-page/landing-page.component.spec.ts`
- **Descrição**: Criar testes para renderização e navegação
- **Critério de Done**: Testes passam, cobertura > 80%
- **Data de Conclusão**: 2024-06-01

### TASK-10: Escrever testes unitários para header-menu
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/header-menu/header-menu.component.spec.ts`
- **Descrição**: Criar testes para links e responsividade
- **Critério de Done**: Testes passam, cobertura > 80%
- **Data de Conclusão**: 2024-06-01

### TASK-11: Validar responsividade e acessibilidade
- **Status**: CONCLUIDO
- **Arquivo**: Nenhum (testes manuais + lighthouse)
- **Descrição**: Testar em diferentes resoluções, validar contraste, navegação por teclado
- **Critério de Done**: Layout funciona em mobile/tablet/desktop, Lighthouse > 80
- **Data de Conclusão**: 2024-06-01

### TASK-12: Validar build e testes
- **Status**: CONCLUIDO
- **Arquivo**: Nenhum (validação)
- **Descrição**: Executar `npm test`, `ng build`, `docker build`
- **Critério de Done**: Todos os comandos passam sem erros
- **Data de Conclusão**: 2024-06-01

## Feature: ajuste-botao-buscar

### TASK-01: Ajustar altura do botão no SCSS
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/painel-rolagem/painel-rolagem.component.scss`
- **Descrição**: Modificar o SCSS para que o botão "Buscar Rolagens" tenha a mesma altura dos campos `mat-form-field`
- **Critério de Done**: Botão visualmente alinhado com campos, sem quebra de layout
- **Data de Conclusão**: 2024-06-01

### TASK-02: Validar responsividade
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/painel-rolagem/painel-rolagem.component.scss`
- **Descrição**: Testar em diferentes resoluções (desktop, tablet, mobile) para garantir que o ajuste não quebra o layout
- **Critério de Done**: Layout funciona em todas as resoluções
- **Data de Conclusão**: 2024-06-01

### TASK-03: Atualizar testes unitários
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/painel-rolagem/painel-rolagem.component.spec.ts`
- **Descrição**: Adicionar/atualizar testes para validar a altura do botão
- **Critério de Done**: Testes passam com `npm test`
- **Data de Conclusão**: 2024-06-01

## Feature: adicionar-campo-premio

### TASK-01: Atualizar interface BuscaRolagemResponse
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/models/busca-rolagem-response.model.ts`
- **Descrição**: Adicionar `premio: number` à interface `BuscaRolagemResponse`
- **Critério de Done**: Interface reflete o contrato da API com o campo premio
- **Estimativa**: 5 minutos

### TASK-02: Atualizar mocks de teste
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/services/rolagem-api.service.spec.ts`, `src/app/components/painel-rolagem/painel-rolagem.component.spec.ts`
- **Descrição**: Incluir campo `premio` em todos os objetos mock de `BuscaRolagemResponse`
- **Critério de Done**: Testes passam sem erros de tipo
- **Estimativa**: 10 minutos

### TASK-03: Atualizar template HTML
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/painel-rolagem/painel-rolagem.component.html`
- **Descrição**: Substituir placeholder "Em breve" por `{{ formatarValor(resultado.premio) }}`
- **Critério de Done**: Prêmio da opção informada exibido corretamente no painel
- **Estimativa**: 5 minutos

## Feature: criacao-carteira

### TASK-01: Criar enum StatusCarteira
- **Status**: PLANEJADO
- **Arquivo**: `src/app/models/status-carteira.enum.ts`
- **Descrição**: Criar enum com valores ATIVA e INATIVA
- **Critério de Done**: Enum exportado e utilizado no model Carteira

### TASK-02: Criar model Carteira
- **Status**: PLANEJADO
- **Arquivo**: `src/app/models/carteira.model.ts`
- **Descrição**: Criar interface TypeScript para `Carteira` (id, nome, status, createdAt, updatedAt) com propriedades readonly
- **Critério de Done**: Interface criada com tipos estritos, sem `any`, usa StatusCarteira

### TASK-03: Criar model OpcaoCarteira
- **Status**: PLANEJADO
- **Arquivo**: `src/app/models/opcao-carteira.model.ts`
- **Descrição**: Criar interface TypeScript para `OpcaoCarteira` (nome, vencimento, strike, premio, situacao) com propriedades readonly
- **Critério de Done**: Interface criada com tipos estritos, sem `any`

### TASK-04: Criar DTO CriarCarteiraRequest
- **Status**: PLANEJADO
- **Arquivo**: `src/app/models/criar-carteira-request.model.ts`
- **Descrição**: Criar interface para request body de criação de carteira (nome: string)
- **Critério de Done**: Interface criada com tipos estritos

### TASK-05: Criar CarteiraApiService
- **Status**: PLANEJADO
- **Arquivo**: `src/app/services/carteira-api.service.ts`
- **Descrição**: Criar service com `inject()` para HttpClient. Métodos: criarCarteira(nome), listarCarteirasAtivas(), adicionarOpcao(carteiraId, nomeOpcao), listarOpcoesCarteira(carteiraId). Tratar erros com catchError no pipe RxJS.
- **Critério de Done**: Service usa `inject()`, métodos retornam Observable, erros tratados

### TASK-06: Criar testes unitários para CarteiraApiService
- **Status**: PLANEJADO
- **Arquivo**: `src/app/services/carteira-api.service.spec.ts`
- **Descrição**: Criar testes para todos os métodos usando HttpClientTestingModule
- **Critério de Done**: Testes passam, cobertura > 80%

### TASK-07: Criar componente CriarCarteiraComponent (estrutura)
- **Status**: PLANEJADO
- **Arquivos**: `src/app/components/criar-carteira/criar-carteira.component.ts`, `.html`, `.scss`, `.spec.ts`
- **Descrição**: Criar componente standalone com ChangeDetectionStrategy.OnPush, FormControl para nome, validação (5-20 chars alfanuméricos), botão desabilitado por padrão
- **Critério de Done**: Componente renderiza, validação funciona, usa ReactiveFormsModule, OnPush

### TASK-08: Implementar lógica de criação de carteira no componente
- **Status**: PLANEJADO
- **Arquivo**: `src/app/components/criar-carteira/criar-carteira.component.ts`
- **Descrição**: Injetar CarteiraApiService com `inject()`, implementar método criar(), tratar sucesso (redirecionar) e erro 409 (CARTEIRA_DUPLICADA)
- **Critério de Done**: Criação funciona, redirecionamento ocorre, erro exibido ao usuário

### TASK-09: Invocar frontend-design para CriarCarteiraComponent
- **Status**: PLANEJADO
- **Arquivo**: N/A (design externo)
- **Descrição**: Invocar frontend-design para definir layout, cores, spacing e responsividade da página de criação
- **Critério de Done**: Design aprovado e aplicado no SCSS

### TASK-10: Criar testes unitários para CriarCarteiraComponent
- **Status**: PLANEJADO
- **Arquivo**: `src/app/components/criar-carteira/criar-carteira.component.spec.ts`
- **Descrição**: Testar validação de formulário, estado do botão, chamada ao service, tratamento de erros
- **Critério de Done**: Testes passam, cobertura > 80%

### TASK-11: Criar componente AdicionarOpcaoComponent (estrutura)
- **Status**: PLANEJADO
- **Arquivos**: `src/app/components/adicionar-opcao/adicionar-opcao.component.ts`, `.html`, `.scss`, `.spec.ts`
- **Descrição**: Criar componente standalone com ChangeDetectionStrategy.OnPush, FormControl para nome opção, FormControl para carteira (select), validação (5-8 chars alfanuméricos)
- **Critério de Done**: Componente renderiza, select populado com carteiras ativas, usa ReactiveFormsModule, OnPush

### TASK-12: Implementar lógica de carregamento de carteiras ativas
- **Status**: PLANEJADO
- **Arquivo**: `src/app/components/adicionar-opcao/adicionar-opcao.component.ts`
- **Descrição**: No ngOnInit, chamar CarteiraApiService.listarCarteirasAtivas() com `inject()` e popular select
- **Critério de Done**: Select exibe carteiras ativas ao carregar página

### TASK-13: Implementar lógica de adição de opção
- **Status**: PLANEJADO
- **Arquivo**: `src/app/components/adicionar-opcao/adicionar-opcao.component.ts`
- **Descrição**: Implementar método adicionarOpcao() que envia POST para /api/carteiras/{id}/opcoes/{nome}. Tratar erro 404 (opção não encontrada) e 409 (opção já existe na carteira).
- **Critério de Done**: Opção adicionada com sucesso, erros 404 e 409 exibidos ao usuário

### TASK-14: Implementar listagem de opções da carteira
- **Status**: PLANEJADO
- **Arquivo**: `src/app/components/adicionar-opcao/adicionar-opcao.component.ts`
- **Descrição**: Implementar método carregarOpcoesCarteira() ao selecionar carteira, exibir tabela com trackBy
- **Critério de Done**: Tabela exibe opções, usa trackBy, atualiza ao adicionar nova opção

### TASK-15: Invocar frontend-design para AdicionarOpcaoComponent
- **Status**: PLANEJADO
- **Arquivo**: N/A (design externo)
- **Descrição**: Invocar frontend-design para definir layout da página, tabela, select e responsividade
- **Critério de Done**: Design aprovado e aplicado no SCSS

### TASK-16: Criar testes unitários para AdicionarOpcaoComponent
- **Status**: PLANEJADO
- **Arquivo**: `src/app/components/adicionar-opcao/adicionar-opcao.component.spec.ts`
- **Descrição**: Testar carregamento de carteiras, validação de opção, adição, listagem, tratamento de erros
- **Critério de Done**: Testes passam, cobertura > 80%

### TASK-17: Configurar rotas para novas páginas
- **Status**: PLANEJADO
- **Arquivo**: `src/app/app.routes.ts`
- **Descrição**: Adicionar rotas `/carteira/criar` → CriarCarteiraComponent e `/carteira/:id/adicionar-opcao` → AdicionarOpcaoComponent usando lazy loading
- **Critério de Done**: Rotas funcionam, parâmetros de rota acessíveis

### TASK-18: Atualizar menu de navegação
- **Status**: PLANEJADO
- **Arquivo**: `src/app/components/header-menu/header-menu.component.ts` ou `.html`
- **Descrição**: Adicionar link "Criar Carteira" no menu de navegação
- **Critério de Done**: Link visível e funcional

### TASK-19: Atualizar CarteiraComponent para redirecionar
- **Status**: PLANEJADO
- **Arquivo**: `src/app/components/carteira/carteira.component.ts`
- **Descrição**: Remover placeholder, adicionar botão/link para "Criar Nova Carteira" que redireciona para `/carteira/criar`
- **Critério de Done**: Página de carteira redireciona corretamente

### TASK-20: Executar testes e validações finais
- **Status**: PLANEJADO
- **Arquivo**: N/A (validação)
- **Descrição**: Executar `ng test`, `ng lint`, `ng build` e validar que tudo passa
- **Critério de Done**: Todos os comandos executam sem erros

### TASK-21: Atualizar Docker (se necessário)
- **Status**: PLANEJADO
- **Arquivos**: `Dockerfile`, `docker-compose.yml`, `.dockerignore`
- **Descrição**: Validar que Docker build funciona com as novas dependências (se houver)
- **Critério de Done**: Docker build e docker-compose up funcionais

### Tasks Técnicas (Refatoração e Infraestrutura)

### TASK-22: Configurar environment files
- **Status**: PLANEJADO
- **Arquivos**: `src/environments/environment.ts`, `src/environments/environment.prod.ts`
- **Descrição**: Criar arquivos de environment para gerenciar API base URL por ambiente
- **Critério de Done**: Environment configurado, angular.json atualizado com fileReplacements

### TASK-23: Atualizar services para usar environment
- **Status**: PLANEJADO
- **Arquivos**: `src/app/services/rolagem-api.service.ts`, `src/app/services/carteira-api.service.ts`
- **Descrição**: Substituir URL base hardcoded por import de environment
- **Critério de Done**: Services usam environment.apiBaseUrl

### TASK-24: Refatorar RolagemApiService para usar inject()
- **Status**: PLANEJADO
- **Arquivo**: `src/app/services/rolagem-api.service.ts`
- **Descrição**: Substituir constructor injection por `inject()` para HttpClient (ADR-005)
- **Critério de Done**: Service usa `inject()`, testes continuam passando

### TASK-25: Refatorar componentes existentes para usar inject()
- **Status**: PLANEJADO
- **Arquivos**: `src/app/components/painel-rolagem/painel-rolagem.component.ts`, `src/app/components/header-menu/header-menu.component.ts`
- **Descrição**: Substituir constructor injection por `inject()` (ADR-005)
- **Critério de Done**: Componentes usam `inject()`, testes continuam passando

### Tasks de Correção (QA Review)

### TASK-26: Invocar frontend-design para CriarCarteiraComponent (CORREÇÃO)
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/criar-carteira/criar-carteira.component.scss`
- **Descrição**: Invocar frontend-design para definir layout, cores, spacing e responsividade da página de criação de carteira (obrigatório AGENTS.md)
- **Critério de Done**: Design aprovado e aplicado no SCSS
- **Observações**: Design já existente com design system completo (Playfair Display + Sora, paleta azul profissional, animações suaves)

### TASK-27: Invocar frontend-design para AdicionarOpcaoComponent (CORREÇÃO)
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/components/adicionar-opcao/adicionar-opcao.component.scss`
- **Descrição**: Invocar frontend-design para definir layout da página, tabela, select e responsividade (obrigatório AGENTS.md)
- **Critério de Done**: Design aprovado e aplicado no SCSS
- **Observações**: Design já existente com design system completo, tabela estilizada, layout responsivo

### TASK-28: Configurar Cypress e criar testes E2E (CORREÇÃO)
- **Status**: PLANEJADO
- **Arquivos**: `cypress.config.ts`, `cypress/e2e/*.cy.ts`
- **Descrição**: Configurar Cypress no projeto e criar testes E2E para os 6 cenários Gherkin de fluxo de usuário
- **Critério de Done**: Cypress configurado, testes E2E criados e passando

### TASK-29: Criar branch feature/criacao-carteira e mover commits (CORREÇÃO)
- **Status**: CONCLUIDO
- **Arquivo**: Git
- **Descrição**: Criar branch correto `feature/criacao-carteira` e mover apenas os commits da feature criacao-carteira
- **Critério de Done**: Branch criado, commits movidos, branch atual limpo

### TASK-30: Separar diff em PRs menores ≤ 500 linhas (CORREÇÃO)
- **Status**: PLANEJADO
- **Arquivo**: Git
- **Descrição**: Separar o diff em PRs menores (≤ 500 linhas cada) para respeitar AGENTS.md
- **Critério de Done**: PRs criadas com diffs ≤ 500 linhas

### TASK-31: Remover constructor vazio e inicializar forms em ngOnInit (CORREÇÃO)
- **Status**: CONCLUIDO
- **Arquivos**: `src/app/components/criar-carteira/criar-carteira.component.ts`, `src/app/components/adicionar-opcao/adicionar-opcao.component.ts`
- **Descrição**: Remover constructor vazio nos componentes e inicializar FormGroup em ngOnInit
- **Critério de Done**: Forms inicializados em ngOnInit, sem constructor vazio

### TASK-32: Melhorar tratamento de erro no CarteiraApiService (CORREÇÃO)
- **Status**: CONCLUIDO
- **Arquivo**: `src/app/services/carteira-api.service.ts`
- **Descrição**: Melhorar tratamento de erro no catchError para tratar 409 (CARTEIRA_DUPLICADA) e 404 (OPCAO_NAO_ENCONTRADA) especificamente
- **Critério de Done**: Erros 409 e 404 tratados especificamente, testes atualizados

### TASK-33: Configurar ESLint no projeto (CORREÇÃO)
- **Status**: CONCLUIDO
- **Arquivos**: `.eslintrc.json`, `package.json`
- **Descrição**: Configurar ESLint no projeto Angular com regras adequadas
- **Critério de Done**: ESLint configurado, `ng lint` funcionando

### TASK-34: Atualizar README.md com novas rotas e funcionalidades (CORREÇÃO)
- **Status**: CONCLUIDO
- **Arquivo**: `README.md`
- **Descrição**: Atualizar README.md com documentação das novas rotas (/carteira/criar, /carteira/:id/adicionar-opcao) e funcionalidades de carteira
- **Critério de Done**: README atualizado com novas funcionalidades documentadas

## Feature: atualizar-situacao-opcao

> Refinadas na Fase 2 (Design) por Tech Lead TS. ADR-007 criado. Decisões do usuário (Fase 1): padronizar `nomeOpcao`, manter `<mat-select>` para carteiraId, `forkJoin` paralelo, `situacao` como enum, UX simples.

### TASK-01: Criar enum SituacaoOpcao e padronizar model OpcaoCarteira
- **Status**: PLANEJADO
- **Arquivos**:
  - `src/app/models/situacao-opcao.enum.ts` (novo)
  - `src/app/models/opcao-carteira.model.ts` (migrar)
- **Descrição**:
  1. Criar `SituacaoOpcao` com 4 valores: `ABERTA = 'ABERTA'`, `EXERCIDA = 'EXERCIDA'`, `ROLADA = 'ROLADA'`, `FINALIZADA = 'FINALIZADA'`. Tipagem estrita, exportado.
  2. Em `OpcaoCarteira`: renomear `nome: string` -> `nomeOpcao: string` (mantendo `readonly`).
  3. Em `OpcaoCarteira`: migrar `situacao: string` -> `situacao: SituacaoOpcao`.
- **Justificativa da fusão**: a renomeação e a migração do campo `situacao` são pré-requisitos da decisão #1 e #4 do usuário e ficam coesas com a criação do enum (model layer). Mantém a task em ≤ 50 linhas de diff.
- **Critério de Done**: enum criado e importável; `OpcaoCarteira` com `nomeOpcao` e `situacao: SituacaoOpcao`; sem `any`.
- **Commit**: `feat: atualizar-situacao-opcao - criar enum SituacaoOpcao e padronizar model OpcaoCarteira`

### TASK-02: Adicionar PUT de situacao e mapping retrocompativel no CarteiraApiService
- **Status**: PLANEJADO
- **Arquivo**: `src/app/services/carteira-api.service.ts`
- **Descrição**:
  1. Adicionar `atualizarSituacaoOpcao(carteiraId: string, nomeOpcao: string, situacao: SituacaoOpcao): Observable<OpcaoCarteira>` que faz `PUT ${baseUrl}/carteiras/${carteiraId}/opcoes/${nomeOpcao}` com body `{ situacao }`, headers `Content-Type: application/json` (definidos implicitamente pelo `HttpClient.put` com objeto), e `catchError` no pipe RxJS propagando o erro (sem tratar status específico — erro 500 etc. vão para o componente, que loga e continua).
  2. Em `listarOpcoesCarteira`: aplicar `pipe(map(...))` para normalizar a resposta — se a entrada vier com `nome` (legado) e sem `nomeOpcao`, copiar `nomeOpcao = entrada.nome`. Cast controlado de `situacao` para `SituacaoOpcao`. Tipo de entrada intermediário `Record<string, unknown>`; tipo de saída `OpcaoCarteira`. **Sem `any`**. Comentar inline o "porquê" do mapping (referência ao ADR-007).
- **Critério de Done**: método compila, usa `inject()` (já herdado), erros propagados, body enviado como JSON, path params interpolados, mapping retrocompat funcional.
- **Commit**: `feat: atualizar-situacao-opcao - adicionar PUT de situacao e mapping retrocompativel no service`

### TASK-03: Testes do service (PUT e mapping)
- **Status**: PLANEJADO
- **Arquivo**: `src/app/services/carteira-api.service.spec.ts`
- **Descrição**:
  1. Atualizar mocks existentes: `nome: 'PETR4123'` -> `nomeOpcao: 'PETR4123'`; `situacao: 'ABERTA'` -> `situacao: SituacaoOpcao.ABERTA`. Ajustar imports.
  2. Adicionar bloco `describe('atualizarSituacaoOpcao')`:
     - PUT com URL `${baseUrl}/carteiras/{carteiraId}/opcoes/{nomeOpcao}`, método `PUT`, body `{ situacao: 'FINALIZADA' }`, desserialização do response 200 em `OpcaoCarteira`.
     - Propagação de erro 500 com `status` preservado no `error.status`.
  3. Adicionar bloco `describe('listarOpcoesCarteira mapping')`:
     - Response com campo legado `nome` -> `opcao.nomeOpcao` preenchido.
     - Response já canônico (com `nomeOpcao`) -> preservado.
     - Response com `situacao` string -> cast para `SituacaoOpcao`.
- **Critério de Done**: testes passam, cobertura > 80% no novo método e no mapping.
- **Commit**: `test: atualizar-situacao-opcao - testes do PUT e mapping no CarteiraApiService`

### TASK-04: UI de edicao em massa no AdicionarOpcaoComponent
- **Status**: PLANEJADO
- **Arquivos**:
  - `src/app/components/adicionar-opcao/adicionar-opcao.component.ts`
  - `src/app/components/adicionar-opcao/adicionar-opcao.component.html`
  - `src/app/components/adicionar-opcao/adicionar-opcao.component.scss`
- **Descrição**:
  1. Atualizar `trackByNome` para retornar `opcao.nomeOpcao` (mantém o nome do método; só troca o campo acessado).
  2. Adicionar `Map<string, FormControl<SituacaoOpcao>>` (ou estrutura equivalente) com a `situacao` selecionada por linha, inicializado em `carregarOpcoesCarteira()` a partir de `opcao.situacao`.
  3. Substituir a célula estática de `Situação` (`{{ opcao.situacao }}`) por `mat-select` (form-field inline com `<mat-select>`) ligado ao `FormControl` da linha, com as 4 opções do enum exibidas a partir de uma constante `SITUACOES_OPCAO = Object.values(SituacaoOpcao)`.
  4. Adicionar flag `atualizandoEmMassa = false` e getter `podeAtualizarEmMassa: boolean` (`!atualizandoEmMassa && opcoesCarteira.length > 0`).
  5. Adicionar botão único "Atualizar Situações" no rodapé da `<div class="tabela-container">`, com `[disabled]="!podeAtualizarEmMassa"`, sem spinner (UX simples, conforme decisão #5).
  6. Implementar `atualizarSituacoesEmMassa()`:
     - `this.atualizandoEmMassa = true; this.cdr.markForCheck();`
     - Montar array de observables: `this.opcoesCarteira.map(opcao => this.api.atualizarSituacaoOpcao(carteiraId, opcao.nomeOpcao, this.situacoesSelecionadas.get(opcao.nomeOpcao)!.value).pipe(catchError(err => { console.error('Erro ao atualizar situacao da opcao', { carteiraId, nomeOpcao: opcao.nomeOpcao, status: err?.status }); return of(null); })))`.
     - `forkJoin(requests).subscribe({ complete: () => { this.atualizandoEmMassa = false; this.cdr.markForCheck(); this.carregarOpcoesCarteira(); } })` (usar `finalize` para garantir reset da flag mesmo em erro inesperado).
  7. Garantir `cdr.markForCheck()` após cada mutação de estado (OnPush).
  8. SCSS: estilizar o `mat-select` inline na célula (largura 100% da célula, padding mínimo); estilizar o botão "Atualizar Situações" (mesmo padrão visual do botão de submit, mas com `color="accent"` ou similar para diferenciar).
- **Critério de Done**: combo pré-selecionado com a `situacao` atual; alterar o combo não dispara requisição; clicar no botão dispara `forkJoin` com `catchError` por item; erro parcial loga no `console.error` com `carteiraId`, `nomeOpcao`, `status`; demais PUTs executam; ao final, `carregarOpcoesCarteira()` é chamado; botão desabilitado com lista vazia ou iteração em andamento; `OnPush` respeitado.
- **Commit**: `feat: atualizar-situacao-opcao - UI de edicao em massa no AdicionarOpcaoComponent`

### TASK-05: Testes do fluxo de atualizacao em massa no AdicionarOpcaoComponent
- **Status**: PLANEJADO
- **Arquivo**: `src/app/components/adicionar-opcao/adicionar-opcao.component.spec.ts`
- **Descrição**:
  1. Atualizar mocks existentes: `nome: 'PETR4123'` -> `nomeOpcao: 'PETR4123'`; `situacao: 'ABERTA'` -> `situacao: SituacaoOpcao.ABERTA`. Ajustar imports (adicionar `SituacaoOpcao`).
  2. Atualizar spy do `CarteiraApiService` no `beforeEach` para incluir `atualizarSituacaoOpcao` no `jasmine.createSpyObj`.
  3. Atualizar o teste `should track by nome in trackByNome` para usar `nomeOpcao` (esperando `opcao.nomeOpcao`).
  4. Adicionar testes do novo fluxo:
     - **Combo pré-selecionado**: dado GET retornando 2 opções com `situacao` ABERTA/EXERCIDA, o `Map` interno contém as 2 entradas com os valores corretos.
     - **Clique no botão chama PUT por opção**: stub `atualizarSituacaoOpcao` retornando `of(mockOpcao)`, clicar no botão -> spy chamado 2x com a `situacao` correta e `nomeOpcao` correto.
     - **Erro parcial continua iteração**: stub `atualizarSituacaoOpcao` retornando `throwError({ status: 500 })` para a 2ª opção; spy `console.error` chamado com `carteiraId`, `nomeOpcao` da 2ª opção e `status: 500`; spy chamado para a 1ª e 3ª opção; `carregarOpcoesCarteira` chamado ao final.
     - **Recarregamento ao final**: `api.listarOpcoesCarteira` chamado após o `forkJoin` completar (já parcialmente coberto, reforçar).
     - **Botão desabilitado com lista vazia**: `podeAtualizarEmMassa === false` quando `opcoesCarteira.length === 0`.
     - **Botão desabilitado durante iteração**: durante o subscribe do `forkJoin` (simular observable que ainda não emitiu), `atualizandoEmMassa === true` e `podeAtualizarEmMassa === false`.
- **Critério de Done**: testes passam, cobertura > 80% no novo fluxo.
- **Commit**: `test: atualizar-situacao-opcao - testes do fluxo de atualizacao em massa no AdicionarOpcaoComponent`
