# Exemples de Technologies par Époque

## 🎯 Guide de Référence pour l'Écriture

Ce document présente des exemples concrets de technologies pour chaque époque, avec leur style narratif complet dans le ton **"Borges facétieux"** de **Human Memories**.

---

## 🦴 **PRÉHISTOIRE** (-500 000 → -3 000)
*Couleur thématique : #8B4513 (Brun terre)*

### **Domestication des Animaux**
```json
{
  "id": "animal_domestication",
  "name": "Domestication des animaux", 
  "category": "economic",
  "rarity": "common",
  "memoryWord": "alliance",
  
  "immediate": [
    "L'alliance se noue entre l'homme et la bête dans vos souvenirs.",
    "Quelqu'un convainquit les loups qu'ils préféraient les os aux batailles.",
    "Dans votre mémoire naît le premier contrat social inter-espèces."
  ],
  
  "epochTemplate": "Cette ère primitive scella les premières {memoryWord} durables. Les animaux cessèrent d'être uniquement des proies ou des prédateurs : ils devinrent des partenaires, échangeant leur liberté sauvage contre la sécurité du foyer.",
  
  "effects": { "military": 1, "economic": 3, "social": 2 }
}
```

### **Poterie**  
```json
{
  "id": "pottery",
  "name": "Poterie",
  "category": "cultural", 
  "rarity": "uncommon",
  "memoryWord": "argile",
  "prerequisites": ["fire_control"],
  
  "immediate": [
    "L'argile accepta de prendre des formes que la nature n'avait pas prévues.",
    "Dans vos mémoires se façonne le premier compromis entre l'eau et la terre.",
    "Quelqu'un eut l'idée de donner une seconde vie à la boue."
  ],
  
  "epochTemplate": "Vos choix transformèrent l'{memoryWord} en premier laboratoire de la forme. Les humains découvrirent qu'ils pouvaient façonner le monde à leur image, un pot à la fois."
}
```

---

## 🏛️ **ANTIQUITÉ ANCIENNE** (-3 000 → -500)
*Couleur thématique : #DAA520 (Or antique)*

### **La Roue**
```json
{
  "id": "wheel", 
  "name": "La Roue",
  "category": "exploration",
  "rarity": "pillar",
  "memoryWord": "cercle",
  
  "immediate": [
    "Le cercle parfait trouva enfin une utilité pratique dans vos souvenirs.",
    "Quelqu'un découvrit que la géométrie pouvait porter des charges.",
    "La roue accepta de révolutionner le transport, littéralement."
  ],
  
  "epochTemplate": "Cette époque vit naître le {memoryWord} qui changerait tout. La roue enseigna à l'humanité que parfois, la solution la plus simple est aussi la plus géniale.",
  
  "effects": { "economic": 3, "exploration": 2, "military": 1 }
}
```

### **Navigation à Voile**
```json
{
  "id": "sailing",
  "name": "Navigation à voile", 
  "category": "exploration",
  "rarity": "common",
  "memoryWord": "vent",
  
  "immediate": [
    "Le vent accepta de devenir le premier moteur de l'humanité.",
    "Dans vos mémoires se gonfle la première voile de l'aventure.",
    "Quelqu'un eut la brillante idée de faire travailler les brises."
  ],
  
  "epochTemplate": "Vos choix captèrent le {memoryWord} dans des voiles de toile. Les mers cessèrent d'être des barrières : elles devinrent des autoroutes liquides, imprévisibles mais praticables."
}
```

---

## ⚔️ **ANTIQUITÉ CLASSIQUE** (-500 → 500)
*Couleur thématique : #CD853F (Bronze doré)*

### **Philosophie Rationnelle**
```json
{
  "id": "philosophy_rational",
  "name": "Philosophie rationnelle",
  "category": "cultural", 
  "rarity": "uncommon",
  "memoryWord": "question",
  
  "immediate": [
    "La question devint plus importante que la réponse dans vos souvenirs.",
    "Quelqu'un eut l'idée révolutionnaire de douter de tout, y compris de lui-même.",
    "Dans votre mémoire naît l'art dangereux de penser avec méthode."
  ],
  
  "epochTemplate": "Cette époque classique éleva la {memoryWord} au rang d'art suprême. Les sages apprirent à leurs disciples que la véritable sagesse commençait par : 'Je ne sais qu'une chose : c'est que je ne sais rien.'"
}
```

