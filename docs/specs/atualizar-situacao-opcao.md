# Feature: Atualizar Situação de Opção da Carteira

## Contexto e Objetivo
A tela `carteira/:id/adicionar-opcao` hoje permite **adicionar** uma opção nova à carteira e listar as opções já adicionadas, exibindo a coluna `Situação` apenas como informação textual. Não há como o usuário **atualizar** a situação de uma opção já carregada (por exemplo, marcar como EXERCIDA após o exercício, ROLADA após uma rolagem, ou FINALIZADA ao encerrar a posição).

O objetivo desta feature é permitir, **diretamente na tela `carteira/:id/adicionar-opcao`**, atualizar a situação de cada opção já vinculada à carteira por meio de um combo box por linha (pré-selecionado com a situação atual) e um **único botão** que percorre toda a lista disparando `PUT /api/carteiras/{carteiraId}/opcoes/{nomeOpcao}`. Em caso de erro em uma opção, o erro deve ser **registrado no console** e a iteração deve prosseguir para a próxima. Ao final, a lista deve ser recarregada para refletir o estado persistido no backend.

## Endpoint da API

| Método | Path | Body | Resposta 200 |
|--------|------|------|--------------|
| PUT    | `/api/carteiras/{carteiraId}/opcoes/{nomeOpcao}` | `{"situacao": "ABERTA" \| "EXERCIDA" \| "ROLADA" \| "FINALIZADA"}` | `OpcaoCarteira` com a situação atualizada |

**Exemplo de request**:
```http
PUT http://localhost:8080/api/carteiras/1/opcoes/BBASG223
Content-Type: application/json

{"situacao":"FINALIZADA"}
```

**Exemplo de response (200)**:
```json
{
  "nomeOpcao": "BBASG223",
  "nomeAcao": "BBAS3",
  "vencimento": "2026-07-17",
  "strike": 21.89,
  "premio": 0.14,
  "situacao": "FINALIZADA"
}
```

> **Ponto de atenção (Risco 1)**: o response do PUT usa o campo `nomeOpcao` (string), enquanto o `GET /api/carteiras/{id}/opcoes` atual retorna objetos com campo `nome` (ver `OpcaoCarteira` em `src/app/models/opcao-carteira.model.ts`). A normalização fica registrada como **pendência para a Fase 2 (Design)** confirmar com o backend qual é o contrato canônico do GET e padronizar o model.

## Requisitos Funcionais

1. **RF01** — A tela `/carteira/:id/adicionar-opcao` deve permitir **atualizar** a situação das opções já adicionadas à carteira selecionada, sem recarga manual da página.
2. **RF02** — Para cada opção listada na tabela, deve ser exibido um **combo box (select)** com exatamente **quatro valores** permitidos: `ABERTA`, `EXERCIDA`, `ROLADA`, `FINALIZADA`.
3. **RF03** — Ao carregar a lista de opções (no `ngOnInit` ou ao trocar de carteira), o combo box de cada linha deve estar **pré-selecionado** com a `situacao` atual retornada pelo backend.
4. **RF04** — Deve existir **um único botão** ("Atualizar Situações", por exemplo) que, ao ser clicado, percorre a lista de opções e dispara `PUT /api/carteiras/{carteiraId}/opcoes/{nomeOpcao}` para cada item, enviando `{"situacao": "<valor selecionado no combo da linha>"}`. Em caso de erro em uma opção, o erro deve ser **registrado via `console.error`** e a iteração deve **continuar** para a próxima opção (não interromper o loop).
5. **RF05** — Ao final da iteração (após todas as requisições terminarem, com sucesso ou erro), o componente deve **recarregar a lista** de opções (`carregarOpcoesCarteira()`) para refletir o estado persistido no backend.
6. **RF06** — O botão único deve ficar **desabilitado** enquanto a iteração estiver em andamento e enquanto a lista estiver vazia, evitando disparos com `dataSource` zerado.
7. **RF07** — Alterar a seleção do combo box de uma linha **não** deve disparar requisição imediatamente; o envio só ocorre no clique do botão único (batch update).

## Requisitos Não-Funcionais

