// packages/ui/src/components/ui/*.tsx
// Human Memories - Composants shadcn/ui customisés 2025

// === COMPOSANTS DE BASE SHADCN/UI ===

// components/ui/card.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-xl border bg-card text-card-foreground shadow-sm transition-all',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

export { Card, CardHeader, CardTitle, CardDescription, CardContent };

// === COMPOSANTS SPÉCIALISÉS HUMAN MEMORIES ===

// components/game/TechnologyCard.tsx
'use client';

import * as React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Clock, Brain, Sword, Book, Coins, Users, Compass, 
  Sparkles, ChevronRight, Info, Zap
} from 'lucide-react';
import type { Technology, TechCategory } from '@shared/types/game';
import { cn } from '@/lib/utils';

// Variants d'animation Framer Motion
const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  selected: {
    scale: 1.02,
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30
    }
  },
  hover: {
    y: -2,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30
    }
  }
};

const selectionIndicatorVariants: Variants = {
  hidden: { scale: 0, rotate: -180 },
  visible: { 
    scale: 1, 
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25
    }
  }
};

interface TechnologyCardProps {
  technology: Technology;
  isSelected?: boolean;
  isDisabled?: boolean;
  showEffects?: boolean;
  showDependencies?: boolean;
  onSelect?: (techId: string) => void;
  onInfo?: (techId: string) => void;
  className?: string;
}

