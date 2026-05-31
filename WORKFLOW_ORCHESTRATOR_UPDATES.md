# Atualização do Agente Feature Workflow TS

## 📋 Resumo das Mudanças

O agente `feature-workflow-ts` foi atualizado para:
1. **Solicitar aprovação do usuário** após a geração dos arquivos do PM e do Tech Lead
2. **Garantir que todos os documentos** fiquem organizados em `docs/{featureName}/`

---

## 🔄 Mudanças Principais

### 1. Aprovação Obrigatória após Fase 1 (PM Analyst)

**Antes:**
- Fase 1 concluída → Avançar automaticamente para Fase 2

**Depois:**
- Fase 1 concluída → LER `docs/{featureName}/spec.md`
- APRESENTAR ao usuário em resumo estruturado
- AGUARDAR aprovação explícita (SIM/NÃO/REVISAR)
- Se rejeitado → Reinvocar PM TS com feedback
- Se aprovado → Avançar para Fase 2

### 2. Aprovação Obrigatória após Fase 2 (Tech Lead)

**Antes:**
- Fase 2 concluída → Avançar automaticamente para Fase 3

**Depois:**
- Fase 2 concluída → LER `docs/{featureName}/sdd.md` e `docs/{featureName}/adrs/`
- APRESENTAR ao usuário em resumo estruturado
- AGUARDAR aprovação explícita (SIM/NÃO/REVISAR)
- Se rejeitado → Reinvocar Tech Lead TS com feedback
- Se aprovado → Avançar para Fase 3

### 3. Organização de Documentos em `docs/{featureName}/`

**Estrutura esperada:**

```
docs/
├── {featureName}/
│   ├── spec.md                    # Spec da feature (PM)
│   ├── sdd.md                     # Design técnico (Tech Lead)
│   ├── adrs/                      # ADRs (Tech Lead)
│   │   ├── ADR-001-{titulo}.md
│   │   └── ADR-002-{titulo}.md
│   ├── refinamento-tasks.md       # Refinamento de tasks (Tech Lead, se necessário)
│   └── workflow-{featureName}.md  # Workflow da feature
├── memoria-tasks.md               # Memória global (fora de {featureName}/)
└── codebase-*.md                  # Documentação global (fora de {featureName}/)
```

**Regras:**
- ✅ `docs/{featureName}/spec.md` — Spec da feature
- ✅ `docs/{featureName}/sdd.md` — Design técnico específico da feature
- ✅ `docs/{featureName}/adrs/` — ADRs específicos da feature
- ✅ `docs/{featureName}/refinamento-tasks.md` — Refinamento de tasks
- ✅ `docs/workflow-{featureName}.md` — Workflow (pode ficar em `docs/` raiz)
- ❌ `docs/sdd.md` — Não usar (usar `docs/{featureName}/sdd.md`)
- ❌ `docs/adrs/` — Não usar (usar `docs/{featureName}/adrs/`)

### 4. Checklist de Aprovação da Fase 1 (PM)

O orquestrador apresentará ao usuário:
- ✅ Contexto e objetivo
- ✅ Requisitos funcionais
- ✅ Critérios de aceite
- ✅ Tasks atômicas
- ✅ Riscos e dependências

Opções de resposta:
- ✅ "Aprovado" → Avançar para Fase 2
- ❌ "Rejeitado" → Reinvocar PM TS com feedback
- ❓ "Revisar" → Permitir edições e reinvocar

### 5. Checklist de Aprovação da Fase 2 (Tech Lead)

O orquestrador apresentará ao usuário:
- ✅ Decisões arquiteturais
- ✅ Padrões técnicos
- ✅ Integrações
- ✅ Trade-offs considerados
- ✅ ADRs (se houver)

Opções de resposta:
- ✅ "Aprovado" → Avançar para Fase 3
- ❌ "Rejeitado" → Reinvocar Tech Lead TS com feedback
- ❓ "Revisar" → Permitir edições e reinvocar

---

## 📝 Exemplo de Fluxo Completo

```
Usuário: "Preciso criar notificacao-por-email"
         ↓
Orquestrador: Criar workflow
         ↓
Fase 1 (PM): Gerar docs/notificacao-por-email/spec.md
         ↓
Orquestrador: LER spec.md
             APRESENTAR resumo ao usuário
             AGUARDAR aprovação
         ↓
Usuário: "Aprovado"
         ↓
Fase 2 (Tech Lead): Gerar docs/notificacao-por-email/sdd.md e adrs/
         ↓
Orquestrador: LER sdd.md e ADRs
             APRESENTAR resumo ao usuário
             AGUARDAR aprovação
         ↓
Usuário: "Aprovado"
         ↓
Fase 3 (Dev): Implementar código
         ↓
Fase 4 (QA): Review e PR
         ↓
DONE
```

---

## ✅ Checklist de Implementação

- [x] Atualizar tabela de fases com coluna "Aprovação"
- [x] Atualizar Modo A com fluxo de aprovação
- [x] Atualizar Passo 4 com checklist de aprovação
- [x] Atualizar Fase 1 (PM) com obrigação de docs em `docs/{featureName}/`
- [x] Atualizar Fase 2 (Tech Lead) com obrigação de docs em `docs/{featureName}/`
- [x] Atualizar lógica de transição automática com fluxo de aprovação
- [x] Atualizar "O QUE NUNCA FAZER" com regras de aprovação e organização
- [x] Documentação de atualização criada

---

## 🎯 Benefícios

1. **Controle do usuário**: Usuário aprova cada etapa antes de avançar
2. **Qualidade**: Documentação revisada antes de implementação
3. **Organização**: Todos os documentos em local previsível
4. **Rastreabilidade**: Fácil encontrar documentação de uma feature
5. **Iteração**: Usuário pode pedir revisões sem perder contexto

---

## 📚 Próximas Ações

1. Comunicar ao time sobre o novo fluxo
2. Testar com uma feature pequena
3. Ajustar conforme feedback do usuário
4. Documentar padrões de organização em `AGENTS.md`