### **Routes Pavées**
```json
{
  "id": "paved_roads",
  "name": "Routes pavées",
  "category": "economic",
  "rarity": "common", 
  "memoryWord": "chemin",
  
  "immediate": [
    "Le chemin cessa d'être une suggestion pour devenir une promesse.",
    "Dans vos mémoires se tracent les veines de pierre des empires.",
    "Rome venait d'inventer l'art de rendre les distances prévisibles."
  ],
  
  "epochTemplate": "Vos choix pavèrent les {memoryWord} de la civilisation. Les routes romaines enseignèrent une leçon éternelle : tous les chemins mènent quelque part, mais les meilleurs sont ceux qu'on construit pour durer."
}
```

---

## 🏰 **BAS MOYEN ÂGE** (1000 → 1500)  
*Couleur thématique : #2F4F4F (Gris ardoise)*

### **Universités**
```json
{
  "id": "universities",
  "name": "Universités",
  "category": "cultural",
  "rarity": "uncommon",
  "memoryWord": "savoir",
  "prerequisites": ["writing_cuneiform"],
  
  "immediate": [
    "Le savoir trouva enfin des maisons dignes de lui dans vos souvenirs.",
    "Quelqu'un eut l'idée de rassembler tous ceux qui posaient trop de questions.",
    "Dans votre mémoire s'érigent les premiers palais de la curiosité."
  ],
  
  "epochTemplate": "Cette époque médiévale institutionnalisa le {memoryWord}. Les universités devinrent les cathédrales de l'intellect, où les étudiants apprenaient l'art subtil de disputer sur tout.",
  
  "synergies": [
    {
      "with": ["printing"],
      "effect": "knowledge_explosion", 
      "description": "Révolution de la diffusion du savoir"
    }
  ]
}
```

### **Moulins à Vent**
```json
{
  "id": "windmills",
  "name": "Moulins à vent",
  "category": "industrial",
  "rarity": "common",
  "memoryWord": "souffle",
  
  "immediate": [
    "Le souffle du vent accepta de moudre le grain des hommes.",
    "Dans vos mémoires tournent les premières machines météorologiques.", 
    "Quelqu'un domestiqua la brise pour en faire une employée saisonnière."
  ],
  
  "epochTemplate": "Vos choix captèrent le {memoryWord} des plaines dans des machines de bois. Les moulins enseignèrent à l'humanité sa première leçon d'énergie renouvelable."
}
```

---

## 🎨 **RENAISSANCE** (1500 → 1700)
*Couleur thématique : #8A2BE2 (Violet royal)*

### **Perspective Artistique**
```json
{
  "id": "perspective_art",
  "name": "Perspective en peinture",
  "category": "cultural",
  "rarity": "rare",
  "memoryWord": "profondeur",
  
  "immediate": [
    "La profondeur accepta de se laisser capturer sur des surfaces planes.",
    "Dans vos souvenirs naît l'illusion parfaite de la troisième dimension.",
    "Les peintres venaient de découvrir l'art de mentir avec précision mathématique."
  ],
  
  "epochTemplate": "Cette Renaissance révéla la {memoryWord} cachée des apparences. Les artistes apprirent à leurs contemporains que la réalité était une question de point de vue."
}
```

### **Télescope**
```json
{
  "id": "telescope",
  "name": "Télescope",
  "category": "scientific",
  "rarity": "uncommon",
  "memoryWord": "lointain",
  "prerequisites": ["optics_basic"],
  
  "immediate": [
    "Le lointain accepta de se rapprocher sans bouger dans vos mémoires.",
    "Galilée venait d'inventer l'art d'espionner les étoiles.",
    "Dans votre mémoire se focalisent les premiers regards indiscrets sur l'univers."
  ],
  
  "epochTemplate": "Vos choix rapprochèrent le {memoryWord} cosmique. Le télescope révéla que l'univers était bien plus grand et bien plus troublant que prévu."
}
```

