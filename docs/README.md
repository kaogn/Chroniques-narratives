# Human Memories

> *Un jeu narratif où vous incarnez la mémoire collective de l'humanité, sculptant l'histoire par vos choix de préservation et d'oubli*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎮 Concept

**Human Memories** est un jeu de stratégie narratif textuel où vous prenez le rôle de la mémoire collective de l'humanité. À travers 8 époques historiques, de la préhistoire à 2100, vous choisissez quelles découvertes et technologies préserver ou laisser sombrer dans l'oubli.

### Mécaniques Principales
- **8 tours** représentant les grandes époques de l'histoire
- **3 choix** par tour, **2 maximum** à préserver
- **Système de dépendances** : certaines technologies requièrent des prérequis
- **Narration émergente** : chaque partie génère une chronique historique unique
- **Technologies variables** : événements aléatoires garantissent la rejouabilité
- **Conclusion personnalisée** analysant votre style de "mémoire"

---

## 📋 Plan de Développement

### 🎯 Objectifs
- **Durée :** 12-18 mois (développement solo)
- **Budget :** ~€2,000 (outils, hosting, marketing)
- **Target :** Steam + navigateurs web, puis mobile
- **Modèle :** €15 base game + DLC thématiques €5-8

---

## 🏗️ Architecture Technique

### Stack Principal
```
Frontend:
├── Next.js 14+ (App Router) - SSR + performance
├── TypeScript (strict mode) - Type safety
├── Tailwind CSS + shadcn/ui - Design system
├── Framer Motion - Animations fluides
└── PWA Support - Installation mobile

Backend:
├── Node.js + Fastify - Performance API
├── Prisma ORM + PostgreSQL - Database robuste
├── Redis - Cache + sessions
├── Zod - Validation runtime
└── JWT + bcrypt - Auth sécurisée

DevOps:
├── Docker + Docker Compose - Environnements
├── GitHub Actions - CI/CD
├── Vercel (Frontend) + Railway (Backend) - Deploy
├── Sentry - Error tracking
└── Plausible - Analytics privacy-first
```

### Structure Projet (Monorepo)
```
human-memories/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/         # App Router
│   │   │   ├── components/  # UI components
│   │   │   ├── hooks/       # Custom hooks
│   │   │   ├── stores/      # Zustand stores
│   │   │   └── types/       # TypeScript types
│   │   └── public/
│   └── api/                 # Fastify backend
│       ├── src/
│       │   ├── domains/     # DDD modules
│       │   │   ├── game/    # Game logic
│       │   │   ├── tech/    # Technologies
│       │   │   └── user/    # User management
│       │   ├── shared/      # Shared utilities
│       │   └── infrastructure/ # DB, external services
│       └── prisma/
├── packages/
│   ├── shared/              # Code partagé
│   │   ├── types/           # Types communs
│   │   ├── constants/       # Constantes
│   │   └── utils/           # Utilitaires
│   └── game-engine/         # Moteur de jeu pur
│       ├── src/
│       │   ├── core/        # GameEngine, TechManager
│       │   ├── narrative/   # StoryGenerator
│       │   └── data/        # Technologies, events
│       └── tests/
├── data/
│   ├── technologies.json   # Base de données des techs
│   ├── events.json        # Événements historiques
│   ├── narratives.json    # Templates narratifs
│   └── migrations/        # Scripts de mise à jour data
└── tools/
    ├── data-validator/    # Validation des JSONs
    ├── content-editor/    # Outil d'édition contenu
    └── test-runner/       # Tests scenarios
```

---

## ⚙️ Méthodologie de Développement

### Approche Agile (Solo Dev)
- **Sprints de 2 semaines** avec planning, daily standup, review/demo
- **GitHub Projects** pour le kanban intégré
- **Tests pyramide** : 70% unit, 20% integration, 10% E2E
- **Code Coverage target** : 85%
- **TypeScript strict mode** obligatoire

### Outils de Qualité
```yaml
IDE & Code:
  - VSCode + extensions (ESLint, Prettier, GitLens)
  - GitHub Copilot - accélération développement
  
Quality & Tests:
  - Vitest + Testing Library - tests unitaires
  - Playwright - tests E2E
  - SonarCloud - qualité de code
  - Husky + lint-staged - pre-commit hooks

Monitoring:
  - Sentry - error tracking production
  - Grafana + Prometheus - métriques perf
  - Lighthouse CI - performance web
```

---

## 🧪 Stratégie de Test & Déploiement

### Environnements
```
Development (local):
├── Docker Compose - PostgreSQL + Redis local
├── Hot reload - Next.js + Fastify
└── Mock data - jeux de test reproductibles

Staging (pre-prod):
├── Vercel Preview - frontend branches
├── Railway staging - backend + DB
├── Tests E2E automatisés
└── Performance benchmarks

Production:
├── Vercel - CDN global, edge functions
├── Railway - backend scalable
├── PostgreSQL managed - backups automatiques
└── Monitoring 24/7
```

### CI/CD Pipeline
```yaml
GitHub Actions:
├── Lint + Prettier + TypeScript check
├── Unit tests (Vitest) + Integration tests
├── E2E tests (Playwright) + Security scan (Snyk)
├── Build apps + Docker images + Bundle analysis
├── Deploy staging → Smoke tests → Production (manual approval)
└── Post-deploy monitoring + alertes
```

---

## 📅 Planning Détaillé

### **Phase 0: Foundation (2 semaines)**
- Repository setup + monorepo (Turborepo)
- Docker environment + CI/CD basique
- Architecture packages + shared types
- Database schema design (Prisma)
- Core business logic (TDD)

### **Phase 1: MVP Core (8 semaines)**

