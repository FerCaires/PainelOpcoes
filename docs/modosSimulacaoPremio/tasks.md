# Task plan: F-026 Modos na tela Meta de Prêmio

- [x] TASK-01 · Enum `ModoSimulacao` + interface `SimulacaoRequest`.
- [x] TASK-02 · Estender `SimulacaoMetaPremioResponse` (`modo?`, `metaPremio` nullable, `garantia?`, `quantidadeAcoesInformada?`).
- [x] TASK-03 · Validator `multiploDeCem` + spec (250 inválido, 700 válido, vazio null).
- [x] TASK-04 · `SimulacaoMetaPremioApiService.simular(request)` monta HttpParams por modo; specs dos três modos + regressão 4xx.
- [x] TASK-05 · Form do componente: `modo` default Meta; enable/disable campos; limpar resultado ao trocar modo.
- [x] TASK-06 · Template: toggle de modo, campos condicionais, cabeçalho Meta/Garantia/Quantidade; subtítulo atualizado.
- [x] TASK-07 · Specs do componente: default Meta, troca de modo, query params, Simular off em 250, cabeçalho Garantia/Quantidade, regressão F-024.
