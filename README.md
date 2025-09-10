# 🧠 Human Memories

> *Un jeu narratif où vous incarnez la mémoire collective de l'humanité, sculptant l'histoire par vos choix de préservation et d'oubli*

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎮 Concept du Jeu

**Human Memories** est un jeu de stratégie narratif textuel où vous prenez le rôle de la **mémoire collective de l'humanité**. À travers **8 époques historiques majeurs**, de la préhistoire à l'an 2100, vous devez choisir quelles découvertes et technologies préserver ou laisser sombrer dans l'oubli.

### 🎯 Mécaniques Principales

- **8 Tours Épiques** : Préhistoire → Antiquité → Moyen Âge → Renaissance → Révolution Industrielle → Ère Moderne → Futur Proche → Futur Lointain
- **Choix Stratégiques** : 3 options par tour, maximum 2 à préserver
- **Système de Dépendances** : Certaines technologies requièrent des prérequis historiques
- **Narration Émergente** : Chaque partie génère une chronique historique unique
- **Événements Aléatoires** : Technologies variables pour garantir la rejouabilité
- **Analyse Personnalisée** : Conclusion analysant votre style de "mémoire collective"

## 🏗️ Architecture Technique

### 📁 Structure du Projet

```
human-memories/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── nextjs-app-2025.tsx
│   │   ├── react-components-2025.tsx
│   │   ├── shadcn-components-2025.tsx
│   │   └── zustand-store-2025.ts
│   └── api/                    # FastAPI Backend
│       ├── fastapi-backend-2025.py
│       └── database-setup-2025.py
├── packages/
│   ├── game-engine/            # Moteur de Jeu Pur
│   │   ├── game-engine-2025.ts
│   │   ├── game-engine-updated-2025.ts
│   │   ├── gameplay-simulator-2025.py
│   │   └── gameplay-simulator-extended-2025.py
│   └── shared/                 # Types & Utilitaires Partagés
│       └── tech-database-2025.ts
├── data/                       # Base de Données de Contenu
│   ├── technologies.json
│   ├── technologies-database-extended-2025.json
│   ├── narrative-borges-facetieux-2025.json
│   └── narrative-epoch-summaries-2025.json
├── docs/                       # Documentation Technique
│   ├── TECHNICAL_SPECS.md
│   ├── EXAMPLES_BY_PERIOD.md
│   ├── TECHNOLOGIES_DOCUMENTATION.md
│   └── typescript-configs.md
├── tools/                      # Outils de Développement
│   ├── dependency-analysis-2025.py
│   └── personality-engine-demo.py
└── scripts/                    # Scripts d'Automatisation
    └── setup-scripts.sh
```

### 🛠️ Stack Technique

**Frontend**
- **Next.js 14+** avec App Router pour la performance SSR
- **TypeScript** en mode strict pour la sécurité des types
- **Tailwind CSS + shadcn/ui** pour le design system
- **Zustand** pour la gestion d'état légère et performante
- **Framer Motion** pour les animations fluides

**Backend**
- **FastAPI** pour une API haute performance
- **PostgreSQL** avec Prisma ORM pour la persistance
- **Redis** pour le cache et les sessions
- **Pydantic** pour la validation des données

**Outils & DevOps**
- **Turborepo** pour la gestion monorepo
- **Docker** pour les environnements de développement
- **GitHub Actions** pour CI/CD
- **Vercel** (Frontend) + **Railway** (Backend) pour le déploiement

## 🚀 Démarrage Rapide

### Prérequis

```bash
# Node.js 18+ et Python 3.9+
node --version  # v18.0.0+
python --version  # 3.9.0+
```

### Installation

```bash
# Clonage du repository
git clone https://github.com/Aziraphal/Chroniques-narratives.git
cd Chroniques-narratives

# Installation des dépendances (à venir)
npm install
pip install -r requirements.txt

# Configuration environnement local
cp .env.example .env.local
docker-compose up -d

# Lancement développement
npm run dev
```

## 🎯 Objectifs de Développement

### Phase 1 : MVP (8 semaines)
- [x] **Conception** : Architecture et design technique
- [x] **Prototypage** : Moteur de jeu et simulateurs
- [ ] **Backend API** : Endpoints RESTful avec FastAPI
- [ ] **Frontend Core** : Interface de jeu avec Next.js
- [ ] **Intégration** : Connection Frontend ↔ Backend
- [ ] **Tests** : Couverture de tests > 85%

### Phase 2 : Contenu & Features (6 semaines)
- [ ] **Base de Données** : 100+ technologies avec dépendances
- [ ] **Narration** : Templates et génération dynamique
- [ ] **Modes de Jeu** : Périodes historiques spécialisées
- [ ] **Système de Sauvegarde** : Persistance des parties
- [ ] **PWA** : Installation mobile et offline

### Phase 3 : Production (4 semaines)
- [ ] **Performance** : Optimisation et load testing
- [ ] **Sécurité** : Audit et conformité GDPR
- [ ] **Beta Testing** : Programme de test utilisateur
- [ ] **Déploiement** : Infrastructure production

## 📊 Métriques de Qualité

### Technique
- ✅ **TypeScript Strict Mode** : 100% couverture types
- 🎯 **Test Coverage** : >85% avec tests unitaires et E2E
- ⚡ **Performance** : Lighthouse Score >90
- 🔒 **Sécurité** : Scan automatique des vulnérabilités

### Gaming
- 🎮 **Taux de Completion** : >70% finissent leur première partie
- 🔄 **Rejouabilité** : >40% font plusieurs parties
- ⭐ **Satisfaction** : Rating moyen 4.5/5
- 📱 **Accessibilité** : WCAG 2.1 AA compliant

## 🤝 Contribution

Le projet suit les meilleures pratiques open source :

- **Conventional Commits** pour les messages de commit
- **Semantic Versioning** pour les releases
- **Code Review** obligatoire via Pull Requests
- **Tests** requis pour toute nouvelle fonctionnalité

## 📜 Licence

MIT License - voir [LICENSE](LICENSE) pour les détails.

## 📞 Contact

- **GitHub** : [@Aziraphal](https://github.com/Aziraphal)
- **Email** : dev@human-memories.com *(à venir)*

---

*"Chaque civilisation n'est que la somme des souvenirs qu'elle choisit de garder."* ✨