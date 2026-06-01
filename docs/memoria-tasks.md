# Memória de Tasks

## Feature: ajuste-botao-buscar

### TASK-01: Ajustar altura do botão no SCSS
- **Status**: PLANEJADO
- **Arquivo**: `src/app/components/painel-rolagem/painel-rolagem.component.scss`
- **Descrição**: Modificar o SCSS para que o botão "Buscar Rolagens" tenha a mesma altura dos campos `mat-form-field`
- **Critério de Done**: Botão visualmente alinhado com campos, sem quebra de layout
- **Estimativa**: 30 minutos

### TASK-02: Validar responsividade
- **Status**: PLANEJADO
- **Arquivo**: `src/app/components/painel-rolagem/painel-rolagem.component.scss`
- **Descrição**: Testar em diferentes resoluções (desktop, tablet, mobile) para garantir que o ajuste não quebra o layout
- **Critério de Done**: Layout funciona em todas as resoluções
- **Estimativa**: 20 minutos

### TASK-03: Atualizar testes unitários
- **Status**: PLANEJADO
- **Arquivo**: `src/app/components/painel-rolagem/painel-rolagem.component.spec.ts`
- **Descrição**: Adicionar/atualizar testes para validar a altura do botão
- **Critério de Done**: Testes passam com `npm test`
- **Estimativa**: 20 minutos

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
