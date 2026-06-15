// Human Memories - State Management avec Zustand (patterns 2025)

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

// === TYPES ===

interface Technology {
  id: string;
  name: string;
  period: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'pillar';
  dateRange: { min: number; max: number };
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

interface GameState {
  gameId: string;
  currentTurn: number;
  totalTurns: number;
  currentPeriod: string;
  preservedTechs: string[];
  availableTechs: string[];
  playerProfile: any | null;
  gameHistory: any[];
  isCompleted: boolean;
}

interface Result<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

interface GameStoreState {
  // Game state
  gameState: GameState | null;
  technologies: Map<string, Technology>;
  currentNarratives: readonly string[];
  epochSummary: string | null;
  finalChronicle: string | null;
  isLoading: boolean;
  error: string | null;

  // UI state
  selectedTechs: Set<string>;
  showNarratives: boolean;
  gameMode: 'menu' | 'playing' | 'completed';

  // Settings
  soundEnabled: boolean;
  animationsEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
}

interface GameStoreActions {
  // Game actions
  createGame: (options?: { difficulty?: 'easy' | 'normal' | 'hard'; playerName?: string }) => Promise<Result<GameState>>;
  loadGame: (gameId: string) => Promise<Result<GameState>>;
  preserveTechnologies: (techIds: readonly string[]) => Promise<Result<{
    narratives: readonly string[];
    newState: GameState;
    isComplete: boolean;
  }>>;
  resetGame: () => void;

  // Technology actions
  selectTechnology: (techId: string) => void;
  deselectTechnology: (techId: string) => void;
  clearSelections: () => void;

  // UI actions
  setNarrativesVisible: (visible: boolean) => void;
  setGameMode: (mode: 'menu' | 'playing' | 'completed') => void;
  clearError: () => void;

  // Settings actions
  toggleSound: () => void;
  toggleAnimations: () => void;
  setDifficulty: (difficulty: 'easy' | 'normal' | 'hard') => void;

  // Computed getters
  getAvailableTechnologies: () => Technology[];
  getPreservedTechnologies: () => Technology[];
  canSelectMore: () => boolean;
  getPlayerStats: () => {
    turnsPlayed: number;
    techsPreserved: number;
    currentPeriod: string | null;
  };
}

type GameStore = GameStoreState & { actions: GameStoreActions };

// === API SERVICE ===

// L'API renvoie systématiquement une enveloppe { success, data }.
interface ApiEnvelope<T> {
  success: boolean;
  data: T;
}

interface PreserveResult {
  narratives: string[];
  epochSummary: string | null;
  finalChronicle: string | null;
  newState: GameState;
  isComplete: boolean;
}

class GameEngineService {
  private static instance: GameEngineService;
  // Configurable via NEXT_PUBLIC_API_URL ; repli sur le backend local en dev.
  private baseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'http://localhost:8000';

  static getInstance(): GameEngineService {
    if (!GameEngineService.instance) {
      GameEngineService.instance = new GameEngineService();
    }
    return GameEngineService.instance;
  }

  async createGame(
    options: { difficulty?: 'easy' | 'normal' | 'hard'; playerName?: string } = {}
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

      if (!response.ok) {
        throw new Error('Échec de la création de la partie');
      }

      const json: ApiEnvelope<GameState> = await response.json();
      return { success: true, data: json.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Échec de la création de la partie'),
      };
    }
  }

