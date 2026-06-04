# Clean Architecture — Angular + TypeScript

Use Clean Architecture (Robert C. Martin) quando o domínio for complexo, com muitas regras de negócio, ou quando a independência de frameworks for crítica.

## Estrutura de Diretórios

```
src/
├── domain/                          # Regras de negócio puras (nada de Angular)
│   ├── entities/                   # Entidades de domínio
│   │   └── Notificacao.ts          # class com regras de negócio
│   ├── valueobjects/               # Value Objects imutáveis
│   │   └── Email.ts               # validação, normalização
│   └── usecases/                   # Casos de uso (interfaces + implementações)
│       ├── EnviarNotificacaoUseCase.ts
│       └── EnviarNotificacaoUseCaseImpl.ts
├── application/                    # Regras de aplicação (orquestração)
│   ├── ports/
│   │   ├── in/                     # Driven ports (entrada)
│   │   │   └── NotificacaoCommand.ts
│   │   └── out/                    # Driver ports (saída)
│   │       ├── NotificacaoRepositoryPort.ts
│   │       └── EmailSenderPort.ts
│   └── services/
│       └── NotificacaoApplicationService.ts
├── infrastructure/
│   ├── ui/                         # Componentes Angular
│   │   ├── components/
│   │   │   └── notificacao-form.component.ts
│   │   └── services/
│   │       └── notificacao.service.ts
│   ├── api/                        # API clients
│   │   ├── NotificacaoApiService.ts
│   │   └── EmailApiService.ts
│   └── store/                      # State management (NgRx)
│       └── NotificacaoStore.ts
└── presentation/                   # Modules/Routing (Angular)
    └── app/
        └── features/
            └── notificacao/
                └── notificacao.module.ts
```

## Regras de Dependência (OBRIGATÓRIO)

As setas de dependência SEMPRE apontam para dentro:

```
Infrastructure (UI/API/Store)
    ↓
Application (Ports + Services)
    ↓
Domain (Entities + UseCases + Value Objects)
```

| Regra | O que proibir | O que permitir |
|-------|---------------|----------------|
| **Domain não conhece Angular** | `@Component`, `@Injectable`, `@Inject` no domain | `class`, `interface`, `type` puro |
| **Domain não conhece Infrastructure** | Import de `infrastructure.*` no domain | Domain depende apenas de si mesmo |
| **Application define ports** | Implementação de API/store na application | `interface` (Port) na application, `impl` no infrastructure |
| **Infrastructure implementa ports** | Infrastructure importar domain diretamente | Infrastructure converte Entity ↔ DTO, chama port |
| **Framework isolado** | Angular decorators em domain ou usecase | Angular apenas em `infrastructure/ui/*` |

## Quando usar (vs outros padrões)

| Padrão | Use quando | Não use quando |
|--------|-----------|--------------|
| **Feature-based** | CRUD simples, time pequeno, protótipo | Domínio complexo, muitos contextos |
| **Monolithic** | Aplicação tradicional, time pequeno | Escalabilidade crítica |
| **Clean Arch** | Domínio rico, regras complexas, longevidade | CRUD simples, MVP rápido, time sem experiência |