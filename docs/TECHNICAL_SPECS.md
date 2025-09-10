# Spécifications Techniques - Human Memories

## 🔧 Architecture de Données

### **Format & Performance**
- **Format** : JSON UTF-8 avec validation schema
- **Taille estimée** : ~500 Ko pour 120 technologies complètes  
- **Parsing** : < 100ms sur hardware standard
- **Mémoire** : ~2 MB en RAM une fois chargé
- **Compression** : Gzip recommandé (-70% taille)

### **Validation automatique**
```typescript
interface TechnologyValidator {
  validateStructure(): ValidationResult;
  checkDependencies(): DependencyGraph;
  verifyNarrative(): NarrativeCheck;
  balanceEffects(): BalanceReport;
}

// Exemple de validation
const validator = new TechnologyValidator(technologiesData);
const result = validator.validateAll();
if (!result.isValid) {
  console.error('Validation errors:', result.errors);
}
```

---

## 🎮 Intégration Gameplay

### **Moteur de sélection des technologies**
```typescript
class TechSelectionEngine {
  constructor(
    private technologies: Technology[],
    private gameState: GameState,
    private difficulty: DifficultyLevel
  ) {}
  
  generateTurnChoices(period: HistoricalPeriod): Technology[] {
    const availableTechs = this.getAvailableTechs(period);
    const weightedSelection = this.applyRarityWeights(availableTechs);
    const finalChoices = this.applyDependencyFilters(weightedSelection);
    
    return this.randomSelect(finalChoices, 3); // 3 choix par tour
  }
  
  private getAvailableTechs(period: HistoricalPeriod): Technology[] {
    return this.technologies.filter(tech => {
      return tech.period === period 
        && this.checkPrerequisites(tech)
        && !this.isBlocked(tech);
    });
  }
  
  private applyRarityWeights(techs: Technology[]): WeightedTech[] {
    return techs.map(tech => ({
      tech,
      weight: this.getRarityWeight(tech.rarity)
    }));
  }
  
  private getRarityWeight(rarity: TechRarity): number {
    const weights = {
      pillar: 1.0,      // Toujours disponible
      common: 0.7,      // 70% chance
      uncommon: 0.4,    // 40% chance  
      rare: 0.15,       // 15% chance
      legendary: 0.05   // 5% chance
    };
    return weights[rarity];
  }
}
```

### **Gestionnaire de dépendances**
```typescript
class DependencyManager {
  private preservedTechs: Set<string> = new Set();
  private blockedTechs: Set<string> = new Set();
  
  preserveTechnology(techId: string): void {
    const tech = this.getTech(techId);
    
    // Ajouter à la liste des techs préservées
    this.preservedTechs.add(techId);
    
    // Débloquer les technologies rendues possibles
    tech.dependencies.enables.forEach(enabledId => {
      this.blockedTechs.delete(enabledId);
    });
    
    // Bloquer les technologies incompatibles
    tech.dependencies.blocks?.forEach(blockedId => {
      this.blockedTechs.add(blockedId);
    });
    
    // Activer les synergies
    this.checkSynergies(techId);
  }
  
  canTechAppear(techId: string): boolean {
    const tech = this.getTech(techId);
    
    // Vérifier les prérequis
    const hasPrerequisites = tech.dependencies.prerequisites.every(
      prereqId => this.preservedTechs.has(prereqId)
    );
    
    // Vérifier qu'elle n'est pas bloquée
    const isNotBlocked = !this.blockedTechs.has(techId);
    
    return hasPrerequisites && isNotBlocked;
  }
}
```

---

## 🎭 Système Narratif

