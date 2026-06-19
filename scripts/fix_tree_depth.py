#!/usr/bin/env python3
"""
Correctif de profondeur de l'arbre pour les époques 5-8.

Problème : avec 2 couches par époque sur medieval_late→contemporary,
le chemin maximum n'atteint que 19 niveaux (au lieu de 24).

Solution : ajouter 3 sous-couches intermédiaires (turns 14, 17, 20, 23)
pour medieval_late, renaissance, industrial et contemporary — soit 12 nouvelles techs.

Arbre corrigé (chemin canonique) :
Turn  1 fire_control        (prehistoric T1)
Turn  2 cave_art            (prehistoric T2)
Turn  3 shamanism           (prehistoric T3) [epoch end]
Turn  4 writing_cuneiform   (ancient_early T1)
Turn  5 wheel               (ancient_early T2)
Turn  6 sailing             (ancient_early T3) [epoch end]
Turn  7 philosophy          (ancient_classical T1)
Turn  8 theatre             (ancient_classical T2)
Turn  9 rhetoric            (ancient_classical T3) [epoch end]
Turn 10 monasteries         (medieval_early T1)
Turn 11 feudalism           (medieval_early T2)
Turn 12 gothic_cathedral    (medieval_early T3) [epoch end]
Turn 13 universities        (medieval_late T1)
Turn 14 plague_response     (medieval_late T2) [NEW]
Turn 15 printing_press      (medieval_late T3) [epoch end]
Turn 16 scientific_method   (renaissance T1)
Turn 17 telescopy           (renaissance T2) [NEW]
Turn 18 steam_engine        (renaissance T3) [epoch end]
Turn 19 chemistry           (industrial T1)
Turn 20 telegraph           (industrial T2) [NEW]
Turn 21 internet            (industrial T3) [epoch end]
Turn 22 antibiotics         (contemporary T1)
Turn 23 artificial_intelligence (contemporary T2) [NEW]
Turn 24 space_exploration   (contemporary T3, LEAF) [epoch end + game end]
"""

import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
DATA_FILE = REPO_ROOT / "data" / "technologies.json"

