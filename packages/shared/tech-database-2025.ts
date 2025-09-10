// packages/game-engine/src/data/TechDatabase.ts
// Human Memories - Technology Database avec patterns 2025

import { z } from 'zod';
import type { 
  Technology, 
  HistoricalPeriod, 
  TechCategory,
  Result 
} from '@shared/types/game';

// Cache strategy avec Map moderne
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  
  constructor(private maxSize: number = 100) {}
  
  get(key: K): V | undefined {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)!;
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }
  
  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove oldest (first) item
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// Dependency Graph avec algorithmes modernes
class DependencyGraph {
  private graph = new Map<string, Set<string>>();
  private reverseGraph = new Map<string, Set<string>>();
  
  addDependency(tech: string, prerequisite: string): void {
    if (!this.graph.has(tech)) {
      this.graph.set(tech, new Set());
    }
    this.graph.get(tech)!.add(prerequisite);
    
    if (!this.reverseGraph.has(prerequisite)) {
      this.reverseGraph.set(prerequisite, new Set());
    }
    this.reverseGraph.get(prerequisite)!.add(tech);
  }
  
  getPrerequisites(tech: string): Set<string> {
    return this.graph.get(tech) ?? new Set();
  }
  
  getEnabledTechs(tech: string): Set<string> {
    return this.reverseGraph.get(tech) ?? new Set();
  }
  
  hasCircularDependency(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const dfs = (node: string): boolean => {
      if (recursionStack.has(node)) return true;
      if (visited.has(node)) return false;
      
      visited.add(node);
      recursionStack.add(node);
      
      const prerequisites = this.graph.get(node) ?? new Set();
      for (const prereq of prerequisites) {
        if (dfs(prereq)) return true;
      }
      
      recursionStack.delete(node);
      return false;
    };
    
    for (const node of this.graph.keys()) {
      if (!visited.has(node) && dfs(node)) {
        return true;
      }
    }
    
    return false;
  }
  
  topologicalSort(): string[] {
    const inDegree = new Map<string, number>();
    const result: string[] = [];
    const queue: string[] = [];
    
    // Calculate in-degrees
    for (const [tech, prereqs] of this.graph) {
      inDegree.set(tech, prereqs.size);
      for (const prereq of prereqs) {
        if (!inDegree.has(prereq)) {
          inDegree.set(prereq, 0);
        }
      }
    }
    
    // Find nodes with no dependencies
    for (const [tech, degree] of inDegree) {
      if (degree === 0) {
        queue.push(tech);
      }
    }
    
    // Process queue
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);
      
      const enabledTechs = this.getEnabledTechs(current);
      for (const enabled of enabledTechs) {
        const currentDegree = inDegree.get(enabled)! - 1;
        inDegree.set(enabled, currentDegree);
        
        if (currentDegree === 0) {
          queue.push(enabled);
        }
      }
    }
    
    return result;
  }
}

// Modern TechDatabase implementation
export class TechDatabaseImpl implements TechDatabase {
  private technologies = new Map<string, Technology>();
  private periodIndex = new Map<HistoricalPeriod, Set<string>>();
  private categoryIndex = new Map<TechCategory, Set<string>>();
  private dependencyGraph = new DependencyGraph();
  private cache = new LRUCache<string, Technology[]>(50);
  
  private constructor(
    private readonly dataSource: TechDataSource
  ) {}
  
  static async create(dataSourceUrl?: string): Promise<TechDatabaseImpl> {
    const dataSource = dataSourceUrl 
      ? new RemoteTechDataSource(dataSourceUrl)
      : new LocalTechDataSource();
      
    const instance = new TechDatabaseImpl(dataSource);
    await instance.initialize();
    return instance;
  }
  
  private async initialize(): Promise<void> {
    const technologies = await this.dataSource.loadTechnologies();
    
    for (const tech of technologies) {
      this.addTechnology(tech);
    }
    
    // Validate dependencies after loading all technologies
    const validationResult = await this.validateDependencies();
    if (!validationResult.success) {
      throw new Error(`Dependency validation failed: ${validationResult.error.message}`);
    }
  }
  
