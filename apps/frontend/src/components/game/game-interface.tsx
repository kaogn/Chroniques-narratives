'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Clock, Brain, Sword, Book, Coins, Users, Compass, Sparkles, ChevronRight, RotateCcw
} from 'lucide-react';
import type { Technology, GameState } from '@/store/gameStore';
import { useGameStore } from '@/store/gameStore';
import { cn } from '@/lib/utils';

// === CONSTANTES ===

const PERIOD_LABELS: Record<string, string> = {
  prehistoric: 'Préhistoire',
  ancient_early: 'Antiquité Ancienne',
  ancient_classical: 'Antiquité Classique',
  medieval_early: 'Haut Moyen Âge',
  medieval_late: 'Bas Moyen Âge',
  renaissance: 'Renaissance',
  industrial: 'Révolution Industrielle',
  contemporary: 'Époque Contemporaine',
};

const CATEGORY_ICONS = {
  military: Sword,
  cultural: Book,
  economic: Coins,
  social: Users,
  exploration: Compass,
  industrial: Clock,
  scientific: Brain,
};

const RARITY_GRADIENTS: Record<string, string> = {
  pillar: 'from-amber-500 to-amber-600',
  common: 'from-blue-500 to-blue-600',
  uncommon: 'from-green-500 to-green-600',
  rare: 'from-purple-500 to-purple-600',
  epic: 'from-pink-500 to-pink-600',
  legendary: 'from-orange-500 to-orange-600',
};

// === CARTE TECHNOLOGIE ===

interface TechnologyCardProps {
  technology: Technology;
  isDisabled: boolean;
  onPick: (techId: string) => void;
  delay?: number;
}