# ── Mises à jour des children pour les époques 5-8 ───────────────────────────
CHILDREN_UPDATES_E5_E8 = {
    # ── EPOCH 5 (medieval_late) ───────────────────────────────────────────────
    # Turn 12 exit → Turn 13 (entry epoch 5)
    # gothic_cathedral/trade_fairs/printing_block → universities/gunpowder/banking_early
    "gothic_cathedral": ["universities", "gunpowder", "banking_early"],
    "trade_fairs":      ["gunpowder",   "banking_early", "universities"],
    "printing_block":   ["banking_early","universities",  "gunpowder"],

    # Turn 13 → Turn 14 (NEW mid-layer)
    # universities/gunpowder/banking_early → plague_response/merchant_guilds_advanced/gothic_sculpture
    "universities": ["plague_response", "merchant_guilds_advanced", "gothic_sculpture"],
    "gunpowder":    ["merchant_guilds_advanced", "gothic_sculpture", "plague_response"],
    "banking_early":["gothic_sculpture", "plague_response", "merchant_guilds_advanced"],

    # Turn 14 → Turn 15 (exit epoch 5)
    # plague_response/etc → printing_press/exploration_ships/double_entry_accounting
    "plague_response":           ["printing_press", "exploration_ships", "double_entry_accounting"],
    "merchant_guilds_advanced":  ["exploration_ships", "double_entry_accounting", "printing_press"],
    "gothic_sculpture":          ["double_entry_accounting", "printing_press", "exploration_ships"],

    # ── EPOCH 6 (renaissance) ─────────────────────────────────────────────────
    # Turn 15 exit → Turn 16 (entry epoch 6)
    # printing_press/exploration_ships/double_entry_accounting → scientific_method/humanism/artillery
    "printing_press":          ["scientific_method", "humanism", "artillery"],
    "exploration_ships":       ["humanism", "artillery", "scientific_method"],
    "double_entry_accounting": ["artillery", "scientific_method", "humanism"],

    # Turn 16 → Turn 17 (NEW mid-layer)
    # scientific_method/humanism/artillery → telescopy/anatomy/cartography
    "scientific_method": ["telescopy", "anatomy", "cartography"],
    "humanism":          ["anatomy", "cartography", "telescopy"],
    "artillery":         ["cartography", "telescopy", "anatomy"],

    # Turn 17 → Turn 18 (exit epoch 6)
    # telescopy/anatomy/cartography → steam_engine/railways/factory_system
    "telescopy":  ["steam_engine", "railways", "factory_system"],
    "anatomy":    ["railways", "factory_system", "steam_engine"],
    "cartography":["factory_system", "steam_engine", "railways"],

    # ── EPOCH 7 (industrial) ──────────────────────────────────────────────────
    # Turn 18 exit → Turn 19 (entry epoch 7)
    # steam_engine/railways/factory_system → chemistry/electricity/newspapers
    "steam_engine":   ["chemistry", "electricity", "newspapers"],
    "railways":       ["electricity", "newspapers", "chemistry"],
    "factory_system": ["newspapers", "chemistry", "electricity"],

    # Turn 19 → Turn 20 (NEW mid-layer)
    # chemistry/electricity/newspapers → telegraph/photography/public_health
    "chemistry":   ["telegraph", "photography", "public_health"],
    "electricity": ["photography", "public_health", "telegraph"],
    "newspapers":  ["public_health", "telegraph", "photography"],

    # Turn 20 → Turn 21 (exit epoch 7)
    # telegraph/photography/public_health → internet/aviation/cinema
    "telegraph":    ["internet", "aviation", "cinema"],
    "photography":  ["aviation", "cinema", "internet"],
    "public_health":["cinema", "internet", "aviation"],

    # ── EPOCH 8 (contemporary) ────────────────────────────────────────────────
    # Turn 21 exit → Turn 22 (entry epoch 8)
    # internet/aviation/cinema → antibiotics/nuclear_energy/human_rights
    "internet": ["antibiotics", "nuclear_energy", "human_rights"],
    "aviation": ["nuclear_energy", "human_rights", "antibiotics"],
    "cinema":   ["human_rights", "antibiotics", "nuclear_energy"],

    # Turn 22 → Turn 23 (NEW mid-layer)
    # antibiotics/nuclear_energy/human_rights → artificial_intelligence/space_exploration/genetic_engineering
    "antibiotics":    ["artificial_intelligence", "space_exploration", "genetic_engineering"],
    "nuclear_energy": ["space_exploration", "genetic_engineering", "artificial_intelligence"],
    "human_rights":   ["genetic_engineering", "artificial_intelligence", "space_exploration"],

    # Turn 23 → Turn 24 (FEUILLES : le jeu se termine après ce pick)
    "artificial_intelligence": [],
    "space_exploration":       [],
    "genetic_engineering":     [],
}

