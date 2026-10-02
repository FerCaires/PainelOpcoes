# Gate 1 Review — Spec: F-024 — Tela de Simulação de Meta de Prêmio

## Verdict: PASS WITH NOTES

## Score
| Category | Status | Findings |
|----------|--------|----------|
| Completeness | ✅ | Summary (o quê + porquê), Goals, Out of scope, Actors, ACs, Data model, Edge cases, Open questions e Assumptions presentes e não vazios (Open questions explicitamente “nenhuma”). |
| AC quality | ✅ | AC-01 a AC-18 únicos, em Dado/Quando/Então, binários e independentes de pergunta aberta. Sem nomes de classe/framework. AC-06 é composto (várias asserções), mas ainda testável. |
| Data model integrity | ⚠️ | Formulário, query params, cabeçalho e colunas da tabela estão nomeados, tipados e ligados aos ACs. Envelope 4xx (`erro`, `mensagem`, etc.) é citado nas ACs e nas convenções, mas não aparece como tabela de Output no Data model. Campos de `GET /api/acoes` não têm flag obrigatório/opcional. |
| Edge case coverage | ⚠️ | Cobertura forte para os três inputs obrigatórios, malformação de `metaPremio`, lista vazia (ações e opções), 404/422 da simulação, 500/rede, ITM/ATM/OTM e viewport. Falta cenário explícito para HTTP 4xx em `GET /api/acoes`. |
| Internal consistency | ⚠️ | Goals, out of scope, ACs e knowledge (BR-UI-01–22, BR-14–16/21–23/27) alinham no fluxo principal. AC-17 cita BR-UI-22 mas só afirma descarte de resultado/erro, não do estado do formulário que a regra de knowledge inclui. |
| Architecture readiness | ⚠️ | Rota, menu, campos, query params, DTOs de sucesso e mapeamento 4xx/5xx da simulação bastam para rotas, componentes e serviço HTTP. Lacunas de erro/loading na carga de ações podem gerar retrabalho de mapeamento, não bloqueiam o desenho. |

## Warnings (PASS WITH NOTES conditions)
> Present if verdict is PASS WITH NOTES. These don't block the Architect but should be addressed soon.

### W-01 · AC-17 vs BR-UI-22 no estado do formulário
**Section**: Acceptance criteria / Internal consistency
**Issue**: AC-17 garante que resultado e erro não reaparecem ao sair e voltar à rota, e que `GET /api/acoes` é redisparado. A mesma AC cita BR-UI-22, cuja definição no knowledge inclui descarte do **estado do formulário**. A spec não afirma (nem nega) se Ação, Meta de prêmio e Tipo voltam vazios após a navegação.
**Suggested fix**: Explicitar em AC-17 (ou edge case) se os três campos do formulário são resetados ao destruir a rota, alinhado a BR-UI-22, ou restringir BR-UI-22 nesta tela só a resultado/erro.

### W-02 · `GET /api/acoes` sem mapeamento 4xx
**Section**: Edge cases / Architecture readiness
**Issue**: AC-05 cobre falha de rede ou HTTP 500 na carga de ações (mensagem genérica). BR-UI-13, referenciada pela spec, manda exibir `mensagem` em qualquer 4xx com corpo padrão. Não há AC nem linha de edge case para 4xx em `GET /api/acoes` (ex.: 404), então o Architect pode aplicar AC-05 a todos os não-200 ou BR-UI-13 só ao 4xx — comportamentos diferentes.
**Suggested fix**: Acrescentar um cenário: ou 4xx de `GET /api/acoes` exibe `mensagem` (fallback genérico de ações se `mensagem` ausente), ou todos os erros dessa chamada usam a mensagem genérica de AC-05.

### W-03 · Loading da carga inicial de ações
**Section**: Acceptance criteria / Architecture readiness
**Issue**: Goals mencionam “loading”. AC-14 detalha indicador, botão desabilitado e limpeza só no disparo de **Simular**. Não há AC para indicador (nem ausência dele) enquanto `GET /api/acoes` está em voo, nem controle de “Tente novamente” — só o texto da mensagem.
**Suggested fix**: Dizer se a carga de ações exige o mesmo tipo de indicador de BR-UI-12 e se “Tente novamente” é só orientação (recarregar a rota) ou um controle na tela.

### W-04 · Envelope de erro fora da tabela de Output
**Section**: Data model
**Issue**: ACs 09–12 referenciam `erro` e `mensagem`. O Data model lista mensagens fixas e o fallback “`mensagem` ausente → genérica de simulação”, mas não tipa o corpo `{ timestamp, status, erro, mensagem, detalhes[] }` nem marca `mensagem` como obrigatório/opcional. Convenções no cabeçalho da spec e no knowledge cobrem a lacuna para o Architect, com risco baixo de retrabalho.
**Suggested fix**: Incluir no Data model uma tabela de Output do 4xx com nome, tipo e se a UI depende de cada campo (`mensagem` para texto; `erro` só para identificar o caso nos ACs; `detalhes` não exibido).

## Summary
A spec F-024 está completa para uma tela frontend: pergunta de negócio, exclusões, atores, 18 ACs testáveis, contrato de formulário, query params, DTOs de cabeçalho/tabela, mensagens fixas e alinhamento com o knowledge (rota, menu, BR-UI, API aberta, sem persistência nem recálculo). O Architect tem o suficiente para rotas, componentes, serviços HTTP e o mapeamento principal de erros da simulação. Os pontos a fechar são o reset do formulário ao sair da rota, o 4xx de `GET /api/acoes` e o loading da carga inicial — não bloqueiam o design, mas podem gerar retrabalho se o Architect tiver de adivinhar.

## Recommendation
Proceed to Architect. Spec Writer should address warnings in parallel or in the next iteration.
