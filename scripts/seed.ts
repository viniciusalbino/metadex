import { drizzle } from "drizzle-orm/mysql2";
import { archetypes, tournaments, metagameSnapshots } from "../drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed Archetypes
  console.log("Creating archetypes...");
  
  const archetypeData = [
    {
      name: "charizard-ex",
      displayName: "Charizard ex",
      description: "Deck focado em Charizard ex com aceleração de energia",
      primaryCards: JSON.stringify(["Charizard ex", "Pidgeot ex", "Rare Candy"]),
    },
    {
      name: "lugia-vstar",
      displayName: "Lugia VSTAR",
      description: "Deck de controle com Lugia VSTAR e Archeops",
      primaryCards: JSON.stringify(["Lugia VSTAR", "Archeops", "Lumineon V"]),
    },
    {
      name: "gardevoir-ex",
      displayName: "Gardevoir ex",
      description: "Deck psíquico com aceleração de energia via Gardevoir ex",
      primaryCards: JSON.stringify(["Gardevoir ex", "Zacian V", "Scream Tail"]),
    },
    {
      name: "lost-zone",
      displayName: "Lost Zone Box",
      description: "Deck toolbox usando a Lost Zone",
      primaryCards: JSON.stringify(["Comfey", "Sableye", "Cramorant"]),
    },
    {
      name: "miraidon-ex",
      displayName: "Miraidon ex",
      description: "Deck elétrico agressivo com Miraidon ex",
      primaryCards: JSON.stringify(["Miraidon ex", "Raikou V", "Regieleki"]),
    },
    {
      name: "roaring-moon",
      displayName: "Roaring Moon ex",
      description: "Deck dark agressivo",
      primaryCards: JSON.stringify(["Roaring Moon ex", "Squawkabilly ex"]),
    },
    {
      name: "ancient-box",
      displayName: "Ancient Box",
      description: "Deck com Pokémon Ancient e Koraidon ex",
      primaryCards: JSON.stringify(["Koraidon ex", "Roaring Moon ex", "Sandy Shocks"]),
    },
    {
      name: "future-box",
      displayName: "Future Box",
      description: "Deck com Pokémon Future e Miraidon ex",
      primaryCards: JSON.stringify(["Miraidon ex", "Iron Hands ex", "Iron Valiant ex"]),
    },
  ];

  for (const archetype of archetypeData) {
    await db.insert(archetypes).values(archetype).onDuplicateKeyUpdate({
      set: { displayName: archetype.displayName },
    });
  }

  console.log(`✅ Created ${archetypeData.length} archetypes`);

  // Seed Tournaments
  console.log("Creating sample tournaments...");

  const now = new Date();
  const tournamentData = [
    {
      name: "Regional Championships São Paulo 2025",
      date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      country: "Brazil",
      city: "São Paulo",
      format: "Standard",
      eventType: "Regional Championships",
      playerCount: 0,
      status: "upcoming" as const,
      source: "user_submitted" as const,
      externalUrl: "https://rk9.gg",
    },
    {
      name: "International Championships Baltimore 2025",
      date: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      country: "United States",
      city: "Baltimore",
      format: "Standard",
      eventType: "International Championships",
      playerCount: 0,
      status: "upcoming" as const,
      source: "limitless" as const,
      externalUrl: "https://limitlesstcg.com",
    },
    {
      name: "League Cup - Rio de Janeiro",
      date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      country: "Brazil",
      city: "Rio de Janeiro",
      format: "Standard",
      eventType: "League Cup",
      playerCount: 32,
      status: "upcoming" as const,
      source: "user_submitted" as const,
    },
  ];

  for (const tournament of tournamentData) {
    await db.insert(tournaments).values(tournament);
  }

  console.log(`✅ Created ${tournamentData.length} tournaments`);

  // Seed Metagame Snapshots (example data)
  console.log("Creating metagame snapshots...");

  const archetypesList = await db.select().from(archetypes);
  const periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const periodEnd = now;

  const snapshotData = [
    {
      archetypeId: archetypesList.find((a) => a.name === "charizard-ex")?.id || 1,
      format: "Standard",
      period: "month",
      periodStart,
      periodEnd,
      totalDecks: 45,
      topCutDecks: 12,
      usageRate: 1500, // 15.00%
      conversionRate: 2667, // 26.67%
      mri: 4000, // 40.00
    },
    {
      archetypeId: archetypesList.find((a) => a.name === "gardevoir-ex")?.id || 2,
      format: "Standard",
      period: "month",
      periodStart,
      periodEnd,
      totalDecks: 38,
      topCutDecks: 14,
      usageRate: 1267, // 12.67%
      conversionRate: 3684, // 36.84%
      mri: 4667, // 46.67
    },
    {
      archetypeId: archetypesList.find((a) => a.name === "lugia-vstar")?.id || 3,
      format: "Standard",
      period: "month",
      periodStart,
      periodEnd,
      totalDecks: 32,
      topCutDecks: 8,
      usageRate: 1067, // 10.67%
      conversionRate: 2500, // 25.00%
      mri: 2667, // 26.67
    },
    {
      archetypeId: archetypesList.find((a) => a.name === "miraidon-ex")?.id || 4,
      format: "Standard",
      period: "month",
      periodStart,
      periodEnd,
      totalDecks: 28,
      topCutDecks: 10,
      usageRate: 933, // 9.33%
      conversionRate: 3571, // 35.71%
      mri: 3333, // 33.33
    },
    {
      archetypeId: archetypesList.find((a) => a.name === "lost-zone")?.id || 5,
      format: "Standard",
      period: "month",
      periodStart,
      periodEnd,
      totalDecks: 25,
      topCutDecks: 6,
      usageRate: 833, // 8.33%
      conversionRate: 2400, // 24.00%
      mri: 2000, // 20.00
    },
  ];

  for (const snapshot of snapshotData) {
    await db.insert(metagameSnapshots).values(snapshot);
  }

  console.log(`✅ Created ${snapshotData.length} metagame snapshots`);

  console.log("✅ Seeding complete!");
}

seed()
  .then(() => {
    console.log("Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });

