import { users, characters, type User, type InsertUser, type Character, type InsertCharacter } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Character methods
  getCharacter(id: number): Promise<Character | undefined>;
  getAllCharacters(): Promise<Character[]>;
  createCharacter(character: Partial<Character>): Promise<Character>;
  updateCharacter(id: number, character: Partial<Character>): Promise<Character | undefined>;
  deleteCharacter(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private characters: Map<number, Character>;
  private userIdCounter: number;
  private characterIdCounter: number;

  constructor() {
    this.users = new Map();
    this.characters = new Map();
    this.userIdCounter = 1;
    this.characterIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Character methods
  async getCharacter(id: number): Promise<Character | undefined> {
    return this.characters.get(id);
  }
  
  async getAllCharacters(): Promise<Character[]> {
    return Array.from(this.characters.values());
  }
  
  async createCharacter(character: Partial<Character>): Promise<Character> {
    const id = this.characterIdCounter++;
    
    // Set default values if not provided
    const timestamp = new Date().toISOString();
    const newCharacter: Character = {
      id,
      userId: character.userId || null,
      name: character.name || 'Unnamed Character',
      race: character.race || '',
      class: character.class || '',
      background: character.background || '',
      attributes: character.attributes || {},
      skills: character.skills || {},
      appearance: character.appearance || {},
      equipment: character.equipment || [],
      createdAt: character.createdAt || timestamp,
      updatedAt: character.updatedAt || timestamp
    };
    
    this.characters.set(id, newCharacter);
    return newCharacter;
  }
  
  async updateCharacter(id: number, character: Partial<Character>): Promise<Character | undefined> {
    const existingCharacter = this.characters.get(id);
    
    if (!existingCharacter) {
      return undefined;
    }
    
    const updatedCharacter: Character = {
      ...existingCharacter,
      ...character,
      updatedAt: new Date().toISOString()
    };
    
    this.characters.set(id, updatedCharacter);
    return updatedCharacter;
  }
  
  async deleteCharacter(id: number): Promise<boolean> {
    if (!this.characters.has(id)) {
      return false;
    }
    
    return this.characters.delete(id);
  }
}

export const storage = new MemStorage();