1. **RNF01** — A chamada HTTP deve usar `HttpClient` (nada de `fetch`/`axios`) e o método deve residir em `CarteiraApiService`, **nunca** no componente.
2. **RNF02** — O novo método do service deve tratar erros via `catchError` no pipe RxJS, retornando o erro para o componente decidir a estratégia de log/continuidade.
3. **RNF03** — O componente deve usar `ChangeDetectionStrategy.OnPush` (já em uso) e `trackBy` na tabela (já existente via `trackByNome`).
4. **RNF04** — Tipagem TypeScript estrita, **sem uso de `any`**. O conjunto de situações válidas deve ser representado por **enum** (`SituacaoOpcao`).
5. **RNF05** — Cobertura de testes > 80% para o novo método do service e para o fluxo do componente (carregar combo, clicar no botão, simular erro parcial, recarregar lista).
6. **RNF06** — Validações e estado de UI devem usar **Reactive Forms** quando aplicável (uso de `FormGroup` por linha é recomendado, mas a critério do Design).
7. **RNF07** — Resposta a interações do usuário < 500ms para validações locais (não aplicável a latência de rede).
8. **RNF08** — Em caso de `console.error`, a mensagem deve incluir `carteiraId`, `nomeOpcao` e o `status` HTTP para facilitar debug.
9. **RNF09** — Manter o idioma **português (BR)** em código, comentários, commits e mensagens de erro exibidas ao usuário.

## Critérios de Aceite (Gherkin)

### Cenário 1 (RF01, RF03): Carregar lista com combo pré-selecionado
```gherkin
Dado que estou na página /carteira/:id/adicionar-opcao com uma carteira selecionada
E a API retorna 2 opções para essa carteira:
  | nomeOpcao | situacao  |
  | BBASG223  | ABERTA    |
  | PETR4123  | EXERCIDA  |
Quando a tela termina de carregar
Então cada linha da tabela exibe um combo box (mat-select)
E o combo da primeira linha está pré-selecionado com "ABERTA"
E o combo da segunda linha está pré-selecionado com "EXERCIDA"
```

### Cenário 2 (RF02, RF07): Opções do combo box
```gherkin
Dado que existe uma linha na tabela de opções
Quando abro o combo box dessa linha
Então as únicas opções visíveis são: ABERTA, EXERCIDA, ROLADA, FINALIZADA
E ao escolher uma opção diferente da atual, nenhuma requisição HTTP é disparada
```

### Cenário 3 (RF04): Botão único percorre a lista com sucesso
```gherkin
Dado que existem 2 opções carregadas no combo (BBASG223 -> ABERTA, PETR4123 -> EXERCIDA)
E eu altero o combo de BBASG223 para "FINALIZADA" e o de PETR4123 para "ROLADA"
Quando clico no botão único "Atualizar Situações"
Então o componente envia, em sequência, dois PUTs:
  | carteiraId | nomeOpcao | body                                    |
  | 1          | BBASG223  | {"situacao":"FINALIZADA"}               |
  | 1          | PETR4123  | {"situacao":"ROLADA"}                   |
E ambos retornam 200
E nenhuma mensagem de erro é registrada no console
```

### Cenário 4 (RF04, RNF08): Botão único com erro parcial continua iteração
```gherkin
Dado que existem 3 opções carregadas (BBASG223, PETR4123, VALE5128)
E eu altero as 3 situações no combo
Quando clico no botão único "Atualizar Situações"
E o PUT para PETR4123 retorna erro 500
Então o componente registra no console.error: nomeOpcao=PETR4123, status=500
E o PUT para BBASG223 e para VALE5128 são executados normalmente
E ao final, a lista de opções é recarregada via GET /api/carteiras/{id}/opcoes
```

### Cenário 5 (RF05): Recarregar lista ao final
```gherkin
Dado que cliquei no botão único e todas as requisições PUT terminaram
Quando a iteração termina (com ou sem erros parciais)
Então o componente chama novamente carregarOpcoesCarteira()
E a tabela reflete a situação persistida pelo backend (não apenas o valor local do combo)
```

### Cenário 6 (RF06): Botão desabilitado em estados inválidos
```gherkin
Dado que estou na página /carteira/:id/adicionar-opcao
Quando a lista de opções da carteira está vazia
Então o botão "Atualizar Situações" está desabilitado
E quando uma iteração está em andamento
Então o botão "Atualizar Situações" permanece desabilitado até o término de todas as requisições
```

