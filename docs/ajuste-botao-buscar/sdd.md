# Software Design Document (SDD): Ajuste de Tamanho do Botão "Buscar Rolagens"

## 1. Visão Geral

Este documento descreve as decisões técnicas e arquiteturais para implementar o ajuste visual do botão "Buscar Rolagens" no componente `PainelRolagemComponent`, garantindo que o botão tenha a mesma altura dos campos de formulário (`mat-form-field`).

**Feature**: ajuste-botao-buscar
**Complexidade**: Pequena
**Stack**: TypeScript + Angular + Material Design
**Escopo**: Apenas ajuste visual (SCSS) do botão

---

## 2. Análise Técnica Atual

### 2.1 Estado Atual do Componente

**Arquivo**: `src/app/components/painel-rolagem/painel-rolagem.component.scss`

**Situação Atual**:
- O botão "Buscar Rolagens" usa `mat-raised-button` do Material Design
- Altura atual: definida por `height: 100%` com `display: flex`
- Campos de formulário (`mat-form-field`): altura padrão do Material (56px em outline mode)
- **Problema**: O botão não está perfeitamente alinhado verticalmente com os campos

### 2.2 Componentes Envolvidos

| Componente | Arquivo | Responsabilidade |
|-----------|---------|------------------|
| `PainelRolagemComponent` | `painel-rolagem.component.ts` | Lógica do componente (sem alteração) |
| Template HTML | `painel-rolagem.component.html` | Estrutura (sem alteração) |
| Estilos SCSS | `painel-rolagem.component.scss` | **ALTERAÇÃO AQUI** |
| Testes Unitários | `painel-rolagem.component.spec.ts` | Validar altura do botão |

---

## 3. Decisões Arquiteturais

### 3.1 Estratégia de Alinhamento (ADR-001)

**Decisão**: Usar `display: flex` com `align-items: center` no botão e ajustar `height` para corresponder à altura do `mat-form-field`.

**Justificativa**:
- ✅ Mantém o botão responsivo (sem valores fixos em px)
- ✅ Compatível com todos os navegadores modernos
- ✅ Não quebra o layout em diferentes resoluções
- ✅ Preserva os efeitos visuais (gradiente, hover, active)

**Alternativas Consideradas**:
1. **Usar `min-height` fixo (56px)**: Menos flexível, pode quebrar em diferentes temas
2. **Usar `align-items: stretch` no grid**: Pode causar distorção do botão
3. **Usar `line-height`**: Não funciona bem com `mat-raised-button`

**Decisão Final**: Manter `height: 100%` com `display: flex` (já implementado) e validar que funciona em todas as resoluções.

---

### 3.2 Abordagem de Teste (ADR-002)

**Decisão**: Usar testes unitários com `TestBed` para validar a altura do botão via `getComputedStyle()`.

**Justificativa**:
- ✅ Testes automatizados garantem que o ajuste funciona
- ✅ Detecta regressões em futuras alterações
- ✅ Valida em diferentes resoluções (viewport)
- ✅ Compatível com CI/CD

**Abordagem**:
1. Criar teste que verifica se a altura do botão é igual à altura do campo de opção
2. Criar teste que valida o alinhamento vertical em diferentes resoluções
3. Validar que os efeitos visuais (hover, active) continuam funcionando

---

### 3.3 Validação de Responsividade (ADR-003)

**Decisão**: Testar em 3 breakpoints principais (desktop, tablet, mobile) usando `window.innerWidth`.

**Justificativa**:
- ✅ Cobre os casos de uso mais comuns
- ✅ Garante que o layout não quebra em dispositivos móveis
- ✅ Valida o comportamento do grid responsivo

**Breakpoints**:
- Desktop: 1920px (full width)
- Tablet: 768px (iPad)
- Mobile: 375px (iPhone)

---

## 4. Plano de Implementação

### 4.1 Estrutura de Arquivos

```
docs/ajuste-botao-buscar/
├── spec.md                          (já criado)
├── sdd.md                           (este arquivo)
└── adrs/
    ├── adr-001-alinhamento.md       (decisão de alinhamento)
    ├── adr-002-teste.md             (decisão de teste)
    └── adr-003-responsividade.md    (decisão de responsividade)

src/app/components/painel-rolagem/
├── painel-rolagem.component.ts      (sem alteração)
├── painel-rolagem.component.html    (sem alteração)
├── painel-rolagem.component.scss    (ALTERAÇÃO: validar height: 100%)
└── painel-rolagem.component.spec.ts (ALTERAÇÃO: adicionar testes)
```

