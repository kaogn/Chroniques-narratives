#!/usr/bin/env python3
"""Ajoute les 3 techs feuilles finales (tour 24) et met a jour les parents."""
import json
from pathlib import Path

DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "technologies.json"

FINAL_LEAVES = [
    {
        "id": "transhumanism",
        "isRoot": False,
        "children": [],
        "majorEvent": (
            "Le transhumanisme ne fut pas un mouvement mais une glissade — progressive, confortable "
            "et difficile a refuser. Personne ne prit de decision claire de modifier l'humanite, mais "
            "chaque modification individuelle parut raisonnable. Quelques siecles plus tard, un "
            "archiviste cosmique relu le dossier et nota simplement : definition de l'humanite : en "
            "cours de revision. Statut : comme d'habitude."
        ),
        "name": "Transhumanisme",
        "period": "contemporary",
        "category": "scientific",
        "dateRange": {"min": 2030, "max": 2150},
        "rarity": "legendary",
        "historicalAccuracy": 0.5,
        "description": (
            "La fusion progressive entre biologie humaine et technologie repose la question "
            "fondamentale de ce que signifie etre humain."
        ),
        "dependencies": [],
        "effects": {"military": 2, "cultural": 4, "economic": 3, "social": 2, "exploration": 2},
        "narrative": {
            "memoryWord": "metamorphose",
            "wordVariants": ["augmentation", "cyborg", "posthumain", "evolution"],
            "immediate": [
                "L'humanite se modifia. Petit a petit. Puis tout d'un coup.",
                "La frontiere entre l'homme et la machine fut franchie. Puis redessinee. Puis franchie a nouveau."
            ],
            "epochTemplate": (
                "La metamorphose fut lente puis soudaine — et l'Univers, qui avait vu beaucoup "
                "d'especes evoluer, nota que c'etait la premiere a le faire consciemment."
            ),
            "finalTemplate": (
                "Ce que l'humanite etait devenue a la fin de son histoire ne ressemblait pas "
                "exactement a ce qu'elle avait ete au debut — mais toutes les memoires qui "
                "importaient avaient ete conservees."
            )
        },
        "gameplay": {
            "techTree": {"tier": 24, "prerequisites": [], "unlocks": []},
            "specialAbility": {
                "name": "Conscience augmentee",
                "description": "Dernier chapitre de l'histoire humaine telle qu'elle fut connue."
            }
        }
    },
    {
        "id": "quantum_computing",
        "isRoot": False,
        "children": [],
        "majorEvent": (
            "Le premier ordinateur quantique fonctionnel resolut en quatre minutes un probleme qui "
            "aurait pris a un ordinateur classique plus longtemps que l'age de l'Univers. Les "
            "ingenieurs feterent l'evenement avec du champagne. Personne ne sut exactement quoi faire "
            "ensuite, ce qui est assez caracteristique des percees technologiques majeures."
        ),
        "name": "Informatique quantique",
        "period": "contemporary",
        "category": "scientific",
        "dateRange": {"min": 2025, "max": 2100},
        "rarity": "legendary",
        "historicalAccuracy": 0.7,
        "description": (
            "L'informatique quantique exploite les proprietes de la mecanique quantique pour resoudre "
            "des problemes impossibles aux ordinateurs classiques, revolutionnant la cryptographie, "
            "la pharmacologie et la simulation."
        ),
        "dependencies": [],
        "effects": {"military": 3, "cultural": 2, "economic": 4, "social": 1, "exploration": 3},
        "narrative": {
            "memoryWord": "superposition",
            "wordVariants": ["qubit", "entanglement", "calcul", "quantum"],
            "immediate": [
                "La machine fut a la fois allumee et eteinte. Les resultats furent corrects quand meme.",
                "Le calcul s'effectua dans plusieurs univers simultanement. Un seul repondit."
            ],
            "epochTemplate": (
                "La superposition devint un outil — et l'humanite apprit a travailler avec des "
                "realites multiples simultanees, ce qui l'avait toujours fait de toute facon, "
                "mais maintenant avec des calculs."
            ),
            "finalTemplate": (
                "L'ordinateur quantique calcula tout ce qui pouvait l'etre — et la liste de ce "
                "qui ne pouvait pas l'etre s'avera plus interessante que celle de ce qui le pouvait."
            )
        },
        "gameplay": {
            "techTree": {"tier": 24, "prerequisites": [], "unlocks": []},
            "specialAbility": {
                "name": "Puissance de calcul infinie",
                "description": "Dernier chapitre de la revolution numerique."
            }
        }
    },
    {
        "id": "fusion_energy",
        "isRoot": False,
        "children": [],
        "majorEvent": (
            "La fusion nucleaire controlee fut realisee pour la premiere fois — ou du moins quelque "
            "chose qui ressemblait assez a la fusion pour que les ingenieurs appellent leurs familles. "
            "L'energie produite dura seize secondes. Les couts de production depasserent l'energie "
            "generee d'un facteur de dix mille. Mais la preuve de principe etait etablie, et "
            "l'humanite disposait desormais du meme moteur que les etoiles. L'archiviste cosmique "
            "cocha la case puissance stellaire et passa a la page suivante."
        ),
        "name": "Energie de fusion",
        "period": "contemporary",
        "category": "scientific",
        "dateRange": {"min": 2040, "max": 2100},
        "rarity": "legendary",
        "historicalAccuracy": 0.6,
        "description": (
            "La maitrise de la fusion nucleaire — la meme reaction qui alimente les etoiles — "
            "promet une energie quasi-illimitee et propre, transformant radicalement l'economie mondiale."
        ),
        "dependencies": [],
        "effects": {"military": 2, "cultural": 2, "economic": 5, "social": 3, "exploration": 4},
        "narrative": {
            "memoryWord": "etoile",
            "wordVariants": ["fusion", "plasma", "tokamak", "energie"],
            "immediate": [
                "L'energie des etoiles fut capturee. Brievement. C'etait suffisant pour recommencer.",
                "La fusion s'emballa. Puis s'arreta. Puis recommenca. L'humanite appela ca du progres."
            ],
            "epochTemplate": (
                "L'energie fut enfin suffisante — et l'humanite, qui avait passe des millenaires "
                "a se battre pour les ressources, se demanda ce qu'elle ferait d'elle-meme "
                "avec l'abondance."
            ),
            "finalTemplate": (
                "L'etoile fut domestiquee, le feu originel maitrise une seconde fois — et le "
                "registre de l'Univers s'enrichit d'une note : l'humanite a appris a copier, "
                "avec une certaine elegance."
            )
        },
        "gameplay": {
            "techTree": {"tier": 24, "prerequisites": [], "unlocks": []},
            "specialAbility": {
                "name": "Energie stellaire",
                "description": "Dernier chapitre de la maitrise energetique de l'humanite."
            }
        }
    },
]

