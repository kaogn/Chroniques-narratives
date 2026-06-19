'use client';

import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sword, Book, Coins, Users, Compass, Clock, Brain,
  Sparkles, ChevronRight, RotateCcw, Play, ScrollText,
} from 'lucide-react';
import type { Technology, GameState } from '@/store/gameStore';
import { useGameStore } from '@/store/gameStore';

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
  military: Sword, cultural: Book, economic: Coins,
  social: Users, exploration: Compass, industrial: Clock, scientific: Brain,
};

const CATEGORY_COLORS: Record<string, string> = {
  military: 'var(--cat-military)', cultural: 'var(--cat-cultural)', economic: 'var(--cat-economic)',
  social: 'var(--cat-social)', exploration: 'var(--cat-exploration)',
  industrial: 'var(--cat-industrial)', scientific: 'var(--cat-scientific)',
};

const RARITY_COLORS: Record<string, string> = {
  common: 'var(--rarity-common)', rare: 'var(--rarity-rare)',
  pillar: 'var(--rarity-pillar)', legendary: 'var(--rarity-legendary)',
  uncommon: 'var(--rarity-rare)', epic: 'var(--rarity-pillar)',
};

// === COMPOSANTS PARTAGÉS ===

function Brandmark({ size = 40 }: { size?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: size, height: size, borderRadius: 'var(--radius-full)',
        display: 'grid', placeItems: 'center', flexShrink: 0,
        background: 'var(--grad-memory)', boxShadow: 'var(--glow-memory)',
        color: '#fff', fontWeight: 700, fontSize: size * 0.36,
        fontFamily: 'var(--font-sans)',
      }}>MH</div>
      <span className="mh-grad-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22 }}>
        Mémoires Humaines
      </span>
    </div>
  );
}

