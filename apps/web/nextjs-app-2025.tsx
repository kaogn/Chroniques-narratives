// app/layout.tsx
// Human Memories - Root Layout 2025

import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Toaster } from '@/components/ui/toaster';
import { GameProvider } from '@/providers/game-provider';
import './globals.css';

const geistSans = localFont({
  src: './fonts/GeistVF.woff2',
  variable: '--font-geist-sans',
  weight: '100 900',
});

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Human Memories - The Collective Memory Game',
  description: 'Experience history as humanity\'s collective memory. Choose which technologies to preserve across the ages.',
  keywords: ['game', 'history', 'technology', 'civilization', 'memory', 'interactive fiction'],
  authors: [{ name: 'Human Memories Team' }],
  creator: 'Human Memories',
  openGraph: {
    title: 'Human Memories',
    description: 'Experience history as humanity\'s collective memory',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'fr_FR',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
};

interface RootLayoutProps {
  readonly children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen`}
        suppressHydrationWarning
      >
        <GameProvider>
          <main className="relative">
            {children}
          </main>
          <Toaster />
        </GameProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

// app/page.tsx
// Human Memories - Home Page 2025

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { WelcomeHero } from '@/components/welcome/welcome-hero';
import { GameIntroduction } from '@/components/welcome/game-introduction';

export const metadata: Metadata = {
  title: 'Human Memories - Begin Your Journey',
  description: 'Step into humanity\'s collective memory and shape history through your choices.',
};

const GameLauncher = dynamic(
  () => import('@/components/game/game-launcher').then(mod => ({ default: mod.GameLauncher })),
  {
    loading: () => <LoadingSpinner className="mx-auto" />,
    ssr: false,
  }
);

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <WelcomeHero />
      
      <section className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          <GameIntroduction />
          
          <Suspense fallback={<LoadingSpinner className="mx-auto" />}>
            <GameLauncher />
          </Suspense>
        </div>
      </section>
      
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-slate-400">
            <p className="text-sm">
              © 2025 Human Memories. Experience history through the lens of collective memory.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// app/game/page.tsx
// Human Memories - Main Game Page

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { GameGuard } from '@/components/game/game-guard';

export const metadata: Metadata = {
  title: 'Playing Human Memories',
  description: 'Current game session - choose technologies to preserve across history.',
  robots: { index: false }, // Don't index game sessions
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
    ssr: false,
  }
);

export default function GamePage() {
  return (
    <GameGuard>
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
    </GameGuard>
  );
}

// app/chronicle/page.tsx
// Human Memories - Final Chronicle Page

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { GameGuard } from '@/components/game/game-guard';

export const metadata: Metadata = {
  title: 'Your Chronicle - Human Memories',
  description: 'Review your journey through humanity\'s collective memory and its consequences.',
  robots: { index: false },
};

const ChronicleViewer = dynamic(
  () => import('@/components/chronicle/chronicle-viewer').then(mod => ({ default: mod.ChronicleViewer })),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
        <span className="ml-4 text-slate-300">Weaving your chronicle...</span>
      </div>
    ),
    ssr: false,
  }
);

export default function ChroniclePage() {
  return (
    <GameGuard requireCompleted>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <LoadingSpinner size="lg" />
            <span className="ml-4 text-slate-300">Assembling the threads of history...</span>
          </div>
        }
      >
        <ChronicleViewer />
      </Suspense>
    </GameGuard>
  );
}

// app/api/technologies/route.ts
// Human Memories - Technologies API Route

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getTechnologies, getTechnologyById } from '@/lib/database/technologies';
import { handleApiError } from '@/lib/utils/api-utils';

const QuerySchema = z.object({
  period: z.string().optional(),
  category: z.string().optional(),
  id: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = QuerySchema.parse({
      period: searchParams.get('period'),
      category: searchParams.get('category'),
      id: searchParams.get('id'),
    });

    if (query.id) {
      const technology = await getTechnologyById(query.id);
      if (!technology) {
        return NextResponse.json({ error: 'Technology not found' }, { status: 404 });
      }
      return NextResponse.json({ data: technology });
    }

    const technologies = await getTechnologies(query);
    
    return NextResponse.json({ 
      data: technologies,
      meta: {
        count: technologies.length,
        filters: query,
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
}

// app/api/game/route.ts
// Human Memories - Game State API Route

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GameEngine } from '@/lib/game-engine/game-engine';
import { handleApiError } from '@/lib/utils/api-utils';
import { rateLimit } from '@/lib/utils/rate-limit';

const CreateGameSchema = z.object({
  playerName: z.string().min(1).max(100).optional(),
  difficulty: z.enum(['easy', 'normal', 'hard']).optional(),
});

const PreserveTechsSchema = z.object({
  gameId: z.string().uuid(),
  techIds: z.array(z.string()).min(1).max(3),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await rateLimit(request, { max: 10, windowMs: 60000 });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' }, 
        { status: 429 }
      );
    }

    const body = await request.json();
    const { action, ...data } = body;

    const gameEngine = await GameEngine.create();

    switch (action) {
      case 'create': {
        const validatedData = CreateGameSchema.parse(data);
        const result = await gameEngine.createGame(validatedData);
        
        if (!result.success) {
          return NextResponse.json({ error: result.error.message }, { status: 400 });
        }
        
        return NextResponse.json({ data: result.data });
      }

      case 'preserve': {
        const validatedData = PreserveTechsSchema.parse(data);
        const result = await gameEngine.preserveTechnologies(validatedData.techIds);
        
        if (!result.success) {
          return NextResponse.json({ error: result.error.message }, { status: 400 });
        }
        
        return NextResponse.json({ data: result.data });
      }

      case 'chronicle': {
        const { gameId } = z.object({ gameId: z.string().uuid() }).parse(data);
        const result = await gameEngine.generateFinalChronicle();
        
        if (!result.success) {
          return NextResponse.json({ error: result.error.message }, { status: 400 });
        }
        
        return NextResponse.json({ data: result.data });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    return handleApiError(error);
  }
}

// app/providers/game-provider.tsx
// Human Memories - Game Context Provider

'use client';

import { type PropsWithChildren, createContext, useContext } from 'react';
import { useGameStore } from '@/lib/store/game-store';
import type { GameState } from '@/lib/types/game';

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
  const {
    gameState,
    isLoading,
    error,
    createGame,
    preserveTechnologies,
    resetGame,
  } = useGameStore();

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

// app/components/welcome/welcome-hero.tsx
// Human Memories - Welcome Hero Section

'use client';

import { motion } from 'framer-motion';
import { Clock, Brain, Zap } from 'lucide-react';

export function WelcomeHero() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative overflow-hidden bg-gradient-to-b from-slate-800/50 to-transparent border-b border-slate-700"
    >
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-slate-800/60 backdrop-blur-sm border border-slate-700"
          >
            <Brain className="w-6 h-6 text-blue-400" />
            <span className="text-slate-300 font-medium">Collective Memory Simulation</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight"
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-slate-300 bg-clip-text text-transparent">
              Human
            </span>{' '}
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Memories
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed"
          >
            Experience history as humanity's collective memory. Choose which technologies 
            to preserve across the ages, and witness how your decisions shape civilization's path.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-8 pt-8"
          >
            {[
              { icon: Clock, text: '8 Historical Epochs' },
              { icon: Zap, text: 'Meaningful Choices' },
              { icon: Brain, text: 'Narrative Consequences' },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800/30 backdrop-blur-sm border border-slate-700/50"
              >
                <feature.icon className="w-5 h-5 text-blue-400" />
                <span className="text-slate-300">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

// app/components/welcome/game-introduction.tsx
// Human Memories - Game Introduction Component

'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText, TreePine, Lightbulb, Crown, Gear, Rocket } from 'lucide-react';

const periods = [
  { name: 'Prehistory', icon: TreePine, color: 'bg-emerald-500/20 text-emerald-400', years: '10,000 BCE' },
  { name: 'Ancient', icon: Crown, color: 'bg-amber-500/20 text-amber-400', years: '3000 BCE - 500 CE' },
  { name: 'Medieval', icon: ScrollText, color: 'bg-red-500/20 text-red-400', years: '500 - 1400' },
  { name: 'Renaissance', icon: Lightbulb, color: 'bg-purple-500/20 text-purple-400', years: '1400 - 1650' },
  { name: 'Industrial', icon: Gear, color: 'bg-orange-500/20 text-orange-400', years: '1650 - 1900' },
  { name: 'Contemporary', icon: Rocket, color: 'bg-blue-500/20 text-blue-400', years: '1900 - 2100' },
];

export function GameIntroduction() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className="space-y-8"
    >
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-slate-100">
            How to Play
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Choose Technologies',
                description: 'Each turn, select 2 technologies from 3 options to preserve in humanity\'s memory.',
              },
              {
                step: '2',
                title: 'Shape History',
                description: 'Your choices create dependencies and unlock new possibilities across the ages.',
              },
              {
                step: '3',
                title: 'Witness Consequences',
                description: 'Experience immediate feedback and see how your path influences the final chronicle.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                className="text-center space-y-3"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-bold text-white">
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-200">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl text-center text-slate-100">
            Journey Through Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {periods.map((period, index) => (
              <motion.div
                key={period.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.4 }}
                className="text-center space-y-2"
              >
                <div className={`w-16 h-16 mx-auto rounded-full ${period.color} flex items-center justify-center`}>
                  <period.icon className="w-8 h-8" />
                </div>
                <h4 className="font-medium text-slate-200 text-sm">{period.name}</h4>
                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                  {period.years}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// app/components/game/game-launcher.tsx
// Human Memories - Game Launcher Component

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
import { useGame } from '@/providers/game-provider';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function GameLauncher() {
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [showSettings, setShowSettings] = useState(false);
  
  const { createGame, isLoading } = useGame();
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
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-slate-100 flex items-center justify-center gap-3">
            <Play className="w-6 h-6 text-blue-400" />
            Begin Your Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playerName" className="text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4" />
              Player Name (Optional)
            </Label>
            <Input
              id="playerName"
              placeholder="Memory Keeper"
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
              {showSettings ? 'Hide Settings' : 'Show Settings'}
            </Button>

            {showSettings && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <Label htmlFor="difficulty" className="text-slate-300">
                  Difficulty Level
                </Label>
                <Select value={difficulty} onValueChange={(value: any) => setDifficulty(value)}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-slate-100">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="easy" className="text-slate-100">
                      Easy - More rare technologies
                    </SelectItem>
                    <SelectItem value="normal" className="text-slate-100">
                      Normal - Balanced experience
                    </SelectItem>
                    <SelectItem value="hard" className="text-slate-100">
                      Hard - Fewer rare technologies
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
                Creating Timeline...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start Journey
              </>
            )}
          </Button>

          <div className="text-center text-sm text-slate-400">
            <p>Your choices will echo through eternity.</p>
            <p className="text-xs mt-1">Game length: ~15-20 minutes</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}