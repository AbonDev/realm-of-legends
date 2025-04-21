import type { 
  CharacterRace, 
  CharacterClass, 
  CharacterBackground 
} from '@shared/schema';

// Race definitions - fallback data if API fails
export const races: CharacterRace[] = [
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

// Class definitions - fallback data if API fails
export const classes: CharacterClass[] = [
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

// Background definitions - fallback data if API fails
export const backgrounds: CharacterBackground[] = [
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

// Skill definitions
export const skillsList = [
  { id: 'acrobatics', name: 'Acrobatics', attribute: 'finesse', description: 'Your ability to perform feats of agility, balance, and coordination.' },
  { id: 'athletics', name: 'Athletics', attribute: 'might', description: 'Your physical prowess in activities like climbing, jumping, and swimming.' },
  { id: 'deception', name: 'Deception', attribute: 'presence', description: 'Your ability to convincingly hide the truth or tell a lie.' },
  { id: 'insight', name: 'Insight', attribute: 'wisdom', description: 'Your ability to determine the true intentions of others.' },
  { id: 'intimidation', name: 'Intimidation', attribute: 'presence', description: 'Your ability to influence others through threats or displays of power.' },
  { id: 'investigation', name: 'Investigation', attribute: 'intellect', description: 'Your ability to search for clues and deduce information from evidence.' },
  { id: 'lore', name: 'Lore', attribute: 'intellect', description: 'Your knowledge of history, legends, and the wider world.' },
  { id: 'medicine', name: 'Medicine', attribute: 'wisdom', description: 'Your ability to stabilize the dying or diagnose illnesses.' },
  { id: 'nature', name: 'Nature', attribute: 'wisdom', description: 'Your knowledge of terrain, plants, animals, and the natural world.' },
  { id: 'perception', name: 'Perception', attribute: 'wisdom', description: 'Your awareness of the environment and ability to notice things.' },
  { id: 'performance', name: 'Performance', attribute: 'presence', description: 'Your ability to delight an audience with music, dance, or acting.' },
  { id: 'persuasion', name: 'Persuasion', attribute: 'presence', description: 'Your ability to influence others through tact, social grace, or good nature.' },
  { id: 'religion', name: 'Religion', attribute: 'intellect', description: 'Your knowledge of deities, rites, and religious practices.' },
  { id: 'sleight', name: 'Sleight of Hand', attribute: 'finesse', description: 'Your ability to perform fine manipulation and hand tricks.' },
  { id: 'stealth', name: 'Stealth', attribute: 'finesse', description: 'Your ability to hide, move silently, and avoid detection.' },
  { id: 'survival', name: 'Survival', attribute: 'wisdom', description: 'Your ability to navigate, track, hunt, and survive in the wilderness.' }
];

// Attribute descriptions
export const attributeDescriptions = {
  might: "Physical strength and raw power. Affects damage with melee weapons, carrying capacity, and athletic prowess.",
  finesse: "Agility, reflexes, and hand-eye coordination. Affects accuracy, evasion, and stealth.",
  constitution: "Physical endurance and toughness. Affects health points, resistance to poisons, and stamina.",
  intellect: "Mental acuity, memory, and logical reasoning. Affects spell power, knowledge skills, and learning ability.",
  wisdom: "Intuition, willpower, and perception. Affects awareness, insight, and connection to the natural world.",
  presence: "Force of personality, charisma, and social influence. Affects persuasion, intimidation, and leadership."
};
