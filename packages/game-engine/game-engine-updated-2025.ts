// packages/game-engine/src/core/TechDatabase.ts
// MISE À JOUR - Support alternative_prerequisites

import type { Technology, HistoricalPeriod, Result } from '@shared/types/game';

// === TYPES MIS À JOUR ===

export interface TechnologyExtended extends Technology {
  /**
   * Chemins alternatifs vers cette technologie
   * Chaque élément du tableau représente un groupe de prérequis alternatifs
   * La tech est disponible si UN des groupes est satisfait
   * 
   * Exemple:
   * prerequisites: ["cuneiform_writing"]
   * alternative_prerequisites: [["hieroglyphs"], ["oral_tradition_advanced"]]
   * 
   * Signifie: cuneiform_writing OU hieroglyphs OU oral_tradition_advanced
   */
  alternative_prerequisites?: readonly string[][];
}

// === IMPLEMENTATION MISE À JOUR ===

export class TechDatabaseImpl implements TechDatabase {
  private technologies: Map<string, TechnologyExtended> = new Map();
  private technologiesByPeriod: Map<HistoricalPeriod, TechnologyExtended[]> = new Map();
  
  constructor(private techData: Record<string, TechnologyExtended>) {
    this.initializeDatabase();
  }
  
  static async create(techDatabaseUrl?: string): Promise<TechDatabaseImpl> {
    // Charger les données depuis l'URL ou fichier local
    const techData = techDatabaseUrl 
      ? await fetch(techDatabaseUrl).then(r => r.json())
      : await import('./technologies-database-extended-2025.json');
    
    return new TechDatabaseImpl(techData.technologies);
  }
  
  private initializeDatabase(): void {
    // Indexer par ID
    for (const [id, tech] of Object.entries(this.techData)) {
      this.technologies.set(id, { ...tech, id });
    }
    
    // Indexer par période
    for (const tech of this.technologies.values()) {
      const periodTechs = this.technologiesByPeriod.get(tech.period) ?? [];
      periodTechs.push(tech);
      this.technologiesByPeriod.set(tech.period, periodTechs);
    }
    
    console.log(`TechDatabase initialized: ${this.technologies.size} technologies`);
  }
  
  async getTechnologiesByPeriod(period: HistoricalPeriod): Promise<TechnologyExtended[]> {
    return this.technologiesByPeriod.get(period) ?? [];
  }
  
  async getTechnologyById(id: string): Promise<TechnologyExtended | null> {
    return this.technologies.get(id) ?? null;
  }
  
  /**
   * 🔧 MÉTHODE CLEF MISE À JOUR
   * Vérifie si une technologie peut apparaître selon les nouveaux critères
   */
  canTechAppear(techId: string, preservedTechs: readonly string[]): boolean {
    const tech = this.technologies.get(techId);
    if (!tech) return false;
    
    // Si aucun prérequis, la tech est disponible
    if (!tech.prerequisites || tech.prerequisites.length === 0) {
      return true;
    }
    
    // Vérifier les prérequis principaux
    const mainPrereqsSatisfied = tech.prerequisites.every(prereq => 
      preservedTechs.includes(prereq)
    );
    
    if (mainPrereqsSatisfied) {
      return true;
    }
    
    // 🆕 NOUVEAU: Vérifier les chemins alternatifs
    if (tech.alternative_prerequisites) {
      return tech.alternative_prerequisites.some(alternativeGroup => 
        alternativeGroup.every(altPrereq => preservedTechs.includes(altPrereq))
      );
    }
    
    return false;
  }
  
  /**
   * 🆕 NOUVELLE MÉTHODE: Obtenir les raisons de disponibilité
   */
  getTechAvailabilityReason(techId: string, preservedTechs: readonly string[]): {
    available: boolean;
    reason: string;
    satisfiedPath?: 'main' | 'alternative';
    missingRequirements?: string[];
  } {
    const tech = this.technologies.get(techId);
    if (!tech) {
      return { available: false, reason: 'Technology not found' };
    }
    
    // Aucun prérequis
    if (!tech.prerequisites || tech.prerequisites.length === 0) {
      return { 
        available: true, 
        reason: 'No prerequisites required',
        satisfiedPath: 'main'
      };
    }
    
    // Vérifier prérequis principaux
    const missingMain = tech.prerequisites.filter(prereq => 
      !preservedTechs.includes(prereq)
    );
    
    if (missingMain.length === 0) {
      return {
        available: true,
        reason: 'Main prerequisites satisfied',
        satisfiedPath: 'main'
      };
    }
    
    // Vérifier alternatives
    if (tech.alternative_prerequisites) {
      for (let i = 0; i < tech.alternative_prerequisites.length; i++) {
        const altGroup = tech.alternative_prerequisites[i]!;
        const missingAlt = altGroup.filter(prereq => 
          !preservedTechs.includes(prereq)
        );
        
        if (missingAlt.length === 0) {
          return {
            available: true,
            reason: `Alternative path ${i + 1} satisfied: [${altGroup.join(', ')}]`,
            satisfiedPath: 'alternative'
          };
        }
      }
    }
    
    // Construire la raison du refus
    let reason = `Missing main: [${missingMain.join(', ')}]`;
    if (tech.alternative_prerequisites) {
      const altOptions = tech.alternative_prerequisites.map((group, i) => 
        `Alt${i + 1}: [${group.join(', ')}]`
      ).join(' OR ');
      reason += ` OR ${altOptions}`;
    }
    
    return {
      available: false,
      reason,
      missingRequirements: missingMain
    };
  }
  
