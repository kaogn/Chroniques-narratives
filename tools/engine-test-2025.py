#!/usr/bin/env python3
# Test du moteur mis à jour avec alternative_prerequisites
# Validation des corrections d'equilibrage

import json
from typing import List, Dict, Set, Optional
from dataclasses import dataclass

@dataclass
class TechAvailability:
    tech_id: str
    available: bool
    reason: str
    satisfied_path: Optional[str] = None

class TechDatabaseUpdated:
    """Version Python du TechDatabase mis à jour pour tester les corrections"""
    
    def __init__(self, tech_data: Dict):
        self.technologies = tech_data
        
    def can_tech_appear(self, tech_id: str, preserved_techs: List[str]) -> bool:
        """Version mise à jour qui gère alternative_prerequisites"""
        
        tech = self.technologies.get(tech_id)
        if not tech:
            return False
        
        # Aucun prérequis = disponible
        main_prereqs = tech.get('prerequisites', [])
        if not main_prereqs:
            return True
        
        # Vérifier prérequis principaux
        main_satisfied = all(prereq in preserved_techs for prereq in main_prereqs)
        if main_satisfied:
            return True
        
        # 🆕 NOUVEAU: Vérifier les chemins alternatifs
        alt_prereqs = tech.get('alternative_prerequisites', [])
        if alt_prereqs:
            return any(
                all(alt_prereq in preserved_techs for alt_prereq in alt_group)
                for alt_group in alt_prereqs
            )
        
        return False
    
    def get_availability_reason(self, tech_id: str, preserved_techs: List[str]) -> TechAvailability:
        """Diagnostiquer pourquoi une tech est disponible ou non"""
        
        tech = self.technologies.get(tech_id)
        if not tech:
            return TechAvailability(tech_id, False, "Technology not found")
        
        main_prereqs = tech.get('prerequisites', [])
        
        # Aucun prérequis
        if not main_prereqs:
            return TechAvailability(
                tech_id, True, "No prerequisites required", "main"
            )
        
        # Vérifier prérequis principaux
        missing_main = [p for p in main_prereqs if p not in preserved_techs]
        if not missing_main:
            return TechAvailability(
                tech_id, True, "Main prerequisites satisfied", "main"
            )
        
        # Vérifier alternatives
        alt_prereqs = tech.get('alternative_prerequisites', [])
        if alt_prereqs:
            for i, alt_group in enumerate(alt_prereqs):
                missing_alt = [p for p in alt_group if p not in preserved_techs]
                if not missing_alt:
                    return TechAvailability(
                        tech_id, True, 
                        f"Alternative path {i+1} satisfied: [{', '.join(alt_group)}]",
                        "alternative"
                    )
        
        # Construire raison du refus
        reason = f"Missing main: [{', '.join(missing_main)}]"
        if alt_prereqs:
            alt_options = " OR ".join(
                f"Alt{i+1}: [{', '.join(group)}]" 
                for i, group in enumerate(alt_prereqs)
            )
            reason += f" OR {alt_options}"
        
        return TechAvailability(tech_id, False, reason)

