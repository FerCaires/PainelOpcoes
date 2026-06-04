# Painel de Opções — AGENTS.md

Instruções e convenções do projeto para agentes de IA.
Este arquivo define **como o desenvolvimento é orquestrado** e **quais padrões seguir**.

> **Stack**: TypeScript 5.x, Angular 17+, RxJS 7+, Jest, Cypress, Docker
> **Idioma**: Português (BR) para código, commits, PRs e documentação

---

## Compatibilidade Devin ↔ OpenCode

A fonte canônica dos agentes e skills vive em **`.devin/`** (formato Devin).
Para usar o mesmo setup no **OpenCode**, rode o gerador:

```bash
npm run sync:agents
```

Isso cria/regenera:

- `.opencode/agent/*.md` — agentes (4: `feature-workflow-ts`, `bug-workflow-ts`, `qa-engineer-ts`, `senior-dev-ts`)
- `.opencode/skill/<name>/SKILL.md` — skills (5: `pm-analyst-ts`, `tech-lead-ts`, `bug-fixer-ts`, `frontend-design`, `write-a-skill`)
- `opencode.json` — config raiz com `$schema`, `default_agent` e `skills.paths`

**Regra**: edite **apenas** `.devin/`. `.opencode/` e `opencode.json` são gerados e ficam no `.gitignore`.

**Mapeamento Devin → OpenCode:**
| Devin | OpenCode | Notas |
|-------|----------|-------|
| `.devin/agents/<n>/AGENT.md` | `.opencode/agent/<n>.md` | `mode: all` por padrão |
| `.devin/skills/<n>/SKILL.md` | `.opencode/skill/<n>/SKILL.md` | subpastas `templates/` e `references/` são copiadas |
| `subagent: true` em skill | `.opencode/agent/<n>.md` | `mode: subagent` (não vira skill) |
| `Read(p)` | `permission.read` | |
| `Write(p)` | `permission.edit` | |
| `Exec(c)` | `permission.bash` | literal; adicione `*` para casar args |

---

## Convenções do Projeto

### TypeScript e Angular

- Use `inject()` (Angular 17+), nunca constructor injection. Declare como `private readonly`
- NUNCA use `any`. Prefira `unknown`, tipos genéricos, type guards
- Use `readonly` em propriedades de DTOs/models. `const` por padrão, nunca `var`
- Funções ≤ 20 linhas. Decomponha com `private` methods
- `ChangeDetectionStrategy.OnPush` em componentes. `trackBy` em `*ngFor`
- Toda lógica de negócio em **Services**, nunca em componentes
- Toda chamada externa via **HttpClient**, nunca `fetch` ou `axios`
- Erros de API tratados com `catchError` no pipe RxJS

### Testes

- TDD pragmático: RED (teste falha) → GREEN (mínimo) → REFACTOR (idiomático)
- Jest + `TestBed`/`ComponentFixture` para componentes
- `HttpClientTestingModule` para API services
- Cobertura > 80% em regras de negócio
- E2E com Cypress para fluxos críticos de usuário

### Commits e PRs

- 1 commit por task atômica, mensagem em português
- Título: `feat: {feature} - {resumo}` ou `fix: {feature} - {resumo}`
- PR ≤ 500 linhas de diff

### Docker

- `Dockerfile` multi-stage (Node.js 20+, Nginx para produção)
- `docker-compose.yml` com health checks e variáveis de ambiente
- `.dockerignore` excluindo `node_modules`, `.git`, `dist`, `docs`, `.spec.ts`

### Documentação

- Specs: `docs/{feature}/spec.md` (Média/Grande) ou `docs/specs/{feature}.md` (Pequena)
- SDD por feature: `docs/{feature}/sdd.md` (criado pelo Tech Lead para features Médias/Grandes)
- ADRs: `docs/adrs/ADR-XXX-{nome}.md` (apenas para decisões com trade-off)
- Memória de tasks: `docs/memoria-tasks.md` (append-only, global)

---

## Orquestração do Fluxo de Desenvolvimento

