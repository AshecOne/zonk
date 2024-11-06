import React, { useState } from 'react';
import { useGameStore } from '@/lib/store/game-store';

interface GameMenuProps {
  onStart: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({ onStart }) => {
  const [players, setPlayers] = useState(['', '', '', '', '']);
  const { initializeGame, dealCards } = useGameStore();

  const handleStartGame = () => {
    if (players.some(name => !name.trim())) {
      alert('Semua nama pemain harus diisi');
      return;
    }

    initializeGame(players);
    dealCards();
    onStart();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Permainan Kartu</h1>
        <div className="space-y-4">
          {players.map((name, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700">
                Pemain {index + 1}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  const newPlayers = [...players];
                  newPlayers[index] = e.target.value;
                  setPlayers(newPlayers);
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                placeholder={`Nama Pemain ${index + 1}`}
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleStartGame}
          className="mt-6 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
        >
          Mulai Permainan
        </button>
      </div>
    </div>
  );
};