#!/usr/bin/env python3
"""
Human Memories API - Moteur de jeu narratif piloté par les données.

Mécanique : arbre de décisions. À chaque tour, 3 choix (enfants du dernier choix).
Un seul choix par tour. Les autres sont perdus. Résumé d'époque tous les
`turnsPerEpoch` tours. La structure est entièrement dans `data/technologies.json`.
"""

import json
import os
import random
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    from openai import OpenAI as _OpenAI
    _openai_client = _OpenAI(api_key=os.environ.get("OPENAI_API_KEY")) if os.environ.get("OPENAI_API_KEY") else None
except ImportError:
    _openai_client = None

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    import asyncpg
except ImportError:
    asyncpg = None

# === CHARGEMENT DES DONNÉES ====================================================

REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_FILE = REPO_ROOT / "data" / "technologies.json"

PERIOD_ORDER = [
    "prehistoric",
    "ancient_early",
    "ancient_classical",
    "medieval_early",
    "medieval_late",
    "renaissance",
    "industrial",
    "contemporary",
]


def _load_game_data() -> Dict[str, Any]:
    with DATA_FILE.open(encoding="utf-8") as fh:
        raw = json.load(fh)

    technologies: Dict[str, Dict[str, Any]] = {
        tech["id"]: tech for tech in raw.get("technologies", [])
    }
    periods_meta: Dict[str, Any] = raw.get("periods", {})
    config: Dict[str, Any] = raw.get("gameConfig", {})

    techs_by_period: Dict[str, List[str]] = {}
    for tech_id, tech in technologies.items():
        techs_by_period.setdefault(tech["period"], []).append(tech_id)

    playable_periods = [p for p in PERIOD_ORDER if techs_by_period.get(p)]

    return {
        "technologies": technologies,
        "periods_meta": periods_meta,
        "techs_by_period": techs_by_period,
        "playable_periods": playable_periods,
        "config": config,
    }


GAME_DATA = _load_game_data()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# === MODÈLES ===================================================================


class CreateGameRequest(BaseModel):
    difficulty: Optional[str] = "normal"
    player_name: Optional[str] = None


class PickRequest(BaseModel):
    techId: str


# === LOGIQUE DE JEU ============================================================


def _get_roots() -> List[str]:
    return [
        tech_id
        for tech_id, tech in GAME_DATA["technologies"].items()
        if tech.get("isRoot", False)
    ]


def _get_children(tech_id: str) -> List[str]:
    tech = GAME_DATA["technologies"].get(tech_id)
    if not tech:
        return []
    return tech.get("children", [])


def _immediate_narrative(tech_id: str) -> str:
    tech = GAME_DATA["technologies"].get(tech_id)
    if not tech:
        return "Dans le Registre de l'Univers, ce choix s'inscrit en silence."

    name = tech.get("name", tech_id)
    word = tech.get("narrative", {}).get("memoryWord", "souvenir")
    category = tech.get("category", "")
    description = tech.get("description", "")[:200]
    period = GAME_DATA.get("periods_meta", {}).get(tech.get("period", ""), {}).get("name", "")

    if _openai_client:
        try:
            prompt = (
                "Tu es l'archiviste cosmique de l'Univers, dans le style de Terry Pratchett.\n\n"
                "Style à respecter : ironie tendre, bureaucratie cosmique, personnification des "
                "abstractions, humour bienveillant, formules cosmiques ('quelque part', 'dans le "
                "registre', 'un fonctionnaire de l'Univers'). Ton affectueux envers l'humanité.\n\n"
                f"L'humanité vient de choisir : {name}\n"
                f"Époque : {period}\n"
                f"Mot-mémoire : {word}\n"
                f"Contexte : {description}\n\n"
                "Écris 2 à 3 phrases qui constituent la note immédiate de l'archiviste cosmique "
                "au moment précis où ce choix est fait. Ce doit être différent à chaque fois — "
                "une observation surprenante, un détail inattendu, une conséquence immédiate vue "
                "depuis le registre de l'Univers. Pas de résumé de ce qu'est la technologie — "
                "une réaction vivante au moment du choix. En français, sans guillemets, sans titre."
            )
            response = _openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=120,
                temperature=1.0,
            )
            return response.choices[0].message.content.strip()
        except Exception:
            pass

    # Fallback statique
    immediates = tech.get("narrative", {}).get("immediate") or []
    if immediates:
        return random.choice(immediates)
    return f"La {word} rejoint le grand catalogue des choses que l'humanité a décidé de garder."


