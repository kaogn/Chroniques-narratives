#!/usr/bin/env python3
# Démo du Moteur de Personnalité Adaptative
# Simulation d'une partie avec évolution narrative

class PersonalityEngine:
    """Version Python simplifiée pour démonstration"""
    
    def __init__(self):
        self.personality = {
            'pragmatic': 33,
            'spiritual': 33,
            'cooperative': 34
        }
        self.history = []
    
    def apply_choice(self, influence):
        old = self.personality.copy()
        
        for trait, change in influence.items():
            self.personality[trait] = max(0, min(100, 
                self.personality[trait] + change))
        
        self.history.append({
            'from': old,
            'to': self.personality.copy(),
            'influence': influence
        })
    
    def get_evolutionary_path(self):
        p = self.personality
        max_trait = max(p, key=p.get)
        max_value = p[max_trait]
        
        # Vérifier si équilibré
        if all(abs(p[trait] - p[max_trait]) < 15 for trait in p):
            return {
                'id': 'harmonious',
                'name': 'Voie Harmonieuse', 
                'flavor': 'équilibrée et sage'
            }
        
        paths = {
            'pragmatic': {
                'id': 'techno_builders',
                'name': 'Bâtisseurs Technologiques',
                'flavor': 'ingénieuse et efficace'
            },
            'spiritual': {
                'id': 'wisdom_seekers', 
                'name': 'Chercheurs de Sagesse',
                'flavor': 'mystique et contemplative'
            },
            'cooperative': {
                'id': 'collective_weavers',
                'name': 'Tisserands Collectifs', 
                'flavor': 'unie et solidaire'
            }
        }
        
        return paths[max_trait]
    
    def generate_narrative(self):
        path = self.get_evolutionary_path()
        p = self.personality
        
        dominant = max(p, key=p.get)
        narrative = f"Votre humanité suit la {path['name']}. "
        
        sorted_traits = sorted(p.items(), key=lambda x: x[1], reverse=True)
        
        if sorted_traits[1][1] > 25:
            trait_names = {
                'pragmatic': 'pragmatique',
                'spiritual': 'spirituelle', 
                'cooperative': 'coopérative'
            }
            narrative += f"Elle demeure {trait_names[sorted_traits[1][0]]} dans son approche, "
        
        narrative += f"Cette humanité {path['flavor']} trace sa voie unique dans le labyrinthe du temps."
        
        return narrative

class AdaptiveNarrator:
    """Narrateur adaptatif simplifié"""
    
    def __init__(self, engine):
        self.engine = engine
    
    def generate_epoch_intro(self, epoch, turn):
        epoch_names = {
            'prehistoric': "Dans les brumes de l'aube temporelle",
            'ancient_early': "Aux premiers balbutiements de la civilisation",
            'ancient_classical': "Sous les cieux de l'Antiquité florissante"
        }
        
        intro = epoch_names.get(epoch, "En un temps indéterminé")
        
        if turn > 1:
            path = self.engine.get_evolutionary_path()
            intro += f", votre humanité {path['flavor']} se dresse face à un nouveau carrefour temporel."
        else:
            intro += ", l'humanité hésite au seuil d'un choix primordial."
        
        intro += " Dans l'infini labyrinthe des possibles, trois voies se dessinent..."
        
        return intro
    
    def generate_choice_narrative(self, tech_id):
        choices = {
            'stone_tools': {
                'title': "L'Éveil des Outils",
                'description': "La pierre devient complice de l'intelligence. Les mains humaines découvrent qu'elles peuvent transformer le monde.",
                'flavor': "Première alliance entre matière et esprit"
            },
            'fire_control': {
                'title': "La Domestication du Feu", 
                'description': "Dans l'obscurité primitive, une étincelle devient promesse. L'humanité apprivoise l'élément séparateur.",
                'flavor': "Premier pacte avec l'énergie pure"
            },
            'oral_language': {
                'title': "L'Invention de la Parole",
                'description': "Du souffle naît le verbe, du verbe naît la pensée partagée. L'humanité tisse des réalités invisibles.",
                'flavor': "Naissance de l'âme collective"
            }
        }
        
        return choices.get(tech_id, {
            'title': 'Mystère Technologique',
            'description': 'Une voie inconnue s\'ouvre...',
            'flavor': 'Chemin vers l\'inconnu'
        })

