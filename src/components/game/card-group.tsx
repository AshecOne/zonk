import React from 'react';
import { Card as CardType, Play } from '@/lib/types/game';
import { PlayingCard } from './playing-card';

interface CardGroupProps {
  play: Play;
  onCardGroupHover?: (play: Play) => void;
  onCardGroupLeave?: () => void;
  showDropZones?: boolean;
}

export const CardGroup = ({
  play,
  onCardGroupHover,
  onCardGroupLeave,
  showDropZones,
}: CardGroupProps) => {
  return (
    <div 
      className="relative"
      onMouseEnter={() => onCardGroupHover?.(play)}
      onMouseLeave={() => onCardGroupLeave?.()}
    >
      <div className="absolute -top-3 left-2 bg-white px-2 text-sm">
        {play.type === 'dasar' ? 'Dasar' : 'Triple'}
      </div>
      <div className="flex relative">
        {showDropZones && play.type === 'dasar' && (
          <div className="absolute inset-y-0 -left-8 w-8 flex items-center justify-center">
            <div className="w-4 h-16 border-2 border-dashed border-blue-400 rounded bg-blue-50 bg-opacity-50" />
          </div>
        )}
        
        <div className="flex gap-2">
          {play.cards.map((card, index) => (
            <PlayingCard
              key={card.id}
              card={card}
              isPlayable={false}
              className={index > 0 ? '-ml-12' : ''}
            />
          ))}
        </div>

        {showDropZones && play.type === 'dasar' && (
          <div className="absolute inset-y-0 -right-8 w-8 flex items-center justify-center">
            <div className="w-4 h-16 border-2 border-dashed border-blue-400 rounded bg-blue-50 bg-opacity-50" />
          </div>
        )}
      </div>
    </div>
  );
};