  private addTechnology(tech: Technology): void {
    this.technologies.set(tech.id, tech);
    
    // Update period index
    if (!this.periodIndex.has(tech.period)) {
      this.periodIndex.set(tech.period, new Set());
    }
    this.periodIndex.get(tech.period)!.add(tech.id);
    
    // Update category index
    if (!this.categoryIndex.has(tech.category)) {
      this.categoryIndex.set(tech.category, new Set());
    }
    this.categoryIndex.get(tech.category)!.add(tech.id);
    
    // Update dependency graph
    for (const prereq of tech.dependencies.prerequisites) {
      this.dependencyGraph.addDependency(tech.id, prereq);
    }
  }
  
  async getTechnologiesByPeriod(period: HistoricalPeriod): Promise<Technology[]> {
    const cacheKey = `period:${period}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;
    
    const techIds = this.periodIndex.get(period) ?? new Set();
    const technologies = Array.from(techIds)
      .map(id => this.technologies.get(id)!)
      .filter(Boolean);
    
    this.cache.set(cacheKey, technologies);
    return technologies;
  }
  
  async getTechnologyById(id: string): Promise<Technology | null> {
    return this.technologies.get(id) ?? null;
  }
  
  async getTechnologiesByCategory(category: TechCategory): Promise<Technology[]> {
    const cacheKey = `category:${category}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;
    
    const techIds = this.categoryIndex.get(category) ?? new Set();
    const technologies = Array.from(techIds)
      .map(id => this.technologies.get(id)!)
      .filter(Boolean);
    
    this.cache.set(cacheKey, technologies);
    return technologies;
  }
  
  canTechAppear(techId: string, preservedTechs: readonly string[]): boolean {
    const tech = this.technologies.get(techId);
    if (!tech) return false;
    
    const preservedSet = new Set(preservedTechs);
    
    // Check prerequisites
    for (const prereq of tech.dependencies.prerequisites) {
      if (!preservedSet.has(prereq)) {
        return false;
      }
    }
    
    // Check if blocked by any preserved tech
    for (const preservedTech of preservedTechs) {
      const preservedTechnology = this.technologies.get(preservedTech);
      if (preservedTechnology?.dependencies.blocks.includes(techId)) {
        return false;
      }
    }
    
    return true;
  }
  
  getAvailableTechnologies(
    period: HistoricalPeriod,
    preservedTechs: readonly string[]
  ): Technology[] {
    const periodTechs = this.periodIndex.get(period) ?? new Set();
    
    return Array.from(periodTechs)
      .filter(techId => this.canTechAppear(techId, preservedTechs))
      .map(id => this.technologies.get(id)!)
      .filter(Boolean);
  }
  
  findSynergies(preservedTechs: readonly string[]): Array<{
    techs: readonly string[];
    effect: string;
    description: string;
  }> {
    const synergies: Array<{
      techs: readonly string[];
      effect: string;
      description: string;
    }> = [];
    
    const preservedSet = new Set(preservedTechs);
    
    for (const techId of preservedTechs) {
      const tech = this.technologies.get(techId);
      if (!tech) continue;
      
      for (const synergy of tech.dependencies.synergies) {
        const hasAllSynergyTechs = synergy.with.every(synergyTech => 
          preservedSet.has(synergyTech)
        );
        
        if (hasAllSynergyTechs) {
          synergies.push({
            techs: [techId, ...synergy.with],
            effect: synergy.effect,
            description: synergy.description
          });
        }
      }
    }
    
    return synergies;
  }
  
  async validateDependencies(): Promise<Result<void>> {
    const errors: string[] = [];
    
    // Check for circular dependencies
    if (this.dependencyGraph.hasCircularDependency()) {
      errors.push('Circular dependencies detected');
    }
    
    // Check for missing technology references
    for (const [techId, tech] of this.technologies) {
      // Validate prerequisites
      for (const prereq of tech.dependencies.prerequisites) {
        if (!this.technologies.has(prereq)) {
          errors.push(`Technology ${techId} references unknown prerequisite: ${prereq}`);
        }
      }
      
      // Validate enabled technologies
      for (const enabled of tech.dependencies.enables) {
        if (!this.technologies.has(enabled)) {
          errors.push(`Technology ${techId} references unknown enabled tech: ${enabled}`);
        }
      }
      
      // Validate blocked technologies
      for (const blocked of tech.dependencies.blocks) {
        if (!this.technologies.has(blocked)) {
          errors.push(`Technology ${techId} references unknown blocked tech: ${blocked}`);
        }
      }
      
      // Validate synergy technologies
      for (const synergy of tech.dependencies.synergies) {
        for (const synergyTech of synergy.with) {
          if (!this.technologies.has(synergyTech)) {
            errors.push(`Technology ${techId} references unknown synergy tech: ${synergyTech}`);
          }
        }
      }
    }
    
    // Validate date ranges within periods
    for (const [techId, tech] of this.technologies) {
      // This would require period date ranges from configuration
      // Implementation depends on how periods are defined
    }
    
    if (errors.length > 0) {
      return {
        success: false,
        error: new Error(errors.join('; '))
      };
    }
    
    return { success: true, data: undefined };
  }
  
