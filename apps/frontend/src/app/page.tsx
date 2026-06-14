import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { WelcomeHero } from '@/components/welcome/welcome-hero';
import { GameIntroduction } from '@/components/welcome/game-introduction';

export const metadata: Metadata = {
  title: 'Mémoires Humaines - Commencez Votre Voyage',
  description: 'Plongez dans la mémoire collective de l\'humanité et façonnez l\'histoire par vos choix.',
};

const GameLauncher = dynamic(
  () => import('@/components/game/game-launcher').then(mod => ({ default: mod.GameLauncher })),
  {
    loading: () => <LoadingSpinner className="mx-auto" />,
  }
);

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <WelcomeHero />

      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-16">
            <GameIntroduction />

            <Suspense fallback={<LoadingSpinner className="mx-auto" />}>
              <GameLauncher />
            </Suspense>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-memory-500/20 bg-slate-950/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-memory-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">MH</span>
              </div>
              <span className="text-xl font-display font-semibold text-white">Mémoires Humaines</span>
            </div>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Vivez l'histoire à travers le prisme de la mémoire collective.
              Chaque choix résonne à travers le temps, façonnant le destin de la civilisation humaine.
            </p>
            <p className="text-xs text-slate-500">
              © 2025 Mémoires Humaines. Créé avec mémoire et imagination.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}