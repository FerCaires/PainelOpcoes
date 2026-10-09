# Architecture: F-030 UX do Controle de Operações

## Overview

Evolução **somente de UI** da tela lazy `/controle-operacoes`. O `ControleOperacoesComponent` ganha estado `cadastroAberto`, dois conjuntos de filtros ligados aos mesmos signals, e um componente apresentacional de gráfico SVG alimentado por `resumo`. Sem endpoint novo, sem recálculo, sem Chart.js.

## Knowledge base references

- Shared components reused: `HeaderMenuComponent`, `OperacaoApiService`, `ConfirmacaoDialogComponent`, `formatarMonetario` / `formatarPercentual3`
- Existing tables extended: none (Painel sem DB)
- Existing endpoints affected: `GET /operacoes` (já com query `nomeAcao`, `ano`, `mes`) — consumo inalterado
- ADRs applied: ADR-001 standalone, ADR-002 Material, ADR-003 Reactive Forms, ADR-004 GET+HttpParams, ADR-005 inject()
- New project-level ADRs proposed: none (ADRs desta feature abaixo)

## Component diagram (text)

```
/controle-operacoes  (já lazy)
  ControleOperacoesComponent
    ├── HeaderMenuComponent
    ├── cabeçalho + botão Novo lançamento / Fechar cadastro
    ├── form cadastro          [*ngIf cadastroAberto]
    ├── importação CSV         [sempre visível]
    ├── seção Resumos
    │     ├── filtros (Ação, Mês, Ano)  → mesmos signals
    │     ├── acumulado
    │     ├── GraficoBarrasResumo × 3   (mês / ano / ativo)
    │     └── tabelas F-029
    ├── seção Operações
    │     ├── filtros (mesmos signals)
    │     └── MatTable
    └── OperacaoApiService.listar(filtros)
```

Não alterar outras rotas.

## Technology decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Cadastro recolhido | `signal cadastroAberto` + `*ngIf` no form; botão no cabeçalho da seção | Sem `MatExpansionPanel` (evita lutar com o FormGroup e com o foco dos campos). Estado simples, testável. |
| Default | `cadastroAberto = false` | AC-01, tela limpa |
| Abrir em edição | `selecionarOperacao` seta `cadastroAberto true` | AC-04 |
| Fechar / sucesso / cancelar | `cadastroAberto false` + `limparFormulario` | AC-03, AC-05; fechar em edição = Cancelar |
| Filtros duplicados na UI | `<ng-template>` + dois `*ngTemplateOutlet` | AC-07/08; um estado (`filtroAcao/Mes/Ano`) |
| Gráficos | Componente standalone SVG `GraficoBarrasResumoComponent` | Sem dependência nova (out of scope). OnPush + `input()`. |
| Layout das barras | Função pura `montarBarrasResumo` em `utils/` | Testável sem TestBed; funções ≤ 20 linhas |
| Lucro negativo | Eixo zero; barra para cima (positivo, `--accent-green`) ou para baixo (negativo, `--error`) | AC-15 |
| Números nas barras | `formatarMonetario` já existente | BR-UI-02; sem recálculo |
| Filtros durante request | `[disabled]` nos `mat-select` quando `emOperacao()` | AC-17 / BR-UI-11 |
| Importação | Fora do `*ngIf` do cadastro | AC-01, AC-06 |

## API contract

### Endpoint: GET `{apiBaseUrl}/operacoes`

Inalterado em relação a F-029.

- **Auth**: nenhuma
- **Query**: `nomeAcao?`, `ano?`, `mes?` — omitir chave quando o filtro correspondente é Todos
- **Response 200**: `{ operacoes, resumo: { acumulado, porMes, porAno, porAtivo } }`
- **Error responses**: GET 4xx/5xx/rede → mensagem genérica de carga (F-029). Sem código novo.

POST/PUT/DELETE/importar: fora desta feature.

## Database schema

Não aplica. Painel sem banco. Sem migration.

## TypeScript / Angular design

- Pacote: `src/app/components/controle-operacoes/` (existente) + `src/app/components/grafico-barras-resumo/` + `src/app/utils/montar-barras-resumo.ts`
- `inject()`; `OnPush`; signals; sem `any`
- `GraficoBarrasResumoComponent`:
  - `titulo = input.required<string>()`
  - `itens = input.required<readonly { rotulo: string; valor: number }[]>()`
  - computed chama `montarBarrasResumo`
  - SVG `role="img"` + `[attr.aria-label]`
- Parent mapeia séries **sem alterar valores**:
  - mês: `{ rotulo: item.anoMes, valor: item.lucro }`
  - ano: `{ rotulo: String(item.ano), valor: item.lucro }`
  - ativo: `{ rotulo: item.nomeAcao, valor: item.lucro }`
- `*ngIf="serie.length > 0"` em cada gráfico (AC-14)
- Form permanece no mesmo `FormGroup`; `*ngIf` só esconde o template

## Cross-cutting concerns

- **Auth**: nenhuma (BR-UI-21)
- **Logging**: nenhum campo extra
- **Error handling**: inalterado (F-029)
- **Observability**: n/a
- **A11y**: botão de cadastro com `aria-expanded`; gráficos com `aria-label`; foco visível; filtros teclado via Material
- **Visual**: tokens existentes (`--primary-blue`, `--accent-gold`, `--accent-green`, `--error`, `--font-display`). Direção: editorial financeiro — cadastro some, resumos ganham peso visual com barras e ouro no acumulado.

## Risks & open items

- Viewport estreita com três gráficos: empilhar em 1 coluna abaixo de 960px; scroll-x se a série for longa.
- `*ngIf` no form não destrói o `FormGroup` da classe — só o DOM. Fechar deve chamar `limparFormulario` para não deixar rascunho oculto.

## Architecture Decision Records (feature-level)

### ADR-01: Cadastro com `*ngIf` + signal, não expansion panel
- **Status**: Accepted
- **Context**: Precisa abrir/fechar o formulário grande sem poluir a tela.
- **Decision**: `cadastroAberto` + botão; `*ngIf` no `<form>`.
- **Consequences**: Testes assertam presença/ausência do form. Material Expansion não entra no bundle desta tela.

### ADR-02: SVG próprio em vez de Chart.js / ng2-charts
- **Status**: Accepted
- **Context**: Spec proíbe biblioteca de gráficos; Angular 17 ainda sem charts no `package.json`.
- **Decision**: componente SVG + função pura de layout.
- **Consequences**: Barras simples (sem tooltip nativo). Rótulos no SVG. Sem update de dependência.

### ADR-03: Filtros duplicados na UI, estado único
- **Status**: Accepted
- **Context**: Figuras 2 e 3 pedem filtros junto de cada bloco.
- **Decision**: dois outlets do mesmo template; signals compartilhados; um GET.
- **Consequences**: Não há filtro “só do gráfico” vs “só da tabela”. Resumo da API continua a fonte.