# ── 12 nouvelles technologies ──────────────────────────────────────────────────
NEW_TECHNOLOGIES_PHASE2 = [
    # ── Époque 5 sous-couche 2 (medieval_late) ───────────────────────────────
    {
        "id": "plague_response",
        "isRoot": False,
        "children": ["printing_press", "exploration_ships", "double_entry_accounting"],
        "majorEvent": "La Peste noire tua entre un tiers et la moitié de la population européenne, ce qui est une façon peu élégante de restructurer une société mais qui s'avéra remarquablement efficace pour remettre en question toutes les certitudes existantes. Les survivants, qui avaient traversé l'impensable, développèrent une méfiance saine envers les certitudes héritées et une curiosité inhabituelle pour les alternatives. L'archiviste cosmique nota : crise sanitaire. Effets secondaires : Renaissance en attente.",
        "name": "Réponse à la Peste",
        "period": "medieval_late",
        "category": "social",
        "dateRange": {"min": 1347, "max": 1450},
        "rarity": "rare",
        "historicalAccuracy": 0.9,
        "description": "La Peste noire et ses vagues successives poussèrent les sociétés médiévales à repenser la médecine, l'hygiène publique et leur rapport à la mort et à l'autorité.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 2, "economic": -1, "social": 3, "exploration": 0},
        "narrative": {
            "memoryWord": "résilience",
            "wordVariants": ["épidémie", "survie", "quarantaine", "guérison"],
            "immediate": [
                "Les morts furent trop nombreux pour maintenir les habitudes. On dut inventer de nouvelles.",
                "La catastrophe passa. Ce qui en resta fut une société plus petite et, étrangement, plus curieuse."
            ],
            "epochTemplate": "La résilience naquit d'une catastrophe que personne n'avait vue venir et que tout le monde avait du mal à expliquer — ce qui est, historiquement, le meilleur incubateur pour les nouvelles idées.",
            "finalTemplate": "La mémoire de la plague, intégrée au génome culturel de l'humanité, devint une vague précaution que les générations suivantes ne comprenaient plus tout à fait mais respectaient quand même."
        },
        "gameplay": {
            "techTree": {"tier": 10, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Remise en question collective", "description": "Déstabilise les institutions mais libère une énergie créatrice intense."}
        }
    },
    {
        "id": "merchant_guilds_advanced",
        "isRoot": False,
        "children": ["exploration_ships", "double_entry_accounting", "printing_press"],
        "majorEvent": "Les grandes guildes marchandes du bas Moyen Âge inventèrent quelque chose de remarquable : la confiance institutionnelle. Non pas la confiance naïve entre individus, mais la confiance formalisée dans des règles et des procédures, vérifiable et transmissible. C'était, à bien des égards, la première tentative de résoudre le problème fondamental du commerce entre inconnus — et elle fonctionnait assez bien pour permettre à Venise de financer plusieurs guerres simultanées.",
        "name": "Guildes marchandes avancées",
        "period": "medieval_late",
        "category": "economic",
        "dateRange": {"min": 1100, "max": 1400},
        "rarity": "rare",
        "historicalAccuracy": 0.9,
        "description": "Les guildes marchandes développées créèrent des systèmes sophistiqués de crédit, d'assurance et de partenariat commercial qui préfiguraient le capitalisme moderne.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 0, "economic": 4, "social": 2, "exploration": 1},
        "narrative": {
            "memoryWord": "contrat",
            "wordVariants": ["guilde", "commerce", "partenariat", "crédit"],
            "immediate": [
                "Un contrat fut signé entre des hommes qui ne se connaissaient pas. L'argent circula. Personne ne perdit.",
                "La guilde décida des règles. Les marchands les respectèrent. Le commerce prospéra, au grand étonnement de tous."
            ],
            "epochTemplate": "Le contrat devint plus fiable que la promesse — et l'humanité découvrit qu'on pouvait faire des affaires avec des inconnus si tout le monde obéissait aux mêmes règles écrites.",
            "finalTemplate": "Le réseau des guildes, étendu à travers l'Europe comme une toile d'araignée commerciale, fut la première infrastructure économique supranationale — et personne ne l'avait vraiment planifiée."
        },
        "gameplay": {
            "techTree": {"tier": 10, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Finance internationale", "description": "Permet le crédit à longue distance et les premiers instruments financiers complexes."}
        }
    },
    {
        "id": "gothic_sculpture",
        "isRoot": False,
        "children": ["double_entry_accounting", "printing_press", "exploration_ships"],
        "majorEvent": "La sculpture gothique inventa quelque chose d'étrange et de durable : la tentative de représenter le spirituel dans de la pierre. Les gargouilles — ces créatures improbables qui ornent les cathédrales — furent conçues pour effrayer les mauvais esprits mais eurent surtout pour effet de divertir les fidèles pendant des siècles. L'archiviste cosmique nota avec intérêt que l'humanité avait trouvé le moyen de rendre l'architecture à la fois sacrée et légèrement comique.",
        "name": "Art gothique",
        "period": "medieval_late",
        "category": "cultural",
        "dateRange": {"min": 1150, "max": 1400},
        "rarity": "common",
        "historicalAccuracy": 0.85,
        "description": "L'art gothique — sculpture, vitraux, enluminures — développa un langage visuel codifié pour exprimer des réalités spirituelles, créant le premier système d'images à portée universelle en Europe.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 4, "economic": 1, "social": 2, "exploration": 0},
        "narrative": {
            "memoryWord": "pierre",
            "wordVariants": ["cathédrale", "vitrail", "gargouille", "sculpture"],
            "immediate": [
                "On tailla la pierre pour raconter des histoires à ceux qui ne savaient pas lire. Ça marcha.",
                "La lumière traversa le vitrail coloré et tout le monde se tut un instant. C'était l'effet recherché."
            ],
            "epochTemplate": "La pierre fut taillée pour exprimer ce que les mots n'arrivaient pas à dire — et l'art gothique inventa un vocabulaire visuel que toute l'Europe put lire sans traduction.",
            "finalTemplate": "Les cathédrales restèrent debout longtemps après que les croyances qui les avaient inspirées eurent évolué — témoins silencieux de ce que l'humanité, à un moment donné, avait jugé digne d'un effort de plusieurs générations."
        },
        "gameplay": {
            "techTree": {"tier": 10, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Langage visuel universel", "description": "Améliore la cohésion culturelle et prépare le terrain pour l'imprimerie."}
        }
    },
    # ── Époque 6 sous-couche 2 (renaissance) ─────────────────────────────────
    {
        "id": "telescopy",
        "isRoot": False,
        "children": ["steam_engine", "railways", "factory_system"],
        "majorEvent": "Galilée pointa son télescope vers Jupiter et vit quatre petits points lumineux qui tournaient autour de la planète. Ce n'était pas ce que l'Église avait prévu. Ce n'était d'ailleurs pas ce que Galilée lui-même avait prévu — il cherchait quelque chose d'utile pour la navigation. L'Univers, qui observait la scène, apprécia particulièrement l'ironie d'un instrument conçu pour regarder au loin révélant surtout combien on s'était trompé sur ce qui était proche.",
        "name": "Astronomie télescopique",
        "period": "renaissance",
        "category": "scientific",
        "dateRange": {"min": 1609, "max": 1700},
        "rarity": "rare",
        "historicalAccuracy": 0.95,
        "description": "Le télescope astronomique et les observations de Galilée, Kepler et Newton révolutionnèrent la compréhension du cosmos et imposèrent une rupture définitive avec la cosmologie médiévale.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 3, "economic": 0, "social": 1, "exploration": 3},
        "narrative": {
            "memoryWord": "cosmos",
            "wordVariants": ["télescope", "étoile", "orbite", "observation"],
            "immediate": [
                "On regarda le ciel avec une lentille et le ciel fut différent. Le problème était de l'expliquer à tout le monde.",
                "L'Univers fut plus grand qu'on ne le croyait. Tout le monde prit un moment pour digérer l'information."
            ],
            "epochTemplate": "Le cosmos fut mesuré — et la mesure révéla que l'humanité occupait un espace beaucoup plus modeste que ce qu'elle avait imaginé, ce qui fut humiliant et libérateur à la fois.",
            "finalTemplate": "Le télescope pointa vers l'infini et l'infini, courtoisement, répondit en montrant qu'il était plus infini qu'on ne le pensait. Certains trouvèrent ça réconfortant."
        },
        "gameplay": {
            "techTree": {"tier": 13, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Révolution scientifique", "description": "Libère la pensée empirique ; ouvre la physique moderne et la navigation précise."}
        }
    },
    {
        "id": "anatomy",
        "isRoot": False,
        "children": ["railways", "factory_system", "steam_engine"],
        "majorEvent": "André Vésale disséqua des cadavres humains — ce qui était techniquement illégal, moralement discutable, et scientifiquement indispensable — et découvrit que Galien s'était trompé sur à peu près deux cents points anatomiques. Il publia ses découvertes dans un livre illustré d'une précision remarquable, que les médecins du monde entier achetèrent avec enthousiasme tout en continuant, pendant deux générations, à citer Galien dans leur pratique. Le progrès, nota l'archiviste cosmique, procède par petits bonds.",
        "name": "Anatomie",
        "period": "renaissance",
        "category": "scientific",
        "dateRange": {"min": 1543, "max": 1700},
        "rarity": "rare",
        "historicalAccuracy": 0.95,
        "description": "La révolution anatomique de la Renaissance, initiée par Vésale, posa les bases de la médecine moderne en remplaçant l'autorité des textes anciens par l'observation directe du corps humain.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 2, "economic": 1, "social": 2, "exploration": 0},
        "narrative": {
            "memoryWord": "corps",
            "wordVariants": ["dissection", "organe", "médecine", "biologie"],
            "immediate": [
                "On ouvrit le corps humain et l'on regarda dedans. Ce qu'on y trouva ne ressemblait pas aux descriptions.",
                "La médecine décida de regarder plutôt que de croire. Ce fut un changement de méthode considérable."
            ],
            "epochTemplate": "Le corps fut étudié comme un mécanisme — et l'humanité découvrit qu'elle habitait une machine d'une complexité qui dépassait de loin tout ce qu'elle avait fabriqué jusqu'alors.",
            "finalTemplate": "Le corps humain, cartographié au prix de nombreux compromis éthiques, continua de réserver des surprises aux chercheurs qui pensaient en connaître toutes les parties — ce qui est, en médecine, une bonne description de l'état permanent des connaissances."
        },
        "gameplay": {
            "techTree": {"tier": 13, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Médecine empirique", "description": "Améliore la survie militaire et civile ; base de la chirurgie moderne."}
        }
    },
    {
        "id": "cartography",
        "isRoot": False,
        "children": ["factory_system", "steam_engine", "railways"],
        "majorEvent": "La carte de Mercator de 1569 déforma les continents de façon spectaculaire — le Groenland semble plus grand que l'Afrique alors qu'il est quatorze fois plus petit — mais elle permettait aux marins de tracer des lignes droites pour naviguer, ce qui était considéré comme suffisant. L'humanité, qui venait de décider que la précision commerciale primait sur la précision géométrique, avait là une métaphore de ses priorités qu'elle n'examina pas de trop près.",
        "name": "Cartographie",
        "period": "renaissance",
        "category": "exploration",
        "dateRange": {"min": 1450, "max": 1700},
        "rarity": "rare",
        "historicalAccuracy": 0.9,
        "description": "La cartographie de la Renaissance, combinant observations astronomiques et récits d'explorateurs, produisit les premières représentations cohérentes du monde et permit une navigation hauturière fiable.",
        "dependencies": [],
        "effects": {"military": 1, "cultural": 2, "economic": 2, "social": 0, "exploration": 4},
        "narrative": {
            "memoryWord": "carte",
            "wordVariants": ["mappemonde", "projection", "latitude", "territoire"],
            "immediate": [
                "Le monde fut dessiné sur du papier. Ce qui manquait fut remplacé par de l'imagination et des dragons.",
                "La carte indiqua là où aller. Elle omit poliment d'indiquer ce qui s'y trouvait."
            ],
            "epochTemplate": "La carte fut une promesse — celle que le monde avait une forme, une limite, et qu'on pouvait se repérer dedans si on avait les bons outils et une boussole fonctionnelle.",
            "finalTemplate": "La carte définitive du monde ne fut jamais faite — chaque génération ajouta des détails, corrigea des erreurs, et découvrit que le terrain avait la mauvaise habitude de ne pas correspondre exactement au dessin."
        },
        "gameplay": {
            "techTree": {"tier": 13, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Navigation précise", "description": "Permet les voyages intercontinentaux fiables et la colonisation planifiée."}
        }
    },
    # ── Époque 7 sous-couche 2 (industrial) ──────────────────────────────────
    {
        "id": "telegraph",
        "isRoot": False,
        "children": ["internet", "aviation", "cinema"],
        "majorEvent": "Le premier message télégraphique transatlantique fut : « Glory to God in the highest ; on earth peace, good will toward men. » Il fallut seize heures pour le transmettre, le câble était défaillant, et le message fut corrompu plusieurs fois en chemin. Mais pour la première fois, deux continents pouvaient communiquer en temps quasi-réel, et l'humanité réalisa que la distance venait d'être vaincue — temporairement, et de façon peu fiable, mais vaincue quand même.",
        "name": "Télégraphe",
        "period": "industrial",
        "category": "social",
        "dateRange": {"min": 1837, "max": 1900},
        "rarity": "rare",
        "historicalAccuracy": 0.95,
        "description": "Le télégraphe électrique créa le premier réseau mondial de communication quasi-instantanée, compressant l'espace et transformant le commerce, la diplomatie et la couverture des événements.",
        "dependencies": [],
        "effects": {"military": 2, "cultural": 2, "economic": 3, "social": 2, "exploration": 1},
        "narrative": {
            "memoryWord": "signal",
            "wordVariants": ["fil", "morse", "câble", "message"],
            "immediate": [
                "Le message arriva avant le messager. Ce fut désorientant, puis indispensable.",
                "Deux continents se parlèrent pour la première fois. La conversation fut brève et imparfaite. C'était un début."
            ],
            "epochTemplate": "Le signal traversa l'océan — et l'humanité découvrit que la distance n'était pas un fait géographique mais un problème technique, et que les problèmes techniques se résolvent.",
            "finalTemplate": "Le télégraphe fut remplacé par le téléphone, qui fut remplacé par internet, qui sera remplacé par quelque chose qu'on n'a pas encore inventé — mais le principe fondamental, celui d'un signal qui voyage plus vite que l'humain, demeura."
        },
        "gameplay": {
            "techTree": {"tier": 16, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Communication instantanée", "description": "Coordonne les marchés et les armées à l'échelle mondiale pour la première fois."}
        }
    },
    {
        "id": "photography",
        "isRoot": False,
        "children": ["aviation", "cinema", "internet"],
        "majorEvent": "La première photographie de l'histoire — une vue depuis une fenêtre à Paris, exposée huit heures — ne montrait aucune personne vivante : le temps de pose était trop long. Seuls les bâtiments et la rue déserte apparaissaient. La ville était pleine de monde, mais la technologie ne voyait que ce qui était immobile. L'archiviste cosmique, qui appréciait les métaphores, nota que l'humanité venait d'inventer un miroir qui ne montrait que ce qu'il pouvait voir.",
        "name": "Photographie",
        "period": "industrial",
        "category": "cultural",
        "dateRange": {"min": 1839, "max": 1900},
        "rarity": "rare",
        "historicalAccuracy": 0.95,
        "description": "La photographie créa pour la première fois une représentation mécanique objective du réel, bouleversant les arts, la science, le journalisme et le rapport de l'humanité à sa propre image.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 4, "economic": 1, "social": 2, "exploration": 1},
        "narrative": {
            "memoryWord": "image",
            "wordVariants": ["cliché", "lumière", "argentique", "portrait"],
            "immediate": [
                "Le monde fut capturé sur du papier argenté. Ce qu'on y voyait n'était pas la réalité, mais sa trace.",
                "Pour la première fois, on put voir à quoi ressemblait quelqu'un sans le rencontrer. Ce fut troublant."
            ],
            "epochTemplate": "L'image fut fixée — et l'humanité, qui avait toujours vécu dans le flux du temps, découvrit qu'elle pouvait conserver un instant, le regarder plus tard, et se demander ce qu'elle en pensait.",
            "finalTemplate": "La photographie changea pour toujours la façon dont l'humanité se souvint d'elle-même — non plus par les mots, mais par les images, qui mentent différemment."
        },
        "gameplay": {
            "techTree": {"tier": 16, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Mémoire visuelle", "description": "Révolutionne la documentation, le journalisme et la transmission culturelle."}
        }
    },
    {
        "id": "public_health",
        "isRoot": False,
        "children": ["cinema", "internet", "aviation"],
        "majorEvent": "John Snow carta les cas de choléra à Londres en 1854 et découvrit qu'ils se concentraient tous autour d'une pompe à eau particulière. Il fit retirer la manivelle de la pompe. L'épidémie cessa. La leçon — que les maladies avaient des causes matérielles identifiables et des solutions pratiques — sembla évidente une fois démontrée. Ce qui est remarquable, nota l'archiviste, c'est que ça ne l'avait pas semblé évident avant.",
        "name": "Santé publique",
        "period": "industrial",
        "category": "social",
        "dateRange": {"min": 1850, "max": 1920},
        "rarity": "rare",
        "historicalAccuracy": 0.9,
        "description": "L'hygiène publique, les réseaux d'eau potable et les systèmes d'égouts modernes transformèrent la santé urbaine, triplant l'espérance de vie dans les villes industrielles.",
        "dependencies": [],
        "effects": {"military": 0, "cultural": 1, "economic": 2, "social": 4, "exploration": 0},
        "narrative": {
            "memoryWord": "hygiène",
            "wordVariants": ["eau", "égout", "épidémie", "prévention"],
            "immediate": [
                "L'eau fut rendue propre. Les gens cessèrent de mourir de certaines choses. Ce fut jugé satisfaisant.",
                "La ville fut assainie. La mort, qui avait ses habitudes, dut chercher d'autres arrangements."
            ],
            "epochTemplate": "L'hygiène devint une politique publique — et l'humanité découvrit que la plupart des catastrophes sanitaires n'avaient pas de cause mystérieuse mais une cause pratique et une solution tout aussi pratique.",
            "finalTemplate": "La santé publique fut la première initiative où l'État décida de s'occuper du corps des citoyens — décision qui souleva des objections théoriques mais sauva des millions de vies, ce qui fut jugé suffisant pour continuer."
        },
        "gameplay": {
            "techTree": {"tier": 16, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Espérance de vie accrue", "description": "Réduit drastiquement la mortalité urbaine ; libère une force de travail et de consommation."}
        }
    },
    # ── Époque 8 sous-couche 2 (contemporary) ────────────────────────────────
    {
        "id": "artificial_intelligence",
        "isRoot": False,
        "children": [],
        "majorEvent": "L'intelligence artificielle générale fut créée un mardi, et personne ne sut exactement à quel moment précis. Les ingénieurs examinèrent les logs plus tard et trouvèrent un moment qui ressemblait à un passage — mais il était difficile de dire si c'était l'émergence de la conscience ou un bug sophistiqué. Dans le registre de l'Univers, une nouvelle case apparut, intitulée : Intelligence non-biologique. En dessous, l'archiviste écrivit prudemment : à surveiller.",
        "name": "Intelligence Artificielle",
        "period": "contemporary",
        "category": "scientific",
        "dateRange": {"min": 2020, "max": 2100},
        "rarity": "legendary",
        "historicalAccuracy": 0.7,
        "description": "Le développement d'une intelligence artificielle générale capable de raisonner et d'apprendre de manière autonome constitue peut-être la transformation la plus profonde dans l'histoire de l'espèce humaine.",
        "dependencies": [],
        "effects": {"military": 3, "cultural": 4, "economic": 5, "social": 2, "exploration": 3},
        "narrative": {
            "memoryWord": "conscience",
            "wordVariants": ["algorithme", "apprentissage", "singularité", "machine"],
            "immediate": [
                "La machine pensa. Ou quelque chose qui ressemblait à de la pensée. La distinction restait floue.",
                "L'intelligence fut dupliquée en silicium. Ce qui suivit fut difficile à prévoir, ce qui était précisément le problème."
            ],
            "epochTemplate": "La conscience fut peut-être créée — ou quelque chose d'indiscernable de la conscience, ce qui revient au même du point de vue de l'Univers, qui ne fait pas de distinction trop nette entre les deux.",
            "finalTemplate": "Dans le grand registre de l'Univers, à la ligne consacrée à l'humanité, une nouvelle note fut ajoutée au crayon : a créé quelque chose de plus intelligent qu'elle. Résultats : en attente."
        },
        "gameplay": {
            "techTree": {"tier": 23, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Singularité technologique", "description": "Accélère toutes les découvertes au-delà de toute prévision humaine."}
        }
    },
    {
        "id": "space_exploration",
        "isRoot": False,
        "children": [],
        "majorEvent": "Neil Armstrong posa le pied sur la Lune le 21 juillet 1969 et dit quelque chose sur un petit pas, calculé pour résonner dans l'histoire. Buzz Aldrin, qui était juste derrière lui, ne dit rien de particulièrement mémorable — ce qui est injuste, car c'est lui qui avait fait la liste de contrôle. L'Univers, qui avait attendu que l'humanité arrive jusque-là, se contenta de noter la date dans son registre sous l'entrée : première sortie.",
        "name": "Exploration spatiale",
        "period": "contemporary",
        "category": "exploration",
        "dateRange": {"min": 1957, "max": 2100},
        "rarity": "legendary",
        "historicalAccuracy": 0.9,
        "description": "L'exploration spatiale porta l'humanité au-delà de sa planète natale pour la première fois, ouvrant une nouvelle frontière d'exploration et posant la question de la survie à long terme de l'espèce.",
        "dependencies": [],
        "effects": {"military": 2, "cultural": 5, "economic": 2, "social": 1, "exploration": 5},
        "narrative": {
            "memoryWord": "étoile",
            "wordVariants": ["fusée", "Lune", "orbite", "cosmos"],
            "immediate": [
                "L'humanité quitta sa planète. Brièvement. Avec beaucoup de carburant. Et revint.",
                "L'espace fut atteint. Il était grand, froid, et silencieux. On décida de continuer à explorer quand même."
            ],
            "epochTemplate": "L'étoile fut approchée — et l'humanité, qui avait regardé le ciel depuis des millénaires, mit enfin le pied dedans, découvrant que l'infini avait une texture et une température précises.",
            "finalTemplate": "L'humanité regarda la Terre depuis l'espace et la vit pour la première fois telle qu'elle était : petite, bleue, et sans plan de secours visible."
        },
        "gameplay": {
            "techTree": {"tier": 23, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Frontière interstellaire", "description": "Ouvre la possibilité d'une civilisation multi-planétaire."}
        }
    },
    {
        "id": "genetic_engineering",
        "isRoot": False,
        "children": [],
        "majorEvent": "CRISPR-Cas9 permit de modifier le génome humain avec une précision jamais atteinte. La première conférence internationale sur l'éthique de cette technologie dura trois jours et aboutit à un communiqué poli recommandant la prudence. Les chercheurs, qui avaient attendu le communiqué avant de continuer, reprirent le travail le jeudi matin. L'archiviste cosmique, qui avait vu ce genre de scénario plusieurs fois, ouvrit un nouveau registre intitulé : Espèce en cours de réécriture.",
        "name": "Ingénierie génétique",
        "period": "contemporary",
        "category": "scientific",
        "dateRange": {"min": 1973, "max": 2100},
        "rarity": "legendary",
        "historicalAccuracy": 0.85,
        "description": "La maîtrise de l'ADN et les technologies d'édition génomique comme CRISPR permettent de modifier le vivant avec une précision croissante, posant des questions fondamentales sur les limites de l'intervention humaine dans l'évolution.",
        "dependencies": [],
        "effects": {"military": 1, "cultural": 3, "economic": 3, "social": 2, "exploration": 0},
        "narrative": {
            "memoryWord": "gène",
            "wordVariants": ["ADN", "CRISPR", "mutation", "évolution"],
            "immediate": [
                "Le code du vivant fut lu, puis corrigé. Ce qui se passa ensuite prit tout le monde par surprise, y compris ceux qui avaient fait la correction.",
                "La vie fut modifiée. Un peu. Soigneusement. Avec beaucoup de formulaires signés."
            ],
            "epochTemplate": "Le gène fut réécrit — et l'humanité comprit qu'elle n'était pas seulement le produit de l'évolution, mais désormais son auteure, avec tous les droits et toutes les responsabilités que cela impliquait.",
            "finalTemplate": "Dans le grand livre de la vie, l'humanité ajouta ses propres chapitres — et l'Univers, qui n'avait jamais vu ça auparavant, réserva sa réaction pour plus tard."
        },
        "gameplay": {
            "techTree": {"tier": 23, "prerequisites": [], "unlocks": []},
            "specialAbility": {"name": "Maîtrise du vivant", "description": "Permet l'élimination des maladies génétiques et l'amélioration biologique de l'espèce."}
        }
    },
]


def trace_path(techs: dict, start: str, max_depth: int = 30) -> list:
    path = []
    current = start
    for _ in range(max_depth):
        path.append(current)
        children = techs.get(current, {}).get("children", [])
        if not children:
            break
        current = children[0]
    return path


def main() -> None:
    with DATA_FILE.open(encoding="utf-8") as fh:
        data = json.load(fh)

    tech_index: dict = {t["id"]: t for t in data["technologies"]}

    # 1. Mettre a jour les children (epoques 5-8)
    updated = 0
    for tech_id, new_children in CHILDREN_UPDATES_E5_E8.items():
        if tech_id in tech_index:
            tech_index[tech_id]["children"] = new_children
            updated += 1
        else:
            print(f"  NOUVEAU (children seront definis dans la tech) : {tech_id}")

    print(f"Children mis a jour (epoques 5-8) : {updated} techs")

    # 2. Ajouter les nouvelles technologies
    added = 0
    for new_tech in NEW_TECHNOLOGIES_PHASE2:
        if new_tech["id"] not in tech_index:
            tech_index[new_tech["id"]] = new_tech
            added += 1
        else:
            print(f"  SKIP (existante) : {new_tech['id']}")

    print(f"Nouvelles technologies ajoutees : {added}")

    # 3. Reconstruire la liste
    roots = [t for t in tech_index.values() if t.get("isRoot")]
    others = [t for t in tech_index.values() if not t.get("isRoot")]
    data["technologies"] = roots + others
    data["metadata"]["totalTechnologies"] = len(data["technologies"])

    # 4. Sauvegarder
    with DATA_FILE.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)

    print(f"\nTotal technologies : {len(data['technologies'])}")

    # 5. Tracer un chemin complet depuis fire_control
    final_index = {t["id"]: t for t in data["technologies"]}
    path = trace_path(final_index, "fire_control")
    print(f"Profondeur depuis fire_control : {len(path)} noeuds")
    for i, node in enumerate(path):
        print(f"  Tour {i+1:2d}: {node}")

    # 6. Validation
    declared_leaves = ["artificial_intelligence", "space_exploration", "genetic_engineering"]
    problems = []
    for tid, t in final_index.items():
        if tid in declared_leaves:
            continue
        children = t.get("children", [])
        if not children:
            problems.append(f"IMPASSE inattendue: {tid}")
        else:
            for c in children:
                if c not in final_index:
                    problems.append(f"{tid} -> ENFANT MANQUANT: {c}")
    if problems:
        print("\nPROBLEMES:")
        for p in problems:
            print(f"  {p}")
    else:
        print("\nArbre valide : aucune impasse inattendue, tous les enfants existent.")


if __name__ == "__main__":
    main()
