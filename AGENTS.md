# Painel de Opcoes — AGENTS.md

Instrucoes e convencoes do projeto para agentes de IA.
Este arquivo define **como o desenvolvimento e orquestrado** e **quais padroes seguir**.

> **Stack**: TypeScript 5.x, Angular 17+, RxJS 7+, Jest, Cypress, Docker
> **Idioma**: Portugues (BR) para codigo, commits, PRs e documentacao

---

## Quick Start

O caminho mais curto para implementar qualquer feature:

1. **Classifique** a complexidade (veja tabela abaixo) e defina `featureName` em kebab-case
2. **Crie** `docs/{featureName}/workflow-{featureName}.md` com estado inicial
3. **Fase 1** — Invocar PM Analyst TS → aguardar aprovacao do usuario
4. **Fase 2** — Invocar Tech Lead TS → aguardar aprovacao do usuario
5. **Fase 3** — Invocar Senior Dev TS (implementacao automatica)
6. **Fase 4** — Invocar QA Engineer TS (review automatica)
7. **Pronto** — Workflow em DONE, branch pronta para merge

> Prompts detalhados para cada fase: `docs/references/prompts-por-fase.md`

---

## Classificacao de Complexidade

### Features

| Complexidade | Criterios | Documentacao |
|-------------|-----------|-------------|
| **Pequena** | 1-2 arquivos, < 80 linhas, sem novas dependencias | `docs/specs/{feature}.md` |
| **Media** | 3-5 arquivos, < 200 linhas, pode ter novas deps | `docs/{feature}/spec.md` + `docs/{feature}/sdd.md` |
| **Grande** | 6+ arquivos, > 200 linhas, multiplos componentes | `docs/{feature}/spec.md` + `docs/{feature}/sdd.md` + ADRs |

### Bugs

| Complexidade | Criterios | Exemplo |
|-------------|-----------|---------|
| **Simples** | 1 arquivo, < 50 linhas, sem impacto em outros componentes | Corrigir validacao de formulario |
| **Medio** | 2-3 arquivos, < 100 linhas, impacto limitado | Corrigir tratamento de erro em service |
| **Complexo** | 4+ arquivos, > 100 linhas, impacto em multiplos componentes | Refatorar state management |

---

## Compatibilidade Devin ↔ OpenCode

A fonte canonica dos agentes e skills vive em **`.devin/`** (formato Devin).
Para usar o mesmo setup no **OpenCode**, rode o gerador:

```bash
npm run sync:agents
```

Isso cria/regenera:

- `.opencode/agent/*.md` — agentes (4: `feature-workflow-ts`, `bug-workflow-ts`, `qa-engineer-ts`, `senior-dev-ts`)
- `.opencode/skill/<name>/SKILL.md` — skills (5: `pm-analyst-ts`, `tech-lead-ts`, `bug-fixer-ts`, `frontend-design`, `write-a-skill`)
- `opencode.json` — config raiz com `$schema`, `default_agent` e `skills.paths`

**Regra**: edite **apenas** `.devin/`. `.opencode/` e `opencode.json` sao gerados e ficam no `.gitignore`.

**Mapeamento Devin → OpenCode:**
| Devin | OpenCode | Notas |
|-------|----------|-------|
| `.devin/agents/<n>/AGENT.md` | `.opencode/agent/<n>.md` | `mode: all` por padrao |
| `.devin/skills/<n>/SKILL.md` | `.opencode/skill/<n>/SKILL.md` | subpastas `templates/` e `references/` sao copiadas |
| `subagent: true` em skill | `.opencode/agent/<n>.md` | `mode: subagent` (nao vira skill) |
| `Read(p)` | `permission.read` | |
| `Write(p)` | `permission.edit` | |
| `Exec(c)` | `permission.bash` | literal; adicione `*` para casar args |

---

## Convencoes do Projeto

### TypeScript e Angular

- Use `inject()` (Angular 17+), nunca constructor injection. Declare como `private readonly`
- NUNCA use `any`. Prefira `unknown`, tipos genericos, type guards
- Use `readonly` em propriedades de DTOs/models. `const` por padrao, nunca `var`
- Funcoes ≤ 20 linhas. Decomponha com `private` methods
- `ChangeDetectionStrategy.OnPush` em componentes. `trackBy` em `*ngFor`
- Toda logica de negocio em **Services**, nunca em componentes
- Toda chamada externa via **HttpClient**, nunca `fetch` ou `axios`
- Erros de API tratados com `catchError` no pipe RxJS

