import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Character routes prefix with /api
  const apiRouter = app.route("/api");
  
  // Get all character templates
  app.get("/api/characters", async (req, res) => {
    try {
      const characters = await storage.getAllCharacters();
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: "Failed to get characters", error: String(error) });
    }
  });

  // Get a character by ID
  app.get("/api/characters/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }
      
      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to get character", error: String(error) });
    }
  });

  // Create a new character
  app.post("/api/characters", async (req, res) => {
    try {
      const character = req.body;
      
      // Basic validation
      if (!character.name || !character.race || !character.class) {
        return res.status(400).json({ message: "Missing required character fields" });
      }
      
      const savedCharacter = await storage.createCharacter(character);
      res.status(201).json(savedCharacter);
    } catch (error) {
      res.status(500).json({ message: "Failed to create character", error: String(error) });
    }
  });

  // Update a character
  app.put("/api/characters/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }
      
      const character = req.body;
      const updatedCharacter = await storage.updateCharacter(id, character);
      if (!updatedCharacter) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      res.json(updatedCharacter);
    } catch (error) {
      res.status(500).json({ message: "Failed to update character", error: String(error) });
    }
  });

  // Delete a character
  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid character ID" });
      }
      
      const success = await storage.deleteCharacter(id);
      if (!success) {
        return res.status(404).json({ message: "Character not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete character", error: String(error) });
    }
  });

  // Get game data routes
  app.get("/api/game-data/races", (req, res) => {
    try {
      // We'll return this from in-memory data rather than database
      const races = [
        {
          id: "human",
          name: "Human",
          description: "Versatile and ambitious, humans are the most common folk in the realms.",
          attributeModifiers: { might: 1, finesse: 1, constitution: 1, intellect: 1, wisdom: 1, presence: 1 },
          abilities: ["Adaptability", "Versatile"],
          traits: ["Quick Learner", "Ambitious"]
        },
        {
          id: "elf",
          name: "Elf",
          description: "Graceful and long-lived, elves are magical beings with a strong connection to nature.",
          attributeModifiers: { finesse: 2, intellect: 1, wisdom: 1 },
          abilities: ["Keen Senses", "Fey Ancestry"],
          traits: ["Trance", "Graceful"]
        },
        {
          id: "dwarf",
          name: "Dwarf",
          description: "Sturdy and traditional, dwarves are known for their craftsmanship and resilience.",
          attributeModifiers: { constitution: 2, might: 1, wisdom: 1 },
          abilities: ["Dwarven Resilience", "Stonecunning"],
          traits: ["Darkvision", "Craftsmanship"]
        },
        {
          id: "dragonborn",
          name: "Dragonborn",
          description: "Proud warriors with draconic heritage, capable of breathing elemental energy.",
          attributeModifiers: { might: 2, presence: 1 },
          abilities: ["Breath Weapon", "Draconic Resistance"],
          traits: ["Imposing Presence", "Honor-bound"]
        },
        {
          id: "halfling",
          name: "Halfling",
          description: "Small but brave folk, known for their luck and tendency to avoid danger.",
          attributeModifiers: { finesse: 2, wisdom: 1 },
          abilities: ["Lucky", "Nimble"],
          traits: ["Brave", "Hospitable"]
        }
      ];
      
      res.json(races);
    } catch (error) {
      res.status(500).json({ message: "Failed to get races data", error: String(error) });
    }
  });

  app.get("/api/game-data/classes", (req, res) => {
    try {
      const classes = [
        {
          id: "warrior",
          name: "Warrior",
          description: "Masters of combat with exceptional skill at arms and armor.",
          primaryAttribute: "might",
          abilities: [
            { name: "Combat Prowess", description: "Gain advantage on attack rolls once per combat.", level: 1 },
            { name: "Defensive Stance", description: "Reduce incoming damage by 3 as a reaction.", level: 2 }
          ],
          startingEquipment: ["Longsword", "Shield", "Chainmail", "Explorer's Pack"]
        },
        {
          id: "mage",
          name: "Mage",
          description: "Scholars of the arcane who can bend reality with powerful spells.",
          primaryAttribute: "intellect",
          abilities: [
            { name: "Arcane Recovery", description: "Regain some spell slots during a short rest.", level: 1 },
            { name: "Elemental Attunement", description: "Choose one element to enhance related spells.", level: 2 }
          ],
          startingEquipment: ["Spellbook", "Staff", "Scholar's Pack", "Arcane Focus"]
        },
        {
          id: "rogue",
          name: "Rogue",
          description: "Skilled infiltrators and precise strikers who excel at deception and stealth.",
          primaryAttribute: "finesse",
          abilities: [
            { name: "Sneak Attack", description: "Deal extra damage when you have advantage on attack rolls.", level: 1 },
            { name: "Uncanny Dodge", description: "Halve damage from an attack as a reaction.", level: 2 }
          ],
          startingEquipment: ["Shortsword", "Dagger", "Leather Armor", "Thieves' Tools"]
        },
        {
          id: "cleric",
          name: "Cleric",
          description: "Divine spellcasters who channel the power of their deity to heal and protect.",
          primaryAttribute: "wisdom",
          abilities: [
            { name: "Divine Channel", description: "Call upon your deity's power to create magical effects.", level: 1 },
            { name: "Healing Touch", description: "Your healing spells are more effective.", level: 2 }
          ],
          startingEquipment: ["Mace", "Shield", "Holy Symbol", "Healer's Kit"]
        },
        {
          id: "ranger",
          name: "Ranger",
          description: "Wilderness experts who blend martial prowess with nature magic.",
          primaryAttribute: "finesse",
          abilities: [
            { name: "Natural Explorer", description: "You are particularly adept at traveling through one type of terrain.", level: 1 },
            { name: "Hunter's Mark", description: "Mark a creature to deal extra damage to it.", level: 2 }
          ],
          startingEquipment: ["Longbow", "Quiver of Arrows", "Two Shortswords", "Explorer's Pack"]
        }
      ];
      
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Failed to get classes data", error: String(error) });
    }
  });

  app.get("/api/game-data/backgrounds", (req, res) => {
    try {
      const backgrounds = [
        {
          id: "noble",
          name: "Noble",
          description: "You were born into a family of power and privilege.",
          skillBonuses: ["Etiquette", "History"],
          traits: ["Influential Connections", "Refined Manners"],
          suggestedCharacteristics: ["Arrogant", "Honorable", "Ambitious"]
        },
        {
          id: "scholar",
          name: "Scholar",
          description: "You spent years studying in libraries and universities.",
          skillBonuses: ["Arcana", "Investigation"],
          traits: ["Comprehensive Education", "Research Skills"],
          suggestedCharacteristics: ["Curious", "Analytical", "Detached"]
        },
        {
          id: "soldier",
          name: "Soldier",
          description: "You served in an army or militia, learning the art of war.",
          skillBonuses: ["Athletics", "Intimidation"],
          traits: ["Military Rank", "Tactical Training"],
          suggestedCharacteristics: ["Disciplined", "Loyal", "Hardened"]
        },
        {
          id: "criminal",
          name: "Criminal",
          description: "You lived a life outside the law, whether by choice or necessity.",
          skillBonuses: ["Deception", "Stealth"],
          traits: ["Criminal Contact", "Streetwise"],
          suggestedCharacteristics: ["Suspicious", "Resourceful", "Secretive"]
        },
        {
          id: "outlander",
          name: "Outlander",
          description: "You grew up in the wilds, far from civilization.",
          skillBonuses: ["Survival", "Nature"],
          traits: ["Wanderer", "Hunter-Gatherer"],
          suggestedCharacteristics: ["Independent", "Wary of Civilization", "Connected to Nature"]
        }
      ];
      
      res.json(backgrounds);
    } catch (error) {
      res.status(500).json({ message: "Failed to get backgrounds data", error: String(error) });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
