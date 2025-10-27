# Guia de Deployment - MetaDex

Este documento descreve como fazer o deploy do MetaDex em produção.

## 🚀 Deploy na Plataforma Manus

O MetaDex foi desenvolvido na plataforma Manus e pode ser facilmente publicado através da interface web.

### Passo a Passo

1. **Criar Checkpoint**
   - Certifique-se de que todas as mudanças estão salvas
   - No painel de desenvolvimento, clique em "Save Checkpoint"
   - Adicione uma descrição clara das mudanças

2. **Publicar**
   - Clique no botão "Publish" no header do Management UI
   - O sistema irá fazer o deploy automático
   - Aguarde a confirmação de sucesso

3. **Configurar Domínio (Opcional)**
   - Acesse Settings → Domains no Management UI
   - Configure um domínio customizado ou use o domínio automático `.manus.space`

### Variáveis de Ambiente

As seguintes variáveis já estão configuradas automaticamente pela plataforma Manus:

- `DATABASE_URL` - String de conexão MySQL/TiDB
- `JWT_SECRET` - Segredo para assinatura de tokens
- `OAUTH_SERVER_URL` - URL do servidor OAuth
- `VITE_APP_ID` - ID da aplicação OAuth
- `VITE_OAUTH_PORTAL_URL` - URL do portal de login
- `OWNER_OPEN_ID` - ID do proprietário
- `OWNER_NAME` - Nome do proprietário
- `BUILT_IN_FORGE_API_URL` - URL das APIs internas
- `BUILT_IN_FORGE_API_KEY` - Chave das APIs internas

### Banco de Dados

O banco de dados é gerenciado automaticamente pela plataforma Manus. Para popular com dados iniciais:

```bash
npx tsx scripts/seed.ts
```

## 🐳 Deploy com Docker (Alternativo)

Se você preferir fazer deploy fora da plataforma Manus, pode usar Docker.

### Dockerfile

```dockerfile
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN corepack enable pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER expressjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - OAUTH_SERVER_URL=${OAUTH_SERVER_URL}
      - VITE_APP_ID=${VITE_APP_ID}
      # ... outras variáveis
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=root
      - MYSQL_DATABASE=metadex
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### Comandos

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

## ☁️ Deploy em Outras Plataformas

### Vercel

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

### Railway

1. Conecte seu repositório
2. Configure DATABASE_URL e outras variáveis
3. Deploy automático

### Render

1. Crie um novo Web Service
2. Conecte o repositório
3. Configure variáveis de ambiente
4. Deploy

## 🔧 Configurações Pós-Deploy

### 1. Popular Banco de Dados

Após o primeiro deploy, execute o script de seed:

```bash
npx tsx scripts/seed.ts
```

### 2. Configurar Primeiro Admin

O proprietário (definido em `OWNER_OPEN_ID`) automaticamente recebe role de admin no primeiro login.

Para promover outros usuários a admin, execute SQL diretamente:

```sql
UPDATE users SET role = 'admin' WHERE email = 'usuario@email.com';
```

### 3. Configurar Organizers

Para aprovar lojistas como organizers:

```sql
UPDATE users SET role = 'organizer' WHERE email = 'lojista@email.com';
```

## 📊 Monitoramento

### Logs

- Acesse os logs através do Management UI → Dashboard
- Ou use `docker-compose logs` se estiver usando Docker

### Analytics

O sistema já possui analytics integrado via variáveis:
- `VITE_ANALYTICS_ENDPOINT`
- `VITE_ANALYTICS_WEBSITE_ID`

### Database

Acesse o banco de dados através do Management UI → Database para:
- Ver dados em tempo real
- Executar queries SQL
- Fazer backup

## 🔒 Segurança

### Checklist Pré-Deploy

- [ ] Todas as variáveis de ambiente estão configuradas
- [ ] JWT_SECRET é forte e único
- [ ] DATABASE_URL usa SSL
- [ ] CORS está configurado corretamente
- [ ] Rate limiting está ativo
- [ ] Logs sensíveis foram removidos

### Backup

Recomendamos fazer backup regular do banco de dados:

```bash
# MySQL dump
mysqldump -h HOST -u USER -p DATABASE > backup.sql

# Restore
mysql -h HOST -u USER -p DATABASE < backup.sql
```

## 🆘 Troubleshooting

### Erro de Conexão com Banco

1. Verifique DATABASE_URL
2. Confirme que o banco está acessível
3. Verifique SSL/TLS se necessário

### Erro de OAuth

1. Verifique OAUTH_SERVER_URL
2. Confirme VITE_APP_ID
3. Verifique redirect URI na configuração OAuth

### Build Falha

1. Limpe node_modules: `rm -rf node_modules && pnpm install`
2. Limpe cache: `pnpm clean`
3. Verifique versão do Node.js (22+)

## 📞 Suporte

Para problemas específicos da plataforma Manus, acesse:
- https://help.manus.im

Para issues do projeto:
- https://github.com/viniciusalbino/metadex/issues