## Fora de Escopo
- Edição em massa de outras colunas além de `situacao` (vencimento, strike, prêmio, etc.).
- Atualização otimista da UI sem chamada PUT (todo envio passa pelo backend).
- Histórico de alterações de situação (audit log).
- Filtros, paginação ou ordenação da tabela de opções.
- Notificações visuais (snackbar/toast) de sucesso/erro; erros são **apenas** logados no console, conforme requisito.
- Seleção múltipla ou checkbox por linha; a iteração é sobre **toda** a lista exibida.

## Tarefas Atômicas

Cada task deve ter **≤ 300 linhas** de diff e ser entregue em **1 commit** isolado.

### Feature: atualizar-situacao-opcao (5 tasks)

1. **TASK-01** — Criar enum `SituacaoOpcao`
   - **Status**: PLANEJADO
   - **Arquivo**: `src/app/models/situacao-opcao.enum.ts`
   - **Descrição**: Criar enum TypeScript com os 4 valores canônicos (`ABERTA`, `EXERCIDA`, `ROLADA`, `FINALIZADA`), exportado e tipado estritamente.
   - **Critério de Done**: enum criado, exportado, sem `any`, utilizável em models e componentes.

2. **TASK-02** — Adicionar método `atualizarSituacaoOpcao` no `CarteiraApiService`
   - **Status**: PLANEJADO
   - **Arquivo**: `src/app/services/carteira-api.service.ts`
   - **Descrição**: Criar método `atualizarSituacaoOpcao(carteiraId: string, nomeOpcao: string, situacao: SituacaoOpcao): Observable<OpcaoCarteira>` que faz `PUT ${baseUrl}/carteiras/${carteiraId}/opcoes/${nomeOpcao}` com body `{ situacao }`, `Content-Type: application/json`, e usa `catchError` no pipe RxJS propagando o erro.
   - **Critério de Done**: método compila, usa `inject()` (já herdado), erros propagados, body enviado como JSON, path params interpolados corretamente.

3. **TASK-03** — Testes unitários para `atualizarSituacaoOpcao`
   - **Status**: PLANEJADO
   - **Arquivo**: `src/app/services/carteira-api.service.spec.ts`
   - **Descrição**: Cobrir: (a) PUT com URL, método, body e headers corretos; (b) propagação de erro 500 com status preservado; (c) desserialização do response 200 em `OpcaoCarteira`.
   - **Critério de Done**: testes passam, cobertura > 80% no novo método.

4. **TASK-04** — UI de edição em `AdicionarOpcaoComponent` (combo + botão único)
   - **Status**: PLANEJADO
   - **Arquivos**: `src/app/components/adicionar-opcao/adicionar-opcao.component.ts`, `.html`, `.scss`
   - **Descrição**:
     - Manter um mapa reativo (ex.: `FormGroup`/`FormArray` ou `Map<string, FormControl<SituacaoOpcao>>`) com a situação **selecionada** por linha, inicializado a partir de `opcao.situacao` em `carregarOpcoesCarteira()`.
     - Substituir a célula estática de `Situação` por um `mat-select` (estilo outlined/inline) com as 4 opções do enum.
     - Adicionar **um único botão** "Atualizar Situações" no rodapé da seção da tabela, desabilitado quando `opcoesCarteira.length === 0` ou `atualizandoEmMassa === true`.
     - Implementar `atualizarSituacoesEmMassa()` que faz `forEach`/loop na lista, dispara `PUT` por opção via `forkJoin` (ou `concatMap` sequencial) e usa `catchError` por requisição individual para que um erro **não** aborte as demais. O `console.error` deve incluir `carteiraId`, `nomeOpcao` e `status` HTTP.
     - Ao final (após o último `PUT` resolver/errar), chamar `carregarOpcoesCarteira()`.
   - **Critério de Done**: combo pré-selecionado com a situação atual; botão único dispara a iteração; erro em uma opção não aborta as outras; console.error é chamado com os dados esperados; lista recarregada no final; `OnPush` respeitado; `cdr.markForCheck()` chamado após cada mutação.

