# TypeScript Configurations 2025 - Human Memories

## 🎯 **TypeScript Strict Configurations**

### **packages/config/typescript-config/base.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    
    // Strict Mode (2025 standards)
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "allowUnusedLabels": false,
    "allowUnreachableCode": false,
    
    // Module resolution
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    
    // Output
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    
    // Performance
    "skipLibCheck": true,
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo",
    
    // Paths
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "exclude": [
    "node_modules",
    "dist",
    "build",
    "coverage"
  ]
}
```

### **packages/config/typescript-config/nextjs.json**
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["DOM", "DOM.Iterable", "ES2017"],
    "allowJs": true,
    "jsx": "preserve",
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/store/*": ["./src/store/*"],
      "@/types/*": ["./src/types/*"],
      "@ui/*": ["../../packages/ui/src/*"],
      "@game-engine/*": ["../../packages/game-engine/src/*"],
      "@shared/*": ["../../packages/shared/src/*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ]
}
```

### **packages/config/typescript-config/library.json**
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["src/**/*.test.ts", "src/**/*.spec.ts"]
}
```

---

## 🎭 **Types Definitions (2025 Patterns)**

### **packages/shared/src/types/game.ts**
```typescript
import { z } from 'zod';

// Zod schemas pour validation runtime
export const HistoricalPeriodSchema = z.enum([
  'prehistoric',
  'ancient_early', 
  'ancient_classical',
  'medieval_early',
  'medieval_late',
  'renaissance',
  'industrial',
  'contemporary'
]);

export const TechRaritySchema = z.enum([
  'pillar',
  'common', 
  'uncommon',
  'rare',
  'legendary'
]);

export const TechCategorySchema = z.enum([
  'military',
  'cultural',
  'economic', 
  'social',
  'exploration',
  'industrial',
  'scientific'
]);

// Types TypeScript dérivés des schemas Zod
export type HistoricalPeriod = z.infer<typeof HistoricalPeriodSchema>;
export type TechRarity = z.infer<typeof TechRaritySchema>;
export type TechCategory = z.infer<typeof TechCategorySchema>;

// Interfaces complexes avec types stricts
export interface TechEffects {
  readonly military: number;
  readonly cultural: number; 
  readonly economic: number;
  readonly social: number;
  readonly exploration: number;
}

export const TechEffectsSchema = z.object({
  military: z.number().int().min(-3).max(3),
  cultural: z.number().int().min(-3).max(3),
  economic: z.number().int().min(-3).max(3),
  social: z.number().int().min(-3).max(3),
  exploration: z.number().int().min(-3).max(3)
});

export interface TechSynergy {
  readonly with: readonly string[];
  readonly effect: string;
  readonly description: string;
}

export interface TechDependencies {
  readonly prerequisites: readonly string[];
  readonly enables: readonly string[];
  readonly blocks: readonly string[];
  readonly synergies: readonly TechSynergy[];
}

export interface TechNarrative {
  readonly memoryWord: string;
  readonly wordVariants: readonly string[];
  readonly immediate: readonly string[];
  readonly epochTemplate: string;
  readonly finalTemplate: string;
}

export interface Technology {
  readonly id: string;
  readonly name: string;
  readonly period: HistoricalPeriod;
  readonly category: TechCategory;
  readonly rarity: TechRarity;
  readonly dateRange: {
    readonly min: number;
    readonly max: number;
  };
  readonly historicalAccuracy: 1 | 2 | 3 | 4 | 5;
  readonly description: string;
  readonly dependencies: TechDependencies;
  readonly effects: TechEffects;
  readonly narrative: TechNarrative;
}

