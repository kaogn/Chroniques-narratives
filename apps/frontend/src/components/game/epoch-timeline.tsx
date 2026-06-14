'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Scroll, Sword, Crown, Cog, Zap, Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EpochTimelineProps {
  currentEpoch: number;
  currentTurn: number;
  totalTurns: number;
  className?: string;
}

const epochs = [
  {
    id: 'prehistoric',
    name: 'Prehistory',
    shortName: 'Stone Age',
    period: '500,000 - 3,000 BCE',
    icon: Scroll,
    color: 'epoch-prehistoric',
    description: 'The dawn of humanity, tools, and fire'
  },
  {
    id: 'ancient',
    name: 'Ancient Civilizations',
    shortName: 'Antiquity',
    period: '3,000 - 500 BCE',
    icon: Crown,
    color: 'epoch-ancient',
    description: 'Rise of cities, writing, and empires'
  },
  {
    id: 'classical',
    name: 'Classical Period',
    shortName: 'Classical',
    period: '500 BCE - 500 CE',
    icon: Scroll,
    color: 'epoch-classical',
    description: 'Philosophy, democracy, and grand empires'
  },
  {
    id: 'medieval',
    name: 'Medieval Times',
    shortName: 'Middle Ages',
    period: '500 - 1000 CE',
    icon: Sword,
    color: 'epoch-medieval',
    description: 'Feudalism, faith, and new frontiers'
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    shortName: 'Rebirth',
    period: '1000 - 1500 CE',
    icon: Calendar,
    color: 'epoch-renaissance',
    description: 'Art, science, and human potential'
  },
  {
    id: 'industrial',
    name: 'Industrial Revolution',
    shortName: 'Industrial',
    period: '1500 - 1900 CE',
    icon: Cog,
    color: 'epoch-industrial',
    description: 'Steam, steel, and mass production'
  },
  {
    id: 'modern',
    name: 'Modern Era',
    shortName: 'Modern',
    period: '1900 - 2000 CE',
    icon: Zap,
    color: 'epoch-modern',
    description: 'Electricity, computers, and global connection'
  },
  {
    id: 'future',
    name: 'Future',
    shortName: 'Tomorrow',
    period: '2000+ CE',
    icon: Rocket,
    color: 'epoch-future',
    description: 'AI, space, and boundless possibilities'
  }
];

export function EpochTimeline({ currentEpoch, currentTurn, totalTurns, className }: EpochTimelineProps) {
  const progress = (currentTurn / totalTurns) * 100;

  return (
    <div className={cn("relative", className)}>
      {/* Main Timeline Container */}
      <div className="relative">
        {/* Progress Background */}
        <div className="absolute inset-0 h-2 bg-slate-800/50 rounded-full backdrop-blur-sm" />

        {/* Active Progress */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-0 left-0 h-2 bg-gradient-to-r from-memory-500 via-purple-500 to-pink-500 rounded-full shadow-lg"
        />

        {/* Epoch Markers */}
        <div className="relative flex justify-between items-center h-2">
          {epochs.map((epoch, index) => {
            const isActive = index === currentEpoch;
            const isCompleted = index < currentEpoch;
            const isCurrent = index === currentEpoch;

            return (
              <motion.div
                key={epoch.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative group"
              >
                {/* Epoch Marker */}
                <motion.div
                  animate={{
                    scale: isActive ? [1, 1.2, 1] : 1,
                    boxShadow: isActive
                      ? ['0 0 0 0 rgba(99, 102, 241, 0.7)', '0 0 0 10px rgba(99, 102, 241, 0)', '0 0 0 0 rgba(99, 102, 241, 0.7)']
                      : '0 0 0 0 rgba(99, 102, 241, 0)'
                  }}
                  transition={{
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className={cn(
                    "w-6 h-6 rounded-full border-2 transition-all duration-300 cursor-pointer",
                    "flex items-center justify-center",
                    isCompleted && "bg-memory-500 border-memory-400 shadow-lg shadow-memory-500/50",
                    isCurrent && "bg-purple-500 border-purple-400 shadow-lg shadow-purple-500/50 animate-pulse",
                    !isCompleted && !isCurrent && "bg-slate-700 border-slate-600 hover:border-slate-500"
                  )}
                >
                  <epoch.icon className={cn(
                    "w-3 h-3 transition-colors",
                    isCompleted && "text-white",
                    isCurrent && "text-white",
                    !isCompleted && !isCurrent && "text-slate-400"
                  )} />
                </motion.div>

                {/* Epoch Tooltip */}
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    whileHover={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 z-20"
                  >
                    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl p-4 shadow-2xl min-w-[200px]">
                      <div className="text-center space-y-2">
                        <h3 className={cn(
                          "font-semibold text-sm",
                          isActive && "text-memory-300",
                          isCompleted && "text-memory-400",
                          !isCompleted && !isCurrent && "text-slate-300"
                        )}>
                          {epoch.shortName}
                        </h3>
                        <p className="text-xs text-slate-400">{epoch.period}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">{epoch.description}</p>
                      </div>

                      {/* Tooltip Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2">
                        <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-700" />
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Current Epoch Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-8 text-center"
      >
        <motion.div
          key={currentEpoch}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <h2 className="text-2xl font-display font-semibold text-white">
            {epochs[currentEpoch]?.name || 'Unknown Epoch'}
          </h2>
          <p className="text-memory-300 font-medium">
            {epochs[currentEpoch]?.period || ''}
          </p>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {epochs[currentEpoch]?.description || ''}
          </p>
        </motion.div>

        {/* Turn Counter */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700"
        >
          <Clock className="w-4 h-4 text-memory-400" />
          <span className="text-sm text-slate-300">
            Turn <span className="text-white font-semibold">{currentTurn}</span> of {totalTurns}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}