def _major_event(epoch_picks: List[str]) -> str:
    """Événement majeur de l'époque — scène concrète qui tisse les 3 choix."""
    techs = GAME_DATA["technologies"]

    if _openai_client and len(epoch_picks) >= 2:
        try:
            picks_info = []
            for tid in epoch_picks:
                t = techs.get(tid, {})
                name = t.get("name", tid)
                event = t.get("majorEvent", "")[:300]
                word = t.get("narrative", {}).get("memoryWord", "")
                picks_info.append(f"- {name} (mot-clé : {word})\n  {event}")
            context = "\n\n".join(picks_info)
            prompt = (
                "Tu es l'archiviste cosmique de l'Univers, dans le style de Terry Pratchett.\n\n"
                "Style Pratchett à respecter impérativement :\n"
                "- Personnification des abstractions (La Mort, Le Progrès, La Peur ont des bureaux)\n"
                "- Ironie tendre : l'humanité fait des choses absurdes avec beaucoup de sérieux\n"
                "- Digressions érudites sur des détails insignifiants qui révèlent quelque chose d'essentiel\n"
                "- Humour bienveillant : jamais méchant, toujours affectueux envers l'espèce humaine\n"
                "- Formulations cosmiques : 'quelque part dans l'Univers', 'dans le registre', 'depuis l'aube des temps'\n\n"
                f"Ces trois inventions ont marqué cette époque, dans cet ordre chronologique :\n\n{context}\n\n"
                "Raconte l'événement marquant de cette époque en 2 à 3 paragraphes. "
                "Ce doit être une SCÈNE VIVANTE, pas un résumé : montre des personnages anonymes "
                "(un forgeron, un scribe, une mère, un roi stupide), des lieux précis, des moments "
                "concrets où les trois inventions se CAUSENT mutuellement — la première rend la "
                "deuxième possible, la deuxième appelle la troisième, la troisième change tout. "
                "Inclus au moins une digression Pratchett et une observation cosmique. "
                "Termine sur une conséquence inattendue mais logique de ces trois choix combinés. "
                "En français, sans liste, sans titre, sans guillemets autour des noms de technologies."
            )
            response = _openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500,
                temperature=0.92,
            )
            return response.choices[0].message.content.strip()
        except Exception:
            pass

    # Fallback : majorEvent du dernier pick
    for tech_id in reversed(epoch_picks):
        tech = techs.get(tech_id)
        if not tech:
            continue
        event = tech.get("majorEvent")
        if event:
            return event
    return (
        "L'époque s'acheva sans fracas particulier, ce qui est en soi remarquable. "
        "Quelque part, un archiviste cosmique nota « rien à signaler » et passa à la suivante."
    )


