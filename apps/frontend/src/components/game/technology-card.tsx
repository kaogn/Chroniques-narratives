'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Sword, Book, Coins, Users, Compass, Wrench, Zap,
  Crown, Shield, Star, Clock, Brain, Sparkles,
  Check, Lock, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface Technology {
  id: string;
  name: string;
  description: string;
  category: 'military' | 'cultural' | 'economic' | 'social' | 'exploration' | 'industrial' | 'scientific';
  rarity: 'common' | 'rare' | 'pillar' | 'legendary';
  effects: Record<string, number>;
  dependencies?: string[];
  narrative?: {
    memoryWord?: string;
    immediate?: string[];
    epochTemplate?: string;
    finalTemplate?: string;
  };
}

interface TechnologyCardProps {
  technology: Technology;
  isSelected: boolean;
  isDisabled: boolean;
  canAfford: boolean;
  onSelect: (techId: string) => void;
  delay?: number;
  className?: string;
}

const categoryIcons = {
  military: Sword,
  cultural: Book,
  economic: Coins,
  social: Users,
  exploration: Compass,
  industrial: Wrench,
  scientific: Zap,
};

const categoryColors = {
  military: 'from-red-500 to-red-700',
  cultural: 'from-purple-500 to-purple-700',
  economic: 'from-yellow-500 to-yellow-700',
  social: 'from-blue-500 to-blue-700',
  exploration: 'from-green-500 to-green-700',
  industrial: 'from-gray-500 to-gray-700',
  scientific: 'from-cyan-500 to-cyan-700',
};

const rarityConfig = {
  common: {
    color: 'from-slate-500 to-slate-600',
    border: 'border-slate-500/30',
    glow: 'shadow-slate-500/20',
    icon: Star,
  },
  rare: {
    color: 'from-blue-500 to-blue-600',
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/30',
    icon: Crown,
  },
  pillar: {
    color: 'from-purple-500 to-purple-600',
    border: 'border-purple-500/40',
    glow: 'shadow-purple-500/40',
    icon: Shield,
  },
  legendary: {
    color: 'from-amber-400 to-amber-600',
    border: 'border-amber-500/50',
    glow: 'shadow-amber-500/50',
    icon: Sparkles,
  },
};

export function TechnologyCard({
  technology,
  isSelected,
  isDisabled,
  canAfford,
  onSelect,
  delay = 0,
  className
}: TechnologyCardProps) {
  const CategoryIcon = categoryIcons[technology.category];
  const RarityIcon = rarityConfig[technology.rarity].icon;
  const rarity = rarityConfig[technology.rarity];

  const handleSelect = () => {
    if (!isDisabled && canAfford) {
      onSelect(technology.id);
    }
  };

  const effectsArray = Object.entries(technology.effects).filter(([_, value]) => value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      whileHover={!isDisabled && canAfford ? { scale: 1.02, y: -5 } : {}}
      whileTap={!isDisabled && canAfford ? { scale: 0.98 } : {}}
      className={cn("group relative", className)}
    >
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={cn(
                "relative overflow-hidden cursor-pointer transition-all duration-300",
                "bg-slate-900/50 backdrop-blur-sm border-2",
                isSelected && "ring-2 ring-memory-500 ring-offset-2 ring-offset-slate-900",
                canAfford && !isDisabled && "hover:border-memory-400/50",
                !canAfford && "opacity-60 cursor-not-allowed",
                isDisabled && "opacity-40 cursor-not-allowed",
                rarity.border,
                canAfford && !isDisabled && !isSelected && `hover:${rarity.glow} hover:shadow-lg`,
                isSelected && `${rarity.glow} shadow-xl`
              )}
              onClick={handleSelect}
            >
              {/* Rarity Glow Effect */}
              <motion.div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300",
                  rarity.color,
                  canAfford && !isDisabled && "group-hover:opacity-10",
                  isSelected && "opacity-20"
                )}
                animate={{
                  opacity: isSelected ? [0.2, 0.3, 0.2] : 0,
                }}
                transition={{
                  duration: 2,
                  repeat: isSelected ? Infinity : 0,
                  ease: "easeInOut"
                }}
              />

              {/* Shimmer Effect */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    exit={{ x: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  />
                )}
              </AnimatePresence>

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-2 rounded-lg bg-gradient-to-br",
                      categoryColors[technology.category]
                    )}>
                      <CategoryIcon className="w-4 h-4 text-white" />
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border bg-gradient-to-r text-white font-medium",
                        rarity.color,
                        rarity.border
                      )}
                    >
                      <RarityIcon className="w-3 h-3 mr-1" />
                      {technology.rarity}
                    </Badge>
                  </div>

                  {/* Selection Status */}
                  <AnimatePresence mode="wait">
                    {isSelected ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 180 }}
                        className="w-6 h-6 bg-memory-500 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-white" />
                      </motion.div>
                    ) : !canAfford ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <Lock className="w-4 h-4 text-white" />
                      </motion.div>
                    ) : isDisabled ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center"
                      >
                        <AlertTriangle className="w-4 h-4 text-white" />
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>

                <CardTitle className="text-lg text-white group-hover:text-memory-100 transition-colors">
                  {technology.name}
                </CardTitle>

                <CardDescription className="text-slate-400 leading-relaxed">
                  {technology.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Effects */}
                {effectsArray.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Impact
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {effectsArray.map(([effect, value]) => (
                        <Badge
                          key={effect}
                          variant="secondary"
                          className="bg-slate-800/50 text-slate-300 border-slate-700"
                        >
                          +{value} {effect}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dependencies */}
                {technology.dependencies && technology.dependencies.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Requires
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {technology.dependencies.map((dep) => (
                        <Badge
                          key={dep}
                          variant="outline"
                          className="text-xs border-amber-500/30 text-amber-400"
                        >
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Memory Word */}
                {technology.narrative?.memoryWord && (
                  <div className="pt-2 border-t border-slate-700/50">
                    <p className="text-xs text-memory-300 italic text-center">
                      Memory: "{technology.narrative.memoryWord}"
                    </p>
                  </div>
                )}
              </CardContent>

              {/* Action Button */}
              <div className="absolute inset-x-4 bottom-4">
                <Button
                  variant={isSelected ? "secondary" : "default"}
                  size="sm"
                  className={cn(
                    "w-full transition-all duration-300",
                    isSelected && "bg-memory-600 hover:bg-memory-700 text-white",
                    !canAfford && "opacity-50 cursor-not-allowed",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={!canAfford || isDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect();
                  }}
                >
                  {isSelected ? "Selected" : "Preserve"}
                </Button>
              </div>
            </Card>
          </TooltipTrigger>

          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <h4 className="font-semibold">{technology.name}</h4>
              <p className="text-sm">{technology.description}</p>
              {technology.narrative?.immediate && (
                <p className="text-xs italic text-memory-300">
                  "{technology.narrative.immediate[0]}"
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </motion.div>
  );
}