'use client';

import dynamic from 'next/dynamic';

const Game = dynamic(() => import('@/components/game'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-2xl">Loading...</div>
    </div>
  ),
});

export default function Home() {
  return <Game />;
}