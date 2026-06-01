# Feature: Landing-Page Informativa

## Contexto e Objetivo

O projeto de Painel de Opções necessita de uma página inicial (landing-page) que sirva como ponto de entrada para usuários, fornecendo informações educacionais sobre opções financeiras (CALL, PUT, racionais e cenários) e sobre rolagem de posições. A landing-page deve conter um menu navegável que permita acesso à carteira (em desenvolvimento) e ao painel de busca de rolagens existente.

**Objetivo**: Criar uma landing-page profissional e informativa que eduque usuários sobre conceitos de opções e rolagem, com navegação integrada ao painel existente.

## Requisitos Funcionais

1. **[RF01]** - Exibir seção informativa sobre Opções (CALL e PUT)
   - Descrever o que é uma opção CALL (direito de compra)
   - Descrever o que é uma opção PUT (direito de venda)
   - Explicar racionais (moneyness: ITM, ATM, OTM)
   - Apresentar cenários de uso prático

2. **[RF02]** - Exibir seção informativa sobre Rolagem
   - Explicar o conceito de rolagem de posições
   - Descrever tipos de rolagem (vertical, horizontal, diagonal)
   - Apresentar benefícios e riscos

3. **[RF03]** - Implementar menu de navegação no header
   - Link "Home" (landing-page)
   - Link "Busca de Rolagens" (redireciona para painel-rolagem)
   - Link "Carteira" (redireciona para rota em desenvolvimento)

4. **[RF04]** - Integrar menu ao painel de rolagens existente
   - Adicionar menu header ao componente painel-rolagem
   - Menu deve conter link "Home" (volta para landing-page)

5. **[RF05]** - Implementar roteamento Angular
   - Rota `/` → landing-page
   - Rota `/painel-rolagem` → painel de rolagens
   - Rota `/carteira` → placeholder (em desenvolvimento)

## Requisitos Não-Funcionais

1. **[RNF01]** - Design responsivo
   - Landing-page deve funcionar em desktop (1920px), tablet (768px) e mobile (375px)
   - Menu deve ser adaptativo (hambúrguer em mobile)

2. **[RNF02]** - Acessibilidade
   - Seguir WCAG 2.1 AA
   - Contraste mínimo 4.5:1 para textos
   - Navegação por teclado funcional

3. **[RNF03]** - Performance
   - Tempo de carregamento < 2s (First Contentful Paint)
   - Lighthouse score > 80

4. **[RNF04]** - Cobertura de testes
   - Mínimo 80% de cobertura para componentes
   - Testes unitários para componentes e serviços

## Critérios de Aceite (Gherkin)

### CA-01: Landing-page renderiza com sucesso

```gherkin
Cenário: Usuário acessa a landing-page
  Dado que o usuário acessa a rota "/"
  Quando a página carrega
  Então o componente LandingPageComponent deve renderizar sem erros
  E o menu header deve estar visível no topo
  E as seções de Opções e Rolagem devem estar presentes
```

### CA-02: Seção de Opções exibe informações corretas

```gherkin
Cenário: Usuário visualiza informações sobre opções
  Dado que o usuário está na landing-page
  Quando a seção de Opções é renderizada
  Então deve exibir texto sobre CALL (direito de compra)
  E deve exibir texto sobre PUT (direito de venda)
  E deve exibir informações sobre racionais (ITM, ATM, OTM)
  E deve exibir cenários de uso prático
  E o layout deve ser responsivo em mobile, tablet e desktop
```

### CA-03: Seção de Rolagem exibe informações corretas

```gherkin
Cenário: Usuário visualiza informações sobre rolagem
  Dado que o usuário está na landing-page
  Quando a seção de Rolagem é renderizada
  Então deve exibir conceito de rolagem de posições
  E deve exibir tipos de rolagem (vertical, horizontal, diagonal)
  E deve exibir benefícios e riscos da rolagem
  E o layout deve ser responsivo em mobile, tablet e desktop
```

### CA-04: Menu de navegação funciona corretamente

```gherkin
Cenário: Usuário navega usando o menu header
  Dado que o usuário está na landing-page
  Quando clica no link "Busca de Rolagens" no menu
  Então deve navegar para a rota "/painel-rolagem"
  E o componente PainelRolagemComponent deve renderizar
  E o menu header deve estar visível no topo do painel

Cenário: Usuário retorna à home pelo menu
  Dado que o usuário está no painel de rolagens
  Quando clica no link "Home" no menu
  Então deve navegar para a rota "/"
  E o componente LandingPageComponent deve renderizar

Cenário: Usuário acessa a carteira (em desenvolvimento)
  Dado que o usuário está na landing-page
  Quando clica no link "Carteira" no menu
  Então deve navegar para a rota "/carteira"
  E deve exibir mensagem "Em desenvolvimento"
```

