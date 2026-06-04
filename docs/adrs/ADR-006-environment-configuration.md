# ADR-006: Configurar Environment Variables para API Base URL

## Contexto
Atualmente, a URL base da API está hardcoded no `RolagemApiService` (`http://localhost:8080/api`). Isso cria problemas:
- Dificuldade para configurar diferentes ambientes (dev, staging, prod)
- Necessidade de alterar código para mudar a URL da API
- Violação do princípio de separação de configuração de código

## Decisão
Implementar environment configuration do Angular para gerenciar a URL base da API, permitindo diferentes configurações por ambiente.

## Consequências
**Positivas:**
- Configuração separada do código fonte
- Suporte nativo a múltiplos ambientes (dev, staging, prod)
- Build automático substitui variáveis de ambiente
- Segurança: não expor URLs de produção no código fonte
- Facilita deploy em diferentes infraestruturas

**Negativas:**
- Adiciona complexidade inicial (criar arquivos de environment)
- Necessidade de rebuild para trocar de ambiente

## Alternativas Consideradas
1. **Manter hardcoded** - Rejeitado por inflexibilidade e más práticas
2. **Usar window.location** - Rejeitado por não ser type-safe e difícil de testar
3. **Usar variáveis de ambiente do Node** - Rejeitado por não funcionar no browser

## Implementação
- Criar `src/environments/environment.ts` (desenvolvimento)
- Criar `src/environments/environment.prod.ts` (produção)
- Configurar `angular.json` para substituição de arquivos no build
- Criar serviço de configuração ou usar diretamente nos services
- Adicionar task para implementar esta configuração

## Exemplo de Estrutura
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.painelopcoes.com/api'
};
```

## Status
**Aceito** - 2026-06-04