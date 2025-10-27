import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  Archetype,
  archetypes,
  BattleLog,
  battleLogs,
  Card,
  cards,
  Deck,
  decks,
  InsertArchetype,
  InsertBattleLog,
  InsertCard,
  InsertDeck,
  InsertMatchupMatrix,
  InsertMetagameSnapshot,
  InsertTournament,
  InsertUser,
  MatchupMatrix,
  matchupMatrix,
  MetagameSnapshot,
  metagameSnapshots,
  Tournament,
  tournaments,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ TOURNAMENTS ============

export async function getTournaments(filters?: {
  status?: string;
  format?: string;
  country?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(tournaments);

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(tournaments.status, filters.status as any));
  }
  if (filters?.format) {
    conditions.push(eq(tournaments.format, filters.format));
  }
  if (filters?.country) {
    conditions.push(eq(tournaments.country, filters.country));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  query = query.orderBy(desc(tournaments.date)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
}

export async function getTournamentById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(tournaments).where(eq(tournaments.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createTournament(tournament: InsertTournament) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tournaments).values(tournament);
  return result;
}

export async function updateTournament(id: number, updates: Partial<InsertTournament>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(tournaments).set(updates).where(eq(tournaments.id, id));
}

export async function getPendingTournaments() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tournaments)
    .where(eq(tournaments.status, "pending_approval"))
    .orderBy(desc(tournaments.createdAt));
}

// ============ ARCHETYPES ============

export async function getArchetypes() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(archetypes).orderBy(archetypes.name);
}

export async function getArchetypeById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(archetypes).where(eq(archetypes.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createArchetype(archetype: InsertArchetype) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(archetypes).values(archetype);
  return result;
}

// ============ DECKS ============

export async function getUserDecks(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(decks)
    .where(eq(decks.userId, userId))
    .orderBy(desc(decks.updatedAt));
}

export async function getDeckById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(decks).where(eq(decks.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getDeckByShareToken(token: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(decks).where(eq(decks.shareToken, token)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createDeck(deck: InsertDeck) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(decks).values(deck);
  return result;
}

export async function updateDeck(id: number, updates: Partial<InsertDeck>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(decks).set(updates).where(eq(decks.id, id));
}

export async function deleteDeck(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(decks).where(eq(decks.id, id));
}

// ============ BATTLE LOGS ============

export async function getUserBattleLogs(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(battleLogs)
    .where(eq(battleLogs.userId, userId))
    .orderBy(desc(battleLogs.playedAt))
    .limit(limit);
}

export async function createBattleLog(log: InsertBattleLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(battleLogs).values(log);
  return result;
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Calculate overall win rate
  const logs = await db.select().from(battleLogs).where(eq(battleLogs.userId, userId));

  const totalGames = logs.length;
  const wins = logs.filter((l) => l.result === "win").length;
  const losses = logs.filter((l) => l.result === "loss").length;
  const draws = logs.filter((l) => l.result === "draw").length;

  // Calculate win rate by opponent archetype
  const byOpponent: Record<number, { wins: number; total: number }> = {};
  logs.forEach((log) => {
    if (!byOpponent[log.opponentArchetypeId]) {
      byOpponent[log.opponentArchetypeId] = { wins: 0, total: 0 };
    }
    byOpponent[log.opponentArchetypeId].total++;
    if (log.result === "win") {
      byOpponent[log.opponentArchetypeId].wins++;
    }
  });

  return {
    totalGames,
    wins,
    losses,
    draws,
    winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0,
    byOpponent,
  };
}

// ============ METAGAME ============

export async function getMetagameSnapshots(filters?: {
  format?: string;
  period?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(metagameSnapshots);

  const conditions = [];
  if (filters?.format) {
    conditions.push(eq(metagameSnapshots.format, filters.format));
  }
  if (filters?.period) {
    conditions.push(eq(metagameSnapshots.period, filters.period));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  query = query.orderBy(desc(metagameSnapshots.mri)) as any;

  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }

  return await query;
}

export async function createMetagameSnapshot(snapshot: InsertMetagameSnapshot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(metagameSnapshots).values(snapshot);
  return result;
}

export async function getMatchupMatrix(filters?: { format?: string; period?: string }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(matchupMatrix);

  const conditions = [];
  if (filters?.format) {
    conditions.push(eq(matchupMatrix.format, filters.format));
  }
  if (filters?.period) {
    conditions.push(eq(matchupMatrix.period, filters.period));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query;
}

export async function createMatchupMatrix(matrix: InsertMatchupMatrix) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(matchupMatrix).values(matrix);
  return result;
}

// ============ CARDS ============

export async function searchCards(query: string, limit = 20) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(cards)
    .where(sql`${cards.name} LIKE ${`%${query}%`}`)
    .limit(limit);
}

export async function getCardById(id: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(cards).where(eq(cards.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertCard(card: InsertCard) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(cards)
    .values(card)
    .onDuplicateKeyUpdate({
      set: {
        name: card.name,
        supertype: card.supertype,
        subtypes: card.subtypes,
        set: card.set,
        setCode: card.setCode,
        number: card.number,
        rarity: card.rarity,
        imageUrl: card.imageUrl,
        imageUrlSmall: card.imageUrlSmall,
        data: card.data,
        updatedAt: new Date(),
      },
    });
}