  getDependencyPath(fromTech: string, toTech: string): string[] | null {
    const visited = new Set<string>();
    const path: string[] = [];
    
    const dfs = (current: string, target: string): boolean => {
      if (current === target) {
        path.push(current);
        return true;
      }
      
      if (visited.has(current)) return false;
      visited.add(current);
      path.push(current);
      
      const enabledTechs = this.dependencyGraph.getEnabledTechs(current);
      for (const enabled of enabledTechs) {
        if (dfs(enabled, target)) {
          return true;
        }
      }
      
      path.pop();
      return false;
    };
    
    return dfs(fromTech, toTech) ? [...path] : null;
  }
  
  getStats(): {
    totalTechnologies: number;
    technologiesByPeriod: Record<HistoricalPeriod, number>;
    technologiesByCategory: Record<TechCategory, number>;
  } {
    const technologiesByPeriod = {} as Record<HistoricalPeriod, number>;
    const technologiesByCategory = {} as Record<TechCategory, number>;
    
    for (const [period, techSet] of this.periodIndex) {
      technologiesByPeriod[period] = techSet.size;
    }
    
    for (const [category, techSet] of this.categoryIndex) {
      technologiesByCategory[category] = techSet.size;
    }
    
    return {
      totalTechnologies: this.technologies.size,
      technologiesByPeriod,
      technologiesByCategory
    };
  }
  
  clearCache(): void {
    this.cache.clear();
  }
}

// Data Source abstraction
interface TechDataSource {
  loadTechnologies(): Promise<Technology[]>;
}

class LocalTechDataSource implements TechDataSource {
  async loadTechnologies(): Promise<Technology[]> {
    // Load from local JSON file or embedded data
    const response = await fetch('/data/technologies.json');
    const data = await response.json();
    
    // Validate with Zod schema
    const TechnologiesSchema = z.array(TechnologySchema);
    const validatedData = TechnologiesSchema.parse(data.technologies);
    
    return validatedData;
  }
}

class RemoteTechDataSource implements TechDataSource {
  constructor(private readonly apiUrl: string) {}
  
  async loadTechnologies(): Promise<Technology[]> {
    const response = await fetch(`${this.apiUrl}/technologies`);
    if (!response.ok) {
      throw new Error(`Failed to load technologies: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Validate with Zod schema
    const TechnologiesSchema = z.array(TechnologySchema);
    const validatedData = TechnologiesSchema.parse(data);
    
    return validatedData;
  }
}

// Mock data source for testing
export class MockTechDataSource implements TechDataSource {
  constructor(private readonly mockData: Technology[]) {}
  
  async loadTechnologies(): Promise<Technology[]> {
    return [...this.mockData];
  }
}

// Re-export interface for dependency injection
export interface TechDatabase {
  getTechnologiesByPeriod(period: HistoricalPeriod): Promise<Technology[]>;
  getTechnologyById(id: string): Promise<Technology | null>;
  getTechnologiesByCategory(category: TechCategory): Promise<Technology[]>;
  canTechAppear(techId: string, preservedTechs: readonly string[]): boolean;
  getAvailableTechnologies(period: HistoricalPeriod, preservedTechs: readonly string[]): Technology[];
  findSynergies(preservedTechs: readonly string[]): Array<{
    techs: readonly string[];
    effect: string;
    description: string;
  }>;
  validateDependencies(): Promise<Result<void>>;
  getDependencyPath(fromTech: string, toTech: string): string[] | null;
  clearCache(): void;
}

// Import TechnologySchema (would be from shared types)
const TechnologySchema = z.object({
  id: z.string(),
  name: z.string(),
  period: z.string(),
  category: z.string(),
  rarity: z.enum(['pillar', 'common', 'uncommon', 'rare', 'legendary']),
  // ... autres champs selon les types définis
});