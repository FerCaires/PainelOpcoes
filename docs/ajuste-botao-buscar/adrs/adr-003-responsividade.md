# ADR-003: Validação de Responsividade em Diferentes Resoluções

## Status
APROVADO

## Contexto

O ajuste do botão "Buscar Rolagens" deve funcionar corretamente em diferentes resoluções de tela (desktop, tablet, mobile). É necessário definir uma estratégia para validar a responsividade sem quebrar o layout.

## Decisão

Testar em 3 breakpoints principais usando `window.innerWidth` e `fakeAsync()` do Angular:

1. **Desktop**: 1920px (full width)
2. **Tablet**: 768px (iPad)
3. **Mobile**: 375px (iPhone)

```typescript
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

## Justificativa

1. **Cobertura**: 3 breakpoints cobrem os casos de uso mais comuns
2. **Simplicidade**: Não requer ferramentas externas
3. **Velocidade**: Testes rápidos de executar
4. **Confiabilidade**: Valida o comportamento do grid responsivo
5. **Manutenibilidade**: Fácil de adicionar novos breakpoints

## Alternativas Consideradas

### 1. Testar em Todos os Breakpoints
```typescript
const resolutions = [320, 375, 425, 768, 1024, 1280, 1440, 1920];
```
**Desvantagens**:
- Testes mais lentos
- Muita redundância
- Difícil de manter

### 2. Usar Ferramentas de Teste Responsivo (Responsive Design Mode)
**Desvantagens**:
- Requer navegador real
- Não é automatizado
- Não funciona em CI/CD

### 3. Usar Media Queries Específicas
```scss
@media (max-width: 768px) {
  button[type="submit"] {
    height: auto;
  }
}
```
**Desvantagens**:
- Adiciona complexidade ao SCSS
- Pode quebrar o alinhamento em alguns casos
- Menos flexível

## Consequências

### Positivas
- ✅ Valida responsividade em 3 resoluções principais
- ✅ Testes rápidos de executar
- ✅ Fácil de manter
- ✅ Detecta quebras de layout
- ✅ Compatível com CI/CD

### Negativas
- ⚠️ Não cobre todas as resoluções possíveis
- ⚠️ Pode não detectar problemas em resoluções intermediárias

## Validação

- [ ] Testes passam em desktop (1920px)
- [ ] Testes passam em tablet (768px)
- [ ] Testes passam em mobile (375px)
- [ ] Layout não quebra em nenhuma resolução
- [ ] Botão alinhado com campos em todas as resoluções

## Referências

- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Angular Testing: fakeAsync](https://angular.io/api/core/testing/fakeAsync)
- [Material Design: Breakpoints](https://material.io/design/layout/responsive-layout-grid.html)

