import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { authRouter } from "./authRouters";
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
  auth: authRouter,

  // ===========================================================================
  // TOURNAMENTS
  // ===========================================================================
  tournaments: router({
    list: publicProcedure
      .input(
        z
          .object({
            status: z.string().optional(),
            format: z.string().optional(),
            country: z.string().optional(),
            limit: z.number().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        return await db.getTournaments(input || {});
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
          format: z.string(),
          eventType: z.string().optional(),
          city: z.string().optional(),
          country: z.string().optional(),
          playerCount: z.number().optional(),
          externalUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.createTournament({
          ...input,
          source: "user_submitted",
          status: "pending",
          submittedBy: ctx.user.id,
        });
        return { success: true };
      }),

    approve: adminProcedure.input(z.number()).mutation(async ({ input }) => {
      await db.updateTournament(input, { status: "upcoming" });
      return { success: true };
    }),

    reject: adminProcedure.input(z.number()).mutation(async ({ input }) => {
      await db.updateTournament(input, { status: "rejected" });
      return { success: true };
    }),
  }),

  // ===========================================================================
  // ARCHETYPES
  // ===========================================================================
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
  }),

  // ===========================================================================
  // DECKS
  // ===========================================================================
  decks: router({
    myDecks: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserDecks(ctx.user.id, input?.limit);
      }),

    getByShareToken: publicProcedure.input(z.string()).query(async ({ input }) => {
      const deck = await db.getDeckByShareToken(input);
      if (!deck) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Deck not found or not public" });
      }
      return deck;
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          format: z.string(),
          decklist: z.string(),
          decklistText: z.string(),
          archetypeId: z.number().optional(),
          isPublic: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const shareToken = input.isPublic ? Math.random().toString(36).substring(2, 15) : null;

        await db.createDeck({
          ...input,
          userId: ctx.user.id,
          shareToken,
        });

        return { success: true, shareToken };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          decklist: z.string().optional(),
          decklistText: z.string().optional(),
          archetypeId: z.number().optional(),
          isPublic: z.boolean().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        await db.updateDeck(id, ctx.user.id, data);
        return { success: true };
      }),

    delete: protectedProcedure.input(z.number()).mutation(async ({ input, ctx }) => {
      await db.deleteDeck(input, ctx.user.id);
      return { success: true };
    }),

    parsePTCGL: publicProcedure.input(z.string()).mutation(async ({ input }) => {
      const lines = input.trim().split("\n");
      const cards: Array<{ quantity: number; name: string; set: string; number: string }> = [];
      let totalCards = 0;

      for (const line of lines) {
        const match = line.match(/^(\d+)\s+(.+?)\s+([A-Z0-9]+)\s+(\d+)$/);
        if (match) {
          const [, quantity, name, set, number] = match;
          const qty = parseInt(quantity);
          cards.push({ quantity: qty, name, set, number });
          totalCards += qty;
        }
      }

      return { cards, totalCards };
    }),
  }),

  // ===========================================================================
  // BATTLE LOG
  // ===========================================================================
  battleLog: router({
    myLogs: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ ctx, input }) => {
        return await db.getUserBattleLogs(ctx.user.id, input?.limit);
      }),

    create: protectedProcedure
      .input(
        z.object({
          opponentArchetypeId: z.number(),
          result: z.enum(["win", "loss", "draw"]),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        await db.createBattleLog({
          ...input,
          userId: ctx.user.id,
          playedAt: new Date(),
        });
        return { success: true };
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserBattleStats(ctx.user.id);
    }),
  }),

  // ===========================================================================
  // METAGAME
  // ===========================================================================
  metagame: router({
    snapshots: publicProcedure
      .input(
        z.object({
          format: z.string().optional(),
          period: z.string().optional(),
          limit: z.number().optional(),
        })
      )
      .query(async ({ input }) => {
        return await db.getMetagameSnapshots(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;

