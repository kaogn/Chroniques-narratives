// Types for Human Memories Game

export type HistoricalPeriod =
  | 'prehistoric'
  | 'ancient_early'
  | 'ancient_classical'
  | 'medieval_early'
  | 'medieval_late'
  | 'renaissance'
  | 'industrial'
  | 'contemporary';

export type TechCategory =
  | 'military'
  | 'cultural'
  | 'economic'
  | 'social'
  | 'exploration'
  | 'industrial'
  | 'scientific';

export type TechRarity =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'legendary'
  | 'pillar';

export interface Technology {
  id: string;
  name: string;
  period: HistoricalPeriod;
  category: TechCategory;
  rarity: TechRarity;
  dateRange: {
    min: number;
    max: number;
  };
  historicalAccuracy: number;
  description: string;
  dependencies: {
    prerequisites: string[];
    enables: string[];
    blocks: string[];
    synergies: string[];
  };
  effects: {
    military: number;
    cultural: number;
    economic: number;
    social: number;
    exploration: number;
  };
  narrative: {
    memoryWord: string;
    wordVariants: string[];
    immediate: string[];
    epochTemplate: string;
    finalTemplate: string;
  };
}

export interface PlayerProfile {
  primaryFocus: TechCategory;
  secondaryFocus: TechCategory;
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  explorationStyle: 'methodical' | 'opportunistic' | 'innovative';
  preservationPattern: 'foundation' | 'diversified' | 'specialized';
}

export interface GameTurn {
  turnNumber: number;
  period: HistoricalPeriod;
  availableTechs: string[];
  selectedTechs: string[];
  narratives: string[];
  timestamp: Date;
}

export interface GameState {
  gameId: string;
  currentTurn: number;
  currentPeriod: HistoricalPeriod;
  preservedTechs: string[];
  availableTechs: string[];
  playerProfile: PlayerProfile | null;
  gameHistory: GameTurn[];
  isCompleted: boolean;
}

export interface Result<T> {
  success: boolean;
  data?: T;
  error?: Error;
}