### **Générateur d'échos narratifs**
```typescript
class NarrativeGenerator {
  generateImmediate(tech: Technology): string {
    const variations = tech.narrative.immediate;
    return this.randomSelect(variations);
  }
  
  generateEpochSummary(chosenTechs: Technology[]): string {
    const summaries = chosenTechs.map(tech => {
      const template = tech.narrative.epochTemplate;
      return this.fillTemplate(template, {
        memoryWord: tech.narrative.memoryWord,
        techName: tech.name
      });
    });
    
    return this.weaveNarratives(summaries);
  }
  
  generateFinalChronicle(gameHistory: GameHistory): string {
    const playerProfile = this.analyzePlayerStyle(gameHistory);
    const majorTechs = this.getMajorTechnologies(gameHistory);
    
    const chronicle = this.buildChronicle(majorTechs, playerProfile);
    const reflection = this.generateReflection(playerProfile);
    const epitaph = this.generateEpitaph(playerProfile);
    
    return `${chronicle}\n\n${reflection}\n\n${epitaph}`;
  }
  
  private fillTemplate(template: string, variables: Record<string, string>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] || match;
    });
  }
  
  private weaveNarratives(summaries: string[]): string {
    // Algorithme intelligent pour combiner les résumés
    // en évitant les répétitions et en créant des transitions fluides
    return summaries.join(' ').replace(/\. Cette époque/g, ', tandis que cette époque');
  }
}
```

### **Analyseur de profil joueur**
```typescript
interface PlayerProfile {
  primaryFocus: 'military' | 'cultural' | 'economic' | 'social' | 'exploration';
  secondaryFocus: string;
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  consistency: number; // 0-1, cohérence des choix
  specialization: number; // 0-1, spécialisation vs diversification
}

class PlayerAnalyzer {
  analyze(gameHistory: GameHistory): PlayerProfile {
    const effectTotals = this.calculateEffectTotals(gameHistory);
    const primaryFocus = this.getPrimaryFocus(effectTotals);
    const riskTolerance = this.analyzeRiskTolerance(gameHistory);
    const consistency = this.calculateConsistency(gameHistory);
    
    return {
      primaryFocus,
      secondaryFocus: this.getSecondaryFocus(effectTotals, primaryFocus),
      riskTolerance,
      consistency,
      specialization: this.calculateSpecialization(effectTotals)
    };
  }
  
  private calculateEffectTotals(history: GameHistory): EffectTotals {
    return history.chosenTechnologies.reduce((totals, tech) => {
      totals.military += tech.effects.military;
      totals.cultural += tech.effects.cultural;
      totals.economic += tech.effects.economic;
      totals.social += tech.effects.social;
      totals.exploration += tech.effects.exploration;
      return totals;
    }, { military: 0, cultural: 0, economic: 0, social: 0, exploration: 0 });
  }
}
```

---

## 🔄 Système d'Extensions

### **Architecture modulaire pour DLC**
```typescript
interface GameExtension {
  id: string;
  name: string;
  version: string;
  
  // Contenu additionnel  
  periods?: Period[];
  technologies: Technology[];
  narrativeStyles?: NarrativeStyle[];
  
  // Modifications du jeu de base
  gameplayOverrides?: GameplayConfig;
  balanceAdjustments?: BalanceChange[];
  
  // Métadonnées
  dependencies: string[]; // Extensions requises
  compatibility: string; // Version du jeu de base
}

class ExtensionManager {
  loadExtension(extension: GameExtension): void {
    // Valider la compatibilité
    this.validateCompatibility(extension);
    
    // Merger le contenu
    this.mergeTechnologies(extension.technologies);
    this.mergePeriods(extension.periods);
    
    // Appliquer les modifications
    this.applyGameplayOverrides(extension.gameplayOverrides);
    this.applyBalanceChanges(extension.balanceAdjustments);
    
    // Régénérer les index
    this.rebuildDependencyGraph();
    this.rebuildNarrativeTemplates();
  }
}
```

---

## ⚡ Optimisations Performance

