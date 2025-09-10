#!/usr/bin/env python3
# Test rapide de l'equilibrage apres corrections
# Verification des corrections appliquees au gameplay

import json
from collections import defaultdict

def test_balanced_fixes():
    """Teste les corrections appliquees a la base de donnees"""
    
    print("TEST RAPIDE - CORRECTIONS APPLIQUEES")
    print("=" * 50)
    
    # Charger la base corrigee
    with open("technologies-database-extended-2025.json", "r", encoding="utf-8") as f:
        data = json.load(f)
    
    technologies = data["technologies"]
    
    # 1. Verifier les technologies sans prerequis par periode
    print("\n1. TECHNOLOGIES SANS PREREQUIS (apres corrections):")
    
    periods = ["prehistoric", "ancient_early", "ancient_classical", "medieval_early"]
    no_prereq_count = 0
    
    for period in periods:
        period_techs = {k: v for k, v in technologies.items() if v["period"] == period}
        no_prereq = []
        
        for tech_id, tech_data in period_techs.items():
            if not tech_data["prerequisites"]:
                no_prereq.append(tech_id)
        
        print(f"{period}: {len(no_prereq)} techs - {no_prereq}")
        no_prereq_count += len(no_prereq)
        
        if len(no_prereq) >= 2:
            print("  Status: BON (2+ choix sans prerequis)")
        else:
            print("  Status: PROBLEMATIQUE (< 2 choix)")
    
    print(f"\nTotal sans prerequis: {no_prereq_count}")
    print(f"Objectif: 8+ (atteint: {'OUI' if no_prereq_count >= 8 else 'NON'})")
    
    # 2. Verifier les chemins alternatifs
    print("\n2. CHEMINS ALTERNATIFS AJOUTES:")
    
    alternatives_count = 0
    for tech_id, tech_data in technologies.items():
        if "alternative_prerequisites" in tech_data:
            alternatives_count += 1
            print(f"{tech_id}: {tech_data['alternative_prerequisites']}")
    
    print(f"Total avec alternatives: {alternatives_count}")
    
    # 3. Verifier les nouvelles technologies
    print("\n3. NOUVELLES TECHNOLOGIES AJOUTEES:")
    
    new_techs = [
        "lunar_calendar", "folk_medicine", "fermentation", 
        "domestication_cats", "practical_metallurgy", "oral_tradition_advanced",
        "urban_planning", "natural_philosophy", "mechanical_clocks_basic"
    ]
    
    found_new_techs = []
    for tech_id in new_techs:
        if tech_id in technologies:
            found_new_techs.append(tech_id)
            period = technologies[tech_id]["period"]
            prereqs = len(technologies[tech_id]["prerequisites"])
            print(f"{tech_id}: {period}, {prereqs} prerequis")
        else:
            print(f"{tech_id}: NON TROUVE!")
    
    print(f"\nNouvelles technos trouvees: {len(found_new_techs)}/{len(new_techs)}")
    
    # 4. Simulation rapide de disponibilite
    print("\n4. SIMULATION RAPIDE:")
    
    # Technologies preservees (simulation simplifiee)
    preserved = []
    
    for period in periods:
        period_techs = {k: v for k, v in technologies.items() if v["period"] == period}
        available = []
        
        for tech_id, tech_data in period_techs.items():
            # Logique simplifiee pour les alternatives
            has_prereq = True
            main_prereqs = tech_data["prerequisites"]
            
            # Verifier prerequis principaux
            if not main_prereqs or all(prereq in preserved for prereq in main_prereqs):
                has_prereq = True
            else:
                has_prereq = False
                # Verifier alternatives si disponibles
                if "alternative_prerequisites" in tech_data:
                    for alt_path in tech_data["alternative_prerequisites"]:
                        if all(prereq in preserved for prereq in alt_path):
                            has_prereq = True
                            break
            
            if has_prereq:
                available.append(tech_id)
        
        # Choisir 2 technologies les plus simples
        available.sort(key=lambda x: len(technologies[x]["prerequisites"]))
        chosen = available[:2] if len(available) >= 2 else available
        preserved.extend(chosen)
        
        status = "EXCELLENT" if len(available) >= 5 else "BON" if len(available) >= 3 else "PROBLEMATIQUE"
        print(f"{period}: {len(available)} disponibles, choix: {chosen} - {status}")
    
    # 5. Rapport final
    print("\n" + "=" * 50)
    print("RAPPORT FINAL - CORRECTIONS")
    print("=" * 50)
    
    success_criteria = [
        (no_prereq_count >= 8, "8+ technologies sans prerequis"),
        (alternatives_count >= 2, "2+ technologies avec chemins alternatifs"), 
        (len(found_new_techs) >= 5, "5+ nouvelles technologies ajoutees"),
    ]
    
    passed = sum(1 for passed, _ in success_criteria if passed)
    
    for passed, criteria in success_criteria:
        status = "PASSE" if passed else "ECHEC"
        print(f"{status}: {criteria}")
    
    overall_success = passed == len(success_criteria)
    print(f"\nResultat global: {passed}/{len(success_criteria)} criteres - {'REUSSI' if overall_success else 'PARTIELLEMENT REUSSI'}")
    
    if overall_success:
        print("\nSTATUS: EQUILIBRAGE AMELIORE")
        print("Les corrections resolvront une grande partie des goulots d'etranglement")
    else:
        print("\nSTATUS: CORRECTIONS SUPPLEMENTAIRES NECESSAIRES")
        print("Il reste des problemes d'equilibrage a resoudre")
    
    return overall_success

if __name__ == "__main__":
    success = test_balanced_fixes()
    exit(0 if success else 1)