5. **TASK-05** — Testes unitários para o fluxo de atualização em `AdicionarOpcaoComponent`
   - **Status**: PLANEJADO
   - **Arquivo**: `src/app/components/adicionar-opcao/adicionar-opcao.component.spec.ts`
   - **Descrição**: Cobrir: (a) combo pré-selecionado com a `situacao` retornada pelo GET; (b) clique no botão único chama `PUT` para cada opção com a situação do combo; (c) erro em uma opção é logado no `console.error` e as demais são chamadas; (d) `carregarOpcoesCarteira` é chamado ao final da iteração; (e) botão desabilitado quando lista vazia; (f) botão desabilitado durante a iteração.
   - **Critério de Done**: testes passam, cobertura > 80% no novo fluxo.

## Riscos e Dependências
- **Risco 1 (contrato da API)**: o response do PUT usa `nomeOpcao`, mas o GET atual pode estar retornando `nome`. **Mitigação**: registrar como **pendência para Fase 2 (Design)** confirmar contrato canônico e padronizar o model.
- **Risco 2 (paralelismo)**: iteração sequencial vs. paralela pode mudar ordem dos logs e timing da recarga. **Mitigação**: o Design deve definir se é `forkJoin` (paralelo) ou `concatMap` (sequencial); comportamento esperado em ambos é "não abortar em erro".
- **Risco 3 (memória do `console`)**: `console.error` em produção pode poluir; alinhado com o requisito explícito do usuário, manter como está.
- **Dependência**: API backend deve estar implementada e responder conforme o exemplo de response.

## Matriz de Rastreabilidade
| Requisito | Tasks | Arquivos principais | Testes |
|-----------|-------|---------------------|--------|
| RF01      | TASK-04 | `adicionar-opcao.component.ts` | TASK-05 |
| RF02      | TASK-01, TASK-04 | `situacao-opcao.enum.ts`, `adicionar-opcao.component.html` | TASK-05 |
| RF03      | TASK-04 | `adicionar-opcao.component.ts` | TASK-05 |
| RF04      | TASK-02, TASK-04 | `carteira-api.service.ts`, `adicionar-opcao.component.ts` | TASK-03, TASK-05 |
| RF05      | TASK-04 | `adicionar-opcao.component.ts` | TASK-05 |
| RF06      | TASK-04 | `adicionar-opcao.component.html`, `.ts` | TASK-05 |
| RF07      | TASK-04 | `adicionar-opcao.component.html` | TASK-05 |
| RNF01-RNF03 | TASK-02, TASK-04 | services e component | TASK-03, TASK-05 |
| RNF04     | TASK-01 | `situacao-opcao.enum.ts` | TASK-03, TASK-05 |
| RNF05     | TASK-03, TASK-05 | `*.spec.ts` | — |
| RNF06-RNF09 | TASK-02, TASK-04 | services e component | TASK-03, TASK-05 |

## Complexidade: Pequena
## Estimativa: 5 tarefas atômicas

## Dúvidas / Pendências para decisão antes da Fase 2 (Design)

1. **Inconsistência de contrato GET vs. PUT**: o `PUT` retorna `nomeOpcao`, mas o `GET /api/carteiras/{id}/opcoes` (model `OpcaoCarteira`) usa `nome`. Padronizar para `nomeOpcao` no model? Confirmar contrato canônico com o backend.
2. **Origem do `carteiraId`**: a tela usa um `<mat-select>` no formGroup para escolher a carteira (além do `:id` da rota). Manter esse padrão (select) ou passar a usar o `:id` da rota (mais alinhado com a URL literal `carteira/:id/adicionar-opcao`)? Hoje o `:id` da rota não é lido pelo componente.
3. **Iteração sequencial vs. paralela**: usar `concatMap` (PUTs em ordem) ou `forkJoin` (PUTs em paralelo)? O requisito não especifica; afeta ordem dos logs e comportamento sob carga.
4. **Tipo da `situacao` em `OpcaoCarteira`**: hoje é `string`. Migrar para `SituacaoOpcao` (enum)? Implicaria cast/parse ao receber do GET. Recomendado para evitar `string` solta.
5. **UX do botão único**: rótulo ("Atualizar Situações"?), posição (rodapé da tabela? ao lado do cabeçalho "Opções da Carteira"?) e estado de loading (spinner? texto "Atualizando..."?) — definir no Design, alinhado com o `frontend-design`.
