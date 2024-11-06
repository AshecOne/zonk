import React from 'react';
import { Card as CardType } from '@/lib/types/game';
import { DraggableCard } from './playing-card';
import { cn } from '@/lib/utils';

interface PlayerHandProps {
    cards: CardType[];
    onCardSelect?: (card: CardType) => void;
    selectedCards: CardType[];
    isCurrentPlayer: boolean;
    playerId: string;
    isHidden?: boolean;
  }

export const PlayerHand = ({
    cards,
    onCardSelect,
    selectedCards,
    isCurrentPlayer,
    playerId,
    isHidden = false,
}: PlayerHandProps) => {
    if (isHidden) {
        // Tampilkan bagian belakang kartu saja
        return (
          <div className="flex flex-wrap gap-2 p-4">
            {Array(cards.length).fill(0).map((_, index) => (
              <div
                key={index}
                className="w-16 h-24 rounded-lg bg-blue-800 border-2 border-white"
              />
            ))}
          </div>
        );
      }
  return (
    <div className={cn(
      'flex flex-wrap gap-2 p-4 rounded-lg',
      isCurrentPlayer ? 'bg-blue-50' : 'bg-gray-50'
    )}>
      {cards.map((card) => (
        <DraggableCard
          key={card.id}
          card={card}
          isSelected={selectedCards.some(sc => sc.id === card.id)}
          onSelect={() => onCardSelect?.(card)}
          isPlayable={!!onCardSelect}
          isDraggable={isCurrentPlayer && selectedCards.length > 0}
          dragCards={selectedCards}
          sourceType="hand"
          sourceId={playerId}
          className="-ml-8 first:ml-0 hover:ml-0"
        />
      ))}
    </div>
  );
};