def _epoch_summary(period: str, epoch_picks: List[str]) -> str:
    techs = GAME_DATA["technologies"]
    period_name = GAME_DATA["periods_meta"].get(period, {}).get("name", period)

    fragments: List[str] = []
    memory_words: List[str] = []
    tech_names: List[str] = []
    for tech_id in epoch_picks:
        tech = techs.get(tech_id)
        if not tech:
            continue
        narrative = tech.get("narrative", {})
        word = narrative.get("memoryWord", "trace")
        template = narrative.get("epochTemplate", "")
        if template:
            fragments.append(template.replace("{memoryWord}", word))
        if word:
            memory_words.append(word)
        if tech.get("name"):
            tech_names.append(tech["name"])

    if not fragments:
        return (
            f"L'époque « {period_name} » s'achève sans que rien de notable n'ait été "
            "préservé. Quelque part, un fonctionnaire de l'Univers inscrit « néant » "
            "dans une case prévue à cet effet, et soupire."
        )

    # Générer une synthèse liée via LLM si disponible
    if _openai_client and len(fragments) >= 2:
        try:
            context = "\n\n".join(
                f"Invention {i+1} — {tech_names[i] if i < len(tech_names) else '?'} "
                f"(mot-mémoire : « {memory_words[i] if i < len(memory_words) else '?'} »)\n{fragments[i]}"
                for i in range(len(fragments))
            )
            words_str = ", ".join(f"« {w} »" for w in memory_words)
            prompt = (
                "Tu es l'archiviste cosmique de l'Univers, dans le style de Terry Pratchett.\n\n"
                "Style Pratchett à respecter impérativement :\n"
                "- Personnification des abstractions (La Mort, Le Progrès, La Peur ont des bureaux)\n"
                "- Ironie tendre : l'humanité fait des choses absurdes avec beaucoup de sérieux\n"
                "- Digressions érudites sur des détails insignifiants qui révèlent quelque chose d'essentiel\n"
                "- Humour bienveillant : jamais méchant, toujours affectueux envers l'espèce humaine\n"
                "- Formulations cosmiques : 'quelque part dans l'Univers', 'dans le registre cosmique'\n\n"
                f"L'humanité vient de traverser l'époque « {period_name} » en faisant ces trois choix :\n\n"
                f"{context}\n\n"
                f"Les mots que l'humanité a choisi de garder de cette époque : {words_str}.\n\n"
                "Écris 2 à 3 paragraphes qui constituent le BILAN de cette époque dans le registre cosmique. "
                "Les trois inventions doivent se CAUSER mutuellement — montre comment la première a rendu "
                "la deuxième inévitable, comment la deuxième a préparé le terrain pour la troisième, "
                "et quelle transformation profonde et inattendue résulte de leur combinaison. "
                "Inclus la voix de l'archiviste cosmique qui note tout ça avec le détachement bienveillant "
                "d'un fonctionnaire qui a vu beaucoup trop de civilisations pour être surpris, "
                "mais qui trouve celle-ci intéressante quand même. "
                "En français, sans liste, sans titre."
            )
            response = _openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=550,
                temperature=0.88,
            )
            llm_text = response.choices[0].message.content.strip()
            intro = (
                f"Dans le grand registre de l'Univers — celui que personne n'a jamais vu mais "
                f"que tout le monde redoute vaguement —, l'archiviste cosmique consigne, à la "
                f"page « {period_name} », les mots que l'humanité a choisi de garder : {words_str}."
            )
            return f"{intro}\n\n{llm_text}"
        except Exception:
            pass  # Fallback sur la version statique ci-dessous

    # Fallback statique (pas de clé ou erreur API)
    words_str = ", ".join(f"« {w} »" for w in memory_words)
    intro = (
        f"Dans le grand registre de l'Univers — celui que personne n'a jamais vu mais "
        f"que tout le monde redoute vaguement —, l'archiviste cosmique consigne, à la "
        f"page « {period_name} », les mots que l'humanité a choisi de garder : "
        f"{words_str}. Il retourne ensuite la page et écrit, d'une écriture appliquée, "
        f"ce qui suit."
    )
    body = "\n\n".join(fragments)
    return f"{intro}\n\n{body}"