// Schema Zod complet pour validation
export const TechnologySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  period: HistoricalPeriodSchema,
  category: TechCategorySchema,
  rarity: TechRaritySchema,
  dateRange: z.object({
    min: z.number().int(),
    max: z.number().int()
  }),
  historicalAccuracy: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  description: z.string().min(1),
  dependencies: z.object({
    prerequisites: z.array(z.string()).readonly(),
    enables: z.array(z.string()).readonly(),
    blocks: z.array(z.string()).readonly(),
    synergies: z.array(z.object({
      with: z.array(z.string()).readonly(),
      effect: z.string(),
      description: z.string()
    })).readonly()
  }),
  effects: TechEffectsSchema,
  narrative: z.object({
    memoryWord: z.string().min(1),
    wordVariants: z.array(z.string()).readonly(),
    immediate: z.array(z.string()).min(2).readonly(),
    epochTemplate: z.string().min(1),
    finalTemplate: z.string().min(1)
  })
});

// Types pour l'état du jeu
export interface GameState {
  readonly gameId: string;
  readonly currentTurn: number;
  readonly currentPeriod: HistoricalPeriod;
  readonly preservedTechs: readonly string[];
  readonly availableTechs: readonly string[];
  readonly playerProfile: PlayerProfile | null;
  readonly gameHistory: readonly GameTurn[];
  readonly isCompleted: boolean;
}

export interface GameTurn {
  readonly turn: number;
  readonly period: HistoricalPeriod;
  readonly offeredTechs: readonly string[];
  readonly chosenTechs: readonly string[];
  readonly timestamp: Date;
}

export interface PlayerProfile {
  readonly primaryFocus: TechCategory;
  readonly secondaryFocus: TechCategory | null;
  readonly riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  readonly consistency: number; // 0-1
  readonly specialization: number; // 0-1
}

// Utility types (2025 patterns)
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type NonEmptyArray<T> = readonly [T, ...T[]];

export type TechId = Technology['id'];
export type TechName = Technology['name'];

// Branded types pour plus de sécurité
export type GameId = string & { readonly __brand: 'GameId' };
export type TechEffectValue = number & { readonly __brand: 'TechEffect'; readonly __min: -3; readonly __max: 3 };

// Result type pour gestion d'erreurs (2025 pattern)
export type Result<T, E = Error> = 
  | { readonly success: true; readonly data: T }
  | { readonly success: false; readonly error: E };

// Event types pour le système d'événements
export interface GameEvent {
  readonly type: string;
  readonly payload: unknown;
  readonly timestamp: Date;
}

export interface TechPreservedEvent extends GameEvent {
  readonly type: 'tech_preserved';
  readonly payload: {
    readonly techId: string;
    readonly turn: number;
  };
}

export interface TurnCompletedEvent extends GameEvent {
  readonly type: 'turn_completed';
  readonly payload: {
    readonly turn: number;
    readonly preservedTechs: readonly string[];
  };
}

export type GameEvents = TechPreservedEvent | TurnCompletedEvent;
```

### **packages/shared/src/types/api.ts**
```typescript
import { z } from 'zod';
import type { Technology, GameState, GameId, HistoricalPeriod } from './game';

// API Request/Response types avec validation Zod

// Game Management
export const CreateGameRequestSchema = z.object({
  playerName: z.string().min(1).max(50).optional(),
  difficulty: z.enum(['easy', 'normal', 'hard']).default('normal'),
  endPeriod: z.string().default('contemporary')
});

export type CreateGameRequest = z.infer<typeof CreateGameRequestSchema>;

export const CreateGameResponseSchema = z.object({
  gameId: z.string(),
  initialState: z.object({
    currentTurn: z.number(),
    currentPeriod: z.string(),
    availableTechs: z.array(z.string())
  })
});

export type CreateGameResponse = z.infer<typeof CreateGameResponseSchema>;

// Technology Selection
export const PreserveTechRequestSchema = z.object({
  gameId: z.string(),
  techIds: z.array(z.string()).min(1).max(2)
});

export type PreserveTechRequest = z.infer<typeof PreserveTechRequestSchema>;