export function TechnologyCard({
  technology,
  isSelected = false,
  isDisabled = false,
  showEffects = true,
  showDependencies = false,
  onSelect,
  onInfo,
  className
}: TechnologyCardProps) {
  const categoryIcons: Record<TechCategory, React.ComponentType<{ className?: string }>> = {
    military: Sword,
    cultural: Book,
    economic: Coins,
    social: Users,
    exploration: Compass,
    industrial: Clock,
    scientific: Brain
  };
  
  const rarityConfig = {
    pillar: { 
      gradient: 'from-amber-500 to-amber-600',
      glow: 'shadow-amber-500/20',
      badge: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    common: { 
      gradient: 'from-blue-500 to-blue-600',
      glow: 'shadow-blue-500/20',
      badge: 'bg-blue-100 text-blue-800 border-blue-200'
    },
    uncommon: { 
      gradient: 'from-green-500 to-green-600',
      glow: 'shadow-green-500/20',
      badge: 'bg-green-100 text-green-800 border-green-200'
    },
    rare: { 
      gradient: 'from-purple-500 to-purple-600',
      glow: 'shadow-purple-500/20',
      badge: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    legendary: { 
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      glow: 'shadow-orange-500/30',
      badge: 'bg-gradient-to-r from-orange-100 to-pink-100 text-orange-800 border-orange-200'
    }
  };
  
  const CategoryIcon = categoryIcons[technology.category];
  const rarity = rarityConfig[technology.rarity];
  
  const handleClick = () => {
    if (!isDisabled && onSelect) {
      onSelect(technology.id);
    }
  };
  
  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInfo) {
      onInfo(technology.id);
    }
  };
  
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate={isSelected ? 'selected' : 'visible'}
      whileHover={!isDisabled ? 'hover' : undefined}
      className={cn('relative', className)}
    >
      <Card 
        className={cn(
          'relative cursor-pointer transition-all duration-300 overflow-hidden',
          'border-2 hover:border-primary/50 group',
          isSelected && cn('border-primary ring-2 ring-primary/20', rarity.glow),
          isDisabled && 'opacity-60 cursor-not-allowed grayscale',
          !isDisabled && 'hover:shadow-lg'
        )}
        onClick={handleClick}
      >
        {/* Rarity gradient bar */}
        <div 
          className={cn(
            'absolute top-0 left-0 w-full h-1.5 z-10',
            `bg-gradient-to-r ${rarity.gradient}`
          )}
        />
        
        {/* Glow effect pour legendary */}
        {technology.rarity === 'legendary' && (
          <div 
            className={cn(
              'absolute inset-0 bg-gradient-to-r opacity-5 pointer-events-none',
              rarity.gradient
            )}
          />
        )}
        
        <CardHeader className="pb-3 relative z-20">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={cn(
                'flex-shrink-0 p-2 rounded-lg transition-colors',
                'bg-muted group-hover:bg-primary/10'
              )}>
                <CategoryIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg leading-tight line-clamp-2">
                  {technology.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs capitalize', rarity.badge)}
                  >
                    {technology.rarity}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {technology.period.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Info button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 shrink-0"
                    onClick={handleInfoClick}
                  >
                    <Info className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>Voir les détails</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <CardDescription className="text-sm leading-relaxed line-clamp-3 mt-2">
            {technology.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Effects */}
          {showEffects && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Effets
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(technology.effects).map(([key, value]) => {
                  if (value === 0) return null;
                  
                  const effectConfig = {
                    military: { icon: '⚔️', label: 'Militaire' },
                    cultural: { icon: '📚', label: 'Culturel' },
                    economic: { icon: '💰', label: 'Économique' },
                    social: { icon: '👥', label: 'Social' },
                    exploration: { icon: '🧭', label: 'Exploration' }
                  };
                  
                  const effect = effectConfig[key as keyof typeof effectConfig];
                  if (!effect) return null;
                  
                  return (
                    <div 
                      key={key} 
                      className={cn(
                        'flex items-center gap-2 px-2 py-1 rounded-md text-xs',
                        'bg-muted/50 border transition-colors',
                        value > 0 ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      )}
                    >
                      <span className="text-sm">{effect.icon}</span>
                      <span className="flex-1 font-medium">{effect.label}</span>
                      <span className={cn(
                        'font-bold',
                        value > 0 ? 'text-green-700' : 'text-red-700'
                      )}>
                        {value > 0 ? '+' : ''}{value}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Dependencies */}
          {showDependencies && technology.dependencies.prerequisites.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Prérequis
              </h4>
              <div className="flex flex-wrap gap-1">
                {technology.dependencies.prerequisites.map(prereq => (
                  <Badge key={prereq} variant="outline" className="text-xs">
                    {prereq}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Memory word */}
          <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Mot-mémoire:
            </span>
            <span className="text-sm italic font-semibold">
              "{technology.narrative.memoryWord}"
            </span>
          </div>
        </CardContent>
        
        {/* Selection indicator */}
        <motion.div
          variants={selectionIndicatorVariants}
          initial="hidden"
          animate={isSelected ? 'visible' : 'hidden'}
          className="absolute top-4 right-4 z-30"
        >
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full shadow-lg">
            <ChevronRight className="w-5 h-5 text-primary-foreground" />
          </div>
        </motion.div>
        
        {/* Disabled overlay */}
        {isDisabled && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-40 flex items-center justify-center">
            <Badge variant="secondary" className="text-xs">
              Non disponible
            </Badge>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

// === COMPOSANT GRILLE DE TECHNOLOGIES ===

interface TechnologyGridProps {
  technologies: Technology[];
  selectedTechs: Set<string>;
  maxSelections: number;
  onTechSelect: (techId: string) => void;
  onTechInfo: (techId: string) => void;
  className?: string;
}

export function TechnologyGrid({
  technologies,
  selectedTechs,
  maxSelections,
  onTechSelect,
  onTechInfo,
  className
}: TechnologyGridProps) {
  return (
    <motion.div 
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6',
        className
      )}
      layout
    >
      {technologies.map((tech, index) => (
        <motion.div
          key={tech.id}
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            delay: index * 0.1,
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
        >
          <TechnologyCard
            technology={tech}
            isSelected={selectedTechs.has(tech.id)}
            isDisabled={selectedTechs.size >= maxSelections && !selectedTechs.has(tech.id)}
            onSelect={onTechSelect}
            onInfo={onTechInfo}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

// === COMPOSANT HISTORIQUE DES TECHNOLOGIES ===

interface TechHistoryProps {
  preservedTechs: string[];
  technologies: Map<string, Technology>;
  className?: string;
}

export function TechHistory({ preservedTechs, technologies, className }: TechHistoryProps) {
  const groupedByPeriod = preservedTechs.reduce((acc, techId) => {
    const tech = technologies.get(techId);
    if (!tech) return acc;
    
    if (!acc[tech.period]) {
      acc[tech.period] = [];
    }
    acc[tech.period].push(tech);
    return acc;
  }, {} as Record<string, Technology[]>);
  
  const periodOrder: HistoricalPeriod[] = [
    'prehistoric', 'ancient_early', 'ancient_classical',
    'medieval_early', 'medieval_late', 'renaissance', 
    'industrial', 'contemporary'
  ];
  
  const periodLabels = {
    prehistoric: 'Préhistoire',
    ancient_early: 'Antiquité Ancienne',
    ancient_classical: 'Antiquité Classique',
    medieval_early: 'Haut Moyen Âge',
    medieval_late: 'Bas Moyen Âge',
    renaissance: 'Renaissance',
    industrial: 'Révolution Industrielle',
    contemporary: 'Époque Contemporaine'
  };
  
  return (
    <div className={cn('space-y-6', className)}>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Technologies Préservées
      </h3>
      
      <div className="space-y-4">
        {periodOrder.map(period => {
          const techs = groupedByPeriod[period];
          if (!techs || techs.length === 0) return null;
          
          return (
            <motion.div
              key={period}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="border-l-2 border-primary/20 pl-4"
            >
              <h4 className="font-medium text-primary mb-2">
                {periodLabels[period]}
              </h4>
              <div className="space-y-2">
                {techs.map(tech => (
                  <motion.div
                    key={tech.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/30"
                  >
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="font-medium">{tech.name}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {tech.narrative.memoryWord}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {preservedTechs.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune technologie préservée pour le moment...</p>
        </div>
      )}
    </div>
  );
}

export type { TechnologyCardProps, TechnologyGridProps, TechHistoryProps };