import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import * as auth from "./auth";
import * as email from "./email";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

export const authRouter = router({
  /**
   * Register with email and password
   */
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        name: z.string().min(2),
        turnstileToken: z.string().optional(), // Cloudflare Turnstile token
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Validate email format
      if (!auth.isValidEmail(input.email)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email inválido",
        });
      }

      // Validate password strength
      if (!auth.isValidPassword(input.password)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Senha deve ter no mínimo 8 caracteres, incluindo maiúsculas, minúsculas e números",
        });
      }

      // TODO: Verify Cloudflare Turnstile token
      // if (input.turnstileToken) {
      //   const isValid = await verifyTurnstile(input.turnstileToken);
      //   if (!isValid) {
      //     throw new TRPCError({
      //       code: "BAD_REQUEST",
      //       message: "Verificação de segurança falhou",
      //     });
      //   }
      // }

      // Check if user already exists
      const existingUser = await db.getUserByEmail(input.email);
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Email já cadastrado",
        });
      }

      // Hash password
      const passwordHash = await auth.hashPassword(input.password);

      // Generate verification token
      const verificationToken = auth.generateVerificationToken();

      // Create user
      await db.createUser({
        email: input.email,
        name: input.name,
        passwordHash,
        emailVerificationToken: verificationToken,
        role: "user",
      });

      // Send verification email
      await email.sendVerificationEmail(input.email, input.name, verificationToken);

      return {
        success: true,
        message: "Cadastro realizado! Verifique seu email para ativar sua conta.",
      };
    }),

  /**
   * Login with email and password
   */
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
        turnstileToken: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Verify Cloudflare Turnstile token
      // if (input.turnstileToken) {
      //   const isValid = await verifyTurnstile(input.turnstileToken);
      //   if (!isValid) {
      //     throw new TRPCError({
      //       code: "BAD_REQUEST",
      //       message: "Verificação de segurança falhou",
      //     });
      //   }
      // }

      // Find user
      const user = await db.getUserByEmail(input.email);
      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      // Verify password
      const isValid = await auth.verifyPassword(input.password, user.passwordHash);
      if (!isValid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email ou senha incorretos",
        });
      }

      // Check if email is verified
      if (!user.emailVerified) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Por favor, verifique seu email antes de fazer login",
        });
      }

      // Update last signed in
      await db.updateUser(user.id, { lastSignedIn: new Date() });

      // Generate JWT token
      const token = auth.generateToken({
        userId: user.id,
        email: user.email,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

      return {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    }),

  /**
   * Verify email with token
   */
  verifyEmail: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.getUserByVerificationToken(input.token);

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Token de verificação inválido ou expirado",
        });
      }

      if (user.emailVerified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email já verificado",
        });
      }

      // Verify email
      await db.verifyUserEmail(user.id);

      return {
        success: true,
        message: "Email verificado com sucesso! Você já pode fazer login.",
      };
    }),

  /**
   * Resend verification email
   */
  resendVerification: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const user = await db.getUserByEmail(input.email);

      if (!user) {
        // Don't reveal if user exists or not
        return {
          success: true,
          message: "Se o email existir, um novo link de verificação será enviado.",
        };
      }

      if (user.emailVerified) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Email já verificado",
        });
      }

      // Generate new verification token
      const verificationToken = auth.generateVerificationToken();

      await db.updateUser(user.id, {
        emailVerificationToken: verificationToken,
      });

      // Send verification email
      await email.sendVerificationEmail(input.email, user.name || "Usuário", verificationToken);

      return {
        success: true,
        message: "Email de verificação reenviado!",
      };
    }),

  /**
   * Get current user
   */
  me: publicProcedure.query(({ ctx }) => {
    return ctx.user || null;
  }),

  /**
   * Logout
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),

  /**
   * Login with Google OAuth
   * TODO: Implement Google OAuth flow
   */
  googleAuth: publicProcedure
    .input(
      z.object({
        code: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // TODO: Implement Google OAuth
      // 1. Exchange code for tokens
      // 2. Get user info from Google
      // 3. Create or update user
      // 4. Generate JWT and set cookie

      throw new TRPCError({
        code: "NOT_IMPLEMENTED",
        message: "Google OAuth não implementado ainda. Configure as credenciais primeiro.",
      });
    }),
});