export const PreserveTechResponseSchema = z.object({
  success: z.boolean(),
  newState: z.object({
    currentTurn: z.number(),
    preservedTechs: z.array(z.string()),
    narrative: z.object({
      immediate: z.array(z.string()),
      epochSummary: z.string().optional()
    })
  }),
  nextTurn: z.object({
    availableTechs: z.array(z.string()),
    period: z.string()
  }).optional()
});

export type PreserveTechResponse = z.infer<typeof PreserveTechResponseSchema>;

// Game Completion
export const CompleteGameResponseSchema = z.object({
  finalChronicle: z.string(),
  playerProfile: z.object({
    primaryFocus: z.string(),
    secondaryFocus: z.string().nullable(),
    riskTolerance: z.enum(['conservative', 'balanced', 'aggressive']),
    consistency: z.number().min(0).max(1),
    specialization: z.number().min(0).max(1)
  }),
  epitaph: z.string(),
  stats: z.object({
    totalTurns: z.number(),
    techsPreserved: z.number(),
    techsLost: z.number(),
    gameplayTime: z.number()
  })
});

export type CompleteGameResponse = z.infer<typeof CompleteGameResponseSchema>;

// Error handling
export const ApiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.unknown().optional()
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

// Generic API Response wrapper
export const ApiResponseSchema = <T>(dataSchema: z.ZodType<T>) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: ApiErrorSchema.optional(),
  timestamp: z.date()
});

export type ApiResponse<T> = {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: ApiError;
  readonly timestamp: Date;
};
```

---

## 🧪 **Testing Configuration (2025)**

### **packages/config/vitest-config/base.ts**
```typescript
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export const createVitestConfig = (projectRoot: string) =>
  defineConfig({
    test: {
      globals: true,
      environment: 'happy-dom',
      setupFiles: [resolve(projectRoot, 'test/setup.ts')],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary', 'html'],
        exclude: [
          'node_modules/',
          'test/',
          '**/*.d.ts',
          '**/*.config.*',
          '**/index.ts' // barrel exports
        ],
        thresholds: {
          global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80
          }
        }
      },
      typecheck: {
        checker: 'tsc',
        tsconfig: resolve(projectRoot, 'tsconfig.json')
      }
    },
    resolve: {
      alias: {
        '@': resolve(projectRoot, 'src'),
        '@shared': resolve(projectRoot, '../../packages/shared/src'),
        '@game-engine': resolve(projectRoot, '../../packages/game-engine/src'),
        '@ui': resolve(projectRoot, '../../packages/ui/src')
      }
    }
  });
```

### **test/setup.ts (Global)**
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
  
  // Reset all mocks
  vi.clearAllMocks();
});

// Mock IntersectionObserver
const intersectionObserverMock = () => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  unobserve: vi.fn()
});

window.IntersectionObserver = vi.fn().mockImplementation(intersectionObserverMock);

// Mock ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/'
}));
```

---

## 🔧 **Development Tools (2025)**

### **.vscode/settings.json**
```json
{
  "typescript.preferences.preferTypeOnlyAutoImports": true,
  "typescript.suggest.autoImports": true,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "typescript",
    "typescriptreact": "typescriptreact"
  },
  "biome.enabled": true,
  "eslint.enable": false,
  "prettier.enable": false
}
```

### **.vscode/extensions.json**
```json
{
  "recommendations": [
    "biomejs.biome",
    "bradlc.vscode-tailwindcss", 
    "ms-playwright.playwright",
    "vitest.explorer",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

Cette configuration TypeScript 2025 offre :

✅ **Type Safety Maximale** - Strict mode + options avancées
✅ **Validation Runtime** - Zod schemas pour API safety  
✅ **Performance Optimisée** - Incremental builds + path mapping
✅ **Developer Experience** - VSCode intégration parfaite
✅ **Testing Moderne** - Vitest + Happy DOM + coverage
✅ **Monorepo Ready** - Configurations partagées et réutilisables

Le next step sera l'implémentation du moteur de jeu avec ces types stricts ! 🚀