PARENT_UPDATES = {
    "artificial_intelligence": ["transhumanism", "quantum_computing", "fusion_energy"],
    "space_exploration":       ["quantum_computing", "fusion_energy", "transhumanism"],
    "genetic_engineering":     ["fusion_energy", "transhumanism", "quantum_computing"],
}


def main() -> None:
    with DATA_FILE.open(encoding="utf-8") as fh:
        data = json.load(fh)

    tech_index = {t["id"]: t for t in data["technologies"]}

    for tech in FINAL_LEAVES:
        if tech["id"] not in tech_index:
            tech_index[tech["id"]] = tech
            print(f"  Ajoutee: {tech['id']}")

    for tech_id, children in PARENT_UPDATES.items():
        tech_index[tech_id]["children"] = children
        print(f"  Children mis a jour: {tech_id} -> {children}")

    roots = [t for t in tech_index.values() if t.get("isRoot")]
    others = [t for t in tech_index.values() if not t.get("isRoot")]
    data["technologies"] = roots + others
    data["metadata"]["totalTechnologies"] = len(data["technologies"])

    with DATA_FILE.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)

    print(f"\nTotal: {len(data['technologies'])} technologies")

    # Tracer le chemin canonique
    path = []
    current = "fire_control"
    for _ in range(30):
        path.append(current)
        children = tech_index.get(current, {}).get("children", [])
        if not children:
            break
        current = children[0]

    print(f"Profondeur: {len(path)} noeuds")
    for i, n in enumerate(path):
        print(f"  Tour {i+1:2d}: {n}")

    # Validation
    declared_leaves = {"transhumanism", "quantum_computing", "fusion_energy"}
    problems = []
    for tid, t in tech_index.items():
        if tid in declared_leaves:
            continue
        children = t.get("children", [])
        if not children:
            problems.append(f"IMPASSE inattendue: {tid}")
        for c in children:
            if c not in tech_index:
                problems.append(f"{tid} -> ENFANT MANQUANT: {c}")
    if problems:
        print("\nPROBLEMES:")
        for p in problems:
            print(f"  {p}")
    else:
        print("\nArbre valide: 24 niveaux, aucun enfant manquant.")


if __name__ == "__main__":
    main()
