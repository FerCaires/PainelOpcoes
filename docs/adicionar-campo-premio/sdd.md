# SDD: Adicionar Campo Premio na Interface BuscaRolagemResponse

## Decisões Arquiteturais
- **Campo obrigatório**: `premio: number` foi adicionado como propriedade obrigatória na interface `BuscaRolagemResponse`, pois a API backend já retorna esse valor na resposta.
- **Posicionamento**: O campo foi inserido entre `strike` e `rolagens`, mantendo a ordem lógica dos dados da opção informada.

## Padrões Técnicos
- Uso de tipagem forte (`number`), seguindo o padrão existente para `strike`.
- Reutilização do helper `formatarValor()` já disponível no `PainelRolagemComponent` para exibição formatada com duas casas decimais.

## Integrações
- `RolagemApiService` não necessita de alteração; o tipo genérico `Observable<BuscaRolagemResponse>` do `HttpClient` absorve automaticamente o novo campo.
- `PainelRolagemComponent` atribui a resposta diretamente a `this.resultado`, portanto o novo campo fica disponível no template sem lógica adicional no componente.

## Trade-offs Considerados
| Alternativa | Decisão | Motivo |
|-------------|---------|--------|
| Tornar `premio` opcional (`premio?: number`) | Rejeitado | O backend sempre retorna o prêmio da opção; opcionalidade geraria checks desnecessários no template. |
| Criar sub-interface para dados da opção | Rejeitado | Over-engineering para uma adição de um único campo. |

## Checklist de Entregas
- [x] `busca-rolagem-response.model.ts` atualizado
- [x] Mocks de teste atualizados
- [x] Template HTML atualizado
- [x] `npm test` passando (26/26)
- [x] `ng build` sem erros
