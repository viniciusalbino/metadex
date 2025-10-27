import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "organizer"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tournaments table - stores both scraped and user-submitted tournaments
 */
export const tournaments = mysqlTable("tournaments", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  date: timestamp("date").notNull(),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  format: varchar("format", { length: 100 }).notNull(), // Standard, Expanded, etc
  eventType: varchar("eventType", { length: 100 }), // Regional, International, Local, etc
  playerCount: int("playerCount"),
  status: mysqlEnum("status", ["upcoming", "ongoing", "completed", "pending_approval"]).default("upcoming").notNull(),
  source: mysqlEnum("source", ["limitless", "rk9", "user_submitted"]).notNull(),
  externalId: varchar("externalId", { length: 255 }), // ID from external source
  externalUrl: text("externalUrl"),
  submittedBy: int("submittedBy"), // User ID who submitted (for user_submitted)
  approvedBy: int("approvedBy"), // Admin who approved
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = typeof tournaments.$inferInsert;

/**
 * Archetypes table - stores deck archetypes identified from metagame analysis
 */
export const archetypes = mysqlTable("archetypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  displayName: varchar("displayName", { length: 255 }).notNull(),
  description: text("description"),
  iconUrl: text("iconUrl"),
  primaryCards: text("primaryCards"), // JSON array of key card names
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Archetype = typeof archetypes.$inferSelect;
export type InsertArchetype = typeof archetypes.$inferInsert;

/**
 * Decks table - stores user-created decks and tournament decklists
 */
export const decks = mysqlTable("decks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"), // NULL for tournament decklists
  archetypeId: int("archetypeId"),
  name: varchar("name", { length: 255 }).notNull(),
  format: varchar("format", { length: 100 }).notNull(),
  decklist: text("decklist").notNull(), // JSON array of cards
  decklistText: text("decklistText"), // PTCGL format text
  isPublic: int("isPublic").default(0).notNull(), // 0 = private, 1 = public
  shareToken: varchar("shareToken", { length: 64 }).unique(), // For sharing
  tournamentId: int("tournamentId"), // If from tournament
  placement: int("placement"), // Tournament placement
  playerName: varchar("playerName", { length: 255 }), // For tournament decks
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Deck = typeof decks.$inferSelect;
export type InsertDeck = typeof decks.$inferInsert;

/**
 * Battle log table - stores user battle records
 */
export const battleLogs = mysqlTable("battleLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  myDeckId: int("myDeckId"),
  myArchetypeId: int("myArchetypeId"),
  opponentArchetypeId: int("opponentArchetypeId").notNull(),
  result: mysqlEnum("result", ["win", "loss", "draw"]).notNull(),
  notes: text("notes"),
  playedAt: timestamp("playedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BattleLog = typeof battleLogs.$inferSelect;
export type InsertBattleLog = typeof battleLogs.$inferInsert;

/**
 * Metagame snapshots - stores calculated metagame metrics over time
 */
export const metagameSnapshots = mysqlTable("metagameSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  archetypeId: int("archetypeId").notNull(),
  tournamentId: int("tournamentId"),
  period: varchar("period", { length: 50 }).notNull(), // "week", "month", "all"
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  format: varchar("format", { length: 100 }).notNull(),
  totalDecks: int("totalDecks").notNull(), // Day 1 count
  topCutDecks: int("topCutDecks").notNull(), // Day 2 / Top Cut count
  usageRate: int("usageRate").notNull(), // Percentage * 100 (e.g., 1234 = 12.34%)
  conversionRate: int("conversionRate").notNull(), // Percentage * 100
  mri: int("mri").notNull(), // Meta-Relevance Index * 100
  avgPlacement: int("avgPlacement"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MetagameSnapshot = typeof metagameSnapshots.$inferSelect;
export type InsertMetagameSnapshot = typeof metagameSnapshots.$inferInsert;

/**
 * Matchup matrix - stores head-to-head win rates between archetypes
 */
export const matchupMatrix = mysqlTable("matchupMatrix", {
  id: int("id").autoincrement().primaryKey(),
  archetypeAId: int("archetypeAId").notNull(),
  archetypeBId: int("archetypeBId").notNull(),
  format: varchar("format", { length: 100 }).notNull(),
  period: varchar("period", { length: 50 }).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  totalGames: int("totalGames").notNull(),
  archetypeAWins: int("archetypeAWins").notNull(),
  winRate: int("winRate").notNull(), // Percentage * 100 (A vs B)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MatchupMatrix = typeof matchupMatrix.$inferSelect;
export type InsertMatchupMatrix = typeof matchupMatrix.$inferInsert;

/**
 * Cards cache - stores Pokemon TCG card data
 */
export const cards = mysqlTable("cards", {
  id: varchar("id", { length: 100 }).primaryKey(), // Card ID from API
  name: varchar("name", { length: 255 }).notNull(),
  supertype: varchar("supertype", { length: 50 }).notNull(), // Pokémon, Trainer, Energy
  subtypes: text("subtypes"), // JSON array
  set: varchar("set", { length: 100 }),
  setCode: varchar("setCode", { length: 20 }),
  number: varchar("number", { length: 20 }),
  rarity: varchar("rarity", { length: 50 }),
  imageUrl: text("imageUrl"),
  imageUrlSmall: text("imageUrlSmall"),
  data: text("data"), // Full JSON data from API
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Card = typeof cards.$inferSelect;
export type InsertCard = typeof cards.$inferInsert;