import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// Organizer or admin procedure
const organizerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "organizer" && ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Organizer or admin access required",
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  tournaments: router({
    list: publicProcedure
      .input(
        z
          .object({
            status: z.string().optional(),
            format: z.string().optional(),
            country: z.string().optional(),
            limit: z.number().optional(),
            offset: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return await db.getTournaments(input);
      }),

    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      const tournament = await db.getTournamentById(input);
      if (!tournament) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Tournament not found" });
      }
      return tournament;
    }),

    create: organizerProcedure
      .input(
        z.object({
          name: z.string(),
          date: z.date(),
          country: z.string().optional(),
          city: z.string().optional(),
          format: z.string(),
          eventType: z.string().optional(),
          playerCount: z.number().optional(),
          externalUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.createTournament({
          ...input,
          status: "pending_approval",
          source: "user_submitted",
          submittedBy: ctx.user.id,
        });
        return { success: true };
      }),

    approve: adminProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
      await db.updateTournament(input, {
        status: "upcoming",
        approvedBy: ctx.user.id,
        approvedAt: new Date(),
      });
      return { success: true };
    }),

    reject: adminProcedure.input(z.number()).mutation(async ({ input }) => {
      // For now, we'll just delete rejected tournaments
      // Could add a "rejected" status if needed
      await db.updateTournament(input, {
        status: "completed", // Mark as completed to hide from pending
      });
      return { success: true };
    }),

    pending: adminProcedure.query(async () => {
      return await db.getPendingTournaments();
    }),
  }),

  archetypes: router({
    list: publicProcedure.query(async () => {
      return await db.getArchetypes();
    }),

    getById: publicProcedure.input(z.number()).query(async ({ input }) => {
      const archetype = await db.getArchetypeById(input);
      if (!archetype) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Archetype not found" });
      }
      return archetype;
    }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string(),
          displayName: z.string(),
          description: z.string().optional(),
          iconUrl: z.string().optional(),
          primaryCards: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await db.createArchetype(input);
        return { success: true };
      }),
  }),

  decks: router({
    myDecks: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserDecks(ctx.user.id);
    }),

    getById: publicProcedure.input(z.number()).query(async ({ input, ctx }) => {
      const deck = await db.getDeckById(input);
      if (!deck) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deck not found" });
      }

      // Check if user has access to this deck
      if (!deck.isPublic && (!ctx.user || deck.userId !== ctx.user.id)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      return deck;
    }),

    getByShareToken: publicProcedure.input(z.string()).query(async ({ input }) => {
      const deck = await db.getDeckByShareToken(input);
      if (!deck) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deck not found" });
      }
      return deck;
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          format: z.string(),
          decklist: z.string(), // JSON string
          decklistText: z.string().optional(),
          archetypeId: z.number().optional(),
          isPublic: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        // Generate share token if public
        const shareToken = input.isPublic
          ? Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15)
          : undefined;

        await db.createDeck({
          ...input,
          userId: ctx.user.id,
          isPublic: input.isPublic ? 1 : 0,
          shareToken,
        });

        return { success: true, shareToken };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          format: z.string().optional(),
          decklist: z.string().optional(),
          decklistText: z.string().optional(),
          archetypeId: z.number().optional(),
          isPublic: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const deck = await db.getDeckById(input.id);
        if (!deck || deck.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        const { id, ...updates } = input;
        const updateData: any = { ...updates };

        if (updates.isPublic !== undefined) {
          updateData.isPublic = updates.isPublic ? 1 : 0;
          // Generate share token if making public
          if (updates.isPublic && !deck.shareToken) {
            updateData.shareToken =
              Math.random().toString(36).substring(2, 15) +
              Math.random().toString(36).substring(2, 15);
          }
        }

        await db.updateDeck(id, updateData);
        return { success: true };
      }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
      const deck = await db.getDeckById(input);
      if (!deck || deck.userId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      await db.deleteDeck(input);
      return { success: true };
    }),

    parsePTCGL: publicProcedure.input(z.string()).mutation(async ({ input }) => {
      // Parse PTCGL format decklist
      // Format: "Quantity CardName SetCode CardNumber"
      // Example: "4 Charizard ex OBF 125"

      const lines = input.trim().split("\n");
      const cards: Array<{ quantity: number; name: string; setCode?: string; number?: string }> =
        [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("#")) continue;

        const match = trimmed.match(/^(\d+)\s+(.+?)(?:\s+([A-Z]{2,})\s+(\d+))?$/);
        if (match) {
          const [, quantity, name, setCode, number] = match;
          cards.push({
            quantity: parseInt(quantity),
            name: name.trim(),
            setCode,
            number,
          });
        }
      }

      return { cards, totalCards: cards.reduce((sum, c) => sum + c.quantity, 0) };
    }),

    exportPTCGL: publicProcedure.input(z.number()).query(async ({ input, ctx }) => {
      const deck = await db.getDeckById(input);
      if (!deck) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deck not found" });
      }

      if (!deck.isPublic && (!ctx.user || deck.userId !== ctx.user.id)) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
      }

      // Return the stored PTCGL text or generate from decklist
      if (deck.decklistText) {
        return { text: deck.decklistText };
      }

      // Generate from JSON decklist
      const cards = JSON.parse(deck.decklist);
      const lines = cards.map((card: any) => {
        if (card.setCode && card.number) {
          return `${card.quantity} ${card.name} ${card.setCode} ${card.number}`;
        }
        return `${card.quantity} ${card.name}`;
      });

      return { text: lines.join("\n") };
    }),
  }),

  battleLog: router({
    myLogs: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserBattleLogs(ctx.user.id, input?.limit);
      }),

    create: protectedProcedure
      .input(
        z.object({
          myDeckId: z.number().optional(),
          myArchetypeId: z.number().optional(),
          opponentArchetypeId: z.number(),
          result: z.enum(["win", "loss", "draw"]),
          notes: z.string().optional(),
          playedAt: z.date().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.createBattleLog({
          ...input,
          userId: ctx.user.id,
          playedAt: input.playedAt || new Date(),
        });
        return { success: true };
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserStats(ctx.user.id);
    }),
  }),

  metagame: router({
    snapshots: publicProcedure
      .input(
        z
          .object({
            format: z.string().optional(),
            period: z.string().optional(),
            limit: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return await db.getMetagameSnapshots(input);
      }),

    matchupMatrix: publicProcedure
      .input(
        z
          .object({
            format: z.string().optional(),
            period: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return await db.getMatchupMatrix(input);
      }),
  }),

  cards: router({
    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.searchCards(input.query, input.limit);
      }),

    getById: publicProcedure.input(z.string()).query(async ({ input }) => {
      const card = await db.getCardById(input);
      if (!card) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Card not found" });
      }
      return card;
    }),
  }),
});

export type AppRouter = typeof appRouter;

