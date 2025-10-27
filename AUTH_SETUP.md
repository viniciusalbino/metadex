# Configuração do Sistema de Autenticação

O MetaDex possui um sistema de autenticação completo com suporte para:
- ✅ Cadastro e login com email/senha
- ✅ Verificação de email
- ⏳ Login com Google OAuth (preparado, precisa configurar)
- ⏳ Proteção contra bots com Cloudflare Turnstile (preparado, precisa configurar)

## 📧 Configuração de Email

O sistema de envio de emails está implementado mas usa um placeholder que apenas loga no console. Para ativar o envio real de emails, você precisa configurar um serviço de email.

### Opções Recomendadas:

#### 1. SendGrid (Recomendado)
```bash
npm install @sendgrid/mail
```

Edite `server/email.ts` e adicione:
```typescript
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    await sgMail.send({
      to: options.to,
      from: 'noreply@metadex.com', // Use seu domínio verificado
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error('[Email] Failed to send:', error);
    return false;
  }
}
```

Adicione ao `.env`:
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
APP_URL=https://seu-dominio.com
```

#### 2. AWS SES
```bash
npm install @aws-sdk/client-ses
```

#### 3. Resend
```bash
npm install resend
```

## 🔐 Google OAuth

Para ativar o login com Google:

### 1. Criar Projeto no Google Cloud Console

1. Acesse https://console.cloud.google.com
2. Crie um novo projeto ou selecione um existente
3. Vá em "APIs & Services" > "Credentials"
4. Clique em "Create Credentials" > "OAuth 2.0 Client ID"
5. Configure a tela de consentimento OAuth
6. Crie as credenciais:
   - Application type: Web application
   - Authorized redirect URIs: `https://seu-dominio.com/api/auth/google/callback`

### 2. Configurar Variáveis de Ambiente

Adicione ao `.env`:
```
GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=seu-client-secret
```

### 3. Implementar o Callback

Edite `server/authRouters.ts` e implemente o `googleAuth` mutation:

```typescript
googleAuth: publicProcedure
  .input(z.object({ code: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // 1. Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: input.code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.APP_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenResponse.json();

    // 2. Get user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userInfoResponse.json();

    // 3. Create or update user
    let user = await db.getUserByGoogleId(googleUser.id);

    if (!user) {
      user = await db.getUserByEmail(googleUser.email);
      if (user) {
        // Link Google account to existing user
        await db.updateUser(user.id, { googleId: googleUser.id });
      } else {
        // Create new user
        await db.createUser({
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id,
          emailVerified: new Date(), // Google emails are already verified
          role: 'user',
        });
        user = await db.getUserByEmail(googleUser.email);
      }
    }

    if (!user) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });

    // 4. Generate JWT and set cookie
    const token = auth.generateToken({
      userId: user.id,
      email: user.email,
    });

    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

    return { success: true, user };
  }),
```

### 4. Frontend

Edite `client/src/pages/Auth.tsx` e implemente `handleGoogleLogin`:

```typescript
const handleGoogleLogin = () => {
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: `${window.location.origin}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
  })}`;

  window.location.href = googleAuthUrl;
};
```

Adicione ao `.env` do cliente:
```
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

## 🛡️ Cloudflare Turnstile

Para ativar a proteção contra bots:

### 1. Obter Chaves

1. Acesse https://dash.cloudflare.com
2. Vá em "Turnstile"
3. Crie um novo site
4. Copie a **Site Key** e **Secret Key**

### 2. Configurar Variáveis de Ambiente

Adicione ao `.env`:
```
TURNSTILE_SECRET_KEY=0x4AAAAAAxxxxxxxxxxxxxxxxx
```

Adicione ao `.env` do cliente:
```
VITE_TURNSTILE_SITE_KEY=0x4AAAAAAxxxxxxxxxxxxxxxxx
```

### 3. Adicionar Widget no Frontend

Instale o pacote:
```bash
npm install @marsidev/react-turnstile
```

Edite `client/src/pages/Auth.tsx`:

```typescript
import Turnstile from '@marsidev/react-turnstile';

// No formulário de registro:
const [turnstileToken, setTurnstileToken] = useState<string>('');

<Turnstile
  siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
  onSuccess={(token) => setTurnstileToken(token)}
/>

// Ao fazer o submit:
await registerMutation.mutateAsync({
  name: registerName,
  email: registerEmail,
  password: registerPassword,
  turnstileToken, // Enviar o token
});
```

### 4. Verificar no Backend

Edite `server/authRouters.ts` e implemente a verificação:

```typescript
async function verifyTurnstile(token: string): Promise<boolean> {
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
    }),
  });

  const data = await response.json();
  return data.success;
}

// No mutation de register:
if (input.turnstileToken) {
  const isValid = await verifyTurnstile(input.turnstileToken);
  if (!isValid) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Verificação de segurança falhou",
    });
  }
}
```

## 🧪 Testando o Sistema

### 1. Cadastro com Email

1. Acesse `/auth`
2. Vá para a aba "Cadastro"
3. Preencha nome, email e senha
4. Clique em "Criar Conta"
5. Verifique o console do servidor para ver o link de verificação
6. Copie o token do link e acesse `/verify-email?token=SEU_TOKEN`
7. Faça login com as credenciais

### 2. Login

1. Acesse `/auth`
2. Preencha email e senha
3. Clique em "Entrar"

### 3. Verificação de Email

Enquanto o serviço de email não estiver configurado, os links de verificação aparecerão no console do servidor:

```
[Email] Sending email to: usuario@exemplo.com
[Email] Subject: Verifique seu email - MetaDex
[Email] HTML: ... (contém o link de verificação)
```

Copie o token do link e acesse manualmente.

## 🔒 Segurança

### Senhas

- Senhas são hasheadas com bcrypt (10 rounds)
- Validação: mínimo 8 caracteres, maiúsculas, minúsculas e números

### JWT Tokens

- Tokens expiram em 7 dias
- Secret key definida em `JWT_SECRET` (env)
- Armazenados em cookies HTTP-only

### Proteção CSRF

Os cookies usam `sameSite: 'lax'` para proteção básica contra CSRF.

## 📝 Próximos Passos

1. ✅ Configurar serviço de email (SendGrid, AWS SES, etc)
2. ⏳ Implementar Google OAuth completo
3. ⏳ Adicionar Cloudflare Turnstile
4. ⏳ Implementar "Esqueci minha senha"
5. ⏳ Adicionar rate limiting para prevenir ataques de força bruta
6. ⏳ Implementar 2FA (autenticação de dois fatores)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique se todas as variáveis de ambiente estão configuradas
2. Verifique os logs do servidor para erros
3. Teste os endpoints diretamente via tRPC
4. Consulte a documentação dos serviços (Google, SendGrid, Cloudflare)