### 4.2 Tasks Atômicas

| Task | Descrição | Arquivo | Estimativa |
|------|-----------|---------|-----------|
| TASK-01 | Ajustar altura do botão no SCSS | `painel-rolagem.component.scss` | 30 min |
| TASK-02 | Validar responsividade | `painel-rolagem.component.scss` | 20 min |
| TASK-03 | Atualizar testes unitários | `painel-rolagem.component.spec.ts` | 20 min |

---

## 5. Critérios de Aceite Técnico

- [ ] O botão tem `height: 100%` com `display: flex` e `align-items: center`
- [ ] O botão está alinhado verticalmente com os campos `mat-form-field`
- [ ] Os efeitos visuais (gradiente, hover, active) continuam funcionando
- [ ] O layout responsivo funciona em desktop, tablet e mobile
- [ ] Não há quebra de layout em diferentes resoluções
- [ ] Testes unitários passam com `npm test`
- [ ] Build produção passa com `ng build`
- [ ] Sem erros de linting com `ng lint`

---

## 6. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|--------|-----------|
| Diferentes navegadores renderizam `mat-form-field` com alturas diferentes | Média | Baixo | Testar em Chrome, Firefox, Safari, Edge; usar valores relativos |
| Layout quebra em resoluções muito pequenas (< 320px) | Baixa | Baixo | Testar em mobile (375px+); adicionar media query se necessário |
| Efeitos visuais (hover, active) são afetados | Baixa | Médio | Validar visualmente durante testes; incluir testes de hover/active |
| Conflito com outras alterações no SCSS | Muito Baixa | Baixo | Revisar PR cuidadosamente; rodar testes antes de merge |

---

## 7. Dependências

- **Nenhuma dependência externa**: Alteração isolada ao componente
- **Dependências internas**: Nenhuma
- **Dependências de terceiros**: Material Design (já presente)

---

## 8. Plano de Testes

### 8.1 Testes Unitários

```typescript
// Teste 1: Validar que o botão tem height: 100%
it('should have height: 100% on submit button', () => {
  const button = fixture.debugElement.query(By.css('button[type="submit"]'));
  const computedStyle = window.getComputedStyle(button.nativeElement);
  expect(computedStyle.height).toBeTruthy();
});

// Teste 2: Validar que o botão está alinhado com o campo de opção
it('should align button height with mat-form-field', () => {
  const button = fixture.debugElement.query(By.css('button[type="submit"]'));
  const formField = fixture.debugElement.query(By.css('mat-form-field'));
  
  const buttonHeight = button.nativeElement.offsetHeight;
  const formFieldHeight = formField.nativeElement.offsetHeight;
  
  expect(buttonHeight).toBe(formFieldHeight);
});

// Teste 3: Validar responsividade em diferentes resoluções
it('should maintain alignment in different viewport sizes', fakeAsync(() => {
  const resolutions = [1920, 768, 375];
  
  resolutions.forEach(width => {
    window.innerWidth = width;
    window.dispatchEvent(new Event('resize'));
    tick();
    fixture.detectChanges();
    
    const button = fixture.debugElement.query(By.css('button[type="submit"]'));
    const formField = fixture.debugElement.query(By.css('mat-form-field'));
    
    const buttonHeight = button.nativeElement.offsetHeight;
    const formFieldHeight = formField.nativeElement.offsetHeight;
    
    expect(buttonHeight).toBe(formFieldHeight);
  });
}));
```

### 8.2 Testes Manuais

1. **Desktop (1920px)**: Verificar alinhamento visual do botão com campos
2. **Tablet (768px)**: Verificar layout responsivo e alinhamento
3. **Mobile (375px)**: Verificar que o botão não quebra o layout
4. **Navegadores**: Testar em Chrome, Firefox, Safari, Edge

---

## 9. Conclusão

O ajuste do botão "Buscar Rolagens" é uma alteração visual simples e isolada que melhora a consistência visual do componente. A estratégia de usar `height: 100%` com `display: flex` é robusta, responsiva e compatível com todos os navegadores modernos.

**Próximas Etapas**:
1. ✅ Fase 2 (Design Técnico): CONCLUÍDO
2. → Fase 3 (Implementação): Executar as 3 tasks atômicas com TDD
3. → Fase 4 (Review): Validar testes, build e criar PR profissional

---

## 10. Aprovação

- **Tech Lead**: [Pendente]
- **Data de Aprovação**: [Pendente]

