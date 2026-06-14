'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Settings, User } from 'lucide-react';
import { useGameActions, useIsLoading } from '@/store/gameStore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function GameLauncher() {
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [showSettings, setShowSettings] = useState(false);

  const { createGame } = useGameActions();
  const isLoading = useIsLoading();
  const router = useRouter();

  const handleStartGame = async () => {
    await createGame({
      playerName: playerName.trim() || undefined,
      difficulty,
    });
    router.push('/game');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-md mx-auto"
    >
      <Card className="bg-slate-900/90 backdrop-blur-xl border-2 border-memory-500/20 shadow-2xl shadow-memory-500/10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white flex items-center justify-center gap-3">
            <Play className="w-6 h-6 text-blue-400" />
            Commencez Votre Voyage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playerName" className="text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4" />
              Nom du Joueur (Optionnel)
            </Label>
            <Input
              id="playerName"
              placeholder="Gardien de Mémoire"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="bg-slate-700/50 border-slate-600 text-slate-100 placeholder:text-slate-400"
              maxLength={100}
            />
          </div>

          <motion.div
            layout
            className="space-y-4"
          >
            <Button
              variant="ghost"
              onClick={() => setShowSettings(!showSettings)}
              className="w-full text-slate-300 hover:text-slate-100 justify-start"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showSettings ? 'Masquer Paramètres' : 'Afficher Paramètres'}
            </Button>

            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="difficulty" className="text-slate-300">
                  Niveau de Difficulté
                </Label>
                <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="easy" className="text-slate-100">
                      Facile - Plus de technologies rares
                    </SelectItem>
                    <SelectItem value="normal" className="text-slate-100">
                      Normal - Expérience équilibrée
                    </SelectItem>
                    <SelectItem value="hard" className="text-slate-100">
                      Difficile - Moins de technologies rares
                    </SelectItem>
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </motion.div>

          <Button
            onClick={handleStartGame}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold py-3 text-lg"
            size="lg"
          >
            {isLoading ? (
              <>
                <LoadingSpinner className="mr-2" />
                Création de la Chronologie...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Commencer le Voyage
              </>
            )}
          </Button>

          <div className="text-center text-sm text-slate-400">
            <p>Vos choix résonneront à travers l'éternité.</p>
            <p className="text-xs mt-1">Durée du jeu : ~15-20 minutes</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}