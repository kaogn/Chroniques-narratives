// packages/game-engine/src/core/GameEngine.ts
// Human Memories - Game Engine avec patterns 2025

import { z } from 'zod';
import type {
  Technology,
  GameState,
  HistoricalPeriod,
  GameTurn,
  PlayerProfile,
  TechCategory,
  Result
} from '@shared/types/game';

// Event System moderne avec EventTarget
export class GameEventEmitter extends EventTarget {
  emit<T>(type: string, detail: T): boolean {
    return this.dispatchEvent(new CustomEvent(type, { detail }));
  }
  
  on<T>(type: string, listener: (event: CustomEvent<T>) => void): void {
    this.addEventListener(type, listener as EventListener);
  }
  
  off<T>(type: string, listener: (event: CustomEvent<T>) => void): void {
    this.removeEventListener(type, listener as EventListener);
  }
}

// Configuration avec Zod validation
const GameConfigSchema = z.object({
  maxTechsPerTurn: z.number().int().min(2).max(5).default(3),
  maxPreservedPerTurn: z.number().int().min(1).max(3).default(2),
  totalTurns: z.number().int().min(6).max(12).default(8),
  difficulty: z.enum(['easy', 'normal', 'hard']).default('normal'),
  enableSynergies: z.boolean().default(true),
  narrativeMode: z.enum(['minimal', 'standard', 'verbose']).default('standard')
});

type GameConfig = z.infer<typeof GameConfigSchema>;

// Dependency Injection Pattern
interface GameServices {
  readonly techDatabase: TechDatabase;
  readonly narrativeEngine: NarrativeEngine;
  readonly playerAnalyzer: PlayerAnalyzer;
  readonly persistenceService: PersistenceService;
}

// Main Game Engine Class (2025 patterns)
export class GameEngine {
  private readonly eventEmitter = new GameEventEmitter();
  private readonly config: GameConfig;
  private gameState: GameState | null = null;
  
  constructor(
    private readonly services: GameServices,
    config: Partial<GameConfig> = {}
  ) {
    // Validate configuration avec Zod
    this.config = GameConfigSchema.parse(config);
    
    // Setup event listeners
    this.setupEventListeners();
  }
  
  // === PUBLIC API ===
  
