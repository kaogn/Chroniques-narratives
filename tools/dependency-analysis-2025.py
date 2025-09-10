#!/usr/bin/env python3
# Human Memories - Dependency Analysis & Fix 2025
# Analyse et correction des goulets d'étranglement

import json
from typing import Dict, List, Set, Optional
from dataclasses import dataclass
from collections import defaultdict, deque

@dataclass
class TechNode:
    id: str
    name: str
    period: str
    rarity: str
    prerequisites: List[str]
    enables: List[str]
    is_accessible: bool = False

def analyze_dependency_bottlenecks():
    """Analyse les goulets d'étranglement dans l'arbre de dépendances"""
    
    print("ANALYSE DES GOULOTS D'ETRANGLEMENT")
    print("=" * 50)
    
    # Technologies par période avec leurs dépendances réelles
    tech_tree = {
        # PREHISTORIC - 12 technologies
        "prehistoric": {
            "fire_control": [],
            "stone_tools": [],
            "oral_language": [],
            "cave_art": ["fire_control", "oral_language"],
            "animal_skins": ["stone_tools"],
            "animal_domestication": ["hunting_organized"],  # Dépend d'une tech qui n'existe pas encore !
            "agriculture_basic": ["stone_tools"],
            "pottery": ["fire_control"],
            "hut_construction": ["stone_tools"],
            "organized_fishing": ["stone_tools", "oral_language"],
            "bow_arrows": ["stone_tools"],
            "ritual_burial": ["oral_language"],
        },
        
        # ANCIENT_EARLY - 16 technologies
        "ancient_early": {
            "cuneiform_writing": ["oral_language"],
            "hieroglyphs": ["oral_language", "cave_art"],
            "bronze_working": ["fire_control"],
            "wheel": [],  # Aucun prérequis - BON !
            "sail_navigation": ["organized_fishing"],
            "irrigation": ["agriculture_basic"],
            "legal_codes": ["cuneiform_writing"],
            "monumental_architecture": ["hut_construction", "bronze_working"],
            "arithmetic": ["cuneiform_writing"],
            "solar_calendar": ["arithmetic"],
            "chariots": ["wheel", "animal_domestication"],
            "mass_literacy": ["cuneiform_writing", "legal_codes"],
            "astrology": ["solar_calendar", "hieroglyphs"],
            "metal_currency": ["bronze_working"],
            "composite_bow": ["bow_arrows", "bronze_working"],
            "early_roads": ["chariots"],
        },
        
        # ANCIENT_CLASSICAL - 12 technologies
        "ancient_classical": {
            "greek_philosophy": ["mass_literacy"],
            "athenian_democracy": ["legal_codes", "greek_philosophy"],
            "aqueducts": ["monumental_architecture", "arithmetic"],
            "roman_concrete": ["monumental_architecture"],
            "theater": ["greek_philosophy"],
            "ptolemaic_astronomy": ["arithmetic", "astrology"],
            "cartography": ["ptolemaic_astronomy", "sail_navigation"],
            "hippocratic_medicine": ["greek_philosophy"],
            "paper_chinese": ["cuneiform_writing"],
            "magnetic_compass": ["sail_navigation"],
            "crossbow": ["composite_bow", "bronze_working"],
            "paved_roads": ["early_roads", "roman_concrete"],
        },
        
        # MEDIEVAL_EARLY - 12 technologies
        "medieval_early": {
            "heavy_plow": ["iron_working", "animal_domestication"],
            "water_mills": ["aqueducts"],
            "astrolabe": ["ptolemaic_astronomy", "bronze_working"],
            "stellar_navigation": ["astrolabe", "magnetic_compass"],
            "basic_alchemy": ["bronze_working", "hippocratic_medicine"],
            "monasticism": ["paper_chinese", "hippocratic_medicine"],
            "romanesque_arches": ["roman_concrete"],
            "arabic_medicine": ["hippocratic_medicine", "basic_alchemy"],
            "early_universities": ["monasticism", "greek_philosophy"],
            "chain_mail": ["iron_working"],
            "iron_working": ["bronze_working"],  # CRITIQUE - Seul chemin vers le fer
            "windmills": ["water_mills"],
        },
        
        # Etc... (les périodes suivantes ont encore plus de dépendances)
    }
    
    # 1. Identifier les technologies sans prérequis
    print("\n1. TECHNOLOGIES SANS PREREQUIS:")
    no_prereq_count = 0
    for period, techs in tech_tree.items():
        period_no_prereq = [tech_id for tech_id, prereqs in techs.items() if not prereqs]
        if period_no_prereq:
            print(f"{period}: {period_no_prereq}")
            no_prereq_count += len(period_no_prereq)
        else:
            print(f"{period}: AUCUNE - PROBLEME CRITIQUE!")
    
    print(f"\nTotal sans prérequis: {no_prereq_count}")
    
    # 2. Identifier les technologies "goulet d'étranglement"
    print("\n2. TECHNOLOGIES GOULETS D'ETRANGLEMENT:")
    print("(Technologies dont dépendent beaucoup d'autres)")
    
    dependency_count = defaultdict(int)
    for period, techs in tech_tree.items():
        for tech_id, prereqs in techs.items():
            for prereq in prereqs:
                dependency_count[prereq] += 1
    
    critical_techs = [(tech, count) for tech, count in dependency_count.items() if count >= 3]
    critical_techs.sort(key=lambda x: x[1], reverse=True)
    
    for tech, count in critical_techs:
        print(f"{tech}: {count} technologies en dépendent")
    
    # 3. Simuler la disponibilité par tour
    print("\n3. SIMULATION DISPONIBILITE PAR PERIODE:")
    
    available_by_period = simulate_tech_availability(tech_tree)
    
    for period, available in available_by_period.items():
        print(f"{period}: {len(available)} technologies disponibles")
        if len(available) < 3:
            print(f"  CRITIQUE: Seulement {available}")
    
    return tech_tree, critical_techs