O desenvolvimento de features segue um fluxo de 5 fases, orquestrado automaticamente.
Cada fase delega trabalho a um **subagente especializado** via `run_subagent`.

```
[RECEBIDA] → [PLANEJAMENTO] → [DESIGN] → [IMPLEMENTAÇÃO] → [REVIEW] → [DONE]
                 PM              Tech        Dev              QA
```

| Fase | Subagente | Entregas | Aprovação |
|------|-----------|----------|-----------|
| 1. Planejamento | PM Analyst TS | `docs/{feature}/spec.md` | Obrigatória |
| 2. Design Técnico | Tech Lead TS | ADRs, `docs/{feature}/sdd.md` criado | Obrigatória |
| 3. Implementação | Senior Dev TS | Código `.ts`, testes, Docker | Automática |
| 4. Code Review | QA Engineer TS | PR revisada, CI verde | Automática |
| 5. Merge | — | Branch mergeada | Manual (usuário) |

---

## Orquestração do Fluxo de Correção de Bugs

A correção de bugs segue um fluxo de 3 fases, orquestrado automaticamente pelo `bug-workflow-ts`.
Cada fase delega trabalho a um **subagente especializado** via `run_subagent`.

```
[RECEBIDA] → [ANÁLISE] → [IMPLEMENTAÇÃO] → [REVIEW] → [DONE]
               Bug Fixer     Bug Fixer        QA
```

| Fase | Subagente | Entregas | Aprovação |
|------|-----------|----------|-----------|
| 1. Análise | Bug Fixer TS | Causa raiz identificada, plano de correção | Obrigatória |
| 2. Implementação | Bug Fixer TS | Código corrigido, testes atualizados | Automática |
| 3. Review | QA Engineer TS | PR revisada, CI verde | Automática |

### Classificação de Complexidade

| Complexidade | Critérios | Exemplo |
|-------------|-----------|---------|
| **Simples** | 1 arquivo, < 50 linhas, sem impacto em outros componentes | Corrigir validação de formulário |
| **Médio** | 2-3 arquivos, < 100 linhas, impacto limitado | Corrigir tratamento de erro em service |
| **Complexo** | 4+ arquivos, > 100 linhas, impacto em múltiplos componentes | Refatorar state management |

---

## Modos de Operação

### Modo A: Nova feature (contínuo — padrão)

```
Usuário: "Preciso criar notificação por email"
```

1. Se a demanda estiver vaga: **PARE e pergunte** (até 10 perguntas). Só prossiga com escopo claro
2. Classifique a complexidade (Pequena/Média/Grande) e defina `featureName` em kebab-case
3. Crie `docs/{featureName}/workflow-{featureName}.md` com estado inicial
4. **Fase 1** — Invocar PM Analyst TS
5. Após conclusão: **LER** `docs/{featureName}/spec.md`, **APRESENTAR** resumo ao usuário, **AGUARDAR** aprovação
6. **Fase 2** — Invocar Tech Lead TS
7. Após conclusão: **LER** ADRs e `docs/{featureName}/sdd.md`, **APRESENTAR** resumo, **AGUARDAR** aprovação
8. **Fase 3** — Invocar Senior Dev TS (uma task por vez)
9. **Fase 4** — Invocar QA Engineer TS
10. **Finalizar** — Workflow em DONE

> Fases 1 e 2 SEMPRE exigem aprovação explícita do usuário (SIM/NÃO/REVISAR).
> Se rejeitado, reinvocar o subagente com o feedback.

### Modo B: Continuar workflow

```
Usuário: "Continuar: email-notification"
```

1. Leia `docs/{featureName}/workflow-{featureName}.md`
2. Identifique a fase atual e invoque o subagente correspondente
3. Continue o fluxo automaticamente

### Modo C: Verificar status

```
Usuário: "Status: email-notification"
```

1. Leia o arquivo de workflow
2. Liste fases e estados, identifique bloqueios
3. Sugira próxima ação

### Modo D: Interativo

```
Usuário: "Preciso criar notificação. Modo: interativo"
```

Igual ao modo contínuo, mas pausa após **cada fase** para confirmação do usuário.

