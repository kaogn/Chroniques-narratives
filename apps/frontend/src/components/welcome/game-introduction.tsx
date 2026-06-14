'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText, TreePine, Lightbulb, Crown, Settings, Rocket, Sparkles, Brain, Clock } from 'lucide-react';

const periods = [
  { name: 'Préhistoire', icon: TreePine, color: 'from-amber-600 to-orange-700', years: '500 000 av. J.-C.' },
  { name: 'Antiquité', icon: Crown, color: 'from-yellow-500 to-amber-600', years: '3000 av. J.-C.' },
  { name: 'Classique', icon: ScrollText, color: 'from-orange-500 to-red-600', years: '500 av. J.-C.' },
  { name: 'Médiéval', icon: Settings, color: 'from-gray-500 to-slate-700', years: '500 ap. J.-C.' },
  { name: 'Renaissance', icon: Lightbulb, color: 'from-blue-500 to-indigo-600', years: '1400 ap. J.-C.' },
  { name: 'Industriel', icon: Settings, color: 'from-slate-600 to-gray-800', years: '1700 ap. J.-C.' },
  { name: 'Moderne', icon: Sparkles, color: 'from-teal-500 to-cyan-600', years: '1900 ap. J.-C.' },
  { name: 'Futur', icon: Rocket, color: 'from-purple-500 to-pink-600', years: '2000+ ap. J.-C.' },
];

export function GameIntroduction() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className="space-y-12"
    >
      {/* How to Play */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <Card className="bg-slate-900/80 backdrop-blur-xl border-2 border-memory-500/20 shadow-2xl shadow-memory-500/10">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.7, duration: 0.8, type: "spring" }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-memory-500 to-purple-600 rounded-full flex items-center justify-center"
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-display font-bold text-white">
              Comment Jouer
            </CardTitle>
            <p className="text-memory-300 mt-2">Maîtrisez l'art de la mémoire collective</p>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '1',
                  title: 'Choisir les Technologies',
                  description: 'À chaque tour, sélectionnez jusqu\'à 2 technologies parmi 3 options pour les préserver dans la mémoire collective de l\'humanité.',
                  icon: Clock,
                  color: 'from-blue-500 to-cyan-600'
                },
                {
                  step: '2',
                  title: 'Façonner l\'Histoire',
                  description: 'Vos choix créent des dépendances et débloquent de nouvelles possibilités à travers 8 époques historiques.',
                  icon: Sparkles,
                  color: 'from-purple-500 to-pink-600'
                },
                {
                  step: '3',
                  title: 'Observer les Conséquences',
                  description: 'Vivez des récits dynamiques et découvrez comment vos décisions influencent la chronique finale de la civilisation.',
                  icon: ScrollText,
                  color: 'from-amber-500 to-orange-600'
                },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.15, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative text-center space-y-4"
                >
                  <div className="relative">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl`}>
                      <span className="text-2xl font-bold text-white">{item.step}</span>
                    </div>
                    <div className={`absolute inset-0 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl`} />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <item.icon className="w-5 h-5 text-memory-400" />
                      <h3 className="font-semibold text-lg text-white">{item.title}</h3>
                    </div>
                    <p className="text-slate-300 leading-relaxed max-w-xs mx-auto">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Historical Epochs */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <Card className="bg-slate-900/80 backdrop-blur-xl border-2 border-purple-500/20 shadow-2xl shadow-purple-500/10">
          <CardHeader className="text-center pb-6">
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 1, duration: 0.8, type: "spring" }}
              className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center"
            >
              <Clock className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-3xl font-display font-bold text-white">
              Voyage à Travers le Temps
            </CardTitle>
            <p className="text-purple-300 mt-2">Huit époques de l'accomplissement humain</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
              {periods.map((period, index) => (
                <motion.div
                  key={period.name}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.1, y: -10 }}
                  className="group text-center space-y-3"
                >
                  <div className="relative">
                    <div className={`w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${period.color} flex items-center justify-center shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:shadow-current/30`}>
                      <period.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className={`absolute inset-0 w-16 h-16 mx-auto rounded-xl bg-gradient-to-br ${period.color} opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-xl`} />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-medium text-white text-sm group-hover:text-memory-300 transition-colors">
                      {period.name}
                    </h4>
                    <Badge
                      variant="outline"
                      className="text-xs border-slate-600 text-slate-400 bg-slate-800/50 group-hover:border-memory-400/50 group-hover:text-memory-300 transition-colors"
                    >
                      {period.years}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}