### Testes

- TDD pragmatico: RED (teste falha) → GREEN (minimo) → REFACTOR (idiomatico)
- Jest + `TestBed`/`ComponentFixture` para componentes
- `HttpClientTestingModule` para API services
- Cobertura > 80% em regras de negocio
- E2E com Cypress para fluxos criticos de usuario

### Commits e PRs

- 1 commit por task atomica, mensagem em portugues
- Titulo: `feat: {feature} - {resumo}` ou `fix: {feature} - {resumo}`
- PR ≤ 500 linhas de diff

### Docker

- `Dockerfile` multi-stage (Node.js 20+, Nginx para producao)
- `docker-compose.yml` com health checks e variaveis de ambiente
- `.dockerignore` excluindo `node_modules`, `.git`, `dist`, `docs`, `.spec.ts`

### Documentacao

- Specs: `docs/{feature}/spec.md` (Media/Grande) ou `docs/specs/{feature}.md` (Pequena)
- SDD por feature: `docs/{feature}/sdd.md` (criado pelo Tech Lead para features Medias/Grandes)
- ADRs: `docs/adrs/ADR-XXX-{nome}.md` (apenas para decisoes com trade-off)
- Memoria de tasks: `docs/memoria-tasks.md` (append-only, global)

---

## Orquestracao do Fluxo de Desenvolvimento

O desenvolvimento de features segue um fluxo de 5 fases, orquestrado automaticamente.
Cada fase delega trabalho a um **subagente especializado** via `run_subagent`.

```
[RECEBIDA] → [PLANEJAMENTO] → [DESIGN] → [IMPLEMENTACAO] → [REVIEW] → [DONE]
                 PM              Tech        Dev              QA
```

| Fase | Subagente | Entregas | Aprovacao |
|------|-----------|----------|-----------|
| 1. Planejamento | PM Analyst TS | `docs/{feature}/spec.md` | Obrigatoria |
| 2. Design Tecnico | Tech Lead TS | ADRs, `docs/{feature}/sdd.md` | Obrigatoria |
| 3. Implementacao | Senior Dev TS | Codigo `.ts`, testes, Docker | Automatica |
| 4. Code Review | QA Engineer TS | PR revisada, CI verde | Automatica |
| 5. Merge | — | Branch mergeada | Manual (usuario) |

---

## Orquestracao do Fluxo de Correcao de Bugs

A correcao de bugs segue um fluxo de 3 fases, orquestrado automaticamente pelo `bug-workflow-ts`.
Cada fase delega trabalho a um **subagente especializado** via `run_subagent`.

```
[RECEBIDA] → [ANALISE] → [IMPLEMENTACAO] → [REVIEW] → [DONE]
               Bug Fixer     Bug Fixer        QA
```

| Fase | Subagente | Entregas | Aprovacao |
|------|-----------|----------|-----------|
| 1. Analise | Bug Fixer TS | Causa raiz identificada, plano de correcao | Obrigatoria |
| 2. Implementacao | Bug Fixer TS | Codigo corrigido, testes atualizados | Automatica |
| 3. Review | QA Engineer TS | PR revisada, CI verde | Automatica |

---

## Modos de Operacao

### Modo A: Nova feature (continuo — padrao)

```
Usuario: "Preciso criar notificacao por email"
```

1. Se a demanda estiver vaga: **PARE e pergunte** (ate 10 perguntas). So prossiga com escopo claro
2. Classifique a complexidade e defina `featureName` em kebab-case
3. Crie `docs/{featureName}/workflow-{featureName}.md` com estado inicial
4. **Fase 1** — Invocar PM Analyst TS
5. Apos conclusao: **LER** `docs/{featureName}/spec.md`, **APRESENTAR** resumo ao usuario, **AGUARDAR** aprovacao
6. **Fase 2** — Invocar Tech Lead TS
7. Apos conclusao: **LER** ADRs e `docs/{featureName}/sdd.md`, **APRESENTAR** resumo, **AGUARDAR** aprovacao
8. **Fase 3** — Invocar Senior Dev TS (uma task por vez)
9. **Fase 4** — Invocar QA Engineer TS
10. **Finalizar** — Workflow em DONE

> Fases 1 e 2 SEMPRE exigem aprovacao explicita do usuario (SIM/NAO/REVISAR).
> Se rejeitado, reinvocar o subagente com o feedback.