function GradientButton({
  onClick, disabled, children, style,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: disabled ? 'var(--surface-2)' : 'var(--grad-memory)',
        color: '#fff', fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--weight-semibold)', fontSize: 'var(--text-base)',
        border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        borderRadius: 'var(--radius-full)', padding: '14px 28px',
        boxShadow: disabled ? 'none' : 'var(--glow-memory-soft)',
        opacity: disabled ? 0.6 : 1,
        transition: `opacity var(--dur-fast)`,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// === CARTE TECHNOLOGIE ===

interface TechnologyCardProps {
  technology: Technology;
  isDisabled: boolean;
  onPick: (techId: string) => void;
  delay?: number;
}

function TechnologyCard({ technology, isDisabled, onPick, delay = 0 }: TechnologyCardProps) {
  const [hover, setHover] = useState(false);
  const [isPending, startTransition] = useTransition();

  const Icon = CATEGORY_ICONS[technology.category as keyof typeof CATEGORY_ICONS] ?? Sparkles;
  const catColor = CATEGORY_COLORS[technology.category] ?? 'var(--cat-scientific)';
  const rarityColor = RARITY_COLORS[technology.rarity] ?? 'var(--rarity-common)';

  const handleClick = () => {
    if (isDisabled || isPending) return;
    startTransition(() => { onPick(technology.id); });
  };

  const nonZeroEffects = Object.entries(technology.effects).filter(([, v]) => v !== 0);
  const effectIcons: Record<string, string> = {
    military: '⚔️', cultural: '📚', economic: '💰', social: '👥', exploration: '🧭',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.35, delay: delay * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
      layout
    >
      <div
        onMouseEnter={() => !isDisabled && setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={handleClick}
        style={{
          position: 'relative',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--glass-2)',
          backdropFilter: 'blur(var(--blur-md))',
          WebkitBackdropFilter: 'blur(var(--blur-md))',
          border: `2px solid ${hover && !isDisabled ? 'var(--border-memory-strong)' : 'var(--border-memory)'}`,
          borderRadius: 'var(--radius-lg)',
          boxShadow: hover && !isDisabled ? 'var(--shadow-card-hover)' : 'var(--shadow-card)',
          cursor: isDisabled ? 'not-allowed' : isPending ? 'wait' : 'pointer',
          opacity: isDisabled ? 0.45 : 1,
          transform: hover && !isDisabled && !isPending ? 'translateY(-5px) scale(1.02)' : 'none',
          transition: 'transform var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)',
        }}
      >
        {/* Rarity accent line */}
        <div style={{
          height: 4, flexShrink: 0,
          background: `linear-gradient(90deg, ${rarityColor}, color-mix(in srgb, ${rarityColor} 40%, transparent))`,
        }} />

        <div style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Header : icon tile + rarity badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 'var(--radius-md)',
              display: 'grid', placeItems: 'center', color: '#fff', flexShrink: 0,
              background: `linear-gradient(135deg, ${catColor}, color-mix(in srgb, ${catColor} 55%, #000))`,
            }}>
              <Icon size={18} />
            </div>
            <span style={{
              fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)',
              color: rarityColor,
              background: `color-mix(in srgb, ${rarityColor} 15%, transparent)`,
              border: `1px solid color-mix(in srgb, ${rarityColor} 30%, transparent)`,
              borderRadius: 'var(--radius-full)', padding: '2px 10px',
              textTransform: 'capitalize',
            }}>
              {technology.rarity}
            </span>
          </div>

          {/* Titre + description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h3 style={{
              fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-semibold)',
              fontSize: 'var(--text-lg)', color: 'var(--fg-1)',
              margin: 0, letterSpacing: 'var(--tracking-tight)',
            }}>
              {technology.name}
            </h3>
            {technology.description && (
              <p style={{
                fontSize: 'var(--text-sm)', color: 'var(--fg-3)',
                lineHeight: 'var(--leading-relaxed)', margin: 0,
              }}>
                {technology.description}
              </p>
            )}
          </div>

          {/* Effets */}
          {nonZeroEffects.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {nonZeroEffects.map(([key, value]) => (
                <span key={key} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontSize: 'var(--text-2xs)', fontWeight: 'var(--weight-medium)',
                  color: 'var(--fg-2)', background: 'var(--surface-2)',
                  border: '1px solid var(--surface-3)',
                  borderRadius: 'var(--radius-sm)', padding: '2px 8px',
                }}>
                  <span style={{ color: (value as number) > 0 ? 'var(--success)' : 'var(--danger)' }}>
                    {(value as number) > 0 ? '+' : ''}{value}
                  </span>
                  {effectIcons[key]}
                </span>
              ))}
            </div>
          )}

          {/* Memory word */}
          {technology.narrative.memoryWord && (
            <div style={{
              borderTop: '1px solid var(--surface-2)', paddingTop: 10,
              display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center',
            }}>
              <Sparkles size={12} style={{ color: 'var(--memory-400)' }} />
              <span style={{ fontSize: 'var(--text-xs)', fontStyle: 'italic', color: 'var(--memory-300)' }}>
                «&nbsp;{technology.narrative.memoryWord}&nbsp;»
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// === BARRE DE PROGRESSION ===

function GameProgress({ gameState }: { gameState: GameState }) {
  const { turn, totalTurns, epochIndex, totalEpochs, turnWithinEpoch, turnsPerEpoch, currentEpoch } = gameState;
  const globalProgress = ((turn - 1) / totalTurns) * 100;
  const epochLabel = PERIOD_LABELS[currentEpoch] ?? currentEpoch;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 'var(--text-sm)', color: 'var(--fg-3)',
      }}>
        <span>Tour {turn} / {totalTurns}</span>
        <span style={{
          display: 'inline-flex', alignItems: 'center',
          background: 'var(--glass-2)', border: '1px solid var(--border-memory)',
          borderRadius: 'var(--radius-full)', padding: '4px 14px',
          fontSize: 'var(--text-xs)', color: 'var(--memory-300)',
          fontWeight: 'var(--weight-medium)',
          backdropFilter: 'blur(var(--blur-sm))',
        }}>
          {epochLabel}
        </span>
        <span>Époque {epochIndex + 1} / {totalEpochs}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 8, borderRadius: 9999, background: 'var(--surface-2)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${globalProgress}%`,
          background: 'var(--grad-title)', borderRadius: 9999,
          transition: 'width 0.8s var(--ease-out)',
        }} />
      </div>

      {/* Dots d'époque */}
      {turnsPerEpoch > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          {Array.from({ length: turnsPerEpoch }).map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i < turnWithinEpoch ? 'var(--memory-500)' : 'var(--surface-2)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)',
          fontSize: 'var(--text-2xl)', color: 'var(--fg-1)',
          letterSpacing: 'var(--tracking-tight)', margin: 0,
        }}>
          {epochLabel}
        </p>
        {turnsPerEpoch > 1 && (
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-4)', marginTop: 4 }}>
            Tour {turnWithinEpoch} sur {turnsPerEpoch} dans cette époque
          </p>
        )}
      </div>
    </motion.div>
  );
}

// === ÉCRAN RÉSUMÉ D'ÉPOQUE ===

