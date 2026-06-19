#!/usr/bin/env python3
"""
Restructure l'arbre de décisions pour turnsPerEpoch=3.

Avant : 38 techs, 8 niveaux (1 tour/époque)
Après : 57 techs, 24 niveaux (3 tours/époque × 8 époques)

Plan de l'arbre :
  Époque 1 (prehistoric)   : roots → [cave_art/tribal_gathering/plant_gathering] → [shamanism/food_preservation/primitive_trade] → epoch 2
  Époque 2 (ancient_early) : [writing_cuneiform/bronze_working/irrigation] → [wheel/law_codes/textile_weaving] → [sailing/mathematics/urban_planning] → epoch 3
  Époque 3 (ancient_classical) : [philosophy/democracy/roman_engineering] → [theatre/olympic_games/senate_debates] → [rhetoric/great_library/military_engineering] → epoch 4
  Époque 4 (medieval_early) : [monasteries/alchemy/guilds] → [feudalism/water_mills/heavy_plow] → epoch 5
  Époque 5 (medieval_late)  : [gothic_cathedral/trade_fairs/printing_block] → [universities/gunpowder/banking_early] → epoch 6
  Époque 6 (renaissance)    : [printing_press/exploration_ships/artillery] → [scientific_method/humanism/double_entry_accounting] → epoch 7
  Époque 7 (industrial)     : [steam_engine/factory_system/railways] → [chemistry/newspapers/electricity] → epoch 8
  Époque 8 (contemporary)   : [aviation/cinema/internet] → [antibiotics/nuclear_energy/human_rights] → FIN
"""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = REPO_ROOT / "data" / "technologies.json"

# ── NOUVELLES LIAISONS enfants pour les techs existantes ─────────────────────
CHILDREN_UPDATES = {
    # Époque 1, tour 1 → sous-couche 1 (prehistoric)
    "fire_control":    ["cave_art", "tribal_gathering", "plant_gathering"],
    "stone_tools":     ["tribal_gathering", "plant_gathering", "cave_art"],
    "agriculture":     ["plant_gathering", "cave_art", "tribal_gathering"],

    # Époque 1, tour 2 → sous-couche 2 (prehistoric)
    "cave_art":        ["shamanism", "food_preservation", "primitive_trade"],
    "tribal_gathering":["food_preservation", "primitive_trade", "shamanism"],
    "plant_gathering": ["primitive_trade", "shamanism", "food_preservation"],

    # Époque 1, tour 3 → entrée époque 2 (ancient_early)
    "shamanism":       ["writing_cuneiform", "bronze_working", "irrigation"],
    "food_preservation":["bronze_working", "irrigation", "writing_cuneiform"],
    "primitive_trade": ["irrigation", "writing_cuneiform", "bronze_working"],

    # Époque 2, tour 1 → sous-couche 1 (ancient_early)
    "writing_cuneiform":["wheel", "law_codes", "textile_weaving"],
    "bronze_working":  ["law_codes", "textile_weaving", "wheel"],
    "irrigation":      ["textile_weaving", "wheel", "law_codes"],

    # Époque 2, tour 2 → sous-couche 2 (ancient_early)
    "wheel":           ["sailing", "mathematics", "urban_planning"],
    "law_codes":       ["mathematics", "urban_planning", "sailing"],
    "textile_weaving": ["urban_planning", "sailing", "mathematics"],

    # Époque 2, tour 3 → entrée époque 3 (ancient_classical)
    "sailing":         ["philosophy", "democracy", "roman_engineering"],
    "mathematics":     ["democracy", "roman_engineering", "philosophy"],
    "urban_planning":  ["roman_engineering", "philosophy", "democracy"],

    # Époque 3, tour 1 → sous-couche 1 (ancient_classical)
    "philosophy":      ["theatre", "olympic_games", "senate_debates"],
    "democracy":       ["olympic_games", "senate_debates", "theatre"],
    "roman_engineering":["senate_debates", "theatre", "olympic_games"],

    # Époque 3, tour 2 → sous-couche 2 (ancient_classical)
    "theatre":         ["rhetoric", "great_library", "military_engineering"],
    "olympic_games":   ["great_library", "military_engineering", "rhetoric"],
    "senate_debates":  ["military_engineering", "rhetoric", "great_library"],

    # Époque 3, tour 3 → entrée époque 4 (medieval_early) : tous → {monasteries, alchemy, guilds}
    "rhetoric":          ["monasteries", "alchemy", "guilds"],
    "great_library":     ["alchemy", "guilds", "monasteries"],
    "military_engineering":["guilds", "monasteries", "alchemy"],

    # Époque 4, tour 1 → sous-couche (medieval_early) : {monasteries, alchemy, guilds} → {feudalism, water_mills, heavy_plow}
    "monasteries":  ["feudalism", "water_mills", "heavy_plow"],
    "alchemy":      ["water_mills", "heavy_plow", "feudalism"],
    "guilds":       ["heavy_plow", "feudalism", "water_mills"],

    # Époque 4, tour 2 → entrée époque 5 (medieval_late) : tous → {gothic_cathedral, trade_fairs, printing_block}
    "feudalism":    ["gothic_cathedral", "trade_fairs", "printing_block"],
    "water_mills":  ["trade_fairs", "printing_block", "gothic_cathedral"],
    "heavy_plow":   ["printing_block", "gothic_cathedral", "trade_fairs"],

    # Époque 5, tour 1 → sous-couche (medieval_late) : {gothic_cathedral, trade_fairs, printing_block} → {universities, gunpowder, banking_early}
    "gothic_cathedral": ["universities", "gunpowder", "banking_early"],
    "trade_fairs":      ["gunpowder", "banking_early", "universities"],
    "printing_block":   ["banking_early", "universities", "gunpowder"],

    # Époque 5, tour 2 → entrée époque 6 (renaissance) : tous → {printing_press, exploration_ships, artillery}
    "universities":    ["printing_press", "exploration_ships", "artillery"],
    "gunpowder":       ["exploration_ships", "artillery", "printing_press"],
    "banking_early":   ["artillery", "printing_press", "exploration_ships"],

    # Époque 6, tour 1 → sous-couche (renaissance) : {printing_press, exploration_ships, artillery} → {scientific_method, humanism, double_entry_accounting}
    "printing_press":   ["scientific_method", "humanism", "double_entry_accounting"],
    "exploration_ships":["humanism", "double_entry_accounting", "scientific_method"],
    "artillery":        ["double_entry_accounting", "scientific_method", "humanism"],

    # Époque 6, tour 2 → entrée époque 7 (industrial) : tous → {steam_engine, factory_system, railways}
    "scientific_method":      ["steam_engine", "factory_system", "railways"],
    "humanism":               ["factory_system", "railways", "steam_engine"],
    "double_entry_accounting":["railways", "steam_engine", "factory_system"],

    # Époque 7, tour 1 → sous-couche (industrial) : {steam_engine, factory_system, railways} → {chemistry, newspapers, electricity}
    "steam_engine":   ["chemistry", "newspapers", "electricity"],
    "factory_system": ["newspapers", "electricity", "chemistry"],
    "railways":       ["electricity", "chemistry", "newspapers"],

    # Époque 7, tour 2 → entrée époque 8 (contemporary) : tous → {aviation, cinema, internet}
    "chemistry":   ["aviation", "cinema", "internet"],
    "newspapers":  ["cinema", "internet", "aviation"],
    "electricity": ["internet", "aviation", "cinema"],

    # Époque 8, tour 1 → sous-couche finale (contemporary) : {aviation, cinema, internet} → {antibiotics, nuclear_energy, human_rights}
    "aviation": ["antibiotics", "nuclear_energy", "human_rights"],
    "internet": ["nuclear_energy", "human_rights", "antibiotics"],
    "cinema":   ["human_rights", "antibiotics", "nuclear_energy"],

    # Feuilles (tour 3 époque 8 — le jeu se termine après ce pick)
    "antibiotics":    [],
    "nuclear_energy": [],
    "human_rights":   [],
}

