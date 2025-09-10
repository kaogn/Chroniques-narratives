// apps/web/store/gameStore.ts
// Human Memories - State Management avec Zustand (patterns 2025)

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  GameState, 
  Technology, 
  GameTurn, 
  PlayerProfile,
  HistoricalPeriod,
  Result 
} from '@shared/types/game';

// === TYPES POUR LE STORE ===

interface GameStoreState {
  // Game state
  gameState: GameState | null;
  technologies: Map<string, Technology>;
  currentNarratives: readonly string[];
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
  createGame: (options?: { difficulty?: 'easy' | 'normal' | 'hard' }) => Promise<Result<GameState>>;
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
    currentPeriod: HistoricalPeriod | null;
  };
}

type GameStore = GameStoreState & { actions: GameStoreActions };

// === CONFIGURATION STORE ===

const initialState: GameStoreState = {
  gameState: null,
  technologies: new Map(),
  currentNarratives: [],
  isLoading: false,
  error: null,
  selectedTechs: new Set(),
  showNarratives: false,
  gameMode: 'menu',
  soundEnabled: true,
  animationsEnabled: true,
  difficulty: 'normal'
};

// === SERVICES EXTERNES ===

// Service pour interactions avec le game engine
class GameEngineService {
  private static instance: GameEngineService;
  
  static getInstance(): GameEngineService {
    if (!GameEngineService.instance) {
      GameEngineService.instance = new GameEngineService();
    }
    return GameEngineService.instance;
  }
  
  async createGame(options: { difficulty?: 'easy' | 'normal' | 'hard' } = {}): Promise<Result<GameState>> {
    try {
      // Simuler appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const gameState: GameState = {
        gameId: crypto.randomUUID(),
        currentTurn: 1,
        currentPeriod: 'prehistoric',
        preservedTechs: [],
        availableTechs: ['fire_control', 'stone_tools', 'agriculture'], // Mock data
        playerProfile: null,
        gameHistory: [],
        isCompleted: false
      };
      
      return { success: true, data: gameState };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Failed to create game') 
      };
    }
  }
  
  async preserveTechnologies(
    gameId: string, 
    techIds: readonly string[]
  ): Promise<Result<{
    narratives: readonly string[];
    newState: GameState;
    isComplete: boolean;
  }>> {
    try {
      // Simuler appel API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock narratives
      const narratives = techIds.map(techId => 
        `La ${techId} résonne dans votre mémoire collective...`
      );
      
      // Mock new state
      const newState: GameState = {
        gameId,
        currentTurn: 2,
        currentPeriod: 'ancient_early',
        preservedTechs: [...techIds],
        availableTechs: ['writing_cuneiform', 'bronze_working', 'wheel'],
        playerProfile: null,
        gameHistory: [],
        isCompleted: false
      };
      
      return {
        success: true,
        data: {
          narratives,
          newState,
          isComplete: false
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to preserve technologies')
      };
    }
  }
  
  async loadTechnologies(): Promise<Result<Map<string, Technology>>> {
    try {
      // Mock technologies data
      const mockTechs: Technology[] = [
        {
          id: 'fire_control',
          name: 'Maîtrise du feu',
          period: 'prehistoric',
          category: 'cultural',
          rarity: 'pillar',
          dateRange: { min: -400000, max: -100000 },
          historicalAccuracy: 5,
          description: 'Contrôle et usage domestique du feu',
          dependencies: {
            prerequisites: [],
            enables: ['pottery', 'bronze_working'],
            blocks: [],
            synergies: []
          },
          effects: {
            military: 1,
            cultural: 2,
            economic: 1,
            social: 2,
            exploration: 1
          },
          narrative: {
            memoryWord: 'flamme',
            wordVariants: ['feu', 'brasier', 'foyer'],
            immediate: ['La flamme accepta de cohabiter avec l\'humanité.'],
            epochTemplate: 'La {memoryWord} transforma cette époque...',
            finalTemplate: 'Depuis la {memoryWord} primitive...'
          }
        },
        // Ajouter d'autres technologies mock...
      ];
      
      const techMap = new Map<string, Technology>();
      mockTechs.forEach(tech => techMap.set(tech.id, tech));
      
      return { success: true, data: techMap };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to load technologies')
      };
    }
  }
}

