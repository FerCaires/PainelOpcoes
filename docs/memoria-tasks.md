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
