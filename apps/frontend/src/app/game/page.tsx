import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export const metadata: Metadata = {
  title: 'Playing Human Memories',
  description: 'Current game session - choose technologies to preserve across history.',
  robots: { index: false },
};

const GameInterface = dynamic(
  () => import('@/components/game/game-interface').then(mod => ({ default: mod.GameInterface })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-4 text-slate-300">Loading your memories...</span>
      </div>
    ),
  }
);

export default function GamePage() {
  return (
    <div className="min-h-screen">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
            <span className="ml-4 text-slate-300">Preparing your journey through time...</span>
          </div>
        }
      >
        <GameInterface />
      </Suspense>
    </div>
  );
}