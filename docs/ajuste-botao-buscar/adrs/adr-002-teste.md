# ADR-002: Abordagem de Teste para Alinhamento do Botão

## Status
APROVADO

## Contexto

É necessário validar que o ajuste do botão "Buscar Rolagens" funciona corretamente em diferentes resoluções e navegadores. A abordagem de teste deve ser automatizada, confiável e compatível com CI/CD.

## Decisão

Usar testes unitários com `TestBed` do Angular para validar a altura do botão via `offsetHeight` e `getComputedStyle()`.

```typescript
it('should align button height with mat-form-field', () => {
  const button = fixture.debugElement.query(By.css('button[type="submit"]'));
  const formField = fixture.debugElement.query(By.css('mat-form-field'));
  
  const buttonHeight = button.nativeElement.offsetHeight;
  const formFieldHeight = formField.nativeElement.offsetHeight;
  
  expect(buttonHeight).toBe(formFieldHeight);
});
```

## Justificativa

1. **Automatização**: Testes unitários são executados automaticamente em CI/CD
2. **Confiabilidade**: `offsetHeight` é a medida real do elemento renderizado
3. **Cobertura**: Valida o alinhamento em diferentes resoluções (viewport)
4. **Manutenibilidade**: Testes são fáceis de entender e manter
5. **Regressão**: Detecta quebras em futuras alterações

## Alternativas Consideradas

### 1. Testes Visuais (Visual Regression Testing)
```typescript
// Usando ferramentas como Percy, Chromatic, etc.
it('should match visual snapshot', () => {
  expect(fixture).toMatchSnapshot();
});
```
**Desvantagens**:
- Requer ferramentas externas (custo)
- Mais lento para executar
- Falsos positivos com pequenas variações

### 2. Testes E2E (Cypress, Playwright)
```typescript
cy.get('button[type="submit"]').should('have.css', 'height', '56px');
```
**Desvantagens**:
- Mais lento que testes unitários
- Requer navegador real
- Mais complexo de configurar

### 3. Testes Manuais
**Desvantagens**:
- Não é automatizado
- Propenso a erros humanos
- Não funciona em CI/CD

## Consequências

### Positivas
- ✅ Testes automatizados em CI/CD
- ✅ Rápido de executar (< 1s)
- ✅ Fácil de manter e entender
- ✅ Detecta regressões
- ✅ Valida em diferentes resoluções

### Negativas
- ⚠️ Não valida a aparência visual (apenas altura)
- ⚠️ Pode ter variações pequenas entre navegadores

## Validação

- [ ] Testes unitários passam com `npm test`
- [ ] Cobertura de testes > 80%
- [ ] Testes executam em < 1s
- [ ] CI/CD verde

## Referências

- [Angular Testing Guide](https://angular.io/guide/testing)
- [Jasmine Documentation](https://jasmine.github.io/)
- [TestBed API](https://angular.io/api/core/testing/TestBed)

