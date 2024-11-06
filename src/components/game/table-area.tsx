import React, { useState } from 'react';
import { Play } from '@/lib/types/game';
import { CardGroup } from './card-group';
import { DroppableArea } from './droppable-area';
import { CardDragItem, DropResult } from '@/lib/types/drag';

interface TableAreaProps {
  plays: Play[];
  onPlaySelect?: (play: Play) => void;
}

export const TableArea: React.FC<{
    plays: Play[];
    onDrop: (item: CardDragItem, result: DropResult) => void;
  }> = ({ plays, onDrop }) => {
    return (
      <div className="p-4 bg-green-50 rounded-lg min-h-[200px]">
        <DroppableArea
          type="table"
          onDrop={onDrop}
          className="grid gap-8"
        >
          {plays.map((play) => (
            <div key={play.id} className="relative">
              {play.type === 'dasar' && (
                <DroppableArea
                  type="play"
                  playId={play.id}
                  position="before"
                  onDrop={onDrop}
                  className="absolute inset-y-0 -left-8 w-8 flex items-center justify-center"
                >
                  <div className="w-4 h-16 border-2 border-dashed border-blue-400 rounded bg-blue-50 bg-opacity-50" />
                </DroppableArea>
              )}
              
              <CardGroup play={play} />
  
              {play.type === 'dasar' && (
                <DroppableArea
                  type="play"
                  playId={play.id}
                  position="after"
                  onDrop={onDrop}
                  className="absolute inset-y-0 -right-8 w-8 flex items-center justify-center"
                >
                  <div className="w-4 h-16 border-2 border-dashed border-blue-400 rounded bg-blue-50 bg-opacity-50" />
                </DroppableArea>
              )}
            </div>
          ))}
        </DroppableArea>
      </div>
    );
  };