  /**
   * Créer une nouvelle partie
   */
  async createGame(options: {
    readonly playerName?: string;
    readonly difficulty?: 'easy' | 'normal' | 'hard';
  } = {}): Promise<Result<GameState>> {
    try {
      const gameId = crypto.randomUUID();
      const difficulty = options.difficulty ?? this.config.difficulty;
      
      // Initialize game state
      const initialState: GameState = {
        gameId,
        currentTurn: 1,
        currentPeriod: 'prehistoric',
        preservedTechs: [],
        availableTechs: [],
        playerProfile: null,
        gameHistory: [],
        isCompleted: false
      };
      
      // Générer les premières technologies
      const firstTurnTechs = await this.generateTurnTechnologies('prehistoric');
      
      this.gameState = {
        ...initialState,
        availableTechs: firstTurnTechs.map(tech => tech.id)
      };
      
      // Persister l'état
      await this.services.persistenceService.saveGameState(this.gameState);
      
      // Émettre événement
      this.eventEmitter.emit('game_created', { gameId, difficulty });
      
      return { success: true, data: this.gameState };
      
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }
  
  /**
   * Préserver des technologies (2025 pattern avec validation)
   */
  async preserveTechnologies(
    techIds: readonly string[]
  ): Promise<Result<{ 
    readonly updatedState: GameState; 
    readonly narratives: readonly string[];
    readonly isGameComplete: boolean;
  }>> {
    if (!this.gameState) {
      return { success: false, error: new Error('No active game') };
    }
    
    // Validation des choix
    const validationResult = await this.validateTechSelection(techIds);
    if (!validationResult.success) {
      return validationResult;
    }
    
    try {
      // Préserver les technologies
      const preservedTechs = [...this.gameState.preservedTechs, ...techIds];
      
      // Générer narratives immédiates
      const narratives = await Promise.all(
        techIds.map(techId => 
          this.services.narrativeEngine.generateImmediate(techId)
        )
      );
      
      // Créer l'historique du tour
      const currentTurn: GameTurn = {
        turn: this.gameState.currentTurn,
        period: this.gameState.currentPeriod,
        offeredTechs: this.gameState.availableTechs,
        chosenTechs: techIds,
        timestamp: new Date()
      };
      
      // Vérifier si c'est le dernier tour
      const isLastTurn = this.gameState.currentTurn >= this.config.totalTurns;
      
      let updatedState: GameState;
      
      if (isLastTurn) {
        // Compléter la partie
        const playerProfile = await this.services.playerAnalyzer.analyze([
          ...this.gameState.gameHistory,
          currentTurn
        ]);
        
        updatedState = {
          ...this.gameState,
          preservedTechs,
          playerProfile,
          gameHistory: [...this.gameState.gameHistory, currentTurn],
          isCompleted: true
        };
        
        this.eventEmitter.emit('game_completed', { gameId: this.gameState.gameId });
        
      } else {
        // Passer au tour suivant
        const nextTurn = this.gameState.currentTurn + 1;
        const nextPeriod = this.getNextPeriod(this.gameState.currentPeriod);
        const nextTechs = await this.generateTurnTechnologies(nextPeriod, preservedTechs);
        
        updatedState = {
          ...this.gameState,
          currentTurn: nextTurn,
          currentPeriod: nextPeriod,
          preservedTechs,
          availableTechs: nextTechs.map(tech => tech.id),
          gameHistory: [...this.gameState.gameHistory, currentTurn]
        };
        
        this.eventEmitter.emit('turn_completed', { turn: nextTurn });
      }
      
      // Persister le nouvel état
      this.gameState = updatedState;
      await this.services.persistenceService.saveGameState(this.gameState);
      
      return {
        success: true,
        data: {
          updatedState,
          narratives,
          isGameComplete: isLastTurn
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to preserve technologies')
      };
    }
  }
  
  /**
   * Générer la chronique finale
   */
  async generateFinalChronicle(): Promise<Result<{
    readonly chronicle: string;
    readonly reflection: string;
    readonly epitaph: string;
  }>> {
    if (!this.gameState?.isCompleted || !this.gameState.playerProfile) {
      return { success: false, error: new Error('Game not completed') };
    }
    
    try {
      const chronicle = await this.services.narrativeEngine.generateFinalChronicle(
        this.gameState.gameHistory,
        this.gameState.preservedTechs
      );
      
      const reflection = await this.services.narrativeEngine.generateReflection(
        this.gameState.playerProfile
      );
      
      const epitaph = await this.services.narrativeEngine.generateEpitaph(
        this.gameState.playerProfile
      );
      
      return {
        success: true,
        data: { chronicle, reflection, epitaph }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to generate final chronicle')
      };
    }
  }
  
  // === PRIVATE METHODS ===
  
  private async generateTurnTechnologies(
    period: HistoricalPeriod,
    preservedTechs: readonly string[] = []
  ): Promise<Technology[]> {
    // Obtenir toutes les technologies de la période
    const periodTechs = await this.services.techDatabase.getTechnologiesByPeriod(period);
    
    // Filtrer selon les dépendances
    const availableTechs = periodTechs.filter(tech => 
      this.services.techDatabase.canTechAppear(tech.id, preservedTechs)
    );
    
    // Appliquer la rareté
    const weightedTechs = this.applyRarityWeights(availableTechs);
    
    // Sélectionner aléatoirement
    return this.selectRandomTechnologies(weightedTechs, this.config.maxTechsPerTurn);
  }
  
  private applyRarityWeights(techs: Technology[]): Array<{ tech: Technology; weight: number }> {
    const rarityWeights = {
      pillar: 1.0,
      common: 0.7,
      uncommon: 0.4,
      rare: 0.15,
      legendary: 0.05
    };
    
    // Ajuster selon la difficulté
    const difficultyMultiplier = {
      easy: { rare: 0.5, legendary: 0.2 },
      normal: { rare: 1.0, legendary: 1.0 },
      hard: { rare: 1.5, legendary: 2.0 }
    }[this.config.difficulty];
    
    return techs.map(tech => ({
      tech,
      weight: rarityWeights[tech.rarity] * (difficultyMultiplier[tech.rarity] ?? 1.0)
    }));
  }
  
  private selectRandomTechnologies(
    weightedTechs: Array<{ tech: Technology; weight: number }>,
    count: number
  ): Technology[] {
    const selected: Technology[] = [];
    const available = [...weightedTechs];
    
    for (let i = 0; i < count && available.length > 0; i++) {
      const totalWeight = available.reduce((sum, item) => sum + item.weight, 0);
      let random = Math.random() * totalWeight;
      
      for (let j = 0; j < available.length; j++) {
        random -= available[j]!.weight;
        if (random <= 0) {
          selected.push(available[j]!.tech);
          available.splice(j, 1);
          break;
        }
      }
    }
    
    return selected;
  }
  
  private async validateTechSelection(techIds: readonly string[]): Promise<Result<void>> {
    if (!this.gameState) {
      return { success: false, error: new Error('No active game') };
    }
    
    // Vérifier le nombre de sélections
    if (techIds.length === 0 || techIds.length > this.config.maxPreservedPerTurn) {
      return {
        success: false,
        error: new Error(`Must select 1-${this.config.maxPreservedPerTurn} technologies`)
      };
    }
    
    // Vérifier que les technologies sont disponibles
    for (const techId of techIds) {
      if (!this.gameState.availableTechs.includes(techId)) {
        return {
          success: false,
          error: new Error(`Technology ${techId} not available`)
        };
      }
    }
    
    // Vérifier les doublons
    if (new Set(techIds).size !== techIds.length) {
      return {
        success: false,
        error: new Error('Cannot select the same technology twice')
      };
    }
    
    return { success: true, data: undefined };
  }
  
  private getNextPeriod(currentPeriod: HistoricalPeriod): HistoricalPeriod {
    const periods: HistoricalPeriod[] = [
      'prehistoric',
      'ancient_early', 
      'ancient_classical',
      'medieval_early',
      'medieval_late',
      'renaissance',
      'industrial',
      'contemporary'
    ];
    
    const currentIndex = periods.indexOf(currentPeriod);
    return periods[currentIndex + 1] ?? 'contemporary';
  }
  
  private setupEventListeners(): void {
    this.eventEmitter.on('game_created', (event) => {
      console.log('Game created:', event.detail);
    });
    
    this.eventEmitter.on('turn_completed', (event) => {
      console.log('Turn completed:', event.detail);
    });
    
    this.eventEmitter.on('game_completed', (event) => {
      console.log('Game completed:', event.detail);
    });
  }
  
  // === GETTERS ===
  
  get currentState(): GameState | null {
    return this.gameState;
  }
  
  get configuration(): GameConfig {
    return { ...this.config };
  }
  
  get events(): GameEventEmitter {
    return this.eventEmitter;
  }
}

// === SERVICES INTERFACES ===

export interface TechDatabase {
  getTechnologiesByPeriod(period: HistoricalPeriod): Promise<Technology[]>;
  getTechnologyById(id: string): Promise<Technology | null>;
  canTechAppear(techId: string, preservedTechs: readonly string[]): boolean;
  validateDependencies(): Promise<Result<void>>;
}

export interface NarrativeEngine {
  generateImmediate(techId: string): Promise<string>;
  generateEpochSummary(turn: GameTurn, preservedTechs: readonly string[]): Promise<string>;
  generateFinalChronicle(history: readonly GameTurn[], preservedTechs: readonly string[]): Promise<string>;
  generateReflection(profile: PlayerProfile): Promise<string>;
  generateEpitaph(profile: PlayerProfile): Promise<string>;
}

export interface PlayerAnalyzer {
  analyze(gameHistory: readonly GameTurn[]): Promise<PlayerProfile>;
  calculateEffectTotals(gameHistory: readonly GameTurn[]): Promise<Record<TechCategory, number>>;
  determineRiskTolerance(gameHistory: readonly GameTurn[]): Promise<'conservative' | 'balanced' | 'aggressive'>;
}

export interface PersistenceService {
  saveGameState(state: GameState): Promise<void>;
  loadGameState(gameId: string): Promise<GameState | null>;
  deleteGameState(gameId: string): Promise<void>;
  listSavedGames(): Promise<readonly { gameId: string; lastPlayed: Date; turn: number }[]>;
}

// === FACTORY PATTERN ===

export class GameEngineFactory {
  static async create(
    options: {
      readonly techDatabaseUrl?: string;
      readonly persistenceAdapter?: 'localStorage' | 'indexedDB' | 'api';
      readonly config?: Partial<GameConfig>;
    } = {}
  ): Promise<GameEngine> {
    // Créer les services
    const techDatabase = await TechDatabaseImpl.create(options.techDatabaseUrl);
    const narrativeEngine = new NarrativeEngineImpl(techDatabase);
    const playerAnalyzer = new PlayerAnalyzerImpl(techDatabase);
    const persistenceService = PersistenceServiceFactory.create(
      options.persistenceAdapter ?? 'localStorage'
    );
    
    const services: GameServices = {
      techDatabase,
      narrativeEngine,
      playerAnalyzer,
      persistenceService
    };
    
    return new GameEngine(services, options.config);
  }
}

// === USAGE EXAMPLE ===

/*
// Utilisation moderne du GameEngine
async function playGame() {
  // Créer le moteur avec factory
  const gameEngine = await GameEngineFactory.create({
    config: { 
      difficulty: 'normal',
      maxTechsPerTurn: 3,
      maxPreservedPerTurn: 2 
    }
  });
  
  // Écouter les événements
  gameEngine.events.on('turn_completed', (event) => {
    console.log(`Tour ${event.detail.turn} terminé`);
  });
  
  // Créer une partie
  const createResult = await gameEngine.createGame({
    playerName: 'Player1',
    difficulty: 'normal'
  });
  
  if (!createResult.success) {
    throw createResult.error;
  }
  
  const gameState = createResult.data;
  console.log('Jeu créé:', gameState);
  
  // Jouer un tour
  const preserveResult = await gameEngine.preserveTechnologies(['fire_control', 'stone_tools']);
  
  if (!preserveResult.success) {
    throw preserveResult.error;
  }
  
  const { updatedState, narratives, isGameComplete } = preserveResult.data;
  
  console.log('Technologies préservées:', narratives);
  
  if (isGameComplete) {
    const chronicleResult = await gameEngine.generateFinalChronicle();
    if (chronicleResult.success) {
      console.log('Chronique finale:', chronicleResult.data);
    }
  }
}
*/

export type { GameConfig, GameServices };