**Sprint 1-2: Game Engine**
- Technology dependency system
- Event generation with probabilities
- Game state management
- Basic narrative templating
- Unit tests (>90% coverage)

**Sprint 3-4: Backend API**
- RESTful API (Fastify)
- Game session CRUD
- User authentication (JWT)
- Database integration
- API documentation (OpenAPI)

**Sprint 5-6: Frontend Core**
- Next.js setup + design system
- Game session flow (8 tours)
- Technology selection UI
- Basic responsive design
- State management (Zustand)

**Sprint 7-8: Integration & Polish**
- Frontend ↔ Backend integration
- End-to-end tests (Playwright)
- Performance optimization
- Bug fixes + UX improvements
- MVP ready for alpha testing

### **Phase 2: Content & Features (6 semaines)**

**Sprint 9-10: Rich Content**
- 100+ technologies with dependencies
- Narrative templates expansion
- Localization system (i18n)
- Historical accuracy validation
- Content management tools

**Sprint 11-12: Advanced Features**
- Multiple game modes (historical periods)
- Achievement system
- Save/load functionality
- Social sharing (chroniques)
- Progressive Web App (PWA)

### **Phase 3: Production Ready (4 semaines)**

**Sprint 13-14: Quality & Performance**
- Load testing + optimization
- Security audit + fixes
- Accessibility (WCAG 2.1)
- SEO optimization
- Production monitoring setup

**Sprint 15-16: Launch Preparation**
- Beta testing program (50 users)
- Marketing materials
- Steam page + App stores
- Documentation utilisateur
- Go-live checklist

---

## 💰 Budget & ROI

### Coûts Année 1
```
Tools & Services:
├── Development: €300 (GitHub Pro, Copilot, IDE plugins)
├── Hosting: €600/an (Vercel Pro, Railway, DB)
├── Monitoring: €200/an (Sentry, analytics)
├── Marketing: €500 (Steam fee, social media)
└── Legal: €200 (GDPR compliance, terms)

Total: €1,800
Break-even: 120 copies à €15
Objectif: 500 copies = €7,500 revenue
```

### Métriques de Succès
```
Technique:
├── Build time < 2 minutes
├── Test suite < 30 secondes
├── Page load < 1.5s (P95)
├── 99.9% uptime
└── Zero security incidents

Business:
├── 1,000+ wishlists pré-launch
├── 70%+ completion rate première partie
├── 40%+ replay rate
├── 4.5/5 rating moyen
└── Profitable mois 6
```

---

## 🚀 Roadmap Post-Launch

### Extensions Prévues
```
Q1 après launch:
├── DLC "Civilisations Antiques" (€5)
├── Mode multijoueur asynchrone
└── API publique pour mods

Q2-Q3:
├── DLC "Révolution Industrielle" (€5)
├── Mobile apps (React Native)
└── Système de classements

Q4:
├── DLC "Futurs Alternatifs" (€8)
├── IA générative pour narratives
└── Version 2.0 planning
```

### Extensibilité Technique
```typescript
// Plugin system pour extensions
interface GameExtension {
  id: string;
  name: string;
  technologies: Technology[];
  narratives: NarrativeTemplate[];
  periods: HistoricalPeriod[];
}

// Hot-reload de contenu
const loadExtension = async (extensionId: string) => {
  const extension = await import(`./extensions/${extensionId}`);
  gameEngine.registerExtension(extension);
};
```

---

## ✅ Production Checklist

### Sécurité & Compliance
- [ ] HTTPS obligatoire partout
- [ ] Sanitization des inputs utilisateur  
- [ ] Rate limiting APIs
- [ ] GDPR compliance (EU users)
- [ ] Security headers (CSP, HSTS, etc.)
- [ ] Audit dépendances (npm audit, Snyk)

### Performance & UX
- [ ] Lighthouse Score > 90
- [ ] Time to Interactive < 2s
- [ ] Accessible (WCAG 2.1 AA)
- [ ] Mobile-first responsive
- [ ] Offline support (PWA)
- [ ] Error boundaries partout

### Business & Legal
- [ ] Terms of Service + Privacy Policy
- [ ] Cookie consent (GDPR)
- [ ] Steam store page optimisée
- [ ] Press kit + screenshots
- [ ] Community Discord/Reddit
- [ ] Analytics & conversion tracking

---

## 🎯 Pour Commencer

### Setup Initial
```bash
# Clone du repository
git clone https://github.com/username/human-memories.git
cd human-memories

# Installation dépendances
npm install

# Setup environnement local
cp .env.example .env.local
docker-compose up -d

# Base de données
npx prisma migrate dev
npx prisma db seed

# Lancement développement
npm run dev
```

### Scripts Principaux
```json
{
  "dev": "turbo run dev",
  "build": "turbo run build", 
  "test": "turbo run test",
  "test:e2e": "turbo run test:e2e",
  "lint": "turbo run lint",
  "type-check": "turbo run type-check"
}
```

---

## 🤝 Contributing

Ce projet suit les meilleures pratiques open source :
- **Conventional Commits** pour les messages de commit
- **Semantic Versioning** pour les releases
- **Code Review** obligatoire via Pull Requests
- **Tests** requis pour toute nouvelle fonctionnalité

---

## 📄 License

MIT License - voir [LICENSE.md](LICENSE.md) pour les détails.

---

## 📞 Contact

- **Email** : dev@human-memories.com
- **Discord** : [Community Server](https://discord.gg/humanmemories)
- **Twitter** : [@HumanMemories](https://twitter.com/humanmemories)

---

*"Chaque civilisation n'est que la somme des souvenirs qu'elle choisit de garder."* ✨