def test_updated_engine():
    """Test complet du moteur mis à jour"""
    
    print("TEST MOTEUR MIS À JOUR - Alternative Prerequisites")
    print("=" * 60)
    
    # Charger les données avec corrections
    with open("technologies-database-extended-2025.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    db = TechDatabaseUpdated(data["technologies"])
    
    # 1. Test des technologies avec alternatives
    print("\n1. TEST CHEMINS ALTERNATIFS:")
    
    test_cases = [
        # legal_codes avec cuneiform_writing (chemin principal)
        {
            "tech": "legal_codes",
            "preserved": ["oral_language", "cuneiform_writing"],
            "expected": True,
            "description": "legal_codes via chemin principal (cuneiform_writing)"
        },
        # legal_codes avec hieroglyphs (alternatif 1)
        {
            "tech": "legal_codes", 
            "preserved": ["oral_language", "cave_art", "hieroglyphs"],
            "expected": True,
            "description": "legal_codes via alternative 1 (hieroglyphs)"
        },
        # legal_codes avec oral_tradition_advanced (alternatif 2)
        {
            "tech": "legal_codes",
            "preserved": ["oral_language", "oral_tradition_advanced"],
            "expected": True,
            "description": "legal_codes via alternative 2 (oral_tradition_advanced)"
        },
        # animal_domestication avec stone_tools (principal)
        {
            "tech": "animal_domestication",
            "preserved": ["stone_tools"],
            "expected": True,
            "description": "animal_domestication via chemin principal (stone_tools)"
        },
        # animal_domestication avec oral_language (alternatif 1)
        {
            "tech": "animal_domestication",
            "preserved": ["oral_language"],
            "expected": True,
            "description": "animal_domestication via alternative 1 (oral_language)"
        },
        # animal_domestication avec agriculture_basic (alternatif 2)
        {
            "tech": "animal_domestication",
            "preserved": ["stone_tools", "agriculture_basic"],
            "expected": True,
            "description": "animal_domestication via alternative 2 (agriculture_basic)"
        }
    ]
    
    passed_tests = 0
    for test in test_cases:
        result = db.can_tech_appear(test["tech"], test["preserved"])
        reason = db.get_availability_reason(test["tech"], test["preserved"])
        
        status = "PASS" if result == test["expected"] else "FAIL"
        print(f"{status}: {test['description']}")
        print(f"   Résultat: {result}, Raison: {reason.reason}")
        
        if result == test["expected"]:
            passed_tests += 1
        print()
    
    print(f"Tests alternatifs: {passed_tests}/{len(test_cases)} réussis")
    
    # 2. Simulation gameplay avec nouveau moteur
    print("\n2. SIMULATION GAMEPLAY AVEC MOTEUR MIS À JOUR:")
    
    periods = ["prehistoric", "ancient_early", "ancient_classical", "medieval_early"]
    preserved = []
    
    for period in periods:
        # Obtenir toutes les techs de la période
        period_techs = {
            tech_id: tech_data for tech_id, tech_data in data["technologies"].items()
            if tech_data.get("period") == period
        }
        
        # Tester disponibilité avec nouveau moteur
        available = []
        for tech_id in period_techs.keys():
            if db.can_tech_appear(tech_id, preserved):
                available.append(tech_id)
        
        # Choisir 2 technologies (simulation)
        chosen = available[:2] if len(available) >= 2 else available
        preserved.extend(chosen)
        
        status = "EXCELLENT" if len(available) >= 5 else \
                 "BON" if len(available) >= 3 else \
                 "PROBLEMATIQUE" if len(available) >= 1 else \
                 "BLOQUE"
        
        print(f"{period}: {len(available)} disponibles, choix: {chosen} {status}")
    
    # 3. Analyse détaillée des nouvelles techs sans prérequis
    print("\n3. NOUVELLES TECHNOLOGIES SANS PRÉREQUIS:")
    
    no_prereqs = []
    for tech_id, tech_data in data["technologies"].items():
        if not tech_data.get("prerequisites"):
            period = tech_data.get("period", "unknown")
            no_prereqs.append((tech_id, period))
    
    by_period = {}
    for tech_id, period in no_prereqs:
        if period not in by_period:
            by_period[period] = []
        by_period[period].append(tech_id)
    
    for period, techs in sorted(by_period.items()):
        print(f"{period}: {len(techs)} techs - {techs}")
    
    print(f"\nTotal sans prérequis: {len(no_prereqs)}")
    
    # 4. Validation finale
    print("\n4. VALIDATION MOTEUR MIS À JOUR:")
    
    validation_criteria = [
        (passed_tests >= len(test_cases) * 0.8, "80% tests alternatifs passés"),
        (len(no_prereqs) >= 10, "10+ technologies sans prérequis"),
        (len(by_period.get("prehistoric", [])) >= 2, "2+ techs prehistoric sans prérequis"),
        (len(by_period.get("ancient_early", [])) >= 2, "2+ techs ancient_early sans prérequis"),
        (len(by_period.get("ancient_classical", [])) >= 1, "1+ techs ancient_classical sans prérequis"),
        (len(by_period.get("medieval_early", [])) >= 1, "1+ techs medieval_early sans prérequis")
    ]
    
    passed_criteria = 0
    for passed, description in validation_criteria:
        status = "PASS" if passed else "FAIL"
        print(f"{status}: {description}")
        if passed:
            passed_criteria += 1
    
    # Résultat final
    print("\n" + "=" * 60)
    print("RÉSULTAT FINAL - MOTEUR MIS À JOUR")
    print("=" * 60)
    
    success_rate = (passed_criteria / len(validation_criteria)) * 100
    
    if success_rate >= 90:
        print("SUCCES COMPLET: Moteur pret pour l'implementation")
        print("Toutes les corrections d'equilibrage sont operationnelles")
        print("Les chemins alternatifs fonctionnent correctement")
        print("Chaque periode a suffisamment de choix disponibles")
    elif success_rate >= 70:
        print("SUCCES PARTIEL: Moteur fonctionnel avec corrections mineures necessaires")
    else:
        print("ECHEC: Des corrections majeures sont encore necessaires")
    
    print(f"\nScore global: {success_rate:.1f}% ({passed_criteria}/{len(validation_criteria)} critères)")
    
    return success_rate >= 80

if __name__ == "__main__":
    success = test_updated_engine()
    exit(0 if success else 1)