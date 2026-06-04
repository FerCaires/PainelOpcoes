# ADR-007: Padronização do campo `nomeOpcao` no model `OpcaoCarteira`

## Contexto
O model `OpcaoCarteira` em `src/app/models/opcao-carteira.model.ts` declara atualmente o identificador legível da opção como `nome: string` (ex.: `BBASG223`). No entanto:

- O response documentado do `PUT /api/carteiras/{carteiraId}/opcoes/{nomeOpcao}` (spec `atualizar-situacao-opcao`) já usa `nomeOpcao`.
- O template do `AdicionarOpcaoComponent` (linha 59 do `.html`) já referencia `opcao.nomeOpcao` na célula da coluna "Nome" — divergindo do model atual.
- O endpoint `POST /api/carteiras/{carteiraId}/opcoes/{nomeOpcao}` (existente em `CarteiraApiService.adicionarOpcao`) também já trata o identificador como `nomeOpcao`.

Existe uma **inconsistência de contrato** entre o `GET /api/carteiras/{id}/opcoes` (cujo payload atual pode estar retornando `nome`) e os demais endpoints (que usam `nomeOpcao` na URL e no payload). Esta padronização é requisito explícito da feature (decisão #1 do usuário na Fase 1) e tem **trade-off significativo** porque:

- A renomeação de `nome` para `nomeOpcao` no model afeta **todos** os pontos de uso do `OpcaoCarteira` (component, service, specs, mocks).
- A **real forma do payload do GET** ainda não foi confirmada com o backend: pode estar retornando `nome` (legado) ou `nomeOpcao` (canônico). Se legado, exigirá mapping na borda HTTP para evitar `undefined` em runtime e quebra de feature.
- A migração de `situacao: string` para `SituacaoOpcao` (enum) precisa ser coordenada com a spec (decisão #4).

## Decisão
1. **Renomear** o campo `nome` para `nomeOpcao` em `OpcaoCarteira`, mantendo `readonly` e `string`. Padroniza o model com o contrato do PUT e com a URL do POST já existente.
2. **Estratégia de mapping**: aplicar `pipe(map(...))` **no método `listarOpcoesCarteira`** do `CarteiraApiService` para normalizar a resposta — se a entrada vier com `nome` e sem `nomeOpcao`, copiar `nomeOpcao = entrada.nome`. A normalização fica isolada na borda HTTP; o restante do código consome o model canônico.
3. **Mapping por item** (cada opção retornada) usando tipo de entrada `Record<string, unknown>` e um type guard `typeof raw['nomeOpcao'] === 'string' || typeof raw['nome'] === 'string'`. **Sem `any`**. O tipo de saída permanece `OpcaoCarteira` com `nomeOpcao: string` e `situacao: SituacaoOpcao` (cast validado contra os valores do enum).
4. **Migrar `situacao: string` -> `SituacaoOpcao`** em `OpcaoCarteira` (decisão #4). Cast controlado no mapping do service (`raw.situacao as SituacaoOpcao`) com a garantia de que o backend só envia os 4 valores documentados.
5. **Não usar HTTP Interceptor global** para renomear campos: o escopo é um único campo em um único endpoint; um interceptor seria exagero, afetaria todas as respostas e obscureceria a transformação.
6. **Não usar `HttpParams`**: `HttpParams` serve para query strings, não para transformação de payload.

## Consequências
**Positivas:**
- Model consistente com a decisão do usuário, com o contrato documentado do PUT e com a URL canônica do POST.
- Mapping isolado em um único ponto (borda HTTP do `listarOpcoesCarteira`), evitando espalhar lógica de adaptação pelo código.
- Type safety preservado: entrada tipada estritamente, saída como `OpcaoCarteira` (sem `any`).
- Se o backend passar a devolver `nomeOpcao` nativamente no GET no futuro, basta remover o `pipe(map)` sem impacto no resto do código.

**Negativas:**
- Adiciona uma transformação no service que precisa ser testada explicitamente (mapping `nome` -> `nomeOpcao`, cast de `situacao` para enum).
- Requer atualizar todos os mocks em `*.spec.ts` (`adicionar-opcao.component.spec.ts`, `carteira-api.service.spec.ts`) e a referência `opcao.nome` em `trackByNome` do `AdicionarOpcaoComponent`.
- Acopla o service ao conhecimento do contrato legado; precisa de comentário no código explicando o "porquê" do mapping.

## Alternativas Consideradas
1. **Manter `nome` no model e adaptar o template/consumidores para `nomeOpcao`** — Rejeitado: mantém inconsistência, exige que cada ponto de uso conheça o "apelido" do campo, e diverge da URL canônica.
2. **HTTP Interceptor global** renomeando `nome` -> `nomeOpcao` em todas as respostas — Rejeitado: exagero de escopo (afeta todas as respostas JSON), difícil de testar isoladamente, esconde a transformação, viola o princípio de menor privilégio.
3. **Não fazer mapping e quebrar em runtime se o backend devolver `nome`** — Rejeitado: viola o RNF04 (sem `any`), degrada UX silenciosamente e fere a decisão #1 do usuário.
4. **Bloquear a feature até confirmar contrato canônico com o backend** — Rejeitado: a decisão do usuário já padroniza para `nomeOpcao`; o mapping cobre o caso legado sem bloquear a Fase 3, e a remoção do mapping pode ser feita em PR futuro quando o backend confirmar.
5. **Aceitar ambas as formas no model** (`nome?: string; nomeOpcao?: string`) — Rejeitado: union types opcionais vazam incerteza para todo o código consumidor e exigem fallback em cada ponto de uso.

## Implementação
- **TASK-01** (refinada): criar `situacao-opcao.enum.ts` + migrar `OpcaoCarteira` (`nome` -> `nomeOpcao`, `situacao: string` -> `SituacaoOpcao`).
- **TASK-02** (refinada): adicionar `atualizarSituacaoOpcao` no service + `pipe(map(...))` em `listarOpcoesCarteira` para retrocompatibilidade do `nome` (e cast controlado de `situacao`).
- **TASK-03** (refinada): atualizar mocks do `carteira-api.service.spec.ts` para `nomeOpcao` e `SituacaoOpcao.ABERTA`; cobrir o novo `atualizarSituacaoOpcao` e o mapping retrocompat.
- **TASK-04** (refinada): atualizar `trackByNome` no `AdicionarOpcaoComponent` para retornar `opcao.nomeOpcao`; implementar UI de edição em massa.
- **TASK-05** (refinada): atualizar mocks do `adicionar-opcao.component.spec.ts`; cobrir o novo fluxo de atualização em massa.

## Status
**Aceito** — 2026-06-04
