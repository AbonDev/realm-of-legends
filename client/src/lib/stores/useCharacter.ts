import { create } from 'zustand';

type CharacterAttributes = {
  might: number;
  finesse: number;
  constitution: number;
  intellect: number;
  wisdom: number;
  presence: number;
};

type CharacterHealth = {
  current: number;
  max: number;
};

type CharacterMana = {
  current: number;
  max: number;
};

type CharacterState = {
  name: string;
  race: string;
  class: string;
  level: number;
  experience: number;
  health: CharacterHealth;
  mana: CharacterMana;
  attributes: CharacterAttributes;
  gold: number;
  inventory: string[];
  skills: string[];
  portraitUrl: string;
  isCreated: boolean;
  gameSessionId: string | null;
  
  // Actions
  setName: (name: string) => void;
  setRace: (race: string) => void;
  setClass: (characterClass: string) => void;
  setAttributes: (attributes: Partial<CharacterAttributes>) => void;
  setHealth: (health: Partial<CharacterHealth>) => void;
  setMana: (mana: Partial<CharacterMana>) => void;
  addInventoryItem: (item: string) => void;
  removeInventoryItem: (item: string) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
  setPortrait: (url: string) => void;
  levelUp: () => void;
  addExperience: (amount: number) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  setGameSessionId: (id: string | null) => void;
  resetCharacter: () => void;
};

export const useCharacter = create<CharacterState>((set) => ({
  // Initial state
  name: 'Thorne Ironfist',
  race: 'Human',
  class: 'Warrior',
  level: 1,
  experience: 0,
  health: { current: 30, max: 30 },
  mana: { current: 10, max: 10 },
  attributes: {
    might: 14,
    finesse: 10,
    constitution: 12,
    intellect: 8,
    wisdom: 10,
    presence: 10,
  },
  gold: 50,
  inventory: [
    'Longsword',
    'Shield',
    'Healing Potion (2)',
    'Rations (5 days)',
    "Adventurer's Pack",
  ],
  skills: ['Athletics', 'Intimidation', 'Survival'],
  portraitUrl: '/textures/warrior-portrait.jpg',
  isCreated: true,
  gameSessionId: null,

  // Actions
  setName: (name) => set({ name }),
  setRace: (race) => set({ race }),
  setClass: (characterClass) => set({ class: characterClass }),
  setAttributes: (attributes) => 
    set((state) => ({ 
      attributes: { ...state.attributes, ...attributes } 
    })),
  setHealth: (health) => 
    set((state) => ({ 
      health: { ...state.health, ...health } 
    })),
  setMana: (mana) => 
    set((state) => ({ 
      mana: { ...state.mana, ...mana } 
    })),
  addInventoryItem: (item) => 
    set((state) => ({ 
      inventory: [...state.inventory, item] 
    })),
  removeInventoryItem: (item) => 
    set((state) => ({ 
      inventory: state.inventory.filter(i => i !== item) 
    })),
  addSkill: (skill) => 
    set((state) => ({ 
      skills: [...state.skills, skill] 
    })),
  removeSkill: (skill) => 
    set((state) => ({ 
      skills: state.skills.filter(s => s !== skill) 
    })),
  setPortrait: (url) => set({ portraitUrl: url }),
  levelUp: () => 
    set((state) => ({
      level: state.level + 1,
      health: { current: state.health.max + 5, max: state.health.max + 5 },
      mana: { current: state.mana.max + 3, max: state.mana.max + 3 }
    })),
  addExperience: (amount) => 
    set((state) => ({
      experience: state.experience + amount
    })),
  addGold: (amount) => 
    set((state) => ({
      gold: state.gold + amount
    })),
  spendGold: (amount) => {
    let success = false;
    set((state) => {
      if (state.gold < amount) return state;
      success = true;
      return { gold: state.gold - amount };
    });
    return success;
  },
  setGameSessionId: (id) => set({ gameSessionId: id }),
  resetCharacter: () => 
    set({
      name: '',
      race: '',
      class: '',
      level: 1,
      experience: 0,
      health: { current: 0, max: 0 },
      mana: { current: 0, max: 0 },
      attributes: {
        might: 10,
        finesse: 10,
        constitution: 10,
        intellect: 10,
        wisdom: 10,
        presence: 10,
      },
      gold: 0,
      inventory: [],
      skills: [],
      portraitUrl: '',
      isCreated: false,
      gameSessionId: null,
    }),
}));
