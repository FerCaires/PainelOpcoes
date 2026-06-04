# Feature: Criação de Carteira e Adição de Opções

## Contexto e Objetivo
O Painel de Opções precisa permitir que usuários criem carteiras de opções e adicionem opções a essas carteiras. Atualmente, o componente de carteira é apenas um placeholder. O objetivo é implementar a funcionalidade completa de gerenciamento de carteiras, permitindo criação de carteiras com nome único e adição de opções válidas existentes no banco de dados.

## Requisitos Funcionais

### Criação de Carteira
1. **RF01** — O sistema deve disponibilizar uma página específica para criação de carteira acessível via rota `/carteira/criar`.
2. **RF02** — A página deve conter um campo de texto para nome da carteira com validação de 5-20 caracteres alfanuméricos.
3. **RF03** — O campo de nome deve exibir um placeholder indicativo.
4. **RF04** — O botão de criação deve estar desabilitado por padrão e habilitado apenas quando o nome for válido.
5. **RF05** — O sistema deve enviar requisição POST para `/api/carteiras` com body `{ "nome": "Nova Carteira" }` ao criar carteira.
6. **RF06** — O sistema deve tratar resposta de sucesso com estrutura `{ id, nome, status, createdAt, updatedAt }`.
7. **RF07** — O sistema deve tratar erro 409 com mensagem `CARTEIRA_DUPLICADA` e exibir feedback ao usuário.

### Adição de Opções na Carteira
8. **RF08** — O sistema deve disponibilizar uma página específica para adição de opções acessível via rota `/carteira/{id}/adicionar-opcao`.
9. **RF09** — A página deve conter um campo de texto para nome da opção com validação de 5-8 caracteres alfanuméricos.
10. **RF10** — O campo de nome da opção deve exibir um placeholder indicativo.
11. **RF11** — A página deve conter um combo box (select) listando todas as carteiras ativas disponíveis.
12. **RF12** — O botão de adição deve enviar a requisição para o backend, que é responsável por validar se a opção existe.
13. **RF13** — O sistema deve listar opções da carteira em tabela com colunas: Nome, Vencimento, Strike, Prêmio, Situação.
14. **RF14** — O sistema deve enviar requisição GET para `/api/carteiras?status=ATIVA` ao carregar a página de adição.
15. **RF15** — O backend é responsável por validar se a opção existe no banco de dados. O frontend deve apenas enviar a requisição de adição e tratar os erros retornados pelo backend.
16. **RF16** — O sistema deve enviar requisição POST para `/api/carteiras/{id}/opcoes/{nomeOpcao}` para adicionar opção à carteira.
17. **RF17** — O sistema deve enviar requisição GET para `/api/carteiras/{id}/opcoes` para listar opções da carteira selecionada.

## Requisitos Não-Funcionais
1. **RNF01** — Todas as chamadas de API devem usar `HttpClient` com tratamento de erros via `catchError` no pipe RxJS.
2. **RNF02** — Componentes devem usar `ChangeDetectionStrategy.OnPush` e `trackBy` em listas.
3. **RNF03** — Lógica de negócio deve residir em Services, nunca em componentes.
4. **RNF04** — Tipagem TypeScript estrita, sem uso de `any`.
5. **RNF05** — Cobertura de testes > 80% para regras de negócio.
6. **RNF06** — Validações de formulário devem usar `ReactiveFormsModule` com `FormControl`/`FormGroup`.
7. **RNF07** — Resposta a interações do usuário < 500ms para validações locais.

## Critérios de Aceite (Gherkin)

### Cenário 1: Criar carteira com sucesso
```gherkin
Dado que estou na página de criação de carteira
Quando preencho o campo nome com "MinhaCarteira123" (5-20 caracteres alfanuméricos)
E clico no botão "Criar Carteira"
Então o sistema envia POST para /api/carteiras com body { "nome": "MinhaCarteira123" }
E o sistema exibe mensagem de sucesso
E sou redirecionado para a página da carteira criada
```

### Cenário 2: Tentar criar carteira com nome duplicado
```gherkin
Dado que já existe uma carteira com nome "CarteiraExistente"
E estou na página de criação de carteira
Quando preencho o campo nome com "CarteiraExistente"
E clico no botão "Criar Carteira"
Então o sistema recebe erro 409 com CARTEIRA_DUPLICADA
E o sistema exibe mensagem de erro "Nome de carteira já existe"
E o botão permanece habilitado para nova tentativa
```