  /**
   * 🆕 Validation avancée des dépendances avec alternatives
   */
  async validateDependencies(): Promise<Result<{
    totalTechs: number;
    withoutPrereqs: number;
    withAlternatives: number;
    possibleCycles: string[];
    problematicTechs: string[];
  }>> {
    try {
      const stats = {
        totalTechs: this.technologies.size,
        withoutPrereqs: 0,
        withAlternatives: 0,
        possibleCycles: [] as string[],
        problematicTechs: [] as string[]
      };
      
      for (const [id, tech] of this.technologies) {
        // Compter les techs sans prérequis
        if (!tech.prerequisites || tech.prerequisites.length === 0) {
          stats.withoutPrereqs++;
        }
        
        // Compter celles avec alternatives
        if (tech.alternative_prerequisites?.length) {
          stats.withAlternatives++;
        }
        
        // Détecter les prérequis inexistants
        const allPrereqs = [
          ...(tech.prerequisites ?? []),
          ...(tech.alternative_prerequisites?.flat() ?? [])
        ];
        
        for (const prereq of allPrereqs) {
          if (!this.technologies.has(prereq)) {
            stats.problematicTechs.push(`${id} -> ${prereq} (not found)`);
          }
        }
        
        // Détecter les cycles potentiels (basique)
        if (tech.prerequisites?.includes(id)) {
          stats.possibleCycles.push(`${id} -> self-reference`);
        }
      }
      
      return { success: true, data: stats };
      
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Validation failed')
      };
    }
  }
  
  /**
   * 🆕 Simuler la disponibilité par période (pour debug)
   */
  async simulateAvailabilityByPeriod(preservedTechs: string[] = []): Promise<{
    period: HistoricalPeriod;
    total: number;
    available: number;
    technologies: Array<{ id: string; available: boolean; reason: string }>;
  }[]> {
    const periods: HistoricalPeriod[] = [
      'prehistoric', 'ancient_early', 'ancient_classical', 'medieval_early',
      'medieval_late', 'renaissance', 'industrial', 'contemporary'
    ];
    
    const results = [];
    
    for (const period of periods) {
      const periodTechs = await this.getTechnologiesByPeriod(period);
      const technologies = periodTechs.map(tech => ({
        id: tech.id,
        ...this.getTechAvailabilityReason(tech.id, preservedTechs)
      }));
      
      results.push({
        period,
        total: periodTechs.length,
        available: technologies.filter(t => t.available).length,
        technologies
      });
    }
    
    return results;
  }
}

// === TYPES D'INTERFACE ===

export interface TechDatabase {
  getTechnologiesByPeriod(period: HistoricalPeriod): Promise<TechnologyExtended[]>;
  getTechnologyById(id: string): Promise<TechnologyExtended | null>;
  canTechAppear(techId: string, preservedTechs: readonly string[]): boolean;
  validateDependencies(): Promise<Result<any>>;
  
  // 🆕 Nouvelles méthodes
  getTechAvailabilityReason(techId: string, preservedTechs: readonly string[]): {
    available: boolean;
    reason: string;
    satisfiedPath?: 'main' | 'alternative';
    missingRequirements?: string[];
  };
  
  simulateAvailabilityByPeriod(preservedTechs?: string[]): Promise<Array<{
    period: HistoricalPeriod;
    total: number;
    available: number;
    technologies: Array<{ id: string; available: boolean; reason: string }>;
  }>>;
}

// === TEST DE VALIDATION ===

/*
Exemple d'utilisation:

const techDb = await TechDatabaseImpl.create('./technologies-database-extended-2025.json');

// Test basique
console.log('Legal codes disponible avec cuneiform_writing:', 
  techDb.canTechAppear('legal_codes', ['cuneiform_writing']));

console.log('Legal codes disponible avec hieroglyphs:', 
  techDb.canTechAppear('legal_codes', ['hieroglyphs']));

// Analyse détaillée
const reason = techDb.getTechAvailabilityReason('legal_codes', ['oral_tradition_advanced']);
console.log('Raison disponibilité legal_codes:', reason);

// Simulation globale  
const simulation = await techDb.simulateAvailabilityByPeriod(['fire_control', 'stone_tools']);
console.log('Simulation après Fire Control + Stone Tools:', simulation);

// Validation des dépendances
const validation = await techDb.validateDependencies();
console.log('État des dépendances:', validation.data);
*/