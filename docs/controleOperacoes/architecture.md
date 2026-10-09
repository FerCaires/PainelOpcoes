# Architecture: F-029 Tela de Controle de Operações

## Overview

Tela Angular standalone lazy em `/controle-operacoes`, menu **Controle**. Lista + filtros (ação, mês, ano) + formulário (ticker obrigatório, IR default 0) + importação CSV + painéis de resumo. Consome F-028. Signals + `OnPush`. Sem recálculo financeiro no cliente.

## Knowledge base references

- `HeaderMenuComponent`, `environment.apiBaseUrl`, `ApiError`, Material, Reactive Forms, `inject()`, `formatarDataIso`, `formatarMonetario`
- BR-UI-07, BR-UI-08, BR-UI-11, BR-UI-12, BR-UI-13, BR-UI-20
- Spec F-029; contrato F-028

## Component diagram

```
menu "Controle" → /controle-operacoes (lazy)
  ControleOperacoesComponent  (standalone, OnPush, signals)
    ├── HeaderMenuComponent
    ├── filtros (ação, mês, ano) → query GET
    ├── input file CSV + botão Importar
    ├── FormGroup inclusão/edição (nomeOpcao required, valorIr default 0)
    ├── MatTable operações
    ├── painéis resumo
    └── OperacaoApiService
          GET/POST/PUT/DELETE  {apiBaseUrl}/operacoes[/{id}]
          POST multipart       {apiBaseUrl}/operacoes/importar
```

Não alterar Carteira, Rolagem, Meta de Prêmio ou Ações além do header.

## Technology decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Tela | Lazy `loadComponent` | Padrão `/acoes` |
| Menu | Controle depois de Carteira | Aprovado |
| HTTP import | `FormData` + `file` | Contrato F-028; **não** parsear CSV no Angular |
| Filtros | query no GET; não filtrar no cliente | Resumo da API |
| Seletor ação | união dos `nomeAcao` já vistos | Não esvaziar ao filtrar |
| IR no form | default `0`, `min(0)`, vazio → 0 no submit | AC-02 API |
| Ticker opção | required 4–12 | BBAST194 etc. |
| Prêmio | `min` exclusivo > 0 | Sem prêmio negativo |
| Exclusão | `MatDialog` | |
| Edit | Mesmo FormGroup; `idEdicao` | |
| GET após escrita/import | Sempre | Resumo |
| Arquivo | `accept=".csv,text/csv"` | |

## API (cliente)

| Método | Path | UI |
|--------|------|-----|
| GET | `/operacoes` | Carga/refresh. Query opcional `nomeAcao`, `ano`, `mes`. Falha genérica |
| POST | `/operacoes` | Inclusão. 4xx → `mensagem` |
| PUT | `/operacoes/{id}` | Edição. 4xx → `mensagem` |
| DELETE | `/operacoes/{id}` | Após dialog |
| POST | `/operacoes/importar` | `FormData.append('file', arquivo)`. 4xx → `mensagem` |

Body POST/PUT: sempre inclui `nomeOpcao`; `valorIr` 0 se vazio. Omite `corretora` / `dataPagamentoIr` se vazios.

`listar(filtros)` monta `HttpParams` só com chaves definidas.

## TypeScript

`Operacao.nomeOpcao: string` (não nulo). `OperacaoRequest.nomeOpcao: string` obrigatório; `valorIr?: number`.

```typescript
export interface ResultadoImportacao {
  readonly totalLidas: number;
  readonly totalIgnoradas: number;
  readonly totalCriadas: number;
  readonly totalAtualizadas: number;
  readonly erros: readonly { readonly linha: number; readonly mensagem: string }[];
}
```

`OperacaoErro extends ApiError` para 4xx de POST/PUT/DELETE/importar.

## Form

- nomeOpcao: required, pattern 4–12 alfanuméricos
- valorIr: default 0, min 0 (vazio → 0 no submit)
- valorPremio: required, deve ser > 0
- dataPagamentoIr: opcional
- demais: spec AC-06
- Datas: `input type="date"`
- Filtros fora do FormGroup de lançamento: signals `filtroAcao`, `filtroMes`, `filtroAno` (`null` = todos)

## Tests

- service: GET/POST/PUT/DELETE + POST import `FormData`
- header: item Controle
- component: Salvar disabled sem ticker / prêmio ≤ 0; POST BBAST194; GET com query ao filtrar; GET após 201 preserva filtro; import FormData

## Compatibility

Rotas existentes intactas. `**` por último.