function TechnologyCard({ technology, isDisabled, onPick, delay = 0 }: TechnologyCardProps) {
  const [isPending, startTransition] = useTransition();
  const Icon = CATEGORY_ICONS[technology.category as keyof typeof CATEGORY_ICONS] ?? Sparkles;

  const handleClick = () => {
    if (isDisabled || isPending) return;
    startTransition(() => { onPick(technology.id); });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.35, delay: delay * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
      layout
    >
      <Card
        className={cn(
          'relative cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-[1.02]',
          'border-2 hover:border-primary/60',
          isDisabled && 'opacity-40 cursor-not-allowed pointer-events-none',
          isPending && 'animate-pulse'
        )}
        onClick={handleClick}
      >
        <div className={cn('absolute top-0 left-0 w-full h-1 rounded-t-lg bg-gradient-to-r', RARITY_GRADIENTS[technology.rarity] ?? RARITY_GRADIENTS.common)} />

        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">{technology.name}</CardTitle>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="capitalize">{technology.rarity}</Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Rareté : {technology.rarity}</p>
                  <p>Période : {PERIOD_LABELS[technology.period] ?? technology.period}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <CardDescription className="text-sm line-clamp-2">{technology.description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {Object.entries(technology.effects).map(([key, value]) => {
              if (value === 0) return null;
              const icons: Record<string, string> = { military: '⚔️', cultural: '📚', economic: '💰', social: '👥', exploration: '🧭' };
              return (
                <div key={key} className="flex items-center gap-1 text-xs">
                  <span>{icons[key]}</span>
                  <span className={cn('font-medium', value > 0 ? 'text-green-600' : 'text-red-600')}>
                    {value > 0 ? '+' : ''}{value}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            <span className="italic">"{technology.narrative.memoryWord}"</span>
          </div>
        </CardContent>

        {/* Indicateur de clic */}
        <div className="absolute inset-0 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-primary/5">
          <span className="text-primary font-semibold text-sm">Choisir →</span>
        </div>
      </Card>
    </motion.div>
  );
}

// === BARRE DE PROGRESSION ===

function GameProgress({ gameState }: { gameState: GameState }) {
  const { turn, totalTurns, epochIndex, totalEpochs, turnWithinEpoch, turnsPerEpoch, currentEpoch } = gameState;
  const globalProgress = ((turn - 1) / totalTurns) * 100;
  const epochLabel = PERIOD_LABELS[currentEpoch] ?? currentEpoch;

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl mx-auto space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Tour {turn} / {totalTurns}</span>
        <Badge variant="secondary">{epochLabel}</Badge>
        <span>Époque {epochIndex + 1} / {totalEpochs}</span>
      </div>
      <Progress value={globalProgress} className="h-2" />
      {turnsPerEpoch > 1 && (
        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: turnsPerEpoch }).map((_, i) => (
            <div key={i} className={cn('w-2 h-2 rounded-full transition-colors', i < turnWithinEpoch ? 'bg-primary' : 'bg-muted')} />
          ))}
        </div>
      )}
      <div className="text-center">
        <p className="text-2xl font-bold text-primary">{epochLabel}</p>
        {turnsPerEpoch > 1 && (
          <p className="text-sm text-muted-foreground">Tour {turnWithinEpoch} sur {turnsPerEpoch} dans cette époque</p>
        )}
      </div>
    </motion.div>
  );
}

// === ÉCRAN RÉSUMÉ D'ÉPOQUE ===

function EpochSummaryScreen({ majorEvent, summary, epochLabel, epochIndex, totalEpochs, isLast, onContinue }: {
  majorEvent: string | null;
  summary: string;
  epochLabel: string;
  epochIndex: number;
  totalEpochs: number;
  isLast: boolean;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/97 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.9, y: 32 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        className="max-w-2xl w-full space-y-6 text-center py-8"
      >
        <div className="space-y-2">
          <Badge variant="outline" className="text-sm">Époque {epochIndex + 1} / {totalEpochs}</Badge>
          <h2 className="text-3xl font-bold">{epochLabel}</h2>
        </div>

        {/* Événement majeur */}
        {majorEvent && (
          <Card className="text-left border-amber-500/30 bg-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Ce qui advint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-base leading-relaxed text-foreground/90">{majorEvent}</p>
            </CardContent>
          </Card>
        )}

        {/* Réflexion d'époque */}
        <Card className="text-left border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Le registre de l'Univers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed italic text-foreground/75">{summary}</p>
          </CardContent>
        </Card>

        <Button onClick={onContinue} size="lg" className="px-10">
          {isLast ? 'Voir la Chronique finale' : 'Époque suivante →'}
        </Button>
      </motion.div>
    </motion.div>
  );
}

// === INTERFACE PRINCIPALE ===

// Phase locale de l'UI (indépendante du store)
type UIPhase = 'picking' | 'epoch-summary';

export function GameInterface() {
  const gameState = useGameStore(state => state.gameState);
  const actions = useGameStore(state => state.actions);
  const technologies = useGameStore(state => state.technologies);
  const finalChronicle = useGameStore(state => state.finalChronicle);
  const isLoading = useGameStore(state => state.isLoading);

  const [phase, setPhase] = useState<UIPhase>('picking');
  const [pendingEpochSummary, setPendingEpochSummary] = useState<string | null>(null);
  const [pendingMajorEvent, setPendingMajorEvent] = useState<string | null>(null);
  const [pendingIsComplete, setPendingIsComplete] = useState(false);

  const handlePick = async (techId: string) => {
    const result = await actions.pickTechnology(techId);
    if (!result.success || !result.data) return;

    const { majorEvent, epochSummary, epochComplete, isComplete } = result.data;
    if (epochComplete) {
      setPendingMajorEvent(majorEvent);
      setPendingEpochSummary(epochSummary);
      setPendingIsComplete(isComplete);
      setPhase('epoch-summary');
    }
    // Si pas fin d'époque : retour direct au picking (gameState mis à jour par le store)
  };

  const handleEpochSummaryContinue = () => {
    setPendingMajorEvent(null);
    setPendingEpochSummary(null);
    setPhase('picking');
  };

  const handleRestart = () => {
    setPhase('picking');
    setPendingMajorEvent(null);
    setPendingEpochSummary(null);
    setPendingIsComplete(false);
    actions.resetGame();
  };

  // === PAS DE PARTIE ===
  if (!gameState) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center gap-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Mémoires Humaines</h1>
          <p className="text-muted-foreground max-w-md">
            À chaque tournant de l'histoire, vous choisissez ce que l'humanité retient. Ce que vous ne choisissez pas disparaît.
          </p>
          <Button onClick={() => actions.createGame()} size="lg" className="text-lg px-10 py-6" disabled={isLoading}>
            {isLoading ? 'Chargement…' : 'Commencer'}
          </Button>
        </motion.div>
      </div>
    );
  }

  // === FIN DE PARTIE ===
  if (gameState.isCompleted && phase === 'picking') {
    return (
      <GameCompletedScreen
        gameState={gameState}
        finalChronicle={finalChronicle}
        onRestart={handleRestart}
      />
    );
  }

  const availableTechs = gameState.availableTechs
    .map(id => technologies.get(id))
    .filter((t): t is Technology => t !== undefined);

  const currentEpochLabel = PERIOD_LABELS[gameState.currentEpoch] ?? gameState.currentEpoch;

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Progression */}
      <GameProgress gameState={gameState} />

      <Separator />

      {/* Grille de choix */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-center text-muted-foreground">
          Que retient l'humanité ?
        </h2>

        <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6" layout>
          <AnimatePresence mode="popLayout">
            {availableTechs.map((tech, i) => (
              <TechnologyCard
                key={tech.id}
                technology={tech}
                isDisabled={isLoading || phase !== 'picking'}
                onPick={handlePick}
                delay={i}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {availableTechs.length === 0 && !isLoading && (
          <p className="text-center text-muted-foreground py-12">
            Aucun choix disponible — la partie touche à sa fin.
          </p>
        )}
      </div>

      {/* Bouton reset discret */}
      <div className="flex justify-center">
        <Button variant="ghost" size="sm" onClick={handleRestart} className="text-muted-foreground">
          <RotateCcw className="w-3 h-3 mr-1" /> Recommencer
        </Button>
      </div>

      <AnimatePresence>
        {phase === 'epoch-summary' && pendingEpochSummary && (
          <EpochSummaryScreen
            key="epoch-summary"
            majorEvent={pendingMajorEvent}
            summary={pendingEpochSummary}
            epochLabel={currentEpochLabel}
            epochIndex={gameState.epochIndex}
            totalEpochs={gameState.totalEpochs}
            isLast={pendingIsComplete}
            onContinue={handleEpochSummaryContinue}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// === ÉCRAN FIN DE PARTIE ===

function GameCompletedScreen({ gameState, finalChronicle, onRestart }: {
  gameState: GameState;
  finalChronicle: string | null;
  onRestart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="container mx-auto px-4 py-8 space-y-8 text-center max-w-3xl"
    >
      <div className="space-y-3">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Chronique Achevée
        </h1>
        <p className="text-lg text-muted-foreground">
          {gameState.pickedPath.length} choix. {gameState.totalEpochs} époques. Une seule mémoire.
        </p>
      </div>

      {finalChronicle && (
        <Card className="text-left border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" /> Votre Chronique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line italic leading-relaxed text-foreground/90">
              {finalChronicle}
            </p>
          </CardContent>
        </Card>
      )}

      {gameState.playerProfile && (
        <Card className="text-left">
          <CardHeader><CardTitle>Profil de votre civilisation</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge className="text-sm">{gameState.playerProfile.evolutionaryPath?.name}</Badge>
              <span className="text-muted-foreground text-sm">{gameState.playerProfile.evolutionaryPath?.description}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              {Object.entries(gameState.playerProfile.traits ?? {}).map(([trait, value]) => (
                <div key={trait} className="text-center">
                  <div className="font-bold text-lg">{value as number}%</div>
                  <div className="text-muted-foreground capitalize">{trait}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-center gap-4">
        <Button onClick={onRestart} size="lg">Nouvelle Mémoire</Button>
      </div>
    </motion.div>
  );
}

export default GameInterface;