  async preserveTechnologies(
    gameId: string,
    techIds: readonly string[]
  ): Promise<Result<PreserveResult>> {
    try {
      const response = await fetch(`${this.baseUrl}/game/${gameId}/preserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ techIds: Array.from(techIds) }),
      });

      if (!response.ok) {
        throw new Error('Échec de la préservation des technologies');
      }

      const json: ApiEnvelope<PreserveResult> = await response.json();
      return { success: true, data: json.data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error : new Error('Échec de la préservation des technologies'),
      };
    }
  }

  async loadTechnologies(): Promise<Result<Map<string, Technology>>> {
    try {
      const response = await fetch(`${this.baseUrl}/technologies`);

      if (!response.ok) {
        throw new Error('Échec du chargement des technologies');
      }

      const json: { technologies: Technology[] } = await response.json();
      const techMap = new Map<string, Technology>();
      json.technologies.forEach((tech) => techMap.set(tech.id, tech));

      return { success: true, data: techMap };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Échec du chargement des technologies'),
      };
    }
  }
}

// === STORE CONFIGURATION ===

const initialState: GameStoreState = {
  gameState: null,
  technologies: new Map(),
  currentNarratives: [],
  epochSummary: null,
  finalChronicle: null,
  isLoading: false,
  error: null,
  selectedTechs: new Set(),
  showNarratives: false,
  gameMode: 'menu',
  soundEnabled: true,
  animationsEnabled: true,
  difficulty: 'normal'
};

export const useGameStore = create<GameStore>()(
  devtools(
    subscribeWithSelector(
      persist(
        immer((set, get) => ({
          ...initialState,

          actions: {
            // === GAME ACTIONS ===

            createGame: async (options = {}) => {
              set(state => {
                state.isLoading = true;
                state.error = null;
                state.gameMode = 'playing';
              });

              try {
                const gameEngine = GameEngineService.getInstance();

                // Load technologies if not loaded
                if (get().technologies.size === 0) {
                  const techResult = await gameEngine.loadTechnologies();
                  if (!techResult.success) {
                    throw techResult.error;
                  }
                  set(state => {
                    state.technologies = techResult.data!;
                  });
                }

                // Create game
                const result = await gameEngine.createGame({
                  difficulty: options.difficulty ?? get().difficulty,
                  playerName: options.playerName
                });

                if (result.success) {
                  set(state => {
                    state.gameState = result.data!;
                    state.selectedTechs = new Set();
                    state.currentNarratives = [];
                    state.epochSummary = null;
                    state.finalChronicle = null;
                    state.showNarratives = false;
                    state.isLoading = false;
                  });

                  return result;
                } else {
                  set(state => {
                    state.error = result.error!.message;
                    state.isLoading = false;
                  });

                  return result;
                }
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                set(state => {
                  state.error = errorMessage;
                  state.isLoading = false;
                });

                return {
                  success: false,
                  error: new Error(errorMessage)
                };
              }
            },

            loadGame: async (gameId: string) => {
              set(state => {
                state.isLoading = true;
                state.error = null;
              });

              const result: Result<GameState> = {
                success: false,
                error: new Error('Load game not implemented yet')
              };

              set(state => {
                state.isLoading = false;
                if (!result.success) {
                  state.error = result.error!.message;
                }
              });

              return result;
            },

            preserveTechnologies: async (techIds) => {
              const gameState = get().gameState;
              if (!gameState) {
                const result = {
                  success: false as const,
                  error: new Error('No active game')
                };
                return result;
              }

              set(state => {
                state.isLoading = true;
                state.error = null;
              });

              try {
                const gameEngine = GameEngineService.getInstance();
                const result = await gameEngine.preserveTechnologies(gameState.gameId, techIds);

                if (result.success) {
                  set(state => {
                    state.gameState = result.data!.newState;
                    state.currentNarratives = [...result.data!.narratives];
                    state.epochSummary = result.data!.epochSummary;
                    state.finalChronicle = result.data!.finalChronicle;
                    state.showNarratives = true;
                    state.selectedTechs = new Set();
                    state.isLoading = false;

                    if (result.data!.isComplete) {
                      state.gameMode = 'completed';
                    }
                  });

                  // Auto-hide narratives after 5 seconds
                  setTimeout(() => {
                    set(state => {
                      state.showNarratives = false;
                    });
                  }, 5000);

                  return result;
                } else {
                  set(state => {
                    state.error = result.error!.message;
                    state.isLoading = false;
                  });

                  return result;
                }
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                set(state => {
                  state.error = errorMessage;
                  state.isLoading = false;
                });

                return {
                  success: false as const,
                  error: new Error(errorMessage)
                };
              }
            },

            resetGame: () => {
              set(state => {
                state.gameState = null;
                state.selectedTechs = new Set();
                state.currentNarratives = [];
                state.epochSummary = null;
                state.finalChronicle = null;
                state.showNarratives = false;
                state.gameMode = 'menu';
                state.error = null;
                state.isLoading = false;
              });
            },

            // === TECHNOLOGY ACTIONS ===

            selectTechnology: (techId) => {
              const { selectedTechs } = get();
              if (selectedTechs.size < 2) {
                set(state => {
                  state.selectedTechs = new Set([...selectedTechs, techId]);
                });
              }
            },

            deselectTechnology: (techId) => {
              const { selectedTechs } = get();
              set(state => {
                const newSelected = new Set(selectedTechs);
                newSelected.delete(techId);
                state.selectedTechs = newSelected;
              });
            },

            clearSelections: () => {
              set(state => {
                state.selectedTechs = new Set();
              });
            },

            // === UI ACTIONS ===

            setNarrativesVisible: (visible) => {
              set(state => {
                state.showNarratives = visible;
              });
            },

            setGameMode: (mode) => {
              set(state => {
                state.gameMode = mode;
              });
            },

            clearError: () => {
              set(state => {
                state.error = null;
              });
            },

            // === SETTINGS ACTIONS ===

            toggleSound: () => {
              set(state => {
                state.soundEnabled = !state.soundEnabled;
              });
            },

            toggleAnimations: () => {
              set(state => {
                state.animationsEnabled = !state.animationsEnabled;
              });
            },

            setDifficulty: (difficulty) => {
              set(state => {
                state.difficulty = difficulty;
              });
            },

            // === COMPUTED GETTERS ===

            getAvailableTechnologies: () => {
              const { gameState, technologies } = get();
              if (!gameState) return [];

              return gameState.availableTechs
                .map(techId => technologies.get(techId))
                .filter((tech): tech is Technology => tech !== undefined);
            },

            getPreservedTechnologies: () => {
              const { gameState, technologies } = get();
              if (!gameState) return [];

              return gameState.preservedTechs
                .map(techId => technologies.get(techId))
                .filter((tech): tech is Technology => tech !== undefined);
            },

            canSelectMore: () => {
              const { selectedTechs } = get();
              return selectedTechs.size < 2;
            },

            getPlayerStats: () => {
              const { gameState } = get();
              if (!gameState) {
                return {
                  turnsPlayed: 0,
                  techsPreserved: 0,
                  currentPeriod: null
                };
              }

              return {
                turnsPlayed: gameState.currentTurn - 1,
                techsPreserved: gameState.preservedTechs.length,
                currentPeriod: gameState.currentPeriod
              };
            }
          }
        })),
        {
          name: 'human-memories-game-store',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            soundEnabled: state.soundEnabled,
            animationsEnabled: state.animationsEnabled,
            difficulty: state.difficulty
          })
        }
      )
    ),
    {
      name: 'human-memories-store',
      enabled: process.env.NODE_ENV === 'development'
    }
  )
);

// === SELECTORS ===

export const useGameState = () => useGameStore(state => state.gameState);
export const useSelectedTechs = () => useGameStore(state => state.selectedTechs);
export const useCurrentNarratives = () => useGameStore(state => state.currentNarratives);
export const useGameMode = () => useGameStore(state => state.gameMode);
export const useIsLoading = () => useGameStore(state => state.isLoading);
export const useGameError = () => useGameStore(state => state.error);

export const useAvailableTechnologies = () =>
  useGameStore(state => state.actions.getAvailableTechnologies());

export const usePreservedTechnologies = () =>
  useGameStore(state => state.actions.getPreservedTechnologies());

export const usePlayerStats = () =>
  useGameStore(state => state.actions.getPlayerStats());

export const useGameSettings = () => useGameStore(state => ({
  soundEnabled: state.soundEnabled,
  animationsEnabled: state.animationsEnabled,
  difficulty: state.difficulty
}));

// === HOOKS ===

export const useGameActions = () => useGameStore(state => state.actions);

export const useTechSelection = () => {
  const selectedTechs = useSelectedTechs();
  const { selectTechnology, deselectTechnology, clearSelections, canSelectMore } = useGameActions();

  const toggleTechnology = (techId: string) => {
    if (selectedTechs.has(techId)) {
      deselectTechnology(techId);
    } else if (canSelectMore()) {
      selectTechnology(techId);
    }
  };

  return {
    selectedTechs,
    selectTechnology,
    deselectTechnology,
    clearSelections,
    toggleTechnology,
    canSelectMore: canSelectMore(),
    selectedCount: selectedTechs.size
  };
};

export const useGameErrorHandler = () => {
  const error = useGameError();
  const clearError = useGameActions().clearError;

  return {
    error,
    clearError,
    hasError: !!error
  };
};

export type { GameStore, GameStoreState, GameStoreActions, Technology, GameState };