### Cenário 3: Validar nome da carteira inválido
```gherkin
Dado que estou na página de criação de carteira
Quando preencho o campo nome com "ABC" (menos de 5 caracteres)
Então o botão "Criar Carteira" permanece desabilitado
E é exibida mensagem de erro "Nome deve ter entre 5 e 20 caracteres alfanuméricos"
```

### Cenário 4: Adicionar opção à carteira com sucesso
```gherkin
Dado que estou na página de adição de opções
E existe uma carteira ativa "MinhaCarteira"
E existe uma opção "PETR4123" no banco de dados
Quando seleciono "MinhaCarteira" no combo box
E preencho o campo nome da opção com "PETR4123"
E clico no botão "Adicionar Opção"
Então o sistema envia POST para /api/carteiras/{id}/opcoes/PETR4123
E o backend valida que a opção existe
E a opção aparece na lista de opções da carteira
```

### Cenário 5: Tentar adicionar opção inexistente
```gherkin
Dado que estou na página de adição de opções
E seleciono uma carteira ativa
Quando preencho o campo nome da opção com "OPCAO999"
E clico no botão "Adicionar Opção"
Então o sistema envia POST para /api/carteiras/{id}/opcoes/OPCAO999
E o backend valida que a opção não existe
E o sistema recebe erro 404 do backend
E é exibida mensagem de erro "Opção não encontrada no sistema"
```

### Cenário 6: Listar opções da carteira
```gherkin
Dado que uma carteira possui opções adicionadas
Quando estou na página da carteira
Então o sistema envia GET para /api/carteiras/{id}/opcoes
E são exibidas as opções em tabela com colunas: Nome, Vencimento, Strike, Prêmio, Situação
```

## Fora do Escopo
- Edição de nome de carteira após criação
- Exclusão de carteiras
- Remoção de opções da carteira
- Cálculos de P&L ou métricas da carteira
- Persistência local (offline mode)
- Autenticação e autorização de usuários

## Tarefas Atômicas

### Feature: criacao-carteira (21 tasks)

1. **TASK-01** Criar enum StatusCarteira
   - **Status**: PLANEJADO
   - **Arquivo**: `src/app/models/status-carteira.enum.ts`
   - **Descrição**: Criar enum com valores ATIVA e INATIVA
   - **Critério de Done**: Enum exportado e utilizado no model Carteira

2. **TASK-02** Criar model Carteira
   - **Status**: PLANEJADO
   - **Arquivo**: `src/app/models/carteira.model.ts`
   - **Descrição**: Criar interface TypeScript para `Carteira` (id, nome, status, createdAt, updatedAt) com propriedades readonly
   - **Critério de Done**: Interface criada com tipos estritos, sem `any`, usa StatusCarteira

3. **TASK-03** Criar model OpcaoCarteira
   - **Status**: PLANEJADO
   - **Arquivo**: `src/app/models/opcao-carteira.model.ts`
   - **Descrição**: Criar interface TypeScript para `OpcaoCarteira` (nome, vencimento, strike, premio, situacao) com propriedades readonly
   - **Critério de Done**: Interface criada com tipos estritos, sem `any`

4. **TASK-04** Criar DTO CriarCarteiraRequest
   - **Status**: PLANEJADO
   - **Arquivo**: `src/app/models/criar-carteira-request.model.ts`
   - **Descrição**: Criar interface para request body de criação de carteira (nome: string)
   - **Critério de Done**: Interface criada com tipos estritos

5. **TASK-05** Criar CarteiraApiService
   - **Status**: PLANEJADO
   - **Arquivo**: `src/app/services/carteira-api.service.ts`
   - **Descrição**: Criar service com `inject()` para HttpClient. Métodos: criarCarteira(nome), listarCarteirasAtivas(), adicionarOpcao(carteiraId, nomeOpcao), listarOpcoesCarteira(carteiraId). Tratar erros com catchError no pipe RxJS.
   - **Critério de Done**: Service usa `inject()`, métodos retornam Observable, erros tratados

6. **TASK-06** Criar testes unitários para CarteiraApiService
   - **Status**: PLANEJADO
   - **Arquivo**: `src/app/services/carteira-api.service.spec.ts`
   - **Descrição**: Criar testes para todos os métodos usando HttpClientTestingModule
   - **Critério de Done**: Testes passam, cobertura > 80%

