# ADR-005: Migrar de Constructor Injection para inject()

## Contexto
O projeto Painel de Opções atualmente utiliza constructor injection em serviços e componentes (ex: `RolagemApiService`, `PainelRolagemComponent`, `HeaderMenuComponent`). No entanto, o `AGENTS.md` define explicitamente que o projeto deve usar `inject()` (Angular 17+) em vez de constructor injection.

## Decisão
Migrar todo o código existente e novo de constructor injection para `inject()` function do Angular.

## Consequências
**Positivas:**
- Alinhamento com as convenções do projeto definidas no AGENTS.md
- Sintaxe mais concisa e moderna
- Melhor suporte a tree-shaking
- Padrão recomendado pelo Angular Team para Angular 17+
- Declaração de dependências como `private readonly` garante imutabilidade

**Negativas:**
- Refatoração necessária em código existente (RolagemApiService, PainelRolagemComponent, HeaderMenuComponent)
- Curva de aprendizado para desenvolvedores acostumados com constructor injection

## Alternativas Consideradas
1. **Manter constructor injection** - Rejeitado por violar convenções do AGENTS.md
2. **Misturar ambos os padrões** - Rejeitado por inconsistência e confusão

## Implementação
- Substituir `constructor(private http: HttpClient)` por `private readonly http = inject(HttpClient)`
- Aplicar a todos os serviços existentes e novos
- Aplicar a todos os componentes existentes e novos
- Incluir tasks de refatoração no backlog técnico

## Status
**Aceito** - 2026-06-04