### CA-05: Menu é responsivo em diferentes resoluções

```gherkin
Cenário: Menu funciona em desktop
  Dado que o usuário acessa a landing-page em resolução 1920x1080
  Quando o menu é renderizado
  Então todos os links devem estar visíveis horizontalmente
  E o menu não deve ter ícone de hambúrguer

Cenário: Menu é adaptativo em mobile
  Dado que o usuário acessa a landing-page em resolução 375x667
  Quando o menu é renderizado
  Então deve exibir ícone de hambúrguer
  E ao clicar no ícone, deve abrir/fechar menu lateral
  E os links devem estar acessíveis no menu lateral
```

### CA-06: Roteamento Angular funciona corretamente

```gherkin
Cenário: Rotas estão configuradas corretamente
  Dado que a aplicação está inicializada
  Quando o usuário acessa a rota "/"
  Então deve renderizar LandingPageComponent
  
  Quando o usuário acessa a rota "/painel-rolagem"
  Então deve renderizar PainelRolagemComponent
  
  Quando o usuário acessa a rota "/carteira"
  Então deve renderizar CarteiraComponent (lazy loaded)
  
  Quando o usuário acessa uma rota inválida (ex: "/invalida")
  Então deve redirecionar para "/"
```

### CA-07: Acessibilidade atende WCAG 2.1 AA

```gherkin
Cenário: Navegação por teclado funciona
  Dado que o usuário está na landing-page
  Quando pressiona Tab
  Então o foco deve navegar por todos os links do menu
  E o foco deve ser visível em cada elemento
  E ao pressionar Enter em um link, deve navegar para a rota correspondente

Cenário: Contraste de cores está adequado
  Dado que a landing-page está renderizada
  Quando se valida o contraste de cores
  Então todos os textos devem ter contraste mínimo 4.5:1
  E o menu deve estar acessível para leitores de tela
```

### CA-08: Testes unitários passam

```gherkin
Cenário: Testes unitários são executados com sucesso
  Dado que o código foi implementado
  Quando executa o comando "npm test"
  Então todos os testes devem passar
  E a cobertura deve ser > 80% para componentes
  E não deve haver erros de lint com "ng lint"
```

### CA-09: Build produção é bem-sucedido

```gherkin
Cenário: Build produção é gerado sem erros
  Dado que o código foi implementado
  Quando executa o comando "ng build"
  Então o build deve ser concluído com sucesso
  E não deve haver erros de compilação TypeScript
  E o bundle deve ser otimizado para produção

Cenário: Docker build funciona corretamente
  Dado que o Dockerfile está configurado
  Quando executa "docker build -t painel-opcoes ."
  Então a imagem deve ser construída com sucesso
  E a aplicação deve estar acessível em http://localhost:4200
```

## Fora do Escopo

- Implementação da tela de Carteira (apenas placeholder/rota)
- Integração com APIs externas de dados de opções
- Animações complexas ou efeitos visuais avançados
- Internacionalização (i18n)
- Temas escuro/claro

## Tarefas Atômicas

1. **[TASK-01]** Criar componente landing-page
   - O que fazer: Gerar componente Angular standalone `LandingPageComponent` com template HTML e estilos SCSS
   - Arquivo(s): `src/app/components/landing-page/landing-page.component.ts`, `.html`, `.scss`, `.spec.ts`
   - Critério de Done: Componente renderiza sem erros, template vazio pronto para conteúdo

2. **[TASK-02]** Implementar seção informativa de Opções
   - O que fazer: Adicionar conteúdo HTML e estilos para explicar CALL, PUT, racionais e cenários
   - Arquivo(s): `src/app/components/landing-page/landing-page.component.html`, `.scss`
   - Critério de Done: Seção exibe textos informativos, layout responsivo, sem erros de compilação

3. **[TASK-03]** Implementar seção informativa de Rolagem
   - O que fazer: Adicionar conteúdo HTML e estilos para explicar rolagem e tipos
   - Arquivo(s): `src/app/components/landing-page/landing-page.component.html`, `.scss`
   - Critério de Done: Seção exibe textos informativos, layout responsivo, sem erros de compilação

4. **[TASK-04]** Criar componente de Menu/Header reutilizável
   - O que fazer: Gerar componente `HeaderMenuComponent` standalone com navegação
   - Arquivo(s): `src/app/components/header-menu/header-menu.component.ts`, `.html`, `.scss`, `.spec.ts`
   - Critério de Done: Menu renderiza com links funcionais, responsivo em mobile/desktop