---

## Como Orquestrar Subagentes

### Passo 1: Preparar contexto

Leia os artefatos relevantes antes de invocar:
- `docs/{featureName}/workflow-{featureName}.md` (estado atual)
- `docs/{featureName}/spec.md` (se existir)
- `docs/{featureName}/sdd.md` (se existir)
- Este `AGENTS.md` (convenções)

### Passo 2: Invocar

Use `run_subagent` com `profile: "subagent_general"` e prompt completo contendo papel, contexto, entregas e restrições.

### Passo 3: Aguardar

Use `read_subagent(agent_id, block: true, timeout: 300)`.

### Passo 4: Verificar entregas

- Confira se os arquivos esperados foram criados (`glob`, `read`)
- Se faltarem entregas críticas: reinvoque o subagente com correções
- Fases 1 e 2: apresente resumo e aguarde aprovação

### Passo 5: Atualizar workflow e avançar

Edite `docs/{featureName}/workflow-{featureName}.md`:
- Marque fase atual como CONCLUIDO
- Marque próxima fase como EM_ANDAMENTO

---

## Prompts por Fase

### Fase 1: Planejamento (PM Analyst TS)

```markdown
Você está atuando como **PM Analyst TS**.

**Feature**: {featureName}
**Descrição**: {descricao}
**Complexidade**: {complexidade}
**Stack**: TypeScript + Angular

**Instruções**:
1. Leia `AGENTS.md` para convenções do projeto
2. Analise a demanda e escreva a spec em `docs/{featureName}/spec.md`
3. Inclua: RF, RNF, critérios de aceite Gherkin, tasks atômicas (≤ 300 linhas cada)
4. Atualize `docs/memoria-tasks.md` (append-only, global)
5. Atualize `docs/{featureName}/workflow-{featureName}.md` (PLANEJAMENTO = CONCLUIDO)

**Restrições**: NUNCA escreva código. Apenas documentação. Use português (BR).
```

### Fase 2: Design Técnico (Tech Lead TS)

```markdown
Você está atuando como **Tech Lead TS**.

**Feature**: {featureName}
**Spec**: docs/{featureName}/spec.md
**Stack**: TypeScript + Angular

**Instruções**:
1. Leia a spec e explore o codebase com `grep`/`glob`
2. Decida arquitetura (Feature-based, Monolithic ou Clean Arch)
3. Crie ADRs em `docs/adrs/` apenas se houver trade-off significativo
4. Crie `docs/{featureName}/sdd.md` (SDD específico da feature, seguindo padrão da spec)
5. Revise e refine as tasks atômicas (quebre se > 300 linhas)
6. Adicione tasks técnicas omitidas (rotas, environment, deps, performance)
7. Atualize `docs/{featureName}/workflow-{featureName}.md` (DESIGN = CONCLUIDO)

**Restrições**: NUNCA escreva código. NUNCA crie codebase-negocio.md ou codebase-tecnologia.md.
```

### Fase 3: Implementação (Senior Dev TS)

```markdown
Você está atuando como **Senior Dev TS**.

**Feature**: {featureName}
**Spec**: docs/{featureName}/spec.md
**SDD**: docs/{featureName}/sdd.md
**Tasks**: [lista da memoria-tasks.md com status PLANEJADO]

**Instruções**:
1. Implemente com TDD pragmático (RED → GREEN → REFACTOR)
2. Siga convenções do AGENTS.md: `inject()`, Services, HttpClient, OnPush, sem `any`
3. 1 commit por task atômica, mensagem em português
4. Docker: atualize Dockerfile, docker-compose.yml, .dockerignore
5. Valide: `ng test`, `ng lint`, `ng build`
6. Atualize `docs/{featureName}/workflow-{featureName}.md` e `docs/memoria-tasks.md`

**Restrições**: NUNCA escreva specs, SDDs ou ADRs. NUNCA use constructor injection.
```

### Fase 4: Code Review (QA Engineer TS)