def _personality_from_picked(picked_path: List[str]) -> Dict[str, Any]:
    techs = GAME_DATA["technologies"]
    traits = {"pragmatic": 0.0, "spiritual": 0.0, "cooperative": 0.0}
    for tech_id in picked_path:
        tech = techs.get(tech_id)
        if not tech:
            continue
        effects = tech.get("effects", {})
        traits["pragmatic"] += (
            effects.get("economic", 0)
            + effects.get("military", 0)
            + effects.get("exploration", 0)
        )
        traits["spiritual"] += effects.get("cultural", 0)
        traits["cooperative"] += effects.get("social", 0)

    total = sum(max(v, 0) for v in traits.values()) or 1
    normalized = {k: round(max(v, 0) / total * 100) for k, v in traits.items()}

    dominant = max(normalized, key=normalized.get)
    max_value = normalized[dominant]
    is_balanced = all(abs(v - max_value) < 15 for v in normalized.values())

    paths = {
        "pragmatic": {
            "id": "engineering",
            "name": "Voie de l'Ingénierie",
            "flavor": "rationnelle et efficace",
            "description": "Une civilisation qui privilégie la logique, l'efficacité et les solutions pratiques.",
        },
        "spiritual": {
            "id": "contemplative",
            "name": "Voie Contemplative",
            "flavor": "mystique et transcendante",
            "description": "Une civilisation en quête de sens, explorant les mystères de l'existence.",
        },
        "cooperative": {
            "id": "communal",
            "name": "Voie Communautaire",
            "flavor": "altruiste et solidaire",
            "description": "Une civilisation fondée sur l'entraide et le bien-être collectif.",
        },
    }
    harmonious = {
        "id": "harmonious",
        "name": "Voie Harmonieuse",
        "flavor": "équilibrée et sage",
        "description": "Une civilisation qui honore tous les aspects de l'expérience humaine.",
    }
    path = harmonious if is_balanced else paths[dominant]

    return {
        "traits": normalized,
        "dominantTrait": dominant,
        "isBalanced": is_balanced,
        "evolutionaryPath": path,
        "primaryFocus": "cooperative" if is_balanced else dominant,
        "riskTolerance": "balanced" if is_balanced else "aggressive",
    }


_EPITAPHS = {
    "harmonious": "« Ci-gît une civilisation qui sut tout faire à peu près correctement, sans jamais en tirer la moindre gloire. C'est, soit dit en passant, déjà énorme. »",
    "engineering": "« Ils résolurent chaque problème au moyen d'une machine — y compris les problèmes causés par les machines précédentes. »",
    "contemplative": "« Ils cherchèrent le sens de l'existence absolument partout, sauf, peut-être, là où ils avaient posé leurs clés. »",
    "communal": "« Leur plus grande invention fut de se supporter les uns les autres. Personne, depuis, n'a fait mieux. »",
}


