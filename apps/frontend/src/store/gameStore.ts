// Human Memories - State Management (mécanique arbre de décisions)

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

// === TYPES ===

export interface Technology {
  id: string;
  name: string;
  period: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'pillar';
  isRoot?: boolean;
  children?: string[];
  dateRange: { min: number; max: number };
  historicalAccuracy: number;
  description: string;
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

export interface GameState {
  gameId: string;
  turn: number;
  totalTurns: number;
  epochIndex: number;
  totalEpochs: number;
  turnWithinEpoch: number;
  turnsPerEpoch: number;
  currentEpoch: string;
  pickedPath: string[];
  availableTechs: string[];
  playerProfile: any | null;
  isCompleted: boolean;
}

interface Result<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

interface PickResult {
  immediateNarrative: string | null;
  majorEvent: string | null;
  epochSummary: string | null;
  finalChronicle: string | null;
  newState: GameState;
  isComplete: boolean;
  epochComplete: boolean;
}

interface GameStoreState {
  gameState: GameState | null;
  technologies: Map<string, Technology>;
  // Résultats du dernier pick — effacés au prochain pick
  majorEvent: string | null;
  epochSummary: string | null;
  finalChronicle: string | null;
  isLoading: boolean;
  error: string | null;
  gameMode: 'menu' | 'playing' | 'completed';
  // Préférences persistées
  soundEnabled: boolean;
  animationsEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
}

interface GameStoreActions {
  createGame: (options?: { difficulty?: 'easy' | 'normal' | 'hard'; playerName?: string }) => Promise<Result<GameState>>;
  pickTechnology: (techId: string) => Promise<Result<PickResult>>;
  dismissEpochSummary: () => void;
  resetGame: () => void;
  setGameMode: (mode: 'menu' | 'playing' | 'completed') => void;
  clearError: () => void;
  toggleSound: () => void;
  toggleAnimations: () => void;
  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => void;
  getAvailableTechnologies: () => Technology[];
  getPickedTechnologies: () => Technology[];
}

type GameStore = GameStoreState & { actions: GameStoreActions };

// === API SERVICE ===

class GameEngineService {
  private static instance: GameEngineService;
  private baseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';

  static getInstance(): GameEngineService {
    if (!GameEngineService.instance) {
      GameEngineService.instance = new GameEngineService();
    }
    return GameEngineService.instance;
  }

