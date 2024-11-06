import React, { useRef } from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { CardDragItem, DropResult } from '@/lib/types/drag';
import { cn } from '@/lib/utils';

interface DroppableAreaProps {
  onDrop: (item: CardDragItem, result: DropResult) => void;
  type: 'table' | 'play';
  playId?: string;
  position?: 'before' | 'after';
  children: React.ReactNode;
  className?: string;
}

export const DroppableArea: React.FC<DroppableAreaProps> = ({
  onDrop,
  type,
  playId,
  position,
  children,
  className
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop<CardDragItem, DropResult, { isOver: boolean }>(() => ({
    accept: 'card',
    drop: (item) => {
      onDrop(item, {
        targetType: type,
        targetId: playId,
        position
      });
      return undefined;
    },
    collect: (monitor: DropTargetMonitor) => ({
      isOver: monitor.isOver()
    })
  }), [type, playId, position]);

  drop(ref); // Gunakan drop sebagai function

  return (
    <div
      ref={ref}
      className={cn(
        className,
        isOver && 'ring-2 ring-blue-500 ring-opacity-50'
      )}
    >
      {children}
    </div>
  );
};