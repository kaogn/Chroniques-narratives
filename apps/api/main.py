#!/usr/bin/env python3
"""
Human Memories API - Moteur de jeu narratif piloté par les données.

Le jeu est entièrement dérivé de `data/technologies.json` :
- les époques jouables sont celles qui possèdent au moins une technologie ;
- la narration ("Borges facétieux") provient des champs `narrative` de chaque techno ;
- le profil de personnalité et la chronique finale sont calculés à partir des effets.

Ajouter du contenu (technologies narrées) suffit donc à étendre le jeu, sans
modifier ce code.
"""

import json
import os
import random
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# === CHARGEMENT DES DONNÉES ====================================================

# main.py -> apps/api/main.py ; la racine du dépôt est deux niveaux au-dessus.
REPO_ROOT = Path(__file__).resolve().parents[2]
DATA_FILE = REPO_ROOT / "data" / "technologies.json"

# Ordre canonique des époques (celles réellement jouables sont filtrées plus bas).
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
    """Charge et indexe la base de technologies une seule fois au démarrage."""
    with DATA_FILE.open(encoding="utf-8") as fh:
        raw = json.load(fh)

    technologies: Dict[str, Dict[str, Any]] = {
        tech["id"]: tech for tech in raw.get("technologies", [])
    }
    periods_meta: Dict[str, Any] = raw.get("periods", {})
    config: Dict[str, Any] = raw.get("gameConfig", {})

    # Époques jouables = celles présentes dans l'ordre canonique ET pourvues de techs.
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
        "known_ids": set(technologies.keys()),
    }


GAME_DATA = _load_game_data()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# === MODÈLES ===================================================================


class CreateGameRequest(BaseModel):
    difficulty: Optional[str] = "normal"
    player_name: Optional[str] = None


class PreserveTechsRequest(BaseModel):
    techIds: List[str]


# === LOGIQUE DE JEU ============================================================


def _offerable_techs(period: str, preserved: List[str]) -> List[str]:
    """
    Technologies proposables pour une époque : toutes celles de la période non
    encore préservées.

    Note : la base de contenu est volontairement partielle (toutes les techs
    référencées en prérequis n'existent pas encore). Un gating dur sur les
    prérequis rendrait la plupart des technologies inatteignables ; les
    prérequis restent donc purement informatifs côté UI. Quand la base sera
    complète, on pourra réintroduire un filtrage sur `dependencies.prerequisites`.
    """
    preserved_set = set(preserved)
    return [
        tech_id
        for tech_id in GAME_DATA["techs_by_period"].get(period, [])
        if tech_id not in preserved_set
    ]


def _max_preserved_per_turn() -> int:
    return int(GAME_DATA["config"].get("maxPreservedPerTurn", 2))


def _immediate_narrative(tech_id: str) -> str:
    """Réaction immédiate (tirée au hasard parmi les variantes de la techno)."""
    tech = GAME_DATA["technologies"].get(tech_id)
    if not tech:
        return "Dans les Archives de la Mémoire, ce choix s'inscrit en silence."
    immediates = tech.get("narrative", {}).get("immediate") or []
    if immediates:
        return random.choice(immediates)
    word = tech.get("narrative", {}).get("memoryWord", "souvenir")
    return f"La {word} rejoint le grand catalogue des souvenirs préservés."


def _epoch_summary(period: str, preserved_this_turn: List[str]) -> str:
    """Résumé d'époque : assemble les templates d'époque des techs préservées."""
    techs = GAME_DATA["technologies"]
    fragments = []
    for tech_id in preserved_this_turn:
        tech = techs.get(tech_id)
        if not tech:
            continue
        narrative = tech.get("narrative", {})
        template = narrative.get("epochTemplate")
        if template:
            fragments.append(
                template.replace("{memoryWord}", narrative.get("memoryWord", "trace"))
            )
    period_name = GAME_DATA["periods_meta"].get(period, {}).get("name", period)
    if not fragments:
        return f"L'époque « {period_name} » s'achève dans le murmure de l'oubli."
    return f"— {period_name} — " + " ".join(fragments)


# Influence des effets sur les trois axes de personnalité.
# pragmatic = ce qui transforme le monde ; spiritual = la culture/le sens ;
# cooperative = le lien social.
def _personality_from_preserved(preserved: List[str]) -> Dict[str, Any]:
    techs = GAME_DATA["technologies"]
    traits = {"pragmatic": 0.0, "spiritual": 0.0, "cooperative": 0.0}
    for tech_id in preserved:
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

    category_focus = {
        "pragmatic": "economic",
        "spiritual": "cultural",
        "cooperative": "social",
    }

    return {
        "traits": normalized,
        "dominantTrait": dominant,
        "isBalanced": is_balanced,
        "evolutionaryPath": path,
        "primaryFocus": category_focus[dominant],
        "riskTolerance": "balanced" if is_balanced else "aggressive",
    }


_EPITAPHS = {
    "harmonious": "« Ici dansa une civilisation qui sut épouser tous les rythmes du temps. »",
    "engineering": "« Ils sculptèrent le monde avec la précision d'horlogers cosmiques. »",
    "contemplative": "« Ils cherchèrent les étoiles dans chaque grain de sable — et les trouvèrent. »",
    "communal": "« Leur plus grande technologie fut l'art de vivre ensemble. »",
}