  async createGame(
    options: { difficulty?: string; playerName?: string } = {}
  ): Promise<Result<GameState>> {
    try {
      const response = await fetch(`${this.baseUrl}/game/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty: options.difficulty || 'normal',
          player_name: options.playerName ?? null,
        }),
      });
      if (!response.ok) throw new Error('Échec de la création de la partie');
      const json: ApiEnvelope<GameState> = await response.json();
      return { success: true, data: json.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async pickTechnology(gameId: string, techId: string): Promise<Result<PickResult>> {
    try {
      const response = await fetch(`${this.baseUrl}/game/${gameId}/pick`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ techId }),
      });
      if (!response.ok) throw new Error('Échec du choix de la technologie');
      const json: ApiEnvelope<PickResult> = await response.json();
      return { success: true, data: json.data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }

  async loadTechnologies(): Promise<Result<Map<string, Technology>>> {
    try {
      const response = await fetch(`${this.baseUrl}/technologies`);
      if (!response.ok) throw new Error('Échec du chargement des technologies');
      const json: { technologies: Technology[] } = await response.json();
      const techMap = new Map<string, Technology>();
      json.technologies.forEach((tech) => techMap.set(tech.id, tech));
      return { success: true, data: techMap };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) };
    }
  }
}

// === STORE ===

const initialState: GameStoreState = {
  gameState: null,
  technologies: new Map(),
  majorEvent: null,
  epochSummary: null,
  finalChronicle: null,
  isLoading: false,
  error: null,
  gameMode: 'menu',
  soundEnabled: true,
  animationsEnabled: true,
  difficulty: 'normal',
};

export const useGameStore = create<GameStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
          ...initialState,

          actions: {
            createGame: async (options = {}) => {
              set(state => {
                state.isLoading = true;
                state.error = null;
                state.gameMode = 'playing';
                state.majorEvent = null;
                state.epochSummary = null;
                state.finalChronicle = null;
              });

              try {
                const engine = GameEngineService.getInstance();

                if (get().technologies.size === 0) {
                  const techResult = await engine.loadTechnologies();
                  if (!techResult.success) throw techResult.error;
                  set(state => { state.technologies = techResult.data!; });
                }

                const result = await engine.createGame({
                  difficulty: options.difficulty ?? get().difficulty,
                  playerName: options.playerName,
                });

                if (result.success) {
                  set(state => {
                    state.gameState = result.data!;
                    state.isLoading = false;
                  });
                  return result;
                } else {
                  set(state => { state.error = result.error!.message; state.isLoading = false; });
                  return result;
                }
              } catch (error) {
                const msg = error instanceof Error ? error.message : 'Erreur inconnue';
                set(state => { state.error = msg; state.isLoading = false; });
                return { success: false, error: new Error(msg) };
              }
            },

            pickTechnology: async (techId) => {
              const gameState = get().gameState;
              if (!gameState) {
                return { success: false, error: new Error('Pas de partie active') };
              }

              set(state => {
                state.isLoading = true;
                state.error = null;
                state.majorEvent = null;
                state.epochSummary = null;
                state.finalChronicle = null;
              });

              try {
                const engine = GameEngineService.getInstance();
                const result = await engine.pickTechnology(gameState.gameId, techId);

                if (result.success && result.data) {
                  set(state => {
                    state.gameState = result.data!.newState;
                    state.majorEvent = result.data!.majorEvent;
                    state.epochSummary = result.data!.epochSummary;
                    state.finalChronicle = result.data!.finalChronicle;
                    state.isLoading = false;
                    if (result.data!.isComplete) {
                      state.gameMode = 'completed';
                    }
                  });
                  return result;
                } else {
                  set(state => { state.error = result.error!.message; state.isLoading = false; });
                  return result;
                }
              } catch (error) {
                const msg = error instanceof Error ? error.message : 'Erreur inconnue';
                set(state => { state.error = msg; state.isLoading = false; });
                return { success: false, error: new Error(msg) };
              }
            },

            dismissEpochSummary: () => {
              set(state => { state.epochSummary = null; });
            },

            resetGame: () => {
              set(state => {
                state.gameState = null;
                state.majorEvent = null;
                state.epochSummary = null;
                state.finalChronicle = null;
                state.gameMode = 'menu';
                state.error = null;
                state.isLoading = false;
              });
            },

            setGameMode: (mode) => {
              set(state => { state.gameMode = mode; });
            },

            clearError: () => {
              set(state => { state.error = null; });
            },

            toggleSound: () => {
              set(state => { state.soundEnabled = !state.soundEnabled; });
            },

            toggleAnimations: () => {
              set(state => { state.animationsEnabled = !state.animationsEnabled; });
            },

            setDifficulty: (difficulty) => {
              set(state => { state.difficulty = difficulty; });
            },

            getAvailableTechnologies: () => {
              const { gameState, technologies } = get();
              if (!gameState) return [];
              return gameState.availableTechs
                .map(id => technologies.get(id))
                .filter((t): t is Technology => t !== undefined);
            },

            getPickedTechnologies: () => {
              const { gameState, technologies } = get();
              if (!gameState) return [];
              return gameState.pickedPath
                .map(id => technologies.get(id))
                .filter((t): t is Technology => t !== undefined);
            },
          },
        })),
        {
          name: 'human-memories-game-store',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            soundEnabled: state.soundEnabled,
            animationsEnabled: state.animationsEnabled,
            difficulty: state.difficulty,
          }),
        }
      )
    ),
    { name: 'human-memories-store', enabled: process.env.NODE_ENV === 'development' }
  )
);

// === SELECTORS ===

export const useGameState = () => useGameStore(state => state.gameState);
export const useGameMode = () => useGameStore(state => state.gameMode);
export const useIsLoading = () => useGameStore(state => state.isLoading);
export const useGameError = () => useGameStore(state => state.error);
export const useMajorEvent = () => useGameStore(state => state.majorEvent);
export const useEpochSummary = () => useGameStore(state => state.epochSummary);
export const useFinalChronicle = () => useGameStore(state => state.finalChronicle);
export const useGameActions = () => useGameStore(state => state.actions);

export const useAvailableTechnologies = () =>
  useGameStore(state => state.actions.getAvailableTechnologies());

export const usePickedTechnologies = () =>
  useGameStore(state => state.actions.getPickedTechnologies());

export const useGameSettings = () => useGameStore(state => ({
  soundEnabled: state.soundEnabled,
  animationsEnabled: state.animationsEnabled,
  difficulty: state.difficulty,
}));
