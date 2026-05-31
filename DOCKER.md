# 🐳 Docker - Painel de Rolagem de Opções

Este documento descreve como usar Docker para executar a aplicação Painel de Rolagem de Opções.

## 📋 Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- (Opcional) Docker Desktop para Windows/Mac

## 🚀 Quick Start

### Com Docker Compose (Recomendado)

```bash
# Iniciar a aplicação
docker-compose up -d

# Acessar a aplicação
# http://localhost

# Parar a aplicação
docker-compose down
```

### Build Manual

```bash
# Build da imagem
docker build -t painel-opcoes:latest .

# Executar container
docker run -p 80:80 painel-opcoes:latest

# Acessar a aplicação
# http://localhost
```

## 📁 Arquivos Docker

### `Dockerfile`

Multi-stage build com 2 estágios:

1. **Builder Stage** (Node.js 18-alpine)
   - Instala dependências com `npm ci`
   - Compila a aplicação com `ng build`
   - Gera arquivos estáticos em `dist/painel-opcoes`

2. **Runtime Stage** (Nginx 1.25-alpine)
   - Copia arquivos build do stage anterior
   - Configura Nginx para servir a SPA (Single Page Application)
   - Expõe porta 80
   - Inclui health check

**Benefícios**:
- ✅ Imagem final pequena (~50MB)
- ✅ Sem dependências de build em produção
- ✅ Seguro (apenas Nginx rodando)
- ✅ Rápido (build otimizado)

### `docker-compose.yml`

Orquestra a aplicação com:

- **Serviço**: `painel-opcoes`
- **Porta**: 80 (mapeado para localhost:80)
- **Health Check**: Valida se a aplicação está respondendo
- **Restart Policy**: `unless-stopped` (reinicia automaticamente)
- **Network**: `painel-network` (bridge)

### `nginx.conf`

Configuração customizada do Nginx:

- **Gzip Compression**: Comprime assets (JS, CSS, JSON)
- **Cache Control**: 
  - Assets (JS, CSS, imagens): 1 ano
  - HTML: sem cache (sempre atualizado)
- **SPA Routing**: Redireciona todas as rotas para `index.html`
- **Security**: Nega acesso a arquivos sensíveis (`.git`, `~`)

### `.dockerignore`

Otimiza o build excluindo:
- `node_modules` (reinstalado no container)
- `.git` (não necessário em produção)
- `dist` (reconstruído no container)
- Arquivos de teste (`.spec.ts`)
- Documentação (`docs/`, `README.md`)

## 🔧 Configuração

### Variáveis de Ambiente

Se necessário usar variáveis de ambiente, crie um arquivo `.env`:

```bash
# .env
NODE_ENV=production
```

Depois, atualize o `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
```

### Portas

Por padrão, a aplicação é servida na porta **80**. Para mudar:

```yaml
# docker-compose.yml
ports:
  - "8080:80"  # Acessa em http://localhost:8080
```

### Volumes

Para desenvolvimento com hot-reload (opcional):

```yaml
# docker-compose.yml
volumes:
  - ./src:/app/src
  - ./angular.json:/app/angular.json
```

## 📊 Comandos Úteis

### Iniciar/Parar

```bash
# Iniciar em background
docker-compose up -d

# Parar
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Ver logs
docker-compose logs -f painel-opcoes

# Reiniciar
docker-compose restart
```

### Build

```bash
# Build da imagem
docker-compose build

# Build sem cache
docker-compose build --no-cache

# Build da imagem manualmente
docker build -t painel-opcoes:latest .
```

### Verificação

```bash
# Status dos containers
docker-compose ps

# Inspecionar container
docker inspect painel-opcoes-app

# Acessar shell do container
docker exec -it painel-opcoes-app sh

# Testar health check
curl http://localhost/index.html
```

## 🧪 Testes

### Validar Build

```bash
# Build local
docker build -t painel-opcoes:test .

# Verificar imagem
docker images | grep painel-opcoes

# Inspecionar imagem
docker inspect painel-opcoes:test
```

### Validar Execução

```bash
# Iniciar
docker-compose up -d

# Aguardar health check (5-10 segundos)
sleep 10

# Testar aplicação
curl http://localhost/index.html

# Verificar status
docker-compose ps

# Parar
docker-compose down
```

## 📈 Performance

### Tamanho da Imagem

```bash
# Ver tamanho
docker images painel-opcoes

# Exemplo:
# painel-opcoes  latest  abc123  2 days ago  52MB
```

### Otimizações Implementadas

1. **Multi-stage build**: Reduz tamanho final em ~70%
2. **Alpine Linux**: Base mínima (~5MB)
3. **npm ci**: Mais rápido e confiável que `npm install`
4. **Gzip Compression**: Reduz transferência de assets em ~60%
5. **Cache Control**: Browsers fazem cache de assets

## 🔒 Segurança

### Boas Práticas Implementadas

- ✅ Sem root user (Nginx roda como `nginx`)
- ✅ Sem secrets em imagem (use variáveis de ambiente)
- ✅ Sem arquivos sensíveis (`.git`, `node_modules`)
- ✅ Health check ativo
- ✅ Nginx com proteção contra path traversal

### Recomendações

1. **Não commitar** `.env` com secrets
2. **Usar** variáveis de ambiente para configurações sensíveis
3. **Validar** imagens com `docker scan painel-opcoes:latest`
4. **Manter** imagem base atualizada (Node.js, Nginx)

## 🐛 Troubleshooting

### Porta já em uso

```bash
# Encontrar processo na porta 80
lsof -i :80

# Mudar porta no docker-compose.yml
ports:
  - "8080:80"
```

### Health check falhando

```bash
# Ver logs
docker-compose logs painel-opcoes

# Testar manualmente
curl -v http://localhost/index.html

# Aumentar timeout no docker-compose.yml
healthcheck:
  timeout: 10s
```

### Build falhando

```bash
# Build sem cache
docker-compose build --no-cache

# Ver logs detalhados
docker build --progress=plain -t painel-opcoes:test .
```

### Container não inicia

```bash
# Ver logs
docker-compose logs painel-opcoes

# Inspecionar imagem
docker inspect painel-opcoes-app

# Verificar recursos (CPU, memória)
docker stats
```

## 📚 Referências

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Angular Docker Guide](https://angular.io/guide/deployment)

## 🔄 Próximos Passos

1. Testar build local: `docker build -t painel-opcoes:test .`
2. Testar execução: `docker-compose up -d`
3. Validar em `http://localhost`
4. Integrar em CI/CD (GitHub Actions, GitLab CI, etc.)
5. Deploy em produção (Docker Hub, AWS ECR, etc.)
