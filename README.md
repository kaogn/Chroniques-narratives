# 🧠 Mémoires Humaines (Human Memories)

> *Un jeu narratif où vous incarnez la mémoire collective de l'humanité : à chaque époque, choisissez les technologies à préserver et laissez le reste sombrer dans l'oubli. Le récit s'écrit à partir de vos choix, dans un style « Borges facétieux ».*

## 🎮 Concept

À travers une succession d'**époques historiques**, vous préservez au maximum **2 technologies par tour**. Chaque choix génère une narration immédiate, un résumé d'époque, puis — en fin de partie — une **chronique finale** et un **profil de personnalité** (Ingénierie, Contemplative, Communautaire ou Harmonieuse) déduit de vos préservations.

> ⚠️ **État du contenu** : le moteur est piloté par les données et fonctionne sur **toutes** les technologies présentes dans `data/technologies.json`. Aujourd'hui ce fichier contient **5 technologies narrées** couvrant **2 époques** (Préhistoire, Antiquité ancienne). Ajouter des époques = ajouter des technologies narrées dans ce fichier, **sans modifier le code** (`data/technologies-database-extended-2025.json` fournit 129 entrées supplémentaires mais sans narration ni schéma compatible — à porter).

## 🏗️ Architecture réelle

```
.
├── apps/
│   ├── api/
│   │   └── main.py            # Backend FastAPI : moteur de jeu + narration (déployé sur Railway)
│   └── frontend/             # Frontend Next.js 15 (App Router, React 19)
│       └── src/
│           ├── app/          # Pages (/, /game) + layout
│           ├── components/   # UI (shadcn) + composants de jeu
│           └── store/        # État Zustand + service API
├── data/                     # Base de technologies (source de vérité du jeu)
├── packages/ · tools/ · docs/  # Prototypes & documentation de conception (non utilisés au runtime)
├── railway.toml              # Déploiement backend
└── requirements.txt          # Dépendances Python
```

## 🛠️ Stack effectif

**Frontend** — Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS + shadcn/ui, Zustand, Framer Motion.

**Backend** — FastAPI (Python 3.11+), Pydantic. Logique de jeu et narration générées à partir de `data/technologies.json`.

**Stockage** — Postgres si `DATABASE_URL` est défini, sinon en mémoire (cf. *Persistance* ci-dessous).

## 🚀 Démarrage local

### Backend

```bash
pip install -r requirements.txt
uvicorn apps.api.main:app --reload --port 8000
# API sur http://localhost:8000  (docs : http://localhost:8000/docs)
```

### Frontend

```bash
cd apps/frontend
npm install
# Pointer l'API : créer .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
# Jeu sur http://localhost:3000
```

## 🔌 API

| Méthode | Endpoint | Rôle |
|---------|----------|------|
| `GET`  | `/health` | Healthcheck (utilisé par Railway) |
| `GET`  | `/technologies` | `{ technologies: [...] }` |
| `POST` | `/game/create` | Crée une partie → `{ success, data: <état> }` |
| `GET`  | `/game/{id}` | État d'une partie |
| `POST` | `/game/{id}/preserve` | Corps `{ techIds: string[] }` → narration + nouvel état |

Toutes les réponses suivent l'enveloppe `{ success, data }`.

## 💾 Persistance

Le backend choisit son stockage **automatiquement** :

- **sans `DATABASE_URL`** → stockage en mémoire (dev ; les parties ne survivent pas à un redémarrage) ;
- **avec `DATABASE_URL`** → Postgres (table `hm_games`, une ligne JSONB par partie, créée au démarrage).

L'endpoint `/health` indique le backend actif (`"storage": "memory"` ou `"postgres"`).

### Activer Postgres sur Railway

1. Dans le projet Railway : **New → Database → PostgreSQL**.
2. Sur le service de l'API, ajouter une variable de référence :
   `DATABASE_URL = ${{ Postgres.DATABASE_URL }}` (utiliser l'URL **interne** : pas de `sslmode`, réseau privé).
3. Redéployer. `asyncpg` (dans `requirements.txt`) installe le pilote ; la table `hm_games` est créée automatiquement.

En local : `export DATABASE_URL=postgresql://user:pass@localhost:5432/hm` avant de lancer uvicorn.

## 🗺️ Pistes d'évolution

- Porter les 129 technologies de `data/technologies-database-extended-2025.json` au schéma narré pour couvrir les 8 époques.
- Reprise de partie côté frontend (le backend persiste déjà via `/game/{id}`).
- Tests (backend : logique de jeu ; frontend : store + composants).
- Filtrage par prérequis réactivable une fois la base de contenu complète.

## 📜 Licence

MIT.
