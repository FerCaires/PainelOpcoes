# Integração Frontend Design — Atualização de Agentes

## 📋 Resumo das Mudanças

Todos os agentes (PM, Tech Lead, Senior Dev e QA Engineer) foram atualizados para **sempre usar a skill `frontend-design`** quando necessário. Isso garante qualidade visual excepcional em todas as features que envolvam UI/styling.

---

## 🔄 Mudanças por Agente

### 1. **Senior Dev TS** (`senior-dev-ts/SKILL.md`)
**Adição**: Seção 6.6 — Integração com Frontend Design

**O que foi adicionado:**
- Instrução obrigatória para invocar `frontend-design` quando a feature envolver:
  - Novos componentes visuais
  - Redesign de páginas
  - Melhorias estéticas significativas
  - Criação de design system
  - Animações e micro-interações

**Regra crítica:**
```
NUNCA implemente UI/styling sozinho. Chame o `frontend-design` para garantir qualidade visual excepcional.
```

---

### 2. **Tech Lead TS** (`tech-lead-ts/SKILL.md`)
**Adição**: Seção antes de "README — Instruções de Execução Local"

**O que foi adicionado:**
- Responsabilidade do Tech Lead em consultar `frontend-design` para decisões de UI/UX
- Documentação de decisões de design system em ADRs
- Invocação da skill para:
  - Design system novo ou atualização
  - Padrões visuais complexos
  - Integração com bibliotecas de UI
  - Decisões de tema/branding

**Regra crítica:**
```
SEMPRE consulte o `frontend-design` para garantir qualidade visual excepcional.
```

---

### 3. **PM Analyst TS** (`pm-analyst-ts/SKILL.md`)
**Adição**: Seção 2.1.5 — Integração com Frontend Design

**O que foi adicionado:**
- Obrigação de documentar expectativas visuais na spec
- Indicação que `frontend-design` será invocado durante implementação
- Adição de task de design quando necessário

**Regra crítica:**
```
SEMPRE mencione na spec que `frontend-design` será utilizado para garantir qualidade visual excepcional.
```

---

### 4. **QA Engineer TS** (`qa-engineer-ts/SKILL.md`)
**Adição**: Seção "Design & UI" no checklist de review

**O que foi adicionado:**
- Validação de que `frontend-design` foi invocado (se aplicável)
- Checklist de qualidade visual:
  - Componentes seguem padrões de design system
  - Responsividade (mobile, tablet, desktop)
  - Acessibilidade (ARIA labels, contraste, navegação por teclado)
  - Animações suaves e performáticas
  - Suporte a temas (light/dark mode)

---

## 🎯 Fluxo de Integração

```
PM (Spec) 
  ↓
  └─→ Menciona que `frontend-design` será usado
  
Tech Lead (Design)
  ↓
  └─→ Consulta `frontend-design` para decisões visuais
  
Senior Dev (Implementação)
  ↓
  └─→ Invoca `skill({ name: "frontend-design" })` para UI/styling
  
QA Engineer (Review)
  ↓
  └─→ Valida que `frontend-design` foi utilizado
  └─→ Verifica qualidade visual no checklist
```

---

## ✅ Checklist de Implementação

- [x] Senior Dev TS atualizado com seção 6.6
- [x] Tech Lead TS atualizado com seção de integração
- [x] PM Analyst TS atualizado com seção 2.1.5
- [x] QA Engineer TS atualizado com checklist de Design & UI
- [x] Documentação de integração criada

---

## 🚀 Próximos Passos

1. **Comunicar aos times**: Informar que todos os agentes agora integram `frontend-design`
2. **Validar em features futuras**: Garantir que `frontend-design` é invocado quando necessário
3. **Manter atualizado**: Se `frontend-design` receber atualizações, atualizar referências nos agentes

---

## 📝 Notas

- A integração é **obrigatória** para features com UI/styling
- Cada agente tem responsabilidades claras na integração
- O fluxo garante qualidade visual em todas as etapas do desenvolvimento
- Nenhuma mudança quebra compatibilidade com workflows existentes

