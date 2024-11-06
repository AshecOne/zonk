import { Card } from './game';

export interface CardDragItem {
  type: 'card';
  cards: Card[];
  sourceType: 'hand' | 'table';
  sourceId: string;
}

export interface DropResult {
  targetType: 'table' | 'play';
  targetId?: string;
  position?: 'before' | 'after';
}