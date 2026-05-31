# ADR-001: Estratégia de Alinhamento do Botão "Buscar Rolagens"

## Status
APROVADO

## Contexto

O botão "Buscar Rolagens" no componente `PainelRolagemComponent` possui altura diferente dos campos de entrada (`mat-form-field`). É necessário definir uma estratégia para alinhar o botão com os campos de formulário, mantendo a responsividade e compatibilidade com navegadores modernos.

## Decisão

Usar `display: flex` com `align-items: center` no botão e manter `height: 100%` para corresponder à altura do container (`.form-busca`).

```scss
button[type="submit"] {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  // ... outros estilos
}
```

## Justificativa

1. **Responsividade**: `height: 100%` é relativo ao container, não usa valores fixos em px
2. **Compatibilidade**: Funciona em todos os navegadores modernos (Chrome, Firefox, Safari, Edge)
3. **Flexibilidade**: Adapta-se automaticamente a diferentes temas e tamanhos de `mat-form-field`
4. **Preservação Visual**: Mantém os efeitos visuais (gradiente, hover, active) intactos
5. **Alinhamento Vertical**: `align-items: center` garante que o conteúdo do botão fica centralizado verticalmente

## Alternativas Consideradas

### 1. Usar `min-height` fixo (56px)
```scss
button[type="submit"] {
  min-height: 56px;
}
```
**Desvantagens**:
- Valor fixo em px não é responsivo
- Pode quebrar se o Material Design mudar a altura padrão
- Não funciona bem em diferentes temas

### 2. Usar `align-items: stretch` no grid
```scss
.form-busca {
  align-items: stretch;
}
```
**Desvantagens**:
- Pode causar distorção do botão
- Afeta todos os elementos do grid
- Menos controle sobre o alinhamento

### 3. Usar `line-height`
```scss
button[type="submit"] {
  line-height: 56px;
}
```
**Desvantagens**:
- Não funciona bem com `mat-raised-button`
- Afeta apenas o texto, não o botão inteiro
- Pode causar problemas de alinhamento vertical

## Consequências

### Positivas
- ✅ Botão alinhado com campos de formulário
- ✅ Layout responsivo em todas as resoluções
- ✅ Compatível com todos os navegadores modernos
- ✅ Sem alteração na lógica do componente
- ✅ Efeitos visuais preservados

### Negativas
- ⚠️ Depende da altura do container `.form-busca`
- ⚠️ Pode variar ligeiramente em diferentes navegadores

## Validação

- [ ] Testar em Chrome, Firefox, Safari, Edge
- [ ] Validar em desktop (1920px), tablet (768px), mobile (375px)
- [ ] Verificar que os efeitos visuais (hover, active) funcionam
- [ ] Rodar testes unitários

## Referências

- [MDN: CSS Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)
- [Material Design: Button](https://material.angular.io/components/button/overview)
- [Angular Material Form Field](https://material.angular.io/components/form-field/overview)

