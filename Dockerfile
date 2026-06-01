# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código-fonte
COPY . .

# Build da aplicação Angular
RUN npm run build

# Stage 2: Runtime
FROM nginx:1.25-alpine

# Remover configuração padrão que pode conflitar
RUN rm /etc/nginx/conf.d/default.conf

# Limpar o diretório html padrão
RUN rm -rf /usr/share/nginx/html/*

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar arquivos build do stage anterior (Angular 17+ coloca em browser/)
COPY --from=builder /app/dist/painel-opcoes/browser /usr/share/nginx/html

# Expor porta
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:4200/index.html || exit 1

# Iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
