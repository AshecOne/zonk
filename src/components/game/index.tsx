'use client';

import { useEffect, useState } from 'react';
import { GameBoard } from './game-board';
import { GameMenu } from './menu'; // Kita akan buat ini
import { useGameStore } from '@/lib/store/game-store';

export default function Game() {
  const [isClient, setIsClient] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const { gameStatus } = useGameStore();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <main className="min-h-screen bg-gray-100">
      {showMenu ? (
        <GameMenu onStart={() => setShowMenu(false)} />
      ) : (
        <GameBoard />
      )}
    </main>
  );
}