# 🚀 Guia de Configuração Local - MetaDex

Este guia explica como configurar e rodar o MetaDex na sua máquina local para desenvolvimento.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **pnpm** ([Instalação](https://pnpm.io/installation))
- **MySQL** 8+ ou **TiDB** ([MySQL Download](https://dev.mysql.com/downloads/mysql/) | [TiDB Cloud](https://tidbcloud.com/))
- **Git** ([Download](https://git-scm.com/))

## 🔧 Passo 1: Clonar o Repositório

```bash
git clone https://github.com/viniciusalbino/metadex.git
cd metadex
```

## 📦 Passo 2: Instalar Dependências

```bash
pnpm install
```

## 🗄️ Passo 3: Configurar Banco de Dados

### Opção A: MySQL Local

1. **Instalar MySQL** (se ainda não tiver)

2. **Criar o banco de dados**:
```bash
mysql -u root -p
```

```sql
CREATE DATABASE metadex CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'metadex_user'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON metadex.* TO 'metadex_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

3. **String de conexão**:
```
mysql://metadex_user:sua_senha_segura@localhost:3306/metadex
```

### Opção B: TiDB Cloud (Recomendado para desenvolvimento)

1. Acesse [TiDB Cloud](https://tidbcloud.com/)
2. Crie uma conta gratuita
3. Crie um cluster (tier gratuito disponível)
4. Copie a string de conexão fornecida

### Opção C: Docker (MySQL em container)

```bash
docker run -d \
  --name metadex-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=metadex \
  -e MYSQL_USER=metadex_user \
  -e MYSQL_PASSWORD=metadex_pass \
  -p 3306:3306 \
  mysql:8.0
```

String de conexão:
```
mysql://metadex_user:metadex_pass@localhost:3306/metadex
```

## 🔐 Passo 4: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Se o arquivo `.env.example` não existir, crie o `.env` com o seguinte conteúdo:

```env
# Database
DATABASE_URL=mysql://metadex_user:sua_senha@localhost:3306/metadex

# JWT Secret (gere uma chave aleatória segura)
JWT_SECRET=sua-chave-secreta-muito-segura-aqui-min-32-chars

# App URL (para desenvolvimento local)
APP_URL=http://localhost:3000

# Email Service (opcional para desenvolvimento)
# SENDGRID_API_KEY=SG.xxxxxxxxxxxxx

# Google OAuth (opcional)
# GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
# GOOGLE_CLIENT_SECRET=seu-client-secret

# Cloudflare Turnstile (opcional)
# TURNSTILE_SECRET_KEY=0x4AAAAAAxxxxxxxxxxxxxxxxx
# VITE_TURNSTILE_SITE_KEY=0x4AAAAAAxxxxxxxxxxxxxxxxx

# App Branding
VITE_APP_TITLE=MetaDex
VITE_APP_LOGO=/metadex_logo.png
```

### Gerar JWT Secret

Use um dos métodos abaixo para gerar uma chave segura:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32

# Online
# https://generate-secret.vercel.app/32
```

## 🗃️ Passo 5: Executar Migrações do Banco de Dados

```bash
pnpm db:push
```

Este comando irá:
1. Gerar as migrações SQL baseadas no schema
2. Aplicar as migrações no banco de dados

Você verá uma saída similar a:
```
✓ Your SQL migration file ➜ drizzle/0001_xxx.sql 🚀
✓ migrations applied successfully!
```

## 🌱 Passo 6: Popular Banco com Dados de Exemplo (Opcional)

Para facilitar o desenvolvimento, você pode popular o banco com dados de exemplo:

```bash
npx tsx scripts/seed.ts
```

Isso criará:
- 8 arquétipos de exemplo (Charizard ex, Lugia VSTAR, etc)
- 3 torneios de exemplo
- Dados de metagame

## 🚀 Passo 7: Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

O servidor iniciará em:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend**: http://localhost:3000 (Express + tRPC)

## ✅ Passo 8: Testar a Aplicação

1. Acesse http://localhost:5173
2. Clique em "Criar Conta Grátis" ou "Entrar"
3. Crie uma conta de teste
4. Verifique o console do servidor para ver o link de verificação de email
5. Copie o token e acesse: http://localhost:5173/verify-email?token=SEU_TOKEN

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento (frontend + backend)

# Banco de Dados
pnpm db:push          # Aplica migrações no banco de dados
pnpm db:studio        # Abre Drizzle Studio (GUI para visualizar o banco)

# Build
pnpm build            # Compila para produção
pnpm start            # Inicia servidor de produção

# Linting e Formatação
pnpm lint             # Verifica código com ESLint
pnpm format           # Formata código com Prettier

# Testes
pnpm test             # Executa testes (se configurado)
```

## 🔍 Estrutura do Projeto

```
metadex/
├── client/                 # Frontend (React + Vite)
│   ├── public/            # Assets estáticos
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── lib/           # Utilitários (tRPC client)
│   │   └── App.tsx        # Componente raiz
│   └── index.html
│
├── server/                # Backend (Express + tRPC)
│   ├── _core/            # Core do servidor (não editar)
│   ├── auth.ts           # Lógica de autenticação
│   ├── db.ts             # Helpers de banco de dados
│   ├── email.ts          # Sistema de emails
│   ├── routers.ts        # Routers tRPC
│   └── authRouters.ts    # Routers de autenticação
│
├── drizzle/              # Schema e migrações do banco
│   ├── schema.ts         # Definição das tabelas
│   └── migrations/       # Arquivos de migração SQL
│
├── shared/               # Código compartilhado
│   └── const.ts          # Constantes
│
├── scripts/              # Scripts utilitários
│   └── seed.ts           # Popular banco com dados
│
└── .env                  # Variáveis de ambiente (não commitado)
```

## 🐛 Troubleshooting

### Erro: "Cannot connect to database"

**Solução**:
1. Verifique se o MySQL está rodando: `mysql -u root -p`
2. Confirme a string de conexão no `.env`
3. Teste a conexão: `mysql -u metadex_user -p -h localhost metadex`

### Erro: "Port 3000 already in use"

**Solução**:
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Erro: "Module not found"

**Solução**:
```bash
# Limpar cache e reinstalar
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro: "Email verification not working"

**Solução**:
Durante o desenvolvimento, os emails não são enviados de verdade. O link de verificação aparece no console do servidor. Copie o token e acesse manualmente:

```
[Email] Sending email to: usuario@exemplo.com
[Email] HTML: ...?token=abc123def456...
```

Acesse: `http://localhost:5173/verify-email?token=abc123def456`

### Erro: "JWT token invalid"

**Solução**:
1. Limpe os cookies do navegador
2. Verifique se `JWT_SECRET` está definido no `.env`
3. Faça logout e login novamente

## 🔄 Workflow de Desenvolvimento

### 1. Criar uma nova feature

```bash
git checkout -b feature/minha-feature
```

### 2. Fazer alterações

- Backend: Edite `server/routers.ts` ou crie novos arquivos
- Frontend: Edite componentes em `client/src/`
- Schema: Edite `drizzle/schema.ts` e rode `pnpm db:push`

### 3. Testar localmente

```bash
pnpm dev
```

### 4. Commit e push

```bash
git add .
git commit -m "feat: minha nova feature"
git push origin feature/minha-feature
```

## 🚢 Deploy para Produção

Veja o arquivo `DEPLOYMENT.md` para instruções de deploy na plataforma Manus ou outras plataformas.

## 📚 Recursos Adicionais

- [Documentação do tRPC](https://trpc.io/)
- [Documentação do Drizzle ORM](https://orm.drizzle.team/)
- [Documentação do React](https://react.dev/)
- [Documentação do Vite](https://vitejs.dev/)

## 🆘 Precisa de Ajuda?

- Consulte o `README.md` principal
- Veja `AUTH_SETUP.md` para configuração de autenticação
- Abra uma issue no GitHub
- Entre em contato com a equipe

---

**Boa sorte com o desenvolvimento! 🎮🔥**