---

## ⚙️ **RÉVOLUTION INDUSTRIELLE** (1700 → 1900)
*Couleur thématique : #4682B4 (Bleu acier)*

### **Machine à Vapeur**
```json
{
  "id": "steam_engine", 
  "name": "Machine à vapeur",
  "category": "industrial",
  "rarity": "pillar",
  "memoryWord": "vapeur",
  
  "immediate": [
    "La vapeur accepta de faire autre chose que de s'évaporer bêtement.",
    "Dans vos souvenirs siffle la première révolution mécanique.",
    "Watt venait de convaincre l'eau chaude de pousser des pistons."
  ],
  
  "epochTemplate": "Cette ère industrielle domestiqua la {memoryWord} rebelle. Les machines à vapeur enseignèrent à l'humanité que l'énergie pouvait être capturée, concentrée et mise au travail.",
  
  "effects": { "industrial": 4, "economic": 3, "social": -1, "military": 1 }
}
```

### **Vaccin**
```json
{
  "id": "vaccination",
  "name": "Vaccination", 
  "category": "scientific",
  "rarity": "uncommon",
  "memoryWord": "immunité",
  
  "immediate": [
    "L'immunité apprit qu'elle pouvait s'enseigner dans vos souvenirs.",
    "Jenner venait de découvrir l'art de faire mentir les maladies.",
    "Dans votre mémoire naît la première tricherie thérapeutique."
  ],
  
  "epochTemplate": "Vos choix éduquèrent l'{memoryWord} humaine. La vaccination révéla que parfois, un petit mensonge au corps valait mieux qu'une grande vérité mortelle."
}
```

---

## 💻 **ÉPOQUE CONTEMPORAINE** (1900 → 2100)
*Couleur thématique : #00CED1 (Turquoise électrique)*

### **Intelligence Artificielle**
```json
{
  "id": "artificial_intelligence",
  "name": "Intelligence artificielle",
  "category": "scientific",
  "rarity": "rare",
  "memoryWord": "miroir",
  
  "immediate": [
    "L'humanité créa un miroir qui se mit à réfléchir plus vite qu'elle.",
    "Dans vos souvenirs naît l'écho électronique de la pensée.",
    "Quelqu'un eut l'idée remarquable d'enseigner aux machines l'art de faire semblant d'être intelligentes."
  ],
  
  "epochTemplate": "Cette époque contemporaine façonna le {memoryWord} de silicium. L'intelligence artificielle posa la question ultime : que se passe-t-il quand le créateur devient moins intelligent que sa création ?"
}
```

### **Exploration Spatiale**
```json
{
  "id": "space_exploration",
  "name": "Exploration spatiale",
  "category": "exploration", 
  "rarity": "uncommon",
  "memoryWord": "void",
  "prerequisites": ["rocket_technology"],
  
  "immediate": [
    "Le vide spatial accepta de recevoir ses premiers visiteurs dans vos mémoires.",
    "L'humanité venait de découvrir qu'elle pouvait tomber vers le haut.",
    "Dans votre mémoire s'ouvre la première porte vers l'infini."
  ],
  
  "epochTemplate": "Vos choix percèrent le {memoryWord} cosmique. L'exploration spatiale enseigna une leçon d'humilité : la Terre était petite, fragile, et remarquablement seule."
}
```

---

## 🎯 **Patterns Narratifs Récurrents**

### **Formules d'ouverture favorite**
- *"[Élément] accepta de..."* → Personnification coopérative  
- *"Quelqu'un eut l'idée [qualificatif] de..."* → Ironie sur l'invention
- *"Dans vos [souvenirs/mémoires] [verbe] le/la [concept]"* → Ancrage mémoriel
- *"L'humanité venait de découvrir/inventer..."* → Vision d'espèce

### **Ton général à maintenir**
✅ **Bienveillant** : Amusé mais jamais méchant  
✅ **Poétique** : Images sensorielles et métaphores  
✅ **Philosophique** : Vision large des conséquences  
✅ **Accessible** : Compréhensible sans être simpliste

**Cette collection d'exemples assure la cohérence stylistique sur toutes les 120+ technologies du jeu !** ✨