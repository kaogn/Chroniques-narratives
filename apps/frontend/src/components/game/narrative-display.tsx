'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Scroll, Quote, Sparkles, BookOpen, Feather } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NarrativeDisplayProps {
  narratives: string[];
  isVisible: boolean;
  title?: string;
  className?: string;
  onComplete?: () => void;
}

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

function TypewriterText({ text, delay = 0, speed = 30, onComplete, className }: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, delay + (currentIndex * speed));

      return () => clearTimeout(timer);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, delay, speed, onComplete]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        className="inline-block w-0.5 h-5 bg-memory-400 ml-1"
      />
    </span>
  );
}

export function NarrativeDisplay({
  narratives,
  isVisible,
  title = "Chronicle Entry",
  className,
  onComplete
}: NarrativeDisplayProps) {
  const [currentNarrativeIndex, setCurrentNarrativeIndex] = useState(0);
  const [showNextNarrative, setShowNextNarrative] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setCurrentNarrativeIndex(0);
      setShowNextNarrative(false);
    }
  }, [isVisible, narratives]);

  const handleNarrativeComplete = () => {
    if (currentNarrativeIndex < narratives.length - 1) {
      setTimeout(() => {
        setCurrentNarrativeIndex(prev => prev + 1);
        setShowNextNarrative(true);
      }, 1000);
    } else if (onComplete) {
      setTimeout(onComplete, 2000);
    }
  };

  if (!isVisible || narratives.length === 0) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="narrative-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={cn("relative", className)}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 -m-8">
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-br from-memory-500/10 via-purple-500/10 to-pink-500/10 blur-3xl rounded-3xl"
          />
        </div>

        <Card className="relative bg-slate-900/90 backdrop-blur-xl border-2 border-memory-500/30 shadow-2xl shadow-memory-500/20">
          <CardContent className="p-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="p-3 bg-gradient-to-br from-memory-500 to-purple-600 rounded-full">
                <Scroll className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-display font-semibold text-white">{title}</h3>
                <p className="text-sm text-memory-300">Memory Fragment {currentNarrativeIndex + 1} of {narratives.length}</p>
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="ml-auto"
              >
                <Sparkles className="w-6 h-6 text-memory-400" />
              </motion.div>
            </motion.div>

            {/* Quote Decoration */}
            <div className="relative">
              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-memory-500/30" />

              {/* Narrative Text */}
              <motion.div
                key={currentNarrativeIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <div className="pl-6 pr-4">
                  <TypewriterText
                    text={narratives[currentNarrativeIndex]}
                    delay={500}
                    speed={40}
                    onComplete={handleNarrativeComplete}
                    className="text-lg leading-relaxed text-slate-200 font-light"
                  />
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 pt-4">
                  {narratives.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{
                        scale: 1,
                        backgroundColor: index <= currentNarrativeIndex ? 'rgb(99, 102, 241)' : 'rgb(71, 85, 105)'
                      }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      className="w-2 h-2 rounded-full"
                    />
                  ))}
                </div>
              </motion.div>

              <Quote className="absolute -bottom-2 -right-2 w-8 h-8 text-memory-500/30 rotate-180" />
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-4 right-4 opacity-20">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Feather className="w-8 h-8 text-memory-400" />
              </motion.div>
            </div>

            <div className="absolute bottom-4 left-4 opacity-20">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <BookOpen className="w-6 h-6 text-purple-400" />
              </motion.div>
            </div>
          </CardContent>
        </Card>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [-20, -60, -100],
                x: [0, Math.random() * 20 - 10, Math.random() * 40 - 20]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut"
              }}
              className="absolute top-1/2 left-1/2 w-2 h-2 bg-memory-400 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface EpochTransitionProps {
  currentEpoch: string;
  nextEpoch: string;
  isVisible: boolean;
  onComplete?: () => void;
  className?: string;
}

export function EpochTransition({
  currentEpoch,
  nextEpoch,
  isVisible,
  onComplete,
  className
}: EpochTransitionProps) {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(onComplete, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm", className)}
    >
      <div className="text-center space-y-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, duration: 1, type: "spring" }}
          className="mx-auto w-20 h-20 bg-gradient-to-br from-memory-500 to-purple-600 rounded-full flex items-center justify-center"
        >
          <Scroll className="w-10 h-10 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="space-y-4"
        >
          <p className="text-memory-300 text-lg">The memory shifts...</p>
          <motion.h2
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="text-4xl font-display font-bold text-white"
          >
            Entering {nextEpoch}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="text-slate-400"
          >
            Time flows forward in the collective consciousness...
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 2.5, duration: 1 }}
          className="h-1 bg-gradient-to-r from-memory-500 to-purple-500 rounded-full max-w-md mx-auto"
        />
      </div>
    </motion.div>
  );
}