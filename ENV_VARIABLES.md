# Variáveis de Ambiente

Este documento lista todas as variáveis de ambiente necessárias para rodar o MetaDex.

## 🔐 Variáveis Obrigatórias

### DATABASE_URL
String de conexão com o banco de dados MySQL/TiDB.

**Formato**:
```
mysql://usuario:senha@host:porta/database
```

**Exemplos**:
```bash
# MySQL Local
DATABASE_URL=mysql://metadex_user:senha123@localhost:3306/metadex

# TiDB Cloud
DATABASE_URL=mysql://usuario.root:senha@gateway01.us-west-2.prod.aws.tidbcloud.com:4000/metadex?ssl={"rejectUnauthorized":true}

# Docker
DATABASE_URL=mysql://metadex_user:metadex_pass@localhost:3306/metadex
```

### JWT_SECRET
Chave secreta para assinar tokens JWT. **DEVE** ser uma string aleatória e segura.

**Como gerar**:
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

**Exemplo**:
```bash
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

### APP_URL
URL base da aplicação. Usado para gerar links de verificação de email.

**Exemplos**:
```bash
# Desenvolvimento local
APP_URL=http://localhost:3000

# Produção
APP_URL=https://metadex.com
```

## 📧 Variáveis de Email (Opcional)

### SENDGRID_API_KEY
Chave de API do SendGrid para envio de emails.

**Como obter**:
1. Crie uma conta em https://sendgrid.com
2. Vá em Settings > API Keys
3. Crie uma nova API Key

**Exemplo**:
```bash
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔐 Google OAuth (Opcional)

### GOOGLE_CLIENT_ID
Client ID do Google OAuth.

**Como obter**:
1. Acesse https://console.cloud.google.com
2. Crie um projeto
3. Vá em "APIs & Services" > "Credentials"
4. Crie "OAuth 2.0 Client ID"

**Exemplo**:
```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
```

### GOOGLE_CLIENT_SECRET
Client Secret do Google OAuth.

**Exemplo**:
```bash
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
```

## 🛡️ Cloudflare Turnstile (Opcional)

### TURNSTILE_SECRET_KEY
Chave secreta do Cloudflare Turnstile (backend).

**Como obter**:
1. Acesse https://dash.cloudflare.com
2. Vá em "Turnstile"
3. Crie um novo site
4. Copie a Secret Key

**Exemplo**:
```bash
TURNSTILE_SECRET_KEY=0x4AAAAAAxxxxxxxxxxxxxxxxx
```

### VITE_TURNSTILE_SITE_KEY
Chave pública do Cloudflare Turnstile (frontend).

**Exemplo**:
```bash
VITE_TURNSTILE_SITE_KEY=0x4AAAAAAxxxxxxxxxxxxxxxxx
```

## 🎨 Branding (Já Configurado)

### VITE_APP_TITLE
Título da aplicação exibido no navegador e interface.

**Padrão**: `MetaDex`

### VITE_APP_LOGO
URL ou caminho do logo da aplicação.

**Padrão**: `/metadex_logo.png`

## 📝 Como Configurar

### Desenvolvimento Local

1. Copie o arquivo de exemplo:
```bash
cp ENV_VARIABLES.md .env
```

2. Edite o arquivo `.env` e preencha as variáveis:
```bash
nano .env
# ou
code .env
```

3. **IMPORTANTE**: Nunca commite o arquivo `.env` no Git!

### Produção (Plataforma Manus)

As variáveis de ambiente são configuradas automaticamente pela plataforma. Para adicionar novas:

1. Acesse o painel de configurações do projeto
2. Vá em "Settings" > "Secrets"
3. Adicione as variáveis necessárias

### Docker

Passe as variáveis via `-e` ou arquivo `.env`:

```bash
docker run -d \
  -e DATABASE_URL=mysql://user:pass@host:3306/db \
  -e JWT_SECRET=your-secret \
  -e APP_URL=https://your-domain.com \
  -p 3000:3000 \
  metadex
```

## ⚠️ Segurança

### ❌ NÃO FAÇA:
- Commitar o arquivo `.env` no Git
- Compartilhar suas chaves secretas publicamente
- Usar a mesma `JWT_SECRET` em desenvolvimento e produção
- Deixar senhas fracas no banco de dados

### ✅ FAÇA:
- Use `.gitignore` para ignorar `.env`
- Gere chaves aleatórias fortes
- Use variáveis de ambiente diferentes por ambiente
- Rotacione chaves periodicamente em produção
- Use serviços de gerenciamento de secrets (AWS Secrets Manager, etc)

## 🔍 Verificar Variáveis

Para verificar se as variáveis estão configuradas corretamente:

```bash
# Ver variáveis (cuidado com logs públicos!)
node -e "console.log(process.env.DATABASE_URL)"

# Verificar se está definida
node -e "console.log(process.env.JWT_SECRET ? 'OK' : 'NOT SET')"
```

## 📚 Referências

- [12 Factor App - Config](https://12factor.net/config)
- [Node.js Environment Variables](https://nodejs.org/en/learn/command-line/how-to-read-environment-variables-from-nodejs)
- [dotenv Documentation](https://github.com/motdotla/dotenv)

