# Gate 2 Review — Architecture: F-027 Tela de Gestão de Ações

## Verdict: PASS

## Spec alignment matrix
| Spec element | Addressed in arch | Notes |
|---|---|---|
| AC-01 | ✅ | Menu **Ações** `/acoes`; quatro itens existentes intactos; testes 4 → 5 |
| AC-02 | ✅ | `ngOnInit` → `GET /acoes`; tabela ticker, nome, spot, data/hora |
| AC-03 | ✅ | `formatarMonetario`; nulo → `—`; `formatarDataHora` |
| AC-04 | ✅ | `MSG_ACOES_CADASTRADAS_VAZIAS`; form visível |
| AC-05 | ✅ | `listar()` inalterado (genérico, sem envelope) |
| AC-06 | ✅ | pattern 5 alfanuméricos; nome 4–50; `podeAdicionar` |
| AC-07 | ✅ | `toUpperCase()` no POST |
| AC-08 | ✅ | concat + sort; `reset`; limpa erro de cadastro |
| AC-09 | ✅ | 409 `mensagem`; lista intacta |
| AC-10 | ✅ | 400/422 `mensagem` ou genérica |
| AC-11 | ✅ | 5xx/rede → `MSG_FALHA_CADASTRAR` |
| AC-12 | ✅ | `emOperacao`; spinner; POST `/atualizacao/executar` vazio |
| AC-13 | ✅ | quatro totais + relista `GET /acoes` |
| AC-14 | ✅ | genérica; `acoes` não zerada |
| AC-15 | ✅ | sem delete em template/service (ADR-02) |
| AC-16 | ✅ | sem mudança na simulação; F-024 já relista ao entrar |
| AC-17 | ✅ | sem cache; reentrada `ngOnInit` |
| AC-18 | ✅ | overflow-x; form fora da tabela |
| Actor: investidor | ✅ | menu + `/acoes` |
| Actor: API | ✅ | três endpoints existentes |
| Data model cadastro | ✅ | `CriarAcaoRequest` |
| Data model lista | ✅ | `Acao` + `dataAtualizacao?` |
| Data model relatório | ✅ | quatro totais |
| Envelope 4xx | ✅ | `mensagem` no POST; GET genérico |
| Out of scope delete / ticker 6 / auto-update | ✅ | ADR-02; validators 5 chars; botão manual |

## Warnings

Nenhum bloqueante.

### N-01 · ISO vs array Jackson
**Section**: `formatarDataHora`
**Issue**: O formatter assume string ISO. Se o backend serializar `LocalDateTime` como array, a célula mostra o valor cru.
**Suggested handling**: Fora desta feature. Backend atual usa string ISO (Spring Boot default).

## Summary
A architecture cobre os 18 ACs, os três contratos HTTP, OnPush/signals, lazy route, menu BR-UI-08 e a assimetria de erro GET vs POST. Não há endpoint novo nem exclusão na UI. Pronto para o Task Planner após aprovação do usuário.

## Recommendation
Proceed to Task Planner.