def _final_chronicle(preserved: List[str], personality: Dict[str, Any]) -> str:
    techs = GAME_DATA["technologies"]
    words = []
    for tech_id in preserved:
        word = techs.get(tech_id, {}).get("narrative", {}).get("memoryWord")
        if word:
            words.append(word)
    unique_words = list(dict.fromkeys(words))
    words_list = ", ".join(unique_words[:8]) if unique_words else "silence"

    path = personality["evolutionaryPath"]
    epitaph = _EPITAPHS.get(path["id"], _EPITAPHS["harmonious"])

    intro = "Dans les Annales Définitives de la Mémoire Collective, votre civilisation laisse cette trace :"
    body = (
        f"Vous avez tissé une tapisserie temporelle avec ces fils : {words_list}. "
        f"Au fil des âges, votre mémoire a suivi la {path['name']}, {path['flavor']}. "
        f"{path['description']}"
    )
    reflection = (
        "Borges, dans sa bibliothèque infinie, sourit : quelque part, cette chronique "
        "exacte était déjà écrite. Mais c'est vous qui l'avez rendue réelle."
    )
    return f"{intro}\n\n{body}\n\n{reflection}\n\n{epitaph}"


def _public_state(game: Dict[str, Any]) -> Dict[str, Any]:
    """Vue exposée au client (sans champs internes)."""
    return {
        "gameId": game["gameId"],
        "currentTurn": game["currentTurn"],
        "currentPeriod": game["currentPeriod"],
        "preservedTechs": game["preservedTechs"],
        "availableTechs": game["availableTechs"],
        "playerProfile": game.get("playerProfile"),
        "isCompleted": game["isCompleted"],
    }


# Stockage en mémoire. Pour la production, remplacer par une implémentation
# persistante (cf. README — branchement Supabase). L'interface se limite à
# get/set sur un identifiant de partie, l'abstraction est donc triviale.
ACTIVE_GAMES: Dict[str, Dict[str, Any]] = {}


# === APPLICATION ===============================================================

app = FastAPI(
    title="Human Memories API",
    version="2.0.0",
    description="Moteur de jeu narratif sur la mémoire collective de l'humanité.",
)

# Origines autorisées : configurables via CORS_ORIGINS (CSV). En l'absence de
# configuration, on autorise le dev local et le domaine Railway de prod.
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
    return {
        "message": "🧠 Human Memories API",
        "version": "2.0.0",
        "status": "healthy",
        "playablePeriods": GAME_DATA["playable_periods"],
        "technologies": len(GAME_DATA["technologies"]),
        "timestamp": _now(),
    }


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "human-memories-api",
        "environment": os.getenv("ENVIRONMENT", "production"),
        "timestamp": _now(),
    }


@app.get("/technologies")
async def get_technologies():
    """Renvoie toutes les technologies (objets complets) sous {technologies: [...]}"""
    return {"technologies": list(GAME_DATA["technologies"].values())}


@app.post("/game/create")
async def create_game(request: CreateGameRequest):
    playable = GAME_DATA["playable_periods"]
    if not playable:
        raise HTTPException(status_code=500, detail="Aucune époque jouable dans la base de données")

    game_id = str(uuid.uuid4())
    first_period = playable[0]
    game = {
        "gameId": game_id,
        "currentTurn": 1,
        "currentPeriod": first_period,
        "preservedTechs": [],
        "availableTechs": _offerable_techs(first_period, []),
        "playerProfile": None,
        "isCompleted": False,
        "difficulty": request.difficulty or "normal",
        "playerName": request.player_name,
        "createdAt": _now(),
    }
    ACTIVE_GAMES[game_id] = game
    return {"success": True, "data": _public_state(game)}


@app.get("/game/{game_id}")
async def get_game(game_id: str):
    game = ACTIVE_GAMES.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Partie introuvable")
    return {"success": True, "data": _public_state(game)}


@app.post("/game/{game_id}/preserve")
async def preserve_technologies(game_id: str, request: PreserveTechsRequest):
    game = ACTIVE_GAMES.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Partie introuvable")
    if game["isCompleted"]:
        raise HTTPException(status_code=400, detail="La partie est déjà terminée")

    tech_ids = list(dict.fromkeys(request.techIds))  # dédoublonne en gardant l'ordre
    max_per_turn = _max_preserved_per_turn()
    if not tech_ids:
        raise HTTPException(status_code=400, detail="Aucune technologie sélectionnée")
    if len(tech_ids) > max_per_turn:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum {max_per_turn} technologies préservées par tour",
        )

    available = set(game["availableTechs"])
    invalid = [t for t in tech_ids if t not in available]
    if invalid:
        raise HTTPException(
            status_code=400, detail=f"Technologies non disponibles : {', '.join(invalid)}"
        )

    # Préservation
    game["preservedTechs"].extend(tech_ids)
    narratives = [_immediate_narrative(t) for t in tech_ids]
    epoch_summary = _epoch_summary(game["currentPeriod"], tech_ids)
    game["playerProfile"] = _personality_from_preserved(game["preservedTechs"])

    # Avancement
    playable = GAME_DATA["playable_periods"]
    current_idx = playable.index(game["currentPeriod"])
    final_chronicle = None

    if current_idx < len(playable) - 1:
        next_period = playable[current_idx + 1]
        game["currentPeriod"] = next_period
        game["currentTurn"] += 1
        game["availableTechs"] = _offerable_techs(next_period, game["preservedTechs"])
    else:
        game["isCompleted"] = True
        game["availableTechs"] = []
        final_chronicle = _final_chronicle(game["preservedTechs"], game["playerProfile"])

    return {
        "success": True,
        "data": {
            "narratives": narratives,
            "epochSummary": epoch_summary,
            "finalChronicle": final_chronicle,
            "newState": _public_state(game),
            "isComplete": game["isCompleted"],
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