7. **TASK-07** Criar componente CriarCarteiraComponent (estrutura)
   - **Status**: PLANEJADO
   - **Arquivos**: `src/app/components/criar-carteira/criar-carteira.component.ts`, `.html`, `.scss`, `.spec.ts`
   - **Descrição**: Criar componente standalone com ChangeDetectionStrategy.OnPush, FormControl para nome, validação (5-20 chars alfanuméricos), botão desabilitado por padrão
   - **Critério de Done**: Componente renderiza, validação funciona, usa ReactiveFormsModule, OnPush

8. **TASK-08** Implementar lógica de criação de carteira no componente
   - **Status**: PLANEJADO
   - **Arquivo**: `src/app/components/criar-carteira/criar-carteira.component.ts`
   - **Descrição**: Injetar CarteiraApiService com `inject()`, implementar método criar(), tratar sucesso (redirecionar) e erro 409 (CARTEIRA_DUPLICADA)
   - **Critério de Done**: Criação funciona, redirecionamento ocorre, erro exibido ao usuário

9. **TASK-09** Invocar frontend-design para CriarCarteiraComponent
   - **Status**: PLANEJADO
   - **Arquivo**: N/A (design externo)
   - **Descrição**: Invocar frontend-design para definir layout, cores, spacing e responsividade da página de criação
   - **Critério de Done**: Design aprovado e aplicado no SCSS

10. **TASK-10** Criar testes unitários para CriarCarteiraComponent
    - **Status**: PLANEJADO
    - **Arquivo**: `src/app/components/criar-carteira/criar-carteira.component.spec.ts`
    - **Descrição**: Testar validação de formulário, estado do botão, chamada ao service, tratamento de erros
    - **Critério de Done**: Testes passam, cobertura > 80%

11. **TASK-11** Criar componente AdicionarOpcaoComponent (estrutura)
    - **Status**: PLANEJADO
    - **Arquivos**: `src/app/components/adicionar-opcao/adicionar-opcao.component.ts`, `.html`, `.scss`, `.spec.ts`
    - **Descrição**: Criar componente standalone com ChangeDetectionStrategy.OnPush, FormControl para nome opção, FormControl para carteira (select), validação (5-8 chars alfanuméricos)
    - **Critério de Done**: Componente renderiza, select populado com carteiras ativas, usa ReactiveFormsModule, OnPush

12. **TASK-12** Implementar lógica de carregamento de carteiras ativas
    - **Status**: PLANEJADO
    - **Arquivo**: `src/app/components/adicionar-opcao/adicionar-opcao.component.ts`
    - **Descrição**: No ngOnInit, chamar CarteiraApiService.listarCarteirasAtivas() com `inject()` e popular select
    - **Critério de Done**: Select exibe carteiras ativas ao carregar página

13. **TASK-13** Implementar lógica de adição de opção
    - **Status**: PLANEJADO
    - **Arquivo**: `src/app/components/adicionar-opcao/adicionar-opcao.component.ts`
    - **Descrição**: Implementar método adicionarOpcao() que envia POST para /api/carteiras/{id}/opcoes/{nome}. Tratar erro 404 (opção não encontrada) e 409 (opção já existe na carteira).
    - **Critério de Done**: Opção adicionada com sucesso, erros 404 e 409 exibidos ao usuário

14. **TASK-14** Implementar listagem de opções da carteira
    - **Status**: PLANEJADO
    - **Arquivo**: `src/app/components/adicionar-opcao/adicionar-opcao.component.ts`
    - **Descrição**: Implementar método carregarOpcoesCarteira() ao selecionar carteira, exibir tabela com trackBy
    - **Critério de Done**: Tabela exibe opções, usa trackBy, atualiza ao adicionar nova opção

15. **TASK-15** Invocar frontend-design para AdicionarOpcaoComponent
    - **Status**: PLANEJADO
    - **Arquivo**: N/A (design externo)
    - **Descrição**: Invocar frontend-design para definir layout da página, tabela, select e responsividade
    - **Critério de Done**: Design aprovado e aplicado no SCSS

16. **TASK-16** Criar testes unitários para AdicionarOpcaoComponent
    - **Status**: PLANEJADO
    - **Arquivo**: `src/app/components/adicionar-opcao/adicionar-opcao.component.spec.ts`
    - **Descrição**: Testar carregamento de carteiras, validação de opção, adição, listagem, tratamento de erros
    - **Critério de Done**: Testes passam, cobertura > 80%