def simulate_tech_availability(tech_tree: Dict) -> Dict[str, List[str]]:
    """Simule la disponibilité des technologies par période"""
    
    # Technologies préservées lors d'une partie type
    preserved = []
    available_by_period = {}
    
    periods = ["prehistoric", "ancient_early", "ancient_classical", "medieval_early", 
               "medieval_late", "renaissance", "industrial", "contemporary"]
    
    for period in periods:
        if period not in tech_tree:
            available_by_period[period] = []
            continue
            
        period_techs = tech_tree[period]
        available = []
        
        for tech_id, prereqs in period_techs.items():
            # Vérifier si tous les prérequis sont satisfaits
            if all(prereq in preserved for prereq in prereqs):
                available.append(tech_id)
        
        available_by_period[period] = available
        
        # Simuler le choix de 2 technologies (les plus simples)
        available.sort(key=lambda x: len(period_techs[x]))  # Trier par nombre de prérequis
        chosen = available[:2] if len(available) >= 2 else available
        preserved.extend(chosen)
        
        print(f"  Période {period}: {len(available)} disponibles, choisi: {chosen}")
    
    return available_by_period

def generate_dependency_fixes():
    """Génère les corrections pour améliorer l'équilibrage"""
    
    print("\n" + "=" * 50)
    print("CORRECTIONS PROPOSEES")
    print("=" * 50)
    
    fixes = []
    
    # Fix 1: Ajouter plus de technologies sans prérequis
    print("\n1. AJOUTER DES TECHNOLOGIES SANS PREREQUIS:")
    
    new_no_prereq = {
        "prehistoric": ["lunar_calendar"],  # Observer la lune ne nécessite rien
        "ancient_early": ["domestication_cats", "fermentation"],  # Processus naturels
        "ancient_classical": ["urban_planning"],  # Concept organisationnel
        "medieval_early": ["mechanical_clocks_basic"],  # Ingénierie indépendante 
        "medieval_late": ["optics_basic"],  # Observation naturelle
        "renaissance": ["scientific_observation"],  # Méthode intellectuelle
        "industrial": ["chemical_analysis"],  # Découverte expérimentale
        "contemporary": ["digital_logic"]  # Concept mathématique
    }
    
    for period, techs in new_no_prereq.items():
        print(f"{period}: Ajouter {techs}")
        fixes.append(f"ADD {period}: {techs}")
    
    # Fix 2: Assouplir les prérequis critiques
    print("\n2. ASSOUPLIR LES PREREQUIS CRITIQUES:")
    
    prerequisite_fixes = {
        # Permettre plusieurs chemins vers le fer
        "iron_working": "bronze_working OR advanced_mining OR natural_iron",
        
        # Alternatives à l'écriture cunéiforme
        "legal_codes": "cuneiform_writing OR hieroglyphs OR oral_tradition_advanced",
        
        # Alternatives à la philosophie grecque
        "scientific_method": "greek_philosophy OR chinese_philosophy OR islamic_philosophy",
        
        # Alternatives aux technologies piliers manquantes
        "animal_domestication": "hunting_organized OR agriculture_basic OR social_cooperation",
        
        # Chemins alternatifs vers les technologies avancées
        "optics": "glass_making OR crystal_polishing OR natural_lenses",
        "mechanical_engineering": "water_mills OR windmills OR clockwork",
        "navigation_advanced": "magnetic_compass OR stellar_maps OR coastal_knowledge"
    }
    
    for tech, alternatives in prerequisite_fixes.items():
        print(f"{tech}: {alternatives}")
        fixes.append(f"MODIFY {tech}: {alternatives}")
    
    # Fix 3: Créer des technologies "pont"
    print("\n3. CREER DES TECHNOLOGIES PONT:")
    
    bridge_techs = {
        "natural_philosophy": {
            "period": "ancient_classical",
            "prereqs": [],
            "enables": ["scientific_method", "experimental_approach"],
            "description": "Observation systématique de la nature - Alternative à la philosophie grecque"
        },
        "practical_metallurgy": {
            "period": "medieval_early", 
            "prereqs": ["fire_control"],
            "enables": ["iron_working", "steel_working"],
            "description": "Travail empirique des métaux - Chemin direct vers le fer"
        },
        "folk_medicine": {
            "period": "prehistoric",
            "prereqs": [],
            "enables": ["herbal_knowledge", "basic_surgery"],
            "description": "Médecine traditionnelle - Base médicale indépendante"
        }
    }
    
    for tech_id, data in bridge_techs.items():
        print(f"{tech_id} ({data['period']}): {data['description']}")
        fixes.append(f"BRIDGE {tech_id}: {data}")
    
    return fixes

