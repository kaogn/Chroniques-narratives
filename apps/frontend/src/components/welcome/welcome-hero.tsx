'use client';

import { motion } from 'framer-motion';
import { Clock, Brain, Zap, Sparkles } from 'lucide-react';
import { MemoryParticles } from '@/components/ui/particles';

export function WelcomeHero() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2 }}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Animated Background */}
      <MemoryParticles />

      {/* Gradient Orbs */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-memory-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="text-center space-y-12">
          {/* Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.8, type: "spring" }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-memory-950/80 backdrop-blur-xl border border-memory-600/30 shadow-2xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Brain className="w-6 h-6 text-memory-400" />
            </motion.div>
            <span className="text-memory-200 font-medium tracking-wide">Simulation de Mémoire Collective</span>
            <Sparkles className="w-4 h-4 text-memory-300 animate-pulse" />
          </motion.div>

          {/* Main Title */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 1 }}
            className="space-y-6"
          >
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight">
              <motion.span
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                className="block bg-gradient-to-r from-white via-memory-100 to-slate-200 bg-clip-text text-transparent"
              >
                Mémoires
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="block bg-gradient-to-r from-memory-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                Humaines
              </motion.span>
            </h1>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-memory-gradient blur-xl opacity-50" />
              <p className="relative text-xl md:text-2xl lg:text-3xl text-slate-200 max-w-4xl mx-auto leading-relaxed font-light">
                <span className="font-medium text-white">Vivez l'histoire</span> à travers la mémoire collective de l'humanité.
                <br />
                Choisissez quelles <span className="text-memory-300 font-medium">technologies préserver</span> à travers les âges,
                et découvrez comment vos décisions <span className="text-purple-300 font-medium">façonnent le destin de la civilisation</span>.
              </p>
            </motion.div>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.8 }}
            className="flex flex-wrap justify-center gap-6 pt-8"
          >
            {[
              { icon: Clock, text: '8 Époques Historiques', color: 'from-amber-400 to-orange-500' },
              { icon: Zap, text: 'Choix Significatifs', color: 'from-memory-400 to-purple-500' },
              { icon: Brain, text: 'Conséquences Narratives', color: 'from-pink-400 to-rose-500' },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.6 + index * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
                     style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
                <div className={`relative flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-white/20 transition-all duration-300`}>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${feature.color}`}>
                    <feature.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-slate-200 font-medium tracking-wide">{feature.text}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-6 h-10 border-2 border-memory-400/50 rounded-full flex justify-center"
            >
              <motion.div
                animate={{ y: [0, 16, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-1 h-3 bg-memory-400 rounded-full mt-2"
              />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}