# ── 19 NOUVELLES TECHNOLOGIES ─────────────────────────────────────────────────
NEW_TECHNOLOGIES = [
    # ── Époque 1 sous-couche 1 ────────────────────────────────────────────────
    {
        "id": "cave_art",
        "isRoot": False,
        "children": ["shamanism", "food_preservation", "primitive_trade"],
        "majorEvent": "Au fond de la grotte qui sentait le silex mouillé et l'espoir, quelqu'un trempa ses doigts dans de l'ocre et dessina sur la pierre. Ce n'était pas un aurochs. Du moins, ce n'était pas ce que tout le monde voyait — la moitié du clan y vit un cheval, l'autre moitié une carte. Personne ne pensa à demander à l'artiste. On n'inventa le sens de l'œuvre que bien plus tard, et uniquement pour éviter ces conversations gênantes.",
        "name": "Peinture pariétale",
        "period": "prehistoric",
        "category": "cultural",
        "dateRange": {"min": -40000, "max": -10000},
        "rarity": "rare",
        "historicalAccuracy": 0.95,
        "description": "Les premières représentations picturales sur parois de grottes témoignent d'un besoin humain de raconter et de perpétuer la mémoire collective.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 3, "economic": 0, "social": 1, "exploration": 1},
        "narrative": {
            "memoryWord": "empreinte",
            "wordVariants": ["image", "trace", "paroi", "ocre"],
            "immediate": [
                "Quelqu'un a dessiné quelque chose. Personne ne sait exactement quoi. C'est devenu de l'art.",
                "La paroi a accepté l'empreinte comme si elle l'attendait depuis le début."
            ],
            "epochTemplate": "L'empreinte de la main persiste dans la pierre — une signature au bas d'un contrat que personne n'avait rédigé, avec une espèce qui n'était pas encore certaine d'avoir un futur.",
            "finalTemplate": "L'empreinte demeura longtemps après que la main qui l'avait faite eut disparu — première définition de l'art, et peut-être la seule qui compte."
        },
        "gameplay": {
            "techTree": {"tier": 2, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Mémoire collective", "description": "Permet de transmettre les savoirs entre générations par l'image."}
        }
    },
    {
        "id": "tribal_gathering",
        "isRoot": False,
        "children": ["food_preservation", "primitive_trade", "shamanism"],
        "majorEvent": "La première grande réunion inter-tribale se déroula comme tout événement diplomatique : avec beaucoup de méfiance, quelques chansons pour alléger l'atmosphère, et un malentendu retentissant sur qui devait apporter la nourriture. On résolut la question en mangeant quand même — et l'humanité découvrit que manger ensemble est, d'une manière difficile à décrire avec précision, beaucoup plus efficace que les discours.",
        "name": "Rassemblements tribaux",
        "period": "prehistoric",
        "category": "social",
        "dateRange": {"min": -100000, "max": -10000},
        "rarity": "common",
        "historicalAccuracy": 0.85,
        "description": "Les rassemblements saisonniers de différentes tribus permettaient l'échange d'informations, de partenaires et de ressources rares.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 1, "economic": 0, "social": 3, "exploration": 0},
        "narrative": {
            "memoryWord": "cercle",
            "wordVariants": ["réunion", "clan", "foule", "assemblée"],
            "immediate": [
                "Des étrangers arrivèrent. On les regarda longtemps. Puis on mangea ensemble.",
                "Le cercle s'agrandit pour la première fois. Ce fut inconfortable, puis indispensable."
            ],
            "epochTemplate": "Le cercle s'ouvrit pour accueillir des inconnus. Ce fut la décision la plus dangereuse et la plus rentable que l'humanité ait jamais prise — et elle ne s'en rendit compte que plusieurs millénaires plus tard.",
            "finalTemplate": "Le cercle originel, tracé dans la poussière d'une clairière, fut la matrice de toutes les villes, tous les parlements, tous les marchés qui suivirent."
        },
        "gameplay": {
            "techTree": {"tier": 2, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Réseau tribal", "description": "Facilite les alliances et la transmission d'informations sur de longues distances."}
        }
    },
    {
        "id": "plant_gathering",
        "isRoot": False,
        "children": ["primitive_trade", "shamanism", "food_preservation"],
        "majorEvent": "Personne ne sait exactement qui remarqua que certaines baies tuaient et d'autres nourrissaient. Cette information, transmise avec la précision qui caractérise les traditions orales — c'est-à-dire imparfaitement, avec des variations régionales considérables — constitua le premier corpus botanique de l'humanité. L'Univers nota dans son registre : Apprentissage par essais et erreurs : en cours.",
        "name": "Cueillette organisée",
        "period": "prehistoric",
        "category": "economic",
        "dateRange": {"min": -500000, "max": -10000},
        "rarity": "common",
        "historicalAccuracy": 0.9,
        "description": "La collecte méthodique de plantes comestibles, médicinales et utiles constitua les premières bases d'une économie de subsistance organisée.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 0, "economic": 2, "social": 1, "exploration": 1},
        "narrative": {
            "memoryWord": "racine",
            "wordVariants": ["baie", "plante", "herbe", "tige"],
            "immediate": [
                "On sut enfin ce qui se mangeait et ce qui tuait. La distinction parut immédiatement utile.",
                "La racine fut arrachée, examinée, jugée. Puis mangée. C'est la méthode scientifique dans sa forme originale."
            ],
            "epochTemplate": "La racine fut arrachée, examinée, jugée digne — et le catalogue du monde comestible s'agrandit d'une entrée de plus, fragile mais réelle.",
            "finalTemplate": "Le catalogue des racines et des baies fut le premier livre de l'humanité — non écrit, non illustré, mais mémorisé avec une précision que n'atteignit aucun traité ultérieur."
        },
        "gameplay": {
            "techTree": {"tier": 2, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Connaissance végétale", "description": "Améliore la survie et ouvre les premières pratiques médicinales."}
        }
    },
    # ── Époque 1 sous-couche 2 ────────────────────────────────────────────────
    {
        "id": "shamanism",
        "isRoot": False,
        "children": ["writing_cuneiform", "bronze_working", "irrigation"],
        "majorEvent": "Le premier chaman entra en transe trois jours de suite, puis annonça solennellement que les ancêtres demandaient davantage de chansons. Ce message fut accueilli avec une crédulité remarquable — en partie parce qu'il résolvait le problème pressant de savoir quoi faire lors des soirées hivernales. L'Univers, qui avait prévu quelque chose de plus profond, soupira légèrement et cocha quand même la case contact établi.",
        "name": "Chamanisme",
        "period": "prehistoric",
        "category": "cultural",
        "dateRange": {"min": -50000, "max": -3000},
        "rarity": "rare",
        "historicalAccuracy": 0.9,
        "description": "Les chamans, intermédiaires entre le monde des vivants et celui des esprits, structurèrent les premières formes de religion, de médecine rituelle et d'autorité symbolique.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 3, "economic": 0, "social": 2, "exploration": 0},
        "narrative": {
            "memoryWord": "esprit",
            "wordVariants": ["transe", "rituel", "ancêtre", "vision"],
            "immediate": [
                "Le chaman parla aux morts. Les morts, courtoisement, répondirent.",
                "Une voix venue d'ailleurs fut entendue. Personne ne demanda d'où exactement."
            ],
            "epochTemplate": "L'esprit fut nommé. Dès lors, il eut une adresse, des exigences, et — fait notable — un représentant autorisé. L'administration cosmique venait de trouver son premier correspondant humain.",
            "finalTemplate": "Le chaman disparu laissa derrière lui une tradition, une technique et une dette envers l'invisible que la civilisation entière s'employa à rembourser pendant des millénaires."
        },
        "gameplay": {
            "techTree": {"tier": 3, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Médiation spirituelle", "description": "Structure sociale et cohésion par le rituel ; premiers soins symboliques."}
        }
    },
    {
        "id": "food_preservation",
        "isRoot": False,
        "children": ["bronze_working", "irrigation", "writing_cuneiform"],
        "majorEvent": "Personne ne sait exactement qui oublia le poisson près du feu trop longtemps et découvrit le fumage. L'histoire retiendra simplement qu'il fut mangé quand même — ce qui est, dans les grandes lignes, la définition de toute innovation culinaire. La tribu qui maîtrisa cette technique survécut à l'hiver suivant avec un excédent alimentaire, deux kilos de plus par personne, et une légère odeur de fumée qui persista pendant des siècles.",
        "name": "Conservation alimentaire",
        "period": "prehistoric",
        "category": "economic",
        "dateRange": {"min": -100000, "max": -5000},
        "rarity": "common",
        "historicalAccuracy": 0.85,
        "description": "Le séchage, le fumage et le salage des aliments permirent aux groupes humains de constituer des réserves et d'envisager la sédentarisation.",
        "dependencies": [],
        "effects": {"military": 1, "cultural": 0, "economic": 3, "social": 1, "exploration": 0},
        "narrative": {
            "memoryWord": "provision",
            "wordVariants": ["réserve", "fumage", "séchage", "sel"],
            "immediate": [
                "L'hiver arriva. On mangea quand même. C'était une première.",
                "La provision changea tout : pour la première fois, le futur pesait moins lourd que le présent."
            ],
            "epochTemplate": "La provision constitua un argument contre l'urgence du présent — et l'humanité inventa ainsi, sans le savoir, le concept de demain.",
            "finalTemplate": "La provision, fragile accumulation contre l'hiver, fut la première forme de foi : la croyance que le futur valait la peine d'être préparé."
        },
        "gameplay": {
            "techTree": {"tier": 3, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Réserves hivernales", "description": "Permet de survivre aux pénuries saisonnières ; pose les bases de la sédentarisation."}
        }
    },
    {
        "id": "primitive_trade",
        "isRoot": False,
        "children": ["irrigation", "writing_cuneiform", "bronze_working"],
        "majorEvent": "Le premier échange commercial de l'histoire impliqua une peau de bête, trois silex taillés, et un malentendu sur leur valeur relative qui dura deux générations. Les deux parties se séparèrent convaincues d'avoir arnaqué l'autre. L'archiviste de l'Univers, qui surveillait l'opération, inscrivit dans son registre : Commerce inventé. Satisfaction mutuelle : en attente.",
        "name": "Commerce primitif",
        "period": "prehistoric",
        "category": "economic",
        "dateRange": {"min": -100000, "max": -5000},
        "rarity": "common",
        "historicalAccuracy": 0.8,
        "description": "Les premiers échanges de biens entre groupes distincts posèrent les bases de l'économie et créèrent des liens sociaux transcendant les frontières tribales.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 1, "economic": 2, "social": 2, "exploration": 1},
        "narrative": {
            "memoryWord": "échange",
            "wordVariants": ["troc", "marché", "valeur", "don"],
            "immediate": [
                "Quelque chose changea de mains. Les deux mains se retirèrent satisfaites. C'était un miracle.",
                "La valeur fut inventée au moment où deux personnes ne purent se mettre d'accord sur elle."
            ],
            "epochTemplate": "L'échange eut lieu. Deux mains se tendirent et se retirèrent légèrement différentes de ce qu'elles étaient — c'est, à peu de choses près, la définition complète de toute civilisation.",
            "finalTemplate": "Le premier échange ne fut jamais équitable, et c'est précisément pourquoi il fut répété — dans l'espoir persistant qu'un jour, quelqu'un aurait enfin le dernier mot."
        },
        "gameplay": {
            "techTree": {"tier": 3, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Réseau d'échange", "description": "Permet la spécialisation des rôles et l'accès à des ressources distantes."}
        }
    },
    # ── Époque 2 : troisième tech d'entrée ────────────────────────────────────
    {
        "id": "irrigation",
        "isRoot": False,
        "children": ["textile_weaving", "wheel", "law_codes"],
        "majorEvent": "La première crue contrôlée permit à cinq fois plus de personnes de manger à leur faim. Quelqu'un nota quelque part que l'eau, laissée à elle-même, avait tendance à ignorer les plans des humains. Ce quelqu'un fut nommé Ingénieur et reçut une tablette d'argile gravée à son nom, ce qui était à l'époque l'équivalent d'une promotion avec augmentation.",
        "name": "Irrigation",
        "period": "ancient_early",
        "category": "economic",
        "dateRange": {"min": -6000, "max": -3000},
        "rarity": "rare",
        "historicalAccuracy": 0.95,
        "description": "La maîtrise de l'eau par des canaux et des digues permit une agriculture intensive et posa les bases des premières grandes civilisations fluviales.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 0, "economic": 4, "social": 2, "exploration": 0},
        "narrative": {
            "memoryWord": "canal",
            "wordVariants": ["digue", "eau", "fleuve", "récolte"],
            "immediate": [
                "L'eau fut contrainte. Elle obéit à contrecœur. On appela ça un canal.",
                "Le fleuve fut persuadé de passer par là plutôt qu'ailleurs. Ce fut long et humide."
            ],
            "epochTemplate": "Le canal creusé dans la terre fut la première phrase que l'humanité adressa à la géographie — une déclaration d'intention, rédigée en boue et en sueur, qui disait simplement : pas comme ça.",
            "finalTemplate": "Le canal demeura longtemps après que ceux qui l'avaient creusé eurent disparu — preuve que l'humanité, quand elle s'y met, peut modifier le monde de façon durable et irréversible."
        },
        "gameplay": {
            "techTree": {"tier": 4, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Maîtrise hydraulique", "description": "Multiplie les rendements agricoles ; permet les premières cités-États fluviales."}
        }
    },
    # ── Époque 2 sous-couche 1 ────────────────────────────────────────────────
    {
        "id": "wheel",
        "isRoot": False,
        "children": ["sailing", "mathematics", "urban_planning"],
        "majorEvent": "La roue fut inventée par quelqu'un qui en avait assez de porter des choses. Ce quelqu'un est resté anonyme, ce qui est profondément injuste mais parfaitement prévisible. La première utilisation documentée fut le transport de grain — puis vint le char de guerre, ce qui suggère que l'humanité dispose d'une capacité remarquable à transformer les innovations pratiques en instruments de conflit en moins d'une génération.",
        "name": "La Roue",
        "period": "ancient_early",
        "category": "industrial",
        "dateRange": {"min": -3500, "max": -2000},
        "rarity": "pillar",
        "historicalAccuracy": 0.95,
        "description": "L'invention de la roue révolutionna le transport, l'agriculture et l'industrie, multipliant l'efficacité de la force humaine et animale.",
        "dependencies": [],
        "effects": {"military": 1, "cultural": 0, "economic": 4, "social": 1, "exploration": 2},
        "narrative": {
            "memoryWord": "rotation",
            "wordVariants": ["roue", "tour", "axe", "mouvement"],
            "immediate": [
                "Quelque chose se mit à tourner. Tout ce qui suivit, d'une façon ou d'une autre, tourna aussi.",
                "La roue fut ronde par nécessité. C'était le seul choix qui évitait les à-coups."
            ],
            "epochTemplate": "La rotation devint possible. Et dans son registre, l'Univers cocha la case mouvement perpétuel : pas encore, mais on se rapproche — et attendit de voir ce que l'humanité ferait de cette avance.",
            "finalTemplate": "La roue continua de tourner longtemps après qu'on eut cessé de la pousser — métaphore que personne ne formula avant plusieurs millénaires, mais que tout le monde pressentait."
        },
        "gameplay": {
            "techTree": {"tier": 5, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Transport efficace", "description": "Démultiplie la mobilité des biens et des personnes ; permet le commerce à longue distance."}
        }
    },
    {
        "id": "law_codes",
        "isRoot": False,
        "children": ["mathematics", "urban_planning", "sailing"],
        "majorEvent": "Le premier code de loi fut gravé sur une stèle de basalte de deux mètres — une hauteur qui suggère que le législateur voulait s'assurer que personne ne pourrait prétendre ne pas l'avoir vu. La loi la plus célèbre, œil pour œil, dent pour dent, fut immédiatement commentée par un citoyen qui demanda ce qui se passait en cas de perte d'un organe n'existant qu'en un seul exemplaire. L'archiviste royal nota la question et passa à la suivante.",
        "name": "Codes de loi",
        "period": "ancient_early",
        "category": "social",
        "dateRange": {"min": -2100, "max": -500},
        "rarity": "rare",
        "historicalAccuracy": 0.95,
        "description": "Les premiers codes législatifs écrits, comme le Code d'Hammurabi, établirent des règles publiques pour réguler la vie sociale et économique des premières cités.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 1, "economic": 1, "social": 4, "exploration": 0},
        "narrative": {
            "memoryWord": "justice",
            "wordVariants": ["loi", "règle", "tribunal", "sentence"],
            "immediate": [
                "Ce qui était interdit fut écrit. Ce qui était écrit fut lu. Ce qui fut lu fut discuté.",
                "La loi fut gravée dans la pierre, ce qui rendait difficile de prétendre ne pas la connaître."
            ],
            "epochTemplate": "La justice fut écrite — ce qui la rendit à la fois plus équitable et plus contestable, puisqu'on pouvait désormais lire exactement ce qu'on avait le droit de reprocher à l'autorité.",
            "finalTemplate": "Le code gravé dans la pierre survécut à tous ceux qui l'avaient rédigé — et continua de régir des vies que ses auteurs n'auraient pas pu imaginer."
        },
        "gameplay": {
            "techTree": {"tier": 5, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "État de droit", "description": "Réduit les conflits internes ; permet une administration stable des cités."}
        }
    },
    {
        "id": "textile_weaving",
        "isRoot": False,
        "children": ["urban_planning", "sailing", "mathematics"],
        "majorEvent": "Le premier tissu de lin fabriqué avec un vrai métier à tisser était, par les normes actuelles, assez grossier. Mais il était chaud, il couvrait les parties importantes, et il représentait deux semaines de travail que son propriétaire n'était pas disposé à laisser à n'importe qui. Ainsi naquit simultanément le textile, la mode, et l'expression c'est à moi — trois piliers inséparables de la civilisation humaine.",
        "name": "Tissage",
        "period": "ancient_early",
        "category": "economic",
        "dateRange": {"min": -7000, "max": -2000},
        "rarity": "common",
        "historicalAccuracy": 0.9,
        "description": "La production de tissus à partir de fibres végétales et animales créa l'une des premières industries artisanales et permit l'expression de l'identité sociale par le vêtement.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 2, "economic": 3, "social": 1, "exploration": 0},
        "narrative": {
            "memoryWord": "fil",
            "wordVariants": ["tissu", "laine", "lin", "trame"],
            "immediate": [
                "Un fil fut tendu. Puis un autre. Puis l'humanité s'habilla et ne regarda plus en arrière.",
                "Le premier tissu prit deux semaines. Le deuxième en prit une. L'industrie était née."
            ],
            "epochTemplate": "Le fil tissa le premier lien entre utilité et identité — et le registre de l'Univers nota que les humains venaient d'inventer une façon de montrer qui ils étaient sans avoir à l'expliquer.",
            "finalTemplate": "Le fil conducteur de la civilisation fut, littéralement, un fil — et tout ce qui vint après n'en fut que l'extension, plus ou moins élaborée."
        },
        "gameplay": {
            "techTree": {"tier": 5, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Production textile", "description": "Première industrie spécialisée ; ouvre le commerce de produits transformés."}
        }
    },
    # ── Époque 2 sous-couche 2 ────────────────────────────────────────────────
    {
        "id": "sailing",
        "isRoot": False,
        "children": ["philosophy", "democracy", "roman_engineering"],
        "majorEvent": "Le premier marin à utiliser une voile carré par vent favorable nota que le vent faisait le travail à sa place. Cette observation fut suivie d'une seconde : que le vent ne soufflait pas toujours dans la direction souhaitée. On inventa le gouvernail pour corriger la trajectoire, et quelqu'un remarqua alors qu'on venait peut-être de résumer l'ensemble de l'histoire humaine en deux étapes.",
        "name": "Navigation à voile",
        "period": "ancient_early",
        "category": "exploration",
        "dateRange": {"min": -3500, "max": -1000},
        "rarity": "rare",
        "historicalAccuracy": 0.9,
        "description": "La maîtrise de la voile et des techniques de navigation permit aux civilisations de s'étendre au-delà des terres, ouvrant de nouvelles routes commerciales et de nouvelles terres.",
        "dependencies": [],
        "effects": {"military": 2, "cultural": 1, "economic": 2, "social": 0, "exploration": 4},
        "narrative": {
            "memoryWord": "horizon",
            "wordVariants": ["voile", "mer", "vent", "cap"],
            "immediate": [
                "La voile se gonfla. Le bateau avança. L'horizon recula. On recommença le lendemain.",
                "Pour la première fois, l'humanité voyagea plus vite que ses jambes ne le permettaient."
            ],
            "epochTemplate": "L'horizon recula d'autant que l'humanité avança vers lui — et le registre de l'Univers, qui s'attendait à ce que ça s'arrête à la côte, dut ajouter plusieurs pages supplémentaires.",
            "finalTemplate": "L'horizon fut toujours plus loin — et cette propriété de l'horizon, décevante au premier abord, fut la plus grande invention que l'humanité n'ait jamais faite."
        },
        "gameplay": {
            "techTree": {"tier": 6, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Routes maritimes", "description": "Permet le commerce intercontinental et les premières colonies."}
        }
    },
    {
        "id": "mathematics",
        "isRoot": False,
        "children": ["democracy", "roman_engineering", "philosophy"],
        "majorEvent": "Quelqu'un compta jusqu'à un nombre suffisamment grand pour se demander ce qui venait après, et dut inventer un nouveau chiffre. Cette décision — purement pratique au départ — s'avéra être le début d'une discipline qui allait hanter des générations d'étudiants. L'Univers, qui fonctionne sur des mathématiques depuis le début, accueillit la nouvelle avec la modestie d'un auteur dont on vient de découvrir le premier livre.",
        "name": "Mathématiques",
        "period": "ancient_early",
        "category": "scientific",
        "dateRange": {"min": -3000, "max": -500},
        "rarity": "rare",
        "historicalAccuracy": 0.9,
        "description": "Le développement de systèmes numériques et des premiers raisonnements mathématiques permit la comptabilité précise, la planification architecturale et les débuts de la géométrie.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 2, "economic": 2, "social": 0, "exploration": 1},
        "narrative": {
            "memoryWord": "nombre",
            "wordVariants": ["calcul", "géométrie", "chiffre", "équation"],
            "immediate": [
                "On compta. On recompta. Les deux résultats différaient. On inventa l'algèbre.",
                "Le nombre naquit quand il fallut savoir exactement combien, et non plus à peu près."
            ],
            "epochTemplate": "Le nombre naquit de la nécessité de savoir exactement combien — et non plus à peu près. L'Univers apprécia qu'on lui posât enfin la question correctement.",
            "finalTemplate": "Les mathématiques furent la première langue que l'Univers et l'humanité parlèrent ensemble — et ni l'un ni l'autre ne fut entièrement à l'aise dans cette conversation."
        },
        "gameplay": {
            "techTree": {"tier": 6, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Raisonnement abstrait", "description": "Améliore l'architecture, l'ingénierie et la navigation ; base de toutes les sciences."}
        }
    },
    {
        "id": "urban_planning",
        "isRoot": False,
        "children": ["roman_engineering", "philosophy", "democracy"],
        "majorEvent": "La première ville planifiée fut tracée sur le sol par quelqu'un qui avait une idée précise de où devait aller quoi. Les habitants, qui avaient des idées différentes, s'installèrent légèrement ailleurs. On construisit néanmoins selon le plan, et la ville fut déclarée parfaitement organisée à l'exception du fait que personne ne vivait dans les quartiers prévus pour eux. Cet écart entre la carte et le terrain fut baptisé urbanité et n'a pas changé depuis.",
        "name": "Urbanisme",
        "period": "ancient_early",
        "category": "social",
        "dateRange": {"min": -2600, "max": -500},
        "rarity": "rare",
        "historicalAccuracy": 0.85,
        "description": "La planification délibérée des villes, avec rues quadrillées, systèmes d'égouts et zonage fonctionnel, apparut dans les civilisations de l'Indus et de Mésopotamie.",
        "dependencies": [],
        "effects": {"military": 1, "cultural": 1, "economic": 2, "social": 4, "exploration": 0},
        "narrative": {
            "memoryWord": "cité",
            "wordVariants": ["plan", "rue", "quartier", "agora"],
            "immediate": [
                "La ville fut dessinée avant d'être construite. C'était, à l'époque, une idée révolutionnaire.",
                "Quelqu'un décida où serait le marché. Tout le monde alla ailleurs. On appela ça une place."
            ],
            "epochTemplate": "La cité tracée sur le papier avant d'exister sur la terre : l'humanité venait d'inventer la fiction utile, le projet, le rêve avec des dimensions.",
            "finalTemplate": "La cité planifiée ne ressembla jamais exactement au plan — et c'est cette différence, comblée par les habitants au fil des années, qui lui donna son caractère."
        },
        "gameplay": {
            "techTree": {"tier": 6, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Organisation urbaine", "description": "Améliore la densité de population et l'efficacité administrative."}
        }
    },
    # ── Époque 3 sous-couche 1 ────────────────────────────────────────────────
    {
        "id": "theatre",
        "isRoot": False,
        "children": ["rhetoric", "great_library", "military_engineering"],
        "majorEvent": "La première tragédie grecque se termina mal pour tout le monde sur scène et provoqua un silence dans le public que l'auteur interpréta comme un succès artistique retentissant. Les spectateurs, encore sous le choc, rentrèrent chez eux en discutant de ce qu'ils venaient de voir — et inventèrent ainsi la critique théâtrale, la philosophie du deuil, et l'habitude de trouver les divertissements instructifs. Ce dernier point reste la contribution la plus discutable de l'Antiquité grecque.",
        "name": "Théâtre antique",
        "period": "ancient_classical",
        "category": "cultural",
        "dateRange": {"min": -500, "max": 200},
        "rarity": "rare",
        "historicalAccuracy": 0.9,
        "description": "Le théâtre grec, né des rituels dionysiaques, inventa un espace public où la société pouvait se regarder elle-même, explorer ses contradictions et traiter ses angoisses collectives.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 4, "economic": 1, "social": 2, "exploration": 0},
        "narrative": {
            "memoryWord": "masque",
            "wordVariants": ["scène", "tragédie", "comédie", "spectacle"],
            "immediate": [
                "Des hommes jouèrent des dieux. Les dieux regardèrent, légèrement offensés mais curieux.",
                "Le masque posé dissimula le visage et révéla autre chose. On appela ça du théâtre."
            ],
            "epochTemplate": "Le masque posé sur le visage révéla davantage que le visage lui-même — paradoxe que l'humanité médite encore, assis dans des amphithéâtres de toutes formes depuis lors.",
            "finalTemplate": "La scène vida — les acteurs partirent, les spectateurs aussi — mais ce qui avait été dit continua de résonner dans les têtes de ceux qui étaient là."
        },
        "gameplay": {
            "techTree": {"tier": 7, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Catharsis collective", "description": "Renforce la cohésion sociale par le partage d'émotions et de récits communs."}
        }
    },
    {
        "id": "olympic_games",
        "isRoot": False,
        "children": ["great_library", "military_engineering", "rhetoric"],
        "majorEvent": "Pour la première fois dans l'histoire connue, deux armées sur le point de se battre acceptèrent de ne pas le faire pendant quatre ans, parce qu'il y avait des courses à pied programmées. La décision d'organiser des compétitions sportives pour suspendre temporairement les guerres fut saluée par les dieux de l'Olympe avec le silence poli de ceux qui avaient prévu tout autre chose. Les athlètes, eux, apprécièrent.",
        "name": "Jeux Olympiques",
        "period": "ancient_classical",
        "category": "social",
        "dateRange": {"min": -776, "max": 394},
        "rarity": "rare",
        "historicalAccuracy": 0.95,
        "description": "Les Jeux Olympiques, célébrés tous les quatre ans depuis 776 av. J.-C., créèrent une trêve panhellénique et une identité commune transcendant les rivalités entre cités.",
        "dependencies": [],
        "effects": {"military": 1, "cultural": 2, "economic": 1, "social": 3, "exploration": 1},
        "narrative": {
            "memoryWord": "victoire",
            "wordVariants": ["couronne", "athlète", "stade", "trêve"],
            "immediate": [
                "Les guerres s'arrêtèrent le temps des jeux. Les dieux regardèrent, déconcertés.",
                "On courut. On lança. On sauta. Et personne ne mourut. Ce fut jugé satisfaisant."
            ],
            "epochTemplate": "La victoire obtenue sans combat fut comptabilisée différemment dans le registre de l'Univers — case prouesse plutôt que violence — et l'entrée fut jugée plus élégante.",
            "finalTemplate": "Les jeux s'arrêtèrent un jour, et pendant mille cinq cents ans, personne ne les remplaça — preuve que certaines idées sont trop bonnes pour être maintenues indéfiniment."
        },
        "gameplay": {
            "techTree": {"tier": 7, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Trêve olympique", "description": "Réduit les conflits entre cités voisines ; favorise l'identité culturelle commune."}
        }
    },
    {
        "id": "senate_debates",
        "isRoot": False,
        "children": ["military_engineering", "rhetoric", "great_library"],
        "majorEvent": "Le premier vrai débat sénatorial romain dura trois jours et aboutit à une décision que tout le monde jugeait médiocre mais acceptable — ce qui est, rétrospectivement, la définition la plus honnête du compromis démocratique. Cicéron, qui n'était pas encore né, aurait été à la fois horrifié par le niveau des discours et secrètement soulagé de voir qu'il y avait de la place pour lui.",
        "name": "Débats du Sénat",
        "period": "ancient_classical",
        "category": "social",
        "dateRange": {"min": -509, "max": 476},
        "rarity": "rare",
        "historicalAccuracy": 0.9,
        "description": "L'institution sénatoriale romaine formalisa le débat politique, créant un cadre procédural pour gouverner collectivement et gérer les désaccords par l'argumentation plutôt que par la force.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 2, "economic": 1, "social": 4, "exploration": 0},
        "narrative": {
            "memoryWord": "délibération",
            "wordVariants": ["sénat", "vote", "tribune", "assemblée"],
            "immediate": [
                "Tout le monde parla. Personne n'écouta vraiment. Une décision fut quand même prise.",
                "Le débat dura. On arriva à un compromis. Personne n'était entièrement satisfait. C'était parfait."
            ],
            "epochTemplate": "La délibération remplaça le décret — et l'Univers nota que l'humanité venait de choisir de prendre plus de temps pour décider de la même chose, ce qui était soit de la sagesse soit de l'indécision, selon la longueur du débat.",
            "finalTemplate": "Le sénat fut dissous — mais l'habitude du débat demeura, se réincarnant sous des noms différents dans des bâtiments différents, avec la même efficacité variable."
        },
        "gameplay": {
            "techTree": {"tier": 7, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Gouvernance collective", "description": "Stabilise les institutions politiques ; réduit les risques de tyrannie."}
        }
    },
    # ── Époque 3 sous-couche 2 ────────────────────────────────────────────────
    {
        "id": "rhetoric",
        "isRoot": False,
        "children": ["monasteries", "alchemy", "guilds"],
        "majorEvent": "Aristote écrivit que la rhétorique est la faculté de voir tous les moyens disponibles de persuasion dans n'importe quel cas donné. Ce qui était une définition technique devint, dans les mains de ses étudiants, une licence quasi illimitée pour dire n'importe quoi avec conviction. L'Univers, qui préférait la vérité à la persuasion mais comprenait que c'était une position minoritaire, ajusta sa comptabilité en conséquence.",
        "name": "Rhétorique",
        "period": "ancient_classical",
        "category": "cultural",
        "dateRange": {"min": -400, "max": 400},
        "rarity": "rare",
        "historicalAccuracy": 0.9,
        "description": "L'art de la persuasion, codifié par Aristote et pratiqué dans les académies grecques et les forums romains, devint l'outil fondamental du pouvoir politique et intellectuel.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 3, "economic": 0, "social": 3, "exploration": 0},
        "narrative": {
            "memoryWord": "parole",
            "wordVariants": ["discours", "persuasion", "argument", "éloquence"],
            "immediate": [
                "Quelqu'un parla bien et convainquit tout le monde. Personne ne sut exactement pourquoi.",
                "L'argument fut formulé. La foule acquiesça. Ce n'est que plus tard qu'on demanda si c'était vrai."
            ],
            "epochTemplate": "La parole fut formalisée — et l'humanité découvrit qu'une bonne forme pouvait parfois compenser un fond défaillant. Cette découverte, consignée dans le registre cosmique sous astuce rhétorique, est restée d'actualité.",
            "finalTemplate": "La rhétorique survécut à tous ses praticiens — et continua de servir, indifféremment, la vérité et son contraire, comme un outil qui ignore la main qui le tient."
        },
        "gameplay": {
            "techTree": {"tier": 8, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Art oratoire", "description": "Améliore la diplomatie, la politique et la transmission du savoir."}
        }
    },
    {
        "id": "great_library",
        "isRoot": False,
        "children": ["alchemy", "guilds", "monasteries"],
        "majorEvent": "La Bibliothèque d'Alexandrie contenait, à son apogée, entre 400 000 et 700 000 rouleaux — les deux chiffres sont des estimations, ce qui est en soi une métaphore sur l'état du savoir humain. Ptolémée fit saisir les livres de tous les navires entrant dans le port pour en faire des copies, puis rendit les copies. Si l'archiviste cosmique jugea l'opération légalement discutable, il dut admettre que le résultat était impressionnant.",
        "name": "Grande Bibliothèque",
        "period": "ancient_classical",
        "category": "cultural",
        "dateRange": {"min": -300, "max": 400},
        "rarity": "legendary",
        "historicalAccuracy": 0.9,
        "description": "La Bibliothèque d'Alexandrie, tentative de rassembler tout le savoir humain en un lieu, incarna l'idéal d'une connaissance universelle et structura le rapport de l'humanité à sa propre mémoire.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 5, "economic": 0, "social": 2, "exploration": 1},
        "narrative": {
            "memoryWord": "savoir",
            "wordVariants": ["rouleau", "bibliothèque", "connaissance", "mémoire"],
            "immediate": [
                "Tout ce qui était su fut rangé en un endroit. On put enfin ne pas le savoir de façon organisée.",
                "Les rouleaux s'accumulèrent. On sut beaucoup de choses. On perdit quand même les clés."
            ],
            "epochTemplate": "Le savoir fut assemblé en un lieu — et pour la première fois, l'humanité eut l'impression d'être à portée de main de tout ce qu'elle savait. Cette impression était inexacte, mais précieuse.",
            "finalTemplate": "La bibliothèque brûla. Mais ce qu'elle avait fait exister — l'idée qu'on pouvait tout savoir — ne brûla pas avec elle, et continua de hanter l'humanité sous des formes toujours plus élaborées."
        },
        "gameplay": {
            "techTree": {"tier": 8, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Savoir universel", "description": "Accélère tous les développements intellectuels et scientifiques futurs."}
        }
    },
    {
        "id": "military_engineering",
        "isRoot": False,
        "children": ["guilds", "monasteries", "alchemy"],
        "majorEvent": "Le premier catapulte fut conçu par un ingénieur qui avait calculé exactement l'angle et la force nécessaires pour lancer un rocher de cinquante kilogrammes à trois cents mètres. Le premier essai atterrit à douze mètres. Le dixième, dans les murs adverses — là où il était prévu. Entre-temps, l'ennemi avait eu le temps de prendre son petit-déjeuner et de renforcer ses défenses, ce qui est une bonne description du cours de l'histoire.",
        "name": "Génie militaire",
        "period": "ancient_classical",
        "category": "military",
        "dateRange": {"min": -400, "max": 500},
        "rarity": "rare",
        "historicalAccuracy": 0.9,
        "description": "L'application de principes d'ingénierie à l'art de la guerre — fortifications, machines de siège, logistique — transforma profondément la nature des conflits armés.",
        "dependencies": [],
        "effects": {"military": 4, "cultural": 0, "economic": 1, "social": 0, "exploration": 1},
        "narrative": {
            "memoryWord": "siège",
            "wordVariants": ["rempart", "catapulte", "fortification", "assaut"],
            "immediate": [
                "Le mur fut construit. Puis la machine capable de le franchir. Puis un mur plus épais.",
                "L'ingénieur calcula. L'ennemi attendit. La pierre fut lancée. Et l'histoire continua."
            ],
            "epochTemplate": "Le siège dura. Et dans sa durée, l'humanité apprit que la patience armée est une arme comme les autres — peut-être la plus coûteuse et la plus efficace.",
            "finalTemplate": "Les fortifications tombèrent toutes, un jour ou l'autre — mais la technique qui les avait construites survécut et s'appliqua à autre chose, comme les techniques ont tendance à le faire."
        },
        "gameplay": {
            "techTree": {"tier": 8, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Fortifications avancées", "description": "Améliore la défense et la conquête ; permet les grandes campagnes militaires."}
        }
    },
]


def main() -> None:
    with DATA_FILE.open(encoding="utf-8") as fh:
        data = json.load(fh)

    # Index existant
    tech_index: dict = {t["id"]: t for t in data["technologies"]}

    # 1. Mettre à jour les children des techs existantes
    updated = 0
    for tech_id, new_children in CHILDREN_UPDATES.items():
        if tech_id in tech_index:
            tech_index[tech_id]["children"] = new_children
            updated += 1
        else:
            print(f"  AVERTISSEMENT : tech {tech_id!r} non trouvée dans l'index")

    print(f"Children mis à jour : {updated} techs")

    # 2. Ajouter les nouvelles technologies (si elles n'existent pas déjà)
    added = 0
    for new_tech in NEW_TECHNOLOGIES:
        if new_tech["id"] not in tech_index:
            tech_index[new_tech["id"]] = new_tech
            added += 1
        else:
            print(f"  SKIP (déjà présente) : {new_tech['id']}")

    print(f"Nouvelles technologies ajoutées : {added}")

    # 3. Reconstruire la liste (roots en premier, puis ordre alphabétique des autres)
    roots = [t for t in tech_index.values() if t.get("isRoot")]
    others = [t for t in tech_index.values() if not t.get("isRoot")]
    data["technologies"] = roots + others

    # 4. Mettre à jour gameConfig
    data["gameConfig"]["turnsPerEpoch"] = 3
    data["gameConfig"]["totalTurns"] = 24
    data["gameConfig"]["narrativeRules"]["styleGuide"] = "Terry Pratchett - bureaucratie cosmique, ironie tendre, personnification des abstractions"

    # 5. Mettre à jour les métadonnées
    data["metadata"]["totalTechnologies"] = len(data["technologies"])

    # 6. Sauvegarder
    with DATA_FILE.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)

    print(f"\nTotal technologies : {len(data['technologies'])}")
    print(f"turnsPerEpoch → {data['gameConfig']['turnsPerEpoch']}")
    print(f"totalTurns    → {data['gameConfig']['totalTurns']}")
    print("Fichier sauvegardé.")


if __name__ == "__main__":
    main()