17. **TASK-17** Configurar rotas para novas páginas
    - **Status**: PLANEJADO
    - **Arquivo**: `src/app/app.routes.ts`
    - **Descrição**: Adicionar rotas `/carteira/criar` → CriarCarteiraComponent e `/carteira/:id/adicionar-opcao` → AdicionarOpcaoComponent usando lazy loading
    - **Critério de Done**: Rotas funcionam, parâmetros de rota acessíveis

18. **TASK-18** Atualizar menu de navegação
    - **Status**: PLANEJADO
    - **Arquivo**: `src/app/components/header-menu/header-menu.component.ts` ou `.html`
    - **Descrição**: Adicionar link "Criar Carteira" no menu de navegação
    - **Critério de Done**: Link visível e funcional

19. **TASK-19** Atualizar CarteiraComponent para redirecionar
    - **Status**: PLANEJADO
    - **Arquivo**: `src/app/components/carteira/carteira.component.ts`
    - **Descrição**: Remover placeholder, adicionar botão/link para "Criar Nova Carteira" que redireciona para `/carteira/criar`
    - **Critério de Done**: Página de carteira redireciona corretamente

20. **TASK-20** Executar testes e validações finais
    - **Status**: PLANEJADO
    - **Arquivo**: N/A (validação)
    - **Descrição**: Executar `ng test`, `ng lint`, `ng build` e validar que tudo passa
    - **Critério de Done**: Todos os comandos executam sem erros

21. **TASK-21** Atualizar Docker (se necessário)
    - **Status**: PLANEJADO
    - **Arquivos**: `Dockerfile`, `docker-compose.yml`, `.dockerignore`
    - **Descrição**: Validar que Docker build funciona com as novas dependências (se houver)
    - **Critério de Done**: Docker build e docker-compose up funcionais

### Tasks Técnicas (Refatoração e Infraestrutura - 4 tasks)

22. **TASK-22** Configurar environment files
    - **Status**: PLANEJADO
    - **Arquivos**: `src/environments/environment.ts`, `src/environments/environment.prod.ts`
    - **Descrição**: Criar arquivos de environment para gerenciar API base URL por ambiente
    - **Critério de Done**: Environment configurado, angular.json atualizado com fileReplacements

23. **TASK-23** Atualizar services para usar environment
    - **Status**: PLANEJADO
    - **Arquivos**: `src/app/services/rolagem-api.service.ts`, `src/app/services/carteira-api.service.ts`
    - **Descrição**: Substituir URL base hardcoded por import de environment
    - **Critério de Done**: Services usam environment.apiBaseUrl

24. **TASK-24** Refatorar RolagemApiService para usar inject()
    - **Status**: PLANEJADO
    - **Arquivo**: `src/app/services/rolagem-api.service.ts`
    - **Descrição**: Substituir constructor injection por `inject()` para HttpClient (ADR-005)
    - **Critério de Done**: Service usa `inject()`, testes continuam passando

25. **TASK-25** Refatorar componentes existentes para usar inject()
    - **Status**: PLANEJADO
    - **Arquivos**: `src/app/components/painel-rolagem/painel-rolagem.component.ts`, `src/app/components/header-menu/header-menu.component.ts`
    - **Descrição**: Substituir constructor injection por `inject()` (ADR-005)
    - **Critério de Done**: Componentes usam `inject()`, testes continuam passando

### Tasks de Correção (QA Review - 9 tasks)

26. **TASK-26** Invocar frontend-design para CriarCarteiraComponent (CORREÇÃO)
    - **Status**: PLANEJADO
    - **Arquivo**: `src/app/components/criar-carteira/criar-carteira.component.scss`
    - **Descrição**: Invocar frontend-design para definir layout, cores, spacing e responsividade da página de criação de carteira (obrigatório AGENTS.md)
    - **Critério de Done**: Design aprovado e aplicado no SCSS

27. **TASK-27** Invocar frontend-design para AdicionarOpcaoComponent (CORREÇÃO)
    - **Status**: PLANEJADO
    - **Arquivo**: `src/app/components/adicionar-opcao/adicionar-opcao.component.scss`
    - **Descrição**: Invocar frontend-design para definir layout da página, tabela, select e responsividade (obrigatório AGENTS.md)
    - **Critério de Done**: Design aprovado e aplicado no SCSS

