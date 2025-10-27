/**
 * Email service for sending verification emails
 * 
 * NOTE: This is a placeholder implementation.
 * In production, integrate with a real email service like:
 * - SendGrid
 * - AWS SES
 * - Resend
 * - Postmark
 */

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email
 * TODO: Replace with actual email service integration
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  console.log("[Email] Sending email to:", options.to);
  console.log("[Email] Subject:", options.subject);
  console.log("[Email] HTML:", options.html);

  // TODO: Integrate with real email service
  // Example with SendGrid:
  // const sgMail = require('@sendgrid/mail');
  // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  // await sgMail.send({
  //   to: options.to,
  //   from: 'noreply@metadex.com',
  //   subject: options.subject,
  //   html: options.html,
  // });

  // For now, just log to console
  return true;
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  verificationToken: string
): Promise<boolean> {
  const verificationUrl = `${process.env.APP_URL || "http://localhost:3000"}/verify-email?token=${verificationToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #3B82F6;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          background-color: #3B82F6;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MetaDex</h1>
        </div>
        <div class="content">
          <h2>Bem-vindo ao MetaDex, ${name}!</h2>
          <p>Obrigado por se cadastrar. Para ativar sua conta, por favor verifique seu endereço de email clicando no botão abaixo:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verificar Email</a>
          </div>
          
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; color: #3B82F6;">${verificationUrl}</p>
          
          <p>Este link expira em 24 horas.</p>
          
          <p>Se você não criou uma conta no MetaDex, por favor ignore este email.</p>
        </div>
        <div class="footer">
          <p>© 2025 MetaDex. Todos os direitos reservados.</p>
          <p>Pokémon TCG é marca registrada da The Pokémon Company.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Verifique seu email - MetaDex",
    html,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<boolean> {
  const resetUrl = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background-color: #3B82F6;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          background-color: #f9fafb;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .button {
          display: inline-block;
          background-color: #3B82F6;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MetaDex</h1>
        </div>
        <div class="content">
          <h2>Redefinir Senha</h2>
          <p>Olá ${name},</p>
          <p>Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo para criar uma nova senha:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Redefinir Senha</a>
          </div>
          
          <p>Ou copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; color: #3B82F6;">${resetUrl}</p>
          
          <p>Este link expira em 1 hora.</p>
          
          <p>Se você não solicitou a redefinição de senha, por favor ignore este email. Sua senha permanecerá inalterada.</p>
        </div>
        <div class="footer">
          <p>© 2025 MetaDex. Todos os direitos reservados.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Redefinir senha - MetaDex",
    html,
  });
}

