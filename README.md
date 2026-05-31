# Painel de Rolagem de Opções

Aplicação Angular para gerenciamento de rolagem de vencimentos de opções.

## 🚀 Quick Start

### Com Docker (Recomendado)

```bash
# Iniciar a aplicação
docker-compose up -d

# Acessar em http://localhost
```

### Sem Docker

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
ng serve

# Acessar em http://localhost:4200
```

## 📋 Pré-requisitos

- Node.js 18+
- npm 9+
- Angular CLI 17+
- (Opcional) Docker 20.10+ e Docker Compose 2.0+

## 🛠️ Desenvolvimento

### Servidor de Desenvolvimento

```bash
ng serve
# Acessa em http://localhost:4200
# A aplicação recarrega automaticamente ao salvar arquivos
```

### Build para Produção

```bash
ng build --configuration production
# Artifacts salvos em dist/painel-opcoes
```

### Testes Unitários

```bash
ng test
# Executa testes via Karma
```

### Linting

```bash
ng lint
# Valida código com ESLint
```

## 🐳 Docker

Para instruções detalhadas sobre Docker, veja [DOCKER.md](./DOCKER.md).

```bash
# Build da imagem
docker build -t painel-opcoes:latest .

# Executar com Docker Compose
docker-compose up -d

# Parar
docker-compose down
```

## 📁 Estrutura do Projeto

```
src/
├── app/
│   ├── components/
│   │   └── painel-rolagem/
│   ├── models/
│   ├── services/
│   └── app.component.*
├── assets/
├── styles/
└── main.ts

dist/
└── painel-opcoes/  # Build de produção

docs/
├── ajuste-botao-buscar/  # Documentação de features
└── ...
```

## 📚 Documentação

- [DOCKER.md](./DOCKER.md) - Guia completo de Docker
- [docs/](./docs/) - Documentação técnica e de features

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

Para produção, use `src/environments/environment.prod.ts`.

## 🚀 Deploy

### Docker

```bash
# Build da imagem
docker build -t painel-opcoes:latest .

# Push para registro (Docker Hub, ECR, etc.)
docker tag painel-opcoes:latest seu-registro/painel-opcoes:latest
docker push seu-registro/painel-opcoes:latest

# Deploy com Docker Compose
docker-compose up -d
```

### Nginx (Standalone)

```bash
# Build
ng build --configuration production

# Copiar dist para servidor Nginx
cp -r dist/painel-opcoes/* /var/www/painel-opcoes/
```

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Commit suas mudanças: `git commit -m "feat: descrição"`
3. Push: `git push origin feature/sua-feature`
4. Abra um Pull Request

## 📝 Convenções

- **Idioma**: Português (BR) para código, commits e documentação
- **Commits**: Use conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- **TypeScript**: Type-safe, sem `any`, use `readonly`
- **Components**: Use `ChangeDetectionStrategy.OnPush`
- **Services**: Lógica de negócio em services, não em componentes

## 📄 Licença

MIT

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.
