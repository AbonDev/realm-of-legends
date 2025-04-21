import { create } from 'zustand';
import type { 
  FullCharacter, 
  CharacterAttributes, 
  CharacterSkills, 
  CharacterAppearance 
} from '@shared/schema';

interface CharacterState {
  character: Partial<FullCharacter>;
  updateCharacter: (updates: Partial<FullCharacter>) => void;
  resetCharacter: () => void;
}

// Default character values for reset
const defaultCharacter: Partial<FullCharacter> = {
  name: '',
  race: '',
  class: '',
  background: '',
  attributes: {
    might: 10,
    finesse: 10,
    constitution: 10,
    intellect: 10,
    wisdom: 10,
    presence: 10
  },
  skills: {},
  appearance: {
    bodyType: 'average',
    skinTone: 'medium',
    hairStyle: 'short',
    hairColor: 'brown',
    faceShape: 'oval',
    eyeColor: 'brown'
  },
  equipment: []
};

export const useCharacter = create<CharacterState>((set) => ({
  // Initial character state
  character: { ...defaultCharacter },
  
  // Update character with new values
  updateCharacter: (updates) => set((state) => {
    // Special handling for nested objects (attributes, skills, appearance)
    const newCharacter = { ...state.character };
    
    // Handle attributes updates - merge with existing
    if (updates.attributes) {
      newCharacter.attributes = {
        ...(newCharacter.attributes || {}),
        ...updates.attributes
      } as CharacterAttributes;
      
      // Remove the processed property to avoid double processing
      const { attributes, ...rest } = updates;
      updates = rest;
    }
    
    // Handle skills updates - merge with existing
    if (updates.skills) {
      newCharacter.skills = {
        ...(newCharacter.skills || {}),
        ...updates.skills
      } as CharacterSkills;
      
      // Remove the processed property
      const { skills, ...rest } = updates;
      updates = rest;
    }
    
    // Handle appearance updates - merge with existing
    if (updates.appearance) {
      newCharacter.appearance = {
        ...(newCharacter.appearance || {}),
        ...updates.appearance
      } as CharacterAppearance;
      
      // Remove the processed property
      const { appearance, ...rest } = updates;
      updates = rest;
    }
    
    // Handle all other updates
    return {
      character: {
        ...newCharacter,
        ...updates
      }
    };
  }),
  
  // Reset character to default values
  resetCharacter: () => set({
    character: { ...defaultCharacter }
  })
}));