### **Lazy Loading des contenus**
```typescript
class TechnologyLoader {
  private cache = new Map<string, Technology>();
  private narrativeCache = new Map<string, string[]>();
  
  async getTechnology(id: string): Promise<Technology> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    
    const tech = await this.loadTechnology(id);
    this.cache.set(id, tech);
    return tech;
  }
  
  preloadPeriod(period: HistoricalPeriod): Promise<void> {
    const periodTechs = this.getTechsForPeriod(period);
    return Promise.all(periodTechs.map(id => this.getTechnology(id)));
  }
}
```

### **Compression et CDN**
```typescript
// Configuration optimale pour production
const compressionConfig = {
  technologies: {
    format: 'json',
    compression: 'gzip',
    caching: 'aggressive', // 24h cache
    cdn: true
  },
  
  narratives: {
    format: 'json',
    compression: 'brotli',
    caching: 'moderate', // 6h cache
    lazyLoad: true
  }
};
```

---

## 🧪 Testing & Validation

### **Suite de tests automatisés**
```typescript
describe('Technology Database', () => {
  test('all technologies have valid structure', () => {
    technologies.forEach(tech => {
      expect(tech).toHaveProperty('id');
      expect(tech).toHaveProperty('name');
      expect(tech).toHaveProperty('narrative.memoryWord');
      expect(tech.narrative.immediate).toHaveLength.greaterThan(1);
    });
  });
  
  test('dependency graph is valid', () => {
    const validator = new DependencyValidator(technologies);
    expect(validator.hasCircularDependencies()).toBe(false);
    expect(validator.hasOrphanedReferences()).toBe(false);
  });
  
  test('narrative consistency', () => {
    technologies.forEach(tech => {
      const memoryWord = tech.narrative.memoryWord;
      expect(tech.narrative.epochTemplate).toContain(`{memoryWord}`);
      expect(tech.narrative.finalTemplate).toContain(`{memoryWord}`);
    });
  });
  
  test('effect balance', () => {
    technologies.forEach(tech => {
      const totalEffects = Object.values(tech.effects)
        .reduce((sum, effect) => sum + Math.abs(effect), 0);
      expect(totalEffects).toBeLessThanOrEqual(8); // Limite d'équilibrage
    });
  });
});
```

### **Validation en temps réel**
```typescript
class RealtimeValidator {
  validateOnEdit(tech: Technology): ValidationResult {
    const errors: string[] = [];
    
    if (!tech.narrative.memoryWord) {
      errors.push('Missing memory word');
    }
    
    if (tech.narrative.immediate.length < 2) {
      errors.push('Need at least 2 immediate variations');
    }
    
    if (!this.isDateRangeValid(tech)) {
      errors.push('Date range outside period bounds');
    }
    
    return { isValid: errors.length === 0, errors };
  }
}
```

---

## 📊 Analytics & Monitoring

### **Métriques de gameplay**
```typescript
interface GameplayMetrics {
  // Équilibrage
  technologyPickRates: Record<string, number>;
  combinationFrequency: Record<string, number>;
  playerProfileDistribution: Record<string, number>;
  
  // Performance narrative
  immediateReactionRatings: Record<string, number>;
  epochSummaryQuality: Record<string, number>;
  finalChronicleEngagement: Record<string, number>;
  
  // Technique
  loadTimes: Record<string, number>;
  errorRates: Record<string, number>;
  cacheHitRates: Record<string, number>;
}
```

---

## 🚀 Déploiement & Maintenance

### **Pipeline de déploiement**
1. **Validation locale** : Tests unitaires + validation JSON
2. **Staging** : Déploiement sur environnement de test
3. **Tests d'intégration** : Parties complètes automatisées
4. **Review narrative** : Validation manuelle du contenu
5. **Production** : Déploiement avec rollback automatique
6. **Monitoring** : Surveillance des métriques en temps réel

### **Maintenance continue**
- **Backup automatique** des données tous les jours
- **Versioning sémantique** des modifications de contenu
- **Rollback rapide** en cas de problème critique
- **A/B testing** pour les nouvelles technologies
- **Community feedback** intégré dans le cycle de développement

---

**Cette architecture garantit évolutivité, performance et qualité pour Human Memories !** 🌟