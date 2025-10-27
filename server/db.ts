import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  tournaments,
  archetypes,
  decks,
  battleLogs,
  metagameSnapshots,
} from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(users).values(user);
  return result;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByGoogleId(googleId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.googleId, googleId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByVerificationToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(users)
    .where(eq(users.emailVerificationToken, token))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(data).where(eq(users.id, id));
}

export async function verifyUserEmail(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(users)
    .set({
      emailVerified: new Date(),
      emailVerificationToken: null,
    })
    .where(eq(users.id, userId));
}

// ============================================================================
// TOURNAMENT OPERATIONS
// ============================================================================

export async function getTournaments(filters: {
  format?: string;
  status?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(tournaments);

  const conditions = [];
  if (filters.format) {
    conditions.push(eq(tournaments.format, filters.format));
  }
  if (filters.status) {
    conditions.push(eq(tournaments.status, filters.status as any));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  query = query.orderBy(desc(tournaments.date)) as any;

  if (filters.limit) {
    query = query.limit(filters.limit) as any;
  }

  return query;
}

export async function getTournamentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tournaments).where(eq(tournaments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createTournament(tournament: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tournaments).values(tournament);
  return result;
}

export async function updateTournament(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(tournaments).set(data).where(eq(tournaments.id, id));
}

// ============================================================================
// ARCHETYPE OPERATIONS
// ============================================================================

export async function getArchetypes() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(archetypes).orderBy(archetypes.displayName);
}

export async function getArchetypeById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(archetypes).where(eq(archetypes.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// DECK OPERATIONS
// ============================================================================

export async function getUserDecks(userId: number, limit?: number) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(decks).where(eq(decks.userId, userId)).orderBy(desc(decks.createdAt));

  if (limit) {
    query = query.limit(limit) as any;
  }

  return query;
}

export async function getDeckByShareToken(shareToken: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(decks)
    .where(and(eq(decks.shareToken, shareToken), eq(decks.isPublic, 1)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createDeck(deck: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(decks).values(deck);
  return result;
}

export async function updateDeck(id: number, userId: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(decks).set(data).where(and(eq(decks.id, id), eq(decks.userId, userId)));
}

export async function deleteDeck(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(decks).where(and(eq(decks.id, id), eq(decks.userId, userId)));
}

// ============================================================================
// BATTLE LOG OPERATIONS
// ============================================================================

export async function getUserBattleLogs(userId: number, limit?: number) {
  const db = await getDb();
  if (!db) return [];

  let query = db
    .select()
    .from(battleLogs)
    .where(eq(battleLogs.userId, userId))
    .orderBy(desc(battleLogs.playedAt));

  if (limit) {
    query = query.limit(limit) as any;
  }

  return query;
}

export async function createBattleLog(log: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(battleLogs).values(log);
  return result;
}

export async function getUserBattleStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const logs = await db.select().from(battleLogs).where(eq(battleLogs.userId, userId));

  const totalGames = logs.length;
  const wins = logs.filter((log) => log.result === "win").length;
  const losses = logs.filter((log) => log.result === "loss").length;
  const draws = logs.filter((log) => log.result === "draw").length;
  const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;

  return {
    totalGames,
    wins,
    losses,
    draws,
    winRate,
  };
}

// ============================================================================
// METAGAME OPERATIONS
// ============================================================================

export async function getMetagameSnapshots(filters: {
  format?: string;
  period?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(metagameSnapshots);

  const conditions = [];
  if (filters.format) {
    conditions.push(eq(metagameSnapshots.format, filters.format));
  }
  if (filters.period) {
    conditions.push(eq(metagameSnapshots.period, filters.period));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  query = query.orderBy(desc(metagameSnapshots.mri)) as any;

  if (filters.limit) {
    query = query.limit(filters.limit) as any;
  }

  return query;
}

