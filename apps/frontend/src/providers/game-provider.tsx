'use client';

import { type PropsWithChildren, createContext, useContext } from 'react';
import { useGameStore } from '@/store/gameStore';
import type { GameState } from '@/store/gameStore';

interface GameContextType {
  gameState: GameState | null;
  isLoading: boolean;
  error: string | null;
  createGame: (options?: { playerName?: string; difficulty?: 'easy' | 'normal' | 'hard' }) => Promise<void>;
  preserveTechnologies: (techIds: string[]) => Promise<void>;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: PropsWithChildren) {
  const gameState = useGameStore(state => state.gameState);
  const isLoading = useGameStore(state => state.isLoading);
  const error = useGameStore(state => state.error);
  const actions = useGameStore(state => state.actions);

  const createGame = async (options?: { playerName?: string; difficulty?: 'easy' | 'normal' | 'hard' }) => {
    await actions.createGame(options);
  };

  const preserveTechnologies = async (techIds: string[]) => {
    await actions.preserveTechnologies(techIds);
  };

  const resetGame = () => {
    actions.resetGame();
  };

  const value: GameContextType = {
    gameState,
    isLoading,
    error,
    createGame,
    preserveTechnologies,
    resetGame,
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}