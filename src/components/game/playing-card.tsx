import React, { useRef } from 'react';
import { Card as CardType } from '@/lib/types/game';
import { cn } from '@/lib/utils';
import { useDrag, DragSourceMonitor } from 'react-dnd';
import { CardDragItem } from '@/lib/types/drag';

interface PlayingCardProps {
  card: CardType;
  isSelected?: boolean;
  isPlayable?: boolean;
  isDragging?: boolean;
  onSelect?: () => void;
  className?: string;
  showDropZone?: boolean;
}

export const PlayingCard = ({
  card,
  isSelected,
  isPlayable = true,
  isDragging,
  onSelect,
  className,
  showDropZone,
}: PlayingCardProps) => {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      case 'joker': return '🃏';
      default: return '';
    }
  };

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';

  return (
    <div
      onClick={isPlayable ? onSelect : undefined}
      className={cn(
        'relative w-16 h-24 rounded-lg border-2 bg-white transition-all duration-200',
        isPlayable ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1' : 'cursor-not-allowed opacity-75',
        isSelected && 'border-blue-500 -translate-y-4',
        !isSelected && 'border-gray-300',
        isDragging && 'opacity-50',
        !isPlayable && 'bg-gray-100',
        className
      )}
    >
      {showDropZone && (
        <div className="absolute inset-0 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50 bg-opacity-50" />
      )}
      
      <div className={cn(
        'absolute top-2 left-2 text-lg font-bold',
        isRed ? 'text-red-600' : 'text-black'
      )}>
        {card.rank === 'JOKER' ? '' : card.rank}
      </div>
      
      <div className={cn(
        'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl',
        isRed ? 'text-red-600' : 'text-black'
      )}>
        {getSuitSymbol(card.suit)}
      </div>

      <div className={cn(
        'absolute bottom-2 right-2 text-lg font-bold rotate-180',
        isRed ? 'text-red-600' : 'text-black'
      )}>
        {card.rank === 'JOKER' ? '' : card.rank}
      </div>
    </div>
  );
};

export const DraggableCard: React.FC<PlayingCardProps & {
    isDraggable?: boolean;
    dragCards?: CardType[]; // Ganti Card menjadi CardType
    sourceType: 'hand' | 'table';
    sourceId: string;
  }> = ({
    card,
    isDraggable = false,
    dragCards = [],
    sourceType,
    sourceId,
    ...props
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [{ isDragging }, drag] = useDrag<CardDragItem, unknown, { isDragging: boolean }>(() => ({
      type: 'card',
      item: {
        type: 'card',
        cards: dragCards.length ? dragCards : [card],
        sourceType,
        sourceId
      },
      canDrag: isDraggable,
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging()
      })
    }), [card, dragCards, isDraggable]);
  
    drag(ref);
  
    return (
      <div ref={ref}>
        <PlayingCard {...props} card={card} isDragging={isDragging} />
      </div>
    );
  };