def _final_chronicle(picked_path: List[str], personality: Dict[str, Any]) -> str:
    techs = GAME_DATA["technologies"]
    period_order = ["prehistoric", "ancient_early", "ancient_classical", "medieval_early",
                    "medieval_late", "renaissance", "industrial", "contemporary"]

    # Construire un résumé du chemin par époque
    techs_per_epoch: Dict[str, List[str]] = {p: [] for p in period_order}
    words: List[str] = []
    for tech_id in picked_path:
        t = techs.get(tech_id, {})
        period = t.get("period", "")
        name = t.get("name", tech_id)
        word = t.get("narrative", {}).get("memoryWord", "")
        if period in techs_per_epoch:
            techs_per_epoch[period].append(name)
        if word:
            words.append(word)

    unique_words = list(dict.fromkeys(words))
    path = personality["evolutionaryPath"]
    epitaph = _EPITAPHS.get(path["id"], _EPITAPHS["harmonious"])

    if _openai_client:
        try:
            periods_meta = GAME_DATA.get("periods_meta", {})
            epoch_sections = []
            for p in period_order:
                names = techs_per_epoch.get(p, [])
                if names:
                    label = periods_meta.get(p, {}).get("name", p)
                    epoch_sections.append(f"  Époque {label} : {', '.join(names)}")

            traits = personality.get("traits", {})
            traits_desc = (
                f"pragmatique/efficacité {traits.get('pragmatic', 0)}%, "
                f"spirituel/culturel {traits.get('spiritual', 0)}%, "
                f"coopératif/social {traits.get('cooperative', 0)}%"
            )
            words_str = ", ".join(unique_words) if unique_words else "silence"
            path_desc = f"{path['name']} — {path['flavor']} — {path['description']}"

            prompt = (
                "Tu es l'archiviste cosmique de l'Univers, dans le style de Terry Pratchett.\n\n"
                "Style Pratchett à respecter impérativement :\n"
                "- Personnification des abstractions (La Mort, Le Progrès, La Civilisation ont des bureaux et des opinions)\n"
                "- Ironie tendre et bienveillante : l'humanité fait des choses absurdes avec un sérieux admirable\n"
                "- Digressions sur des détails révélateurs ('ce qui est remarquable, c'est que...')\n"
                "- Causalité inattendue : chaque invention mène à une conséquence que personne n'avait prévue\n"
                "- Ton affectueux : l'archiviste aime l'humanité même quand elle est ridicule\n"
                "- Formules cosmiques : registres, tampons, cases à cocher, fonctionnaires de l'Univers\n\n"
                "Voici le chemin complet de cette civilisation, époque par époque :\n"
                + "\n".join(epoch_sections) + "\n\n"
                f"Mots-mémoire conservés à travers les âges : {words_str}\n"
                f"Profil de civilisation : {path_desc}\n"
                f"Répartition des valeurs : {traits_desc}\n\n"
                "Écris la CHRONIQUE FINALE de cette civilisation spécifique en 5 à 6 paragraphes.\n\n"
                "Structure attendue :\n"
                "1. Ouverture : l'archiviste cosmique ouvre le dossier de cette civilisation particulière "
                "et note ce qui la distingue immédiatement des autres\n"
                "2-4. Le fil rouge : raconte comment les choix des premières époques ont CAUSÉ et PRÉPARÉ "
                "ceux des époques suivantes — montre la logique interne de ce chemin spécifique. "
                "Cite des inventions concrètes par leur nom. Montre les conséquences inattendues. "
                "Chaque époque doit résonner avec la précédente.\n"
                "5. Le bilan : ce que cette combinaison particulière de choix dit sur le caractère "
                "profond de cette civilisation — pas une autre, celle-ci précisément\n"
                "6. La clôture : l'archiviste ferme le dossier avec une observation finale mémorable\n\n"
                "IMPORTANT : la chronique doit être UNIQUE à ce chemin précis. Quelqu'un qui a choisi "
                "différemment doit avoir une chronique complètement différente. Cite des noms d'inventions "
                "réels du chemin, pas des généralités. Montre des LIENS DE CAUSE À EFFET entre les époques.\n\n"
                "En français. Pas de titres, pas de liste, pas de puces. Prose Pratchett pure."
            )
            response = _openai_client.chat.completions.create(
                model="gpt-4o",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1200,
                temperature=0.95,
            )
            body = response.choices[0].message.content.strip()
            intro = (
                "Dans le grand Registre de l'Univers — celui que personne n'a jamais vu mais "
                "que tout le monde redoute vaguement —, votre civilisation laisse cette entrée :"
            )
            return f"{intro}\n\n{body}\n\n{epitaph}"
        except Exception:
            pass

    # Fallback statique
    words_list = ", ".join(unique_words[:8]) if unique_words else "silence"
    intro = (
        "Dans le grand Registre de l'Univers — celui que personne n'a jamais vu mais "
        "que tout le monde redoute vaguement —, votre civilisation laisse cette entrée :"
    )
    body = (
        f"Vous avez choisi de garder ces quelques fils : {words_list}. "
        f"Au fil des âges, votre mémoire a suivi la {path['name']}, {path['flavor']}. "
        f"{path['description']}"
    )
    reflection = (
        "Quelque part, un archiviste cosmique relit votre dossier, hésite un instant "
        "entre l'admiration et la perplexité — sentiment que l'humanité inspire avec une "
        "régularité remarquable —, puis tamponne la page et passe à la civilisation suivante."
    )
    return f"{intro}\n\n{body}\n\n{reflection}\n\n{epitaph}"