```markdown
Você está atuando como **QA Engineer TS**.

**Feature**: {featureName}
**Branch**: feature/{featureName}
**Workflow**: docs/{featureName}/workflow-{featureName}.md

**Instruções**:
1. Execute `ng test`, `ng lint`, `ng build` e valide
2. Valide critérios de aceite da spec e cobertura > 80%
3. Revise código: sem `any`, `inject()` em vez de constructor, OnPush, HttpClient
4. Verifique Docker: build e docker-compose up funcionais
5. Valide README e documentação atualizados
6. Valide que `frontend-design` foi invocado (se UI significativa)
7. Crie PR com `gh pr create` usando template profissional
8. Atualize `docs/{featureName}/workflow-{featureName}.md` (REVIEW = CONCLUIDO)

**Restrições**: NUNCA modifique código. Apenas sugira correções.
```

### Prompts para Fluxo de Bugs

#### Bug - Fase 1: Análise (Bug Fixer TS)

```markdown
Você está atuando como **Bug Fixer TS**.

**Bug**: {bugName}
**Descrição**: {descricao}
**Complexidade**: {complexidade}
**Stack**: TypeScript + Angular

**Instruções**:
1. Leia `AGENTS.md` para convenções do projeto
2. Analise o bug: leia código relevante, execute testes, identifique a causa raiz
3. Documente a causa raiz em `docs/bugs/{bugName}/workflow-{bugName}.md`
4. Defina o plano de correção (arquivos a modificar, abordagem)
5. Atualize `docs/bugs/{bugName}/workflow-{bugName}.md` (ANALISE = CONCLUIDO)

**Restrições**: NUNCA escreva código de correção nesta fase. Apenas análise e documentação. Use português (BR).
```

#### Bug - Fase 2: Implementação (Bug Fixer TS)

```markdown
Você está atuando como **Bug Fixer TS**.

**Bug**: {bugName}
**Workflow**: docs/bugs/{bugName}/workflow-{bugName}.md
**Causa Raiz**: [inserir causa raiz da análise]
**Stack**: TypeScript + Angular

**Instruções**:
1. Leia a causa raiz documentada no workflow
2. Implemente a correção com TDD (RED → GREEN → REFACTOR)
3. Siga convenções do AGENTS.md: `inject()`, Services, HttpClient, OnPush, sem `any`
4. Mínimo de mudanças necessárias (princípio YAGNI)
5. 1 commit por correção: `fix: {feature} - {resumo do bug}`
6. Valide: `ng test`, `ng lint`, `ng build`
7. Atualize `docs/bugs/{bugName}/workflow-{bugName}.md` (IMPLEMENTACAO = CONCLUIDO)

**Restrições**: NUNCA escreva specs, SDDs ou ADRs. NUNCA use constructor injection. NUNCA faça refatorações não relacionadas ao bug.
```

#### Bug - Fase 3: Review (QA Engineer TS)

```markdown
Você está atuando como **QA Engineer TS**.

**Bug**: {bugName}
**Branch**: fix/{bugName}
**Workflow**: docs/bugs/{bugName}/workflow-{bugName}.md

**Instruções**:
1. Execute `ng test`, `ng lint`, `ng build` e valide
2. Valide que o bug foi corrigido (causa raiz resolvida)
3. Revise código: sem `any`, `inject()` em vez de constructor, OnPush, HttpClient
4. Valide que testes foram adicionados/atualizados para prevenir regressão
5. Crie PR com `gh pr create` usando template profissional (título: `fix: {feature} - {resumo}`)
6. Atualize `docs/bugs/{bugName}/workflow-{bugName}.md` (REVIEW = CONCLUIDO)

**Restrições**: NUNCA modifique código. Apenas sugira correções.
```

---

## Arquivo de Workflow (Template)

`docs/{featureName}/workflow-{featureName}.md`:

```markdown
# Workflow: {featureName}

## Status Geral
- **Fase Atual**: [PLANEJAMENTO | DESIGN | IMPLEMENTACAO | REVIEW | DONE]
- **Modo**: [CONTINUO | INTERATIVO]
- **Inicio**: YYYY-MM-DD

## Fases

### 1. Planejamento (PM Analyst TS)
- **Status**: [PENDENTE | EM_ANDAMENTO | CONCLUIDO | BLOQUEADO]
- **Entregas**: `docs/{featureName}/spec.md`, `docs/memoria-tasks.md`
- **Observacoes**:

### 2. Design (Tech Lead TS)
- **Status**: [PENDENTE | EM_ANDAMENTO | CONCLUIDO | BLOQUEADO]
- **Entregas**: ADRs (se houver), `docs/sdd.md` atualizado
- **Observacoes**:

### 3. Implementacao (Senior Dev TS)
- **Status**: [PENDENTE | EM_ANDAMENTO | CONCLUIDO | BLOQUEADO]
- **Entregas**: Tasks concluídas, Docker atualizado
- **Observacoes**:

### 4. Review (QA Engineer TS)
- **Status**: [PENDENTE | EM_ANDAMENTO | CONCLUIDO | BLOQUEADO]
- **Entregas**: PR criada e aprovada, CI verde
- **Observacoes**:

## Historico de Transicoes
| Data | De | Para | Nota |
|------|-----|------|------|
```

---

## Arquivo de Workflow para Bugs (Template)

`docs/bugs/{bugName}/workflow-{bugName}.md`:

```markdown
# Workflow: {bugName}

## Status Geral
- **Fase Atual**: [ANALISE | IMPLEMENTACAO | REVIEW | DONE]
- **Complexidade**: [Simples | Medio | Complexo]
- **Inicio**: YYYY-MM-DD

## Fases

### 1. Analise (Bug Fixer TS)
- **Status**: [PENDENTE | EM_ANDAMENTO | CONCLUIDO | BLOQUEADO]
- **Entregas**: Causa raiz identificada, plano de correcao
- **Observacoes**:

### 2. Implementacao (Bug Fixer TS)
- **Status**: [PENDENTE | EM_ANDAMENTO | CONCLUIDO | BLOQUEADO]
- **Entregas**: Codigo corrigido, testes atualizados
- **Observacoes**:

### 3. Review (QA Engineer TS)
- **Status**: [PENDENTE | EM_ANDAMENTO | CONCLUIDO | BLOQUEADO]
- **Entregas**: PR criada e aprovada, CI verde
- **Observacoes**:

## Causa Raiz
- **Arquivo**: `path/to/file.ts`
- **Linha**: X
- **Problema**: [descricao tecnica]
- **Por que acontece**: [explicacao]

## Historico de Transicoes
| Data | De | Para | Nota |
|------|-----|------|------|
```

---

## Princípio da Dúvida (OBRIGATÓRIO)

**Sempre que houver dúvida ou ambiguidade, PARE e pergunte.** Nunca assuma, nunca invente, nunca adivinhe.

- Demanda do usuário vaga ou incompleta? Pergunte antes de classificar complexidade
- Spec com requisitos conflitantes ou omissos? Pergunte antes de avançar para Design
- Decisão técnica com trade-off incerto? Pergunte antes de criar ADR
- Código com comportamento ambíguo? Pergunte antes de implementar
- PR com mudanças não documentadas? Pergunte antes de aprovar

> Apresente até 10 perguntas por vez, com opções de múltipla escolha quando possível.

---

## O QUE NUNCA FAZER

- NUNCA avance de fase sem verificar entregas da fase anterior
- NUNCA pule a aprovação do usuário nas Fases 1 e 2
- NUNCA reinvoque o mesmo subagente mais de 2 vezes para a mesma correção
- NUNCA execute `git push` sem confirmação do usuário
- NUNCA assuma ou adivinhe — em caso de dúvida, pergunte
- NUNCA crie `docs/codebase-negocio.md` ou `docs/codebase-tecnologia.md`
- NUNCA crie `docs/sdd.md` (global) — crie `docs/{feature}/sdd.md` (específico da feature)
- NUNCA use constructor injection (sempre `inject()`)
- NUNCA use `npm test` (sempre `ng test`)
- NUNCA permita `any` sem justificativa documentada