// === STORE PRINCIPAL ===

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
                    state.technologies = techResult.data;
                  });
                }
                
                // Create game
                const result = await gameEngine.createGame({
                  difficulty: options.difficulty ?? get().difficulty
                });
                
                if (result.success) {
                  set(state => {
                    state.gameState = result.data;
                    state.selectedTechs = new Set();
                    state.currentNarratives = [];
                    state.showNarratives = false;
                    state.isLoading = false;
                  });
                  
                  return result;
                } else {
                  set(state => {
                    state.error = result.error.message;
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
              
              // Implementation du load game
              // Pour le moment, retourner une erreur
              const result: Result<GameState> = {
                success: false,
                error: new Error('Load game not implemented yet')
              };
              
              set(state => {
                state.isLoading = false;
                if (!result.success) {
                  state.error = result.error.message;
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
                    state.gameState = result.data.newState;
                    state.currentNarratives = result.data.narratives;
                    state.showNarratives = true;
                    state.selectedTechs = new Set();
                    state.isLoading = false;
                    
                    if (result.data.isComplete) {
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
                    state.error = result.error.message;
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
          // Persister seulement les settings, pas l'état du jeu
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

// === SELECTORS OPTIMISÉS ===

// Selectors avec shallow comparison pour éviter les re-renders
export const useGameState = () => useGameStore(state => state.gameState);
export const useSelectedTechs = () => useGameStore(state => state.selectedTechs);
export const useCurrentNarratives = () => useGameStore(state => state.currentNarratives);
export const useGameMode = () => useGameStore(state => state.gameMode);
export const useIsLoading = () => useGameStore(state => state.isLoading);
export const useGameError = () => useGameStore(state => state.error);

// Selector composé pour les technologies disponibles
export const useAvailableTechnologies = () => 
  useGameStore(state => state.actions.getAvailableTechnologies());

// Selector composé pour les technologies préservées
export const usePreservedTechnologies = () =>
  useGameStore(state => state.actions.getPreservedTechnologies());

// Selector pour les statistiques du joueur
export const usePlayerStats = () =>
  useGameStore(state => state.actions.getPlayerStats());

// Settings selectors
export const useGameSettings = () => useGameStore(state => ({
  soundEnabled: state.soundEnabled,
  animationsEnabled: state.animationsEnabled,
  difficulty: state.difficulty
}));

// === HOOKS PERSONNALISÉS ===

// Hook pour les actions du jeu
export const useGameActions = () => useGameStore(state => state.actions);

// Hook pour la gestion des sélections
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

// Hook pour la gestion des erreurs
export const useGameErrorHandler = () => {
  const error = useGameError();
  const clearError = useGameActions().clearError;
  
  return {
    error,
    clearError,
    hasError: !!error
  };
};

// === MIDDLEWARE PERSONNALISÉ POUR LES ANALYTICS ===

// Middleware pour tracker les événements importants
const analyticsMiddleware = (config: any) => (set: any, get: any, api: any) =>
  config(
    (partial: any, replace?: boolean) => {
      // Track state changes for analytics
      const prevState = get();
      set(partial, replace);
      const newState = get();
      
      // Exemple de tracking
      if (prevState.gameMode !== newState.gameMode) {
        console.log('Game mode changed:', prevState.gameMode, '→', newState.gameMode);
        // Ici on pourrait envoyer à un service d'analytics
      }
      
      if (prevState.selectedTechs.size !== newState.selectedTechs.size) {
        console.log('Selection changed:', newState.selectedTechs.size, 'technologies selected');
      }
    },
    get,
    api
  );

// Export du type pour usage externe
export type { GameStore, GameStoreState, GameStoreActions };