5. **[TASK-05]** Integrar menu ao landing-page
   - O que fazer: Importar e usar `HeaderMenuComponent` em `LandingPageComponent`
   - Arquivo(s): `src/app/components/landing-page/landing-page.component.ts`
   - Critério de Done: Menu aparece no topo da landing-page, links navegam corretamente

6. **[TASK-06]** Integrar menu ao painel-rolagem
   - O que fazer: Importar e usar `HeaderMenuComponent` em `PainelRolagemComponent`
   - Arquivo(s): `src/app/components/painel-rolagem/painel-rolagem.component.ts`
   - Critério de Done: Menu aparece no topo do painel, link "Home" navega para landing-page

7. **[TASK-07]** Implementar roteamento Angular
   - O que fazer: Configurar rotas em `app.routes.ts` para landing-page, painel-rolagem e carteira
   - Arquivo(s): `src/app/app.routes.ts`, `src/app/app.component.ts`
   - Critério de Done: Rotas funcionam, `RouterOutlet` renderiza componentes corretos

8. **[TASK-08]** Criar componente placeholder de Carteira
   - O que fazer: Gerar componente `CarteiraComponent` com mensagem "Em desenvolvimento"
   - Arquivo(s): `src/app/components/carteira/carteira.component.ts`, `.html`, `.scss`, `.spec.ts`
   - Critério de Done: Componente renderiza, rota `/carteira` funciona

9. **[TASK-09]** Escrever testes unitários para landing-page
   - O que fazer: Criar testes em `landing-page.component.spec.ts` para renderização e navegação
   - Arquivo(s): `src/app/components/landing-page/landing-page.component.spec.ts`
   - Critério de Done: Testes passam, cobertura > 80%

10. **[TASK-10]** Escrever testes unitários para header-menu
    - O que fazer: Criar testes em `header-menu.component.spec.ts` para links e responsividade
    - Arquivo(s): `src/app/components/header-menu/header-menu.component.spec.ts`
    - Critério de Done: Testes passam, cobertura > 80%

11. **[TASK-11]** Validar responsividade e acessibilidade
    - O que fazer: Testar em diferentes resoluções, validar contraste, navegação por teclado
    - Arquivo(s): Nenhum (testes manuais + lighthouse)
    - Critério de Done: Layout funciona em mobile/tablet/desktop, Lighthouse > 80

12. **[TASK-12]** Validar build e testes
    - O que fazer: Executar `npm test`, `ng lint`, `ng build`, `docker build`
    - Arquivo(s): Nenhum (validação)
    - Critério de Done: Todos os comandos passam sem erros

## Riscos e Dependências

| Risco | Mitigação |
|-------|-----------|
| Componente landing-page não renderiza | Validar imports e standalone: true |
| Menu não aparece em painel-rolagem | Testar integração com PainelRolagemComponent |
| Rotas não funcionam | Verificar `RouterOutlet` em app.component.ts |
| Layout quebra em mobile | Usar media queries e testes responsivos |
| Testes falham | Usar TestBed e mocks de Router |

## Matriz de Rastreabilidade

| Requisito | Tasks | Arquivos | Testes |
|-----------|-------|----------|--------|
| RF01 (Opções) | TASK-02 | `landing-page.component.html`, `.scss` | `landing-page.component.spec.ts` |
| RF02 (Rolagem) | TASK-03 | `landing-page.component.html`, `.scss` | `landing-page.component.spec.ts` |
| RF03 (Menu) | TASK-04, TASK-05 | `header-menu.component.ts`, `.html`, `.scss` | `header-menu.component.spec.ts` |
| RF04 (Integração) | TASK-06 | `painel-rolagem.component.ts` | `painel-rolagem.component.spec.ts` |
| RF05 (Roteamento) | TASK-07, TASK-08 | `app.routes.ts`, `app.component.ts` | Testes de integração |
| RNF01 (Responsivo) | TASK-02, TASK-03, TASK-04, TASK-11 | Componentes | `landing-page.component.spec.ts`, `header-menu.component.spec.ts` |
| RNF02 (Acessibilidade) | TASK-02, TASK-03, TASK-04, TASK-11 | Componentes | Testes manuais |
| RNF03 (Performance) | TASK-11 | Nenhum | Lighthouse |
| RNF04 (Testes) | TASK-09, TASK-10, TASK-12 | `.spec.ts` | `npm test` |

## Complexidade: Média

## Próximo: Fase 2 - Design Técnico (Tech Lead TS)