def _public_state(game: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "gameId": game["gameId"],
        "turn": game["turn"],
        "totalTurns": game["totalTurns"],
        "epochIndex": game["epochIndex"],
        "totalEpochs": game["totalEpochs"],
        "turnWithinEpoch": game["turnWithinEpoch"],
        "turnsPerEpoch": game["turnsPerEpoch"],
        "currentEpoch": game["currentEpoch"],
        "pickedPath": game["pickedPath"],
        "availableTechs": game["availableTechs"],
        "playerProfile": game.get("playerProfile"),
        "isCompleted": game["isCompleted"],
    }


# === PERSISTANCE ===============================================================


class GameRepository:
    async def init(self) -> None: ...
    async def close(self) -> None: ...
    async def get(self, game_id: str) -> Optional[Dict[str, Any]]: ...
    async def save(self, game_id: str, game: Dict[str, Any]) -> None: ...

    @property
    def backend(self) -> str:
        return "unknown"


class InMemoryGameRepository(GameRepository):
    def __init__(self) -> None:
        self._games: Dict[str, Dict[str, Any]] = {}

    async def init(self) -> None:
        pass

    async def close(self) -> None:
        pass

    async def get(self, game_id: str) -> Optional[Dict[str, Any]]:
        game = self._games.get(game_id)
        return json.loads(json.dumps(game)) if game is not None else None

    async def save(self, game_id: str, game: Dict[str, Any]) -> None:
        self._games[game_id] = json.loads(json.dumps(game))

    @property
    def backend(self) -> str:
        return "memory"