function EpochSummaryScreen({ majorEvent, epochSummary, epochLabel, epochIndex, totalEpochs, isLast, onContinue }: {
  majorEvent: string | null;
  epochSummary: string | null;
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
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'grid', placeItems: 'center', padding: 24,
        background: 'rgba(2,6,23,0.92)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        overflowY: 'auto',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 32 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        style={{ width: '100%', maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 22, textAlign: 'center' }}
      >
        {/* En-tête */}
        <div>
          <span style={{
            display: 'inline-flex',
            background: 'var(--glass-2)', border: '1px solid var(--border-memory)',
            borderRadius: 'var(--radius-full)', padding: '4px 14px',
            fontSize: 'var(--text-xs)', color: 'var(--fg-3)',
            backdropFilter: 'blur(var(--blur-sm))',
          }}>
            Époque {epochIndex + 1} / {totalEpochs}
          </span>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)',
            fontSize: 'var(--text-4xl)', color: 'var(--fg-1)',
            marginTop: 10, letterSpacing: 'var(--tracking-tight)',
          }}>
            {epochLabel}
          </h2>
        </div>

        {/* Le registre de l'Univers — synthèse des 3 choix */}
        {epochSummary && (
          <div style={{
            textAlign: 'left',
            background: 'var(--glass-1)',
            backdropFilter: 'blur(var(--blur-md))',
            WebkitBackdropFilter: 'blur(var(--blur-md))',
            border: '1px solid var(--border-memory)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
              color: 'var(--memory-400)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
            }}>
              <ScrollText size={15} /> Le registre de l&apos;Univers
            </div>
            {epochSummary.split('\n\n').map((para, i) => (
              <p key={i} style={{
                fontSize: i === 0 ? 'var(--text-sm)' : 'var(--text-base)',
                fontStyle: i === 0 ? 'italic' : 'normal',
                lineHeight: 'var(--leading-relaxed)',
                color: i === 0 ? 'var(--fg-3)' : 'var(--fg-2)',
                margin: i > 0 ? '12px 0 0' : 0,
              }}>
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Ce qui advint — événement dramatique du dernier choix */}
        {majorEvent && (
          <div style={{
            textAlign: 'left',
            background: 'var(--glass-2)',
            backdropFilter: 'blur(var(--blur-md))',
            WebkitBackdropFilter: 'blur(var(--blur-md))',
            border: '2px solid var(--border-memory)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-6)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
              color: 'var(--rarity-legendary)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)',
            }}>
              <Sparkles size={16} /> Ce qui advint
            </div>
            <p style={{ fontSize: 'var(--text-base)', lineHeight: 'var(--leading-relaxed)', color: 'var(--fg-2)', margin: 0 }}>
              {majorEvent}
            </p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <GradientButton onClick={onContinue}>
            {isLast ? 'Voir la Chronique finale' : 'Époque suivante'}
            <ChevronRight size={18} />
          </GradientButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

// === INTERFACE PRINCIPALE ===

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
  const [pendingEpochLabel, setPendingEpochLabel] = useState<string>('');
  const [pendingEpochIndex, setPendingEpochIndex] = useState<number>(0);

  const handlePick = async (techId: string) => {
    if (!gameState) return;
    // Capturer l'époque AVANT l'await : le store Zustand se met à jour dans
    // l'appel async, et React batchera les deux updates dans un seul re-render.
    // Sans cette capture, currentEpochLabel afficherait l'époque suivante.
    const epochLabelSnapshot = PERIOD_LABELS[gameState.currentEpoch] ?? gameState.currentEpoch;
    const epochIndexSnapshot = gameState.epochIndex;

    const result = await actions.pickTechnology(techId);
    if (!result.success || !result.data) return;

    const { majorEvent, epochSummary, epochComplete, isComplete } = result.data;
    if (epochComplete) {
      setPendingMajorEvent(majorEvent);
      setPendingEpochSummary(epochSummary);
      setPendingEpochLabel(epochLabelSnapshot);
      setPendingEpochIndex(epochIndexSnapshot);
      setPendingIsComplete(isComplete);
      setPhase('epoch-summary');
    }
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
    setPendingEpochLabel('');
    setPendingEpochIndex(0);
    actions.resetGame();
  };

  // === PAS DE PARTIE — Écran lanceur ===
  if (!gameState) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
            <Brandmark size={52} />
          </div>

          <div className="mh-glass" style={{ padding: 'var(--space-8)' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-bold)',
              fontSize: 'var(--text-2xl)', color: 'var(--fg-1)', margin: '0 0 8px',
              display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
            }}>
              <Play size={22} style={{ color: 'var(--memory-400)' }} /> Commencez Votre Voyage
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-3)', marginBottom: 24 }}>
              À chaque tournant de l&apos;histoire, vous choisissez ce que l&apos;humanité retient. Ce que vous ne choisissez pas disparaît.
            </p>
            <GradientButton onClick={() => actions.createGame()} disabled={isLoading} style={{ width: '100%' }}>
              {isLoading ? 'Chargement…' : <><Play size={18} /> Commencer le Voyage</>}
            </GradientButton>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-4)', marginTop: 16 }}>
              Durée : ~15–20 minutes
            </p>
          </div>
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
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '40px 24px 64px', display: 'flex', flexDirection: 'column', gap: 36 }}>

      {/* Brandmark */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Brandmark />
      </div>

      {/* Progression */}
      <GameProgress gameState={gameState} />

      {/* Prompt */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 'var(--weight-semibold)',
          fontSize: 'var(--text-2xl)', color: 'var(--fg-2)', margin: 0,
        }}>
          Que retient l&apos;humanité&nbsp;?
        </h2>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--fg-4)', marginTop: 6 }}>
          Votre choix façonne le destin de la mémoire collective.
        </p>
      </div>

      {/* Grille de cartes */}
      <motion.div
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}
        layout
      >
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
        <p style={{ textAlign: 'center', color: 'var(--fg-4)', padding: '48px 0' }}>
          Aucun choix disponible — la partie touche à sa fin.
        </p>
      )}

      {/* Restart discret */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleRestart}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--fg-4)', fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-sans)',
            transition: 'color var(--dur-fast)',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--fg-3)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--fg-4)')}
        >
          <RotateCcw size={12} /> Recommencer
        </button>
      </div>

      {/* Overlay résumé d'époque */}
      <AnimatePresence>
        {phase === 'epoch-summary' && (
          <EpochSummaryScreen
            key="epoch-summary"
            majorEvent={pendingMajorEvent}
            epochSummary={pendingEpochSummary}
            epochLabel={pendingEpochLabel}
            epochIndex={pendingEpochIndex}
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
      style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px', display: 'flex', flexDirection: 'column', gap: 26, textAlign: 'center' }}
    >
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Brandmark size={48} />
      </div>

      <div>
        <h1 className="mh-grad-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-5xl)', margin: 0 }}>
          Chronique Achevée
        </h1>
        <p style={{ fontSize: 'var(--text-lg)', color: 'var(--fg-3)', marginTop: 8 }}>
          {gameState.pickedPath.length} choix. {gameState.totalEpochs} époques. Une seule mémoire.
        </p>
      </div>

      {finalChronicle && (
        <div className="mh-glass" style={{ textAlign: 'left', padding: 'var(--space-8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <ScrollText size={20} style={{ color: 'var(--memory-400)' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xl)', color: 'var(--fg-1)' }}>
              Votre Chronique
            </span>
          </div>
          <p style={{ whiteSpace: 'pre-line', fontStyle: 'italic', lineHeight: 'var(--leading-relaxed)', color: 'var(--fg-2)', fontWeight: 300, margin: 0 }}>
            {finalChronicle}
          </p>
        </div>
      )}

      {gameState.playerProfile && (
        <div className="mh-glass" style={{ textAlign: 'left', padding: 'var(--space-8)' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'var(--text-xl)', color: 'var(--fg-1)', margin: '0 0 16px' }}>
            Profil de votre civilisation
          </p>
          {gameState.playerProfile.evolutionaryPath && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{
                background: 'var(--grad-memory)', borderRadius: 'var(--radius-full)',
                padding: '4px 14px', fontSize: 'var(--text-sm)', color: '#fff', fontWeight: 600,
              }}>
                {gameState.playerProfile.evolutionaryPath.name}
              </span>
              <span style={{ color: 'var(--fg-3)', fontSize: 'var(--text-sm)' }}>
                {gameState.playerProfile.evolutionaryPath.description}
              </span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {Object.entries(gameState.playerProfile.traits ?? {}).map(([trait, value]) => (
              <div key={trait} style={{
                textAlign: 'center',
                background: 'var(--surface-1)', border: '1px solid var(--surface-2)',
                borderRadius: 'var(--radius-md)', padding: '12px 6px',
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--text-2xl)', color: 'var(--memory-300)' }}>
                  {value as number}%
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--fg-4)', textTransform: 'capitalize' }}>
                  {trait}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <GradientButton onClick={onRestart}>
          <RotateCcw size={18} /> Nouvelle Mémoire
        </GradientButton>
      </div>
    </motion.div>
  );
}

export default GameInterface;