### Modo B: Continuar workflow

```
Usuario: "Continuar: email-notification"
```

1. Leia `docs/{featureName}/workflow-{featureName}.md`
2. Identifique a fase atual e invoque o subagente correspondente
3. Continue o fluxo automaticamente

### Modo C: Verificar status

```
Usuario: "Status: email-notification"
```

1. Leia o arquivo de workflow
2. Liste fases e estados, identifique bloqueios
3. Sugira proxima acao

### Modo D: Interativo

```
Usuario: "Preciso criar notificacao. Modo: interativo"
```

Igual ao modo continuo, mas pausa apos **cada fase** para confirmacao do usuario.

---

## Como Orquestrar Subagentes

1. **Preparar**: leia `docs/{featureName}/workflow-{featureName}.md`, spec e SDD se existirem
2. **Invocar**: `run_subagent` com `profile: "subagent_general"` e prompt da fase (veja `docs/references/prompts-por-fase.md`)
3. **Verificar**: confira entregas com `glob`/`read`. Se faltar algo critico, reinvoque (max 2x). Fases 1 e 2: apresente resumo e aguarde aprovacao
4. **Avancar**: atualize o workflow (fase atual = CONCLUIDO, proxima = EM_ANDAMENTO)

---

## Arquivo de Workflow — Feature (Template)

`docs/{featureName}/workflow-{featureName}.md`:

```markdown
# Workflow: {featureName}

## Status Geral
- **Fase Atual**: [PLANEJAMENTO | DESIGN | IMPLEMENTACAO | REVIEW | DONE]
- **Complexidade**: [Pequena | Media | Grande]
- **Modo**: [CONTINUO | INTERATIVO]
- **Inicio**: YYYY-MM-DD

## Fases

### 1. Planejamento (PM Analyst TS)
- **Status**: [PENDENTE | EM_ANDAMENTO | CONCLUIDO | BLOQUEADO]
- **Entregas**: `docs/{featureName}/spec.md`, `docs/memoria-tasks.md`
- **Observacoes**:

### 2. Design (Tech Lead TS)
- **Status**: [PENDENTE | EM_ANDAMENTO | CONCLUIDO | BLOQUEADO]
- **Entregas**: ADRs (se houver), `docs/{featureName}/sdd.md`
- **Observacoes**:

### 3. Implementacao (Senior Dev TS)
- **Status**: [PENDENTE | EM_ANDAMENTO | CONCLUIDO | BLOQUEADO]
- **Entregas**: Tasks concluidas, Docker atualizado
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

## Arquivo de Workflow — Bug (Template)

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

## Principio da Duvida (OBRIGATORIO)

**Sempre que houver duvida ou ambiguidade, PARE e pergunte.** Nunca assuma, nunca invente, nunca adivinhe.

- Demanda do usuario vaga ou incompleta? Pergunte antes de classificar complexidade
- Spec com requisitos conflitantes ou omissos? Pergunte antes de avancar para Design
- Decisao tecnica com trade-off incerto? Pergunte antes de criar ADR
- Codigo com comportamento ambiguo? Pergunte antes de implementar
- PR com mudancas nao documentadas? Pergunte antes de aprovar

> Apresente ate 10 perguntas por vez, com opcoes de multipla escolha quando possivel.

---

## O QUE NUNCA FAZER

- NUNCA avance de fase sem verificar entregas da fase anterior
- NUNCA pule a aprovacao do usuario nas Fases 1 e 2
- NUNCA reinvoque o mesmo subagente mais de 2 vezes para a mesma correcao
- NUNCA execute `git push` sem confirmacao do usuario
- NUNCA assuma ou adivinhe — em caso de duvida, pergunte
- NUNCA crie `docs/codebase-negocio.md` ou `docs/codebase-tecnologia.md`
- NUNCA crie `docs/sdd.md` (global) — crie `docs/{feature}/sdd.md` (especifico da feature)
- NUNCA use constructor injection (sempre `inject()`)
- NUNCA use `npm test` (sempre `ng test`)
- NUNCA permita `any` sem justificativa documentada
- NUNCA julgue que uma feature e "simples demais" para pular o fluxo orquestrado — toda feature, independente do tamanho, DEVE passar por Planejamento → Design → Implementacao → Review. O fluxo existe para garantir qualidade e rastreabilidade, nao para ser contornado por julgamento subjetivo de complexidade.