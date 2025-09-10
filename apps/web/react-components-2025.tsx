// apps/web/components/game/GameInterface.tsx
// Human Memories - Interface utilisateur moderne 2025

'use client';

import { useState, useTransition, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Clock, 
  Brain, 
  Sword, 
  Book, 
  Coins, 
  Users, 
  Compass,
  Sparkles,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import type { Technology, GameState, HistoricalPeriod } from '@shared/types/game';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';

// === TYPES POUR L'UI ===

interface TechnologyCardProps {
  technology: Technology;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (techId: string) => void;
  delay?: number;
}

interface GameProgressProps {
  currentTurn: number;
  totalTurns: number;
  currentPeriod: HistoricalPeriod;
}

interface NarrativeDisplayProps {
  narratives: readonly string[];
  isVisible: boolean;
}

// === COMPOSANTS UI MODERNES ===

// Carte technologie avec animations Framer Motion
function TechnologyCard({ 
  technology, 
  isSelected, 
  isDisabled, 
  onSelect,
  delay = 0 
}: TechnologyCardProps) {
  const [isPending, startTransition] = useTransition();
  
  const categoryIcons = {
    military: Sword,
    cultural: Book, 
    economic: Coins,
    social: Users,
    exploration: Compass,
    industrial: Clock,
    scientific: Brain
  };
  
  const CategoryIcon = categoryIcons[technology.category];
  
  const rarityColors = {
    pillar: 'from-amber-500 to-amber-600',
    common: 'from-blue-500 to-blue-600', 
    uncommon: 'from-green-500 to-green-600',
    rare: 'from-purple-500 to-purple-600',
    legendary: 'from-orange-500 to-orange-600'
  };
  
  const handleSelect = () => {
    if (isDisabled || isPending) return;
    
    startTransition(() => {
      onSelect(technology.id);
    });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.3,
        delay: delay * 0.1,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      layout
    >
      <Card 
        className={cn(
          'relative cursor-pointer transition-all duration-200 hover:shadow-lg',
          'border-2 hover:border-primary/50',
          isSelected && 'border-primary shadow-md ring-2 ring-primary/20',
          isDisabled && 'opacity-50 cursor-not-allowed',
          isPending && 'animate-pulse'
        )}
        onClick={handleSelect}
      >
        {/* Rarity indicator */}
        <div 
          className={cn(
            'absolute top-0 left-0 w-full h-1 rounded-t-lg',
            `bg-gradient-to-r ${rarityColors[technology.rarity]}`
          )}
        />
        
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CategoryIcon className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">{technology.name}</CardTitle>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="capitalize">
                    {technology.rarity}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rareté: {technology.rarity}</p>
                  <p>Période: {technology.period}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <CardDescription className="text-sm line-clamp-2">
            {technology.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Effects visualization */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.entries(technology.effects).map(([key, value]) => {
              if (value === 0) return null;
              
              const effectIcons = {
                military: '⚔️',
                cultural: '📚', 
                economic: '💰',
                social: '👥',
                exploration: '🧭'
              };
              
              return (
                <div key={key} className="flex items-center gap-1 text-xs">
                  <span>{effectIcons[key as keyof typeof effectIcons]}</span>
                  <span className={cn(
                    'font-medium',
                    value > 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {value > 0 ? '+' : ''}{value}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* Memory word hint */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            <span className="italic">"{technology.narrative.memoryWord}"</span>
          </div>
        </CardContent>
        
        {/* Selection indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4 text-primary-foreground" />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

// Composant de progression du jeu
function GameProgress({ currentTurn, totalTurns, currentPeriod }: GameProgressProps) {
  const progress = (currentTurn / totalTurns) * 100;
  
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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">
          Tour {currentTurn} / {totalTurns}
        </span>
        <Badge variant="secondary" className="text-xs">
          {periodLabels[currentPeriod]}
        </Badge>
      </div>
      
      <Progress value={progress} className="h-2 mb-4" />
      
      <div className="text-center">
        <p className="text-2xl font-bold text-primary">
          {periodLabels[currentPeriod]}
        </p>
        <p className="text-sm text-muted-foreground">
          Choisissez les technologies à préserver
        </p>
      </div>
    </motion.div>
  );
}

// Affichage des narratives avec animations
function NarrativeDisplay({ narratives, isVisible }: NarrativeDisplayProps) {
  return (
    <AnimatePresence>
      {isVisible && narratives.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="w-5 h-5" />
                Échos de la Mémoire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {narratives.map((narrative, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="relative"
                  >
                    <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                    <p className="pl-4 text-sm leading-relaxed italic font-medium text-foreground/90">
                      "{narrative}"
                    </p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Composant principal du jeu
export function GameInterface() {
  const { gameState, actions } = useGameStore();
  const [selectedTechs, setSelectedTechs] = useState<Set<string>>(new Set());
  const [showNarratives, setShowNarratives] = useState(false);
  const [lastNarratives, setLastNarratives] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  
  const handleTechSelect = (techId: string) => {
    setSelectedTechs(prev => {
      const newSelected = new Set(prev);
      
      if (newSelected.has(techId)) {
        newSelected.delete(techId);
      } else if (newSelected.size < 2) { // Max 2 selections
        newSelected.add(techId);
      }
      
      return newSelected;
    });
  };
  
  const handleConfirmSelection = () => {
    if (selectedTechs.size === 0 || selectedTechs.size > 2) return;
    
    startTransition(async () => {
      const selectedArray = Array.from(selectedTechs);
      
      // Call game engine to preserve technologies
      const result = await actions.preserveTechnologies(selectedArray);
      
      if (result.success) {
        setLastNarratives(result.narratives);
        setShowNarratives(true);
        setSelectedTechs(new Set());
        
        // Auto-hide narratives after 5 seconds
        setTimeout(() => {
          setShowNarratives(false);
        }, 5000);
      }
    });
  };
  
  const handleRestart = () => {
    setSelectedTechs(new Set());
    setShowNarratives(false);
    setLastNarratives([]);
    actions.resetGame();
  };
  
  if (!gameState) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Button 
            onClick={() => actions.createGame()}
            size="lg"
            className="text-lg px-8 py-4"
          >
            Commencer une Nouvelle Partie
          </Button>
        </motion.div>
      </div>
    );
  }
  
  if (gameState.isCompleted) {
    return <GameCompletedScreen gameState={gameState} onRestart={handleRestart} />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header avec progression */}
      <GameProgress 
        currentTurn={gameState.currentTurn}
        totalTurns={8}
        currentPeriod={gameState.currentPeriod}
      />
      
      <Separator />
      
      {/* Affichage des narratives */}
      <NarrativeDisplay 
        narratives={lastNarratives}
        isVisible={showNarratives}
      />
      
      {/* Technologies disponibles */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">
          Technologies Découvertes
        </h2>
        
        <Suspense fallback={<TechnologyGridSkeleton />}>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            <AnimatePresence mode="popLayout">
              {gameState.availableTechs.map((techId, index) => (
                <TechnologyCard
                  key={techId}
                  technology={/* Get from context or prop */}
                  isSelected={selectedTechs.has(techId)}
                  isDisabled={selectedTechs.size >= 2 && !selectedTechs.has(techId)}
                  onSelect={handleTechSelect}
                  delay={index}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        </Suspense>
      </div>
      
      {/* Actions */}
      <motion.div 
        className="flex justify-center gap-4 pt-8"
        layout
      >
        <Button
          variant="outline"
          onClick={handleRestart}
          disabled={isPending}
          className="min-w-32"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Recommencer
        </Button>
        
        <Button
          onClick={handleConfirmSelection}
          disabled={selectedTechs.size === 0 || selectedTechs.size > 2 || isPending}
          size="lg"
          className="min-w-48 relative"
        >
          {isPending && (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="absolute left-4"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          )}
          
          Préserver {selectedTechs.size > 0 && `(${selectedTechs.size}/2)`}
          
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
      
      {/* Selection counter */}
      <div className="text-center text-sm text-muted-foreground">
        {selectedTechs.size === 0 && "Sélectionnez 1 ou 2 technologies à préserver"}
        {selectedTechs.size === 1 && "Vous pouvez sélectionner 1 technologie de plus"}
        {selectedTechs.size === 2 && "Maximum atteint - Confirmez votre choix"}
      </div>
    </div>
  );
}

// Skeleton loading component
function TechnologyGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Screen de fin de partie
interface GameCompletedScreenProps {
  gameState: GameState;
  onRestart: () => void;
}

function GameCompletedScreen({ gameState, onRestart }: GameCompletedScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto px-4 py-8 text-center space-y-8"
    >
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Chronique Achevée
        </h1>
        <p className="text-xl text-muted-foreground">
          Votre mémoire a façonné {gameState.preservedTechs.length} technologies à travers l'histoire
        </p>
      </div>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Votre Profil de Mémoire</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {gameState.playerProfile && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Focus principal:</span>
                <Badge className="ml-2">{gameState.playerProfile.primaryFocus}</Badge>
              </div>
              <div>
                <span className="font-medium">Tolérance au risque:</span>
                <Badge variant="outline" className="ml-2">
                  {gameState.playerProfile.riskTolerance}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex justify-center gap-4">
        <Button onClick={onRestart} size="lg">
          Nouvelle Mémoire
        </Button>
        <Button variant="outline" size="lg">
          Partager ma Chronique
        </Button>
      </div>
    </motion.div>
  );
}

export default GameInterface;