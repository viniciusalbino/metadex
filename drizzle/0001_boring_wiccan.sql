CREATE TABLE `archetypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`description` text,
	`iconUrl` text,
	`primaryCards` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `archetypes_id` PRIMARY KEY(`id`),
	CONSTRAINT `archetypes_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `battleLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`myDeckId` int,
	`myArchetypeId` int,
	`opponentArchetypeId` int NOT NULL,
	`result` enum('win','loss','draw') NOT NULL,
	`notes` text,
	`playedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `battleLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cards` (
	`id` varchar(100) NOT NULL,
	`name` varchar(255) NOT NULL,
	`supertype` varchar(50) NOT NULL,
	`subtypes` text,
	`set` varchar(100),
	`setCode` varchar(20),
	`number` varchar(20),
	`rarity` varchar(50),
	`imageUrl` text,
	`imageUrlSmall` text,
	`data` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `decks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`archetypeId` int,
	`name` varchar(255) NOT NULL,
	`format` varchar(100) NOT NULL,
	`decklist` text NOT NULL,
	`decklistText` text,
	`isPublic` int NOT NULL DEFAULT 0,
	`shareToken` varchar(64),
	`tournamentId` int,
	`placement` int,
	`playerName` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `decks_id` PRIMARY KEY(`id`),
	CONSTRAINT `decks_shareToken_unique` UNIQUE(`shareToken`)
);
--> statement-breakpoint
CREATE TABLE `matchupMatrix` (
	`id` int AUTO_INCREMENT NOT NULL,
	`archetypeAId` int NOT NULL,
	`archetypeBId` int NOT NULL,
	`format` varchar(100) NOT NULL,
	`period` varchar(50) NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`totalGames` int NOT NULL,
	`archetypeAWins` int NOT NULL,
	`winRate` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `matchupMatrix_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `metagameSnapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`archetypeId` int NOT NULL,
	`tournamentId` int,
	`period` varchar(50) NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`format` varchar(100) NOT NULL,
	`totalDecks` int NOT NULL,
	`topCutDecks` int NOT NULL,
	`usageRate` int NOT NULL,
	`conversionRate` int NOT NULL,
	`mri` int NOT NULL,
	`avgPlacement` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `metagameSnapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tournaments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`date` timestamp NOT NULL,
	`country` varchar(100),
	`city` varchar(100),
	`format` varchar(100) NOT NULL,
	`eventType` varchar(100),
	`playerCount` int,
	`status` enum('upcoming','ongoing','completed','pending_approval') NOT NULL DEFAULT 'upcoming',
	`source` enum('limitless','rk9','user_submitted') NOT NULL,
	`externalId` varchar(255),
	`externalUrl` text,
	`submittedBy` int,
	`approvedBy` int,
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tournaments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','organizer') NOT NULL DEFAULT 'user';