#!/bin/bash

# Human Memories - Setup Script 2025
echo "🚀 Setting up Human Memories with modern stack..."

# Vérifier Node.js version
node_version=$(node --version | cut -c2-3)
if [ "$node_version" -lt "22" ]; then
  echo "❌ Node.js 22+ required. Current: $(node --version)"
  exit 1
fi

# Vérifier pnpm
if ! command -v pnpm &> /dev/null; then
  echo "📦 Installing pnpm..."
  npm install -g pnpm@latest
fi

# Créer la structure du projet
echo "📁 Creating project structure..."

# Root
mkdir -p human-memories
cd human-memories

# Apps
mkdir -p apps/{web,api,docs}

# Packages
mkdir -p packages/{ui,game-engine,shared,config}

# Tooling
mkdir -p tooling
mkdir -p data
mkdir -p .github/workflows

# Web app structure (Next.js 15)
cd apps/web
mkdir -p {app,components,hooks,lib,store,types}
mkdir -p app/{api,\(game\)}
mkdir -p app/\(game\)/{play,history}
mkdir -p components/{ui,game,layout}
cd ../..

# API structure 
cd apps/api
mkdir -p src/{routes,services,middleware}
mkdir -p {prisma,drizzle}
cd ../..

# Game engine structure
cd packages/game-engine
mkdir -p src/{core,narrative,data,types}
mkdir -p tests
cd ../..

# Shared package
cd packages/shared
mkdir -p src/{types,utils,constants,schemas}
cd ../..

# UI package
cd packages/ui
mkdir -p src/{components,hooks,utils}
cd ../..

# Configuration files
echo "⚙️ Creating configuration files..."

# Root package.json
cat > package.json << 'EOF'
{
  "name": "human-memories",
  "version": "0.1.0",
  "private": true,
  "type": "module",
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
    "db:generate": "turbo db:generate",
    "setup": "pnpm install && pnpm db:generate"
  },
  "devDependencies": {
    "@biomejs/biome": "^1.8.3",
    "@changesets/cli": "^2.27.1",
    "turbo": "^2.0.14",
    "typescript": "^5.7.2"
  },
  "engines": {
    "node": ">=22.0.0",
    "pnpm": ">=9.0.0"
  },
  "packageManager": "pnpm@9.12.0"
}
EOF

# pnpm workspace
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'apps/*'
  - 'packages/*'
  - 'tooling/*'

catalogs:
  main:
    react: ^18.3.1
    react-dom: ^18.3.1
    typescript: ^5.7.2
    '@types/node': ^22.9.0
    zod: ^3.23.8
    
  next:
    next: ^15.1.0
    '@next/eslint-plugin-next': ^15.1.0
    
  ui:
    '@radix-ui/react-dialog': ^1.1.2
    '@radix-ui/react-dropdown-menu': ^2.1.2
    '@radix-ui/react-slot': ^1.1.0
    'framer-motion': ^12.0.0
    'tailwindcss': ^3.4.15
    'class-variance-authority': ^0.7.1
    'clsx': ^2.1.1
    'tailwind-merge': ^2.5.4
    
  backend:
    fastify: ^5.1.0
    '@fastify/cors': ^10.0.1
    '@fastify/helmet': ^12.0.1
    prisma: ^6.0.1
    '@prisma/client': ^6.0.1
    
  test:
    vitest: ^2.1.8
    '@testing-library/react': ^16.1.0
    '@testing-library/jest-dom': ^6.6.3
    '@vitejs/plugin-react': ^4.3.4
    happy-dom: ^15.11.6
    playwright: ^1.49.0
    
  state:
    zustand: ^5.0.2
    '@tanstack/react-query': ^5.62.2
    'react-hook-form': ^7.54.0
EOF

# Turbo config
cat > turbo.json << 'EOF'
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**", "build/**"],
      "env": ["NODE_ENV", "DATABASE_URL"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"],
      "inputs": ["src/**/*.{ts,tsx}", "test/**/*.{ts,tsx}"]
    },
    "test:e2e": {
      "dependsOn": ["build"],
      "outputs": ["test-results/**", "playwright-report/**"]
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": ["*.tsbuildinfo"]
    },
    "db:generate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    }
  },
  "globalEnv": [
    "NODE_ENV",
    "DATABASE_URL",
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL"
  ]
}
EOF

# Biome config
cat > biome.json << 'EOF'
{
  "$schema": "https://biomejs.dev/schemas/1.8.3/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": false,
    "ignore": [
      ".next/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "node_modules/**"
    ]
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "a11y": {
        "recommended": true
      },
      "complexity": {
        "noExcessiveCognitiveComplexity": {
          "level": "error",
          "options": {
            "maxAllowedComplexity": 15
          }
        }
      },
      "correctness": {
        "noUndeclaredVariables": "error",
        "noUnusedVariables": "error",
        "useExhaustiveDependencies": "warn"
      },
      "performance": {
        "noAccumulatingSpread": "warn"
      },
      "style": {
        "useConsistentArrayType": "error",
        "useImportType": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn",
        "noArrayIndexKey": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf",
    "attributePosition": "auto"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "asNeeded",
      "arrowParentheses": "asNeeded"
    }
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  }
}
EOF

# TypeScript root config
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@ui/*": ["./packages/ui/src/*"],
      "@game-engine/*": ["./packages/game-engine/src/*"],
      "@shared/*": ["./packages/shared/src/*"]
    },
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "build"
  ]
}
EOF

# Gitignore moderne
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production builds
.next/
dist/
build/
out/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Testing
coverage/
test-results/
playwright-report/
playwright/.cache/

# Database
*.db
*.sqlite

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Turbo
.turbo/

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
EOF

# Docker setup
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: human_memories
      POSTGRES_PASSWORD: dev_password
      POSTGRES_DB: human_memories_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./data/init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
EOF

# GitHub Actions CI
mkdir -p .github/workflows
cat > .github/workflows/ci.yml << 'EOF'
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  lint-and-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: false
          
      - name: Get pnpm store directory
        shell: bash
        run: echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV
        
      - name: Setup pnpm cache
        uses: actions/cache@v4
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-
            
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Lint
        run: pnpm lint
        
      - name: Type check
        run: pnpm type-check

  test:
    name: Unit Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: false
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Run tests
        run: pnpm test --coverage
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v4
        env:
          CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: false
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps
        
      - name: Run E2E tests
        run: pnpm test:e2e
        
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

  build:
    name: Build
    runs-on: ubuntu-latest
    needs: [lint-and-typecheck, test]
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9
          run_install: false
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Build
        run: pnpm build
        env:
          NODE_ENV: production
EOF

echo "✅ Basic structure and configs created!"
echo ""
echo "Next steps:"
echo "1. cd human-memories"
echo "2. pnpm install"
echo "3. Copy technologies.json to data/ folder"
echo "4. Start development: pnpm dev"
echo ""
echo "🚀 Modern stack ready with:"
echo "   - Turborepo monorepo"
echo "   - pnpm workspaces"
echo "   - Biome for linting/formatting"
echo "   - TypeScript strict mode"
echo "   - GitHub Actions CI/CD"
echo "   - Docker development environment"