class PostgresGameRepository(GameRepository):
    def __init__(self, dsn: str) -> None:
        self._dsn = dsn
        self._pool: Optional["asyncpg.Pool"] = None

    async def init(self) -> None:
        self._pool = await asyncpg.create_pool(self._dsn, min_size=1, max_size=5)
        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                CREATE TABLE IF NOT EXISTS hm_games (
                    game_id    TEXT PRIMARY KEY,
                    state      JSONB NOT NULL,
                    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
                )
                """
            )

    async def close(self) -> None:
        if self._pool is not None:
            await self._pool.close()

    async def get(self, game_id: str) -> Optional[Dict[str, Any]]:
        async with self._pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT state FROM hm_games WHERE game_id = $1", game_id
            )
        if row is None:
            return None
        return json.loads(row["state"])

    async def save(self, game_id: str, game: Dict[str, Any]) -> None:
        payload = json.dumps(game)
        async with self._pool.acquire() as conn:
            await conn.execute(
                """
                INSERT INTO hm_games (game_id, state)
                VALUES ($1, $2::jsonb)
                ON CONFLICT (game_id)
                DO UPDATE SET state = EXCLUDED.state, updated_at = now()
                """,
                game_id,
                payload,
            )

    @property
    def backend(self) -> str:
        return "postgres"


def _build_repository() -> GameRepository:
    dsn = os.getenv("DATABASE_URL")
    if dsn and asyncpg is not None:
        dsn = dsn.replace("postgresql+asyncpg://", "postgresql://").replace(
            "postgres+asyncpg://", "postgres://"
        )
        return PostgresGameRepository(dsn)
    return InMemoryGameRepository()


repo: GameRepository = _build_repository()


# === APPLICATION ===============================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    await repo.init()
    yield
    await repo.close()


app = FastAPI(
    title="Human Memories API",
    version="3.0.0",
    description="Moteur de jeu narratif — arbre de décisions.",
    lifespan=lifespan,
)

_default_origins = [
    "http://localhost:3000",
    "https://chroniques-narratives.up.railway.app",
]
_cors_origins = [
    o.strip()
    for o in os.getenv("CORS_ORIGINS", ",".join(_default_origins)).split(",")
    if o.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    config = GAME_DATA["config"]
    return {
        "message": "🧠 Human Memories API",
        "version": "3.0.0",
        "status": "healthy",
        "playablePeriods": GAME_DATA["playable_periods"],
        "technologies": len(GAME_DATA["technologies"]),
        "turnsPerEpoch": config.get("turnsPerEpoch", 1),
        "timestamp": _now(),
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "human-memories-api",
        "environment": os.getenv("ENVIRONMENT", "production"),
        "storage": repo.backend,
        "timestamp": _now(),
    }


@app.get("/technologies")
async def get_technologies():
    return {"technologies": list(GAME_DATA["technologies"].values())}


@app.post("/game/create")
async def create_game(request: CreateGameRequest):
    playable = GAME_DATA["playable_periods"]
    if not playable:
        raise HTTPException(status_code=500, detail="Aucune époque jouable dans la base")

    roots = _get_roots()
    if not roots:
        raise HTTPException(status_code=500, detail="Aucune technologie racine définie (isRoot: true)")

    config = GAME_DATA["config"]
    turns_per_epoch = int(config.get("turnsPerEpoch", 1))
    total_turns = len(playable) * turns_per_epoch

    game_id = str(uuid.uuid4())
    game = {
        "gameId": game_id,
        "turn": 1,
        "totalTurns": total_turns,
        "epochIndex": 0,
        "totalEpochs": len(playable),
        "turnWithinEpoch": 1,
        "turnsPerEpoch": turns_per_epoch,
        "currentEpoch": playable[0],
        "currentTechId": None,
        "pickedPath": [],
        "epochPicks": [],
        "availableTechs": roots,
        "playerProfile": None,
        "isCompleted": False,
        "difficulty": request.difficulty or "normal",
        "playerName": request.player_name,
        "createdAt": _now(),
    }
    await repo.save(game_id, game)
    return {"success": True, "data": _public_state(game)}


@app.get("/game/{game_id}")
async def get_game(game_id: str):
    game = await repo.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Partie introuvable")
    return {"success": True, "data": _public_state(game)}


@app.post("/game/{game_id}/pick")
async def pick_technology(game_id: str, request: PickRequest):
    game = await repo.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Partie introuvable")
    if game["isCompleted"]:
        raise HTTPException(status_code=400, detail="La partie est déjà terminée")

    tech_id = request.techId
    if tech_id not in game["availableTechs"]:
        raise HTTPException(
            status_code=400,
            detail=f"Technologie non disponible : {tech_id}",
        )

    # Enregistrement du choix
    game["pickedPath"].append(tech_id)
    game["epochPicks"].append(tech_id)
    game["currentTechId"] = tech_id

    # Détection de fin d'époque
    epoch_complete = game["turnWithinEpoch"] >= game["turnsPerEpoch"]
    major_event = None
    epoch_summary = None
    final_chronicle = None

    if epoch_complete:
        major_event = _major_event(game["epochPicks"])
        epoch_summary = _epoch_summary(game["currentEpoch"], game["epochPicks"])
        next_epoch_idx = game["epochIndex"] + 1
        playable = GAME_DATA["playable_periods"]

        if next_epoch_idx >= len(playable):
            # Fin de partie
            game["isCompleted"] = True
            game["availableTechs"] = []
            game["playerProfile"] = _personality_from_picked(game["pickedPath"])
            final_chronicle = _final_chronicle(game["pickedPath"], game["playerProfile"])
        else:
            game["epochIndex"] = next_epoch_idx
            game["currentEpoch"] = playable[next_epoch_idx]
            game["epochPicks"] = []
            game["turnWithinEpoch"] = 1
            game["turn"] += 1
            game["availableTechs"] = _get_children(tech_id)
    else:
        game["turnWithinEpoch"] += 1
        game["turn"] += 1
        game["availableTechs"] = _get_children(tech_id)

    if not game["isCompleted"]:
        game["playerProfile"] = _personality_from_picked(game["pickedPath"])

    await repo.save(game_id, game)

    return {
        "success": True,
        "data": {
            "immediateNarrative": _immediate_narrative(tech_id),
            "majorEvent": major_event,
            "epochSummary": epoch_summary,
            "finalChronicle": final_chronicle,
            "newState": _public_state(game),
            "isComplete": game["isCompleted"],
            "epochComplete": epoch_complete,
        },
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development",
    )