28. **TASK-28** Configurar Cypress e criar testes E2E (CORREÇÃO)
    - **Status**: PLANEJADO
    - **Arquivos**: `cypress.config.ts`, `cypress/e2e/*.cy.ts`
    - **Descrição**: Configurar Cypress no projeto e criar testes E2E para os 6 cenários Gherkin de fluxo de usuário
    - **Critério de Done**: Cypress configurado, testes E2E criados e passando

29. **TASK-29** Criar branch feature/criacao-carteira e mover commits (CORREÇÃO)
    - **Status**: PLANEJADO
    - **Arquivo**: Git
    - **Descrição**: Criar branch correto `feature/criacao-carteira` e mover apenas os commits da feature criacao-carteira
    - **Critério de Done**: Branch criado, commits movidos, branch atual limpo

30. **TASK-30** Separar diff em PRs menores ≤ 500 linhas (CORREÇÃO)
    - **Status**: PLANEJADO
    - **Arquivo**: Git
    - **Descrição**: Separar o diff em PRs menores (≤ 500 linhas cada) para respeitar AGENTS.md
    - **Critério de Done**: PRs criadas com diffs ≤ 500 linhas

31. **TASK-31** Remover constructor vazio e inicializar forms em ngOnInit (CORREÇÃO)
    - **Status**: PLANEJADO
    - **Arquivos**: `src/app/components/criar-carteira/criar-carteira.component.ts`, `src/app/components/adicionar-opcao/adicionar-opcao.component.ts`
    - **Descrição**: Remover constructor vazio nos componentes e inicializar FormGroup em ngOnInit
    - **Critério de Done**: Forms inicializados em ngOnInit, sem constructor vazio

32. **TASK-32** Melhorar tratamento de erro no CarteiraApiService (CORREÇÃO)
    - **Status**: PLANEJADO
    - **Arquivo**: `src/app/services/carteira-api.service.ts`
    - **Descrição**: Melhorar tratamento de erro no catchError para tratar 409 (CARTEIRA_DUPLICADA) e 404 (OPCAO_NAO_ENCONTRADA) especificamente
    - **Critério de Done**: Erros 409 e 404 tratados especificamente, testes atualizados

33. **TASK-33** Configurar ESLint no projeto (CORREÇÃO)
    - **Status**: PLANEJADO
    - **Arquivos**: `.eslintrc.json`, `package.json`
    - **Descrição**: Configurar ESLint no projeto Angular com regras adequadas
    - **Critério de Done**: ESLint configurado, `ng lint` funcionando

34. **TASK-34** Atualizar README.md com novas rotas e funcionalidades (CORREÇÃO)
    - **Status**: PLANEJADO
    - **Arquivo**: `README.md`
    - **Descrição**: Atualizar README.md com documentação das novas rotas (/carteira/criar, /carteira/:id/adicionar-opcao) e funcionalidades de carteira
    - **Critério de Done**: README atualizado com novas funcionalidades documentadas

## Riscos e Dependências
- **Dependência**: API backend deve estar implementada com os endpoints especificados
- **Risco**: Validação alfanumérica pode precisar de regex específico (definir no Design)
- **Risco**: Tratamento de erros 409 e 404 pode variar conforme implementação do backend

## Matriz de Rastreabilidade
| Requisito | Tasks | Arquivos | Testes |
|-----------|-------|----------|--------|
| RF01 | TASK-07, TASK-17 | `criar-carteira.component.*`, `app.routes.ts` | TASK-10 |
| RF02-RF04 | TASK-07, TASK-08 | `criar-carteira.component.ts` | TASK-10 |
| RF05-RF07 | TASK-05, TASK-08 | `carteira-api.service.ts`, `criar-carteira.component.ts` | TASK-06, TASK-10 |
| RF08 | TASK-11, TASK-17 | `adicionar-opcao.component.*`, `app.routes.ts` | TASK-16 |
| RF09-RF10 | TASK-11 | `adicionar-opcao.component.ts` | TASK-16 |
| RF11 | TASK-11, TASK-12 | `adicionar-opcao.component.ts` | TASK-16 |
| RF12-RF13 | TASK-13, TASK-14 | `adicionar-opcao.component.ts` | TASK-16 |
| RF14-RF17 | TASK-05, TASK-12, TASK-13, TASK-14 | `carteira-api.service.ts`, `adicionar-opcao.component.ts` | TASK-06, TASK-16 |
| RNF01-RNF07 | TASK-05, TASK-07, TASK-11 | Services e Components | TASK-06, TASK-10, TASK-16 |

## Complexidade: Média
## Estimativa: 34 tarefas atômicas (25 originais + 9 correções)