def demo_personality_evolution():
    """Démonstration complète du moteur"""
    
    print("DEMONSTRATION - MOTEUR DE PERSONNALITE ADAPTATIVE")
    print("=" * 70)
    print()
    
    engine = PersonalityEngine()
    narrator = AdaptiveNarrator(engine)
    
    # Simulation d'une partie en 3 tours
    scenarios = [
        {
            'epoch': 'prehistoric',
            'turn': 1,
            'available_techs': ['stone_tools', 'fire_control', 'oral_language'],
            'chosen': ['stone_tools', 'oral_language'],
            'influences': {
                'stone_tools': {'pragmatic': 10, 'cooperative': 5},
                'oral_language': {'spiritual': 5, 'cooperative': 10}
            }
        },
        {
            'epoch': 'ancient_early',
            'turn': 2,
            'available_techs': ['agriculture_basic', 'cave_art', 'lunar_calendar'],
            'chosen': ['agriculture_basic'],
            'influences': {
                'agriculture_basic': {'cooperative': 8, 'pragmatic': 5}
            }
        },
        {
            'epoch': 'ancient_classical',
            'turn': 3,
            'available_techs': ['iron_working', 'legal_codes', 'philosophy'],
            'chosen': ['legal_codes'],
            'influences': {
                'legal_codes': {'cooperative': 12, 'spiritual': 3}
            }
        }
    ]
    
    for scenario in scenarios:
        print(f"TOUR {scenario['turn']} - {scenario['epoch'].upper()}")
        print("-" * 50)
        
        # 1. Intro narrative
        intro = narrator.generate_epoch_intro(scenario['epoch'], scenario['turn'])
        print(f"NARRATION:")
        print(f"   {intro}")
        print()
        
        # 2. Choix disponibles
        print(f"CHOIX DISPONIBLES:")
        for i, tech in enumerate(scenario['available_techs'], 1):
            choice = narrator.generate_choice_narrative(tech)
            print(f"   {i}. {choice['title']}")
            print(f"      {choice['description']}")
            print(f"      -> {choice['flavor']}")
            print()
        
        # 3. Choix du joueur
        print(f"CHOIX RETENUS: {', '.join(scenario['chosen'])}")
        print()
        
        # 4. Application des influences
        for tech in scenario['chosen']:
            if tech in scenario['influences']:
                engine.apply_choice(scenario['influences'][tech])
        
        # 5. État de la personnalité
        personality = engine.personality
        path = engine.get_evolutionary_path()
        
        print(f"EVOLUTION DE LA PERSONNALITE:")
        print(f"   Pragmatique: {personality['pragmatic']:2.0f} | " +
              f"Spirituelle: {personality['spiritual']:2.0f} | " +
              f"Cooperative: {personality['cooperative']:2.0f}")
        print(f"   Voie emergente: {path['name']}")
        print()
        
        # 6. Épilogue
        narrative = engine.generate_narrative()
        print(f"EPILOGUE:")
        print(f"   {narrative}")
        print()
        print("=" * 70)
        print()
    
    # Chronique finale
    print("CHRONIQUE FINALE")
    print("-" * 30)
    
    final_personality = engine.personality
    final_path = engine.get_evolutionary_path()
    
    print(f"Après trois époques de choix, cette humanité {final_path['flavor']} ")
    print(f"a révélé sa nature profonde. Son héritage ? Une civilisation ")
    
    dominant = max(final_personality, key=final_personality.get)
    if dominant == 'pragmatic':
        print("qui façonne le monde par ses outils plutôt que par ses rêves.")
    elif dominant == 'spiritual':
        print("qui cherche le sens plutôt que l'efficacité.")
    else:
        print("qui privilégie l'harmonie collective à l'excellence individuelle.")
    
    print()
    print("Dans l'infini labyrinthe des temps parallèles, cette chronique")
    print("n'est qu'une des innombrables variations sur le thème éternel de l'humanité.")
    print()
    print("— Chroniqueur de l'Infini")
    
    return engine

def test_different_paths():
    """Test des différents chemins évolutionnaires"""
    
    print("\nTEST DES CHEMINS EVOLUTIONNAIRES")
    print("=" * 50)
    
    test_scenarios = [
        {
            'name': 'Humanité Pragmatique',
            'choices': [
                {'pragmatic': 15, 'spiritual': -5},
                {'pragmatic': 20, 'cooperative': 5},
                {'pragmatic': 10, 'spiritual': -3}
            ]
        },
        {
            'name': 'Humanité Spirituelle', 
            'choices': [
                {'spiritual': 15, 'pragmatic': -5},
                {'spiritual': 20, 'cooperative': 5},
                {'spiritual': 12, 'pragmatic': -2}
            ]
        },
        {
            'name': 'Humanité Coopérative',
            'choices': [
                {'cooperative': 15, 'pragmatic': -3},
                {'cooperative': 18, 'spiritual': 5},
                {'cooperative': 10, 'spiritual': -2}
            ]
        }
    ]
    
    for scenario in test_scenarios:
        engine = PersonalityEngine()
        
        print(f"\n{scenario['name']}:")
        
        for i, choice in enumerate(scenario['choices'], 1):
            engine.apply_choice(choice)
            p = engine.personality
            path = engine.get_evolutionary_path()
            
            print(f"   Tour {i}: Pragmatique {p['pragmatic']:2.0f} | " +
                  f"Spirituelle {p['spiritual']:2.0f} | " + 
                  f"Cooperative {p['cooperative']:2.0f}")
        
        final_narrative = engine.generate_narrative()
        print(f"   -> {final_narrative}")

if __name__ == "__main__":
    # Démo principale
    engine = demo_personality_evolution()
    
    # Tests supplémentaires
    test_different_paths()
    
    print(f"\nDEMONSTRATION TERMINEE")
    print("Le moteur de personnalité adaptative est opérationnel !")
    print("Pret pour l'interface narrative immersive !")