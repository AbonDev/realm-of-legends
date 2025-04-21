import { pgTable, text, serial, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const characters = pgTable("characters", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  race: text("race").notNull(),
  class: text("class").notNull(),
  background: text("background").notNull(),
  attributes: json("attributes").notNull().$type<Record<string, number>>(),
  skills: json("skills").notNull().$type<Record<string, number>>(),
  appearance: json("appearance").notNull().$type<Record<string, any>>(),
  equipment: json("equipment").notNull().$type<string[]>(),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Character schemas
export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
});

export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;

// Character creation types
export type CharacterRace = {
  id: string;
  name: string;
  description: string;
  attributeModifiers: Record<string, number>;
  abilities: string[];
  traits: string[];
};

export type CharacterClass = {
  id: string;
  name: string;
  description: string;
  primaryAttribute: string;
  abilities: {
    name: string;
    description: string;
    level: number;
  }[];
  startingEquipment: string[];
};

export type CharacterBackground = {
  id: string;
  name: string;
  description: string;
  skillBonuses: string[];
  traits: string[];
  suggestedCharacteristics: string[];
};

export type CharacterAttributes = {
  might: number;
  finesse: number;
  constitution: number;
  intellect: number;
  wisdom: number;
  presence: number;
};

export type CharacterSkills = Record<string, number>;

export type CharacterAppearance = {
  bodyType: string;
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  faceShape: string;
  eyeColor: string;
  facialHair?: string;
  scars?: string[];
  tattoos?: string[];
};

export type FullCharacter = {
  id?: number;
  name: string;
  race: string;
  class: string;
  background: string;
  attributes: CharacterAttributes;
  skills: CharacterSkills;
  appearance: CharacterAppearance;
  equipment: string[];
};
