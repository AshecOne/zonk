import React, { useState, useEffect } from 'react';
import { Card as CardType, Play, Player } from '@/lib/types/game';
import { useGameStore } from '@/lib/store/game-store';
import { PlayerHand } from './player-hand';
import { TableArea } from './table-area';
import { cn } from '@/lib/utils';
import { CardDragItem, DropResult } from '@/lib/types/drag';
import { validateDasar, validateTriple, validateContinueDasar } from '@/lib/utils/card-validation';
import { DeadPlayerOverlay } from './dead-player-overlay';

interface GameBoardProps {
  onNewGame: (players: string[]) => void;
}

export const GameBoard: React.FC = () => {
  const [selectedCards, setSelectedCards] = useState<CardType[]>([]);
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(true);

  const {
    players,
    currentPlayerIndex,
    playsOnTable,
    playCards,
    nextTurn,
    gameStatus,
    winner,
    markPlayerDead
  } = useGameStore();

  const currentPlayer = players[currentPlayerIndex];
  const [timer, setTimer] = useState<number>(30);

  useEffect(() => {
    if (gameStatus === 'playing') {
      setTimer(30);
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            // Waktu habis, pemain otomatis mati
            markPlayerDead(currentPlayer.id);
            nextTurn();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentPlayerIndex, gameStatus]);

  const checkIfPlayerCanPlay = (player: Player): boolean => {
    // Cek untuk dasar
    if (!player.hasPlayedBase) {
      // Periksa semua kemungkinan kombinasi 3 kartu untuk dasar
      const cards = player.cards;
      for (let i = 0; i < cards.length - 2; i++) {
        for (let j = i + 1; j < cards.length - 1; j++) {
          for (let k = j + 1; k < cards.length; k++) {
            if (validateDasar([cards[i], cards[j], cards[k]])) {
              return true;
            }
          }
        }
      }
    }

    // Cek untuk triple
    const cards = player.cards;
    for (let i = 0; i < cards.length - 2; i++) {
      for (let j = i + 1; j < cards.length - 1; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          if (validateTriple([cards[i], cards[j], cards[k]])) {
            return true;
          }
        }
      }
    }

    // Cek untuk menyambung ke dasar yang ada
    if (playsOnTable.length > 0) {
      for (const play of playsOnTable) {
        if (play.type === 'dasar') {
          for (const card of player.cards) {
            if (validateContinueDasar(play.cards, [card], 'after') ||
                validateContinueDasar(play.cards, [card], 'before')) {
              return true;
            }
          }
        }
      }
    }

    return false;
  };

  // Cek apakah pemain bisa melakukan langkah
  useEffect(() => {
    if (gameStatus === 'playing' && currentPlayer) {
      const canPlayAnyCard = checkIfPlayerCanPlay(currentPlayer);
      if (!canPlayAnyCard) {
        markPlayerDead(currentPlayer.id);
        nextTurn();
      }
    }
  }, [currentPlayerIndex, gameStatus, currentPlayer, markPlayerDead, nextTurn]);

  const handleCardSelect = (card: CardType) => {
    if (gameStatus !== 'playing') return;
    
    setSelectedCards(prev => {
      const isSelected = prev.some(sc => sc.id === card.id);
      if (isSelected) {
        return prev.filter(sc => sc.id !== card.id);
      } else {
        return [...prev, card];
      }
    });
    setError(null);
  };

  const handlePlayCards = (type: 'dasar' | 'triple') => {
    if (selectedCards.length < 3) {
      setError('Pilih minimal 3 kartu');
      return;
    }

    const success = playCards(
      currentPlayer.id,
      selectedCards,
      type,
      selectedPlay?.id
    );

    if (success) {
      setSelectedCards([]);
      setSelectedPlay(null);
      setError(null);
      nextTurn();
    } else {
      setError(`Kombinasi kartu tidak valid untuk ${type}`);
    }
  };

  const handleDrop = (item: CardDragItem, result: DropResult) => {
    if (result.targetType === 'table') {
      // Drop ke meja (membuat play baru)
      if (item.cards.length >= 3) {
        handlePlayCards('dasar');
      }
    } else if (result.targetType === 'play' && result.targetId) {
      // Drop ke play yang sudah ada
      const success = playCards(
        currentPlayer.id,
        item.cards,
        'dasar',
        result.targetId
      );

      if (success) {
        setSelectedCards([]);
        nextTurn();
      } else {
        setError('Kartu tidak bisa disambung ke dasar ini');
      }
    }
  };

  const { resetGame } = useGameStore();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Game Status */}
      <div className="text-center mb-4">
      <h2 className="text-2xl font-bold">
          {gameStatus === 'playing' 
            ? `Giliran: ${currentPlayer.name} (${timer}s)`
            : `Permainan Selesai - Pemenang: ${winner?.name}`}
        </h2>
        {error && (
          <div className="mt-2 text-red-500 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Table Area */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Kartu di Meja</h3>
        <TableArea
          plays={playsOnTable}
          onDrop={handleDrop}
        />
      </div>

       {/* Players Area */}
       <div className="grid gap-4">
        {players.map((player) => (
          <div key={player.id} 
            className={cn(
              'p-4 rounded-lg relative', // tambahkan relative
              player.id === currentPlayer.id ? 'bg-blue-50' : 'bg-gray-50'
            )}
          >
            {!player.isAlive && <DeadPlayerOverlay playerName={player.name} />}
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              {player.name}
              {!player.isAlive && (
                <span className="text-red-500 text-sm">(Mati)</span>
              )}
              {player.id === currentPlayer.id && (
                <span className="text-blue-500 text-sm">(Giliran Sekarang)</span>
              )}
            </h3>
            <PlayerHand
              cards={player.cards}
              onCardSelect={player.id === currentPlayer.id ? handleCardSelect : undefined}
              selectedCards={player.id === currentPlayer.id ? selectedCards : []}
              isCurrentPlayer={player.id === currentPlayer.id}
              playerId={player.id}
              isHidden={player.id !== currentPlayer.id} // Sembunyikan kartu pemain lain
            />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      {gameStatus === 'playing' && (
        <div className="fixed bottom-4 right-4 flex gap-2">
          <button
            onClick={() => handlePlayCards('dasar')}
            disabled={selectedCards.length < 3}
            className={cn(
              'px-4 py-2 rounded-lg text-white transition-colors',
              selectedCards.length >= 3
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-300'
            )}
          >
            Main Dasar
          </button>
          <button
            onClick={() => handlePlayCards('triple')}
            disabled={selectedCards.length < 3}
            className={cn(
              'px-4 py-2 rounded-lg text-white transition-colors',
              selectedCards.length >= 3
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-300'
            )}
          >
            Main Triple
          </button>
          <button
    onClick={() => window.location.reload()} // cara simple untuk reset
    className="px-4 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600"
  >
    Reset Game
  </button>
        </div>
      )}
    </div>
  );
};