def test_balanced_tree():
    """Teste l'arbre équilibré après corrections"""
    
    print("\n" + "=" * 50) 
    print("TEST ARBRE EQUILIBRE")
    print("=" * 50)
    
    # Arbre corrigé avec les fixes
    balanced_tree = {
        "prehistoric": {
            # Originaux
            "fire_control": [],
            "stone_tools": [], 
            "oral_language": [],
            # Ajouts
            "lunar_calendar": [],
            "folk_medicine": [],
            # Modifiés
            "animal_domestication": ["stone_tools"],  # Simplifié
            "agriculture_basic": ["stone_tools"],
            "pottery": ["fire_control"],
            "cave_art": ["fire_control"],  # Simplifié
            "ritual_burial": ["oral_language"],
        },
        
        "ancient_early": {
            # Plus de choix sans prérequis
            "wheel": [],
            "fermentation": [],
            "domestication_cats": [],
            # Chemins alternatifs
            "cuneiform_writing": ["oral_language"],
            "bronze_working": ["fire_control"],
            "practical_metallurgy": ["fire_control"],  # Nouveau chemin vers fer
            "irrigation": ["agriculture_basic"],
            "sail_navigation": ["organized_fishing"],
            # Etc...
        }
    }
    
    # Simuler la disponibilité avec l'arbre équilibré
    print("\nSimulation avec arbre equilibre:")
    available_balanced = simulate_tech_availability(balanced_tree)
    
    improvements = 0
    for period, available in available_balanced.items():
        if len(available) >= 3:
            improvements += 1
            print(f"{period}: {len(available)} technologies - OK")
        else:
            print(f"{period}: {len(available)} technologies - ENCORE PROBLEMATIQUE")
    
    print(f"\nAmelioration: {improvements}/2 periodes avec 3+ choix")
    
    return improvements >= 2

if __name__ == "__main__":
    # Analyse complète
    tech_tree, critical_techs = analyze_dependency_bottlenecks()
    fixes = generate_dependency_fixes()
    balanced = test_balanced_tree()
    
    print("\n" + "=" * 50)
    print("RAPPORT FINAL - EQUILIBRAGE")
    print("=" * 50)
    
    print(f"Problemes identifies: {len(critical_techs)} goulots d'etranglement")
    print(f"Corrections proposees: {len(fixes)} modifications")
    print(f"Test equilibrage: {'REUSSI' if balanced else 'ECHEC'}")
    
    if balanced:
        print("\nSTATUS: PRET POUR IMPLEMENTATION")
        print("Les corrections proposees resoudront les goulots d'etranglement")
    else:
        print("\nSTATUS: CORRECTIONS SUPPLEMENTAIRES NECESSAIRES")
        print("L'arbre de dependances necessite plus d'assouplissement")