# Human Memories - Setup Projet 2025

## 🚀 Stack Technologique Moderne

### **Frontend (2025 Standards)**
- **Next.js 15** + App Router + Server Components
- **TypeScript 5.7** avec strict mode + noUncheckedIndexedAccess
- **Tailwind CSS 4.0** + CSS Variables pour themes
- **Radix UI** + **shadcn/ui** pour composants accessibles
- **Framer Motion 12** pour animations fluides
- **Zustand 5** pour state management simple
- **React Query v5 (TanStack Query)** pour server state
- **Zod** pour validation runtime + schema

### **Backend (2025 Standards)**
- **Fastify 5** (plus rapide que Express)
- **Prisma 6** + PostgreSQL 16
- **Drizzle ORM** (alternative moderne à Prisma)
- **Lucia Auth** pour authentification moderne
- **Hono** (alternative ultra-rapide à Fastify)
- **tRPC 11** pour type-safe API
- **Bun** ou **Node.js 22** avec ESM natif

### **Monorepo & Tooling (2025)**
- **pnpm 9** (package manager rapide)
- **Turborepo 2** pour monorepo optimization
- **Biome** (remplace ESLint + Prettier, 100x plus rapide)
- **Vitest 2** + **Testing Library** pour tests
- **Playwright 2** pour E2E tests
- **Storybook 8** pour composants UI
- **Changesets** pour versioning

### **DevOps & Déploiement (2025)**
- **Docker Multi-stage** avec distroless images
- **GitHub Actions** avec cache avancé
- **Vercel** ou **Cloudflare Pages** pour frontend
- **Railway** ou **Supabase** pour backend
- **Turso** (SQLite edge) ou **PlanetScale** pour DB
- **Sentry 8** pour monitoring
- **Posthog** pour analytics privacy-first

---

## 📁 Structure Monorepo (Turborepo)

```
human-memories/
├── apps/
│   ├── web/                    # Next.js 15 app
│   │   ├── app/               # App Router
│   │   │   ├── (game)/        # Route groups
│   │   │   │   ├── play/
│   │   │   │   └── history/
│   │   │   ├── api/           # API routes
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/        # UI components
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── game/         # Game-specific components
│   │   │   └── layout/       # Layout components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── lib/              # Utilities
│   │   ├── store/            # Zustand stores
│   │   └── types/            # TypeScript types
│   │
│   ├── api/                   # Backend API (Fastify/Hono)
│   │   ├── src/
│   │   │   ├── routes/       # API routes
│   │   │   ├── services/     # Business logic
│   │   │   ├── middleware/   # Custom middleware
│   │   │   └── index.ts     # App entry point
│   │   ├── prisma/          # Database schema
│   │   └── drizzle/         # Alternative: Drizzle schema
│   │
│   └── docs/                 # Documentation (VitePress)
│       ├── .vitepress/
│       ├── guide/
│       └── api/
│
├── packages/
│   ├── ui/                   # Shared UI components
│   │   ├── src/
│   │   │   ├── components/  # Reusable components
│   │   │   ├── hooks/       # Shared hooks
│   │   │   └── utils/       # UI utilities
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── game-engine/         # Core game logic
│   │   ├── src/
│   │   │   ├── core/        # Game engine
│   │   │   │   ├── GameEngine.ts
│   │   │   │   ├── TechManager.ts
│   │   │   │   └── DependencyGraph.ts
│   │   │   ├── narrative/   # Story generation
│   │   │   │   ├── NarrativeEngine.ts
│   │   │   │   └── EchoSystem.ts
│   │   │   ├── data/        # Data management
│   │   │   │   ├── TechDatabase.ts
│   │   │   │   └── Validator.ts
│   │   │   └── types/       # Core types
│   │   ├── tests/          # Unit tests
│   │   └── package.json
│   │
│   ├── shared/              # Types et utils partagés
│   │   ├── src/
│   │   │   ├── types/       # Types communs
│   │   │   │   ├── game.ts
│   │   │   │   ├── tech.ts
│   │   │   │   └── narrative.ts
│   │   │   ├── utils/       # Utilitaires
│   │   │   ├── constants/   # Constantes
│   │   │   └── schemas/     # Zod schemas
│   │   └── package.json
│   │
│   └── config/              # Configurations partagées
│       ├── eslint-config/   # ESLint config (si pas Biome)
│       ├── tailwind-config/ # Tailwind config
│       ├── typescript-config/ # TypeScript configs
│       └── vitest-config/   # Vitest config
│
├── tooling/
│   ├── biome.json          # Biome configuration
│   ├── turbo.json          # Turborepo config
│   └── docker/             # Docker configurations
│
├── data/
│   ├── technologies.json   # Database des technologies
│   ├── narratives.json    # Templates narratifs
│   └── migrations/        # Scripts de migration
│
├── .github/
│   ├── workflows/         # GitHub Actions
│   │   ├── ci.yml
│   │   ├── deploy.yml
│   │   └── release.yml
│   └── dependabot.yml
│
├── package.json           # Root package.json
├── pnpm-workspace.yaml   # pnpm workspace config
├── turbo.json            # Turborepo pipeline
├── docker-compose.yml    # Local development
└── README.md
```

---

## ⚙️ Configuration Files

### **package.json (root)**
```json
{
  "name": "human-memories",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "biome check",
    "lint:fix": "biome check --fix",
    "format": "biome format --write",
    "test": "turbo test",
    "test:e2e": "turbo test:e2e",
    "type-check": "turbo type-check",
    "clean": "turbo clean && rm -rf node_modules",
    "db:push": "turbo db:push",
    "db:generate": "turbo db:generate"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.8.0",
    "turbo": "^2.0.0",
    "typescript": "^5.7.0"
  },
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### **turbo.json**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"],
      "env": ["NODE_ENV"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.{ts,tsx}", "test/**/*.{ts,tsx}"]
    },
    "type-check": {
      "dependsOn": ["^type-check"],
      "outputs": []
    }
  },
  "globalEnv": [
    "NODE_ENV",
    "DATABASE_URL",
    "NEXTAUTH_SECRET"
  ]
}
```

### **biome.json**
```json
{
  "$schema": "https://biomejs.dev/schemas/1.8.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "complexity": {
        "noExcessiveCognitiveComplexity": "error"
      },
      "correctness": {
        "noUndeclaredVariables": "error",
        "noUnusedVariables": "error"
      },
      "style": {
        "useConsistentArrayType": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "always"
    }
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  }
}
```

### **pnpm-workspace.yaml**
```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tooling/*'

catalogs:
  main:
    react: ^18.3.0
    typescript: ^5.7.0
    '@types/node': ^22.0.0
    zod: ^3.23.0
  
  ui:
    '@radix-ui/react-dialog': ^1.1.0
    '@radix-ui/react-dropdown-menu': ^2.1.0
    'framer-motion': ^12.0.0
    'tailwindcss': ^4.0.0
  
  backend:
    fastify: ^5.0.0
    prisma: ^6.0.0
    '@lucia-auth/adapter-prisma': ^4.0.0
```

---

## 🎯 Patterns Modernes 2025

### **1. Server Components + Client Components**
```tsx
// app/game/page.tsx (Server Component)
import { GameClient } from '@/components/game/GameClient';
import { getTechnologies } from '@/lib/data';

export default async function GamePage() {
  const technologies = await getTechnologies();
  
  return (
    <main className="container mx-auto px-4 py-8">
      <GameClient technologies={technologies} />
    </main>
  );
}

// components/game/GameClient.tsx (Client Component)
'use client';
import { useState, useTransition } from 'react';
import { Technology } from '@/types/game';

interface Props {
  technologies: Technology[];
}

export function GameClient({ technologies }: Props) {
  const [isPending, startTransition] = useTransition();
  const [gameState, setGameState] = useState(initialState);
  
  const handleTechChoice = (techId: string) => {
    startTransition(() => {
      // Optimistic update
      setGameState(prev => ({ ...prev, selectedTech: techId }));
    });
  };
  
  return (
    <div className="game-container">
      {/* Game UI */}
    </div>
  );
}
```

### **2. Type-Safe API avec tRPC**
```typescript
// packages/api/src/router.ts
import { z } from 'zod';
import { publicProcedure, router } from './trpc';

export const gameRouter = router({
  getTechnologies: publicProcedure
    .input(z.object({ period: z.string() }))
    .query(async ({ input }) => {
      return await db.technology.findMany({
        where: { period: input.period }
      });
    }),
    
  preserveTechnology: publicProcedure
    .input(z.object({ 
      techId: z.string(),
      gameId: z.string() 
    }))
    .mutation(async ({ input }) => {
      // Business logic
    }),
});
```

### **3. Modern State Management**
```typescript
// store/gameStore.ts
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface GameState {
  currentTurn: number;
  preservedTechs: string[];
  gameHistory: GameHistory[];
  actions: {
    preserveTechnology: (techId: string) => void;
    nextTurn: () => void;
    resetGame: () => void;
  };
}

export const useGameStore = create<GameState>()(
  devtools(
    subscribeWithSelector(
      immer((set) => ({
        currentTurn: 1,
        preservedTechs: [],
        gameHistory: [],
        
        actions: {
          preserveTechnology: (techId) =>
            set((state) => {
              state.preservedTechs.push(techId);
            }),
            
          nextTurn: () =>
            set((state) => {
              state.currentTurn += 1;
            }),
            
          resetGame: () =>
            set((state) => {
              state.currentTurn = 1;
              state.preservedTechs = [];
              state.gameHistory = [];
            }),
        },
      }))
    )
  )
);
```

### **4. Performance avec React Query**
```typescript
// hooks/useGameData.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useGameTechnologies(period: string) {
  return useQuery({
    queryKey: ['technologies', period],
    queryFn: () => api.game.getTechnologies.query({ period }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });
}

export function usePreserveTechnology() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.game.preserveTechnology.mutate,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['gameState'] });
    },
    onMutate: async (variables) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['gameState'] });
      
      const previousState = queryClient.getQueryData(['gameState']);
      
      queryClient.setQueryData(['gameState'], (old: any) => ({
        ...old,
        preservedTechs: [...old.preservedTechs, variables.techId]
      }));
      
      return { previousState };
    },
  });
}
```

---

## 🧪 Testing Moderne (2025)

### **Vitest Configuration**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'test/']
    },
    typecheck: {
      checker: 'tsc',
    }
  },
});
```

### **Modern Testing Patterns**
```typescript
// packages/game-engine/tests/GameEngine.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngine } from '../src/core/GameEngine';

describe('GameEngine', () => {
  let engine: GameEngine;
  
  beforeEach(() => {
    engine = new GameEngine();
  });
  
  it('should generate valid technology choices', () => {
    const choices = engine.generateTurnChoices('medieval_late');
    
    expect(choices).toHaveLength(3);
    expect(choices.every(tech => tech.period === 'medieval_late')).toBe(true);
  });
  
  it('should respect technology dependencies', () => {
    // Test avec des mocks modernes
    const mockTech = vi.mocked(createMockTechnology);
    
    expect(engine.canTechAppear('printing')).toBe(false);
    
    engine.preserveTechnology('writing_cuneiform');
    expect(engine.canTechAppear('printing')).toBe(true);
  });
});
```

---

Cette architecture 2025 est prête pour :
✅ **Performance maximale** (Turbo, pnpm, Biome)
✅ **Type-safety complète** (tRPC, Zod, TypeScript strict)
✅ **Developer Experience optimal** (Hot reload, tooling intégré)
✅ **Scaling facile** (Monorepo, composants partagés)
✅ **Modern patterns** (Server Components, Optimistic UI)

Tu veux que je continue avec l'implémentation du moteur de jeu ou tu préfères d'abord setup le projet ?