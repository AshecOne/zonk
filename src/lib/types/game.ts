export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'joker';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'JOKER';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
  deck: 1 | 2;
  value: number;
}

export interface Play {
  id: string;
  type: 'dasar' | 'triple';
  cards: Card[];
  playerId: string;
  sequence: number;
}

export interface Player {
  id: string;
  name: string;
  cards: Card[];
  isAlive: boolean;
  hasPlayedBase: boolean;
  turnOrder: number;
}

export interface GameState {
  players: Player[];
  deck: Card[];
  currentPlayerIndex: number;
  playsOnTable: Play[];
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner?: Player;
  remainingCards: number;
  currentTurn: number;
}
